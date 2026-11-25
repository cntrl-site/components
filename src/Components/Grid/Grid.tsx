import { CommonComponentProps } from '../props';
import { EmbedMediaFrame, getEmbedAspect, getEmbedPlayback, isEmbedMedia } from '../utils/index';
import {
  buildColorVars,
  getFormFieldValidationError,
  LinkWrapper,
  scalingValue,
  useLazyVideos,
  useScopedStyles,
} from '../utils/index';
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { LazyVideo } from '../helpers/LazyVideo/LazyVideo';

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function hasText(value: string | undefined): boolean {
  return (value?.trim().length ?? 0) > 0;
}

function getGridTextClassName(
  fontSize: number | undefined,
  lineHeight: number | undefined,
  baseClassName: string,
  tightLeadingClassName: string,
): string {
  const resolvedFontSize = fontSize ?? 0.01;
  const needsTightLeading = lineHeight !== undefined && lineHeight < resolvedFontSize;

  return needsTightLeading
    ? `${baseClassName} ${tightLeadingClassName}`
    : baseClassName;
}

function getGridTextLeadingVars(
  fontSize: number | undefined,
  lineHeight: number | undefined,
  varPrefix: string,
  isEditor?: boolean,
): React.CSSProperties {
  const resolvedFontSize = fontSize ?? 0.01;

  if (lineHeight === undefined || lineHeight >= resolvedFontSize) {
    return {};
  }

  return {
    [`--${varPrefix}-title-leading-gap`]: scalingValue((resolvedFontSize - lineHeight) / 2, isEditor),
  } as React.CSSProperties;
}

const HOVER_ANIM_MS = 400;
const HOVER_EASING = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
const HOVER_ZOOM = 1.1;
const MEDIA_RADIUS_VAR = '--grid-media-radius';

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  display: grid;
  align-items: start;
  justify-content: center;
  min-height: ${sv(48)};
}
.${P}-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.${P}-item-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: 1px solid #FF5C02;
}
.${P}-item-inner-hidden {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.${P}-item-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
}
.${P}-item-image-wrapper-fit-slider {
  display: grid;
  overflow: hidden;
  position: relative;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer {
  grid-area: 1 / 1;
  width: 100%;
  display: grid;
  visibility: hidden;
  pointer-events: none;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer img {
  grid-area: 1 / 1;
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer video {
  grid-area: 1 / 1;
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer div {
  grid-area: 1 / 1;
  width: 100%;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-slider {
  position: absolute;
  inset: 0;
  width: 100%;
  overflow: hidden;
}
.${P}-item-image-link {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.${P}-custom-layout .${P}-item-image-link {
  flex: 1 1 0%;
  min-height: 0;
}
.${P}-custom-layout.${P}-text-outside .${P}-item-image-link,
.${P}-custom-layout.${P}-auto-height .${P}-item-image-link {
  flex: none;
}
.${P}-auto-height .${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer :is(img, video) {
  width: 100%;
}
.${P}-item-text-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: inherit;
  text-decoration: none;
}
.${P}-item-image {
  width: 100%;
  height: 100%;
  display: block;
  max-width: 100%;
}
.${P}-item-video {
  width: 100%;
  height: 100%;
  display: block;
  max-width: 100%;
}
.${P}-item-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.${P}-item-slider-list {
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  will-change: transform;
}
.${P}-item-slider-list-vertical {
  flex-direction: column;
}
.${P}-item-slider-list-fade {
  display: block;
  will-change: auto;
}
.${P}-item-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.${P}-item-slider-list-fade .${P}-item-slide {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity ${SLIDER_TRANSITION_MS}ms ${SLIDER_EASING};
}
.${P}-item-slider-list-fade .${P}-item-slide-active {
  opacity: 1;
  z-index: 1;
}
.${P}-item-title {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  text-align: center;
  margin-bottom: 0px;
  margin-top: 0px;
  color: var(--${P}-title-color);
}
.${P}-item-subtitle {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  text-align: center;
  margin-bottom: 0px;
  margin-top: 0px;
  color: var(--${P}-subtitle-color);
}
.${P}-text-tight-leading {
  display: block;
  flex-shrink: 0;
  padding-top: var(--${P}-title-leading-gap, 0);
  padding-bottom: var(--${P}-title-leading-gap, 0);
}
.${P}-show-text-hover .${P}-item-title,
.${P}-show-text-hover .${P}-item-subtitle {
  opacity: 0;
  transition: opacity 250ms;
}
.${P}-show-text-hover .${P}-item-inner:hover .${P}-item-title,
.${P}-show-text-hover .${P}-item-inner:hover .${P}-item-subtitle,
.${P}-show-text-hover .${P}-item-inner-hidden:hover .${P}-item-title,
.${P}-show-text-hover .${P}-item-inner-hidden:hover .${P}-item-subtitle {
  opacity: 1;
}
@property --${P}-hover-zoom {
  syntax: '<number>';
  inherits: false;
  initial-value: 1;
}
.${P}-hover-zoom-in .${P}-item-image,
.${P}-hover-zoom-in .${P}-item-video {
  transform: scale(var(--${P}-hover-zoom));
  clip-path: inset(calc(50% - 50% / var(--${P}-hover-zoom)) round calc(var(${MEDIA_RADIUS_VAR}, 0px) / var(--${P}-hover-zoom)));
  transition: --${P}-hover-zoom ${HOVER_ANIM_MS}ms ${HOVER_EASING};
}
.${P}-hover-scale-down .${P}-item-image,
.${P}-hover-scale-down .${P}-item-video {
  transition: transform ${HOVER_ANIM_MS}ms ${HOVER_EASING};
}
.${P}-hover-greyscale .${P}-item-image-wrapper {
  transition: filter ${HOVER_ANIM_MS}ms ${HOVER_EASING};
}
@media (hover: hover) {
  .${P}-hover-zoom-in .${P}-item-image-wrapper:has(.${P}-item-image:hover, .${P}-item-video:hover) :is(.${P}-item-image, .${P}-item-video) {
    --${P}-hover-zoom: ${HOVER_ZOOM};
  }
  .${P}-hover-scale-down .${P}-item-image-wrapper:hover .${P}-item-image,
  .${P}-hover-scale-down .${P}-item-image-wrapper:hover .${P}-item-video {
    transform: scale(0.9);
  }
  .${P}-hover-greyscale:has(.${P}-item-image:hover, .${P}-item-video:hover) .${P}-item-image-wrapper:not(:has(.${P}-item-image:hover, .${P}-item-video:hover)) {
    filter: grayscale(1);
  }
}
.${P}-type-a .${P}-item-inner,
.${P}-type-a .${P}-item-inner-hidden,
.${P}-type-d .${P}-item-inner,
.${P}-type-d .${P}-item-inner-hidden {
  align-items: flex-start;
}
.${P}-type-b .${P}-item-inner,
.${P}-type-b .${P}-item-inner-hidden,
.${P}-type-e .${P}-item-inner,
.${P}-type-e .${P}-item-inner-hidden {
  align-items: center;
}
.${P}-type-c .${P}-item-inner,
.${P}-type-c .${P}-item-inner-hidden,
.${P}-type-f .${P}-item-inner,
.${P}-type-f .${P}-item-inner-hidden {
  align-items: flex-end;
}
.${P}-type-a .${P}-item-image-link,
.${P}-type-b .${P}-item-image-link,
.${P}-type-c .${P}-item-image-link,
.${P}-type-d .${P}-item-image-link,
.${P}-type-e .${P}-item-image-link,
.${P}-type-f .${P}-item-image-link {
  align-items: center;
}
.${P}-type-a .${P}-item-title,
.${P}-type-a .${P}-item-subtitle,
.${P}-type-d .${P}-item-title,
.${P}-type-d .${P}-item-subtitle {
  text-align: left;
}
.${P}-type-b .${P}-item-title,
.${P}-type-b .${P}-item-subtitle,
.${P}-type-e .${P}-item-title,
.${P}-type-e .${P}-item-subtitle {
  text-align: center;
}
.${P}-type-c .${P}-item-title,
.${P}-type-c .${P}-item-subtitle,
.${P}-type-f .${P}-item-title,
.${P}-type-f .${P}-item-subtitle {
  text-align: right;
}
.${P}-item-text-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  flex-shrink: 0;
}
.${P}-type-d .${P}-item-text-block {
  align-items: flex-start;
}
.${P}-type-e .${P}-item-text-block {
  align-items: center;
}
.${P}-type-f .${P}-item-text-block {
  align-items: flex-end;
}
.${P}-type-a .${P}-item-text-link,
.${P}-type-d .${P}-item-text-link {
  align-items: flex-start;
}
.${P}-type-b .${P}-item-text-link,
.${P}-type-e .${P}-item-text-link {
  align-items: center;
}
.${P}-type-c .${P}-item-text-link,
.${P}-type-f .${P}-item-text-link {
  align-items: flex-end;
}
.${P}-image-align-top .${P}-item-image-wrapper:not(.${P}-item-image-wrapper-fit-slider) {
  align-items: flex-start;
}
.${P}-image-align-center .${P}-item-image-wrapper:not(.${P}-item-image-wrapper-fit-slider) {
  align-items: center;
}
.${P}-image-align-bottom .${P}-item-image-wrapper:not(.${P}-item-image-wrapper-fit-slider) {
  align-items: flex-end;
}
.${P}-image-align-top .${P}-item-slider .${P}-item-slide {
  align-items: flex-start;
}
.${P}-image-align-center .${P}-item-slider .${P}-item-slide {
  align-items: center;
}
.${P}-image-align-bottom .${P}-item-slider .${P}-item-slide {
  align-items: flex-end;
}
.${P}-align-entries .${P}-item {
  display: contents;
}
.${P}-align-entries .${P}-item-inner,
.${P}-align-entries .${P}-item-inner-hidden {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
  justify-self: center;
  margin-bottom: var(--${P}-align-entries-row-gap, 0);
}
.${P}-align-entries .${P}-item-inner-last-row {
  margin-bottom: 0;
}
.${P}-align-entries .${P}-item-text-link {
  display: contents;
}
.${P}-align-entries .${P}-item-title-row,
.${P}-align-entries .${P}-item-subtitle-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-height: 100%;
}
.${P}-type-a.${P}-align-entries .${P}-item-title-row,
.${P}-type-a.${P}-align-entries .${P}-item-subtitle-row,
.${P}-type-d.${P}-align-entries .${P}-item-title-row,
.${P}-type-d.${P}-align-entries .${P}-item-subtitle-row {
  align-items: flex-start;
}
.${P}-type-b.${P}-align-entries .${P}-item-title-row,
.${P}-type-b.${P}-align-entries .${P}-item-subtitle-row,
.${P}-type-e.${P}-align-entries .${P}-item-title-row,
.${P}-type-e.${P}-align-entries .${P}-item-subtitle-row {
  align-items: center;
}
.${P}-type-c.${P}-align-entries .${P}-item-title-row,
.${P}-type-c.${P}-align-entries .${P}-item-subtitle-row,
.${P}-type-f.${P}-align-entries .${P}-item-title-row,
.${P}-type-f.${P}-align-entries .${P}-item-subtitle-row {
  align-items: flex-end;
}
.${P}-align-entries .${P}-item-image-link {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.${P}-align-entries .${P}-item-image-link > .${P}-item-image-wrapper {
  flex-shrink: 0;
  height: auto;
  align-self: auto;
}
.${P}-image-align-top.${P}-align-entries .${P}-item-image-link > .${P}-item-image-wrapper {
  margin-top: 0;
  margin-bottom: auto;
}
.${P}-image-align-center.${P}-align-entries .${P}-item-image-link > .${P}-item-image-wrapper {
  margin-top: auto;
  margin-bottom: auto;
}
.${P}-image-align-bottom.${P}-align-entries .${P}-item-image-link > .${P}-item-image-wrapper {
  margin-top: auto;
  margin-bottom: 0;
}
.${P}-image-align-top.${P}-align-entries .${P}-item-image-wrapper:not(.${P}-item-image-wrapper-fit-slider) {
  align-items: flex-start;
}
.${P}-image-align-center.${P}-align-entries .${P}-item-image-wrapper:not(.${P}-item-image-wrapper-fit-slider) {
  align-items: center;
}
.${P}-image-align-bottom.${P}-align-entries .${P}-item-image-wrapper:not(.${P}-item-image-wrapper-fit-slider) {
  align-items: flex-end;
}
.${P}-image-align-top.${P}-align-entries .${P}-item-slider .${P}-item-slide {
  align-items: flex-start;
}
.${P}-image-align-center.${P}-align-entries .${P}-item-slider .${P}-item-slide {
  align-items: center;
}
.${P}-image-align-bottom.${P}-align-entries .${P}-item-slider .${P}-item-slide {
  align-items: flex-end;
}
.${P}-image-align-top.${P}-align-entries .${P}-item-image-link {
  justify-content: flex-start;
}
.${P}-image-align-center.${P}-align-entries .${P}-item-image-link {
  justify-content: center;
}
.${P}-image-align-bottom.${P}-align-entries .${P}-item-image-link {
  justify-content: flex-end;
}
.${P}-lightbox-counter {
  margin: 0;
  color: var(--${P}-lightbox-counter-color);
}
.${P}-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9997;
  overscroll-behavior: none;
  overflow: hidden;
}
.${P}-lightbox-editor {
  inset: auto;
  top: var(--cntrl-article-top, 0);
  left: var(--cntrl-article-left, 0);
  width: var(--cntrl-article-width, 100vw) !important;
  height: var(--cntrl-viewport-height, 100vh) !important;
}
.${P}-control {
  position: relative;
  z-index: 2;
  width: 100%;
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
`;
}

function pickRandomSlideDirection(): 'ltr' | 'ttb' {
  return Math.random() < 0.5 ? 'ltr' : 'ttb';
}

function wrapSlideIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

type GridProps = {
  layoutId?: string;
  settings: GridSettings;
  content?: any;
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  activeEvent: string | undefined;
  portalId?: string;
  onUpdateSettings?: (settings: GridSettings) => void;
} & CommonComponentProps;

type AnimRect = { top: number; left: number; width: number; height: number };

type LightboxProps = {
  prefix: string;
  items: GridMedia[];
  index: number;
  imageDisplay: 'fit' | 'cover';
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  counterClassName: string;
  counterStyle: React.CSSProperties;
  closeIcon?: string | null;
  closeIconMaxWidth?: number;
  closeIconColor?: string;
  closeIconHoverColor?: string;
  iconMarginRight?: number;
  contentMarginTop?: number;
};

const LIGHTBOX_ANIM_MS = 500;
const SLIDER_TRANSITION_MS = 750;
const SLIDER_EASING = 'cubic-bezier(0.25, 1, 0.5, 1)';
const SLIDER_DEFAULT_INTERVAL_MS = 5000;
const LIGHTBOX_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SWIPE_CLOSE_THRESHOLD = 72;
const SWIPE_NAV_THRESHOLD = 50;

type SwipeAxis = 'none' | 'horizontal' | 'vertical';

type GridMedia = {
  assetId: string;
  name?: string;
  type: 'image' | 'video' | 'vimeo' | 'youtube';
  thumbnail?: string;
  width?: number;
  height?: number;
};

type GridMediaPair = {
  media: GridMedia[];
};

type GridDisplayItem = {
  displayMedia: GridMedia;
  lightboxMedia: GridMedia | null;
};

function isPairFormat(image: GridMedia[] | GridMediaPair[] | undefined): image is GridMediaPair[] {
  if (!Array.isArray(image) || image.length === 0) return false;
  const first = image[0];
  return first !== null && typeof first === 'object' && 'media' in first && Array.isArray(first.media);
}

function getDisplayMediaForPair(pair: GridMediaPair): GridMedia | null {
  const [first, second] = pair.media;
  if (second?.assetId) return second;
  if (first?.assetId) return first;
  return null;
}

function getLightboxMediaForPair(pair: GridMediaPair): GridMedia | null {
  const [first] = pair.media;
  if (first?.assetId) return first;
  return null;
}

function getGridDisplayItems(image: GridMedia[] | GridMediaPair[] | undefined): GridDisplayItem[] {
  if (!Array.isArray(image) || image.length === 0) return [];

  if (isPairFormat(image)) {
    return image.flatMap(pair => {
      const displayMedia = getDisplayMediaForPair(pair);
      if (!displayMedia) return [];

      const lightboxMedia = getLightboxMediaForPair(pair);
      return [{
        displayMedia,
        lightboxMedia: lightboxMedia?.assetId ? lightboxMedia : null,
      }];
    });
  }

  return (image as GridMedia[])
    .filter(media => media?.assetId)
    .map(media => ({
      displayMedia: media,
      lightboxMedia: media,
    }));
}

function isVideoMedia(media: GridMedia): boolean {
  return !isEmbedMedia(media) && media.type === 'video';
}

function collectGridLightboxMedia(content: any[]): GridMedia[] {
  const seen = new Set<string>();
  const result: GridMedia[] = [];

  for (const item of content) {
    const displayItems = getGridDisplayItems(item.gallery);
    for (const entry of displayItems) {
      const media = entry.lightboxMedia;
      if (media?.assetId && !seen.has(media.assetId)) {
        seen.add(media.assetId);
        result.push(media);
      }
    }
  }

  return result;
}

const LightboxMediaPreloadPool = memo(function LightboxMediaPreloadPool({ mediaList }: { mediaList: GridMedia[] }) {
  const [pool, setPool] = useState<HTMLDivElement | null>(null);
  useLazyVideos(pool, { preload: 'metadata' });
  // an embed's player is only ever framed where it shows
  const files = mediaList.filter(media => !isEmbedMedia(media));
  if (files.length === 0) return null;

  return (
    <div
      ref={setPool}
      aria-hidden
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      {files.map((media) => (
        isVideoMedia(media) ? (
          <video
            key={media.assetId}
            src={media.assetId}
            preload='none'
            muted
            playsInline
          />
        ) : (
          <img
            key={media.assetId}
            src={media.assetId}
            alt=''
          />
        )
      ))}
    </div>
  );
});

function unloadVideoElement(video: HTMLVideoElement) {
  video.pause();
  video.removeAttribute('src');
  video.load();
}

const GRID_SLIDE_CLASS = 'cntrl-grid-slide';
const GRID_SLIDE_PLAYING_CLASS = 'cntrl-grid-slide-playing';
const GRID_SLIDE_VIDEOS = `.${GRID_SLIDE_CLASS} video`;

function shouldPlaySlideVideo(video: HTMLVideoElement): boolean {
  return video.closest(`.${GRID_SLIDE_PLAYING_CLASS}`) !== null;
}

type GridEntrySliderProps = {
  prefix: string;
  slides: React.ReactNode[];
  isFade: boolean;
  direction: GridSettings['direction'];
  intervalMs: number;
};

function GridEntrySlider({ prefix: P, slides, isFade, direction, intervalMs }: GridEntrySliderProps) {
  const count = slides.length;
  const hasClones = !isFade && count > 1;
  const isRandom = !isFade && direction === 'random';
  const delayMs = Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : SLIDER_DEFAULT_INTERVAL_MS;
  const [position, setPosition] = useState(hasClones ? 1 : 0);
  const [axis, setAxis] = useState<'ltr' | 'ttb'>(!isFade && direction === 'vertical' ? 'ttb' : 'ltr');
  const [isMoving, setIsMoving] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const [cycle, setCycle] = useState(0);
  const isMovingRef = useRef(false);

  useEffect(() => {
    if (count < 2) return;
    const timeoutId = window.setTimeout(() => {
      if (isMovingRef.current) {
        setCycle(prev => prev + 1);
        return;
      }
      isMovingRef.current = true;
      setIsMoving(true);
      setSkipTransition(false);
      setPosition(prev => (hasClones ? prev + 1 : wrapSlideIndex(prev + 1, count)));
      if (!isRandom) setCycle(prev => prev + 1);
    }, delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [count, cycle, delayMs, hasClones, isRandom]);

  useEffect(() => {
    if (!isMoving) return;
    const timeoutId = window.setTimeout(() => {
      const isOnClone = hasClones && position === count + 1;
      const nextAxis = isRandom ? pickRandomSlideDirection() : axis;
      if (isOnClone || nextAxis !== axis) {
        setSkipTransition(true);
        if (isOnClone) setPosition(1);
        setAxis(nextAxis);
      }
      isMovingRef.current = false;
      setIsMoving(false);
      if (isRandom) setCycle(prev => prev + 1);
    }, SLIDER_TRANSITION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [axis, count, hasClones, isMoving, isRandom, position]);

  useEffect(() => {
    if (!skipTransition) return;
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => setSkipTransition(false));
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [skipTransition]);

  const slotsCount = hasClones ? count + 2 : count;
  const getItemIndex = (slot: number) => (hasClones ? wrapSlideIndex(slot - 1, count) : slot);
  const isCloneSlot = (slot: number) => hasClones && (slot === 0 || slot === count + 1);
  const activeIndex = getItemIndex(position);
  const nextSlot = position + 1 < slotsCount ? position + 1 : -1;
  const isPlayingSlot = (slot: number) => isFade
    || (slot === position && !isCloneSlot(slot))
    || slot === nextSlot
    || (nextSlot >= 0 && !isCloneSlot(slot) && getItemIndex(slot) === getItemIndex(nextSlot));
  const isVertical = !isFade && axis === 'ttb';
  const listStyle: React.CSSProperties | undefined = isFade
    ? undefined
    : {
        transform: isVertical
          ? `translate3d(0, ${-position * 100}%, 0)`
          : `translate3d(${-position * 100}%, 0, 0)`,
        transition: skipTransition ? 'none' : `transform ${SLIDER_TRANSITION_MS}ms ${SLIDER_EASING}`,
      };

  return (
    <div className={`${P}-item-slider`}>
      <div
        className={`${P}-item-slider-list${isFade ? ` ${P}-item-slider-list-fade` : ''}${isVertical ? ` ${P}-item-slider-list-vertical` : ''}`}
        style={listStyle}
      >
        {Array.from({ length: slotsCount }, (_, slot) => {
          const itemIndex = getItemIndex(slot);
          const isClone = isCloneSlot(slot);
          const isShown = isFade ? itemIndex === activeIndex : slot === position;
          return (
            <div
              key={isClone ? `clone-${slot === 0 ? 'start' : 'end'}` : `slide-${itemIndex}`}
              className={`${P}-item-slide ${GRID_SLIDE_CLASS}${isFade && isShown ? ` ${P}-item-slide-active` : ''}${isPlayingSlot(slot) ? ` ${GRID_SLIDE_PLAYING_CLASS}` : ''}`}
              aria-hidden={isShown ? undefined : true}
            >
              {slides[itemIndex]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GridMediaItem({
  media,
  className,
  style,
  hasLightbox,
  isSliderSlide = false,
  onMediaClick,
}: {
  media: GridMedia;
  className: string;
  style: React.CSSProperties;
  /** An embed then plays here as a silent loop, and as it was set to in the lightbox. */
  hasLightbox: boolean;
  isSliderSlide?: boolean;
  onMediaClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  if (isEmbedMedia(media)) {
    return (
      <EmbedMediaFrame
        media={media}
        fit={style.objectFit === 'contain' ? 'contain' : 'cover'}
        silentLoop={hasLightbox}
        className={className}
        style={{
          ...style,
          cursor: onMediaClick ? 'pointer' : 'default',
        }}
        onClick={onMediaClick}
      />
    );
  }

  if (isVideoMedia(media)) {
    const videoProps = {
      src: media.assetId,
      className,
      style: {
        ...style,
        cursor: onMediaClick ? 'pointer' : 'default',
      },
      muted: true,
      loop: true,
      playsInline: true,
      onClick: onMediaClick,
    };
    return isSliderSlide
      ? <video {...videoProps} preload='none' />
      : <LazyVideo {...videoProps} autoPlay />;
  }

  return (
    <img
      src={media.assetId}
      alt={media.name}
      className={className}
      style={{
        ...style,
        cursor: onMediaClick ? 'pointer' : 'default',
      }}
      onClick={onMediaClick}
    />
  );
}

function GridItemMediaWrapper({
  className,
  style,
  children,
}: {
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  useLazyVideos(wrapper, { autoPlay: true, selector: GRID_SLIDE_VIDEOS, shouldPlay: shouldPlaySlideVideo });

  return (
    <div ref={setWrapper} className={className} style={style}>
      {children}
    </div>
  );
}

function getGhostRect(ghost: HTMLElement): AnimRect {
  const cb = ghost.getBoundingClientRect();
  return { width: cb.width, height: cb.height, left: cb.left, top: cb.top };
}

function getContainRect(box: AnimRect, natural: { width: number; height: number } | null): AnimRect {
  if (!natural || !natural.width || !natural.height || !box.width || !box.height) return box;
  const ir = natural.width / natural.height;
  const cr = box.width / box.height;
  if (ir > cr) {
    const dh = box.width / ir;
    return { width: box.width, height: dh, left: box.left, top: box.top + (box.height - dh) / 2 };
  }
  const dw = box.height * ir;
  return { width: dw, height: box.height, left: box.left + (box.width - dw) / 2, top: box.top };
}

function LightboxVideo({
  src,
  mediaRef,
  mediaStyle,
  onLoadedMetadata,
}: {
  src: string;
  mediaRef: React.RefObject<HTMLVideoElement>;
  mediaStyle: React.CSSProperties;
  onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
}) {
  useEffect(() => {
    const video = mediaRef.current;
    if (!video) return;

    return () => {
      unloadVideoElement(video);
    };
  }, [src, mediaRef]);

  return (
    <video
      ref={mediaRef}
      src={src}
      muted
      autoPlay
      loop
      playsInline
      preload='auto'
      onLoadedMetadata={onLoadedMetadata}
      style={mediaStyle}
    />
  );
}

const DEFAULT_CLOSE_ICON_URL = 'https://cdn.cntrl.site/component-assets/defaultCloseIcon.svg';
const CLOSE_ICON_HANDLE_MIN = 0.004;

type LightboxCloseIconProps = {
  prefix: string;
  closeIcon?: string | null;
  closeIconMaxWidth?: number;
  closeIconColor?: string;
  closeIconHoverColor?: string;
  iconMarginRight?: number;
  contentMarginTop?: number;
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  visible: boolean;
  onClose: () => void;
};

function LightboxCloseIcon({
  prefix: P,
  closeIcon = DEFAULT_CLOSE_ICON_URL,
  closeIconMaxWidth = 0.0125,
  closeIconColor = '#FFFFFF',
  closeIconHoverColor = '#999999',
  iconMarginRight = 0.01,
  contentMarginTop = 0.01,
  isEditor,
  isPreviewMode,
  isEditMode,
  visible,
  onClose,
}: LightboxCloseIconProps) {
  if (!closeIcon) return null;

  const scaledSize = scalingValue(closeIconMaxWidth, isEditor);
  const scaledMarginRight = scalingValue(iconMarginRight, isEditor);
  const scaledMarginTop = scalingValue(contentMarginTop, isEditor);
  const handleHeight = scalingValue(Math.max(contentMarginTop, CLOSE_ICON_HANDLE_MIN), isEditor);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: scaledMarginTop,
          flexShrink: 0,
        }}
      >
        {isEditMode && (
          <div
            data-controls="contentMarginTop"
            data-controls-axis="y"
            data-controls-min="0"
            className={`${P}-control`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: handleHeight,
              pointerEvents: visible ? 'auto' : 'none',
            }}
          />
        )}
      </div>
      <div
        className={`${P}-close-icon`}
        style={{
          width: scaledSize,
          height: scaledSize,
          marginRight: scaledMarginRight,
          pointerEvents: visible ? 'auto' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={`${P}-close-icon-inner`}
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <SvgImage
            url={closeIcon}
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
              width: scaledMarginRight,
              height: '100%',
              pointerEvents: visible ? 'auto' : 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}

function Lightbox({
  prefix: P,
  items,
  index,
  imageDisplay,
  isEditor,
  isPreviewMode,
  isEditMode,
  onClose,
  onPrev,
  onNext,
  counterClassName,
  counterStyle,
  closeIcon,
  closeIconMaxWidth,
  closeIconColor,
  closeIconHoverColor,
  iconMarginRight,
  contentMarginTop,
}: LightboxProps) {
  const isCover = imageDisplay === 'cover';
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeOffsetRef = useRef(0);
  const swipeDeltaXRef = useRef(0);
  const swipeAxisRef = useRef<SwipeAxis>('none');
  const isSwipingRef = useRef(false);
  const touchInteractionRef = useRef(false);
  const viewportRectRef = useRef<AnimRect | null>(null);
  const slideOffsetRef = useRef(0);
  const slideDirRef = useRef<1 | -1 | null>(null);
  const slideAnimatingRef = useRef(false);
  const slideCommitTimerRef = useRef<number | null>(null);
  const slideCommitDirectionRef = useRef<1 | -1 | null>(null);
  const rapidNavDirectionRef = useRef<1 | -1 | null>(null);
  const startProgrammaticSlideRef = useRef<(dir: 1 | -1) => void>(() => {});
  const [finalRect, setFinalRect] = useState<AnimRect | null>(null);
  const [viewportRect, setViewportRect] = useState<AnimRect | null>(null);
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1 | null>(null);
  const [slideAnimating, setSlideAnimating] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDismiss, setSwipeDismiss] = useState(false);
  const [mediaNaturalSize, setMediaNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const prevIndexRef = useRef(index);
  const prevItemUrlRef = useRef<string | undefined>(undefined);
  const currentItem = items[index];
  const isCurrentVideo = currentItem ? isVideoMedia(currentItem) : false;
  const isCurrentEmbed = currentItem ? isEmbedMedia(currentItem) : false;
  const isSliding = slideDir !== null;

  const handleMediaLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const target = e.currentTarget;
    const size = target instanceof HTMLVideoElement
      ? { width: target.videoWidth, height: target.videoHeight }
      : { width: target.naturalWidth, height: target.naturalHeight };
    if (!size.width || !size.height) return;
    setMediaNaturalSize(size);
  }, []);

  useEffect(() => {
    viewportRectRef.current = viewportRect;
  }, [viewportRect]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setViewportRect(getGhostRect(el));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clearSlideCommitTimer = useCallback(() => {
    if (slideCommitTimerRef.current !== null) {
      window.clearTimeout(slideCommitTimerRef.current);
      slideCommitTimerRef.current = null;
    }
  }, []);

  const commitSlideNavigation = useCallback(() => {
    const dir = slideCommitDirectionRef.current;
    slideCommitDirectionRef.current = null;
    clearSlideCommitTimer();
    slideDirRef.current = null;
    slideAnimatingRef.current = false;
    setSlideDir(null);
    setSlideAnimating(false);
    setSlideOffset(0);
    slideOffsetRef.current = 0;
    setIsSwiping(false);
    isSwipingRef.current = false;
    swipeDeltaXRef.current = 0;
    swipeAxisRef.current = 'none';

    if (dir === 1) onNext();
    else if (dir === -1) onPrev();
  }, [clearSlideCommitTimer, onNext, onPrev]);

  const cancelSlideAnimation = useCallback(() => {
    clearSlideCommitTimer();
    slideCommitDirectionRef.current = null;
    slideDirRef.current = null;
    slideAnimatingRef.current = false;
    setSlideDir(null);
    setSlideAnimating(false);
    setSlideOffset(0);
    slideOffsetRef.current = 0;
  }, [clearSlideCommitTimer]);

  const scheduleSlideCommit = useCallback(() => {
    clearSlideCommitTimer();
    slideCommitTimerRef.current = window.setTimeout(() => {
      if (slideCommitDirectionRef.current === null) return;
      commitSlideNavigation();
    }, LIGHTBOX_ANIM_MS + 32);
  }, [clearSlideCommitTimer, commitSlideNavigation]);

  const finishSlide = useCallback((dir: 1 | -1, commit: boolean) => {
    const width = viewportRectRef.current?.width ?? 0;
    clearSlideCommitTimer();
    slideDirRef.current = dir;
    setSlideDir(dir);
    slideAnimatingRef.current = true;
    setSlideAnimating(true);

    if (commit) {
      slideCommitDirectionRef.current = dir;
      const target = -dir * width;
      slideOffsetRef.current = target;
      setSlideOffset(target);
      scheduleSlideCommit();
      return;
    }

    slideOffsetRef.current = 0;
    setSlideOffset(0);
    slideCommitTimerRef.current = window.setTimeout(() => {
      slideCommitTimerRef.current = null;
      cancelSlideAnimation();
    }, LIGHTBOX_ANIM_MS + 32);
  }, [clearSlideCommitTimer, cancelSlideAnimation, scheduleSlideCommit]);

  const startProgrammaticSlide = useCallback((dir: 1 | -1) => {
    if (items.length <= 1) return;

    if (slideAnimatingRef.current) {
      if (slideCommitDirectionRef.current === dir) {
        rapidNavDirectionRef.current = dir;
        commitSlideNavigation();
        return;
      }

      cancelSlideAnimation();
    }

    clearSlideCommitTimer();
    slideDirRef.current = dir;
    setSlideDir(dir);
    slideAnimatingRef.current = false;
    setSlideAnimating(false);
    slideOffsetRef.current = 0;
    setSlideOffset(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        finishSlide(dir, true);
      });
    });
  }, [items.length, finishSlide, commitSlideNavigation, cancelSlideAnimation, clearSlideCommitTimer]);

  startProgrammaticSlideRef.current = startProgrammaticSlide;

  const handleSlideTransitionEnd = useCallback((e: React.TransitionEvent<HTMLElement>) => {
    if (e.propertyName !== 'transform' || !slideAnimatingRef.current) return;
    if (slideCommitDirectionRef.current === null) return;
    commitSlideNavigation();
  }, [commitSlideNavigation]);

  const computeFinalRect = useCallback(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;
    const rect = getGhostRect(ghost);
    if (!rect.width || !rect.height) return;
    setFinalRect(rect);
  }, []);

  useEffect(() => {
    computeFinalRect();
    const c = ghostRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => computeFinalRect());
    ro.observe(c);
    return () => ro.disconnect();
  }, [computeFinalRect]);

  useEffect(() => {
    if (phase === 'opening' && finalRect) setPhase('open');
  }, [phase, finalRect]);

  useEffect(() => {
    if (phase !== 'closing') return;
    const t = setTimeout(() => onClose(), LIGHTBOX_ANIM_MS);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  useEffect(() => {
    return () => {
      clearSlideCommitTimer();
    };
  }, [clearSlideCommitTimer]);

  useLayoutEffect(() => {
    if (prevIndexRef.current === index && prevItemUrlRef.current === currentItem?.assetId) return;

    clearSlideCommitTimer();
    slideCommitDirectionRef.current = null;
    setSlideDir(null);
    setSwipeOffset(0);
    setSlideOffset(0);
    setSlideAnimating(false);
    setSwipeDismiss(false);
    setIsSwiping(false);
    setMediaNaturalSize(null);
    swipeOffsetRef.current = 0;
    swipeDeltaXRef.current = 0;
    swipeAxisRef.current = 'none';
    isSwipingRef.current = false;
    slideAnimatingRef.current = false;
    slideOffsetRef.current = 0;
    slideDirRef.current = null;
    touchStartRef.current = null;
    touchInteractionRef.current = false;

    prevIndexRef.current = index;
    prevItemUrlRef.current = currentItem?.assetId;
  }, [index, currentItem?.assetId, clearSlideCommitTimer]);

  useLayoutEffect(() => {
    const rapidDirection = rapidNavDirectionRef.current;
    if (rapidDirection === null) return;

    rapidNavDirectionRef.current = null;
    requestAnimationFrame(() => {
      startProgrammaticSlideRef.current(rapidDirection);
    });
  }, [index, currentItem?.assetId]);

  useEffect(() => {
    if (phase !== 'open') return;

    let blockClick: ((clickEvent: Event) => void) | null = null;

    const clearBlockSwipeClick = () => {
      if (!blockClick) return;
      document.removeEventListener('click', blockClick, true);
      blockClick = null;
    };

    const blockSwipeClick = () => {
      clearBlockSwipeClick();
      blockClick = (clickEvent: Event) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        clearBlockSwipeClick();
      };
      document.addEventListener('click', blockClick, true);
    };

    const startSlideRelease = (deltaX: number) => {
      const dir: 1 | -1 = deltaX < 0 ? 1 : -1;
      if (Math.abs(deltaX) > SWIPE_NAV_THRESHOLD && items.length > 1) {
        finishSlide(dir, true);
        return;
      }
      finishSlide(dir, false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || slideAnimatingRef.current) return;
      const touch = e.touches[0];

      touchInteractionRef.current = true;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      swipeAxisRef.current = 'none';
      swipeDeltaXRef.current = 0;
      isSwipingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || e.touches.length !== 1 || slideAnimatingRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (swipeAxisRef.current === 'none') {
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (items.length <= 1) return;
          swipeAxisRef.current = 'horizontal';
        } else if (deltaY > 0) {
          swipeAxisRef.current = 'vertical';
        } else {
          return;
        }
      }

      if (swipeAxisRef.current === 'horizontal') {
        isSwipingRef.current = true;
        setIsSwiping(true);
        swipeDeltaXRef.current = deltaX;
        const dir: 1 | -1 = deltaX < 0 ? 1 : -1;
        if (slideDirRef.current !== dir) {
          slideDirRef.current = dir;
          setSlideDir(dir);
        }
        slideOffsetRef.current = deltaX;
        setSlideOffset(deltaX);
        e.preventDefault();
        return;
      }

      if (swipeAxisRef.current === 'vertical') {
        isSwipingRef.current = true;
        setIsSwiping(true);
        swipeOffsetRef.current = deltaY;
        setSwipeOffset(deltaY);
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!touchStartRef.current) return;

      const axis = swipeAxisRef.current;
      const wasSwiping = isSwipingRef.current;

      if (wasSwiping && axis === 'horizontal') {
        startSlideRelease(swipeDeltaXRef.current);
        blockSwipeClick();
      } else if (wasSwiping && axis === 'vertical') {
        const offset = swipeOffsetRef.current;

        if (offset > SWIPE_CLOSE_THRESHOLD) {
          const dismissOffset = window.innerHeight;
          swipeOffsetRef.current = dismissOffset;
          setSwipeDismiss(true);
          setSwipeOffset(dismissOffset);
          setPhase('closing');
        } else {
          swipeOffsetRef.current = 0;
          setSwipeOffset(0);
          blockSwipeClick();
        }
      } else if (axis === 'horizontal' && Math.abs(swipeDeltaXRef.current) > 0) {
        startSlideRelease(swipeDeltaXRef.current);
        blockSwipeClick();
      }

      touchStartRef.current = null;
      swipeAxisRef.current = 'none';
      swipeDeltaXRef.current = 0;
      isSwipingRef.current = false;
      setIsSwiping(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      clearBlockSwipeClick();
    };
  }, [phase, items.length, finishSlide]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      if (phase === 'closing') return;
      setPhase('closing');
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [phase]);

  const handleClose = () => {
    if (phase === 'closing') return;
    setPhase('closing');
  };

  const isOpen = phase === 'open';
  const isClosing = phase === 'closing';
  const swipeBackdropOpacity = swipeOffset > 0 ? Math.max(0, 1 - swipeOffset / 500) : 1;
  const swipeMediaOpacity = swipeOffset > 0 ? Math.max(0.35, 1 - swipeOffset / 500) : 1;

  // an embed's player reports no size of its own, so its stored aspect stands in
  const naturalSize = isCurrentEmbed && currentItem
    ? { width: getEmbedAspect(currentItem), height: 1 }
    : mediaNaturalSize;
  const contentRect = finalRect
    ? (isCover ? finalRect : getContainRect(finalRect, naturalSize))
    : null;

  const backingBaseStyle: React.CSSProperties = {
    position: 'fixed',
    top: viewportRect?.top,
    left: viewportRect?.left,
    width: viewportRect?.width,
    height: viewportRect?.height,
    zIndex: 9998,
  };

  const objectFitStyle: React.CSSProperties['objectFit'] = isCover ? 'cover' : 'contain';

  const currentTransform = (slideOffset !== 0 || swipeOffset > 0)
    ? `translate(${slideOffset}px, ${swipeOffset}px)`
    : undefined;

  const currentTransition = (isSwiping && !slideAnimating)
    ? 'none'
    : slideAnimating
      ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
      : swipeDismiss
        ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
        : phase === 'opening' || isClosing
          ? `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
          : 'none';

  const currentBackingStyle: React.CSSProperties = {
    ...backingBaseStyle,
    transform: currentTransform,
    opacity: swipeOffset > 0
      ? swipeMediaOpacity
      : phase === 'opening' || isClosing
        ? 0
        : 1,
    transition: currentTransition,
    pointerEvents: 'none',
  };

  const currentMediaStyle: React.CSSProperties = {
    position: 'absolute',
    top: (contentRect?.top ?? 0) - (viewportRect?.top ?? 0),
    left: (contentRect?.left ?? 0) - (viewportRect?.left ?? 0),
    width: contentRect?.width,
    height: contentRect?.height,
    objectFit: objectFitStyle,
    pointerEvents: 'none',
  };

  const slideWidth = viewportRect?.width ?? 0;
  const neighborIndex = isSliding ? (index + (slideDir as 1 | -1) + items.length) % items.length : null;
  const neighborItem = neighborIndex !== null ? items[neighborIndex] : null;
  const neighborBackingStyle: React.CSSProperties = {
    ...backingBaseStyle,
    transform: isSliding ? `translateX(${(slideDir as 1 | -1) * slideWidth + slideOffset}px)` : undefined,
    opacity: 1,
    transition: slideAnimating ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}` : 'none',
    pointerEvents: 'none',
  };
  const neighborMediaStyle: React.CSSProperties = {
    position: 'absolute',
    top: (finalRect?.top ?? 0) - (viewportRect?.top ?? 0),
    left: (finalRect?.left ?? 0) - (viewportRect?.left ?? 0),
    width: finalRect?.width,
    height: finalRect?.height,
    objectFit: objectFitStyle,
    pointerEvents: 'none',
  };

  // over an embed with controls the overlays stop short of the player's own control bar
  const navOverlayInset = isCurrentEmbed && currentItem && getEmbedPlayback(currentItem).controls && contentRect
    ? Math.min(52, contentRect.height * 0.2)
    : 0;
  const navOverlayBaseStyle = contentRect ? {
    position: 'fixed' as const,
    top: contentRect.top,
    height: contentRect.height - navOverlayInset,
    width: contentRect.width / 2,
    zIndex: 9999,
  } : null;

  return (
    <div
      ref={containerRef}
      className={[
        `${P}-lightbox`,
        isEditor ? `${P}-lightbox-editor` : '',
      ].filter(Boolean).join(' ')}
      style={{
        touchAction: phase === 'open' ? 'none' : undefined,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(28,31,34,0.9)',
          opacity: isOpen ? swipeBackdropOpacity : 0,
          transition: isSwiping ? 'none' : `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCover ? (
          <>
            <div ref={ghostRef} style={{ position: 'absolute', inset: 0 }} />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '10%',
                opacity: isOpen ? 1 : 0,
                transition: `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            >
              {items.length > 1 &&
                <p className={counterClassName} style={counterStyle}>
                  {index + 1} / {items.length}
                </p>
              }
            </div>
          </>
        ) : (
          <>
            <div style={{ height: '10%' }}></div>
            <div
              style={{
                width: '70%',
                height: '80%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <div ref={ghostRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '10%',
                opacity: isOpen ? 1 : 0,
                transition: `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
              }}
            >
              {items.length > 1 &&
                <p className={counterClassName} style={counterStyle}>
                  {index + 1} / {items.length}
                </p>
              }
            </div>
          </>
        )}
      </div>

      {finalRect && viewportRect && neighborItem && (
        <div style={neighborBackingStyle} onTransitionEnd={handleSlideTransitionEnd}>
          {isEmbedMedia(neighborItem) ? (
            <img
              key={`neighbor-${neighborIndex}-${neighborItem.assetId}`}
              src={neighborItem.thumbnail}
              alt={neighborItem.name}
              style={neighborMediaStyle}
            />
          ) : isVideoMedia(neighborItem) ? (
            <video
              key={`neighbor-${neighborIndex}-${neighborItem.assetId}`}
              src={neighborItem.assetId}
              muted
              autoPlay
              loop
              playsInline
              preload='auto'
              style={neighborMediaStyle}
            />
          ) : (
            <img
              key={`neighbor-${neighborIndex}-${neighborItem.assetId}`}
              src={neighborItem.assetId}
              alt={neighborItem.name}
              style={neighborMediaStyle}
            />
          )}
        </div>
      )}

      {finalRect && viewportRect && currentItem && (
        <div style={currentBackingStyle} onTransitionEnd={handleSlideTransitionEnd}>
          {isCurrentEmbed ? (
            <EmbedMediaFrame
              key={`${index}-${currentItem.assetId}`}
              media={currentItem}
              fit={isCover ? 'cover' : 'contain'}
              lazy={false}
              startsAtOnce
              style={currentMediaStyle}
            />
          ) : isCurrentVideo ? (
            <LightboxVideo
              key={`${index}-${currentItem.assetId}`}
              src={currentItem.assetId}
              mediaRef={mediaRef as React.RefObject<HTMLVideoElement>}
              mediaStyle={currentMediaStyle}
              onLoadedMetadata={handleMediaLoad}
            />
          ) : (
            <img
              key={`${index}-${currentItem.assetId}`}
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={currentItem.assetId}
              alt={currentItem.name}
              onLoad={handleMediaLoad}
              style={currentMediaStyle}
            />
          )}
        </div>
      )}

      {isOpen && navOverlayBaseStyle && items.length > 1 && (
        <>
          <div
            style={{
              ...navOverlayBaseStyle,
              left: contentRect!.left,
              cursor: 'w-resize',
              pointerEvents: isSwiping ? 'none' : 'auto',
            }}
            onClick={(e) => {
              if (touchInteractionRef.current) {
                touchInteractionRef.current = false;
                return;
              }
              e.stopPropagation();
              startProgrammaticSlide(-1);
            }}
          />
          <div
            style={{
              ...navOverlayBaseStyle,
              left: contentRect!.left + contentRect!.width / 2,
              cursor: 'e-resize',
              pointerEvents: isSwiping ? 'none' : 'auto',
            }}
            onClick={(e) => {
              if (touchInteractionRef.current) {
                touchInteractionRef.current = false;
                return;
              }
              e.stopPropagation();
              startProgrammaticSlide(1);
            }}
          />
        </>
      )}
      <LightboxCloseIcon
        prefix={P}
        closeIcon={closeIcon}
        closeIconMaxWidth={closeIconMaxWidth}
        closeIconColor={closeIconColor}
        closeIconHoverColor={closeIconHoverColor}
        iconMarginRight={iconMarginRight}
        contentMarginTop={contentMarginTop}
        isEditor={isEditor}
        isPreviewMode={isPreviewMode}
        isEditMode={isEditMode}
        visible={isOpen}
        onClose={handleClose}
      />
    </div>
  );
}

function resolveLightboxImageDisplay(
  value: GridSettings['lightboxImageDisplay'],
): 'fit' | 'cover' {
  if (typeof value === 'string') {
    return value === 'cover' ? 'cover' : 'fit';
  }
  return value?.display === 'cover' ? 'cover' : 'fit';
}

function getCustomGridSpanWidth(layout: CustomGridLayout, span: number): number {
  return layout.columnWidth * span + layout.gutterWidth * Math.max(0, span - 1);
}

type CustomGridSlot = {
  column: number;
  span: number;
  width: number;
  top: number;
  height: number;
  gridColumn: string;
};

function getCustomGridBlocksBottom(layout: CustomGridLayout): number {
  return layout.blocks.reduce((bottom, block) => Math.max(bottom, Math.max(0, block.top) + Math.max(0, block.height)), 0);
}

function getCustomGridVerticalGap(layout: CustomGridLayout): number {
  if (typeof layout.verticalGap === 'number') return Math.max(0, layout.verticalGap);
  return Math.max(0, (layout.repeatHeight ?? 0) - getCustomGridBlocksBottom(layout));
}

function getCustomGridSlot(layout: CustomGridLayout, index: number): CustomGridSlot {
  const block = layout.blocks[index % layout.blocks.length];
  const span = Math.min(Math.max(1, Math.round(block.span)), layout.columnsCount);
  const column = Math.min(Math.max(0, Math.round(block.column)), layout.columnsCount - span);
  return {
    column,
    span,
    width: getCustomGridSpanWidth(layout, span),
    top: Math.max(0, block.top),
    height: Math.max(0, block.height),
    gridColumn: `${column + 1} / span ${span}`,
  };
}

const EDGE_TOLERANCE = 1e-6;

function getCustomGridRows(layout: CustomGridLayout, entriesCount: number, entryHeights?: number[]) {
  const beat = layout.beat ?? 0;
  const onBeats = beat > 0 && !!entryHeights;
  const snapUp = (value: number) => Math.ceil(value / beat - 1e-3) * beat;
  const tracks: (number | 'auto')[] = [];
  const gridRows: string[] = [];
  const verticalGap = getCustomGridVerticalGap(layout);
  for (let groupStart = 0; groupStart < entriesCount; groupStart += layout.blocks.length) {
    if (groupStart > 0 && verticalGap > 0) tracks.push(verticalGap);
    const slots = Array.from(
      { length: Math.min(layout.blocks.length, entriesCount - groupStart) },
      (_, index) => getCustomGridSlot(layout, groupStart + index),
    );
    const ends = slots.map((slot) => {
      const under = slots.filter(other => other.column < slot.column + slot.span
        && slot.column < other.column + other.span
        && other.top >= slot.top + slot.height - EDGE_TOLERANCE);
      return under.length > 0 ? Math.min(...under.map(other => other.top)) : undefined;
    });
    const tops = [0, ...slots.map(slot => slot.top)]
      .sort((a, b) => a - b)
      .filter((top, index, sorted) => index === 0 || top - sorted[index - 1] > EDGE_TOLERANCE);
    const isSame = (a: number, b: number) => Math.abs(a - b) <= EDGE_TOLERANCE;
    const getTop = (value: number) => tops.findIndex(top => isSame(top, value));
    const positions: number[] = [];
    let position = 0;
    const pushContentTrack = (isEnding: (end: number | undefined) => boolean) => {
      const ending = slots.flatMap((slot, index) => (isEnding(ends[index]) ? [{ slot, entry: groupStart + index }] : []));
      if (ending.length === 0) return;
      if (!onBeats) {
        tracks.push('auto');
        return;
      }
      const needed = Math.max(...ending.map(({ slot, entry }) => positions[getTop(slot.top)] + (entryHeights[entry] ?? 0)));
      const track = Math.max(0, snapUp(needed) - position);
      tracks.push(track);
      position += track;
    };
    const lines = tops.map((top, index) => {
      if (index > 0) {
        tracks.push(top - tops[index - 1]);
        position += top - tops[index - 1];
      }
      pushContentTrack(end => end !== undefined && isSame(end, top));
      positions.push(position);
      return tracks.length + 1;
    });
    pushContentTrack(end => end === undefined);
    const groupEnd = tracks.length + 1;
    const getLine = (value: number) => lines[getTop(value)];
    slots.forEach((slot, index) => {
      const end = ends[index];
      gridRows.push(`${getLine(slot.top)} / ${end === undefined ? groupEnd : getLine(end)}`);
    });
  }
  return { tracks, gridRows };
}

function getGridMediaAspect(media: GridMedia): number | undefined {
  if (isEmbedMedia(media)) return getEmbedAspect(media);
  return media.width && media.height && media.width > 0 && media.height > 0 ? media.width / media.height : undefined;
}

/**
 * Where each entry stands, given the height it takes; the CMS grid builder places its blocks the same way.
 * A block keeps its drawn distance to the blocks above it in its group; a block with none above it starts at
 * its drawn top in the group, or, with masonry on, the vertical gap below whatever earlier group reaches
 * lowest in its columns.
 */
function placeCustomGridEntries(layout: CustomGridLayout, slots: CustomGridSlot[], heights: number[]) {
  const groupSize = layout.blocks.length;
  const verticalGap = getCustomGridVerticalGap(layout);
  const isMasonry = layout.masonry === 'on';
  const tops: number[] = [];
  const placed: { column: number; span: number; bottom: number; group: number }[] = [];
  const getBottom = (items: typeof placed) => items.reduce((bottom, item) => Math.max(bottom, item.bottom), 0);
  let groupStart = 0;
  for (let start = 0; start < slots.length; start += groupSize) {
    const group = start / groupSize;
    const entries = Array.from({ length: Math.min(groupSize, slots.length - start) }, (_, index) => start + index)
      .sort((a, b) => slots[a].top - slots[b].top || a - b);
    for (const entry of entries) {
      const slot = slots[entry];
      const sharesColumns = (other: { column: number; span: number }) => other.column < slot.column + slot.span
        && slot.column < other.column + other.span;
      const above = entries.filter(other => other !== entry && tops[other] !== undefined && sharesColumns(slots[other])
        && slots[other].top + slots[other].height <= slot.top + EDGE_TOLERANCE);
      const earlier = isMasonry ? placed.filter(item => item.group < group && sharesColumns(item)) : [];
      const candidates = above.map(other => tops[other] + heights[other] + slot.top - (slots[other].top + slots[other].height));
      if (earlier.length > 0) candidates.push(getBottom(earlier) + verticalGap);
      if (candidates.length === 0) candidates.push(groupStart + slot.top);
      tops[entry] = Math.max(...candidates);
      placed.push({ column: slot.column, span: slot.span, bottom: tops[entry] + heights[entry], group });
    }
    groupStart = getBottom(placed) + verticalGap;
  }
  return { tops, bottom: getBottom(placed) };
}

export function Grid({ settings, content, isEditor, isPreviewMode, isEditMode, metadata, activeEvent, layoutId, portalId }: GridProps) {
  const { prefix: P } = useScopedStyles();
  const {
    type = 'a',
    gridLayout,
    customGrid,
    textBoxWidth = 100,
    verticalGap,
    entriesCount,
    lightbox,
    imageDisplay,
    imageCorners,
    lightboxImageDisplay,
    slider,
    sliderTiming,
    direction,
    transition,
    titleMarginTop,
    subtitleMarginTop,
    titleColor,
    subtitleColor,
    lightboxCounterColor,
    titleFontFamily,
    titleFontSettings,
    titleFontSize,
    titleLineHeight,
    titleLetterSpacing,
    titleWordSpacing,
    titleTextAppearance,
    subtitleFontFamily,
    subtitleFontSettings,
    subtitleFontSize,
    subtitleLineHeight,
    subtitleLetterSpacing,
    subtitleWordSpacing,
    subtitleTextAppearance,
    lightboxCounterFontFamily,
    lightboxCounterFontSettings,
    lightboxCounterFontSize,
    lightboxCounterLineHeight,
    lightboxCounterLetterSpacing,
    lightboxCounterWordSpacing,
    lightboxCounterTextAppearance,
    closeIcon,
    closeIconMaxWidth,
    closeIconColor,
    closeIconHoverColor,
    iconMarginRight,
    contentMarginTop,
    showText = 'always',
    hover = 'none',
    alignEntries = 'off',
    align = 'top',
    textGrowth = 'inside',
  } = settings;

  const titleTextStyle = useMemo(() => ({
    ...omitTextColors(textStylesToCss({
      fontSettings: {
        fontFamily: titleFontFamily,
        fontWeight: titleFontSettings?.fontWeight ?? 400,
        fontStyle: titleFontSettings?.fontStyle ?? 'normal',
      },
      fontSize: titleFontSize ?? 0.01,
      lineHeight: titleLineHeight,
      letterSpacing: titleLetterSpacing ?? 0,
      wordSpacing: titleWordSpacing ?? 0,
      textAppearance: titleTextAppearance,
      color: titleColor,
    }, isEditor)),
    ...getGridTextLeadingVars(titleFontSize, titleLineHeight, P, isEditor),
  } as React.CSSProperties), [
    titleFontFamily, titleFontSettings, titleFontSize, titleLineHeight, titleLetterSpacing,
    titleWordSpacing, titleTextAppearance, titleColor, isEditor, P,
  ]);

  const subtitleTextStyle = useMemo(() => ({
    ...omitTextColors(textStylesToCss({
      fontSettings: {
        fontFamily: subtitleFontFamily,
        fontWeight: subtitleFontSettings?.fontWeight ?? 400,
        fontStyle: subtitleFontSettings?.fontStyle ?? 'normal',
      },
      fontSize: subtitleFontSize ?? 0.01,
      lineHeight: subtitleLineHeight,
      letterSpacing: subtitleLetterSpacing ?? 0,
      wordSpacing: subtitleWordSpacing ?? 0,
      textAppearance: subtitleTextAppearance,
      color: subtitleColor,
    }, isEditor)),
    ...getGridTextLeadingVars(subtitleFontSize, subtitleLineHeight, P, isEditor),
  } as React.CSSProperties), [
    subtitleFontFamily, subtitleFontSettings, subtitleFontSize, subtitleLineHeight, subtitleLetterSpacing,
    subtitleWordSpacing, subtitleTextAppearance, subtitleColor, isEditor, P,
  ]);

  const lightboxCounterFieldCss = useMemo(() => ({
    ...omitTextColors(textStylesToCss({
      fontSettings: {
        fontFamily: lightboxCounterFontFamily,
        fontWeight: lightboxCounterFontSettings?.fontWeight ?? 400,
        fontStyle: lightboxCounterFontSettings?.fontStyle ?? 'normal',
      },
      fontSize: lightboxCounterFontSize ?? 0.01,
      lineHeight: lightboxCounterLineHeight,
      letterSpacing: lightboxCounterLetterSpacing ?? 0,
      wordSpacing: lightboxCounterWordSpacing ?? 0,
      textAppearance: lightboxCounterTextAppearance,
      color: lightboxCounterColor,
    }, isEditor)),
    ...getGridTextLeadingVars(lightboxCounterFontSize, lightboxCounterLineHeight, P, isEditor),
  } as React.CSSProperties), [
    lightboxCounterFontFamily, lightboxCounterFontSettings, lightboxCounterFontSize, lightboxCounterLineHeight,
    lightboxCounterLetterSpacing, lightboxCounterWordSpacing, lightboxCounterTextAppearance, lightboxCounterColor,
    isEditor, P,
  ]);

  const titleTextClassName = getGridTextClassName(
    titleFontSize,
    titleLineHeight,
    `${P}-item-title`,
    `${P}-text-tight-leading`,
  );
  const subtitleTextClassName = getGridTextClassName(
    subtitleFontSize,
    subtitleLineHeight,
    `${P}-item-subtitle`,
    `${P}-text-tight-leading`,
  );
  const lightboxCounterClassName = getGridTextClassName(
    lightboxCounterFontSize,
    lightboxCounterLineHeight,
    `${P}-lightbox-counter`,
    `${P}-text-tight-leading`,
  );

  const colorVars = useMemo(() => buildColorVars(P, {
    titleColor,
    subtitleColor,
    lightboxCounterColor,
  }, COLOR_VAR_MAP, STATE_KEYS), [P, titleColor, subtitleColor, lightboxCounterColor]);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const showTextOnHover = showText === 'on hover' && (!isEditor || isPreviewMode);
  const hoverEffectClass = hover !== 'none' && (!isEditor || isPreviewMode) ? ` ${P}-hover-${hover}` : '';
  const wrapperStateClasses = `${stateClass}${showTextOnHover ? ` ${P}-show-text-hover` : ''}${hoverEffectClass}`.trim();

  const customLayout = customGrid && Array.isArray(customGrid.blocks) && customGrid.blocks.length > 0 ? customGrid : undefined;
  const resEntriesCount = customLayout || entriesCount === 0 ? Infinity : entriesCount;
  const isTextOutside = !!customLayout && textGrowth === 'outside';
  const isAutoHeight = customLayout?.cellHeight === 'auto';
  // entries stand where placeCustomGridEntries puts them rather than on grid rows
  const isPlacedLayout = isAutoHeight || customLayout?.masonry === 'on';
  const itemInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [customEntryHeights, setCustomEntryHeights] = useState<number[]>([]);

  const cropContent = useMemo<any[]>(() => (content ?? []).slice(0, resEntriesCount), [content, resEntriesCount]);
  const lightboxMediaToPreload = useMemo(
    () => (lightbox === 'on' ? collectGridLightboxMedia(cropContent) : []),
    [cropContent, lightbox],
  );
  const entriesMedia = useMemo(() => cropContent.map((item: any) => {
    const displayItems = getGridDisplayItems(item.gallery);
    const lightboxItemsForEntry = displayItems
      .filter(entry => entry.lightboxMedia)
      .map(entry => entry.lightboxMedia!);
    const lightboxIndexes = displayItems.map(({ lightboxMedia }) => (lightboxMedia
      ? lightboxItemsForEntry.findIndex(media => media.assetId === lightboxMedia.assetId)
      : -1));
    return { displayItems, lightboxItemsForEntry, lightboxIndexes };
  }), [cropContent]);

  const size = gridLayout?.entryWidth ?? 0.2;

  const imageDisplaySettings = typeof imageDisplay === 'string' ? { display: imageDisplay } : imageDisplay;
  const isCover = imageDisplaySettings?.display === 'cover';
  const ratioValue = imageDisplaySettings?.ratioValue ?? '1:1';
  const ratioReversed = imageDisplaySettings?.reversed ?? false;
  const [rW, rH] = ratioValue.split(':').map(Number);
  const effW = ratioReversed ? rH : rW;
  const effH = ratioReversed ? rW : rH;
  const aspectRatio = `${effW} / ${effH}`;

  const columnsCount = gridLayout?.columnsCount ?? 1;
  const entryWidthScaled = scalingValue(size ?? 0, isEditor);
  const isFitSlider = slider !== 'off' && (customLayout ? isAutoHeight : !isCover);

  const itemsInLastRow = cropContent.length % columnsCount || columnsCount;
  const isPartialLastRow = !customLayout && itemsInLastRow < columnsCount && cropContent.length > 0;
  const lastRowStartIndex = cropContent.length - itemsInLastRow;
  const lastRowStartColumn = isPartialLastRow
    ? Math.floor((columnsCount - itemsInLastRow) / 2) + 1
    : 1;

  const imageBorderRadius = imageCorners ? scalingValue(imageCorners, isEditor) : undefined;

  const getImageWrapperStyle = (
    entryWidth: string,
    slot?: CustomGridSlot,
    media?: { aspect?: number; isEmpty: boolean },
  ): React.CSSProperties => ({
    width: entryWidth,
    ...(slot && isAutoHeight
      ? {
          // an entry with no media keeps the drawn height, so it can still be seen and filled
          height: media?.isEmpty ? scalingValue(slot.height, isEditor) : 'auto',
          flexShrink: 0,
          overflow: 'hidden',
          ...(media?.aspect && !isFitSlider ? { aspectRatio: `${media.aspect}` } : {}),
        }
      : slot
      ? isTextOutside
        ? { height: scalingValue(slot.height, isEditor), flexShrink: 0, overflow: 'hidden' }
        : { flex: '1 1 0%', minHeight: 0, overflow: 'hidden' }
      : isCover
        ? { aspectRatio, height: 'auto', overflow: 'hidden' }
        : { height: 'auto' }),
    ...(imageBorderRadius ? { borderRadius: imageBorderRadius, overflow: 'hidden' } : {}),
  });

  const imageWrapperClassName = `${P}-item-image-wrapper${isFitSlider ? ` ${P}-item-image-wrapper-fit-slider` : ''}`.trim();
  const isTextBeforeImage = type === 'd' || type === 'e' || type === 'f';
  const shouldAlignEntries = !customLayout && alignEntries === 'on';

  const imageRadiusStyle = imageBorderRadius
    ? { borderRadius: imageBorderRadius, [MEDIA_RADIUS_VAR]: imageBorderRadius } as React.CSSProperties
    : {};
  const imageStyle: React.CSSProperties = isAutoHeight
    ? {
        objectFit: isFitSlider && !isCover ? 'contain' : 'cover',
        pointerEvents: 'auto',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        ...imageRadiusStyle,
      }
    : isCover
    ? {
        objectFit: 'cover',
        pointerEvents: 'auto',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        ...imageRadiusStyle,
      }
    : {
        objectFit: 'contain',
        pointerEvents: 'auto',
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        ...(customLayout ? { maxHeight: '100%' } : {}),
        ...imageRadiusStyle,
      };

  const shouldMeasureEntries = (customLayout?.beat ?? 0) > 0 || isPlacedLayout;
  const customGridWidth = customLayout ? getCustomGridSpanWidth(customLayout, customLayout.columnsCount) : 0;
  useLayoutEffect(() => {
    if (!shouldMeasureEntries) {
      setCustomEntryHeights(prev => (prev.length > 0 ? [] : prev));
      return;
    }
    const wrapper = containerRef.current;
    const inners = itemInnerRefs.current.slice(0, cropContent.length);
    const measure = () => {
      const unit = wrapper && customGridWidth > 0 ? wrapper.offsetWidth / customGridWidth : 0;
      if (unit <= 0) return;
      const heights = inners.map(inner => (inner ? inner.offsetHeight / unit : 0));
      setCustomEntryHeights(prev => (
        prev.length === heights.length && prev.every((height, index) => Math.abs(height - heights[index]) < 1e-5)
          ? prev
          : heights
      ));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapper) ro.observe(wrapper);
    inners.forEach(inner => inner && ro.observe(inner));
    return () => ro.disconnect();
  }, [shouldMeasureEntries, cropContent.length, customGridWidth, P]);
  const measuredEntryHeights = shouldMeasureEntries && customEntryHeights.length === cropContent.length
    ? customEntryHeights
    : undefined;
  const customRows = useMemo(() => {
    if (!customLayout) return undefined;
    const rows = getCustomGridRows(customLayout, cropContent.length, measuredEntryHeights);
    return {
      gridRows: rows.gridRows,
      gridTemplateRows: rows.tracks.length
        ? rows.tracks.map(track => (track === 'auto' ? 'auto' : scalingValue(track, isEditor))).join(' ')
        : 'auto',
    };
  }, [customLayout, cropContent.length, measuredEntryHeights, isEditor]);
  const customSlots = useMemo(
    () => (customLayout ? cropContent.map((_, index) => getCustomGridSlot(customLayout, index)) : undefined),
    [customLayout, cropContent.length],
  );
  // the aspect a single media keeps when the cell takes its height
  const entryMediaAspects = useMemo(
    () => entriesMedia.map(({ displayItems }) => (
      isAutoHeight && displayItems.length > 0 ? getGridMediaAspect(displayItems[0].displayMedia) : undefined
    )),
    [entriesMedia, isAutoHeight],
  );
  const customPlacement = useMemo(() => {
    if (!customLayout || !customSlots || !isPlacedLayout) return undefined;
    const beat = customLayout.beat ?? 0;
    const heights = customSlots.map((slot, index) => {
      // until the entries are measured, a media that tells its size gives the height it will take
      const aspects = entriesMedia[index].displayItems.map(({ displayMedia }) => getGridMediaAspect(displayMedia));
      const known = aspects.filter((aspect): aspect is number => aspect !== undefined);
      const estimate = isAutoHeight && known.length > 0 ? Math.max(...known.map(aspect => slot.width / aspect)) : slot.height;
      const height = measuredEntryHeights?.[index] ?? estimate;
      return beat > 0 ? Math.ceil(height / beat - 1e-3) * beat : height;
    });
    return placeCustomGridEntries(customLayout, customSlots, heights);
  }, [customLayout, customSlots, isPlacedLayout, isAutoHeight, entriesMedia, measuredEntryHeights]);
  const wrapperLayoutStyle: React.CSSProperties = customLayout
    ? {
        gridTemplateColumns: `repeat(${customLayout.columnsCount}, ${scalingValue(customLayout.columnWidth, isEditor)})`,
        gridTemplateRows: customRows?.gridTemplateRows ?? 'auto',
        rowGap: 0,
        columnGap: scalingValue(customLayout.gutterWidth, isEditor),
        width: scalingValue(getCustomGridSpanWidth(customLayout, customLayout.columnsCount), isEditor),
        ...(customPlacement ? { position: 'relative', height: scalingValue(customPlacement.bottom, isEditor) } : {}),
      }
    : {
        gridTemplateColumns: `repeat(${columnsCount}, ${entryWidthScaled})`,
        rowGap: shouldAlignEntries ? 0 : scalingValue(verticalGap ?? 0, isEditor),
        columnGap: scalingValue(gridLayout?.horizontalGap ?? 0, isEditor),
        width: scalingValue(gridLayout?.wrapperWidth ?? 0, isEditor),
        ...(shouldAlignEntries
          ? { [`--${P}-align-entries-row-gap`]: scalingValue(verticalGap ?? 0, isEditor) }
          : {}),
      };

  const containerRef = useRef<HTMLDivElement>(null);

  const getLightboxPortalStyle = (): React.CSSProperties => {
    const style: Record<string, string> = { ...(colorVars as Record<string, string>) };
    const articleWidth = containerRef.current
      ? getComputedStyle(containerRef.current).getPropertyValue('--cntrl-article-width').trim()
      : '';
    if (articleWidth) {
      style['--cntrl-article-width'] = articleWidth;
    }
    return style as React.CSSProperties;
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<GridMedia[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const canOpenLightboxMedia = lightbox === 'on' && (!isEditor || isPreviewMode);

  const openLightbox = (items: GridMedia[], idx: number) => {
    if (isEditor && !isPreviewMode) return;
    if (lightbox === 'off') return;
    setLightboxItems(items);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen || lightbox !== 'on') return;
    if (typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, lightbox]);

  useEffect(() => {
    if (!isEditor || isPreviewMode) return;
    setLightboxOpen(false);
  }, [isEditor, isPreviewMode]);

  const scopedCss = useMemo(() => getCSS(P), [P]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      {lightbox === 'on' && <LightboxMediaPreloadPool mediaList={lightboxMediaToPreload} />}
      <div style={colorVars}>
        <div
          ref={containerRef}
          className={`${P}-wrapper ${P}-type-${type}${shouldAlignEntries ? ` ${P}-align-entries` : ''}${customLayout ? ` ${P}-custom-layout` : ''}${isTextOutside ? ` ${P}-text-outside` : ''}${isAutoHeight ? ` ${P}-auto-height` : ''} ${P}-image-align-${customLayout ? 'top' : align} ${wrapperStateClasses}`.trim()}
          style={wrapperLayoutStyle}>
          {cropContent.map((item: any, index: number) => {
            const hasTitle = hasText(item.title);
            const hasSubtitle = hasText(item.subtitle);
            const itemLink = lightbox === 'off' && item.link?.value ? item.link : undefined;
            const isLastRow = Math.floor(index / columnsCount)
              === Math.ceil(cropContent.length / columnsCount) - 1;
            const gridColumn = isPartialLastRow && index >= lastRowStartIndex
              ? `${lastRowStartColumn + (index - lastRowStartIndex)}`
              : undefined;
            const customSlot = customSlots?.[index];
            const itemSize = customSlot?.width ?? size;
            const itemWidthScaled = scalingValue(itemSize, isEditor);
            const textBoxWidthStyle = `calc(${itemWidthScaled} * (${textBoxWidth} / 100))`;
            const controlWidthStyle = scalingValue(itemSize * textBoxWidth / 100, isEditor);
            const { displayItems, lightboxItemsForEntry, lightboxIndexes } = entriesMedia[index];
            const mediaAspect = slider === 'off' ? entryMediaAspects[index] : undefined;
            const imageWrapperStyle = getImageWrapperStyle(
              itemWidthScaled,
              customSlot,
              { aspect: mediaAspect, isEmpty: displayItems.length === 0 },
            );
            const entryImageStyle = isAutoHeight && slider === 'off' && !mediaAspect
              ? { ...imageStyle, height: 'auto' }
              : imageStyle;
            const itemStyle: React.CSSProperties | undefined = customSlot && customLayout && customPlacement
              ? {
                  position: 'absolute',
                  left: scalingValue(customSlot.column * (customLayout.columnWidth + customLayout.gutterWidth), isEditor),
                  top: scalingValue(customPlacement.tops[index], isEditor),
                  width: itemWidthScaled,
                }
              : customSlot
              ? {
                  gridColumn: customSlot.gridColumn,
                  gridRow: customRows?.gridRows[index],
                  alignSelf: 'start',
                }
              : gridColumn && !shouldAlignEntries ? { gridColumn } : undefined;

            const typeCTextBlock = isTextBeforeImage ? (
              <div className={`${P}-item-text-block`}>
                {hasTitle && (
                  <p className={titleTextClassName} style={{ width: textBoxWidthStyle, ...titleTextStyle }}>
                    {item.title}
                  </p>
                )}
                {hasTitle && (
                  <div
                    data-controls={isEditMode ? 'titleMarginTop' : undefined}
                    className={isEditMode ? `${P}-control` : undefined}
                    style={{
                      height: scalingValue(titleMarginTop ?? 0, isEditor),
                      width: controlWidthStyle,
                    }}
                  />
                )}
                {hasSubtitle && (
                  <p className={subtitleTextClassName} style={{ width: textBoxWidthStyle, ...subtitleTextStyle }}>
                    {item.subtitle}
                  </p>
                )}
                {hasSubtitle && (
                  <div
                    data-controls={isEditMode ? 'subtitleMarginTop' : undefined}
                    className={isEditMode ? `${P}-control` : undefined}
                    style={{
                      height: scalingValue(subtitleMarginTop ?? 0, isEditor),
                      width: controlWidthStyle,
                    }}
                  />
                )}
              </div>
            ) : null;

            const titleRow = shouldAlignEntries ? (
              <div className={`${P}-item-title-row`}>
                {!isTextBeforeImage && (
                  <div
                    data-controls={isEditMode && hasTitle ? 'titleMarginTop' : undefined}
                    className={isEditMode && hasTitle ? `${P}-control` : undefined}
                    style={{
                      height: hasTitle ? scalingValue(titleMarginTop ?? 0, isEditor) : 0,
                      width: controlWidthStyle,
                    }}
                  />
                )}
                {hasTitle && (
                  <p className={titleTextClassName} style={{ width: textBoxWidthStyle, ...titleTextStyle }}>
                    {item.title}
                  </p>
                )}
                {isTextBeforeImage && hasTitle && (
                  <div
                    data-controls={isEditMode ? 'titleMarginTop' : undefined}
                    className={isEditMode ? `${P}-control` : undefined}
                    style={{
                      height: scalingValue(titleMarginTop ?? 0, isEditor),
                      width: controlWidthStyle,
                    }}
                  />
                )}
              </div>
            ) : null;

            const subtitleRow = shouldAlignEntries ? (
              <div className={`${P}-item-subtitle-row`}>
                {!isTextBeforeImage && (
                  <div
                    data-controls={isEditMode && hasSubtitle ? 'subtitleMarginTop' : undefined}
                    className={isEditMode && hasSubtitle ? `${P}-control` : undefined}
                    style={{
                      height: hasSubtitle ? scalingValue(subtitleMarginTop ?? 0, isEditor) : 0,
                      width: controlWidthStyle,
                    }}
                  />
                )}
                {hasSubtitle && (
                  <p className={subtitleTextClassName} style={{ width: textBoxWidthStyle, ...subtitleTextStyle }}>
                    {item.subtitle}
                  </p>
                )}
                {isTextBeforeImage && hasSubtitle && (
                  <div
                    data-controls={isEditMode ? 'subtitleMarginTop' : undefined}
                    className={isEditMode ? `${P}-control` : undefined}
                    style={{
                      height: scalingValue(subtitleMarginTop ?? 0, isEditor),
                      width: controlWidthStyle,
                    }}
                  />
                )}
              </div>
            ) : null;

            const alignedTextRows = (
              <LinkWrapper link={itemLink} className={`${P}-item-text-link`}>
                {titleRow}
                {subtitleRow}
              </LinkWrapper>
            );

            const imageContent = (
              <GridItemMediaWrapper className={imageWrapperClassName} style={imageWrapperStyle}>
                {displayItems.length === 0
                  ? null
                  : slider === 'off'
                    ?
                    (() => {
                      const { displayMedia } = displayItems[0];
                      const lightboxIndex = lightboxIndexes[0];
                      return (
                        <GridMediaItem
                          media={displayMedia}
                          className={`${P}-item-${isVideoMedia(displayMedia) ? 'video' : 'image'}`.trim()}
                          style={entryImageStyle}
                          hasLightbox={lightbox === 'on'}
                          onMediaClick={canOpenLightboxMedia && lightboxIndex >= 0
                            ? () => openLightbox(lightboxItemsForEntry, lightboxIndex)
                            : undefined}
                        />
                      );
                    })()
                    :
                    <>
                    {isFitSlider && (
                      <div className={`${P}-item-image-wrapper-sizer`} aria-hidden="true">
                        {displayItems.map(({ displayMedia }) => (
                          isEmbedMedia(displayMedia) ? (
                            <div key={`sizer-${displayMedia.assetId}`} style={{ aspectRatio: `${getEmbedAspect(displayMedia)}` }} />
                          ) : isVideoMedia(displayMedia) ? (
                            <LazyVideo key={`sizer-${displayMedia.assetId}`} src={displayMedia.assetId} nearPreload='metadata' muted playsInline />
                          ) : (
                            <img key={`sizer-${displayMedia.assetId}`} src={displayMedia.assetId} alt="" />
                          )
                        ))}
                      </div>
                    )}
                    <GridEntrySlider
                      key={`${transition}-${itemSize}-${direction}-${sliderTiming}-${layoutId}-${displayItems.length}`}
                      prefix={P}
                      isFade={transition === 'fade'}
                      direction={direction}
                      intervalMs={sliderTiming * 1000}
                      slides={displayItems.map(({ displayMedia }, imgIndex) => {
                        const lightboxIndex = lightboxIndexes[imgIndex];
                        return (
                          <GridMediaItem
                            media={displayMedia}
                            className={`${P}-item-${isVideoMedia(displayMedia) ? 'video' : 'image'}`.trim()}
                            style={imageStyle}
                            hasLightbox={lightbox === 'on'}
                            isSliderSlide
                            onMediaClick={canOpenLightboxMedia && lightboxIndex >= 0
                              ? () => openLightbox(lightboxItemsForEntry, lightboxIndex)
                              : undefined}
                          />
                        );
                      })}
                    />
                    </>
                }
              </GridItemMediaWrapper>
            );

            const typeABText = !isTextBeforeImage ? (
              <>
                <div
                  data-controls={isEditMode && hasTitle ? 'titleMarginTop' : undefined}
                  className={isEditMode && hasTitle ? `${P}-control` : undefined}
                  style={{
                    height: hasTitle ? scalingValue(titleMarginTop ?? 0, isEditor) : 0,
                    width: controlWidthStyle,
                  }}
                />
                <p
                  className={titleTextClassName}
                  style={{ width: textBoxWidthStyle, ...titleTextStyle }}
                >
                  {item.title}
                </p>
                <div
                  data-controls={isEditMode && hasSubtitle ? 'subtitleMarginTop' : undefined}
                  className={isEditMode && hasSubtitle ? `${P}-control` : undefined}
                  style={{
                    height: hasSubtitle ? scalingValue(subtitleMarginTop ?? 0, isEditor) : 0,
                    width: controlWidthStyle,
                  }}
                />
                <p
                  className={subtitleTextClassName}
                  style={{ width: textBoxWidthStyle, ...subtitleTextStyle }}
                >
                  {item.subtitle}
                </p>
              </>
            ) : null;

            // the aligned layout sizes this box whether or not it links anywhere
            const alignedImage = itemLink ? (
              <LinkWrapper link={itemLink} className={`${P}-item-image-link`}>
                {imageContent}
              </LinkWrapper>
            ) : (
              <a className={`${P}-item-image-link`}>{imageContent}</a>
            );

            return (
            <div
              key={index}
              className={`${P}-item`.trim()}
              style={itemStyle}
            >
              <div
                ref={(el) => { itemInnerRefs.current[index] = el; }}
                className={`${isEditMode
                  ? `${P}-item-inner`
                  : `${P}-item-inner-hidden`}${shouldAlignEntries && isLastRow ? ` ${P}-item-inner-last-row` : ''}`.trim()}
                style={{
                  width: (textBoxWidth ?? 0) > 100
                    ? `calc(${itemWidthScaled} * (${textBoxWidth} / 100))`
                    : itemWidthScaled,
                  ...(customSlot && !isTextOutside && !isAutoHeight ? { height: scalingValue(customSlot.height, isEditor) } : {}),
                  ...(gridColumn && shouldAlignEntries ? { gridColumn } : {}),
                }}
              >
                {shouldAlignEntries ? (
                  <>
                    {isTextBeforeImage ? (
                      <>
                        {alignedTextRows}
                        {alignedImage}
                      </>
                    ) : (
                      <>
                        {alignedImage}
                        {alignedTextRows}
                      </>
                    )}
                  </>
                ) : itemLink ? (
                  <>
                    <LinkWrapper link={itemLink} className={`${P}-item-image-link`}>
                      {typeCTextBlock}
                      {imageContent}
                    </LinkWrapper>
                    {!isTextBeforeImage && (
                      <LinkWrapper link={itemLink} className={`${P}-item-text-link`}>
                        {typeABText}
                      </LinkWrapper>
                    )}
                  </>
                ) : (
                  <>
                    {typeCTextBlock}
                    {imageContent}
                    {typeABText}
                  </>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>
      {(!isEditor || isPreviewMode) && lightboxOpen && typeof document !== 'undefined' && lightbox === 'on' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <div style={getLightboxPortalStyle()} data-selection="none">
            <Lightbox
              prefix={P}
              items={lightboxItems}
              index={lightboxIndex}
              imageDisplay={resolveLightboxImageDisplay(lightboxImageDisplay)}
              isEditor={isEditor}
              isPreviewMode={isPreviewMode}
              isEditMode={isEditMode}
              closeIcon={closeIcon}
              closeIconMaxWidth={closeIconMaxWidth}
              closeIconColor={closeIconColor}
              closeIconHoverColor={closeIconHoverColor}
              iconMarginRight={iconMarginRight}
              contentMarginTop={contentMarginTop}
              onClose={() => setLightboxOpen(false)}
              onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length)}
              onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxItems.length)}
              counterClassName={lightboxCounterClassName}
              counterStyle={lightboxCounterFieldCss}
            />
          </div>,
          portalTarget,
        );
      })()}
    </>
  );
}

type GridLayoutConfig = {
  entryWidth: number;
  horizontalGap: number;
  wrapperWidth: number;
  columnsCount: number;
  lockedParam?: 'wrapperWidth' | 'entryWidth' | 'horizontalGap' | null;
};

type CustomGridBlock = {
  column: number;
  span: number;
  top: number;
  height: number;
};

type CustomGridLayout = {
  columnsCount: number;
  columnWidth: number;
  gutterWidth: number;
  maxWidth: number | null;
  verticalGap?: number;
  beat?: number;
  repeatHeight?: number;
  blocks: CustomGridBlock[];
  cellHeight?: 'manual' | 'auto';
  masonry?: 'off' | 'on';
};

type GridSettings = {
  type: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  gridLayout?: GridLayoutConfig;
  customGrid?: CustomGridLayout;
  textBoxWidth: number;
  verticalGap?: number;
  entriesCount?: number;
  lightbox: 'on' | 'off';
  imageDisplay: 'fit' | 'cover' | {
    display: 'fit' | 'cover';
    ratioValue?: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed?: boolean;
  };
  imageCorners?: number;
  lightboxImageDisplay?: 'fit' | 'cover' | { display?: 'fit' | 'cover' };
  slider: 'on' | 'off';
  sliderTiming: number;
  direction: 'horizontal' | 'vertical' | 'random',
  transition: 'fade' | 'slide',
  showText: 'always' | 'on hover';
  hover?: 'none' | 'zoom-in' | 'greyscale' | 'scale-down';
  alignEntries?: 'on' | 'off';
  align?: 'top' | 'center' | 'bottom';
  textGrowth?: 'inside' | 'outside';
  titleMarginTop: number;
  subtitleMarginTop: number;
  titleColor: string;
  subtitleColor: string;
  lightboxCounterColor: string;
  titleFontFamily: string;
  titleFontSettings?: { fontWeight: number; fontStyle: string };
  titleFontSize?: number;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleWordSpacing?: number;
  titleTextAppearance?: TextStyles['textAppearance'];
  subtitleFontFamily: string;
  subtitleFontSettings?: { fontWeight: number; fontStyle: string };
  subtitleFontSize?: number;
  subtitleLineHeight?: number;
  subtitleLetterSpacing?: number;
  subtitleWordSpacing?: number;
  subtitleTextAppearance?: TextStyles['textAppearance'];
  lightboxCounterFontFamily: string;
  lightboxCounterFontSettings?: { fontWeight: number; fontStyle: string };
  lightboxCounterFontSize?: number;
  lightboxCounterLineHeight?: number;
  lightboxCounterLetterSpacing?: number;
  lightboxCounterWordSpacing?: number;
  lightboxCounterTextAppearance?: TextStyles['textAppearance'];
  closeIcon?: string | null;
  closeIconMaxWidth?: number;
  closeIconColor?: string;
  closeIconHoverColor?: string;
  iconMarginRight?: number;
  contentMarginTop?: number;
};

type ColorKeys =
  | 'titleColor'
  | 'subtitleColor'
  | 'lightboxCounterColor'

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  titleColor: 'title-color',
  subtitleColor: 'subtitle-color',
  lightboxCounterColor: 'lightbox-counter-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;
