import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { LayoutItem, LayoutTab } from '../../types/SchemaV1';

const LIGHTBOX_ANIM_MS = 300;
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

.${P}-cover-image {
  display: block;
  width: 100%;
  height: 100%;
}

.${P}-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9997;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  max-width: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  box-sizing: border-box;
  touch-action: pan-x;
  scrollbar-width: none;
}

.${P}-lightbox-strip[data-mouse-dragging="true"] {
  scroll-snap-type: none;
}

.${P}-lightbox-content[data-mouse-dragging="true"] {
  cursor: grabbing;
  user-select: none;
}

.${P}-lightbox-content[data-mouse-draggable="true"] {
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

.${P}-thumbnails[data-chrome-hidden="true"] {
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

.${P}-thumbnails[data-thumbnail-active="invert"] .${P}-thumb[data-active="true"] .${P}-thumb-image {
  filter: invert(1);
}

.${P}-thumbnails[data-thumbnail-active="grayscale"] .${P}-thumb:not([data-active="true"]) .${P}-thumb-image {
  filter: grayscale(1);
}

.${P}-thumbnails[data-thumbnail-active="scale-up"] .${P}-thumb[data-active="true"] {
  transform: scale(1.15);
}

.${P}-thumbnails[data-thumbnail-active="opacity"] .${P}-thumb:not([data-active="true"]) {
  opacity: 0.5;
}

.${P}-thumb-image {
  display: block;
  width: ${THUMB_MAX_SIZE_PX}px;
  height: ${THUMB_MAX_SIZE_PX}px;
  transition: filter 0.2s ease;
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

.${P}-close-icon[data-chrome-hidden="true"] {
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
  align-items: center;
}

.${P}-title-cell {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
}

.${P}-title1,
.${P}-title2,
.${P}-title3 {
  margin: 0;
  flex-shrink: 1;
  min-width: 0;
}
.${P}-lightbox-content-inner {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.${P}-lightbox-content-area {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.${P}-lightbox-chrome-bar {
  box-sizing: border-box;
  width: 100%;
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
  pointer-events: auto;
  z-index: 10;
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
  coverFit: 'cover' | 'fit';
  type: 'A' | 'B';
  backgroundColor: string;
  contentBackgroundColor?: string;
  thumbnailVisibility: 'on' | 'off';
  thumbnailObjectFit: 'cover' | 'contain';
  thumbnailTrigger: 'click' | 'hover';
  thumbnailActive: 'invert' | 'grayscale' | 'scale-up' | 'opacity';
  thumbnailGap: number;
  thumbnailMarginBottom?: number;
  imageGap?: number;
  textMaxWidth: number;
  title1Gap?: number;
  title2Gap?: number;
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
  type: 'A' | 'B';
  images: LightboxStripItem[];
  backgroundColor: string;
  thumbnailGap: string;
  thumbnailMarginBottom: string;
  contentBackgroundColor?: string;
  imageGap: string;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
  thumbnailVisibility: 'on' | 'off';
  thumbnailObjectFit: 'cover' | 'contain';
  thumbnailTrigger: 'click' | 'hover';
  thumbnailActive: 'invert' | 'grayscale' | 'scale-up' | 'opacity';
  textMaxWidth: string;
  title1Gap: string;
  title2Gap: string;
  title1: string;
  title2: string;
  title3: string;
  title1Style: React.CSSProperties;
  title2Style: React.CSSProperties;
  title3Style: React.CSSProperties;
  contentMarginTop: string;
  contentMarginLeft: string;
  contentMarginRight: string;
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
  type,
  backgroundColor,
  contentBackgroundColor,
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
  textMaxWidth,
  title1Gap,
  title2Gap,
  title1,
  title2,
  title3,
  title1Style,
  title2Style,
  title3Style,
  contentMarginTop,
  contentMarginLeft,
  contentMarginRight,
  onClose,
}: LightboxOverlayProps) => {
  const showControls = Boolean(isEditMode);
  const hideChromeOnIdle = !isEditMode;
  const allowImageScroll = !isEditMode && (!isEditor || Boolean(isPreviewMode));
  const allowMouseDrag = allowImageScroll;
  const allowThumbnailHover = allowImageScroll;

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

  const renderTitles = (showGapControls = false) => {
    type TitleSlot = {
      className: string;
      style: React.CSSProperties;
      text: string;
      gapKey?: 'title1Gap' | 'title2Gap';
      gap?: string;
    };

    const slots: TitleSlot[] = [];
    if (title1) {
      slots.push({ className: `${P}-title1`, style: title1Style, text: title1, gapKey: 'title1Gap', gap: title1Gap });
    }
    if (title2) {
      slots.push({ className: `${P}-title2`, style: title2Style, text: title2, gapKey: 'title2Gap', gap: title2Gap });
    }
    if (title3) {
      slots.push({ className: `${P}-title3`, style: title3Style, text: title3 });
    }

    return slots.map((slot, index) => (
      <div
        key={slot.className}
        className={`${P}-title-cell`}
        style={index < slots.length - 1 && slot.gap ? { marginRight: slot.gap } : undefined}
      >
        <p className={slot.className} style={{ ...slot.style, maxWidth: textMaxWidth }}>{slot.text}</p>
        {showGapControls && showControls && slot.gapKey && slot.gap && index < slots.length - 1
          ? renderGapControl(slot.gapKey, slot.gap)
          : null}
      </div>
    ));
  };
  const contentRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setWidthRef = useRef(0);
  const mouseDragRef = useRef({
    isActive: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });
  const isLoopEnabled = images.length > 1;
  const loopCopies = isLoopEnabled ? LOOP_COPIES : 1;
  const flatItems = useMemo(
    () => Array.from({ length: loopCopies }, () => images).flat(),
    [images, loopCopies],
  );
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const lockedActiveIndexRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chromeIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetChromeIdleTimer = useCallback(() => {
    if (!hideChromeOnIdle) return;
    setChromeVisible(true);
    if (chromeIdleTimerRef.current) {
      clearTimeout(chromeIdleTimerRef.current);
    }
    chromeIdleTimerRef.current = setTimeout(() => {
      if (mouseDragRef.current.isActive) return;
      setChromeVisible(false);
    }, CONTROLS_IDLE_MS);
  }, [hideChromeOnIdle]);

  const handleClose = useCallback(() => {
    if (isEditMode || isClosingRef.current) return;
    isClosingRef.current = true;
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, LIGHTBOX_ANIM_MS);
  }, [isEditMode, onClose]);

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
    updateActiveIndex();
  };

  const snapToNearestItem = (behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    if (!strip || images.length === 0) return;
    const flatIndex = getNearestFlatIndex();
    const item = itemRefs.current[flatIndex];
    if (!item) return;
    strip.scrollTo({
      left: item.offsetLeft,
      behavior,
    });
    setActiveIndex(flatIndex % images.length);
  };

  const setStripSnapEnabled = (enabled: boolean) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.style.scrollSnapType = enabled ? '' : 'none';
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

    strip.scrollTo({
      left: targetItem.offsetLeft,
      behavior,
    });
    setActiveIndex(targetFlatIndex % images.length);
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
    strip.scrollTo({
      left: item.offsetLeft,
      behavior,
    });
  };

  const isDragBlockedTarget = (target: HTMLElement) => (
    target.closest('[data-controls]')
    || target.closest(`.${P}-thumbnails`)
    || target.closest(`.${P}-close-icon`)
  );

  const onContentPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (isDragBlockedTarget(event.target as HTMLElement)) return;
    const strip = stripRef.current;
    const content = contentRef.current;
    if (!strip || !content) return;
    mouseDragRef.current = {
      isActive: true,
      startX: event.clientX,
      scrollLeft: strip.scrollLeft,
      hasMoved: false,
    };
    setStripSnapEnabled(false);
    resetChromeIdleTimer();
    content.setPointerCapture(event.pointerId);
  };

  const onContentPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
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
      resetChromeIdleTimer();
    }
  };

  const endContentMouseDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    const strip = stripRef.current;
    const content = contentRef.current;
    if (!strip || !content) return;
    const hadMoved = mouseDragRef.current.hasMoved;
    const startScrollLeft = mouseDragRef.current.scrollLeft;
    mouseDragRef.current.isActive = false;
    setIsMouseDragging(false);
    if (content.hasPointerCapture(event.pointerId)) {
      content.releasePointerCapture(event.pointerId);
    }
    normalizeInfiniteScroll();
    setStripSnapEnabled(true);
    if (hadMoved) {
      snapAfterDrag(startScrollLeft);
    } else {
      updateActiveIndex();
    }
    resetChromeIdleTimer();
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (chromeIdleTimerRef.current) {
        clearTimeout(chromeIdleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hideChromeOnIdle) {
      setChromeVisible(true);
      return;
    }
    resetChromeIdleTimer();
    const content = contentRef.current;
    if (!content) return;
    const onPointerActivity = () => resetChromeIdleTimer();
    content.addEventListener('pointermove', onPointerActivity);
    content.addEventListener('pointerdown', onPointerActivity);
    return () => {
      content.removeEventListener('pointermove', onPointerActivity);
      content.removeEventListener('pointerdown', onPointerActivity);
      if (chromeIdleTimerRef.current) {
        clearTimeout(chromeIdleTimerRef.current);
      }
    };
  }, [hideChromeOnIdle, resetChromeIdleTimer]);

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
    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      normalizeInfiniteScroll();
      updateActiveIndex();
      if (lockedActiveIndexRef.current !== null) {
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
          if (lockedActiveIndexRef.current !== null) {
            releaseActiveIndexLock();
          }
        }, 150);
      }
    };
    const onScrollEnd = () => {
      if (lockedActiveIndexRef.current !== null) {
        if (scrollEndTimer) {
          clearTimeout(scrollEndTimer);
          scrollEndTimer = null;
        }
        releaseActiveIndexLock();
      }
    };
    strip.addEventListener('scroll', onScroll, { passive: true });
    strip.addEventListener('scrollend', onScrollEnd);
    const observer = new ResizeObserver(() => {
      measureSetWidth();
      normalizeInfiniteScroll();
      updateActiveIndex();
    });
    observer.observe(strip);
    return () => {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      strip.removeEventListener('scroll', onScroll);
      strip.removeEventListener('scrollend', onScrollEnd);
      observer.disconnect();
    };
  }, [images.length, isLoopEnabled]);

  return (
    <div
      data-selection="none"
      className={`${P}-lightbox${isEditor ? ` ${P}-lightbox-editor` : ''}${isEditMode ? ` ${P}-lightbox-edit-mode` : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${LIGHTBOX_ANIM_MS}ms ease`,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor }} />
      <div
        ref={contentRef}
        className={`${P}-lightbox-content`}
        data-mouse-draggable={allowMouseDrag && images.length > 0 ? 'true' : 'false'}
        data-mouse-dragging={isMouseDragging ? 'true' : 'false'}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={allowMouseDrag ? onContentPointerDown : undefined}
        onPointerMove={allowMouseDrag ? onContentPointerMove : undefined}
        onPointerUp={allowMouseDrag ? endContentMouseDrag : undefined}
        onPointerCancel={allowMouseDrag ? endContentMouseDrag : undefined}
      >
        <div
          ref={stripRef}
          className={`${P}-lightbox-strip`}
          style={{ gap: imageGap }}
          data-mouse-dragging={isMouseDragging ? 'true' : 'false'}
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
                    width: '100%',
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
        {images.length > 1 && thumbnailVisibility === 'on' && (() => {
          const thumbnailMarginBottomControlSize = getGapControlSize(thumbnailMarginBottom);
          const thumbnailMarginBottomControlBottom = `calc(-0.5 * (${thumbnailMarginBottom} + ${thumbnailMarginBottomControlSize}))`;
          return (
            <div
              className={`${P}-thumbnails`}
              data-thumbnail-active={thumbnailActive}
              data-chrome-hidden={hideChromeOnIdle && !chromeVisible ? 'true' : 'false'}
              style={{ gap: thumbnailGap, bottom: thumbnailMarginBottom }}
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
                      className={`${P}-thumb-image`}
                      src={item.image.url}
                      alt=""
                      draggable={false}
                      style={{ objectFit: thumbnailObjectFit === 'cover' ? 'cover' : 'contain' }}
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
        <div
          className={`${P}-lightbox-content-inner`}
          style={{
            width: '100%',
            height: type === 'A' ? '100%' : 'auto',
            top: 0,
            bottom: type === 'A' ? 0 : 'auto',
          }}
        >
          <div
            data-controls={showControls ? 'contentMarginTop' : undefined}
            className={showControls ? `${P}-control` : undefined}
            style={{ height: contentMarginTop, width: '100%', pointerEvents: showControls ? 'auto' : 'none' }}
          />
          <div
            className={type === 'B' ? `${P}-lightbox-chrome-bar` : undefined}
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              ...(type === 'B' ? { backgroundColor: contentBackgroundColor } : {}),
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
                  {renderTitles(true)}
                </div>
              )}
              {closeIcon && (
                <div
                  className={`${P}-close-icon`}
                  data-chrome-hidden={hideChromeOnIdle && !chromeVisible ? 'true' : 'false'}
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
    type,
    backgroundColor,
    contentBackgroundColor,
    thumbnailVisibility,
    thumbnailObjectFit,
    thumbnailTrigger,
    thumbnailActive,
    thumbnailGap,
    thumbnailMarginBottom,
    imageGap,
    textMaxWidth,
    title1Gap,
    title2Gap,
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
            className={`${P}-cover`}
            onClick={openLightbox}
            style={{display: 'block', padding: 0, border: 'none', background: 'transparent'}}
            aria-label='Open image gallery'
          >
            <img
              className={`${P}-cover-image`}
              src={cover}
              alt='cover'
              style={{ objectFit: coverFit === 'cover' ? 'cover' : 'contain' }}
            />
          </button>
        ) : null}
      </div>

      {lightboxOpen && typeof document !== 'undefined' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <LightboxOverlay
            prefix={P}
            type={type}
            images={items}
            backgroundColor={backgroundColor}
            contentBackgroundColor={contentBackgroundColor}
            thumbnailGap={scaled(thumbnailGap)}
            thumbnailMarginBottom={scaled(thumbnailMarginBottom ?? 0.02)}
            imageGap={scaled(imageGap ?? 0)}
            thumbnailVisibility={thumbnailVisibility}
            thumbnailObjectFit={thumbnailObjectFit}
            thumbnailTrigger={thumbnailTrigger}
            thumbnailActive={thumbnailActive}
            textMaxWidth={scaled(textMaxWidth)}
            title1Gap={scaled(title1Gap ?? 0)}
            title2Gap={scaled(title2Gap ?? 0)}
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
