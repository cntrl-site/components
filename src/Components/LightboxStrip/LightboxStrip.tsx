import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { useScopedStyles } from '../utils/useScopedStyles';
import { getAspectRatio, isImageRatioCover, type ImageRatioFit } from '../utils/imageFitStyles';
import type { TextStyles } from '../utils/textStylesToCss';
import { scalingValue } from '../utils/scalingValue';
import { LightboxOverlay } from './LightboxOverlay';
import { LIGHTBOX_ANIM_MS } from './utils';
export {
  createStripTextStylePanelTab,
  createStripTextStyleTabContentItems,
  extractTitlesFromLegacyText,
  getStripTextStyleSettingKey,
  resolveStripItemTitles,
  STRIP_GLOBAL_TEXT_STYLE_KEYS,
  STRIP_TEXT_STYLE_PREFIXES,
  STRIP_TEXT_STYLE_TAB_LABELS,
  STRIP_TITLE_WIDTH_KEYS,
} from './utils';
export type {
  StripGlobalTextStyleKey,
  StripTextStylePrefix,
  StripTitleWidthKey,
} from './utils';

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
  top: var(--cntrl-article-top, 0);
  overflow: hidden;
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

.${P}-lightbox-dismiss-area {
  position: relative;
  width: 100%;
  height: 100%;
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

.${P}-strip-item img {
  user-select: none;
}

.${P}-thumbnails-wrap {
  position: absolute;
  left: 16px;
  right: 16px;
  z-index: 2;
  pointer-events: auto;
}

.${P}-thumbnails {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.${P}-thumbnails-track {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-end;
  justify-content: center;
  width: max-content;
  min-width: 100%;
}

.${P}-lightbox-editor.${P}-lightbox-edit-mode .${P}-thumbnails {
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
  border: none;
  background: transparent;
  cursor: pointer;
}

.${P}-thumbnails-track[data-thumbnail-active="outline"] .${P}-thumb[data-active="true"] {
  border-color: var(--thumbnail-active-color, #ffffff);
}

.${P}-thumbnails-track[data-thumbnail-active="color"] .${P}-thumb:not([data-active="true"]) .${P}-thumb-image {
  filter: grayscale(1);
}

.${P}-thumbnails-track[data-thumbnail-active="scale-up"] .${P}-thumb[data-active="true"] {
  transform: scale(1.15);
}

.${P}-thumb-image {
  display: block;
  object-fit: contain;
}

.${P}-thumb-image-cover {
  aspect-ratio: var(--image-aspect-ratio);
  width: auto;
  height: auto;
  object-fit: cover;
}
.${P}-close-icon {
  position: relative;
  flex-shrink: 0;
  grid-area: close;
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

.${P}-header {
  position: relative;
  display: grid;
  flex: 1;
  width: 100%;
  min-width: 0;
  z-index: 2;
  box-sizing: border-box;
  pointer-events: none;
  word-break: break-word;
  align-items: center;
}

.${P}-header-single-row {
  grid-template-columns: auto auto auto auto 1fr auto;
  grid-template-areas: "margin title1 title2 title3 . close";
}

.${P}-header-two-row {
  height: 100%;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.${P}-header-row-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
}

.${P}-header-row-top .${P}-title-cell[data-title="title1"] {
  flex: 0 0 auto;
  min-width: 0;
}

.${P}-header-row-top .${P}-close-icon {
  flex-shrink: 0;
  margin-left: auto;
}

.${P}-header-row-bottom-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: auto;
  flex-shrink: 0;
}

.${P}-header-row-bottom {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  width: 100%;
}

.${P}-header-row-bottom .${P}-title-cell {
  flex: 0 0 auto;
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
  min-height: 0;
  align-items: flex-start;
}

.${P}-lightbox-content-area-stacked {
  align-items: stretch;
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

export type LightboxStripSettings = {
  cover: string | null;
  coverFit: ImageRatioFit;
  backgroundColor: string;
  thumbnailVisibility: 'on' | 'off';
  thumbnailSize: number;
  thumbnailObjectFit: ImageRatioFit;
  thumbnailTrigger: 'click' | 'hover';
  thumbnailActive: 'outline' | 'color' | 'scale-up';
  thumbnailActiveColor: string;
  thumbnailGap: number;
  thumbnailMarginBottom?: number;
  imageGap?: number;
  title1Width: number;
  title2Width: number;
  title3Width: number;
  title1MarginLeft: number;
  title2MarginLeft: number;
  title3MarginLeft: number;
  titleRowMarginBottom?: number;
  titleHeaderLayout?: 'desktop' | 'mobile';
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
  iconMarginLeft: number;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
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
  const { cover, coverFit } = settings;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const items = content ?? [];
  const isOverlayVisible = lightboxOpen && items.length > 0;

  const openLightbox = () => {
    if (items.length === 0) return;
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!isEditor || isEditMode || isPreviewMode) return;
    setLightboxOpen(false);
  }, [isEditor, isEditMode, isPreviewMode]);

  return (
    <>
      <div ref={wrapperRef} className={`${P}-wrapper`}>
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        {cover && (
          <div
            className={`${P}-cover ${isImageRatioCover(coverFit) ? `${P}-ratio-wrapper-cover` : `${P}-ratio-wrapper-fit`}`}
            onClick={() => openLightbox()}
            style={{ ...(isImageRatioCover(coverFit) ? ({ '--image-aspect-ratio': getAspectRatio(coverFit) } as React.CSSProperties) : {}) }}
            aria-label='Open image gallery'
          >
            <img
              className={`${P}-cover-image ${isImageRatioCover(coverFit) ? `${P}-cover-image-cover` : `${P}-cover-image-fit`}`}
              src={cover}
              alt='cover'
            />
          </div>
        )}
      </div>

      {isOverlayVisible && typeof document !== 'undefined' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <LightboxOverlay
            prefix={P}
            images={items}
            settings={settings}
            isEditor={isEditor}
            isEditMode={isEditMode}
            isPreviewMode={isPreviewMode}
            onClose={() => setLightboxOpen(false)}
          />,
          portalTarget,
        );
      })()}
    </>
  );
};
