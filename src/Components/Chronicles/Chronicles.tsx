import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles, type ContentLink } from '../utils/index';
import { buildValidUrl } from '../utils/LinkWrapper';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';
import { useLightboxScrollLock } from '../utils/useLightboxScrollLock';

type ChroniclesMedia = {
  assetId: string;
  name?: string;
  type?: 'image' | 'video';
  objectFit?: 'cover' | 'contain';
};

/** Columns count the group column too; a single column is that column alone, each row showing its own text. */
export const CHRONICLES_MIN_COLUMNS = 1;
/** A new popup shows the group and its title. */
export const CHRONICLES_DEFAULT_COLUMNS = 2;
export const CHRONICLES_MAX_COLUMNS = 5;
/** The fields of the columns after the title, in order; `columns` decides how many of them a row shows. */
export const CHRONICLES_EXTRA_TITLE_KEYS = ['title2', 'title3', 'title4'] as const;
/** Every column but the last has a width of its own, like Programme's; the last takes what is left of the row. */
export const CHRONICLES_COLUMN_WIDTH_KEYS = ['column1Width', 'column2Width', 'column3Width', 'column4Width'] as const;

type ChroniclesColumnWidthKey = typeof CHRONICLES_COLUMN_WIDTH_KEYS[number];

/**
 * Where B's panel sits on the screen, as `left`/`top` of the screen and of the panel alike, so 0% is flush with
 * one edge and 100% with the other. Named like Mercury's title position; center comes first because the editor
 * puts the first value into a popup saved before there was a position, and those were centred.
 */
const PANEL_POSITION_OFFSETS = {
  center: { x: '50%', y: '50%' },
  'left-top': { x: '0%', y: '0%' },
  'top-center': { x: '50%', y: '0%' },
  'top-right': { x: '100%', y: '0%' },
  'left-center': { x: '0%', y: '50%' },
  'right-center': { x: '100%', y: '50%' },
  'left-bottom': { x: '0%', y: '100%' },
  'bottom-center': { x: '50%', y: '100%' },
  'right-bottom': { x: '100%', y: '100%' },
} as const;

export type ChroniclesPanelPosition = keyof typeof PANEL_POSITION_OFFSETS;

export const CHRONICLES_PANEL_POSITIONS = Object.keys(PANEL_POSITION_OFFSETS) as ChroniclesPanelPosition[];

/** Each column of a row has a text style of its own, the group column's being `column1`. */
export const CHRONICLES_COLUMN_STYLE_PREFIXES = ['column1', 'column2', 'column3', 'column4', 'column5'] as const;

type ChroniclesColumnStylePrefix = typeof CHRONICLES_COLUMN_STYLE_PREFIXES[number];

// Plain text; a row saved while titles were rich text still holds its nodes.
type ChroniclesTitle = string | any[];

export type ChroniclesContentItem = {
  group?: string;
  /** Plain text, so the entry's `link` is the only link a row has. */
  title?: ChroniclesTitle;
  title2?: ChroniclesTitle;
  title3?: ChroniclesTitle;
  title4?: ChroniclesTitle;
  image?: ChroniclesMedia | ChroniclesMedia[];
  /** The whole row links here. */
  link?: ContentLink;
};

type FontSettings = { fontWeight: number; fontStyle: string };

type Padding = { top: number; right: number; bottom: number; left: number };

/** A text style as settings hold it, each field under the name of what it styles, e.g. `triggerFontSize`. */
type TextStyleFields = {
  FontFamily?: string;
  FontSettings?: FontSettings;
  FontSize?: number;
  LineHeight?: number;
  LetterSpacing?: number;
  WordSpacing?: number;
  TextAlign?: TextStyles['textAlign'];
  TextAppearance?: TextStyles['textAppearance'];
};

type PrefixedTextStyle<Prefix extends string> = {
  [Key in keyof TextStyleFields as `${Prefix}${Key}`]?: TextStyleFields[Key];
};

type ChroniclesSettings = PrefixedTextStyle<'trigger'>
  & PrefixedTextStyle<ChroniclesColumnStylePrefix>
  // One style every column shared before each had its own; a column with no style of its own still shows it.
  & PrefixedTextStyle<'list'>
  & {
  /** `a` is always open, in place on the page; `b` opens from a label. */
  type?: 'a' | 'b';
  triggerLabel?: string;
  closeLabel?: string;
  /** Every column of a row, the group column included. */
  columns?: number;
  columnGap?: number;
  column1Width?: number;
  column2Width?: number;
  column3Width?: number;
  column4Width?: number;
  /** How long each of a hovered row's images shows before the next, in ms. */
  hoverInterval?: number;
  /** B only: A's panel stays where it is placed on the page. */
  panelPosition?: string;
  panelWidth?: number;
  panelPadding?: Padding;
  panelRadius?: number;
  groupGap?: number;
  triggerColor?: string;
  triggerHoverColor?: string;
  closeColor?: string;
  closeHoverColor?: string;
  panelColor?: string;
  textColor?: string;
  textHoverColor?: string;
  overlayColor?: string;
};

type ChroniclesProps = {
  settings: ChroniclesSettings;
  content?: ChroniclesContentItem[];
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  activeEvent?: string;
  portalId?: string;
} & CommonComponentProps;

export type ChroniclesRow = {
  item: ChroniclesContentItem;
  index: number;
};

export type ChroniclesGroup = {
  label: string;
  rows: ChroniclesRow[];
};

type ColorKeys =
  | 'triggerColor'
  | 'triggerHoverColor'
  | 'closeColor'
  | 'closeHoverColor'
  | 'panelColor'
  | 'textColor'
  | 'textHoverColor'
  | 'overlayColor';

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  triggerColor: 'trigger-color',
  triggerHoverColor: 'trigger-hover-color',
  closeColor: 'close-color',
  closeHoverColor: 'close-hover-color',
  panelColor: 'panel-color',
  textColor: 'text-color',
  textHoverColor: 'text-hover-color',
  overlayColor: 'overlay-color',
};

const STATE_KEYS = ['hover', 'open'] as const;

const OVERLAY_ANIM_MS = 300;
// The least a padding handle is drawn at, so a zero padding can still be grabbed.
const PADDING_HANDLE_SIZE = 0.004;
const COLUMN_RESIZE_HANDLE_WIDTH = 0.004;
// The least a column is dragged down to, in pixels of the layout.
const MIN_COLUMN_WIDTH_PX = 20;
const DEFAULT_COLUMN_GAP = 0.0139;
const DEFAULT_PANEL_WIDTH = 0.3194;
const DEFAULT_PANEL_PADDING: Padding = { top: 0.00972, right: 0.00972, bottom: 0.00972, left: 0.00972 };
const IMAGE_FADE_MS = 300;
const DEFAULT_HOVER_INTERVAL_MS = 1000;

const LIGHTBOX_CSS_VARS = [
  '--cntrl-article-width',
  '--cntrl-article-top',
  '--cntrl-article-left',
  '--cntrl-viewport-height',
] as const;

// A row with an empty group continues the group above it, so the label only has to be typed once.
type ColumnLayoutSettings = Pick<ChroniclesSettings, 'columns' | 'columnGap' | 'panelWidth' | 'panelPadding'>
  & Partial<Record<ChroniclesColumnWidthKey, number>>;

function getColumnCount(columns: number | undefined): number {
  return Math.min(Math.max(Math.round(columns ?? CHRONICLES_DEFAULT_COLUMNS), CHRONICLES_MIN_COLUMNS), CHRONICLES_MAX_COLUMNS);
}

/** The width a row's columns share: the panel's, less its padding and the gaps between them. */
function getColumnsSpace(settings: ColumnLayoutSettings): number {
  const { panelWidth = DEFAULT_PANEL_WIDTH, panelPadding = DEFAULT_PANEL_PADDING, columnGap = DEFAULT_COLUMN_GAP } = settings;
  const gaps = (getColumnCount(settings.columns) - 1) * columnGap;
  return Math.max(0, panelWidth - panelPadding.left - panelPadding.right - gaps);
}

export function getChroniclesEqualColumnWidths(settings: ColumnLayoutSettings): Partial<Record<ChroniclesColumnWidthKey, number>> {
  const count = getColumnCount(settings.columns);
  const width = getColumnsSpace(settings) / count;
  return Object.fromEntries(CHRONICLES_COLUMN_WIDTH_KEYS.slice(0, count - 1).map((key) => [key, width]));
}

/**
 * Every column's width, the last taking what the others leave. A column with no width of its own gets an equal share,
 * and widths that no longer fit, after the panel narrows or a column is added, shrink together until they do.
 */
export function resolveChroniclesColumnWidths(settings: ColumnLayoutSettings): number[] {
  const count = getColumnCount(settings.columns);
  const space = getColumnsSpace(settings);
  const sized = CHRONICLES_COLUMN_WIDTH_KEYS.slice(0, count - 1).map((key) => {
    const width = settings[key];
    return typeof width === 'number' ? Math.max(0, width) : space / count;
  });
  const sizedTotal = sized.reduce((sum, width) => sum + width, 0);
  const scale = sizedTotal > space ? space / sizedTotal : 1;
  const fitted = sized.map((width) => width * scale);
  return [...fitted, Math.max(0, space - sizedTotal * scale)];
}

/** Like Programme, a new column count starts the columns over at equal widths. */
export function applyChroniclesColumnCountChange(
  nextSettings: Record<string, any>,
  prevSettings: Record<string, any>,
): Record<string, any> {
  if (typeof nextSettings.columns !== 'number' || nextSettings.columns === prevSettings.columns) {
    return nextSettings;
  }
  return { ...nextSettings, ...getChroniclesEqualColumnWidths({ ...prevSettings, ...nextSettings }) };
}

// The columns stay in proportion when the panel is drawn narrower than its width, on a small screen.
function getGridTemplateColumns(widths: number[]): string {
  const total = widths.reduce((sum, width) => sum + width, 0);
  return widths.map((width) => `minmax(0, ${total > 0 ? (width / total) * 100 : 1}fr)`).join(' ');
}

export function groupArchiveRows(items: ChroniclesContentItem[]): ChroniclesGroup[] {
  const groups: ChroniclesGroup[] = [];
  items.forEach((item, index) => {
    const label = item.group?.trim() ?? '';
    const current = groups[groups.length - 1];
    if (!current || (label !== '' && label !== current.label)) {
      groups.push({ label, rows: [{ item, index }] });
      return;
    }
    current.rows.push({ item, index });
  });
  return groups;
}

export function getChroniclesRowMedia(item: ChroniclesContentItem | undefined): ChroniclesMedia[] {
  const { image } = item ?? {};
  return (Array.isArray(image) ? image : image ? [image] : []).filter((media) => Boolean(media?.assetId));
}

// A title saved as rich text shows its words alone, a line to each paragraph, its links and styling dropped.
function getTitleText(title: ChroniclesTitle | undefined): string {
  if (!Array.isArray(title)) return title ?? '';
  const getNodeText = (node: any): string => node.text ?? (node.children ?? []).map(getNodeText).join('');
  return title.map(getNodeText).join('\n');
}

function getMediaKey(rowIndex: number, mediaIndex: number, assetId: string): string {
  return `${rowIndex}-${mediaIndex}-${assetId}`;
}

function isVideoMedia(media: ChroniclesMedia): boolean {
  if (media.type === 'video') return true;
  if (media.type === 'image') return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(media.name ?? '') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(media.assetId);
}

function findLayoutContainer(element: HTMLElement | null): HTMLElement | null {
  let el = element;
  while (el) {
    if (getComputedStyle(el).getPropertyValue('--cntrl-article-width').trim()) {
      return el;
    }
    el = el.parentElement;
  }
  return element;
}

function getLightboxLayoutStyle(container: HTMLElement | null): CSSProperties {
  const style: Record<string, string> = {};
  const layoutContainer = findLayoutContainer(container);
  if (!layoutContainer) return style;
  const computed = getComputedStyle(layoutContainer);
  for (const varName of LIGHTBOX_CSS_VARS) {
    const value = computed.getPropertyValue(varName).trim();
    if (value) {
      style[varName] = value;
    }
  }
  return style;
}

function resolveTextStyle(settings: ChroniclesSettings, prefix: string, fallbackPrefix?: string): TextStyles {
  const values = settings as Record<string, unknown>;
  const read = <Key extends keyof TextStyleFields>(key: Key) => (
    values[`${prefix}${key}`] ?? (fallbackPrefix ? values[`${fallbackPrefix}${key}`] : undefined)
  ) as TextStyleFields[Key];
  const fontSettings = read('FontSettings');
  return {
    fontSettings: {
      fontFamily: read('FontFamily'),
      fontWeight: fontSettings?.fontWeight ?? 400,
      fontStyle: fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: read('FontSize') ?? 0.01,
    lineHeight: read('LineHeight'),
    letterSpacing: read('LetterSpacing') ?? 0,
    wordSpacing: read('WordSpacing') ?? 0,
    textAlign: read('TextAlign'),
    textAppearance: read('TextAppearance'),
    color: '#000000',
  };
}

function getCSS(P: string): string {
  return `
.${P}-trigger,
.${P}-close {
  display: inline-block;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 150ms ease;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.${P}-trigger {
  color: var(--${P}-trigger-color);
  transition: color 150ms ease, opacity ${OVERLAY_ANIM_MS}ms ease;
}
.${P}-trigger-hidden {
  opacity: 0;
}
.${P}-close {
  color: var(--${P}-close-color);
}
.${P}-trigger:focus,
.${P}-close:focus {
  outline: none;
}
.${P}-trigger:focus-visible,
.${P}-close:focus-visible {
  outline: 1px solid currentColor;
  outline-offset: 2px;
}
.${P}-interactive .${P}-trigger:hover,
.${P}-state-hover .${P}-trigger {
  color: var(--${P}-trigger-hover-color, var(--${P}-trigger-color));
}
.${P}-close:hover {
  color: var(--${P}-close-hover-color, var(--${P}-close-color));
}
.${P}-editor .${P}-trigger {
  cursor: default;
}
.${P}-overlay {
  position: fixed;
  inset: 0;
  z-index: 9997;
  overflow: hidden;
  overscroll-behavior: none;
  opacity: 0;
  pointer-events: none;
  transition: opacity ${OVERLAY_ANIM_MS}ms ease;
}
.${P}-inline-layer {
  position: fixed;
  inset: 0;
  z-index: 9997;
  overflow: hidden;
  pointer-events: none;
}
.${P}-overlay-editor {
  inset: auto;
  top: var(--cntrl-article-top, 0);
  left: var(--cntrl-article-left, 0);
  width: var(--cntrl-article-width, 100vw) !important;
  height: var(--cntrl-viewport-height, 100vh) !important;
}
.${P}-overlay-edit-mode {
  z-index: 1;
}
.${P}-overlay-active {
  opacity: 1;
  pointer-events: auto;
}
.${P}-backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--${P}-overlay-color);
}
.${P}-media-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.${P}-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
}
.${P}-media-contain {
  object-fit: contain;
}
/* The image replaced stays whole under the next until that is in, then goes at once, so neither the page nor an older
   image shows between them; only the image coming in and, as the list is left, those on screen fade. */
.${P}-media-visible,
.${P}-media-fading {
  transition: opacity ${IMAGE_FADE_MS}ms cubic-bezier(0, 0, 0.58, 1);
}
.${P}-media-visible {
  z-index: 1;
  opacity: 1;
}
.${P}-media-covered {
  opacity: 1;
}
.${P}-media-fading {
  opacity: 0;
}
.${P}-close {
  position: absolute;
  z-index: 2;
}
.${P}-panel {
  position: absolute;
  top: var(--${P}-panel-y);
  left: var(--${P}-panel-x);
  z-index: 1;
  box-sizing: border-box;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  transform: translate(calc(-1 * var(--${P}-panel-x)), calc(-1 * var(--${P}-panel-y) + 12px));
  background-color: var(--${P}-panel-color);
  color: var(--${P}-text-color);
  overscroll-behavior: contain;
  transition: transform ${OVERLAY_ANIM_MS}ms cubic-bezier(0, 0, 0.58, 1);
}
.${P}-overlay-active .${P}-panel {
  transform: translate(calc(-1 * var(--${P}-panel-x)), calc(-1 * var(--${P}-panel-y)));
}
.${P}-panel-settled {
  transition: none;
}
.${P}-panel-inline {
  position: relative;
  top: auto;
  left: auto;
  max-height: none;
  transform: none;
  transition: none;
}
.${P}-media-layer-instant .${P}-media {
  transition: none;
}
.${P}-panel-copy {
  position: absolute;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .${P}-panel {
    transition: none;
  }
}
.${P}-group ~ .${P}-group {
  margin-top: var(--${P}-group-gap);
}
.${P}-group {
  display: grid;
  grid-template-columns: var(--${P}-grid-columns);
  column-gap: var(--${P}-column-gap);
}
.${P}-row {
  grid-column: 2 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: baseline;
}
a.${P}-row {
  color: inherit;
  text-decoration: none;
}
.${P}-group-unlabeled .${P}-row {
  grid-column: 1 / -1;
}
.${P}-group-label {
  grid-column: 1;
  align-self: start;
  min-width: 0;
  overflow-wrap: anywhere;
}
.${P}-title {
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: pre-line;
  transition: color 150ms cubic-bezier(0, 0, 0.58, 1);
}
.${P}-control-anchor {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}
.${P}-interactive .${P}-row:hover .${P}-title,
.${P}-row:focus-visible .${P}-title,
.${P}-panel-copy .${P}-row-active .${P}-title,
.${P}-state-hover .${P}-row:first-of-type .${P}-title {
  color: var(--${P}-text-hover-color, var(--${P}-text-color));
}
`;
}

function ChroniclesMediaItem({
  P,
  media,
  isVisible,
  isLoaded,
  isCovered,
  isFading,
  onLoad,
}: {
  P: string;
  media: ChroniclesMedia;
  isVisible: boolean;
  isLoaded: boolean;
  isCovered: boolean;
  isFading: boolean;
  onLoad: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = isVideoMedia(media);
  const className = cn(
    `${P}-media`,
    media.objectFit === 'contain' && `${P}-media-contain`,
    isVisible && isLoaded && `${P}-media-visible`,
    isCovered && `${P}-media-covered`,
    isFading && `${P}-media-fading`,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video) return;
    if (isVisible) {
      video.play()?.catch(() => {});
    } else {
      video.pause();
    }
  }, [isVideo, isVisible]);

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        className={className}
        src={media.assetId}
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={onLoad}
      />
    );
  }

  return (
    <img
      className={className}
      src={media.assetId}
      alt=""
      decoding="async"
      onLoad={onLoad}
    />
  );
}

// A line in each gap, at the right edge of the column it sizes, as Programme's are.
function renderColumnWidthControls(
  P: string,
  widths: number[],
  paddingLeft: number,
  columnGap: number,
  scaled: (value: number) => string,
) {
  const lastWidth = widths[widths.length - 1];
  let columnLeft = paddingLeft;
  return widths.slice(0, -1).map((width, index) => {
    const gapCenter = columnLeft + width + columnGap / 2;
    columnLeft += width + columnGap;
    return (
      <div
        key={CHRONICLES_COLUMN_WIDTH_KEYS[index]}
        data-controls={CHRONICLES_COLUMN_WIDTH_KEYS[index]}
        data-controls-axis="x"
        data-controls-variant="column-width"
        data-controls-min={String(MIN_COLUMN_WIDTH_PX)}
        // a column grows into the last one, which the editor keeps from going under its own least
        data-controls-max-fraction={String(width + lastWidth)}
        className={`${P}-control-anchor`}
        style={{ top: 0, left: scaled(gapCenter - COLUMN_RESIZE_HANDLE_WIDTH / 2), width: scaled(COLUMN_RESIZE_HANDLE_WIDTH), height: '100%' }}
      />
    );
  });
}

function renderPanelPaddingControls(
  P: string,
  panelWidth: number,
  padding: Padding,
  scaled: (value: number) => string,
) {
  const handleSize = (value: number) => scaled(Math.max(value, PADDING_HANDLE_SIZE));
  return (
    <>
      <div
        data-controls="panelPadding.top"
        data-controls-axis="y"
        data-controls-variant="row-padding"
        data-controls-min="0"
        className={`${P}-control-anchor`}
        style={{ top: 0, left: 0, width: '100%', height: handleSize(padding.top) }}
      />
      <div
        data-controls="panelPadding.bottom"
        data-controls-axis="y"
        data-controls-variant="row-padding"
        data-controls-reverse=""
        data-controls-min="0"
        className={`${P}-control-anchor`}
        style={{ bottom: 0, left: 0, width: '100%', height: handleSize(padding.bottom) }}
      />
      <div
        data-controls="panelPadding.left"
        data-controls-axis="x"
        data-controls-variant="column-padding"
        data-controls-min="0"
        data-controls-max-fraction={String(Math.max(0, panelWidth - padding.right))}
        className={`${P}-control-anchor`}
        style={{ top: 0, left: 0, width: handleSize(padding.left), height: '100%' }}
      />
      <div
        data-controls="panelPadding.right"
        data-controls-axis="x"
        data-controls-variant="column-padding"
        data-controls-reverse=""
        data-controls-min="0"
        data-controls-max-fraction={String(Math.max(0, panelWidth - padding.left))}
        className={`${P}-control-anchor`}
        style={{ top: 0, right: 0, width: handleSize(padding.right), height: '100%' }}
      />
    </>
  );
}

export function Chronicles({
  settings,
  content,
  isEditor,
  isEditMode,
  isPreviewMode,
  activeEvent,
  portalId,
  currentState,
  unavailableStates,
}: ChroniclesProps) {
  const { prefix: P } = useScopedStyles();
  const {
    type = 'b',
    triggerLabel = 'Archive',
    closeLabel = 'Close',
    columns = CHRONICLES_DEFAULT_COLUMNS,
    columnGap = DEFAULT_COLUMN_GAP,
    hoverInterval = DEFAULT_HOVER_INTERVAL_MS,
    panelPosition,
    panelWidth = DEFAULT_PANEL_WIDTH,
    panelPadding = DEFAULT_PANEL_PADDING,
    panelRadius = 0,
    groupGap = 0.0139,
    triggerColor = '#000000',
    triggerHoverColor = '#666666',
    closeColor = '#000000',
    closeHoverColor = '#666666',
    panelColor = '#FFFFFF',
    textColor = '#333132',
    textHoverColor = '#BBBBBB',
    overlayColor = '#FFFFFFE6',
  } = settings;
  const items = content ?? [];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inlineLayerRef = useRef<HTMLDivElement>(null);
  const [isOpenUser, setIsOpen] = useState(false);
  const [isOverlayMounted, setIsOverlayMounted] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [isOverlaySettled, setIsOverlaySettled] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Which of the hovered row's images shows, counted afresh on every hover.
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mountedMedia, setMountedMedia] = useState<Set<number>>(() => new Set());
  // The image just replaced, kept whole under the next while it fades in, and the last one shown, to fade out on leave.
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(() => new Set());
  const [coveredMedia, setCoveredMedia] = useState<string | null>(null);
  const [lastShownMedia, setLastShownMedia] = useState<string | null>(null);
  const shownMediaRef = useRef<string | null>(null);
  const [closePosition, setClosePosition] = useState<{ top: number; left: number } | null>(null);
  const [layoutStyle, setLayoutStyle] = useState<CSSProperties>({});
  const [copyRect, setCopyRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isMediaCut, setIsMediaCut] = useState(false);

  const isEditorCanvas = Boolean(isEditor && !isPreviewMode);
  const isInteractive = !isEditor || Boolean(isPreviewMode);
  // A has no popup to open: its panel is always shown in place of the label.
  const isInline = type === 'a';
  const isOpenPinned = isEditorCanvas && currentState === 'open' && !unavailableStates?.includes('open');
  // Escape from preview lands in edit mode: a popup opened there stays open, with its controls.
  const isOpen = !isInline && (isOpenPinned || ((isInteractive || Boolean(isEditMode)) && isOpenUser));
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const panelOffset = PANEL_POSITION_OFFSETS[panelPosition as ChroniclesPanelPosition] ?? PANEL_POSITION_OFFSETS.center;
  const columnCount = getColumnCount(columns);
  const columnWidths = resolveChroniclesColumnWidths(settings);
  // the group takes the first column, the titles the rest
  const titleKeys = ['title', ...CHRONICLES_EXTRA_TITLE_KEYS].slice(0, columnCount - 1) as Array<'title' | typeof CHRONICLES_EXTRA_TITLE_KEYS[number]>;
  // With the first column alone there is nothing for a group to span, so every row shows its own first column, as one list.
  const hasGroupColumn = columnCount > 1;
  const groups = useMemo<ChroniclesGroup[]>(() => (
    hasGroupColumn
      ? groupArchiveRows(content ?? [])
      : [{ label: '', rows: (content ?? []).map((item, index) => ({ item, index })) }]
  ), [content, hasGroupColumn]);

  useLightboxScrollLock(isOpen && !isEditorCanvas);

  useEffect(() => {
    if (isEditorCanvas && !isEditMode) setIsOpen(false);
  }, [isEditorCanvas, isEditMode]);

  useEffect(() => {
    if (isOpen) {
      setLayoutStyle(getLightboxLayoutStyle(wrapperRef.current));
      setIsOverlayMounted(true);
      return;
    }
    setIsOverlayActive(false);
    setActiveIndex(null);
    const timer = window.setTimeout(() => setIsOverlayMounted(false), OVERLAY_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Activate only after the mounted overlay's hidden styles are applied, or the appear has nothing to transition from.
  useEffect(() => {
    if (!isOpen || !isOverlayMounted) return;
    overlayRef.current?.getBoundingClientRect();
    const frame = requestAnimationFrame(() => setIsOverlayActive(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isOverlayMounted]);

  // Canvas controls measure their anchors once, so they wait for the panel to finish sliding in.
  useEffect(() => {
    if (!isOverlayActive) {
      setIsOverlaySettled(false);
      return;
    }
    const timer = window.setTimeout(() => setIsOverlaySettled(true), OVERLAY_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOverlayActive]);

  // The close button sits exactly where the trigger is, so the label swaps in place.
  const updateClosePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const overlay = overlayRef.current;
    if (!trigger || !overlay) return;
    const triggerRect = trigger.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    setClosePosition({ top: triggerRect.top - overlayRect.top, left: triggerRect.left - overlayRect.left });
  }, []);

  useLayoutEffect(() => {
    if (!isOverlayMounted) return;
    updateClosePosition();
    window.addEventListener('resize', updateClosePosition);
    return () => window.removeEventListener('resize', updateClosePosition);
  }, [isOverlayMounted, updateClosePosition]);

  useEffect(() => {
    if (!isOpen || !isInteractive) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isInteractive]);

  // A's media fills the screen above the page, so a copy of the panel is laid exactly over the real one to stay readable.
  useLayoutEffect(() => {
    if (!isInline || activeIndex === null) return;
    const panelEl = panelRef.current;
    const layer = inlineLayerRef.current;
    if (!panelEl || !layer) return;
    const panelRect = panelEl.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    setCopyRect({ top: panelRect.top - layerRect.top, left: panelRect.left - layerRect.left, width: panelRect.width });
  }, [isInline, activeIndex]);

  // The copy stays over the list while the media fades out, so the list never shows through a fading image.
  useEffect(() => {
    if (activeIndex !== null) return;
    const timer = window.setTimeout(() => setCopyRect(null), IMAGE_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  // The copy is only true to the panel until the page moves, so scrolling cuts the media at once rather than locking it,
  // fading out included: a copy left over the list would stay put while the list scrolls away under it.
  const isCopyShown = copyRect !== null;
  useEffect(() => {
    if (!isInline || !isCopyShown) return;
    const cut = () => {
      setIsMediaCut(true);
      setActiveIndex(null);
      setCopyRect(null);
    };
    document.addEventListener('scroll', cut, { capture: true, passive: true });
    window.addEventListener('resize', cut);
    return () => {
      document.removeEventListener('scroll', cut, { capture: true });
      window.removeEventListener('resize', cut);
    };
  }, [isInline, isCopyShown]);

  const close = () => {
    if (!isInteractive) return;
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  // Every row's images are fetched once the list can be hovered, so a row's first hover shows its image at once
  // rather than after it loads; videos are left to load on hover.
  const isListShown = isInteractive && (isInline || isOpen);
  useEffect(() => {
    if (!isListShown) return;
    (content ?? []).forEach((item) => getChroniclesRowMedia(item).forEach((media) => {
      if (!isVideoMedia(media)) new Image().src = media.assetId;
    }));
  }, [isListShown, content]);

  // A hovered row with several images shows them in turn, round and round, for as long as it stays hovered.
  const activeRowMediaCount = activeIndex === null ? 0 : getChroniclesRowMedia(items[activeIndex]).length;
  useEffect(() => {
    if (activeRowMediaCount < 2) return;
    const timer = window.setInterval(() => {
      setActiveMediaIndex((current) => (current + 1) % activeRowMediaCount);
    }, Math.max(100, hoverInterval));
    return () => window.clearInterval(timer);
  }, [activeIndex, activeRowMediaCount, hoverInterval]);

  // Before paint, or the replaced image would drop out for a frame before it is kept.
  const shownAssetId = activeIndex === null ? undefined : getChroniclesRowMedia(items[activeIndex])[activeMediaIndex]?.assetId;
  const shownMedia = activeIndex !== null && shownAssetId !== undefined ? getMediaKey(activeIndex, activeMediaIndex, shownAssetId) : null;
  const isShownMediaLoaded = shownMedia !== null && loadedMedia.has(shownMedia);
  useLayoutEffect(() => {
    const previous = shownMediaRef.current;
    shownMediaRef.current = shownMedia;
    // Leaving keeps both, to fade out together: the one under the last is still on screen while the last fades in.
    if (shownMedia === null) return;
    setLastShownMedia(shownMedia);
    setCoveredMedia(previous);
  }, [shownMedia]);

  // The replaced image goes once the next has loaded and faded in over it, however long the load takes.
  useEffect(() => {
    if (!isShownMediaLoaded || coveredMedia === null) return;
    const timer = window.setTimeout(() => setCoveredMedia(null), IMAGE_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [isShownMediaLoaded, coveredMedia]);

  const showRowMedia = (index: number) => {
    if (!isInteractive || getChroniclesRowMedia(items[index]).length === 0) {
      setActiveIndex(null);
      return;
    }
    // A row's images all load on its first hover, so the next is ready by the time it shows.
    setMountedMedia((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
    if (isInline && activeIndex === null) setLayoutStyle(getLightboxLayoutStyle(wrapperRef.current));
    if (activeIndex !== index) setActiveMediaIndex(0);
    setIsMediaCut(false);
    setActiveIndex(index);
  };

  const hideRowMedia = (index: number) => {
    setActiveIndex((current) => (current === index ? null : current));
  };

  // Row links only navigate on a live page or in preview, not on the editor canvas.
  const onPanelClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!isInteractive && (event.target as HTMLElement).closest('a')) {
      event.preventDefault();
    }
  };

  const triggerTypographyCss = omitTextColors(textStylesToCss(resolveTextStyle(settings, 'trigger'), isEditor));
  const columnTypographyCss = CHRONICLES_COLUMN_STYLE_PREFIXES.slice(0, columnCount).map((prefix) => (
    omitTextColors(textStylesToCss(resolveTextStyle(settings, prefix, 'list'), isEditor))
  ));
  // Half the difference of the two line heights sets the label's first line on the first title's, exactly
  // while both columns share a font size.
  const labelLineHeight = columnTypographyCss[0].lineHeight;
  const titleLineHeight = columnTypographyCss[1]?.lineHeight;
  const groupLabelOffset = labelLineHeight !== undefined && titleLineHeight !== undefined
    ? `calc((${titleLineHeight} - ${labelLineHeight}) / 2)`
    : undefined;

  const colorVars = buildColorVars(P, {
    triggerColor,
    triggerHoverColor,
    closeColor,
    closeHoverColor,
    panelColor,
    textColor,
    textHoverColor,
    overlayColor,
  }, COLOR_VAR_MAP, STATE_KEYS);
  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const interactiveClass = isInteractive ? `${P}-interactive` : '';

  const mediaLayer = (
    <div className={cn(`${P}-media-layer`, isMediaCut && `${P}-media-layer-instant`)} aria-hidden="true">
      {[...mountedMedia].flatMap((index) => getChroniclesRowMedia(items[index]).map((media, mediaIndex) => {
        const mediaKey = getMediaKey(index, mediaIndex, media.assetId);
        return (
          <ChroniclesMediaItem
            key={mediaKey}
            P={P}
            media={media}
            isVisible={mediaKey === shownMedia}
            isLoaded={loadedMedia.has(mediaKey)}
            isCovered={mediaKey === coveredMedia}
            isFading={shownMedia === null && (mediaKey === lastShownMedia || mediaKey === coveredMedia)}
            onLoad={() => setLoadedMedia((prev) => (prev.has(mediaKey) ? prev : new Set(prev).add(mediaKey)))}
          />
        );
      }))}
    </div>
  );
  // Inline there is no slide-in to wait for, so the canvas controls can measure straight away.
  const showPanelControls = Boolean(isEditMode) && (isInline || isOverlaySettled);

  const renderPanel = (isCopy: boolean) => (
    <div
      ref={isCopy ? undefined : panelRef}
      className={cn(
        `${P}-panel`,
        // Only the open and close slide; once open, a new position or size moves the panel straight there.
        isOverlayActive && isOverlaySettled && `${P}-panel-settled`,
        isInline && `${P}-panel-inline`,
        isCopy && `${P}-panel-copy`,
      )}
      style={{
        width: scaled(panelWidth),
        paddingTop: scaled(panelPadding.top),
        paddingRight: scaled(panelPadding.right),
        paddingBottom: scaled(panelPadding.bottom),
        paddingLeft: scaled(panelPadding.left),
        borderRadius: scaled(panelRadius),
        [`--${P}-group-gap`]: scaled(groupGap),
        [`--${P}-panel-x`]: panelOffset.x,
        [`--${P}-panel-y`]: panelOffset.y,
        [`--${P}-grid-columns`]: getGridTemplateColumns(columnWidths),
        [`--${P}-column-gap`]: scaled(columnGap),
        ...(isCopy && copyRect ? { top: copyRect.top, left: copyRect.left, width: copyRect.width } : {}),
      } as CSSProperties}
      data-lightbox-scrollable={isInline ? undefined : ''}
      aria-hidden={isCopy || undefined}
      onMouseLeave={isCopy ? undefined : () => setActiveIndex(null)}
      onClickCapture={isCopy ? undefined : onPanelClickCapture}
    >
      {!isCopy && showPanelControls && renderPanelPaddingControls(P, panelWidth, panelPadding, scaled)}
      {!isCopy && showPanelControls && renderColumnWidthControls(P, columnWidths, panelPadding.left, columnGap, scaled)}
      {groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {!isCopy && showPanelControls && groupIndex > 0 && (
            // Left at its static top, the anchor sits right where the gap above this group starts.
            <div
              data-controls="groupGap"
              data-controls-paired=""
              data-controls-axis="y"
              data-controls-reverse=""
              data-controls-min="0"
              className={`${P}-control-anchor`}
              style={{ left: 0, width: '100%', height: scaled(Math.max(groupGap, PADDING_HANDLE_SIZE)) }}
            />
          )}
          {/* The label spans its group's rows, so its line height spaces only its own lines, never the rows beside it;
              a label longer than its rows grows the last track, below them. */}
          <div
            className={cn(`${P}-group`, !hasGroupColumn && `${P}-group-unlabeled`)}
            style={{ gridTemplateRows: `repeat(${group.rows.length}, auto) 1fr` }}
          >
            {hasGroupColumn && (
              <span
                className={`${P}-group-label`}
                style={{ ...columnTypographyCss[0], gridRow: `1 / span ${group.rows.length + 1}`, marginTop: groupLabelOffset }}
              >
                {group.label}
              </span>
            )}
            {group.rows.map(({ item, index }) => {
              const rowLink = !isCopy && item.link?.value ? item.link : undefined;
              const RowElement = rowLink ? 'a' : 'div';
              return (
                <RowElement
                  key={index}
                  className={cn(`${P}-row`, isCopy && index === activeIndex && `${P}-row-active`)}
                  {...(rowLink ? {
                    href: buildValidUrl(rowLink.value),
                    ...(rowLink.target === 'blank' && { target: '_blank', rel: 'noreferrer' }),
                  } : {})}
                  {...(isCopy ? {} : {
                    onMouseEnter: () => showRowMedia(index),
                    onMouseLeave: () => hideRowMedia(index),
                    onFocus: () => showRowMedia(index),
                    onBlur: () => hideRowMedia(index),
                  })}
                >
                  {!hasGroupColumn && (
                    <div className={`${P}-title`} style={columnTypographyCss[0]}>{item.group}</div>
                  )}
                  {titleKeys.map((key, titleIndex) => (
                    <div key={key} className={`${P}-title`} style={columnTypographyCss[titleIndex + 1]}>{getTitleText(item[key])}</div>
                  ))}
                </RowElement>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );

  const overlay = isOverlayMounted ? (
    <div
      ref={overlayRef}
      className={cn(
        `${P}-overlay`,
        isEditor && `${P}-overlay-editor`,
        isEditMode && `${P}-overlay-edit-mode`,
        isOverlayActive && `${P}-overlay-active`,
        interactiveClass,
        stateClass,
      )}
      style={{ ...colorVars, ...layoutStyle }}
      role="dialog"
      aria-modal="true"
      aria-label={triggerLabel}
      data-selection="none"
    >
      <div className={`${P}-backdrop`} aria-hidden="true" onClick={close} />
      {mediaLayer}
      <button
        ref={closeRef}
        type="button"
        className={`${P}-close`}
        style={{
          ...triggerTypographyCss,
          top: closePosition?.top ?? 0,
          left: closePosition?.left ?? 0,
          visibility: closePosition ? 'visible' : 'hidden',
        }}
        onClick={close}
      >
        {closeLabel}
      </button>
      {renderPanel(false)}
    </div>
  ) : null;

  const inlineLayer = isInline && mountedMedia.size > 0 ? (
    <div
      ref={inlineLayerRef}
      className={cn(`${P}-inline-layer`, isEditor && `${P}-overlay-editor`, interactiveClass, stateClass)}
      style={{ ...colorVars, ...layoutStyle }}
      aria-hidden="true"
      data-selection="none"
    >
      {mediaLayer}
      {copyRect && renderPanel(true)}
    </div>
  ) : null;
  const portalContent = overlay ?? inlineLayer;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        ref={wrapperRef}
        className={cn(isEditorCanvas && `${P}-editor`, interactiveClass, stateClass)}
        style={colorVars}
      >
        {isInline ? renderPanel(false) : (
          // The overlay lets the page show through, so the label fades out with it rather than sit under the close.
          // Only faded, it keeps the component's size and can still take focus back on close.
          <button
            ref={triggerRef}
            type="button"
            className={cn(`${P}-trigger`, isOverlayActive && `${P}-trigger-hidden`)}
            style={triggerTypographyCss}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={() => {
              if (isInteractive) setIsOpen(true);
            }}
          >
            {triggerLabel}
          </button>
        )}
      </div>
      {portalContent && typeof document !== 'undefined' && createPortal(
        portalContent,
        (portalId ? document.getElementById(portalId) : null) ?? document.body,
      )}
    </>
  );
}
