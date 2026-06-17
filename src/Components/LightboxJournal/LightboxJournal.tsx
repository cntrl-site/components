import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

const LIGHTBOX_ANIM_MS = 300;
const TEXT_FADE_MS = 400;
const SLIDE_FADE_MS = 300;

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
  width: var(--cntrl-article-width, 100vw) !important;
  margin-left: auto;
  margin-right: auto;
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

.${P}-lightbox-strip[data-desktop-nav="true"] {
  cursor: ew-resize;
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
}

.${P}-slide-inner {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.${P}-slide-image-cell {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
}

.${P}-slide-image {
  display: block;
  width: 100%;
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
  align-items: center;
  flex: 1;
  min-width: 0;
}

.${P}-entry-counter {
  position: relative;
  z-index: 2;
  pointer-events: none;
  font-size: 0.85em;
  opacity: 0.7;
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

const getArticleWidthCSSValue = (start: HTMLElement | null): string | undefined => {
  let el = start;
  while (el) {
    const inline = el.style.getPropertyValue('--cntrl-article-width').trim();
    if (inline) return inline;
    const computed = getComputedStyle(el).getPropertyValue('--cntrl-article-width').trim();
    if (computed) return computed;
    el = el.parentElement;
  }
  return undefined;
};

export type LightboxJournalImage = {
  url: string;
  name?: string;
  objectFit?: 'cover' | 'contain';
};

export type LightboxJournalItem = {
  title1: string;
  title2: string;
  title3: string;
  images: LightboxJournalImage[];
};

type LightboxOverlayProps = {
  prefix: string;
  entries: LightboxJournalItem[];
  objectFit: 'cover' | 'contain';
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
  textCountGap: string;
  countCloseGap: string;
  textTransition: 'none' | 'fade';
  title1Style: React.CSSProperties;
  title2Style: React.CSSProperties;
  title3Style: React.CSSProperties;
  contentMarginTop: string;
  contentMarginLeft: string;
  contentMarginRight: string;
  articleWidthCss?: string;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  onClose: () => void;
};

const GAP_LABEL_AREA_PX = 20;

const getGapControlSize = (gap: string) => `max(${gap}, ${GAP_LABEL_AREA_PX}px)`;

const MAX_IMAGES_PER_ENTRY = 2;

const getEntryImages = (entry: LightboxJournalItem | undefined): LightboxJournalImage[] =>
  (entry?.images ?? []).slice(0, MAX_IMAGES_PER_ENTRY);

const getEntryTitleKey = (entry: LightboxJournalItem | undefined) =>
  entry ? `${entry.title1 ?? ''}|${entry.title2 ?? ''}|${entry.title3 ?? ''}` : '';

const LightboxOverlay = ({
  prefix: P,
  entries,
  objectFit,
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
  articleWidthCss,
  textMaxWidth,
  titlesGap,
  textCountGap,
  countCloseGap,
  textTransition,
  title1Style,
  title2Style,
  title3Style,
  contentMarginTop,
  contentMarginLeft,
  contentMarginRight,
  onClose,
}: LightboxOverlayProps) => {
  const showControls = Boolean(isEditMode);
  const allowDesktopNav = !isEditor || Boolean(isPreviewMode);
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);

  const activeEntry = entries[activeEntryIndex];
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

    const textBarCell = stack.closest(`.${P}-text-bar-cell`) as HTMLElement | null;
    const textBarMarginRight = textBarCell
      ? parseFloat(getComputedStyle(textBarCell).marginRight) || 0
      : 0;

    return contentArea.getBoundingClientRect().width - fixedSiblingsWidth - textBarMarginRight;
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
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, LIGHTBOX_ANIM_MS);
  }, [onClose]);

  const goToEntry = useCallback((index: number) => {
    if (entries.length === 0) return;
    const normalizedIndex = ((index % entries.length) + entries.length) % entries.length;
    if (normalizedIndex === activeEntryIndex) return;

    const outgoingIndex = activeEntryIndex;
    const outgoingEntry = entries[outgoingIndex];
    const incomingEntry = entries[normalizedIndex];
    slideTransitionKeyRef.current += 1;
    const transitionKey = slideTransitionKeyRef.current;
    const shouldFadeTitles = textTransition === 'fade'
      && getEntryTitleKey(outgoingEntry) !== getEntryTitleKey(incomingEntry);
    const measuredOutgoingTitlesHeight = titlesStackRef.current?.getBoundingClientRect().height;
    let measuredIncomingTitlesHeight: number | undefined;
    let incomingTitlesMeasureWidth: number | undefined;
    if (shouldFadeTitles) {
      incomingTitlesMeasureWidth = getIncomingTitlesMeasureWidth();
      flushSync(() => {
        setIncomingMeasureEntry(incomingEntry);
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
    setPrevSlideIndex(outgoingIndex);
    setIsSlideFading(true);
    setActiveEntryIndex(normalizedIndex);
    prevSlideIndexRef.current = normalizedIndex;

    if (shouldFadeTitles) {
      clearTitlesFadeTimer();
      if (lockedTitlesHeight) {
        setTitlesStackMinHeight(lockedTitlesHeight);
      }
      if (incomingTitlesMeasureWidth) {
        setTitlesStackWidth(incomingTitlesMeasureWidth);
      }
      setPrevEntryIndex(outgoingIndex);
      setIsTitlesFading(true);
      prevEntryIndexRef.current = normalizedIndex;
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
      prevEntryIndexRef.current = normalizedIndex;
    }
  }, [activeEntryIndex, clearTitlesFadeTimer, entries, getIncomingTitlesMeasureWidth, textTransition]);

  const onStripPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowDesktopNav) return;
    if (entries.length <= 1) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-controls]')) return;

    const midPoint = window.innerWidth / 2;
    if (event.clientX < midPoint) {
      goToEntry(activeEntryIndex - 1);
    } else {
      goToEntry(activeEntryIndex + 1);
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (titlesFadeTimerRef.current) {
        clearTimeout(titlesFadeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (textTransition !== 'fade') {
      prevEntryIndexRef.current = activeEntryIndex;
      clearTitlesFadeTimer();
      setPrevEntryIndex(null);
      setIsTitlesFading(false);
      setTitlesStackMinHeight(undefined);
      setTitlesStackWidth(undefined);
    }
  }, [activeEntryIndex, clearTitlesFadeTimer, textTransition]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
      if (event.key === 'ArrowLeft' && entries.length > 1) {
        goToEntry(activeEntryIndex - 1);
      }
      if (event.key === 'ArrowRight' && entries.length > 1) {
        goToEntry(activeEntryIndex + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToEntry, handleClose, activeEntryIndex, entries.length]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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
    prevSlideIndexRef.current = 0;
    prevEntryIndexRef.current = 0;
    setActiveEntryIndex(0);
  }, [clearTitlesFadeTimer, entries.length]);

  const outgoingEntry = prevEntryIndex !== null ? entries[prevEntryIndex] : null;
  const outgoingSlideEntry = prevSlideIndex !== null ? entries[prevSlideIndex] : null;
  const hasTitles = Boolean(
    activeEntry?.title1 || activeEntry?.title2 || activeEntry?.title3
    || outgoingEntry?.title1 || outgoingEntry?.title2 || outgoingEntry?.title3,
  );
  const hasCounter = entries.length > 1;
  const hasCloseIcon = Boolean(closeIcon);
  const titlesGapStyle = { gap: titlesGap };

  const renderGapControl = (controlKey: string, gap: string) => {
    const gapControlSize = getGapControlSize(gap);
    const gapControlRight = `calc(-0.5 * (${gapControlSize} + ${gap}))`;
    return (
      <div
        data-controls={controlKey}
        data-controls-axis="x"
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

  const renderEntryImages = (entry: LightboxJournalItem) => {
    const images = getEntryImages(entry);
    if (images.length === 0) return null;

    const hasInnerImageGap = images.length > 1;
    const imageGapControlSize = getGapControlSize(imageGap);
    const imageGapControlRight = `calc(-0.5 * (${imageGapControlSize} + ${imageGap}))`;

    if (images.length === 1) {
      const image = images[0];
      const itemObjectFit = image.objectFit ?? objectFit;
      return (
        <img
          className={`${P}-slide-image`}
          src={image.url}
          alt={image.name ?? ''}
          draggable={false}
          style={{ objectFit: itemObjectFit }}
        />
      );
    }

    return (
      <div
        className={`${P}-slide-inner`}
        style={hasInnerImageGap ? { gap: imageGap } : undefined}
      >
        {images.map((image, imageIndex) => {
          const itemObjectFit = image.objectFit ?? objectFit;
          return (
            <div
              key={`${image.url}-${imageIndex}`}
              className={`${P}-slide-image-cell`}
            >
              <img
                className={`${P}-slide-image`}
                src={image.url}
                alt={image.name ?? ''}
                draggable={false}
                style={{ objectFit: itemObjectFit }}
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
      data-selection="none"
      className={`${P}-lightbox${isEditor ? ` ${P}-lightbox-editor` : ''}${isEditMode ? ` ${P}-lightbox-edit-mode` : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Journal gallery"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${LIGHTBOX_ANIM_MS}ms ease`,
        pointerEvents: isVisible ? 'auto' : 'none',
        ...(articleWidthCss ? { ['--cntrl-article-width' as string]: articleWidthCss } : {}),
      }}
    >
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor }} />
      <div
        className={`${P}-lightbox-content`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`${P}-lightbox-strip`}
          data-desktop-nav={allowDesktopNav && entries.length > 1 ? 'true' : 'false'}
          onPointerUp={allowDesktopNav ? onStripPointerUp : undefined}
        >
          <div className={`${P}-slide-stack`}>
            {outgoingSlideEntry && isSlideFading ? (
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
                  style={{
                    maxWidth: slideMaxWidth,
                    maxHeight: slideMaxHeight,
                  }}
                >
                  {renderEntryImages(outgoingSlideEntry)}
                </div>
              </div>
            ) : null}
            <div
              key={`slide-in-${slideTransitionKey}-${activeEntryIndex}`}
              className={`${P}-slide-layer-in${isSlideFading ? ` ${P}-slide-fade-in` : ''}`}
            >
              <div
                className={`${P}-slide-area`}
                style={{
                  maxWidth: slideMaxWidth,
                  maxHeight: slideMaxHeight,
                }}
              >
                {activeEntry ? renderEntryImages(activeEntry) : null}
              </div>
            </div>
          </div>
        </div>

        <div className={`${P}-lightbox-content-inner`} style={{ width: '100%', height: '100%' }}>
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
                <div
                  className={`${P}-text-bar-cell`}
                  style={hasCounter ? { marginRight: textCountGap } : undefined}
                >
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
                  {showControls && hasCounter ? renderGapControl('textCountGap', textCountGap) : null}
                </div>
              )}
              {hasCounter && (
                <div
                  className={`${P}-text-bar-cell`}
                  style={hasCloseIcon ? { marginRight: countCloseGap } : undefined}
                >
                  <span className={`${P}-entry-counter`} style={{ color: title1Style.color }}>
                    {activeEntryIndex + 1} / {entries.length}
                  </span>
                  {showControls && hasCloseIcon ? renderGapControl('countCloseGap', countCloseGap) : null}
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
            <div
              data-controls={showControls ? 'contentMarginRight' : undefined}
              data-controls-axis={showControls ? 'x' : undefined}
              className={showControls ? `${P}-control` : undefined}
              style={{ width: contentMarginRight, flexShrink: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

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
    backgroundColor,
    objectFit,
    imageGap,
    maxWidth,
    maxHeight,
    textMaxWidth,
    textTransition,
    titlesGap,
    textCountGap,
    countCloseGap,
    fontFamily,
    title1Color,
    title2Color,
    title3Color,
    title1FontSettings,
    title1FontSize,
    title1LineHeight,
    title1LetterSpacing,
    title1WordSpacing,
    title1TextAppearance,
    title2FontSettings,
    title2FontSize,
    title2LineHeight,
    title2LetterSpacing,
    title2WordSpacing,
    title2TextAppearance,
    title3FontSettings,
    title3FontSize,
    title3LineHeight,
    title3LetterSpacing,
    title3WordSpacing,
    title3TextAppearance,
    closeIcon,
    closeIconMaxWidth,
    closeIconColor,
    closeIconHoverColor,
    contentMarginTop,
    contentMarginLeft,
    contentMarginRight,
  } = settings;

  const scaled = (value: number) => scalingValue(value, isEditor ?? false);

  const resolvedTitle1TextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: title1FontSettings?.fontWeight ?? 400,
      fontStyle: title1FontSettings?.fontStyle ?? 'normal',
    },
    fontSize: title1FontSize ?? 0.04,
    lineHeight: title1LineHeight,
    letterSpacing: title1LetterSpacing ?? 0,
    wordSpacing: title1WordSpacing ?? 0,
    textAppearance: title1TextAppearance,
    color: title1Color ?? '#ffffff',
  };
  const resolvedTitle2TextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: title2FontSettings?.fontWeight ?? 400,
      fontStyle: title2FontSettings?.fontStyle ?? 'normal',
    },
    fontSize: title2FontSize ?? 0.03,
    lineHeight: title2LineHeight,
    letterSpacing: title2LetterSpacing ?? 0,
    wordSpacing: title2WordSpacing ?? 0,
    textAppearance: title2TextAppearance,
    color: title2Color ?? '#ffffff',
  };
  const resolvedTitle3TextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: title3FontSettings?.fontWeight ?? 400,
      fontStyle: title3FontSettings?.fontStyle ?? 'normal',
    },
    fontSize: title3FontSize ?? 0.025,
    lineHeight: title3LineHeight,
    letterSpacing: title3LetterSpacing ?? 0,
    wordSpacing: title3WordSpacing ?? 0,
    textAppearance: title3TextAppearance,
    color: title3Color ?? '#ffffff',
  };
  const title1Style = textStylesToCss(resolvedTitle1TextStyle, isEditor);
  const title2Style = textStylesToCss(resolvedTitle2TextStyle, isEditor);
  const title3Style = textStylesToCss(resolvedTitle3TextStyle, isEditor);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [articleWidthCss, setArticleWidthCss] = useState<string | undefined>();
  const entries = (content ?? []).filter((entry) => getEntryImages(entry).length > 0);

  const openLightbox = () => {
    if (entries.length === 0) return;
    if (isEditor && wrapperRef.current) {
      setArticleWidthCss(getArticleWidthCSSValue(wrapperRef.current));
    }
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
            style={{
              display: 'block',
              padding: 0,
              border: 'none',
              background: 'transparent',
            }}
            aria-label="Open journal gallery"
          >
            <img
              className={`${P}-cover-image`}
              src={cover}
              alt="cover"
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
            entries={entries}
            objectFit={objectFit === 'fit' ? 'contain' : 'cover'}
            backgroundColor={backgroundColor}
            imageGap={scaled(imageGap ?? 0)}
            slideMaxWidth={`${maxWidth}%`}
            slideMaxHeight={`${maxHeight}%`}
            textMaxWidth={scaled(textMaxWidth ?? 0.4)}
            titlesGap={scaled(titlesGap ?? 0)}
            textCountGap={scaled(textCountGap ?? 0)}
            countCloseGap={scaled(countCloseGap ?? 0)}
            textTransition={textTransition}
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
            articleWidthCss={articleWidthCss}
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

export type LightboxJournalSettings = {
  cover: string | null;
  coverFit: 'cover' | 'fit';
  maxWidth: number;
  maxHeight: number;
  backgroundColor: string;
  objectFit: 'cover' | 'fit';
  imageGap?: number;
  textMaxWidth: number;
  textTransition: 'none' | 'fade';
  titlesGap?: number;
  textCountGap?: number;
  countCloseGap?: number;
  fontFamily?: string;
  title1Color: string;
  title2Color: string;
  title3Color: string;
  title1FontSettings?: { fontWeight: number; fontStyle: string };
  title1FontSize: number;
  title1LineHeight?: number;
  title1LetterSpacing?: number;
  title1WordSpacing?: number;
  title1TextAppearance?: TextStyles['textAppearance'];
  title2FontSettings?: { fontWeight: number; fontStyle: string };
  title2FontSize: number;
  title2LineHeight?: number;
  title2LetterSpacing?: number;
  title2WordSpacing?: number;
  title2TextAppearance?: TextStyles['textAppearance'];
  title3FontSettings?: { fontWeight: number; fontStyle: string };
  title3FontSize: number;
  title3LineHeight?: number;
  title3LetterSpacing?: number;
  title3WordSpacing?: number;
  title3TextAppearance?: TextStyles['textAppearance'];
  contentMarginTop: number;
  contentMarginLeft: number;
  contentMarginRight: number;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
};
