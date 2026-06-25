import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { getAspectRatio, isImageRatioCover } from '../utils/imageFitStyles';
import { useLightboxSwipeDismiss } from '../utils/useLightboxSwipeDismiss';
import { useLightboxScrollLock } from '../utils/useLightboxScrollLock';
import { animateStripScroll, getDistanceScaledDuration } from '../utils/animateStripScroll';
import { LayoutItem, LayoutTab } from '../../types/SchemaV1';

const LIGHTBOX_ANIM_MS = 300;
const SNAP_SCROLL_MIN_MS = 900;
const SNAP_SCROLL_MAX_MS = 1500;
const SNAP_SCROLL_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const CONTROLS_IDLE_MS = 3000;
const THUMB_MAX_SIZE_PX = 42;

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.${P}-cover {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  pointer-events: auto;
}

.${P}-ratio-wrapper-cover {
  aspect-ratio: var(--image-aspect-ratio);
  height: auto;
  overflow: hidden;
  width: 100%;
}

.${P}-ratio-wrapper-fit {
  height: 100%;
  width: 100%;
}

.${P}-cover-image {
  display: block;
}

.${P}-cover-image-cover {
  object-fit: cover;
  width: 100%;
  height: 100%;
  max-width: 100%;
}

.${P}-cover-image-fit {
  object-fit: contain;
  width: auto;
  height: auto;
  max-width: 100%;
}

.${P}-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9997;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overscroll-behavior: none;
}

.${P}-lightbox-editor {
  inset: auto;
  top: 0;
  left: var(--cntrl-article-left, 0);
  width: var(--cntrl-article-width, 100vw) !important;
  height: var(--cntrl-viewport-height, 100vh) !important;
}

.${P}-lightbox-edit-mode {
  z-index: 1;
}

.${P}-lightbox-edit-mode .${P}-lightbox-strip {
  overflow-x: hidden;
  touch-action: none;
  scroll-snap-type: none;
}

.${P}-lightbox-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.${P}-lightbox-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.${P}-lightbox-strip {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 0;
  max-width: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  box-sizing: border-box;
  touch-action: pan-x;
  scrollbar-width: none;
}

.${P}-lightbox-strip-track {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  height: 100%;
  min-width: min-content;
  backface-visibility: hidden;
}

.${P}-lightbox-strip[data-mouse-dragging="true"] {
  scroll-snap-type: none;
  cursor: grabbing;
  user-select: none;
}

.${P}-lightbox-strip[data-mouse-draggable="true"] {
  cursor: grab;
}

.${P}-lightbox-strip::-webkit-scrollbar {
  display: none;
}

.${P}-strip-item {
  position: relative;
  flex: 0 0 auto;
  height: 100%;
  scroll-snap-align: start;
}

.${P}-thumbnails {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  max-width: calc(100% - 32px);
  overflow-x: auto;
  scrollbar-width: none;
  pointer-events: auto;
  opacity: 1;
  transition: opacity ${LIGHTBOX_ANIM_MS}ms ease;
}

.${P}-thumbnails[data-overlay-content-hidden="true"] {
  opacity: 0;
  pointer-events: none;
}

.${P}-lightbox-editor .${P}-thumbnails {
  overflow: visible;
}

.${P}-thumbnails::-webkit-scrollbar {
  display: none;
}

.${P}-thumb {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.${P}-thumb[data-active="true"] {
  opacity: 1;
}

.${P}-thumbnails[data-thumbnail-active="outline"] .${P}-thumb[data-active="true"] {
  border-color: var(--thumbnail-active-color, #ffffff);
}

.${P}-thumbnails[data-thumbnail-active="color"] .${P}-thumb:not([data-active="true"]) .${P}-thumb-image {
  filter: grayscale(1);
}

.${P}-thumbnails[data-thumbnail-active="scale-up"] .${P}-thumb[data-active="true"] {
  transform: scale(1.15);
}


.${P}-thumb-image {
  display: block;
  height: ${THUMB_MAX_SIZE_PX}px;
  object-fit: contain;
  transition: filter 0.2s ease;
}

.${P}-thumb-image-cover {
  aspect-ratio: var(--image-aspect-ratio);
  max-width: ${THUMB_MAX_SIZE_PX}px;
  max-height: ${THUMB_MAX_SIZE_PX}px;
  width: auto;
  height: auto;
  object-fit: cover;
}
.${P}-close-icon {
  position: relative;
  flex-shrink: 0;
  margin-left: auto;
  pointer-events: auto;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  padding: 0;
  opacity: 1;
  transition: opacity ${LIGHTBOX_ANIM_MS}ms ease;
}

.${P}-close-icon[data-overlay-content-hidden="true"] {
  opacity: 0;
  pointer-events: none;
}

.${P}-close-icon-inner {
  all: unset;
  position: relative;
  cursor: pointer;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.${P}-close-icon-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.${P}-titles-row {
  position: relative;
  flex: 0 1 auto;
  z-index: 2;
  box-sizing: border-box;
  pointer-events: none;
  word-break: break-word;
  min-width: 0;
  display: flex;
  flex-direction: row;
}

.${P}-title-cell {
  position: relative;
  flex: 0 0 auto;
  min-width: 0;
  box-sizing: border-box;
}

.${P}-title1,
.${P}-title2,
.${P}-title3 {
  margin: 0;
  min-width: 0;
}

.${P}-title-resize-handle {
  background: transparent;
}

.${P}-title-resize-handle::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: #FF5C02;
  pointer-events: none;
}
.${P}-lightbox-content-inner {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  opacity: 1;
  transition: opacity ${LIGHTBOX_ANIM_MS}ms ease;
}

.${P}-lightbox-content-inner[data-overlay-content-hidden="true"] {
  opacity: 0;
  pointer-events: none;
}

.${P}-lightbox-content-area {
  position: relative;
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
}

.${P}-control {
  position: relative;
  z-index: 2;
  pointer-events: auto;
  flex-shrink: 0;
}

.${P}-control::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 20px;
  min-height: 20px;
  pointer-events: auto;
  z-index: 10;
}

.${P}-control[data-controls="contentMarginTop"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 5%;
  transform: translateY(-50%);
  width: 12px;
  height: 4px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  pointer-events: none;
}
`;
}

export type LightboxStripItem = {
  image: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  title1?: string;
  title2?: string;
  title3?: string;
};

type LightboxStripLegacyItem = LightboxStripItem & {
  text?: Array<{
    type?: string;
    children?: Array<{ text?: string }>;
  }>;
};

export type SharedStripTitles = {
  title1: string;
  title2: string;
  title3: string;
};

export function extractTitlesFromLegacyText(text: LightboxStripLegacyItem['text']): Partial<SharedStripTitles> {
  if (!Array.isArray(text) || text.length === 0) return {};

  const paragraph = text.find((node) => node?.type === 'paragraph') ?? text[0];
  const children = paragraph?.children;
  if (!Array.isArray(children)) return {};

  const values = children
    .map((child) => (typeof child?.text === 'string' ? child.text.trim() : ''))
    .filter(Boolean);

  return {
    title1: values[0],
    title2: values[1],
    title3: values[2],
  };
}

export function resolveSharedStripTitles(items: LightboxStripLegacyItem[]): SharedStripTitles {
  for (const item of items) {
    if (item.title1 || item.title2 || item.title3) {
      return {
        title1: item.title1 ?? '',
        title2: item.title2 ?? '',
        title3: item.title3 ?? '',
      };
    }
  }

  for (const item of items) {
    const fromText = extractTitlesFromLegacyText(item.text);
    if (fromText.title1 || fromText.title2 || fromText.title3) {
      return {
        title1: fromText.title1 ?? '',
        title2: fromText.title2 ?? '',
        title3: fromText.title3 ?? '',
      };
    }
  }

  return { title1: '', title2: '', title3: '' };
}

export type LightboxStripSettings = {
  cover: string | null;
  coverFit: {
    display: 'Fit' | 'Cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
  backgroundColor: string;
  thumbnailVisibility: 'on' | 'off';
  thumbnailObjectFit: {
    display: 'Fit' | 'Cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  },
  thumbnailTrigger: 'click' | 'hover';
  thumbnailActive: 'outline' | 'color' | 'scale-up';
  thumbnailActiveColor: string;
  thumbnailGap: number;
  thumbnailMarginBottom?: number;
  imageGap?: number;
  title1Width: number;
  title2Width: number;
  title3Width: number;
  title2MarginLeft: number;
  title3MarginLeft: number;
  title1Color: string;
  title2Color: string;
  title3Color: string;
  title1FontFamily?: string;
  title1FontSettings?: { fontWeight: number; fontStyle: string };
  title1FontSize?: number;
  title1LineHeight?: number;
  title1LetterSpacing?: number;
  title1WordSpacing?: number;
  title1TextAlign?: 'left' | 'center' | 'right' | 'justify';
  title1TextAppearance?: TextStyles['textAppearance'];
  title2FontFamily?: string;
  title2FontSettings?: { fontWeight: number; fontStyle: string };
  title2FontSize?: number;
  title2LineHeight?: number;
  title2LetterSpacing?: number;
  title2WordSpacing?: number;
  title2TextAlign?: 'left' | 'center' | 'right' | 'justify';
  title2TextAppearance?: TextStyles['textAppearance'];
  title3FontFamily?: string;
  title3FontSettings?: { fontWeight: number; fontStyle: string };
  title3FontSize?: number;
  title3LineHeight?: number;
  title3LetterSpacing?: number;
  title3WordSpacing?: number;
  title3TextAlign?: 'left' | 'center' | 'right' | 'justify';
  title3TextAppearance?: TextStyles['textAppearance'];
  contentMarginTop: number;
  contentMarginLeft: number;
  contentMarginRight: number;
  closeIcon:  string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
};

export const STRIP_TEXT_STYLE_PREFIXES = ['title1', 'title2', 'title3'] as const;

export type StripTextStylePrefix = typeof STRIP_TEXT_STYLE_PREFIXES[number];

export const STRIP_GLOBAL_TEXT_STYLE_KEYS = [
  'fontFamily',
  'fontSettings',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textAlign',
  'textAppearance',
] as const;

export type StripGlobalTextStyleKey = typeof STRIP_GLOBAL_TEXT_STYLE_KEYS[number];

export function getStripTextStyleSettingKey(
  prefix: StripTextStylePrefix,
  globalKey: StripGlobalTextStyleKey,
): string {
  return `${prefix}${globalKey.charAt(0).toUpperCase()}${globalKey.slice(1)}`;
}

export const STRIP_TEXT_STYLE_TAB_LABELS: Record<StripTextStylePrefix, string> = {
  title1: '1',
  title2: '2',
  title3: '3',
};

export function createStripTextStyleTabContentItems(prefix: StripTextStylePrefix): LayoutItem[] {
  return [
    getStripTextStyleSettingKey(prefix, 'fontFamily'),
    getStripTextStyleSettingKey(prefix, 'fontSettings'),
    {
      type: 'row',
      items: [
        getStripTextStyleSettingKey(prefix, 'fontSize'),
        getStripTextStyleSettingKey(prefix, 'lineHeight'),
        getStripTextStyleSettingKey(prefix, 'letterSpacing'),
        getStripTextStyleSettingKey(prefix, 'wordSpacing'),
      ],
    },
    getStripTextStyleSettingKey(prefix, 'textAlign'),
    getStripTextStyleSettingKey(prefix, 'textAppearance'),
  ];
}

export function createStripTextStylePanelTab(): LayoutTab {
  return {
    type: 'tab',
    id: 'stripTextStyle',
    tabs: Object.fromEntries(
      STRIP_TEXT_STYLE_PREFIXES.map((prefix) => [
        STRIP_TEXT_STYLE_TAB_LABELS[prefix],
        createStripTextStyleTabContentItems(prefix),
      ]),
    ),
  };
}

type StripTextStyleFields = {
  fontFamily?: string;
  fontSettings?: { fontWeight: number; fontStyle: string };
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textAppearance?: TextStyles['textAppearance'];
  color?: string;
};

type ResolvedStripTextFields = {
  fontFamily: string;
  fontSettings: { fontWeight: number; fontStyle: string };
  fontSize?: number;
  lineHeight?: number;
  letterSpacing: number;
  wordSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textAppearance?: TextStyles['textAppearance'];
  color?: string;
};

const STRIP_TEXT_STYLE_COLOR_KEYS: Record<StripTextStylePrefix, keyof LightboxStripSettings> = {
  title1: 'title1Color',
  title2: 'title2Color',
  title3: 'title3Color',
};

const STRIP_TEXT_STYLE_DEFAULT_FONT_SIZES: Record<StripTextStylePrefix, number> = {
  title1: 0.02,
  title2: 0.02,
  title3: 0.02,
};

export const STRIP_TITLE_WIDTH_KEYS = ['title1Width', 'title2Width', 'title3Width'] as const;

export type StripTitleWidthKey = typeof STRIP_TITLE_WIDTH_KEYS[number];

const TITLE_RESIZE_HANDLE_WIDTH = 0.004;
const MIN_TITLE_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_TITLE_WIDTH = MIN_TITLE_WIDTH_PX / ARTICLE_DESIGN_WIDTH;
const STRIP_TITLES_CONTENT_WIDTH = 1;

const DEFAULT_STRIP_TITLE_WIDTHS: Record<StripTitleWidthKey, number> = {
  title1Width: 0.13,
  title2Width: 0.13,
  title3Width: 0.14,
};

function getStripTitleWidthsFromSettings(
  settings: LightboxStripSettings,
): Record<StripTitleWidthKey, number> {
  return Object.fromEntries(
    STRIP_TITLE_WIDTH_KEYS.map((key) => [
      key,
      typeof settings[key] === 'number' ? settings[key] : DEFAULT_STRIP_TITLE_WIDTHS[key],
    ]),
  ) as Record<StripTitleWidthKey, number>;
}

function resolveStripTitleWidths(
  count: number,
  contentWidth: number,
  storedWidths: number[],
): number[] {
  if (count <= 0) {
    return [];
  }

  const widths = storedWidths.slice(0, count);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  const minTotalWidth = MIN_TITLE_WIDTH * count;

  if (totalWidth <= contentWidth || totalWidth <= minTotalWidth) {
    return widths;
  }

  const resolvedWidths = [...widths];
  let overflow = totalWidth - contentWidth;

  for (let index = resolvedWidths.length - 1; index >= 0 && overflow > 0; index -= 1) {
    const shrinkable = resolvedWidths[index] - MIN_TITLE_WIDTH;
    if (shrinkable <= 0) {
      continue;
    }

    const shrinkAmount = Math.min(overflow, shrinkable);
    resolvedWidths[index] -= shrinkAmount;
    overflow -= shrinkAmount;
  }

  return resolvedWidths;
}

function getEffectiveStripTitleWidths(
  count: number,
  contentWidth: number,
  storedWidths: number[],
): number[] {
  return resolveStripTitleWidths(count, contentWidth, storedWidths);
}

function getStripTitleMaxWidth(
  columnIndex: number,
  resolvedWidths: number[],
  contentWidth: number,
): number {
  const otherWidths = resolvedWidths
    .filter((_, index) => index !== columnIndex)
    .reduce((sum, width) => sum + width, 0);

  return Math.max(
    MIN_TITLE_WIDTH,
    contentWidth - otherWidths,
  );
}

type StripTitleSlot = {
  prefix: StripTextStylePrefix;
  widthKey: StripTitleWidthKey;
  marginLeftKey?: 'title2MarginLeft' | 'title3MarginLeft';
  className: string;
  style: React.CSSProperties;
  text: string;
};

function buildStripTitleSlots(
  prefix: string,
  title1: string,
  title2: string,
  title3: string,
  title1Style: React.CSSProperties,
  title2Style: React.CSSProperties,
  title3Style: React.CSSProperties,
): StripTitleSlot[] {
  const slots: StripTitleSlot[] = [];

  if (title1) {
    slots.push({
      prefix: 'title1',
      widthKey: 'title1Width',
      className: `${prefix}-title1`,
      style: title1Style,
      text: title1,
    });
  }
  if (title2) {
    slots.push({
      prefix: 'title2',
      widthKey: 'title2Width',
      marginLeftKey: 'title2MarginLeft',
      className: `${prefix}-title2`,
      style: title2Style,
      text: title2,
    });
  }
  if (title3) {
    slots.push({
      prefix: 'title3',
      widthKey: 'title3Width',
      marginLeftKey: 'title3MarginLeft',
      className: `${prefix}-title3`,
      style: title3Style,
      text: title3,
    });
  }

  return slots;
}

function resolveStripTextFields(
  settings: LightboxStripSettings,
  prefix: StripTextStylePrefix,
): ResolvedStripTextFields {
  const read = <K extends StripGlobalTextStyleKey>(globalKey: K) => {
    const settingKey = getStripTextStyleSettingKey(prefix, globalKey);
    return settings[settingKey as keyof LightboxStripSettings] as StripTextStyleFields[K] | undefined;
  };

  return {
    fontFamily: (read('fontFamily') as string | undefined) ?? 'Arial',
    fontSettings: (read('fontSettings') as StripTextStyleFields['fontSettings']) ?? {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    fontSize: read('fontSize') as number | undefined,
    lineHeight: read('lineHeight') as number | undefined,
    letterSpacing: (read('letterSpacing') as number | undefined) ?? 0,
    wordSpacing: (read('wordSpacing') as number | undefined) ?? 0,
    textAlign: (read('textAlign') as StripTextStyleFields['textAlign']) ?? 'left',
    textAppearance: read('textAppearance') as StripTextStyleFields['textAppearance'],
    color: settings[STRIP_TEXT_STYLE_COLOR_KEYS[prefix]] as string | undefined,
  };
}

function stripTextFieldsToCss(
  prefix: StripTextStylePrefix,
  fields: ResolvedStripTextFields,
  isEditor?: boolean,
): React.CSSProperties {
  const resolvedTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: fields.fontFamily,
      fontWeight: fields.fontSettings?.fontWeight ?? 400,
      fontStyle: fields.fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fields.fontSize ?? STRIP_TEXT_STYLE_DEFAULT_FONT_SIZES[prefix],
    lineHeight: fields.lineHeight,
    letterSpacing: fields.letterSpacing,
    wordSpacing: fields.wordSpacing,
    textAlign: fields.textAlign,
    textAppearance: fields.textAppearance,
    color: fields.color ?? '#ffffff',
  };

  return textStylesToCss(resolvedTextStyle, isEditor);
}

type LightboxOverlayProps = {
  prefix: string;
  images: LightboxStripItem[];
  backgroundColor: string;
  thumbnailGap: string;
  thumbnailMarginBottom: string;
  imageGap: string;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
  thumbnailVisibility: 'on' | 'off';
  thumbnailObjectFit: {
    display: 'Fit' | 'Cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
  thumbnailTrigger: 'click' | 'hover';
  thumbnailActive: 'outline' | 'color' | 'scale-up';
  thumbnailActiveColor: string;
  title1Width: number;
  title2Width: number;
  title3Width: number;
  title1: string;
  title2: string;
  title3: string;
  title1Style: React.CSSProperties;
  title2Style: React.CSSProperties;
  title3Style: React.CSSProperties;
  contentMarginTop: string;
  contentMarginLeft: string;
  contentMarginRight: string;
  title2MarginLeft: number;
  title3MarginLeft: number;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  onClose: () => void;
};

const MOUSE_DRAG_THRESHOLD_PX = 1;
const DRAG_SNAP_RATIO = 0.15;
const LOOP_COPIES = 3;
const GAP_LABEL_AREA_PX = 20;

const getGapControlSize = (gap: string) => `max(${gap}, ${GAP_LABEL_AREA_PX}px)`;

const LightboxOverlay = ({
  prefix: P,
  images,
  backgroundColor,
  thumbnailGap,
  thumbnailMarginBottom,
  imageGap,
  isEditor,
  isEditMode,
  isPreviewMode,
  closeIcon,
  closeIconMaxWidth,
  closeIconColor,
  closeIconHoverColor,
  thumbnailTrigger,
  thumbnailVisibility,
  thumbnailObjectFit,
  thumbnailActive,
  thumbnailActiveColor,
  title1Width,
  title2Width,
  title3Width,
  title1,
  title2,
  title3,
  title1Style,
  title2Style,
  title3Style,
  contentMarginTop,
  contentMarginLeft,
  contentMarginRight,
  title2MarginLeft,
  title3MarginLeft,
  onClose,
}: LightboxOverlayProps) => {
  const showControls = isEditMode;
  const allowImageScroll = !isEditMode && (!isEditor || isPreviewMode);
  const hideOverlayContentOnIdle = allowImageScroll;
  const allowMouseDrag = allowImageScroll;
  const allowThumbnailHover = allowImageScroll;
  const isThumbCover = isImageRatioCover(thumbnailObjectFit);
  const thumbAspectRatioStyle = isThumbCover
    ? ({ '--image-aspect-ratio': getAspectRatio(thumbnailObjectFit) } as React.CSSProperties)
    : undefined;

  const renderGapControl = (controlKey: string, gap: string, isReverse = false) => {
    const gapControlSize = getGapControlSize(gap);
    const gapControlRight = `calc(-0.5 * (${gapControlSize} + ${gap}))`;
    return (
      <div
        data-controls={controlKey}
        data-controls-axis="x"
        {...(isReverse ? { 'data-controls-reverse': 'true' } : undefined)}
        style={{
          position: 'absolute',
          top: 0,
          right: gapControlRight,
          width: gapControlSize,
          height: '100%',
          pointerEvents: 'auto',
          zIndex: 3,
        }}
      />
    );
  };

  const hasTitles = Boolean(title1 || title2 || title3);
  const titleSlots = useMemo(
    () => buildStripTitleSlots(P, title1, title2, title3, title1Style, title2Style, title3Style),
    [P, title1, title2, title3, title1Style, title2Style, title3Style],
  );
  const titleWidthByKey = useMemo(
    () => ({
      title1Width,
      title2Width,
      title3Width,
    }),
    [title1Width, title2Width, title3Width],
  );
  const storedTitleWidths = useMemo(
    () => titleSlots.map((slot) => titleWidthByKey[slot.widthKey]),
    [titleSlots, titleWidthByKey],
  );
  const resolvedTitleWidths = useMemo(
    () => resolveStripTitleWidths(titleSlots.length, STRIP_TITLES_CONTENT_WIDTH, storedTitleWidths),
    [titleSlots.length, storedTitleWidths],
  );
  const effectiveTitleWidths = useMemo(
    () => getEffectiveStripTitleWidths(titleSlots.length, STRIP_TITLES_CONTENT_WIDTH, storedTitleWidths),
    [titleSlots.length, storedTitleWidths],
  );
  const scaledTitleWidth = useCallback(
    (value: number) => scalingValue(value, isEditor ?? false),
    [isEditor],
  );
  const titleMarginLeftByKey = useMemo(
    () => ({
      title2MarginLeft,
      title3MarginLeft,
    }),
    [title2MarginLeft, title3MarginLeft],
  );
  const getTitleBoundaryOffset = useCallback(
    (upToIndex: number) => {
      let offset = 0;
      for (let index = 0; index <= upToIndex; index += 1) {
        const slot = titleSlots[index];
        if (slot?.marginLeftKey) {
          offset += titleMarginLeftByKey[slot.marginLeftKey] ?? 0;
        }
        offset += resolvedTitleWidths[index] ?? 0;
      }
      return offset;
    },
    [titleSlots, titleMarginLeftByKey, resolvedTitleWidths],
  );

  const renderTitles = () => titleSlots.flatMap((slot, index) => {
    const marginLeft = slot.marginLeftKey
      ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0
      : 0;
    const elements = [];

    if (slot.marginLeftKey) {
      elements.push(
        <div
          key={`${slot.className}-margin`}
          data-controls={showControls ? slot.marginLeftKey : undefined}
          data-controls-axis={showControls ? 'x' : undefined}
          className={showControls ? `${P}-control` : undefined}
          style={{ width: scaledTitleWidth(marginLeft), flexShrink: 0 }}
        />,
      );
    }

    elements.push(
      <div
        key={slot.className}
        className={`${P}-title-cell`}
        style={{ width: scaledTitleWidth(effectiveTitleWidths[index] ?? 0) }}
      >
        <p className={slot.className} style={slot.style}>{slot.text}</p>
      </div>,
    );

    return elements;
  });

  const renderTitleWidthControls = () => titleSlots.map((slot, colIndex) => {
    const maxTitleWidth = getStripTitleMaxWidth(
      colIndex,
      resolvedTitleWidths,
      STRIP_TITLES_CONTENT_WIDTH,
    );
    const boundaryOffset = getTitleBoundaryOffset(colIndex);
    const titleWidthHandleOffset = boundaryOffset - TITLE_RESIZE_HANDLE_WIDTH / 2;

    return (
      <div key={`${slot.widthKey}-junction`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          data-controls={slot.widthKey}
          data-controls-static-handle=""
          data-controls-axis="x"
          data-controls-min={String(MIN_TITLE_WIDTH_PX)}
          data-controls-max-fraction={String(maxTitleWidth)}
          data-controls-variant="column-width"
          className={`${P}-title-resize-handle`}
          style={{
            position: 'absolute',
            top: 0,
            left: scaledTitleWidth(titleWidthHandleOffset),
            width: scaledTitleWidth(TITLE_RESIZE_HANDLE_WIDTH),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      </div>
    );
  });
  const dismissAreaRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setWidthRef = useRef(0);
  const mouseDragRef = useRef({
    isActive: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });
  const scrollAnimRef = useRef<(() => void) | null>(null);
  const isLoopEnabled = images.length > 1;
  const loopCopies = isLoopEnabled ? LOOP_COPIES : 1;
  const flatItems = useMemo(
    () => Array.from({ length: loopCopies }, () => images).flat(),
    [images, loopCopies],
  );
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [overlayContentVisible, setOverlayContentVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const lockedActiveIndexRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayContentIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOverlayContentHidden = hideOverlayContentOnIdle && !overlayContentVisible;

  const resetOverlayContentIdleTimer = useCallback(() => {
    if (!hideOverlayContentOnIdle) return;
    setOverlayContentVisible(true);
    if (overlayContentIdleTimerRef.current) {
      clearTimeout(overlayContentIdleTimerRef.current);
    }
    overlayContentIdleTimerRef.current = setTimeout(() => {
      if (mouseDragRef.current.isActive) return;
      setOverlayContentVisible(false);
    }, CONTROLS_IDLE_MS);
  }, [hideOverlayContentOnIdle]);

  const handleClose = useCallback(() => {
    if (isEditMode || isClosingRef.current) return;
    isClosingRef.current = true;
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, LIGHTBOX_ANIM_MS);
  }, [isEditMode, onClose]);

  const isDragBlockedTarget = useCallback((target: HTMLElement) => Boolean(
    target.closest('[data-controls]')
    || target.closest(`.${P}-thumbnails`)
    || target.closest(`.${P}-close-icon`)
  ), [P]);

  const {
    isSwipeDragging,
    backdropStyle: swipeBackdropStyle,
    mediaAreaStyle,
    overlayContentStyle: swipeOverlayContentStyle,
    swipeHandlers,
    dismissAreaStyle,
  } = useLightboxSwipeDismiss({
    enabled: allowImageScroll ?? false,
    onClose: handleClose,
    animMs: LIGHTBOX_ANIM_MS,
    isBlockedTarget: isDragBlockedTarget,
  });

  const measureSetWidth = () => {
    if (!isLoopEnabled || images.length === 0) {
      setWidthRef.current = 0;
      return 0;
    }
    const firstItem = itemRefs.current[0];
    const firstMiddleSetItem = itemRefs.current[images.length];
    if (!firstItem || !firstMiddleSetItem) return setWidthRef.current;
    const nextSetWidth = firstMiddleSetItem.offsetLeft - firstItem.offsetLeft;
    if (nextSetWidth > 0) {
      setWidthRef.current = nextSetWidth;
    }
    return setWidthRef.current;
  };

  const normalizeInfiniteScroll = (adjustMouseDragAnchor = false) => {
    if (!isLoopEnabled) return;
    const strip = stripRef.current;
    const setWidth = measureSetWidth();
    if (!strip || setWidth <= 0) return;

    if (strip.scrollLeft <= 0) {
      strip.scrollLeft += setWidth;
      if (adjustMouseDragAnchor) {
        mouseDragRef.current.scrollLeft += setWidth;
      }
    } else if (strip.scrollLeft >= setWidth * 2) {
      strip.scrollLeft -= setWidth;
      if (adjustMouseDragAnchor) {
        mouseDragRef.current.scrollLeft -= setWidth;
      }
    }
  };

  const getNearestFlatIndex = (scrollLeft = stripRef.current?.scrollLeft ?? 0) => {
    let closestFlatIndex = 0;
    let closestDistance = Infinity;
    itemRefs.current.forEach((item, flatIndex) => {
      if (!item) return;
      const distance = Math.abs(item.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFlatIndex = flatIndex;
      }
    });
    return closestFlatIndex;
  };

  const updateActiveIndex = () => {
    if (!stripRef.current || images.length === 0) return;
    if (lockedActiveIndexRef.current !== null) return;
    setActiveIndex(getNearestFlatIndex() % images.length);
  };

  const releaseActiveIndexLock = () => {
    lockedActiveIndexRef.current = null;
  };

  const setStripSnapEnabled = (enabled: boolean) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.style.scrollSnapType = enabled ? '' : 'none';
  };

  const cancelScrollAnimation = () => {
    scrollAnimRef.current?.();
    scrollAnimRef.current = null;
  };

  const clearStripTrackTransform = () => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = '';
    track.style.transform = '';
    track.style.willChange = '';
  };

  const finishStripScroll = (
    strip: HTMLDivElement,
    targetLeft: number,
    activeIndex?: number,
    onComplete?: () => void,
  ) => {
    clearStripTrackTransform();
    strip.scrollLeft = targetLeft;
    normalizeInfiniteScroll();
    if (activeIndex !== undefined) {
      setActiveIndex(activeIndex);
    } else {
      updateActiveIndex();
    }
    setStripSnapEnabled(true);
    onComplete?.();
  };

  const scrollStripTo = (
    targetLeft: number,
    {
      behavior = 'smooth',
      activeIndex,
      onComplete,
    }: {
      behavior?: ScrollBehavior;
      activeIndex?: number;
      onComplete?: () => void;
    } = {},
  ) => {
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!strip || !track) return;

    cancelScrollAnimation();
    setStripSnapEnabled(false);

    if (behavior === 'auto') {
      finishStripScroll(strip, targetLeft, activeIndex, onComplete);
      return;
    }

    const distance = Math.abs(targetLeft - strip.scrollLeft);
    const duration = getDistanceScaledDuration(
      distance,
      SNAP_SCROLL_MIN_MS,
      SNAP_SCROLL_MAX_MS,
      strip.clientWidth * 0.55,
    );

    scrollAnimRef.current = animateStripScroll(strip, track, targetLeft, {
      duration,
      easing: SNAP_SCROLL_EASING,
      onComplete: () => {
        scrollAnimRef.current = null;
        finishStripScroll(strip, targetLeft, activeIndex, onComplete);
      },
    });
  };

  const snapToNearestItem = (behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    if (!strip || images.length === 0) return;
    const flatIndex = getNearestFlatIndex();
    const item = itemRefs.current[flatIndex];
    if (!item) return;
    scrollStripTo(item.offsetLeft, { behavior, activeIndex: flatIndex % images.length });
  };

  const snapAfterDrag = (startScrollLeft: number, behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    if (!strip || images.length === 0) return;

    const scrollDelta = strip.scrollLeft - startScrollLeft;
    const currentFlatIndex = getNearestFlatIndex(strip.scrollLeft);
    const currentItem = itemRefs.current[currentFlatIndex];
    const nextItem = itemRefs.current[currentFlatIndex + 1];
    const span = currentItem
      ? (nextItem ? nextItem.offsetLeft - currentItem.offsetLeft : currentItem.offsetWidth)
      : 0;

    let targetFlatIndex = currentFlatIndex;
    if (span > 0) {
      if (scrollDelta > span * DRAG_SNAP_RATIO) {
        targetFlatIndex += 1;
      } else if (scrollDelta < -span * DRAG_SNAP_RATIO) {
        targetFlatIndex -= 1;
      }
    }

    if (!isLoopEnabled) {
      targetFlatIndex = Math.max(0, Math.min(flatItems.length - 1, targetFlatIndex));
    }

    const targetItem = itemRefs.current[targetFlatIndex];
    if (!targetItem) {
      snapToNearestItem(behavior);
      return;
    }

    const snapTargetIndex = targetFlatIndex % images.length;
    if (behavior === 'smooth') {
      lockedActiveIndexRef.current = snapTargetIndex;
    }
    setActiveIndex(snapTargetIndex);
    scrollStripTo(targetItem.offsetLeft, {
      behavior,
      activeIndex: snapTargetIndex,
      onComplete: behavior === 'smooth' ? releaseActiveIndexLock : undefined,
    });
  };

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    const flatIndex = isLoopEnabled ? images.length + index : index;
    const item = itemRefs.current[flatIndex];
    if (!strip || !item) return;
    if (behavior === 'smooth') {
      lockedActiveIndexRef.current = index;
    } else {
      lockedActiveIndexRef.current = null;
    }
    setActiveIndex(index);
    scrollStripTo(item.offsetLeft, {
      behavior,
      activeIndex: index,
      onComplete: behavior === 'smooth' ? releaseActiveIndexLock : undefined,
    });
  };

  const onStripPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (isDragBlockedTarget(event.target as HTMLElement)) return;
    const strip = stripRef.current;
    if (!strip) return;
    cancelScrollAnimation();
    clearStripTrackTransform();
    lockedActiveIndexRef.current = null;
    mouseDragRef.current = {
      isActive: true,
      startX: event.clientX,
      scrollLeft: strip.scrollLeft,
      hasMoved: false,
    };
    setStripSnapEnabled(false);
    resetOverlayContentIdleTimer();
    strip.setPointerCapture(event.pointerId);
  };

  const onStripPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    const strip = stripRef.current;
    if (!strip || !mouseDragRef.current.isActive) return;
    const deltaX = event.clientX - mouseDragRef.current.startX;
    if (Math.abs(deltaX) > MOUSE_DRAG_THRESHOLD_PX) {
      mouseDragRef.current.hasMoved = true;
      setIsMouseDragging(true);
    }
    if (mouseDragRef.current.hasMoved) {
      event.preventDefault();
      strip.scrollLeft = mouseDragRef.current.scrollLeft - deltaX;
      normalizeInfiniteScroll(true);
      updateActiveIndex();
      resetOverlayContentIdleTimer();
    }
  };

  const endStripMouseDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    const strip = stripRef.current;
    if (!strip) return;
    const hadMoved = mouseDragRef.current.hasMoved;
    const startScrollLeft = mouseDragRef.current.scrollLeft;
    mouseDragRef.current.isActive = false;
    setIsMouseDragging(false);
    if (strip.hasPointerCapture(event.pointerId)) {
      strip.releasePointerCapture(event.pointerId);
    }
    normalizeInfiniteScroll();
    if (hadMoved) {
      snapAfterDrag(startScrollLeft);
    } else {
      setStripSnapEnabled(true);
      updateActiveIndex();
    }
    resetOverlayContentIdleTimer();
  };

  useLightboxScrollLock();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      cancelScrollAnimation();
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (overlayContentIdleTimerRef.current) {
        clearTimeout(overlayContentIdleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hideOverlayContentOnIdle) {
      setOverlayContentVisible(true);
      return;
    }
    resetOverlayContentIdleTimer();
    const dismissArea = dismissAreaRef.current;
    if (!dismissArea) return;
    const onPointerActivity = () => resetOverlayContentIdleTimer();
    dismissArea.addEventListener('pointermove', onPointerActivity);
    dismissArea.addEventListener('pointerdown', onPointerActivity);
    return () => {
      dismissArea.removeEventListener('pointermove', onPointerActivity);
      dismissArea.removeEventListener('pointerdown', onPointerActivity);
      if (overlayContentIdleTimerRef.current) {
        clearTimeout(overlayContentIdleTimerRef.current);
      }
    };
  }, [hideOverlayContentOnIdle, resetOverlayContentIdleTimer]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  useLayoutEffect(() => {
    measureSetWidth();
    scrollToIndex(activeIndexRef.current, 'auto');
  }, [imageGap]);

  useLayoutEffect(() => {
    measureSetWidth();
    scrollToIndex(0, 'auto');
  }, [images.length, isLoopEnabled]);

  useEffect(() => {
    if (!isEditMode) return;
    const strip = stripRef.current;
    if (!strip) return;
    const preventScroll = (event: Event) => {
      event.preventDefault();
    };
    strip.addEventListener('wheel', preventScroll, { passive: false });
    strip.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      strip.removeEventListener('wheel', preventScroll);
      strip.removeEventListener('touchmove', preventScroll);
    };
  }, [isEditMode]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onScroll = () => {
      normalizeInfiniteScroll();
      updateActiveIndex();
    };
    strip.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(() => {
      measureSetWidth();
      normalizeInfiniteScroll();
      updateActiveIndex();
    });
    observer.observe(strip);
    return () => {
      cancelScrollAnimation();
      strip.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [images.length, isLoopEnabled]);

  return (
    <div
      data-selection="none"
      className={`${P}-lightbox${isEditor ? ` ${P}-lightbox-editor` : ''}${isEditMode ? ` ${P}-lightbox-edit-mode` : ''}`}
      onClick={() => {
        if (isSwipeDragging) return;
        handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${LIGHTBOX_ANIM_MS}ms ease`,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor, ...swipeBackdropStyle }} />
      <div
        ref={dismissAreaRef}
        className={`${P}-lightbox-dismiss-area`}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          ...dismissAreaStyle,
        }}
        {...swipeHandlers}
      >
        <div
          className={`${P}-lightbox-content`}
          style={mediaAreaStyle}
          onClick={(event) => event.stopPropagation()}
        >
        <div
          ref={stripRef}
          className={`${P}-lightbox-strip`}
          data-lightbox-scrollable=""
          data-mouse-draggable={allowMouseDrag && images.length > 0 ? 'true' : 'false'}
          data-mouse-dragging={isMouseDragging ? 'true' : 'false'}
          onPointerDown={onStripPointerDown}
          onPointerMove={onStripPointerMove}
          onPointerUp={endStripMouseDrag}
          onPointerCancel={endStripMouseDrag}
        >
          <div
            ref={trackRef}
            className={`${P}-lightbox-strip-track`}
            style={{ gap: imageGap }}
          >
          {flatItems.map((item, flatIndex) => {
            const itemObjectFit = item.image.objectFit ?? 'contain';
            const sourceIndex = flatIndex % images.length;
            const copyIndex = Math.floor(flatIndex / images.length);
            const imageGapControlSize = getGapControlSize(imageGap);
            const imageGapControlRight = `calc(-0.5 * (${imageGapControlSize} + ${imageGap}))`;
            return (
              <div
                key={`${copyIndex}-${item.image.url}-${sourceIndex}`}
                ref={(element) => itemRefs.current[flatIndex] = element}
                className={`${P}-strip-item`}
                style={{ height: '100%'}}
              >
                <img
                  src={item.image.url}
                  draggable={false}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: '100%',
                    objectFit: itemObjectFit,
                  }}
                />
                {showControls && sourceIndex < images.length - 1 && (
                  <div
                    data-controls="imageGap"
                    data-controls-axis="x"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: imageGapControlRight,
                      width: imageGapControlSize,
                      height: '100%',
                      pointerEvents: 'auto',
                      zIndex: 3,
                    }}
                  />
                )}
              </div>
            );
          })}
          </div>
        </div>
        </div>
        <div
          className={`${P}-lightbox-content-inner`}
          data-overlay-content-hidden={isOverlayContentHidden ? 'true' : 'false'}
          style={{
            width: '100%',
            height: '100%',
            top: 0,
            bottom: 0,
            ...swipeOverlayContentStyle,
          }}
        >
          <div
            data-controls={showControls ? 'contentMarginTop' : undefined}
            data-controls-static-handle={showControls ? '' : undefined}
            className={showControls ? `${P}-control` : undefined}
            style={{ height: contentMarginTop, width: '100%', pointerEvents: showControls ? 'auto' : 'none' }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
            }}
          >
            <div
              data-controls={showControls ? 'contentMarginLeft' : undefined}
              data-controls-axis={showControls ? 'x' : undefined}
              className={showControls ? `${P}-control` : undefined}
              style={{ width: contentMarginLeft, flexShrink: 0 }}
            />
            <div className={`${P}-lightbox-content-area`}>
              {hasTitles && (
                <div className={`${P}-titles-row`}>
                  {renderTitles()}
                  {showControls && titleSlots.length > 0 ? renderTitleWidthControls() : null}
                </div>
              )}
              {closeIcon && (
                <div
                  className={`${P}-close-icon`}
                  data-overlay-content-hidden={isOverlayContentHidden ? 'true' : 'false'}
                  style={{
                    width: scalingValue(closeIconMaxWidth ?? 0, isEditor),
                    height: scalingValue(closeIconMaxWidth ?? 0, isEditor),
                    ['--close-icon-hover-color' as string]: closeIconHoverColor,
                  }}
                >
                  <button
                    type="button"
                    className={`${P}-close-icon-inner`}
                    onClick={handleClose}
                    aria-label="Close"
                  >
                    <SvgImage url={closeIcon} fill={closeIconColor} hoverFill={closeIconHoverColor} className={`${P}-close-icon-img`}/>
                  </button>
                </div>
              )}
            </div>
            <div
              data-controls={showControls ? 'contentMarginRight' : undefined}
              data-controls-axis={showControls ? 'x' : undefined}
              data-controls-reverse={showControls ? '' : undefined}
              className={showControls ? `${P}-control` : undefined}
              style={{ width: contentMarginRight, flexShrink: 0, pointerEvents: showControls ? 'auto' : 'none' }}
            />
          </div>
        </div>
        {images.length > 1 && thumbnailVisibility === 'on' && (() => {
          const thumbnailMarginBottomControlSize = getGapControlSize(thumbnailMarginBottom);
          const thumbnailMarginBottomControlBottom = `calc(-0.5 * (${thumbnailMarginBottom} + ${thumbnailMarginBottomControlSize}))`;
          return (
            <div
              className={`${P}-thumbnails`}
              data-lightbox-scrollable=""
              data-thumbnail-active={thumbnailActive}
              data-overlay-content-hidden={isOverlayContentHidden ? 'true' : 'false'}
              onClick={(event) => event.stopPropagation()}
              style={{
                gap: thumbnailGap,
                bottom: thumbnailMarginBottom,
                '--thumbnail-active-color': thumbnailActiveColor,
                ...swipeOverlayContentStyle,
              } as React.CSSProperties}
            >
              {images.map((item, index) => {
                const thumbnailGapControlSize = getGapControlSize(thumbnailGap);
                const thumbnailGapControlRight = `calc(-0.5 * (${thumbnailGapControlSize} + ${thumbnailGap}))`;
                return (
                <div key={`thumb-${item.image.url}-${index}`} style={{ position: 'relative', flex: '0 0 auto' }}>
                  <button
                    type="button"
                    className={`${P}-thumb`}
                    data-active={activeIndex === index ? 'true' : 'false'}
                    onClick={() => allowImageScroll && thumbnailTrigger === 'click' && scrollToIndex(index)}
                    onMouseEnter={() => allowThumbnailHover && thumbnailTrigger === 'hover' && scrollToIndex(index)}
                    aria-label={item.image.name ? `View ${item.image.name}` : `View image ${index + 1}`}
                    aria-current={activeIndex === index ? 'true' : undefined}
                  >
                    <img
                      className={`${P}-thumb-image${isThumbCover ? ` ${P}-thumb-image-cover` : ''}`}
                      src={item.image.url}
                      alt=""
                      draggable={false}
                      style={
                        {...thumbAspectRatioStyle,
                        ...(thumbnailObjectFit.display === 'Cover' ? { width: THUMB_MAX_SIZE_PX } : { width: '100%' }),}
                      }
                    />
                  </button>
                  {showControls && index < images.length - 1 && (
                    <div
                      data-controls="thumbnailGap"
                      data-controls-axis="x"
                      
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: thumbnailGapControlRight,
                        width: thumbnailGapControlSize,
                        height: '100%',
                        pointerEvents: 'auto',
                        zIndex: 3,
                      }}
                    />
                  )}
                </div>
              );
              })}
              {showControls && (
                <div
                  data-controls="thumbnailMarginBottom"
                  data-controls-axis="y"
                  data-controls-reverse={showControls ? '' : undefined}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: thumbnailMarginBottomControlBottom,
                    height: thumbnailMarginBottomControlSize,
                    pointerEvents: 'auto',
                    zIndex: 3,
                  }}
                />
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

type LightboxStripProps = {
  settings: LightboxStripSettings;
  content?: LightboxStripItem[];
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  portalId?: string;
} & CommonComponentProps;

export const LightboxStrip = ({ settings, content, isEditor, isEditMode, isPreviewMode, portalId }: LightboxStripProps) => {
  const { prefix: P } = useScopedStyles();
  const { 
    cover,
    coverFit,
    backgroundColor,
    thumbnailVisibility,
    thumbnailObjectFit,
    thumbnailTrigger,
    thumbnailActive,
    thumbnailActiveColor,
    thumbnailGap,
    thumbnailMarginBottom,
    imageGap,
    title1Width,
    title2Width,
    title3Width,
    title2MarginLeft,
    title3MarginLeft,
    closeIcon,
    closeIconMaxWidth,
    closeIconColor,
    closeIconHoverColor, 
    contentMarginTop,
    contentMarginLeft,
    contentMarginRight
  } = settings;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const items = content ?? [];
  const { title1, title2, title3 } = resolveSharedStripTitles(items);
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const title1Style = stripTextFieldsToCss('title1', resolveStripTextFields(settings, 'title1'), isEditor);
  const title2Style = stripTextFieldsToCss('title2', resolveStripTextFields(settings, 'title2'), isEditor);
  const title3Style = stripTextFieldsToCss('title3', resolveStripTextFields(settings, 'title3'), isEditor);

  const openLightbox = () => {
    if (isEditMode || items.length === 0) return;
    if (isEditor && !isPreviewMode) return;
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <>
      <div ref={wrapperRef} className={`${P}-wrapper`}>
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        {cover ? (
          <button
            type="button"
            className={`${P}-cover ${isImageRatioCover(coverFit) ? `${P}-ratio-wrapper-cover` : `${P}-ratio-wrapper-fit`}`}
            onClick={openLightbox}
            style={{
              display: 'block',
              padding: 0,
              border: 'none',
              background: 'transparent',
              ...(isImageRatioCover(coverFit)
                ? ({ '--image-aspect-ratio': getAspectRatio(coverFit) } as React.CSSProperties)
                : {}),
            }}
            aria-label='Open image gallery'
          >
            <img
              className={`${P}-cover-image ${isImageRatioCover(coverFit) ? `${P}-cover-image-cover` : `${P}-cover-image-fit`}`}
              src={cover}
              alt='cover'
            />
          </button>
        ) : null}
      </div>

      {lightboxOpen && typeof document !== 'undefined' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <LightboxOverlay
            prefix={P}
            images={items}
            backgroundColor={backgroundColor}
            thumbnailGap={scaled(thumbnailGap)}
            thumbnailMarginBottom={scaled(thumbnailMarginBottom ?? 0.02)}
            imageGap={scaled(imageGap ?? 0)}
            thumbnailVisibility={thumbnailVisibility}
            thumbnailObjectFit={thumbnailObjectFit}
            thumbnailTrigger={thumbnailTrigger}
            thumbnailActive={thumbnailActive}
            thumbnailActiveColor={thumbnailActiveColor}
            title1Width={title1Width}
            title2Width={title2Width}
            title3Width={title3Width}
            title2MarginLeft={title2MarginLeft ?? 0}
            title3MarginLeft={title3MarginLeft ?? 0}
            title1={title1}
            title2={title2}
            title3={title3}
            title1Style={title1Style}
            title2Style={title2Style}
            title3Style={title3Style}
            contentMarginTop={scaled(contentMarginTop ?? 0)}
            contentMarginLeft={scaled(contentMarginLeft ?? 0)}
            contentMarginRight={scaled(contentMarginRight ?? 0)}
            closeIcon={closeIcon}
            closeIconMaxWidth={closeIconMaxWidth}
            closeIconColor={closeIconColor}
            closeIconHoverColor={closeIconHoverColor}
            isEditor={isEditor}
            isEditMode={isEditMode}
            isPreviewMode={isPreviewMode}
            onClose={closeLightbox}
          />,
          portalTarget,
        );
      })()}
    </>
  );
};
