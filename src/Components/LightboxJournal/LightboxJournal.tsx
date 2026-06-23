import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { getAspectRatio, isImageRatioCover } from '../utils/imageFitStyles';
import { LayoutItem, LayoutTab } from '../../types/SchemaV1';

const LIGHTBOX_ANIM_MS = 300;
const TEXT_FADE_MS = 400;
const SLIDE_FADE_MS = 300;
const JOURNAL_URL_PARAM_KEY = 'cntrl-lightbox-journal';
const LEGACY_JOURNAL_URL_PARAM_PREFIX = `${JOURNAL_URL_PARAM_KEY}-`;

const isJournalUrlParamKey = (key: string) =>
  key === JOURNAL_URL_PARAM_KEY || key.startsWith(LEGACY_JOURNAL_URL_PARAM_PREFIX);

const findJournalUrlSlideNumber = (): number | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(JOURNAL_URL_PARAM_KEY);
  if (value) {
    const slideNumber = Number.parseInt(value, 10);
    if (Number.isFinite(slideNumber) && slideNumber >= 1) {
      return slideNumber;
    }
  }
  for (const [key] of params) {
    if (!key.startsWith(LEGACY_JOURNAL_URL_PARAM_PREFIX)) continue;
    const slideNumber = Number.parseInt(key.slice(LEGACY_JOURNAL_URL_PARAM_PREFIX.length), 10);
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

const setJournalUrlParam = (slideNumber: number, replace = true) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  [...url.searchParams.keys()].forEach((key) => {
    if (isJournalUrlParamKey(key)) {
      url.searchParams.delete(key);
    }
  });
  url.searchParams.set(JOURNAL_URL_PARAM_KEY, String(slideNumber));
  const historyMethod = replace ? 'replaceState' : 'pushState';
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history[historyMethod](window.history.state, '', nextUrl);
};

const clearJournalUrlParam = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  let changed = false;
  [...url.searchParams.keys()].forEach((key) => {
    if (isJournalUrlParamKey(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  });
  if (changed) {
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }
};

const hasJournalUrlParam = () => {
  if (typeof window === 'undefined') return false;
  return [...new URLSearchParams(window.location.search).keys()]
    .some((key) => isJournalUrlParamKey(key));
};

const removeJournalUrlParam = (didPushHistory: boolean) => {
  if (!hasJournalUrlParam()) return;
  if (didPushHistory) {
    window.history.back();
    return;
  }
  clearJournalUrlParam();
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
  align-items: center;
}

.${P}-title-cell {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
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
  flex-shrink: 1;
  min-width: 0;
}

.${P}-titles-stack {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-width: 0;
}

.${P}-titles-layer-out {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  z-index: 1;
}

.${P}-titles-layer-in {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-width: 0;
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

.${P}-lightbox-chrome {
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
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
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
  journalType: 'A' | 'B';
  coverFit: {
    display: 'Fit' | 'Cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
  backgroundColor: string;
  imageGap: string;
  slideMaxWidth: string;
  slideMaxHeight: string;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
  textMaxWidth: string;
  titlesGap: string;
  countCloseGap: string;
  textTransition: 'none' | 'fade';
  title1Style: React.CSSProperties;
  title2Style: React.CSSProperties;
  title3Style: React.CSSProperties;
  countStyle: React.CSSProperties;
  contentMarginTop: string;
  contentMarginLeft: string;
  contentMarginRight: string;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  initialSlideIndex?: number;
  enableUrlSync?: boolean;
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
  let start = 1;
  for (let i = 0; i < entryIndex; i++) {
    start += getEntryImages(entries[i]).length;
  }
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

const LightboxOverlay = ({
  prefix: P,
  entries,
  journalType,
  coverFit,
  backgroundColor,
  imageGap,
  slideMaxWidth,
  slideMaxHeight,
  isEditor,
  isEditMode,
  isPreviewMode,
  closeIcon,
  closeIconMaxWidth,
  closeIconColor,
  closeIconHoverColor,
  textMaxWidth,
  titlesGap,
  countCloseGap,
  textTransition,
  title1Style,
  title2Style,
  title3Style,
  countStyle,
  contentMarginTop,
  contentMarginLeft,
  contentMarginRight,
  initialSlideIndex = 0,
  enableUrlSync = false,
  onBeforeClose,
  onClose,
}: LightboxOverlayProps) => {
  const showControls = Boolean(isEditMode);
  const allowDesktopNav = !isEditor || Boolean(isPreviewMode);
  const slides = useMemo(
    () => buildJournalSlides(entries, journalType),
    [entries, journalType],
  );
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

  const getIncomingTitlesMeasureWidth = useCallback(() => {
    const stack = titlesStackRef.current;
    if (!stack) return undefined;
    const contentArea = stack.closest(`.${P}-lightbox-content-area`) as HTMLElement | null;
    if (!contentArea) return stack.getBoundingClientRect().width;
    let fixedSiblingsWidth = 0;
    Array.from(contentArea.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (child.contains(stack)) return;
      fixedSiblingsWidth += child.getBoundingClientRect().width;
    });
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

  const syncUrlToSlide = useCallback((slideIndex: number) => {
    if (!enableUrlSync) return;
    setJournalUrlParam(slideIndex + 1, true);
  }, [enableUrlSync]);

  const goToSlide = useCallback((index: number) => {
    if (slides.length === 0) return;
    const normalizedIndex = ((index % slides.length) + slides.length) % slides.length;
    if (normalizedIndex === activeSlideIndex) return;
    const outgoingSlide = slides[activeSlideIndex];
    const incomingSlide = slides[normalizedIndex];
    slideTransitionKeyRef.current += 1;
    const transitionKey = slideTransitionKeyRef.current;
    const shouldFadeTitles = textTransition === 'fade'
      && getEntryTitleKey(outgoingSlide?.entry) !== getEntryTitleKey(incomingSlide?.entry);
    const measuredOutgoingTitlesHeight = titlesStackRef.current?.getBoundingClientRect().height;
    let measuredIncomingTitlesHeight: number | undefined;
    let incomingTitlesMeasureWidth: number | undefined;
    if (shouldFadeTitles) {
      incomingTitlesMeasureWidth = getIncomingTitlesMeasureWidth();
      flushSync(() => {
        setIncomingMeasureEntry(incomingSlide.entry);
      });
      if (titlesMeasureRef.current && incomingTitlesMeasureWidth) {
        titlesMeasureRef.current.style.width = `${incomingTitlesMeasureWidth}px`;
      }
      measuredIncomingTitlesHeight = titlesMeasureRef.current?.getBoundingClientRect().height;
      if (titlesMeasureRef.current) {
        titlesMeasureRef.current.style.width = '';
      }
    }
    const lockedTitlesHeight = Math.max(measuredOutgoingTitlesHeight ?? 0, measuredIncomingTitlesHeight ?? 0) || undefined;

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
      if (incomingTitlesMeasureWidth) {
        setTitlesStackWidth(incomingTitlesMeasureWidth);
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

  const onStripPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowDesktopNav) return;
    if (slides.length <= 1) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-controls]')) return;
    const navRect = lightboxRef.current?.getBoundingClientRect();
    const midPoint = navRect
      ? navRect.left + navRect.width / 2
      : window.innerWidth / 2;
    if (event.clientX < midPoint) {
      goToSlide(activeSlideIndex - 1);
    } else {
      goToSlide(activeSlideIndex + 1);
    }
  };

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
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
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
  const hasTitles = Boolean(
    activeEntry?.title1 || activeEntry?.title2 || activeEntry?.title3
    || outgoingEntry?.title1 || outgoingEntry?.title2 || outgoingEntry?.title3,
  );
  const hasCounter = shouldShowCounter(journalType, slides, entries);
  const hasCloseIcon = Boolean(closeIcon);
  const titlesGapStyle = { gap: titlesGap };
  const persistentControlsGapStyle = hasCounter && hasCloseIcon ? { gap: countCloseGap } : undefined;

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

  const renderTitles = (entry: LightboxJournalItem | undefined, showGapControls = false) => {
    if (!entry) return null;

    const slots = [
      entry.title1 ? { className: `${P}-title1`, style: title1Style, text: entry.title1 } : null,
      entry.title2 ? { className: `${P}-title2`, style: title2Style, text: entry.title2 } : null,
      entry.title3 ? { className: `${P}-title3`, style: title3Style, text: entry.title3 } : null,
    ].filter((slot): slot is { className: string; style: React.CSSProperties; text: string } => slot !== null);

    return slots.map((slot, index) => (
      <div key={slot.className} className={`${P}-title-cell`}>
        <p className={slot.className} style={{ ...slot.style, maxWidth: textMaxWidth }}>{slot.text}</p>
        {showGapControls && showControls && index < slots.length - 1 ? renderGapControl('titlesGap', titlesGap) : null}
      </div>
    ));
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
          <img
            {...getSlideImageProps(image)}
            src={image.url}
            alt={image.name ?? ''}
            draggable={false}
          />
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
            <div
              key={`${image.url}-${imageIndex}`}
              {...getSlideImageCellProps(image)}
            >
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

  return (
    <div
      ref={lightboxRef}
      data-selection="none"
      className={`${P}-lightbox${isEditor ? ` ${P}-lightbox-editor` : ''}${isEditMode ? ` ${P}-lightbox-edit-mode` : ''}`}
      onClick={handleClose}
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
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor }} />
      <div
        className={`${P}-lightbox-content`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`${P}-lightbox-strip`}
          data-desktop-nav={allowDesktopNav && slides.length > 1 ? 'true' : 'false'}
          onPointerUp={allowDesktopNav ? onStripPointerUp : undefined}
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
                <div
                  className={`${P}-slide-area`}
                  // style={{ maxWidth: slideMaxWidth, maxHeight: slideMaxHeight }}
                >
                  {renderSlideImages(outgoingSlide.images)}
                </div>
              </div>
            ) : null}
            <div
              key={`slide-in-${slideTransitionKey}-${activeSlideIndex}`}
              className={`${P}-slide-layer-in${isSlideFading ? ` ${P}-slide-fade-in` : ''}`}
            >
              <div
                className={`${P}-slide-area`}
                // style={{ maxWidth: slideMaxWidth, maxHeight: slideMaxHeight }}
              >
                {activeSlide ? renderSlideImages(activeSlide.images) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${P}-lightbox-chrome`} style={{ width: '100%', height: '100%' }}>
        <div
          data-controls={showControls ? 'contentMarginTop' : undefined}
          className={showControls ? `${P}-control` : undefined}
          style={{ height: contentMarginTop, width: '100%' }}
        />
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <div
            data-controls={showControls ? 'contentMarginLeft' : undefined}
            data-controls-axis={showControls ? 'x' : undefined}
            className={showControls ? `${P}-control` : undefined}
            style={{ width: contentMarginLeft, flexShrink: 0 }}
          />
          <div className={`${P}-lightbox-content-area`}>
            {hasTitles && (
              <div className={`${P}-text-bar-cell`}>
                <div
                  className={`${P}-titles-row`}
                  style={titlesGapStyle}
                >
                  {textTransition === 'fade' ? (
                    <>
                      <div
                        ref={titlesMeasureRef}
                        className={`${P}-titles-stack`}
                        style={{
                          ...titlesGapStyle,
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
                        {incomingMeasureEntry ? renderTitles(incomingMeasureEntry, false) : renderTitles(activeEntry, false)}
                      </div>
                      <div
                        ref={titlesStackRef}
                        className={`${P}-titles-stack`}
                        style={{
                          ...titlesGapStyle,
                          ...(isTitlesFading && titlesStackMinHeight ? { minHeight: titlesStackMinHeight } : undefined),
                          ...(isTitlesFading && titlesStackWidth ? { width: titlesStackWidth, maxWidth: '100%' } : undefined),
                          ...(isTitlesFading ? { overflow: 'hidden' } : undefined),
                        }}
                      >
                        {outgoingEntry && isTitlesFading ? (
                          <div
                            className={`${P}-titles-layer-out ${P}-titles-fade-out`}
                            style={titlesGapStyle}
                          >
                            {renderTitles(outgoingEntry)}
                          </div>
                        ) : null}
                        <div
                          className={`${P}-titles-layer-in${isTitlesFading ? ` ${P}-titles-layer-in-fading ${P}-titles-fade-in` : ''}`}
                          style={titlesGapStyle}
                        >
                          {renderTitles(activeEntry, true)}
                        </div>
                      </div>
                    </>
                  ) : (
                    renderTitles(activeEntry, true)
                  )}
                </div>
              </div>
            )}
            <div className={`${P}-lightbox-persistent-controls`} style={persistentControlsGapStyle}>
              {hasCounter && (
                <div className={`${P}-text-bar-cell`}>
                  <span
                    className={`${P}-entry-counter`}
                    style={countStyle}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {formatSlideCounter(slides, activeSlideIndex, journalType, entries)}
                  </span>
                  {showControls && hasCloseIcon ? renderGapControl('countCloseGap', countCloseGap, true) : null}
                </div>
              )}
              {hasCloseIcon && (
                <div
                  className={`${P}-close-icon`}
                  style={{
                    width: scalingValue(closeIconMaxWidth ?? 0, isEditor),
                    height: scalingValue(closeIconMaxWidth ?? 0, isEditor),
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
                </div>
              )}
            </div>
          </div>
          <div
            data-controls={showControls ? 'contentMarginRight' : undefined}
            data-controls-axis={showControls ? 'x' : undefined}
            data-controls-reverse={showControls ? '' : undefined}
            className={showControls ? `${P}-control` : undefined}
            style={{ width: contentMarginRight, flexShrink: 0 }}
          />
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

export const LightboxJournal = ({ settings, content, isEditor, isEditMode, isPreviewMode, portalId }: LightboxJournalProps) => {
  const { prefix: P } = useScopedStyles();
  const {
    cover,
    coverFit,
    type,
    backgroundColor,
    imageGap,
    maxWidth,
    maxHeight,
    textMaxWidth,
    textTransition,
    titlesGap,
    countCloseGap,
    closeIcon,
    closeIconMaxWidth,
    closeIconColor,
    closeIconHoverColor,
    contentMarginTop,
    contentMarginLeft,
    contentMarginRight,
  } = settings;
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);

  const title1Style = journalTextFieldsToCss('title1', resolveJournalTextFields(settings, 'title1'), isEditor);
  const title2Style = journalTextFieldsToCss('title2', resolveJournalTextFields(settings, 'title2'), isEditor);
  const title3Style = journalTextFieldsToCss('title3', resolveJournalTextFields(settings, 'title3'), isEditor);
  const countStyle = journalTextFieldsToCss('count', resolveJournalTextFields(settings, 'count'), isEditor);
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
  const shouldSyncUrl = !isEditor || Boolean(isPreviewMode);

  const removeJournalUrl = useCallback(() => {
    if (!shouldSyncUrl) return;
    isClosingFromUrlRef.current = true;
    removeJournalUrlParam(urlHistoryPushedRef.current);
    urlHistoryPushedRef.current = false;
  }, [shouldSyncUrl]);

  const openLightbox = (slideIndex = 0) => {
    if (isEditMode || entries.length === 0) return;
    if (isEditor && !isPreviewMode) return;
    const slides = buildJournalSlides(entries, type);
    const normalizedSlideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));
    setLightboxInitialSlideIndex(normalizedSlideIndex);
    if (shouldSyncUrl) {
      const hadParam = hasJournalUrlParam();
      setJournalUrlParam(normalizedSlideIndex + 1, hadParam);
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
    const slideNumber = findJournalUrlSlideNumber();
    if (!slideNumber) return;
    const slideIndex = slideNumberToIndex(slideNumber, buildJournalSlides(entries, type).length);
    if (slideIndex < 0) return;
    setLightboxInitialSlideIndex(slideIndex);
    setLightboxOpen(true);
  }, [entries, shouldSyncUrl, type]);

  useEffect(() => {
    if (!shouldSyncUrl) return;
    const onPopState = () => {
      if (isClosingFromUrlRef.current) {
        isClosingFromUrlRef.current = false;
        setLightboxOpen(false);
        return;
      }
      const slideNumber = findJournalUrlSlideNumber();
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
  }, [entries, shouldSyncUrl, type]);

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

      {lightboxOpen && typeof document !== 'undefined' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <LightboxOverlay
            prefix={P}
            entries={entries}
            journalType={type}
            coverFit={coverFit}
            backgroundColor={backgroundColor}
            imageGap={scaled(imageGap ?? 0)}
            slideMaxWidth={`${maxWidth}%`}
            slideMaxHeight={`${maxHeight}%`}
            textMaxWidth={scaled(textMaxWidth ?? 0.4)}
            titlesGap={scaled(titlesGap ?? 0)}
            countCloseGap={scaled(countCloseGap ?? 0)}
            textTransition={textTransition}
            title1Style={title1Style}
            title2Style={title2Style}
            title3Style={title3Style}
            countStyle={countStyle}
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
            initialSlideIndex={lightboxInitialSlideIndex}
            enableUrlSync={shouldSyncUrl}
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
  textMaxWidth: number;
  textTransition: 'none' | 'fade';
  titlesGap?: number;
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
  contentMarginLeft: number;
  contentMarginRight: number;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
};
