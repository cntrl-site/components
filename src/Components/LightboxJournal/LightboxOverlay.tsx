import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { getAspectRatio, isImageRatioCover } from '../utils/imageFitStyles';
import { useLightboxSwipeDismiss } from '../utils/useLightboxSwipeDismiss';
import { useLightboxScrollLock } from '../utils/useLightboxScrollLock';
import type { LightboxJournalImage, LightboxJournalItem, LightboxJournalSettings } from './LightboxJournal';
import {
  buildJournalSlides,
  buildJournalTitleSlots,
  DEFAULT_JOURNAL_TITLE_WIDTHS,
  formatSlideCounter,
  getEffectiveJournalTitleWidths,
  getEntryTitleKey,
  getGapControlSize,
  getJournalTitleBoundaryOffset,
  getJournalTitleMaxWidth,
  getJournalTitleOffsetBeforeSlot,
  getRowScopedJournalTitleWidths,
  journalTextFieldsToCss,
  resolveJournalTextFields,
  resolveJournalTitleWidths,
  setJournalUrlParam,
  shouldShowCounter,
  STRIP_NAV_SWIPE_MIN_PX,
  STRIP_NAV_TAP_MAX_PX,
  TITLE_PADDING_HANDLE_WIDTH,
  TITLE_RESIZE_HANDLE_WIDTH,
  type JournalTitleSlot,
} from './utils';

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

export const LightboxOverlay = ({
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
    }, 300);
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
    animMs: 300,
    isBlockedTarget: isSwipeBlockedTarget,
  });

  const syncUrlToSlide = useCallback((slideIndex: number) => {
    if (!enableUrlSync) return;
    setJournalUrlParam(slideIndex + 1, journalItemId, true);
  }, [enableUrlSync, journalItemId]);

  const measureTitlesLayoutHeight = useCallback((element: HTMLElement | null | undefined) => {
    if (!element) return undefined;
    return element.getBoundingClientRect().height;
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (slides.length === 0) return;
    const normalizedIndex = ((index % slides.length) + slides.length) % slides.length;
    if (normalizedIndex === activeSlideIndex) return;
    const outgoingSlide = slides[activeSlideIndex];
    const incomingSlide = slides[normalizedIndex];
    slideTransitionKeyRef.current += 1;
    const transitionKey = slideTransitionKeyRef.current;
    const shouldFadeTitles = textTransition === 'fade' && getEntryTitleKey(outgoingSlide?.entry) !== getEntryTitleKey(incomingSlide?.entry);
    const measuredOutgoingTitlesHeight = measureTitlesLayoutHeight(titlesMeasureRef.current);
    const titleFadeMeasure = shouldFadeTitles ? (() => {
      const incomingTitlesMeasureWidth = getIncomingTitlesMeasureWidth();
      flushSync(() => {
        setIncomingMeasureEntry(incomingSlide.entry);
      });
      if (titlesMeasureRef.current && incomingTitlesMeasureWidth) {
        titlesMeasureRef.current.style.width = `${incomingTitlesMeasureWidth}px`;
      }
      const measuredIncomingTitlesHeight = measureTitlesLayoutHeight(titlesMeasureRef.current);
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
      }, 400);
    } else {
      clearTitlesFadeTimer();
      setPrevEntryIndex(null);
      setIsTitlesFading(false);
      setTitlesStackMinHeight(undefined);
      setTitlesStackWidth(undefined);
      setIncomingMeasureEntry(null);
      prevEntryIndexRef.current = incomingSlide.entryIndex;
    }
  }, [activeSlideIndex, clearTitlesFadeTimer, getIncomingTitlesMeasureWidth, measureTitlesLayoutHeight, slides, syncUrlToSlide, textTransition]);

  const resetStripNavGesture = useCallback(() => {
    stripNavGestureRef.current = null;
  }, []);

  const onStripPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
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

  const onStripPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
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

  const onStripPointerCancel = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
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
    const maxIndex = Math.max(0, slides.length - 1);
    const clampedIndex = Math.min(Math.max(0, initialSlideIndex), maxIndex);
    prevSlideIndexRef.current = clampedIndex;
    prevEntryIndexRef.current = slides[clampedIndex]?.entryIndex ?? 0;
    setActiveSlideIndex(clampedIndex);
  }, [initialSlideIndex]);

  const outgoingEntry = prevEntryIndex !== null ? entries[prevEntryIndex] : null;
  const outgoingSlide = prevSlideIndex !== null ? slides[prevSlideIndex] : null;
  const hasTitles = activeEntry?.title1 || activeEntry?.title2 || activeEntry?.title3 || outgoingEntry?.title1 || outgoingEntry?.title2 || outgoingEntry?.title3;
  const hasCounter = shouldShowCounter(journalType, slides, entries);
  const hasCloseIcon = closeIcon !== null;
  const hasHeaderContent = hasTitles || hasCounter || hasCloseIcon;
  const headerControlsGapStyle = hasCounter && hasCloseIcon ? { gap: countCloseGap } : undefined;
  const titlesStackClassName = `${P}-titles-stack${useTwoRowHeader ? ` ${P}-titles-stack-stacked` : ''}`;
  const titlesLayerOutClassName = `${P}-titles-layer-out${useTwoRowHeader ? ` ${P}-titles-layer-out-stacked` : ''}`;
  const titlesLayerOutTopClassName = `${P}-titles-layer-out`;
  const showTitle1MarginLeftSpacer = (title1MarginLeft ?? 0) > 0 || isEditMode;
  const titleRowMarginBottomScaled = scaled(titleRowMarginBottom);
  const titleWidthByKey = useMemo(
    () => ({
      title1Width: title1Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title1Width,
      title2Width: title2Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title2Width,
      title3Width: title3Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title3Width,
    }),
    [title1Width, title2Width, title3Width],
  );
  const titleMarginLeftByKey = useMemo(() => ({
    title2MarginLeft,
    title3MarginLeft,
  }), [title2MarginLeft, title3MarginLeft]);
  const activeTitleSlots = useMemo(
    () => (activeEntry ? buildJournalTitleSlots(P, activeEntry, title1Style, title2Style, title3Style) : []),
    [P, activeEntry, title1Style, title2Style, title3Style],
  );
  const storedTitleWidths = useMemo(() => activeTitleSlots.map((slot) => titleWidthByKey[slot.widthKey]),
    [activeTitleSlots, titleWidthByKey],
  );
  const resolvedTitleWidths = useMemo(() => resolveJournalTitleWidths(activeTitleSlots.length, storedTitleWidths),
    [activeTitleSlots.length, storedTitleWidths],
  );
  const effectiveTitleWidths = useMemo(() => getEffectiveJournalTitleWidths(activeTitleSlots.length, storedTitleWidths),
    [activeTitleSlots.length, storedTitleWidths],
  );
  const topRowTitleSlots = useMemo(() => activeTitleSlots.filter((slot) => slot.prefix === 'title1'),
    [activeTitleSlots],
  );
  const bottomRowTitleSlots = useMemo(() => activeTitleSlots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3'),
    [activeTitleSlots],
  );
  const topRowTitleWidths = useMemo(() => getRowScopedJournalTitleWidths(topRowTitleSlots, titleWidthByKey),
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
    const marginLeft = slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0;
    const {
      effectiveWidth,
      resolvedWidth,
      maxWidth: maxTitleWidth,
    } = widthContext ?? getSlotTitleWidthContext(slot, rowLayout);
    const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);
    const showCellControls = isEditMode && rowLayout === 'two-row-top';

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
      {...(isEditMode ? {
        'data-controls': 'title1MarginLeft',
        'data-controls-axis': 'x',
      } : {})}
      style={{
        width: scaled(title1MarginLeft ?? 0),
        flexShrink: 0,
        alignSelf: 'stretch',
        ...(isEditMode ? { pointerEvents: 'auto' as const } : {}),
      }}
    />
  );
  // Needed for baseline alignment
  const renderTitleBaselineStrut = () => (
    <span
      className={`${P}-titles-baseline-strut`}
      style={title1Style}
      aria-hidden="true"
    >
      {'\u00a0'}
    </span>
  );

  const renderEntryCounterSpan = () => (
    <span
      className={`${P}-entry-counter`}
      style={countStyle}
      aria-live="polite"
      aria-atomic="true"
    >
      {formatSlideCounter(slides, activeSlideIndex, journalType, entries)}
    </span>
  );

  const renderEntryCounterInline = () => {
    if (!hasCounter) return null;
    if (isEditMode && hasCloseIcon) {
      return (
        <div className={`${P}-text-bar-cell`} style={{ flexShrink: 0 }}>
          {renderEntryCounterSpan()}
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
        </div>
      );
    }
    return renderEntryCounterSpan();
  };

  const renderHeaderTrailingControls = () => {
    if (!hasCounter && !hasCloseIcon) return null;
    return (
      <div
        className={`${P}-titles-row-header-controls`}
        style={headerControlsGapStyle}
      >
        {renderEntryCounterInline()}
        {hasCloseIcon ? renderCloseIcon() : null}
      </div>
    );
  };

  const renderSingleRowHeaderStatic = () => (
    <div
      className={`${P}-titles-row ${P}-titles-row-header`}
      style={{
        width: '100%',
        position: 'relative',
      }}
    >
      {(hasCounter || hasTitles) ? renderTitleBaselineStrut() : null}
      {showTitle1MarginLeftSpacer ? renderTitle1MarginLeftSpacer() : null}
      {renderSingleRowTitles(activeEntry)}
      <div style={{ flex: 1, minWidth: 0 }} aria-hidden="true" />
      {renderHeaderTrailingControls()}
      {renderTitleControls()}
    </div>
  );

  const renderSingleRowHeaderFade = () => (
    <div
      className={`${P}-titles-row ${P}-titles-row-header`}
      style={{ width: '100%' }}
    >
      {(hasCounter || hasTitles) ? renderTitleBaselineStrut() : null}
      {showTitle1MarginLeftSpacer ? renderTitle1MarginLeftSpacer() : null}
      <div
        className={`${P}-titles-row-titles`}
        style={isTitlesFading && titlesStackMinHeight ? { minHeight: titlesStackMinHeight } : undefined}
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
          {incomingMeasureEntry ? renderTitles(incomingMeasureEntry) : renderTitles(activeEntry)}
        </div>
        <div
          ref={titlesStackRef}
          className={titlesStackClassName}
          style={{
            position: isTitlesFading ? 'absolute' : 'relative',
            inset: isTitlesFading ? 0 : undefined,
            width: '100%',
            ...(isTitlesFading && titlesStackWidth ? { width: titlesStackWidth, maxWidth: '100%' } : undefined),
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
        </div>
        {renderTitleControls()}
      </div>
      {renderHeaderTrailingControls()}
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
        <SvgImage
          url={closeIcon ?? ''}
          fill={closeIconColor}
          hoverFill={isEditor && !isPreviewMode ? closeIconColor : closeIconHoverColor}
          className={`${P}-close-icon-img`}
        />
      </button>
      {isEditMode && (
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
      )}
    </div>
  );

  const renderTwoRowTopRow = (titleContent: ReactNode, titlesMinHeight?: number) => (
    <div
      className={`${P}-titles-row-top`}
    >
      {(hasCounter || hasTitles) ? renderTitleBaselineStrut() : null}
      {showTitle1MarginLeftSpacer ? renderTitle1MarginLeftSpacer() : null}
      {titlesMinHeight !== undefined ? (
        <div
          className={`${P}-titles-row-titles`}
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            minHeight: titlesMinHeight,
          }}
        >
          {titleContent}
        </div>
      ) : (
        <>
          {titleContent}
          <div style={{ flex: 1, minWidth: 0 }} aria-hidden="true" />
        </>
      )}
      {renderHeaderTrailingControls()}
    </div>
  );

  const renderSingleRowTitles = (entry: LightboxJournalItem | undefined) => {
    if (!entry) return null;
    const slots = buildJournalTitleSlots(P, entry, title1Style, title2Style, title3Style);

    return (
      <>
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
    if (!title1Slot) return null;

    return renderTitleCell(
      title1Slot,
      'two-row-top',
      getEntryTitleCellWidthContext(slots, title1Slot, 'two-row-top'),
    );
  };

  const renderTwoRowBottomTitles = (entry: LightboxJournalItem | undefined, includeControls = false) => {
    const slots = entry
      ? buildJournalTitleSlots(P, entry, title1Style, title2Style, title3Style)
      : [];
    const bottomSlots = slots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3');
    const showMarginBottomControl = isEditMode && includeControls;
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
            {includeControls && isEditMode ? (
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
      {renderTwoRowTopRow(renderTwoRowTopTitle(entry))}
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
    const singleRowTitle1Control = !useTwoRowHeader && (isEditMode || (title1MarginLeft ?? 0) > 0) ? (() => {
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
    if (!isEditMode || useTwoRowHeader) return null;
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
          ? ({ '--image-aspect-ratio': getAspectRatio(coverFit) } as CSSProperties)
          : {}),
      },
    };
  };

  const getSlideImageProps = (image: LightboxJournalImage) => {
    if (image.objectFit) {
      return {
        className: `${P}-slide-image ${P}-slide-image-custom`,
        style: { '--image-object-fit': image.objectFit } as CSSProperties,
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
              {isEditMode && hasInnerImageGap && imageIndex < images.length - 1 && (
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
    || isEditMode,
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
        }}
      >
        {renderTwoRowTopRow(
          <div
            className={titlesStackClassName}
            style={{
              position: isTitlesFading ? 'absolute' : 'relative',
              inset: isTitlesFading ? 0 : undefined,
              width: '100%',
            }}
          >
            {outgoingEntry && isTitlesFading ? (
              <div className={`${titlesLayerOutTopClassName} ${P}-titles-fade-out`}>
                {renderTwoRowTopTitle(outgoingEntry)}
              </div>
            ) : null}
            <div
              className={`${P}-titles-layer-in${isTitlesFading ? ` ${P}-titles-layer-in-fading ${P}-titles-fade-in` : ''}`}
            >
              {renderTwoRowTopTitle(activeEntry)}
            </div>
          </div>,
          isTitlesFading && titlesStackMinHeight ? titlesStackMinHeight : undefined,
        )}
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
      style={{ opacity: isVisible ? 1 : 0,
        transition: `opacity 300ms ease`,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor, ...swipeBackdropStyle }} />
      <div
        className={`${P}-lightbox-dismiss-area`}
        style={dismissAreaStyle}
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
          data-controls={isEditMode ? 'contentMarginTop' : undefined}
          className={isEditMode ? `${P}-control` : undefined}
          style={{ height: contentMarginTop, width: '100%' }}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          ...(useTwoRowHeader ? { flex: 1, minHeight: 0 } : {}),
        }}>
          <div className={`${P}-lightbox-content-area${useTwoRowHeader ? ` ${P}-lightbox-content-area-stacked` : ''}`}>
            {hasHeaderContent && (
              <div
                className={`${P}-text-bar-cell${useTwoRowHeader ? ` ${P}-text-bar-cell-stacked` : ''}`}
                style={!useTwoRowHeader ? { flex: 1, minWidth: 0, width: '100%' } : undefined}
              >
                {useTwoRowHeader
                  ? (textTransition === 'fade' ? renderTwoRowHeaderFade() : renderTwoRowHeaderStatic())
                  : (textTransition === 'fade' ? renderSingleRowHeaderFade() : renderSingleRowHeaderStatic())}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
