import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { getAspectRatio, isImageRatioCover } from '../utils/imageFitStyles';
import { useLightboxSwipeDismiss } from '../utils/useLightboxSwipeDismiss';
import { useLightboxScrollLock } from '../utils/useLightboxScrollLock';
import { LayoutItem, LayoutTab } from '../../types/SchemaV1';

const LIGHTBOX_ANIM_MS = 300;
const TEXT_FADE_MS = 400;
const SLIDE_FADE_MS = 300;
const STRIP_NAV_SWIPE_MIN_PX = 50;
const STRIP_NAV_TAP_MAX_PX = 10;
const JOURNAL_URL_PARAM_PREFIX = 'cntrl-lightbox-journal';
const LEGACY_JOURNAL_URL_PARAM_KEY = JOURNAL_URL_PARAM_PREFIX;
const LEGACY_JOURNAL_URL_PARAM_PREFIX = `${JOURNAL_URL_PARAM_PREFIX}-`;

const getJournalUrlParamKey = (itemId: string) => `${JOURNAL_URL_PARAM_PREFIX}-${itemId}`;

const isJournalUrlParamKey = (key: string) =>
  key === LEGACY_JOURNAL_URL_PARAM_KEY || key.startsWith(LEGACY_JOURNAL_URL_PARAM_PREFIX);

const parseJournalSlideNumber = (value: string | null) => {
  if (!value) return null;
  const slideNumber = Number.parseInt(value, 10);
  if (Number.isFinite(slideNumber) && slideNumber >= 1) {
    return slideNumber;
  }
  return null;
};

const findJournalUrlSlideNumber = (itemId?: string | null): number | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (itemId) {
    const slideNumber = parseJournalSlideNumber(params.get(getJournalUrlParamKey(itemId)));
    if (slideNumber) return slideNumber;
  }
  const legacySlideNumber = parseJournalSlideNumber(params.get(LEGACY_JOURNAL_URL_PARAM_KEY));
  if (legacySlideNumber) return legacySlideNumber;
  for (const [key] of params) {
    if (!key.startsWith(LEGACY_JOURNAL_URL_PARAM_PREFIX)) continue;
    const suffix = key.slice(LEGACY_JOURNAL_URL_PARAM_PREFIX.length);
    if (!/^\d+$/.test(suffix)) continue;
    const slideNumber = Number.parseInt(suffix, 10);
    if (Number.isFinite(slideNumber) && slideNumber >= 1) {
      return slideNumber;
    }
  }
  return null;
};

const slideNumberToIndex = (slideNumber: number, slideCount: number) => {
  if (slideCount <= 0) return -1;
  const slideIndex = slideNumber - 1;
  if (slideIndex < 0 || slideIndex >= slideCount) return -1;
  return slideIndex;
};

const setJournalUrlParam = (slideNumber: number, itemId?: string | null, replace = true) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  [...url.searchParams.keys()].forEach((key) => {
    if (isJournalUrlParamKey(key)) {
      url.searchParams.delete(key);
    }
  });
  if (itemId) {
    url.searchParams.set(getJournalUrlParamKey(itemId), String(slideNumber));
  } else {
    url.searchParams.set(LEGACY_JOURNAL_URL_PARAM_KEY, String(slideNumber));
  }
  const historyMethod = replace ? 'replaceState' : 'pushState';
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history[historyMethod](window.history.state, '', nextUrl);
};

const clearJournalUrlParam = (itemId?: string | null) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const keysToDelete = [...url.searchParams.keys()].filter((key) => (
    itemId
      ? key === getJournalUrlParamKey(itemId) || key === LEGACY_JOURNAL_URL_PARAM_KEY
      : isJournalUrlParamKey(key)
  ));
  keysToDelete.forEach((key) => url.searchParams.delete(key));
  if (keysToDelete.length > 0) {
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }
};

const hasJournalUrlParam = (itemId?: string | null) => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (itemId) {
    return params.has(getJournalUrlParamKey(itemId));
  }
  return [...params.keys()].some((key) => isJournalUrlParamKey(key));
};

const removeJournalUrlParam = (didPushHistory: boolean, itemId?: string | null) => {
  if (!hasJournalUrlParam(itemId)) return;
  if (didPushHistory) {
    window.history.back();
    return;
  }
  clearJournalUrlParam(itemId);
};

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
  align-items: center;
  justify-content: center;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.${P}-lightbox-strip[data-desktop-nav="true"]::before,
.${P}-lightbox-strip[data-desktop-nav="true"]::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 2;
}

.${P}-lightbox-strip[data-desktop-nav="true"]::before {
  left: 0;
  cursor: w-resize;
}

.${P}-lightbox-strip[data-desktop-nav="true"]::after {
  right: 0;
  cursor: e-resize;
}

.${P}-slide-stack {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.${P}-slide-layer-out {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.${P}-slide-layer-in {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

@keyframes ${P}-slide-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ${P}-slide-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.${P}-slide-fade-in {
  opacity: 0;
  animation: ${P}-slide-fade-in ${SLIDE_FADE_MS}ms ease-in-out forwards;
}

.${P}-slide-fade-out {
  animation: ${P}-slide-fade-out ${SLIDE_FADE_MS}ms ease-in-out forwards;
}

.${P}-slide-area {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.${P}-slide-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.${P}-slide-image-cell {
  position: relative;
  min-width: 0;
  height: 100%;
}

.${P}-slide-image-cell-cover {
  aspect-ratio: var(--image-aspect-ratio);
  overflow: hidden;
  height: auto;
  width: 100%;
}

.${P}-slide-image {
  display: block;
}

.${P}-slide-image-cover {
  object-fit: cover;
  width: 100%;
  height: 100%;
  max-width: 100%;
}

.${P}-slide-image-fit {
  object-fit: contain;
  width: auto;
  height: auto;
  max-width: 100%;
}

.${P}-slide-image-custom {
  object-fit: var(--image-object-fit);
  max-width: 100%;
  height: 100%;
}

.${P}-close-icon {
  position: relative;
  flex-shrink: 0;
  pointer-events: auto;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  padding: 0;
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

.${P}-titles-row-two-row {
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
  align-self: stretch;
  flex-direction: column;
  width: 100%;
}

.${P}-titles-row-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
  margin-bottom: 0;
}

.${P}-titles-row-top .${P}-title-cell[data-title="title1"] {
  flex: 0 0 auto;
  min-width: 0;
}

.${P}-titles-row-top-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
}

.${P}-titles-row-bottom-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: auto;
  flex-shrink: 0;
}

.${P}-titles-row-bottom-area {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.${P}-titles-row-bottom {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  width: 100%;
}

.${P}-titles-row-bottom .${P}-title-cell {
  flex: 0 0 auto;
}

.${P}-title-cell {
  position: relative;
  flex: 0 0 auto;
  min-width: 0;
  box-sizing: border-box;
}

.${P}-text-bar-cell {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
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

.${P}-titles-stack {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-width: 0;
}

.${P}-titles-stack-stacked {
  flex-direction: column;
  align-items: stretch;
  height: 100%;
}

.${P}-titles-layer-out {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  z-index: 1;
}

.${P}-titles-layer-out-stacked {
  flex-direction: column;
  align-items: stretch;
}

.${P}-titles-layer-out-bottom {
  justify-content: flex-end;
}

.${P}-titles-layer-in {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-width: 0;
}

.${P}-titles-layer-in-stacked {
  flex-direction: column;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.${P}-titles-layer-in-fading {
  position: absolute;
  inset: 0;
  z-index: 0;
}

@keyframes ${P}-titles-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ${P}-titles-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.${P}-titles-fade-in {
  opacity: 0;
  animation: ${P}-titles-fade-in ${TEXT_FADE_MS}ms ease-in-out forwards;
}

.${P}-titles-fade-out {
  animation: ${P}-titles-fade-out ${TEXT_FADE_MS}ms ease-in-out forwards;
}

.${P}-lightbox-overlay-content {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  isolation: isolate;
}

.${P}-lightbox-persistent-controls {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  isolation: isolate;
}

.${P}-lightbox-content-area {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.${P}-lightbox-content-area-stacked {
  align-items: stretch;
  align-self: stretch;
}

.${P}-text-bar-cell-stacked {
  align-self: stretch;
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  align-items: stretch;
}

.${P}-entry-counter {
  position: relative;
  z-index: 2;
  pointer-events: none;
  white-space: nowrap;
  flex-shrink: 0;
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
`;
}

export type LightboxJournalImage = {
  url: string;
  name?: string;
  objectFit?: 'cover' | 'contain';
};

export type LightboxJournalItem = {
  title1: string;
  title2: string;
  title3: string;
  image: LightboxJournalImage[];
};

type JournalSlide = {
  entry: LightboxJournalItem;
  entryIndex: number;
  images: LightboxJournalImage[];
};

type LightboxOverlayProps = {
  prefix: string;
  entries: LightboxJournalItem[];
  settings: LightboxJournalSettings;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  initialSlideIndex?: number;
  enableUrlSync?: boolean;
  journalItemId?: string | null;
  onBeforeClose?: () => void;
  onClose: () => void;
};

const GAP_LABEL_AREA_PX = 20;
const MAX_IMAGES_PER_ENTRY = 2;

const getGapControlSize = (gap: string) => `max(${gap}, ${GAP_LABEL_AREA_PX}px)`;
const getEntryImages = (entry: LightboxJournalItem | undefined): LightboxJournalImage[] =>
  (entry?.image ?? []).slice(0, MAX_IMAGES_PER_ENTRY);
const getTotalImageCount = (entries: LightboxJournalItem[]) =>
  entries.reduce((sum, entry) => sum + getEntryImages(entry).length, 0);
const getEntryImageRange = (entries: LightboxJournalItem[], entryIndex: number) => {
  const start = entries.slice(0, entryIndex).reduce(
    (sum, entry) => sum + getEntryImages(entry).length,
    1,
  );
  const imageCount = getEntryImages(entries[entryIndex]).length;
  return { start, end: start + imageCount - 1 };
};
const formatImageCounter = (entries: LightboxJournalItem[], activeEntryIndex: number) => {
  const totalImages = getTotalImageCount(entries);
  const { start, end } = getEntryImageRange(entries, activeEntryIndex);
  if (start === end) {
    return `${start} / ${totalImages}`;
  }
  return `${start}-${end} / ${totalImages}`;
};
const buildJournalSlides = (entries: LightboxJournalItem[], journalType: 'A' | 'B'): JournalSlide[] => {
  if (journalType === 'B') {
    return entries.flatMap((entry, entryIndex) =>
      getEntryImages(entry).map((image) => ({
        entry,
        entryIndex,
        images: [image],
      })),
    );
  }
  return entries.map((entry, entryIndex) => ({
    entry,
    entryIndex,
    images: getEntryImages(entry),
  }));
};
const formatSlideCounter = (
  slides: JournalSlide[],
  activeSlideIndex: number,
  journalType: 'A' | 'B',
  entries: LightboxJournalItem[],
) => {
  if (journalType === 'B') {
    return `${activeSlideIndex + 1} / ${slides.length}`;
  }
  const activeEntryIndex = slides[activeSlideIndex]?.entryIndex ?? 0;
  return formatImageCounter(entries, activeEntryIndex);
};
const getEntryTitleKey = (entry: LightboxJournalItem | undefined) =>
  entry ? `${entry.title1 ?? ''}|${entry.title2 ?? ''}|${entry.title3 ?? ''}` : '';
const shouldShowCounter = (
  journalType: 'A' | 'B',
  slides: JournalSlide[],
  entries: LightboxJournalItem[],
) => (journalType === 'B' ? slides.length > 1 : getTotalImageCount(entries) > 1);

type JournalTitleWidthKey = 'title1Width' | 'title2Width' | 'title3Width';

const TITLE_RESIZE_HANDLE_WIDTH = 0.004;
const TITLE_PADDING_HANDLE_WIDTH = 0.004;

const DEFAULT_JOURNAL_TITLE_WIDTHS: Record<JournalTitleWidthKey, number> = {
  title1Width: 0.13,
  title2Width: 0.13,
  title3Width: 0.14,
};

type JournalTitleSlot = {
  prefix: 'title1' | 'title2' | 'title3';
  widthKey: JournalTitleWidthKey;
  marginLeftKey?: 'title2MarginLeft' | 'title3MarginLeft';
  className: string;
  style: React.CSSProperties;
  text: string;
};

function buildJournalTitleSlots(
  prefix: string,
  entry: LightboxJournalItem,
  title1Style: React.CSSProperties,
  title2Style: React.CSSProperties,
  title3Style: React.CSSProperties,
): JournalTitleSlot[] {
  const slots: JournalTitleSlot[] = [];

  if (entry.title1) {
    slots.push({
      prefix: 'title1',
      widthKey: 'title1Width',
      className: `${prefix}-title1`,
      style: title1Style,
      text: entry.title1,
    });
  }
  if (entry.title2) {
    slots.push({
      prefix: 'title2',
      widthKey: 'title2Width',
      marginLeftKey: 'title2MarginLeft',
      className: `${prefix}-title2`,
      style: title2Style,
      text: entry.title2,
    });
  }
  if (entry.title3) {
    slots.push({
      prefix: 'title3',
      widthKey: 'title3Width',
      marginLeftKey: 'title3MarginLeft',
      className: `${prefix}-title3`,
      style: title3Style,
      text: entry.title3,
    });
  }

  return slots;
}

function resolveJournalTitleWidths(
  count: number,
  storedWidths: number[],
): number[] {
  if (count <= 0) {
    return [];
  }
  const widths = storedWidths.slice(0, count);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  if (totalWidth <= 1) {
    return widths;
  }
  const { widths: shrunkWidths } = [...widths].reverse().reduce<{
    overflow: number;
    widths: number[];
  }>(
    ({ overflow, widths: acc }, width) => {
      if (overflow <= 0 || width <= 0) {
        return { overflow, widths: [width, ...acc] };
      }

      const shrinkAmount = Math.min(overflow, width);
      return {
        overflow: overflow - shrinkAmount,
        widths: [width - shrinkAmount, ...acc],
      };
    },
    { overflow: totalWidth - 1, widths: [] },
  );

  return shrunkWidths;
}

function getEffectiveJournalTitleWidths(
  count: number,
  storedWidths: number[],
): number[] {
  return resolveJournalTitleWidths(count, storedWidths);
}

function getJournalTitleMaxWidth(
  columnIndex: number,
  resolvedWidths: number[],
): number {
  const otherWidths = resolvedWidths
    .filter((_, index) => index !== columnIndex)
    .reduce((sum, width) => sum + width, 0);
  return Math.max(1 - otherWidths, 0);
}

function getRowScopedJournalTitleWidths(
  slots: JournalTitleSlot[],
  widthByKey: Record<JournalTitleWidthKey, number>,
): { resolved: number[]; effective: number[] } {
  const stored = slots.map((slot) => widthByKey[slot.widthKey] ?? 0);
  return {
    resolved: resolveJournalTitleWidths(slots.length, stored),
    effective: getEffectiveJournalTitleWidths(slots.length, stored),
  };
}

function getJournalTitleOffsetBeforeSlot(
  slots: JournalTitleSlot[],
  resolvedWidths: number[],
  marginByKey: Record<'title2MarginLeft' | 'title3MarginLeft', number>,
  slotIndex: number,
): number {
  return slots.slice(0, slotIndex).reduce(
    (offset, slot, index) => offset
      + (slot?.marginLeftKey ? marginByKey[slot.marginLeftKey] ?? 0 : 0)
      + (resolvedWidths[index] ?? 0),
    0,
  );
}

function getJournalTitleBoundaryOffset(
  slots: JournalTitleSlot[],
  resolvedWidths: number[],
  marginByKey: Record<'title2MarginLeft' | 'title3MarginLeft', number>,
  upToIndex: number,
): number {
  return slots.slice(0, upToIndex + 1).reduce(
    (offset, slot, index) => offset
      + (slot?.marginLeftKey ? marginByKey[slot.marginLeftKey] ?? 0 : 0)
      + (resolvedWidths[index] ?? 0),
    0,
  );
}

const LightboxOverlay = ({
  prefix: P,
  entries,
  settings,
  isEditor,
  isEditMode,
  isPreviewMode,
  initialSlideIndex = 0,
  enableUrlSync = false,
  journalItemId = null,
  onBeforeClose,
  onClose,
}: LightboxOverlayProps) => {
  const {
    type: journalType,
    coverFit,
    backgroundColor,
    imageGap: imageGapSetting,
    maxWidth,
    maxHeight,
    textTransition,
    title1Width,
    title2Width,
    title3Width,
    title1MarginLeft = 0,
    title2MarginLeft = 0,
    title3MarginLeft = 0,
    titleRowMarginBottom = 0,
    titleHeaderLayout = 'single-row',
    countCloseGap: countCloseGapSetting = 0,
    closeIcon,
    closeIconMaxWidth,
    closeIconColor,
    closeIconHoverColor,
    contentMarginTop: contentMarginTopSetting = 0,
    iconMarginRight: iconMarginRightSetting = 0,
  } = settings;

  const scaled = useCallback((value: number) => scalingValue(value, isEditor ?? false), [isEditor]);
  const imageGap = scaled(imageGapSetting ?? 0);
  const slideMaxWidth = `${maxWidth}%`;
  const slideMaxHeight = `${maxHeight}%`;
  const countCloseGap = scaled(countCloseGapSetting);
  const contentMarginTop = scaled(contentMarginTopSetting);
  const iconMarginRight = scaled(iconMarginRightSetting);
  const title1Style = journalTextFieldsToCss('title1', resolveJournalTextFields(settings, 'title1'), isEditor);
  const title2Style = journalTextFieldsToCss('title2', resolveJournalTextFields(settings, 'title2'), isEditor);
  const title3Style = journalTextFieldsToCss('title3', resolveJournalTextFields(settings, 'title3'), isEditor);
  const countStyle = journalTextFieldsToCss('count', resolveJournalTextFields(settings, 'count'), isEditor);

  const showControls = Boolean(isEditMode);
  const useTwoRowHeader = titleHeaderLayout === 'mobile';
  const allowDesktopNav = !isEditor || Boolean(isPreviewMode);
  const allowSwipeDismiss = !isEditMode && (!isEditor || Boolean(isPreviewMode));
  const slides = useMemo(() => buildJournalSlides(entries, journalType), [entries, journalType]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlideIndex);
  const activeSlide = slides[activeSlideIndex];
  const activeEntry = activeSlide?.entry;
  const [isVisible, setIsVisible] = useState(false);
  const [prevEntryIndex, setPrevEntryIndex] = useState<number | null>(null);
  const [isTitlesFading, setIsTitlesFading] = useState(false);
  const [prevSlideIndex, setPrevSlideIndex] = useState<number | null>(null);
  const [isSlideFading, setIsSlideFading] = useState(false);
  const [slideTransitionKey, setSlideTransitionKey] = useState(0);
  const [titlesStackMinHeight, setTitlesStackMinHeight] = useState<number | undefined>();
  const [titlesStackWidth, setTitlesStackWidth] = useState<number | undefined>();
  const [incomingMeasureEntry, setIncomingMeasureEntry] = useState<LightboxJournalItem | null>(null);
  const titlesFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideTransitionKeyRef = useRef(0);
  const prevEntryIndexRef = useRef(0);
  const prevSlideIndexRef = useRef(0);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titlesStackRef = useRef<HTMLDivElement>(null);
  const titlesMeasureRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const stripNavGestureRef = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
  } | null>(null);

  const getIncomingTitlesMeasureWidth = useCallback(() => {
    const stack = titlesStackRef.current;
    if (!stack) return undefined;
    const contentArea = stack.closest(`.${P}-lightbox-content-area`) as HTMLElement | null;
    if (!contentArea) return stack.getBoundingClientRect().width;
    const fixedSiblingsWidth = Array.from(contentArea.children).reduce((sum, child) => {
      if (!(child instanceof HTMLElement)) return sum;
      if (child.contains(stack)) return sum;
      return sum + child.getBoundingClientRect().width;
    }, 0);
    return contentArea.getBoundingClientRect().width - fixedSiblingsWidth;
  }, [P]);

  const clearTitlesFadeTimer = useCallback(() => {
    if (titlesFadeTimerRef.current) {
      clearTimeout(titlesFadeTimerRef.current);
      titlesFadeTimerRef.current = null;
    }
  }, []);

  const finishSlideTransition = useCallback((transitionKey: number) => {
    if (transitionKey !== slideTransitionKeyRef.current) return;
    setPrevSlideIndex(null);
    setIsSlideFading(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isEditMode || isClosingRef.current) return;
    isClosingRef.current = true;
    onBeforeClose?.();
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, LIGHTBOX_ANIM_MS);
  }, [isEditMode, onBeforeClose, onClose]);

  const isSwipeBlockedTarget = useCallback((target: HTMLElement) => Boolean(
    target.closest('[data-controls]')
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
    enabled: allowSwipeDismiss,
    onClose: handleClose,
    animMs: LIGHTBOX_ANIM_MS,
    isBlockedTarget: isSwipeBlockedTarget,
  });

  const syncUrlToSlide = useCallback((slideIndex: number) => {
    if (!enableUrlSync) return;
    setJournalUrlParam(slideIndex + 1, journalItemId, true);
  }, [enableUrlSync, journalItemId]);

  const goToSlide = useCallback((index: number) => {
    if (slides.length === 0) return;
    const normalizedIndex = ((index % slides.length) + slides.length) % slides.length;
    if (normalizedIndex === activeSlideIndex) return;
    const outgoingSlide = slides[activeSlideIndex];
    const incomingSlide = slides[normalizedIndex];
    slideTransitionKeyRef.current += 1;
    const transitionKey = slideTransitionKeyRef.current;
    const shouldFadeTitles = textTransition === 'fade' && getEntryTitleKey(outgoingSlide?.entry) !== getEntryTitleKey(incomingSlide?.entry);
    const measuredOutgoingTitlesHeight = titlesStackRef.current?.getBoundingClientRect().height;
    const titleFadeMeasure = shouldFadeTitles ? (() => {
      const incomingTitlesMeasureWidth = getIncomingTitlesMeasureWidth();
      flushSync(() => {
        setIncomingMeasureEntry(incomingSlide.entry);
      });
      if (titlesMeasureRef.current && incomingTitlesMeasureWidth) {
        titlesMeasureRef.current.style.width = `${incomingTitlesMeasureWidth}px`;
      }
      const measuredIncomingTitlesHeight = titlesMeasureRef.current?.getBoundingClientRect().height;
      if (titlesMeasureRef.current) {
        titlesMeasureRef.current.style.width = '';
      }
      return { measuredIncomingTitlesHeight, incomingTitlesMeasureWidth };
    })() : undefined;
    const lockedTitlesHeight = Math.max(
      measuredOutgoingTitlesHeight ?? 0,
      titleFadeMeasure?.measuredIncomingTitlesHeight ?? 0,
    ) || undefined;

    setSlideTransitionKey(transitionKey);
    setPrevSlideIndex(activeSlideIndex);
    setIsSlideFading(true);
    setActiveSlideIndex(normalizedIndex);
    syncUrlToSlide(normalizedIndex);
    prevSlideIndexRef.current = normalizedIndex;
    if (shouldFadeTitles) {
      clearTitlesFadeTimer();
      if (lockedTitlesHeight) {
        setTitlesStackMinHeight(lockedTitlesHeight);
      }
      if (titleFadeMeasure?.incomingTitlesMeasureWidth) {
        setTitlesStackWidth(titleFadeMeasure.incomingTitlesMeasureWidth);
      }
      setPrevEntryIndex(outgoingSlide?.entryIndex ?? null);
      setIsTitlesFading(true);
      prevEntryIndexRef.current = incomingSlide.entryIndex;
      titlesFadeTimerRef.current = setTimeout(() => {
        setPrevEntryIndex(null);
        setIsTitlesFading(false);
        setTitlesStackMinHeight(undefined);
        setTitlesStackWidth(undefined);
        setIncomingMeasureEntry(null);
        titlesFadeTimerRef.current = null;
      }, TEXT_FADE_MS);
    } else {
      clearTitlesFadeTimer();
      setPrevEntryIndex(null);
      setIsTitlesFading(false);
      setTitlesStackMinHeight(undefined);
      setTitlesStackWidth(undefined);
      setIncomingMeasureEntry(null);
      prevEntryIndexRef.current = incomingSlide.entryIndex;
    }
  }, [activeSlideIndex, clearTitlesFadeTimer, getIncomingTitlesMeasureWidth, slides, syncUrlToSlide, textTransition]);

  const resetStripNavGesture = useCallback(() => {
    stripNavGestureRef.current = null;
  }, []);

  const onStripPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowDesktopNav || slides.length <= 1) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-controls]')) return;

    stripNavGestureRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
    };
  }, [allowDesktopNav, slides.length]);

  const onStripPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowDesktopNav || slides.length <= 1) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (isSwipeDragging) {
      resetStripNavGesture();
      return;
    }
    const gesture = stripNavGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    resetStripNavGesture();
    const target = event.target as HTMLElement;
    if (target.closest('[data-controls]')) return;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX >= STRIP_NAV_SWIPE_MIN_PX && absX > absY) {
      goToSlide(deltaX > 0 ? activeSlideIndex - 1 : activeSlideIndex + 1);
      return;
    }
    if (absX > STRIP_NAV_TAP_MAX_PX || absY > STRIP_NAV_TAP_MAX_PX) return;
    const navRect = lightboxRef.current?.getBoundingClientRect();
    const midPoint = navRect
      ? navRect.left + navRect.width / 2
      : window.innerWidth / 2;
    goToSlide(event.clientX < midPoint ? activeSlideIndex - 1 : activeSlideIndex + 1);
  }, [activeSlideIndex, allowDesktopNav, goToSlide, isSwipeDragging, resetStripNavGesture, slides.length]);

  const onStripPointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = stripNavGestureRef.current;
    if (gesture?.pointerId === event.pointerId) {
      resetStripNavGesture();
    }
  }, [resetStripNavGesture]);

  useLightboxScrollLock();

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
      requestAnimationFrame(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else if (lightboxRef.current) {
          lightboxRef.current.focus();
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (titlesFadeTimerRef.current) {
        clearTimeout(titlesFadeTimerRef.current);
      }
      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    if (textTransition !== 'fade') {
      prevEntryIndexRef.current = slides[activeSlideIndex]?.entryIndex ?? 0;
      clearTitlesFadeTimer();
      setPrevEntryIndex(null);
      setIsTitlesFading(false);
      setTitlesStackMinHeight(undefined);
      setTitlesStackWidth(undefined);
    }
  }, [activeSlideIndex, clearTitlesFadeTimer, slides, textTransition]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }
      if (event.key === 'ArrowLeft' && slides.length > 1) {
        goToSlide(activeSlideIndex - 1);
        return;
      }
      if (event.key === 'ArrowRight' && slides.length > 1) {
        goToSlide(activeSlideIndex + 1);
        return;
      }
      if (event.key === 'Tab' && lightboxRef.current) {
        const focusable = lightboxRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const focusableItems = Array.from(focusable).filter(
          (element) => !element.closest('[aria-hidden="true"]'),
        );
        if (focusableItems.length === 0) return;
        const first = focusableItems[0];
        const last = focusableItems[focusableItems.length - 1];
        const activeElement = document.activeElement;
        if (event.shiftKey) {
          if (activeElement === first || !lightboxRef.current.contains(activeElement)) {
            event.preventDefault();
            last.focus();
          }
        } else if (activeElement === last || !lightboxRef.current.contains(activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToSlide, handleClose, activeSlideIndex, slides.length]);

  useLayoutEffect(() => {
    clearTitlesFadeTimer();
    slideTransitionKeyRef.current = 0;
    setSlideTransitionKey(0);
    setPrevSlideIndex(null);
    setIsSlideFading(false);
    setPrevEntryIndex(null);
    setIsTitlesFading(false);
    setTitlesStackMinHeight(undefined);
    setTitlesStackWidth(undefined);
    setIncomingMeasureEntry(null);
    setActiveSlideIndex((current) => {
      const maxIndex = Math.max(0, slides.length - 1);
      return Math.min(current, maxIndex);
    });
  }, [clearTitlesFadeTimer, entries.length, journalType, slides.length]);

  useLayoutEffect(() => {
    prevSlideIndexRef.current = initialSlideIndex;
    prevEntryIndexRef.current = slides[initialSlideIndex]?.entryIndex ?? 0;
    setActiveSlideIndex(initialSlideIndex);
  }, [initialSlideIndex, slides.length]);

  const outgoingEntry = prevEntryIndex !== null ? entries[prevEntryIndex] : null;
  const outgoingSlide = prevSlideIndex !== null ? slides[prevSlideIndex] : null;
  const hasTitles =  activeEntry?.title1 || activeEntry?.title2 || activeEntry?.title3 || outgoingEntry?.title1 || outgoingEntry?.title2 || outgoingEntry?.title3;
  const hasCounter = shouldShowCounter(journalType, slides, entries);
  const hasCloseIcon = closeIcon !== null;
  const hasHeaderContent = hasTitles || hasCounter || hasCloseIcon;
  const persistentControlsGapStyle = hasCounter && hasCloseIcon ? { gap: countCloseGap } : undefined;
  const titlesStackClassName = `${P}-titles-stack${useTwoRowHeader ? ` ${P}-titles-stack-stacked` : ''}`;
  const titlesLayerOutClassName = `${P}-titles-layer-out${useTwoRowHeader ? ` ${P}-titles-layer-out-stacked` : ''}`;
  const titleRowMarginBottomScaled = scaled(titleRowMarginBottom);
  const titleWidthByKey = useMemo(
    () => ({
      title1Width: title1Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title1Width,
      title2Width: title2Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title2Width,
      title3Width: title3Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title3Width,
    }),
    [title1Width, title2Width, title3Width],
  );
  const titleMarginLeftByKey = useMemo(
    () => ({
      title2MarginLeft,
      title3MarginLeft,
    }),
    [title2MarginLeft, title3MarginLeft],
  );
  const activeTitleSlots = useMemo(
    () => (activeEntry
      ? buildJournalTitleSlots(P, activeEntry, title1Style, title2Style, title3Style)
      : []),
    [P, activeEntry, title1Style, title2Style, title3Style],
  );
  const storedTitleWidths = useMemo(
    () => activeTitleSlots.map((slot) => titleWidthByKey[slot.widthKey]),
    [activeTitleSlots, titleWidthByKey],
  );
  const resolvedTitleWidths = useMemo(
    () => resolveJournalTitleWidths(activeTitleSlots.length, storedTitleWidths),
    [activeTitleSlots.length, storedTitleWidths],
  );
  const effectiveTitleWidths = useMemo(
    () => getEffectiveJournalTitleWidths(activeTitleSlots.length, storedTitleWidths),
    [activeTitleSlots.length, storedTitleWidths],
  );
  const topRowTitleSlots = useMemo(
    () => activeTitleSlots.filter((slot) => slot.prefix === 'title1'),
    [activeTitleSlots],
  );
  const bottomRowTitleSlots = useMemo(
    () => activeTitleSlots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3'),
    [activeTitleSlots],
  );
  const topRowTitleWidths = useMemo(
    () => getRowScopedJournalTitleWidths(topRowTitleSlots, titleWidthByKey),
    [topRowTitleSlots, titleWidthByKey],
  );
  const bottomRowTitleWidths = useMemo(
    () => getRowScopedJournalTitleWidths(bottomRowTitleSlots, titleWidthByKey),
    [bottomRowTitleSlots, titleWidthByKey],
  );
  const getSlotTitleWidthContext = useCallback((
    slot: JournalTitleSlot,
    rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom',
  ) => {
    const fullIndex = activeTitleSlots.findIndex((s) => s.prefix === slot.prefix);
    if (!useTwoRowHeader || rowLayout === 'single-row') {
      return {
        effectiveWidth: effectiveTitleWidths[fullIndex] ?? 0,
        resolvedWidth: resolvedTitleWidths[fullIndex] ?? 0,
        maxWidth: getJournalTitleMaxWidth(fullIndex, resolvedTitleWidths),
      };
    }
    if (rowLayout === 'two-row-top') {
      const topIndex = topRowTitleSlots.findIndex((s) => s.prefix === slot.prefix);
      return {
        effectiveWidth: topRowTitleWidths.effective[topIndex] ?? 0,
        resolvedWidth: topRowTitleWidths.resolved[topIndex] ?? 0,
        maxWidth: getJournalTitleMaxWidth(topIndex, topRowTitleWidths.resolved),
      };
    }
    const bottomIndex = bottomRowTitleSlots.findIndex((s) => s.prefix === slot.prefix);
    return {
      effectiveWidth: bottomRowTitleWidths.effective[bottomIndex] ?? 0,
      resolvedWidth: bottomRowTitleWidths.resolved[bottomIndex] ?? 0,
      maxWidth: getJournalTitleMaxWidth(bottomIndex, bottomRowTitleWidths.resolved),
    };
  }, [
    activeTitleSlots,
    bottomRowTitleSlots,
    bottomRowTitleWidths,
    effectiveTitleWidths,
    resolvedTitleWidths,
    topRowTitleSlots,
    topRowTitleWidths,
    useTwoRowHeader,
  ]);
  const getTitleBoundaryOffset = useCallback(
    (upToIndex: number) => getJournalTitleBoundaryOffset(
      activeTitleSlots,
      resolvedTitleWidths,
      titleMarginLeftByKey,
      upToIndex,
    ) + (!useTwoRowHeader ? title1MarginLeft ?? 0 : 0),
    [activeTitleSlots, resolvedTitleWidths, titleMarginLeftByKey, useTwoRowHeader, title1MarginLeft],
  );
  const getSingleRowMarginColumnOffset = useCallback(
    () => (!useTwoRowHeader ? title1MarginLeft ?? 0 : 0),
    [useTwoRowHeader, title1MarginLeft],
  );
  const getBottomRowOffsetBeforeSlot = useCallback(
    (upToBottomIndex: number) => bottomRowTitleSlots.slice(0, upToBottomIndex).reduce(
      (offset, slot, index) => offset
        + (slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0)
        + (bottomRowTitleWidths.resolved[index] ?? 0),
      0,
    ),
    [bottomRowTitleSlots, bottomRowTitleWidths.resolved, titleMarginLeftByKey],
  );
  const getBottomRowBoundaryOffset = useCallback(
    (bottomIndex: number) => {
      const slot = bottomRowTitleSlots[bottomIndex];
      return getBottomRowOffsetBeforeSlot(bottomIndex)
        + (slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0)
        + (bottomRowTitleWidths.resolved[bottomIndex] ?? 0);
    },
    [bottomRowTitleSlots, bottomRowTitleWidths.resolved, getBottomRowOffsetBeforeSlot, titleMarginLeftByKey],
  );

  const getEntryTitleCellWidthContext = useCallback((
    slots: JournalTitleSlot[],
    slot: JournalTitleSlot,
    rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom',
  ) => {
    if (!useTwoRowHeader || rowLayout === 'single-row') {
      const index = slots.findIndex((s) => s.prefix === slot.prefix);
      const stored = slots.map((s) => titleWidthByKey[s.widthKey]);
      const resolved = resolveJournalTitleWidths(slots.length, stored);
      const effective = getEffectiveJournalTitleWidths(slots.length, stored);
      return {
        effectiveWidth: effective[index] ?? 0,
        resolvedWidth: resolved[index] ?? 0,
        maxWidth: getJournalTitleMaxWidth(index, resolved),
      };
    }
    if (rowLayout === 'two-row-top') {
      const topSlots = slots.filter((s) => s.prefix === 'title1');
      const topIndex = topSlots.findIndex((s) => s.prefix === slot.prefix);
      const { resolved, effective } = getRowScopedJournalTitleWidths(topSlots, titleWidthByKey);
      return {
        effectiveWidth: effective[topIndex] ?? 0,
        resolvedWidth: resolved[topIndex] ?? 0,
        maxWidth: getJournalTitleMaxWidth(topIndex, resolved),
      };
    }
    const bottomSlots = slots.filter((s) => s.prefix === 'title2' || s.prefix === 'title3');
    const bottomIndex = bottomSlots.findIndex((s) => s.prefix === slot.prefix);
    const { resolved, effective } = getRowScopedJournalTitleWidths(bottomSlots, titleWidthByKey);
    return {
      effectiveWidth: effective[bottomIndex] ?? 0,
      resolvedWidth: resolved[bottomIndex] ?? 0,
      maxWidth: getJournalTitleMaxWidth(bottomIndex, resolved),
    };
  }, [titleWidthByKey, useTwoRowHeader]);

  const renderTitleCell = (
    slot: JournalTitleSlot,
    rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom',
    widthContext?: {
      effectiveWidth: number;
      resolvedWidth: number;
      maxWidth: number;
    },
  ) => {
    const marginLeft = slot.marginLeftKey
      ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0
      : 0;
    const {
      effectiveWidth,
      resolvedWidth,
      maxWidth: maxTitleWidth,
    } = widthContext ?? getSlotTitleWidthContext(slot, rowLayout);
    const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);
    const showCellControls = showControls && rowLayout === 'two-row-top';

    return (
      <div
        key={slot.className}
        className={`${P}-title-cell`}
        data-title={slot.prefix}
        style={{
          width: scaled(effectiveWidth),
          ...(marginLeft > 0 ? { marginLeft: scaled(marginLeft) } : {}),
        }}
      >
        <p className={slot.className} style={slot.style}>{slot.text}</p>
        {showCellControls && slot.marginLeftKey ? (
          <div
            data-controls={slot.marginLeftKey}
            data-controls-axis="x"
            data-controls-min="0"
            data-controls-max-fraction={String(resolvedWidth)}
            style={{
              position: 'absolute',
              top: 0,
              left: scaled(-marginLeft),
              width: scaled(marginHandleWidth),
              height: '100%',
              pointerEvents: 'auto',
            }}
          />
        ) : null}
        {showCellControls ? (
          <div
            data-controls={slot.widthKey}
            data-controls-axis="x"
            data-controls-max-fraction={String(maxTitleWidth)}
            data-controls-variant="column-width"
            className={`${P}-title-resize-handle`}
            style={{
              position: 'absolute',
              top: 0,
              right: scaled(-TITLE_RESIZE_HANDLE_WIDTH / 2),
              width: scaled(TITLE_RESIZE_HANDLE_WIDTH),
              height: '100%',
              pointerEvents: 'auto',
            }}
          />
        ) : null}
      </div>
    );
  };

  const renderTitle1MarginLeftSpacer = () => (
    <div
      {...(showControls ? {
        'data-controls': 'title1MarginLeft',
        'data-controls-axis': 'x',
      } : {})}
      style={{
        width: scaled(title1MarginLeft ?? 0),
        flexShrink: 0,
        alignSelf: 'stretch',
        ...(showControls ? { pointerEvents: 'auto' as const } : {}),
      }}
    />
  );

  const renderEntryCounter = () => (
    <div className={`${P}-text-bar-cell`}>
      <span
        className={`${P}-entry-counter`}
        style={countStyle}
        aria-live="polite"
        aria-atomic="true"
      >
        {formatSlideCounter(slides, activeSlideIndex, journalType, entries)}
      </span>
      {showControls && hasCloseIcon
        ? (
          <div
            data-controls="countCloseGap"
            data-controls-axis="x"
            data-controls-reverse="true"
            style={{
              position: 'absolute',
              top: 0,
              right: `calc(-0.5 * (${getGapControlSize(countCloseGap)} + ${countCloseGap}))`,
              width: getGapControlSize(countCloseGap),
              height: '100%',
              pointerEvents: 'auto',
              zIndex: 3,
            }}
          />
        )
        : null}
    </div>
  );

  const renderCloseIcon = () => (
    <div
      className={`${P}-close-icon`}
      style={{
        width: scalingValue(closeIconMaxWidth ?? 0, isEditor),
        height: scalingValue(closeIconMaxWidth ?? 0, isEditor),
        marginRight: iconMarginRight,
        ['--close-icon-hover-color' as string]: closeIconHoverColor,
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className={`${P}-close-icon-inner`}
        onClick={handleClose}
        aria-label="Close"
      >
        <SvgImage url={closeIcon ?? ''} fill={closeIconColor} hoverFill={closeIconHoverColor} className={`${P}-close-icon-img`} />
      </button>
      {showControls ? (
        <div
          data-controls="iconMarginRight"
          data-controls-axis="x"
          data-controls-reverse=""
          className={`${P}-control`}
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            width: iconMarginRight,
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      ) : null}
    </div>
  );

  const renderTwoRowTopControls = () => {
    if (!hasCounter && !hasCloseIcon) return null;

    return (
      <div className={`${P}-titles-row-top-controls`} style={persistentControlsGapStyle}>
        {hasCounter ? renderEntryCounter() : null}
        {hasCloseIcon ? renderCloseIcon() : null}
      </div>
    );
  };

  const renderSingleRowTitles = (entry: LightboxJournalItem | undefined) => {
    if (!entry) return null;
    const slots = buildJournalTitleSlots(P, entry, title1Style, title2Style, title3Style);

    return (
      <>
        {title1MarginLeft > 0 || showControls ? renderTitle1MarginLeftSpacer() : null}
        {slots.map((slot) => renderTitleCell(
          slot,
          'single-row',
          getEntryTitleCellWidthContext(slots, slot, 'single-row'),
        ))}
      </>
    );
  };

  const renderTwoRowTopTitle = (entry: LightboxJournalItem | undefined) => {
    if (!entry) return null;
    const slots = buildJournalTitleSlots(P, entry, title1Style, title2Style, title3Style);
    const title1Slot = slots.find((slot) => slot.prefix === 'title1');
    if (!title1Slot && !(title1MarginLeft > 0 || showControls)) return null;

    return (
      <>
        {title1MarginLeft > 0 || showControls ? renderTitle1MarginLeftSpacer() : null}
        {title1Slot ? renderTitleCell(
          title1Slot,
          'two-row-top',
          getEntryTitleCellWidthContext(slots, title1Slot, 'two-row-top'),
        ) : null}
      </>
    );
  };

  const renderTwoRowBottomTitles = (entry: LightboxJournalItem | undefined, includeControls = false) => {
    const slots = entry
      ? buildJournalTitleSlots(P, entry, title1Style, title2Style, title3Style)
      : [];
    const bottomSlots = slots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3');
    const showMarginBottomControl = showControls && includeControls;
    const showBottomWrap = bottomSlots.length > 0
      || showMarginBottomControl
      || (titleRowMarginBottom ?? 0) > 0;
    if (!showBottomWrap) return null;

    return (
      <div className={`${P}-titles-row-bottom-wrap`}>
        {bottomSlots.length > 0 ? (
          <div className={`${P}-titles-row-bottom`}>
            {bottomSlots.map((slot) => renderTitleCell(
              slot,
              'two-row-bottom',
              getEntryTitleCellWidthContext(slots, slot, 'two-row-bottom'),
            ))}
            {includeControls && showControls ? (
              <>
                {renderTwoRowBottomMarginControls()}
                {renderTwoRowBottomWidthControls()}
              </>
            ) : null}
          </div>
        ) : null}
        {(titleRowMarginBottom ?? 0) > 0 || showMarginBottomControl ? (
          <div
            data-controls={showMarginBottomControl ? 'titleRowMarginBottom' : undefined}
            data-controls-axis={showMarginBottomControl ? 'y' : undefined}
            data-controls-reverse={showMarginBottomControl ? '' : undefined}
            className={showMarginBottomControl ? `${P}-control` : undefined}
            style={{
              height: titleRowMarginBottomScaled,
              width: '100%',
              flexShrink: 0,
              pointerEvents: showMarginBottomControl ? 'auto' : 'none',
            }}
          />
        ) : null}
      </div>
    );
  };

  const renderTwoRowTitles = (entry: LightboxJournalItem | undefined, includeControls = false) => (
    <>
      <div className={`${P}-titles-row-top`}>
        {renderTwoRowTopTitle(entry)}
        {renderTwoRowTopControls()}
      </div>
      {renderTwoRowBottomTitles(entry, includeControls)}
    </>
  );

  const renderTitles = (entry: LightboxJournalItem | undefined) => {
    if (useTwoRowHeader) {
      return (
        <div className={`${P}-titles-row-two-row`} style={{ width: '100%' }}>
          {renderTwoRowTitles(entry)}
        </div>
      );
    }
    if (!entry) return null;
    return (
      <div className={`${P}-titles-row`} style={{ width: '100%' }}>
        {renderSingleRowTitles(entry)}
      </div>
    );
  };

  const renderTitleMarginControls = () => {
    const singleRowTitle1Index = !useTwoRowHeader
      ? activeTitleSlots.findIndex((slot) => slot.prefix === 'title1')
      : -1;
    const singleRowTitle1Control = !useTwoRowHeader && (showControls || (title1MarginLeft ?? 0) > 0) ? (() => {
      const marginLeft = title1MarginLeft ?? 0;
      const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);
      const title1MaxFraction = singleRowTitle1Index >= 0
        ? resolvedTitleWidths[singleRowTitle1Index]
        : title1Width;

      return (
        <div
          key="title1MarginLeft"
          data-controls="title1MarginLeft"
          data-controls-axis="x"
          data-controls-min="0"
          data-controls-max-fraction={String(title1MaxFraction)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: scaled(marginHandleWidth),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      );
    })() : null;

    const slotMarginControls = activeTitleSlots.flatMap((slot, colIndex) => {
      if (!slot.marginLeftKey) return [];
      const marginLeft = titleMarginLeftByKey[slot.marginLeftKey] ?? 0;
      const offsetBeforeMargin = getJournalTitleOffsetBeforeSlot(
        activeTitleSlots,
        resolvedTitleWidths,
        titleMarginLeftByKey,
        colIndex,
      ) + getSingleRowMarginColumnOffset();
      const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);

      return (
        <div
          key={slot.marginLeftKey}
          data-controls={slot.marginLeftKey}
          data-controls-axis="x"
          data-controls-min="0"
          data-controls-max-fraction={String(resolvedTitleWidths[colIndex])}
          style={{
            position: 'absolute',
            top: 0,
            left: scaled(offsetBeforeMargin),
            width: scaled(marginHandleWidth),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      );
    });

    return singleRowTitle1Control
      ? [singleRowTitle1Control, ...slotMarginControls]
      : slotMarginControls;
  };

  const renderTitleWidthControls = () => activeTitleSlots.map((slot, colIndex) => {
    const maxTitleWidth = getJournalTitleMaxWidth(colIndex, resolvedTitleWidths);
    const boundaryOffset = getTitleBoundaryOffset(colIndex);
    const titleWidthHandleOffset = boundaryOffset - TITLE_RESIZE_HANDLE_WIDTH / 2;

    return (
      <div key={`${slot.widthKey}-junction`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          data-controls={slot.widthKey}
          data-controls-axis="x"
          data-controls-max-fraction={String(maxTitleWidth)}
          data-controls-variant="column-width"
          className={`${P}-title-resize-handle`}
          style={{
            position: 'absolute',
            top: 0,
            left: scaled(titleWidthHandleOffset),
            width: scaled(TITLE_RESIZE_HANDLE_WIDTH),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      </div>
    );
  });

  const renderTwoRowBottomMarginControls = () => bottomRowTitleSlots.flatMap((slot, bottomIndex) => {
    if (!slot.marginLeftKey) return [];
    const marginLeft = titleMarginLeftByKey[slot.marginLeftKey] ?? 0;
    const offsetBeforeMargin = getBottomRowOffsetBeforeSlot(bottomIndex);
    const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);
    const { resolvedWidth } = getSlotTitleWidthContext(slot, 'two-row-bottom');

    return (
      <div
        key={slot.marginLeftKey}
        data-controls={slot.marginLeftKey}
        data-controls-axis="x"
        data-controls-min="0"
        data-controls-max-fraction={String(resolvedWidth)}
        style={{
          position: 'absolute',
          top: 0,
          left: scaled(offsetBeforeMargin),
          width: scaled(marginHandleWidth),
          height: '100%',
          pointerEvents: 'auto',
        }}
      />
    );
  });

  const renderTwoRowBottomWidthControls = () => bottomRowTitleSlots.map((slot, bottomIndex) => {
    const { maxWidth: maxTitleWidth } = getSlotTitleWidthContext(slot, 'two-row-bottom');
    const boundaryOffset = getBottomRowBoundaryOffset(bottomIndex);
    const titleWidthHandleOffset = boundaryOffset - TITLE_RESIZE_HANDLE_WIDTH / 2;

    return (
      <div key={`${slot.widthKey}-junction`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          data-controls={slot.widthKey}
          data-controls-axis="x"
          data-controls-max-fraction={String(maxTitleWidth)}
          data-controls-variant="column-width"
          className={`${P}-title-resize-handle`}
          style={{
            position: 'absolute',
            top: 0,
            left: scaled(titleWidthHandleOffset),
            width: scaled(TITLE_RESIZE_HANDLE_WIDTH),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      </div>
    );
  });

  const renderTitleControls = () => {
    if (!showControls || useTwoRowHeader) return null;
    return (
      <>
        {renderTitleMarginControls()}
        {renderTitleWidthControls()}
      </>
    );
  };

  const getSlideImageCellProps = (image: LightboxJournalImage) => {
    const useRatioWrapper = !image.objectFit && isImageRatioCover(coverFit);
    return {
      className: `${P}-slide-image-cell${useRatioWrapper ? ` ${P}-slide-image-cell-cover` : ''}`,
      style: {
        maxWidth: slideMaxWidth,
        maxHeight: slideMaxHeight,
        ...(useRatioWrapper
          ? ({ '--image-aspect-ratio': getAspectRatio(coverFit) } as React.CSSProperties)
          : {}),
      },
    };
  };

  const getSlideImageProps = (image: LightboxJournalImage) => {
    if (image.objectFit) {
      return {
        className: `${P}-slide-image ${P}-slide-image-custom`,
        style: { '--image-object-fit': image.objectFit } as React.CSSProperties,
      };
    }
    return isImageRatioCover(coverFit)
      ? { className: `${P}-slide-image ${P}-slide-image-cover` }
      : { className: `${P}-slide-image ${P}-slide-image-fit` };
  };

  const renderSlideImages = (images: LightboxJournalImage[]) => {
    if (images.length === 0) return null;
    const hasInnerImageGap = images.length > 1;
    const imageGapControlSize = getGapControlSize(imageGap);
    const imageGapControlRight = `calc(-0.5 * (${imageGapControlSize} + ${imageGap}))`;

    if (images.length === 1) {
      const image = images[0];
      return (
        <div {...getSlideImageCellProps(image)}>
          <img {...getSlideImageProps(image)} src={image.url} alt={image.name ?? ''} draggable={false} />
        </div>
      );
    }

    return (
      <div
        className={`${P}-slide-inner`}
        style={hasInnerImageGap ? { gap: imageGap } : undefined}
      >
        {images.map((image, imageIndex) => {
          return (
            <div key={`${image.url}-${imageIndex}`} {...getSlideImageCellProps(image)}>
              <img
                {...getSlideImageProps(image)}
                src={image.url}
                alt={image.name ?? ''}
                draggable={false}
              />
              {showControls && hasInnerImageGap && imageIndex < images.length - 1 && (
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
    );
  };
  const hasTwoRowBottomArea = Boolean(
    activeEntry?.title2 || activeEntry?.title3
    || outgoingEntry?.title2 || outgoingEntry?.title3
    || (titleRowMarginBottom ?? 0) > 0
    || showControls,
  );

  const renderTwoRowHeaderFade = () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
      }}
    >
      <div
        ref={titlesMeasureRef}
        className={titlesStackClassName}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          left: 0,
          right: 0,
          top: 0,
          width: '100%',
          height: 'auto',
        }}
        aria-hidden="true"
      >
        {incomingMeasureEntry ? renderTwoRowTitles(incomingMeasureEntry) : renderTwoRowTitles(activeEntry)}
      </div>
      <div
        ref={titlesStackRef}
        className={`${P}-titles-row-two-row`}
        style={{
          ...(isTitlesFading && titlesStackMinHeight ? { minHeight: titlesStackMinHeight } : undefined),
          ...(isTitlesFading && titlesStackWidth ? { width: titlesStackWidth, maxWidth: '100%' } : undefined),
          ...(isTitlesFading ? { overflow: 'hidden' } : undefined),
        }}
      >
        <div className={`${P}-titles-row-top`}>
          <div
            className={titlesStackClassName}
            style={{ position: 'relative', flex: 1, minWidth: 0 }}
          >
            {outgoingEntry && isTitlesFading ? (
              <div className={`${titlesLayerOutClassName} ${P}-titles-fade-out`}>
                {renderTwoRowTopTitle(outgoingEntry)}
              </div>
            ) : null}
            <div
              className={`${P}-titles-layer-in${isTitlesFading ? ` ${P}-titles-layer-in-fading ${P}-titles-fade-in` : ''}`}
            >
              {renderTwoRowTopTitle(activeEntry)}
            </div>
          </div>
          {renderTwoRowTopControls()}
        </div>
        {hasTwoRowBottomArea ? (
        <div className={`${P}-titles-row-bottom-area`}>
          {outgoingEntry && isTitlesFading ? (
            <div className={`${titlesLayerOutClassName} ${P}-titles-layer-out-bottom ${P}-titles-fade-out`}>
              {renderTwoRowBottomTitles(outgoingEntry)}
            </div>
          ) : null}
          <div
            className={`${P}-titles-layer-in${isTitlesFading ? ` ${P}-titles-layer-in-fading ${P}-titles-fade-in` : ''}${useTwoRowHeader ? ` ${P}-titles-layer-in-stacked` : ''}`}
          >
            {renderTwoRowBottomTitles(activeEntry, true)}
          </div>
          {renderTitleControls()}
        </div>
        ) : null}
      </div>
    </div>
  );

  const renderTwoRowHeaderStatic = () => {
    const hasBottomRow = hasTwoRowBottomArea;
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          ...(hasBottomRow ? { flex: 1, height: '100%' } : {}),
        }}
      >
        <div
          className={`${P}-titles-row-two-row`}
          style={hasBottomRow ? undefined : { flex: '0 0 auto', height: 'auto' }}
        >
          {renderTwoRowTitles(activeEntry, true)}
        </div>
        {renderTitleControls()}
      </div>
    );
  };

  return (
    <div
      ref={lightboxRef}
      data-selection="none"
      className={`${P}-lightbox${isEditor ? ` ${P}-lightbox-editor` : ''}${isEditMode ? ` ${P}-lightbox-edit-mode` : ''}`}
      onClick={() => {
        if (isSwipeDragging) return;
        handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Journal gallery"
      tabIndex={hasCloseIcon ? undefined : -1}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${LIGHTBOX_ANIM_MS}ms ease`,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor, ...swipeBackdropStyle }} />
      <div
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
            className={`${P}-lightbox-strip`}
            data-desktop-nav={allowDesktopNav && slides.length > 1 ? 'true' : 'false'}
            onPointerDown={allowDesktopNav ? onStripPointerDown : undefined}
            onPointerUp={allowDesktopNav ? onStripPointerUp : undefined}
            onPointerCancel={allowDesktopNav ? onStripPointerCancel : undefined}
          >
          <div className={`${P}-slide-stack`}>
            {outgoingSlide && isSlideFading ? (
              <div
                key={`slide-out-${slideTransitionKey}`}
                className={`${P}-slide-layer-out ${P}-slide-fade-out`}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget) return;
                  finishSlideTransition(slideTransitionKey);
                }}
              >
                <div className={`${P}-slide-area`}>
                  {renderSlideImages(outgoingSlide.images)}
                </div>
              </div>
            ) : null}
            <div
              key={`slide-in-${slideTransitionKey}-${activeSlideIndex}`}
              className={`${P}-slide-layer-in${isSlideFading ? ` ${P}-slide-fade-in` : ''}`}
            >
              <div className={`${P}-slide-area`} >
                {activeSlide ? renderSlideImages(activeSlide.images) : null}
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className={`${P}-lightbox-overlay-content`} style={{ width: '100%', height: '100%', ...swipeOverlayContentStyle }}>
        <div
          data-controls={showControls ? 'contentMarginTop' : undefined}
          className={showControls ? `${P}-control` : undefined}
          style={{ height: contentMarginTop, width: '100%' }}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          ...(useTwoRowHeader ? { flex: 1, minHeight: 0 } : {}),
        }}>
          <div className={`${P}-lightbox-content-area${useTwoRowHeader ? ` ${P}-lightbox-content-area-stacked` : ''}`}>
            {(useTwoRowHeader ? hasHeaderContent : hasTitles) && (
              <div className={`${P}-text-bar-cell${useTwoRowHeader ? ` ${P}-text-bar-cell-stacked` : ''}`}>
                {useTwoRowHeader
                  ? (textTransition === 'fade' ? renderTwoRowHeaderFade() : renderTwoRowHeaderStatic())
                  : (textTransition === 'fade' ? (
                    <>
                      <div
                        ref={titlesMeasureRef}
                        className={titlesStackClassName}
                        style={{
                          position: 'absolute',
                          visibility: 'hidden',
                          pointerEvents: 'none',
                          left: 0,
                          right: 0,
                          top: 0,
                          width: '100%',
                          height: 'auto',
                        }}
                        aria-hidden="true"
                      >
                        {incomingMeasureEntry ? renderTitles(incomingMeasureEntry) : renderTitles(activeEntry)}
                      </div>
                      <div
                        ref={titlesStackRef}
                        className={titlesStackClassName}
                        style={{
                          width: '100%',
                          ...(isTitlesFading && titlesStackMinHeight ? { minHeight: titlesStackMinHeight } : undefined),
                          ...(isTitlesFading && titlesStackWidth ? { width: titlesStackWidth, maxWidth: '100%' } : undefined),
                          ...(isTitlesFading ? { overflow: 'hidden' } : undefined),
                        }}
                      >
                        {outgoingEntry && isTitlesFading ? (
                          <div className={`${titlesLayerOutClassName} ${P}-titles-fade-out`}>
                            {renderTitles(outgoingEntry)}
                          </div>
                        ) : null}
                        <div className={`${P}-titles-layer-in${isTitlesFading ? ` ${P}-titles-layer-in-fading ${P}-titles-fade-in` : ''}`}>
                          {renderTitles(activeEntry)}
                        </div>
                        {renderTitleControls()}
                      </div>
                    </>
                  ) : (
                    <div style={{ position: 'relative', width: '100%' }}>
                      {renderTitles(activeEntry)}
                      {renderTitleControls()}
                    </div>
                  ))}
              </div>
            )}
            {!useTwoRowHeader && (
              <div className={`${P}-lightbox-persistent-controls`} style={persistentControlsGapStyle}>
                {hasCounter && renderEntryCounter()}
                {hasCloseIcon && renderCloseIcon()}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export const JOURNAL_TEXT_STYLE_PREFIXES = ['title1', 'title2', 'title3', 'count'] as const;

export type JournalTextStylePrefix = typeof JOURNAL_TEXT_STYLE_PREFIXES[number];

export const JOURNAL_GLOBAL_TEXT_STYLE_KEYS = [
  'fontFamily',
  'fontSettings',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textAlign',
  'textAppearance',
] as const;

export type JournalGlobalTextStyleKey = typeof JOURNAL_GLOBAL_TEXT_STYLE_KEYS[number];

export function getJournalTextStyleSettingKey(
  prefix: JournalTextStylePrefix,
  globalKey: JournalGlobalTextStyleKey,
): string {
  return `${prefix}${globalKey.charAt(0).toUpperCase()}${globalKey.slice(1)}`;
}

export const JOURNAL_TEXT_STYLE_TAB_LABELS: Record<JournalTextStylePrefix, string> = {
  title1: '1',
  title2: '2',
  title3: '3',
  count: 'Count',
};

export function createJournalTextStyleTabContentItems(prefix: JournalTextStylePrefix): LayoutItem[] {
  return [
    getJournalTextStyleSettingKey(prefix, 'fontFamily'),
    getJournalTextStyleSettingKey(prefix, 'fontSettings'),
    {
      type: 'row',
      items: [
        getJournalTextStyleSettingKey(prefix, 'fontSize'),
        getJournalTextStyleSettingKey(prefix, 'lineHeight'),
        getJournalTextStyleSettingKey(prefix, 'letterSpacing'),
        getJournalTextStyleSettingKey(prefix, 'wordSpacing'),
      ],
    },
    getJournalTextStyleSettingKey(prefix, 'textAlign'),
    getJournalTextStyleSettingKey(prefix, 'textAppearance'),
  ];
}

export function createJournalTextStylePanelTab(): LayoutTab {
  return {
    type: 'tab',
    id: 'journalTextStyle',
    tabs: Object.fromEntries(
      JOURNAL_TEXT_STYLE_PREFIXES.map((prefix) => [
        JOURNAL_TEXT_STYLE_TAB_LABELS[prefix],
        createJournalTextStyleTabContentItems(prefix),
      ]),
    ),
  };
}

type JournalTextStyleFields = {
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

type ResolvedJournalTextFields = {
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

const JOURNAL_TEXT_STYLE_COLOR_KEYS: Record<JournalTextStylePrefix, keyof LightboxJournalSettings> = {
  title1: 'title1Color',
  title2: 'title2Color',
  title3: 'title3Color',
  count: 'countColor',
};

const JOURNAL_TEXT_STYLE_DEFAULT_FONT_SIZES: Record<JournalTextStylePrefix, number> = {
  title1: 0.02,
  title2: 0.02,
  title3: 0.02,
  count: 0.017,
};

function resolveJournalTextFields(
  settings: LightboxJournalSettings,
  prefix: JournalTextStylePrefix,
): ResolvedJournalTextFields {
  const read = <K extends JournalGlobalTextStyleKey>(globalKey: K) => {
    const settingKey = getJournalTextStyleSettingKey(prefix, globalKey);
    return settings[settingKey as keyof LightboxJournalSettings] as JournalTextStyleFields[K] | undefined;
  };

  return {
    fontFamily: (read('fontFamily') as string | undefined) ?? 'Arial',
    fontSettings: (read('fontSettings') as JournalTextStyleFields['fontSettings']) ?? {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    fontSize: read('fontSize') as number | undefined,
    lineHeight: read('lineHeight') as number | undefined,
    letterSpacing: (read('letterSpacing') as number | undefined) ?? 0,
    wordSpacing: (read('wordSpacing') as number | undefined) ?? 0,
    textAlign: (read('textAlign') as JournalTextStyleFields['textAlign']) ?? 'left',
    textAppearance: read('textAppearance') as JournalTextStyleFields['textAppearance'],
    color: settings[JOURNAL_TEXT_STYLE_COLOR_KEYS[prefix]] as string | undefined,
  };
}

function journalTextFieldsToCss(
  prefix: JournalTextStylePrefix,
  fields: ResolvedJournalTextFields,
  isEditor?: boolean,
): React.CSSProperties {
  const resolvedTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: fields.fontFamily,
      fontWeight: fields.fontSettings?.fontWeight ?? 400,
      fontStyle: fields.fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fields.fontSize ?? JOURNAL_TEXT_STYLE_DEFAULT_FONT_SIZES[prefix],
    lineHeight: fields.lineHeight,
    letterSpacing: fields.letterSpacing,
    wordSpacing: fields.wordSpacing,
    textAlign: fields.textAlign,
    textAppearance: fields.textAppearance,
    color: fields.color ?? '#ffffff',
  };

  return textStylesToCss(resolvedTextStyle, isEditor);
}

type LightboxJournalProps = {
  settings: LightboxJournalSettings;
  content?: LightboxJournalItem[];
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  portalId?: string;
} & CommonComponentProps;

export const LightboxJournal = ({ settings, content, isEditor, isEditMode, isPreviewMode, portalId, metadata }: LightboxJournalProps) => {
  const { prefix: P } = useScopedStyles();
  const itemId = metadata?.itemId ?? null;
  const { cover, coverFit, type } = settings;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxInitialSlideIndex, setLightboxInitialSlideIndex] = useState(0);
  const didApplyInitialUrlRef = useRef(false);
  const urlHistoryPushedRef = useRef(false);
  const isClosingFromUrlRef = useRef(false);
  const entries = useMemo(
    () => (content ?? []).filter((entry) => getEntryImages(entry).length > 0),
    [content],
  );
  const isOverlayVisible = lightboxOpen || (Boolean(isEditMode) && entries.length > 0);
  const shouldSyncUrl = !isEditor;

  const removeJournalUrl = useCallback(() => {
    if (!shouldSyncUrl) return;
    isClosingFromUrlRef.current = true;
    removeJournalUrlParam(urlHistoryPushedRef.current, itemId);
    urlHistoryPushedRef.current = false;
  }, [shouldSyncUrl, itemId]);

  const openLightbox = (slideIndex = 0) => {
    if (isEditMode || entries.length === 0) return;
    if (isEditor && !isPreviewMode) return;
    const slides = buildJournalSlides(entries, type);
    const normalizedSlideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));
    setLightboxInitialSlideIndex(normalizedSlideIndex);
    if (shouldSyncUrl) {
      const hadParam = hasJournalUrlParam();
      setJournalUrlParam(normalizedSlideIndex + 1, itemId, hadParam);
      urlHistoryPushedRef.current = !hadParam;
    }
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    isClosingFromUrlRef.current = false;
  }, []);

  useEffect(() => {
    if (!shouldSyncUrl || didApplyInitialUrlRef.current) return;
    didApplyInitialUrlRef.current = true;
    const slideNumber = findJournalUrlSlideNumber(itemId);
    if (!slideNumber) return;
    const slideIndex = slideNumberToIndex(slideNumber, buildJournalSlides(entries, type).length);
    if (slideIndex < 0) return;
    setLightboxInitialSlideIndex(slideIndex);
    setLightboxOpen(true);
  }, [entries, itemId, shouldSyncUrl, type]);

  useEffect(() => {
    if (!shouldSyncUrl) return;
    const onPopState = () => {
      if (isClosingFromUrlRef.current) {
        isClosingFromUrlRef.current = false;
        setLightboxOpen(false);
        return;
      }
      const slideNumber = findJournalUrlSlideNumber(itemId);
      if (!slideNumber) {
        setLightboxOpen(false);
        return;
      }
      const slideIndex = slideNumberToIndex(slideNumber, buildJournalSlides(entries, type).length);
      if (slideIndex < 0) {
        setLightboxOpen(false);
        return;
      }
      urlHistoryPushedRef.current = false;
      setLightboxInitialSlideIndex(slideIndex);
      setLightboxOpen(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [entries, itemId, shouldSyncUrl, type]);

  return (
    <>
      <div ref={wrapperRef} className={`${P}-wrapper`}>
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        {cover ? (
          <button
            type="button"
            className={`${P}-cover ${isImageRatioCover(coverFit) ? `${P}-ratio-wrapper-cover` : `${P}-ratio-wrapper-fit`}`}
            onClick={() => openLightbox()}
            style={{
              display: 'block',
              padding: 0,
              border: 'none',
              background: 'transparent',
              ...(isImageRatioCover(coverFit)
                ? ({ '--image-aspect-ratio': getAspectRatio(coverFit) } as React.CSSProperties)
                : {}),
            }}
            aria-label="Open journal gallery"
          >
            <img
              className={`${P}-cover-image ${isImageRatioCover(coverFit) ? `${P}-cover-image-cover` : `${P}-cover-image-fit`}`}
              src={cover}
              alt="cover"
            />
          </button>
        ) : null}
      </div>

      {isOverlayVisible && typeof document !== 'undefined' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <LightboxOverlay
            prefix={P}
            entries={entries}
            settings={settings}
            isEditor={isEditor}
            isEditMode={isEditMode}
            isPreviewMode={isPreviewMode}
            initialSlideIndex={lightboxInitialSlideIndex}
            enableUrlSync={shouldSyncUrl}
            journalItemId={itemId}
            onBeforeClose={removeJournalUrl}
            onClose={closeLightbox}
          />,
          portalTarget,
        );
      })()}
    </>
  );
};

export type LightboxJournalSettings = {
  cover: string | null;
  coverFit: {
    display: 'Fit' | 'Cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
  type: 'A' | 'B';
  maxWidth: number;
  maxHeight: number;
  backgroundColor: string;
  imageGap?: number;
  textTransition: 'none' | 'fade';
  title1Width?: number;
  title2Width?: number;
  title3Width?: number;
  title1MarginLeft?: number;
  title2MarginLeft?: number;
  title3MarginLeft?: number;
  titleRowMarginBottom?: number;
  titleHeaderLayout?: 'desktop' | 'mobile';
  countCloseGap?: number;
  title1Color: string;
  title2Color: string;
  title3Color: string;
  countColor: string;
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
  countFontFamily?: string;
  countFontSettings?: { fontWeight: number; fontStyle: string };
  countFontSize?: number;
  countLineHeight?: number;
  countLetterSpacing?: number;
  countWordSpacing?: number;
  countTextAlign?: 'left' | 'center' | 'right' | 'justify';
  countTextAppearance?: TextStyles['textAppearance'];
  contentMarginTop: number;
  iconMarginRight: number;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
};
