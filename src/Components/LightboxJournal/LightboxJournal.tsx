import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { useScopedStyles } from '../utils/useScopedStyles';
import { type TextStyles } from '../utils/textStylesToCss';
import { getAspectRatio, isImageRatioCover, type ImageRatioFit } from '../utils/imageFitStyles';
import { LightboxOverlay } from './LightboxOverlay';
import { buildJournalSlides, findJournalUrlSlideNumber, getEntryImages, hasJournalUrlParam, removeJournalUrlParam, setJournalUrlParam, slideNumberToIndex } from './utils';

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
  animation: ${P}-slide-fade-in 300ms ease-in-out forwards;
}

.${P}-slide-fade-out {
  animation: ${P}-slide-fade-out 300ms ease-in-out forwards;
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
  animation: ${P}-titles-fade-in 400ms ease-in-out forwards;
}

.${P}-titles-fade-out {
  animation: ${P}-titles-fade-out 400ms ease-in-out forwards;
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
  const isOverlayVisible = lightboxOpen && entries.length > 0;
  const shouldSyncUrl = !isEditor;

  const removeJournalUrl = useCallback(() => {
    if (!shouldSyncUrl) return;
    isClosingFromUrlRef.current = true;
    removeJournalUrlParam(urlHistoryPushedRef.current, itemId);
    urlHistoryPushedRef.current = false;
  }, [shouldSyncUrl, itemId]);

  const openLightbox = (slideIndex = 0) => {
    if (entries.length === 0) return;
    if (isEditor && !isEditMode && !isPreviewMode) return;
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
    if (!isEditor || isEditMode || isPreviewMode) return;
    setLightboxOpen(false);
  }, [isEditor, isEditMode, isPreviewMode]);

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
              pointerEvents: isEditor && !isEditMode && !isPreviewMode ? 'none' : undefined,
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
  coverFit: ImageRatioFit;
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
