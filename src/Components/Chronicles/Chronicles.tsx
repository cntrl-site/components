import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { buildColorVars, buildValidUrl, scalingValue, useScopedStyles, type ContentLink } from '../utils/index';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';
import { useLightboxScrollLock } from '../utils/useLightboxScrollLock';

export const CHRONICLES_EXTRA_TITLE_KEYS = ['title2', 'title3', 'title4'] as const;
export const CHRONICLES_COLUMN_WIDTH_KEYS = ['column1Width', 'column2Width', 'column3Width', 'column4Width'] as const;
export const CHRONICLES_COLUMN_STYLE_PREFIXES = ['column1', 'column2', 'column3', 'column4', 'column5'] as const;

const TITLE_KEYS = ['title', ...CHRONICLES_EXTRA_TITLE_KEYS] as const;

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

type ChroniclesPanelPosition = keyof typeof PANEL_POSITION_OFFSETS;

export const CHRONICLES_PANEL_POSITIONS = Object.keys(PANEL_POSITION_OFFSETS) as ChroniclesPanelPosition[];

const OVERLAY_ANIM_MS = 300;
const IMAGE_FADE_MS = 300;
const MIN_HANDLE_SIZE = 0.004;
const MIN_COLUMN_WIDTH_PX = 20;
const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg|mov)(\?|$)/i;

const LIGHTBOX_CSS_VARS = [
  '--cntrl-article-width',
  '--cntrl-article-top',
  '--cntrl-article-left',
  '--cntrl-viewport-height',
] as const;

const COLOR_VAR_MAP = {
  triggerColor: 'trigger-color',
  triggerHoverColor: 'trigger-hover-color',
  closeColor: 'close-color',
  closeHoverColor: 'close-hover-color',
  panelColor: 'panel-color',
  textColor: 'text-color',
  textHoverColor: 'text-hover-color',
  overlayColor: 'overlay-color',
} as const;

const PADDING_CONTROLS = [
  { side: 'top', axis: 'y', variant: 'row-padding' },
  { side: 'bottom', axis: 'y', variant: 'row-padding', reverse: true },
  { side: 'left', axis: 'x', variant: 'column-padding', opposite: 'right' },
  { side: 'right', axis: 'x', variant: 'column-padding', opposite: 'left', reverse: true },
] as const;

type Padding = { top: number; right: number; bottom: number; left: number };

type ColumnWidthKey = typeof CHRONICLES_COLUMN_WIDTH_KEYS[number];

type TextStylePrefix = 'trigger' | typeof CHRONICLES_COLUMN_STYLE_PREFIXES[number];

type ChroniclesMedia = {
  assetId: string;
  name?: string;
  type?: 'image' | 'video';
  objectFit?: 'cover' | 'contain';
};

type ChroniclesItem = {
  group?: string;
  title?: string;
  title2?: string;
  title3?: string;
  title4?: string;
  image?: ChroniclesMedia[];
  link?: ContentLink;
};

type ChroniclesGroup = {
  label: string;
  rows: { item: ChroniclesItem; index: number }[];
};

type TextStyleFields = {
  FontFamily: string;
  FontSettings: { fontWeight: number; fontStyle: string };
  FontSize: number;
  LineHeight: number;
  LetterSpacing: number;
  WordSpacing: number;
  TextAlign?: TextStyles['textAlign'];
  TextAppearance: TextStyles['textAppearance'];
};

type PrefixedTextStyle<Prefix extends string> = {
  [Key in keyof TextStyleFields as `${Prefix}${Key}`]: TextStyleFields[Key];
};

type ColumnLayoutSettings = Partial<Record<ColumnWidthKey, number>> & {
  columns: number;
  columnGap: number;
  panelWidth: number;
  panelPadding: Padding;
};

type ChroniclesSettings = PrefixedTextStyle<TextStylePrefix> & ColumnLayoutSettings & {
  type: 'a' | 'b';
  triggerLabel: string;
  closeLabel: string;
  hoverInterval: number;
  panelPosition: ChroniclesPanelPosition;
  panelRadius: number;
  groupGap: number;
  triggerColor: string;
  triggerHoverColor: string;
  closeColor: string;
  closeHoverColor: string;
  panelColor: string;
  textColor: string;
  textHoverColor: string;
  overlayColor: string;
};

type ChroniclesProps = {
  settings: ChroniclesSettings;
  content?: ChroniclesItem[];
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  activeEvent?: string;
  portalId?: string;
} & CommonComponentProps;

function getColumnsSpace({ columns, columnGap, panelWidth, panelPadding }: ColumnLayoutSettings): number {
  return Math.max(0, panelWidth - panelPadding.left - panelPadding.right - (columns - 1) * columnGap);
}

export function getChroniclesEqualColumnWidths(settings: ColumnLayoutSettings): Partial<Record<ColumnWidthKey, number>> {
  const width = getColumnsSpace(settings) / settings.columns;
  return Object.fromEntries(CHRONICLES_COLUMN_WIDTH_KEYS.slice(0, settings.columns - 1).map((key) => [key, width]));
}

export function applyChroniclesColumnCountChange(
  nextSettings: Record<string, any>,
  prevSettings: Record<string, any>,
): Record<string, any> {
  if (typeof nextSettings.columns !== 'number' || nextSettings.columns === prevSettings.columns) {
    return nextSettings;
  }
  return { ...nextSettings, ...getChroniclesEqualColumnWidths({ ...prevSettings, ...nextSettings } as ColumnLayoutSettings) };
}

function resolveColumnWidths(settings: ColumnLayoutSettings): number[] {
  const space = getColumnsSpace(settings);
  const sized = CHRONICLES_COLUMN_WIDTH_KEYS.slice(0, settings.columns - 1).map((key) => {
    const width = settings[key];
    return typeof width === 'number' ? Math.max(0, width) : space / settings.columns;
  });
  const sizedTotal = sized.reduce((sum, width) => sum + width, 0);
  const scale = sizedTotal > space ? space / sizedTotal : 1;
  return [...sized.map((width) => width * scale), Math.max(0, space - sizedTotal * scale)];
}

function getGridTemplateColumns(widths: number[]): string {
  const total = widths.reduce((sum, width) => sum + width, 0);
  return widths.map((width) => `minmax(0, ${total > 0 ? (width / total) * 100 : 1}fr)`).join(' ');
}

// A row with an empty group continues the group above it.
function groupRows(items: ChroniclesItem[]): ChroniclesGroup[] {
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

function getRowMedia(item: ChroniclesItem | undefined): ChroniclesMedia[] {
  return (item?.image ?? []).filter((media) => Boolean(media?.assetId));
}

function getMediaKey(rowIndex: number, mediaIndex: number, assetId: string): string {
  return `${rowIndex}-${mediaIndex}-${assetId}`;
}

function isVideoMedia({ type, name, assetId }: ChroniclesMedia): boolean {
  if (type) return type === 'video';
  return VIDEO_EXTENSION_RE.test(name ?? '') || VIDEO_EXTENSION_RE.test(assetId);
}

function findLayoutContainer(element: HTMLElement | null): HTMLElement | null {
  for (let el = element; el; el = el.parentElement) {
    if (getComputedStyle(el).getPropertyValue('--cntrl-article-width').trim()) return el;
  }
  return element;
}

function getLayoutStyle(container: HTMLElement | null): CSSProperties {
  const layoutContainer = findLayoutContainer(container);
  if (!layoutContainer) return {};
  const computed = getComputedStyle(layoutContainer);
  return Object.fromEntries(
    LIGHTBOX_CSS_VARS
      .map((name) => [name, computed.getPropertyValue(name).trim()])
      .filter(([, value]) => value),
  );
}

function resolveTextStyle(settings: ChroniclesSettings, prefix: TextStylePrefix): TextStyles {
  const read = <Key extends keyof TextStyleFields>(key: Key) => (
    (settings as Record<string, unknown>)[`${prefix}${key}`] as TextStyleFields[Key]
  );
  return {
    fontSettings: { fontFamily: read('FontFamily'), ...read('FontSettings') },
    fontSize: read('FontSize'),
    lineHeight: read('LineHeight'),
    letterSpacing: read('LetterSpacing'),
    wordSpacing: read('WordSpacing'),
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
  position: absolute;
  z-index: 2;
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
.${P}-media-layer-instant .${P}-media {
  transition: none;
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
.${P}-panel-copy {
  position: absolute;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .${P}-panel {
    transition: none;
  }
}
.${P}-group {
  display: grid;
  grid-template-columns: var(--${P}-grid-columns);
  column-gap: var(--${P}-column-gap);
}
.${P}-group ~ .${P}-group {
  margin-top: var(--${P}-group-gap);
}
.${P}-group-label {
  grid-column: 1;
  align-self: start;
  min-width: 0;
  overflow-wrap: anywhere;
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
.${P}-title {
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: pre-line;
  transition: color 150ms cubic-bezier(0, 0, 0.58, 1);
}
.${P}-interactive .${P}-row:hover .${P}-title,
.${P}-row:focus-visible .${P}-title,
.${P}-panel-copy .${P}-row-active .${P}-title,
.${P}-state-hover .${P}-row:first-of-type .${P}-title {
  color: var(--${P}-text-hover-color, var(--${P}-text-color));
}
.${P}-control-anchor {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}
`;
}

type ChroniclesMediaItemProps = {
  P: string;
  media: ChroniclesMedia;
  isVisible: boolean;
  isLoaded: boolean;
  isCovered: boolean;
  isFading: boolean;
  onLoad: () => void;
};

function ChroniclesMediaItem({ P, media, isVisible, isLoaded, isCovered, isFading, onLoad }: ChroniclesMediaItemProps) {
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
    if (!video) return;
    if (isVisible) {
      video.play()?.catch(() => {});
    } else {
      video.pause();
    }
  }, [isVisible]);

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

  return <img className={className} src={media.assetId} alt="" decoding="async" onLoad={onLoad} />;
}

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
        data-controls-max-fraction={String(width + lastWidth)}
        className={`${P}-control-anchor`}
        style={{ top: 0, left: scaled(gapCenter - MIN_HANDLE_SIZE / 2), width: scaled(MIN_HANDLE_SIZE), height: '100%' }}
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
  return PADDING_CONTROLS.map((control) => {
    const size = scaled(Math.max(padding[control.side], MIN_HANDLE_SIZE));
    const isHorizontal = control.axis === 'x';
    return (
      <div
        key={control.side}
        data-controls={`panelPadding.${control.side}`}
        data-controls-axis={control.axis}
        data-controls-variant={control.variant}
        data-controls-reverse={'reverse' in control ? '' : undefined}
        data-controls-min="0"
        data-controls-max-fraction={'opposite' in control ? String(Math.max(0, panelWidth - padding[control.opposite])) : undefined}
        className={`${P}-control-anchor`}
        style={{
          [control.side]: 0,
          ...(isHorizontal ? { top: 0, width: size, height: '100%' } : { left: 0, width: '100%', height: size }),
        }}
      />
    );
  });
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
    type,
    triggerLabel,
    closeLabel,
    columns,
    columnGap,
    hoverInterval,
    panelPosition,
    panelWidth,
    panelPadding,
    panelRadius,
    groupGap,
    triggerColor,
    triggerHoverColor,
    closeColor,
    closeHoverColor,
    panelColor,
    textColor,
    textHoverColor,
    overlayColor,
  } = settings;
  const items = useMemo(() => content ?? [], [content]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inlineLayerRef = useRef<HTMLDivElement>(null);
  const shownMediaRef = useRef<string | null>(null);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isOverlayMounted, setIsOverlayMounted] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [isOverlaySettled, setIsOverlaySettled] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mountedRows, setMountedRows] = useState<Set<number>>(() => new Set());
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(() => new Set());
  const [coveredMedia, setCoveredMedia] = useState<string | null>(null);
  const [lastShownMedia, setLastShownMedia] = useState<string | null>(null);
  const [closePosition, setClosePosition] = useState<{ top: number; left: number } | null>(null);
  const [layoutStyle, setLayoutStyle] = useState<CSSProperties>({});
  const [copyRect, setCopyRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isMediaCut, setIsMediaCut] = useState(false);

  const isEditorCanvas = isEditor && !isPreviewMode;
  const isInteractive = !isEditorCanvas;
  const isInline = type === 'a';
  const isOpenPinned = isEditorCanvas && currentState === 'open' && !unavailableStates?.includes('open');
  const isOpen = !isInline && (isOpenPinned || ((isInteractive || isEditMode) && isUserOpen));
  const isListShown = isInteractive && (isInline || isOpen);
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const panelOffset = PANEL_POSITION_OFFSETS[panelPosition];
  const columnWidths = resolveColumnWidths(settings);
  const titleKeys = TITLE_KEYS.slice(0, columns - 1);
  const hasGroupColumn = columns > 1;
  const groups = useMemo<ChroniclesGroup[]>(() => (
    hasGroupColumn ? groupRows(items) : [{ label: '', rows: items.map((item, index) => ({ item, index })) }]
  ), [items, hasGroupColumn]);

  const activeMedia = activeIndex === null ? [] : getRowMedia(items[activeIndex]);
  const shownAsset = activeMedia[activeMediaIndex];
  const shownMedia = activeIndex !== null && shownAsset ? getMediaKey(activeIndex, activeMediaIndex, shownAsset.assetId) : null;
  const isShownMediaLoaded = shownMedia !== null && loadedMedia.has(shownMedia);

  useLightboxScrollLock(isOpen && !isEditorCanvas);

  useEffect(() => {
    if (isEditorCanvas && !isEditMode) setIsUserOpen(false);
  }, [isEditorCanvas, isEditMode]);

  useEffect(() => {
    if (isOpen) {
      setLayoutStyle(getLayoutStyle(wrapperRef.current));
      setIsOverlayMounted(true);
      return;
    }
    setIsOverlayActive(false);
    setActiveIndex(null);
    const timer = window.setTimeout(() => setIsOverlayMounted(false), OVERLAY_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isOverlayMounted) return;
    overlayRef.current?.getBoundingClientRect();
    const frame = requestAnimationFrame(() => setIsOverlayActive(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isOverlayMounted]);

  useEffect(() => {
    if (!isOverlayActive) {
      setIsOverlaySettled(false);
      return;
    }
    const timer = window.setTimeout(() => setIsOverlaySettled(true), OVERLAY_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isOverlayActive]);

  const updateClosePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const overlay = overlayRef.current;
    if (!trigger || !overlay) return;
    const triggerRect = trigger.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    setClosePosition({ top: triggerRect.top - overlayRect.top, left: triggerRect.left - overlayRect.left });
  }, []);

  const isLayerMounted = isOverlayMounted || (isInline && mountedRows.size > 0);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!isLayerMounted || !wrapper || typeof ResizeObserver === 'undefined') return;
    const update = () => setLayoutStyle((prev) => {
      const next = getLayoutStyle(wrapper);
      const isSame = LIGHTBOX_CSS_VARS.every((name) => (prev as Record<string, unknown>)[name] === (next as Record<string, unknown>)[name]);
      return isSame ? prev : next;
    });
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    const layoutContainer = findLayoutContainer(wrapper);
    if (layoutContainer && layoutContainer !== wrapper) observer.observe(layoutContainer);
    return () => observer.disconnect();
  }, [isLayerMounted]);

  useLayoutEffect(() => {
    if (!isOverlayMounted) return;
    updateClosePosition();
    window.addEventListener('resize', updateClosePosition);
    return () => window.removeEventListener('resize', updateClosePosition);
  }, [isOverlayMounted, layoutStyle, updateClosePosition]);

  useEffect(() => {
    if (!isOpen || !isInteractive) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsUserOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isInteractive]);

  useLayoutEffect(() => {
    if (!isInline || activeIndex === null) return;
    const panelEl = panelRef.current;
    const layer = inlineLayerRef.current;
    if (!panelEl || !layer) return;
    const panelRect = panelEl.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    setCopyRect({ top: panelRect.top - layerRect.top, left: panelRect.left - layerRect.left, width: panelRect.width });
  }, [isInline, activeIndex]);

  useEffect(() => {
    if (activeIndex !== null) return;
    const timer = window.setTimeout(() => setCopyRect(null), IMAGE_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

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

  useEffect(() => {
    if (!isListShown) return;
    items.forEach((item) => getRowMedia(item).forEach((media) => {
      if (!isVideoMedia(media)) new Image().src = media.assetId;
    }));
  }, [isListShown, items]);

  useEffect(() => {
    if (activeMedia.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveMediaIndex((current) => (current + 1) % activeMedia.length);
    }, hoverInterval);
    return () => window.clearInterval(timer);
  }, [activeIndex, activeMedia.length, hoverInterval]);

  useLayoutEffect(() => {
    const previous = shownMediaRef.current;
    shownMediaRef.current = shownMedia;
    if (shownMedia === null) return;
    setLastShownMedia(shownMedia);
    setCoveredMedia(previous);
  }, [shownMedia]);

  useEffect(() => {
    if (!isShownMediaLoaded || coveredMedia === null) return;
    const timer = window.setTimeout(() => setCoveredMedia(null), IMAGE_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [isShownMediaLoaded, coveredMedia]);

  const close = () => {
    if (!isInteractive) return;
    setIsUserOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const showRowMedia = (index: number) => {
    if (!isInteractive || getRowMedia(items[index]).length === 0) {
      setActiveIndex(null);
      return;
    }
    setMountedRows((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
    if (isInline && activeIndex === null) setLayoutStyle(getLayoutStyle(wrapperRef.current));
    if (activeIndex !== index) setActiveMediaIndex(0);
    setIsMediaCut(false);
    setActiveIndex(index);
  };

  const hideRowMedia = (index: number) => {
    setActiveIndex((current) => (current === index ? null : current));
  };

  const onPanelClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!isInteractive && (event.target as HTMLElement).closest('a')) {
      event.preventDefault();
    }
  };

  const triggerTypographyCss = omitTextColors(textStylesToCss(resolveTextStyle(settings, 'trigger'), isEditor));
  const columnTypographyCss = CHRONICLES_COLUMN_STYLE_PREFIXES.slice(0, columns).map((prefix) => (
    omitTextColors(textStylesToCss(resolveTextStyle(settings, prefix), isEditor))
  ));
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
  }, COLOR_VAR_MAP, []);
  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const interactiveClass = isInteractive ? `${P}-interactive` : '';
  const showPanelControls = Boolean(isEditMode) && (isInline || isOverlaySettled);

  const mediaLayer = (
    <div className={cn(`${P}-media-layer`, isMediaCut && `${P}-media-layer-instant`)} aria-hidden="true">
      {[...mountedRows].flatMap((index) => getRowMedia(items[index]).map((media, mediaIndex) => {
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

  const renderPanel = (isCopy: boolean) => {
    const showControls = !isCopy && showPanelControls;
    return (
      <div
        ref={isCopy ? undefined : panelRef}
        className={cn(
          `${P}-panel`,
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
          ...(isCopy && copyRect),
        } as CSSProperties}
        data-lightbox-scrollable={isInline ? undefined : ''}
        aria-hidden={isCopy || undefined}
        onMouseLeave={isCopy ? undefined : () => setActiveIndex(null)}
        onClickCapture={isCopy ? undefined : onPanelClickCapture}
      >
        {showControls && renderPanelPaddingControls(P, panelWidth, panelPadding, scaled)}
        {showControls && renderColumnWidthControls(P, columnWidths, panelPadding.left, columnGap, scaled)}
        {groups.map((group, groupIndex) => (
          <Fragment key={groupIndex}>
            {showControls && groupIndex > 0 && (
              <div
                data-controls="groupGap"
                data-controls-paired=""
                data-controls-axis="y"
                data-controls-reverse=""
                data-controls-min="0"
                className={`${P}-control-anchor`}
                style={{ left: 0, width: '100%', height: scaled(Math.max(groupGap, MIN_HANDLE_SIZE)) }}
              />
            )}
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
                const linkProps = rowLink ? {
                  href: buildValidUrl(rowLink.value),
                  ...(rowLink.target === 'blank' && { target: '_blank', rel: 'noreferrer' }),
                } : {};
                const isFocusable = !rowLink && isInteractive && getRowMedia(item).length > 0;
                const hoverProps = isCopy ? {} : {
                  tabIndex: isFocusable ? 0 : undefined,
                  onMouseEnter: () => showRowMedia(index),
                  onMouseLeave: () => hideRowMedia(index),
                  onFocus: () => showRowMedia(index),
                  onBlur: () => hideRowMedia(index),
                };
                return (
                  <RowElement
                    key={index}
                    className={cn(`${P}-row`, isCopy && index === activeIndex && `${P}-row-active`)}
                    {...linkProps}
                    {...hoverProps}
                  >
                    {!hasGroupColumn && (
                      <div className={`${P}-title`} style={columnTypographyCss[0]}>{item.group}</div>
                    )}
                    {titleKeys.map((key, titleIndex) => (
                      <div key={key} className={`${P}-title`} style={columnTypographyCss[titleIndex + 1]}>{item[key]}</div>
                    ))}
                  </RowElement>
                );
              })}
            </div>
          </Fragment>
        ))}
      </div>
    );
  };

  const overlay = isOverlayMounted && !isInline ? (
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

  const inlineLayer = isInline && mountedRows.size > 0 ? (
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
          <button
            ref={triggerRef}
            type="button"
            className={cn(`${P}-trigger`, isOverlayActive && `${P}-trigger-hidden`)}
            style={triggerTypographyCss}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={() => {
              if (isInteractive) setIsUserOpen(true);
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
