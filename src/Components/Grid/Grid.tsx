import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import { CommonComponentProps } from '../props';
import {
  buildColorVars,
  getFormFieldValidationError,
  scalingValue,
  useScopedStyles,
} from '../utils/index';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';

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
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer,
.${P}-item-image-wrapper-fit-slider > .${P}-item-slider {
  grid-area: 1 / 1;
  width: 100%;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer {
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
.${P}-item-image-wrapper-fit-slider > .${P}-item-slider {
  align-self: stretch;
  min-height: 0;
}
.${P}-item-image-link {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
.${P}-item-slider,
.${P}-item-slider .splide__track,
.${P}-item-slider .splide__list,
.${P}-item-slider .splide__slide {
  width: 100%;
  height: 100%;
}
.${P}-item-slider .splide__slide {
  display: flex;
  justify-content: center;
  align-items: center;
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
.${P}-image-align-top .${P}-item-slider .splide__slide {
  align-items: flex-start;
}
.${P}-image-align-center .${P}-item-slider .splide__slide {
  align-items: center;
}
.${P}-image-align-bottom .${P}-item-slider .splide__slide {
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
.${P}-image-align-top.${P}-align-entries .${P}-item-slider .splide__slide {
  align-items: flex-start;
}
.${P}-image-align-center.${P}-align-entries .${P}-item-slider .splide__slide {
  align-items: center;
}
.${P}-image-align-bottom.${P}-align-entries .${P}-item-slider .splide__slide {
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
`;
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
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  counterClassName: string;
  counterStyle: React.CSSProperties;
};

const LIGHTBOX_ANIM_MS = 500;
const SLIDER_TRANSITION_MS = 750;
const LIGHTBOX_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SWIPE_CLOSE_THRESHOLD = 72;
const SWIPE_NAV_THRESHOLD = 50;

type SwipeAxis = 'none' | 'horizontal' | 'vertical';

type GridMedia = {
  url: string;
  name?: string;
  type: 'image' | 'video';
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
  if (second?.url) return second;
  if (first?.url) return first;
  return null;
}

function getLightboxMediaForPair(pair: GridMediaPair): GridMedia | null {
  const [first] = pair.media;
  if (first?.url) return first;
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
        lightboxMedia: lightboxMedia?.url ? lightboxMedia : null,
      }];
    });
  }

  return (image as GridMedia[])
    .filter(media => media?.url)
    .map(media => ({
      displayMedia: media,
      lightboxMedia: media,
    }));
}

function isVideoMedia(media: GridMedia): boolean {
  if (media.type === 'video') return true;
  return false;
}

function collectGridLightboxMedia(content: any[]): GridMedia[] {
  const seen = new Set<string>();
  const result: GridMedia[] = [];

  for (const item of content) {
    const displayItems = getGridDisplayItems(item.gallery);
    for (const entry of displayItems) {
      const media = entry.lightboxMedia;
      if (media?.url && !seen.has(media.url)) {
        seen.add(media.url);
        result.push(media);
      }
    }
  }

  return result;
}

function LightboxMediaPreloadPool({ mediaList }: { mediaList: GridMedia[] }) {
  if (mediaList.length === 0) return null;

  return (
    <div
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
      {mediaList.map((media) => (
        isVideoMedia(media) ? (
          <video
            key={media.url}
            src={media.url}
            preload='auto'
            muted
            playsInline
          />
        ) : (
          <img
            key={media.url}
            src={media.url}
            alt=''
          />
        )
      ))}
    </div>
  );
}

function unloadVideoElement(video: HTMLVideoElement) {
  video.pause();
  video.removeAttribute('src');
  video.load();
}

function GridMediaItem({
  media,
  className,
  style,
  onMediaClick,
}: {
  media: GridMedia;
  className: string;
  style: React.CSSProperties;
  onMediaClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  if (isVideoMedia(media)) {
    return (
      <video
        src={media.url}
        className={className}
        style={{
          ...style,
          cursor: onMediaClick ? 'pointer' : 'default',
        }}
        muted
        autoPlay
        loop
        playsInline
        onClick={onMediaClick}
      />
    );
  }

  return (
    <img
      src={media.url}
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
  phase,
  mediaRef,
  mediaStyle,
  onLoadedMetadata,
  onClick,
  onMouseMove,
}: {
  src: string;
  phase: 'opening' | 'open' | 'closing';
  mediaRef: React.RefObject<HTMLVideoElement>;
  mediaStyle: React.CSSProperties;
  onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onClick: (e: React.MouseEvent<HTMLVideoElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLVideoElement>) => void;
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
      controls={phase === 'open'}
      playsInline
      preload='auto'
      onLoadedMetadata={onLoadedMetadata}
      onClick={onClick}
      onMouseMove={onMouseMove}
      style={mediaStyle}
    />
  );
}

function Lightbox({ prefix: P, items, index, imageDisplay, isEditor, onClose, onPrev, onNext, counterClassName, counterStyle }: LightboxProps) {
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
  const isHorizontalNavActive = slideOffset !== 0 || slideAnimating;
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
    if (prevIndexRef.current === index && prevItemUrlRef.current === currentItem?.url) return;

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
    prevItemUrlRef.current = currentItem?.url;
  }, [index, currentItem?.url, clearSlideCommitTimer]);

  useLayoutEffect(() => {
    const rapidDirection = rapidNavDirectionRef.current;
    if (rapidDirection === null) return;

    rapidNavDirectionRef.current = null;
    requestAnimationFrame(() => {
      startProgrammaticSlideRef.current(rapidDirection);
    });
  }, [index, currentItem?.url]);

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

  const contentRect = finalRect
    ? (isCover ? finalRect : getContainRect(finalRect, mediaNaturalSize))
    : null;

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.stopPropagation();
    if (touchInteractionRef.current) {
      touchInteractionRef.current = false;
      return;
    }
    if (items.length <= 1) return;

    const rect = contentRect ?? e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const controlsZoneHeight = Math.min(52, rect.height * 0.2);

    if (y > rect.height - controlsZoneHeight) {
      return;
    }

    if (e.clientX - rect.left < rect.width / 2) {
      startProgrammaticSlide(-1);
      return;
    }

    startProgrammaticSlide(1);
  };

  const handleVideoMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (items.length <= 1) return;

    const rect = contentRect ?? e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const controlsZoneHeight = Math.min(52, rect.height * 0.2);

    if (y > rect.height - controlsZoneHeight) {
      e.currentTarget.style.cursor = 'default';
      return;
    }

    e.currentTarget.style.cursor = x < rect.width / 2 ? 'w-resize' : 'e-resize';
  };

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
    pointerEvents: isCurrentVideo && isOpen && !isHorizontalNavActive ? 'auto' : 'none',
    touchAction: isCurrentVideo && isOpen ? 'none' : undefined,
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

  const navOverlayBaseStyle = contentRect ? {
    position: 'fixed' as const,
    top: contentRect.top,
    height: contentRect.height,
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
          {isVideoMedia(neighborItem) ? (
            <video
              key={`neighbor-${neighborIndex}-${neighborItem.url}`}
              src={neighborItem.url}
              muted
              playsInline
              preload='auto'
              style={neighborMediaStyle}
            />
          ) : (
            <img
              key={`neighbor-${neighborIndex}-${neighborItem.url}`}
              src={neighborItem.url}
              alt={neighborItem.name}
              style={neighborMediaStyle}
            />
          )}
        </div>
      )}

      {finalRect && viewportRect && currentItem && (
        <div style={currentBackingStyle} onTransitionEnd={handleSlideTransitionEnd}>
          {isCurrentVideo ? (
            <LightboxVideo
              key={`${index}-${currentItem.url}`}
              src={currentItem.url}
              phase={phase}
              mediaRef={mediaRef as React.RefObject<HTMLVideoElement>}
              mediaStyle={currentMediaStyle}
              onLoadedMetadata={handleMediaLoad}
              onClick={handleVideoClick}
              onMouseMove={handleVideoMouseMove}
            />
          ) : (
            <img
              key={`${index}-${currentItem.url}`}
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={currentItem.url}
              alt={currentItem.name}
              onLoad={handleMediaLoad}
              style={currentMediaStyle}
            />
          )}
        </div>
      )}

      {isOpen && navOverlayBaseStyle && items.length > 1 && !isCurrentVideo && (
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

export function Grid({ settings, content, isEditor, isPreviewMode, isEditMode, metadata, activeEvent, layoutId, portalId }: GridProps) {
  const { prefix: P } = useScopedStyles();
  const {
    type = 'a',
    gridLayout,
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
    showText = 'always',
    alignEntries = 'off',
    align = 'top',
  } = settings;

  const resolvedTitleTextStyle: TextStyles = {
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
  };
  const titleTypographyCss = omitTextColors(textStylesToCss(resolvedTitleTextStyle, isEditor));
  const titleFieldCss = {
    ...titleTypographyCss,
  } as React.CSSProperties;

  const resolvedSubtitleTextStyle: TextStyles = {
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
  };
  const subtitleTypographyCss = omitTextColors(textStylesToCss(resolvedSubtitleTextStyle, isEditor));
  const subtitleFieldCss = {
    ...subtitleTypographyCss,
  } as React.CSSProperties;

  const resolvedLightboxCounterTextStyle: TextStyles = {
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
  };
  const lightboxCounterTypographyCss = omitTextColors(textStylesToCss(resolvedLightboxCounterTextStyle, isEditor));
  const lightboxCounterFieldCss = {
    ...lightboxCounterTypographyCss,
    ...getGridTextLeadingVars(lightboxCounterFontSize, lightboxCounterLineHeight, P, isEditor),
  } as React.CSSProperties;

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
  const titleTextLeadingVars = getGridTextLeadingVars(titleFontSize, titleLineHeight, P, isEditor);
  const subtitleTextLeadingVars = getGridTextLeadingVars(subtitleFontSize, subtitleLineHeight, P, isEditor);
  const lightboxCounterClassName = getGridTextClassName(
    lightboxCounterFontSize,
    lightboxCounterLineHeight,
    `${P}-lightbox-counter`,
    `${P}-text-tight-leading`,
  );

  const colorVars = buildColorVars(P, {
    titleColor,
    subtitleColor,
    lightboxCounterColor,
  }, COLOR_VAR_MAP, STATE_KEYS);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const showTextOnHover = showText === 'on hover' && (!isEditor || isPreviewMode);
  const wrapperStateClasses = `${stateClass}${showTextOnHover ? ` ${P}-show-text-hover` : ''}`.trim();

  const resEntriesCount = entriesCount === 0 ? Infinity : entriesCount;

  const cropContent = (content ?? []).slice(0, resEntriesCount);
  const lightboxMediaToPreload = useMemo(
    () => (lightbox === 'on' ? collectGridLightboxMedia(cropContent) : []),
    [cropContent, lightbox],
  );

  const size = gridLayout.entryWidth ?? 0.2;

  const isCover = imageDisplay?.display === 'cover';
  const ratioValue = imageDisplay?.ratioValue ?? '1:1';
  const ratioReversed = imageDisplay?.reversed ?? false;
  const [rW, rH] = ratioValue.split(':').map(Number);
  const effW = ratioReversed ? rH : rW;
  const effH = ratioReversed ? rW : rH;
  const aspectRatio = `${effW} / ${effH}`;

  const columnsCount = gridLayout.columnsCount;
  const entryWidthScaled = scalingValue(size ?? 0, isEditor);
  const imageWrapperWidth = entryWidthScaled;
  const isFitSlider = !isCover && slider !== 'off';

  const itemsInLastRow = cropContent.length % columnsCount || columnsCount;
  const isPartialLastRow = itemsInLastRow < columnsCount && cropContent.length > 0;
  const lastRowStartIndex = cropContent.length - itemsInLastRow;
  const lastRowStartColumn = isPartialLastRow
    ? Math.floor((columnsCount - itemsInLastRow) / 2) + 1
    : 1;

  const imageBorderRadius = imageCorners ? scalingValue(imageCorners, isEditor) : undefined;

  const imageWrapperStyle: React.CSSProperties = {
    width: imageWrapperWidth,
    ...(isCover
      ? { aspectRatio, height: 'auto', overflow: 'hidden' }
      : { height: 'auto' }),
    ...(imageBorderRadius ? { borderRadius: imageBorderRadius, overflow: 'hidden' } : {}),
  };

  const imageWrapperClassName = `${P}-item-image-wrapper${isFitSlider ? ` ${P}-item-image-wrapper-fit-slider` : ''}`.trim();
  const isTextBeforeImage = type === 'd' || type === 'e' || type === 'f';
  const shouldAlignEntries = alignEntries === 'on';
  const textBoxWidthStyle = `calc(${scalingValue(size ?? 0, isEditor)} * (${textBoxWidth} / 100))`;
  const controlWidthStyle = scalingValue(size * textBoxWidth / 100, isEditor);

  const imageStyle: React.CSSProperties = isCover
    ? {
        objectFit: 'cover',
        pointerEvents: 'auto',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        ...(imageBorderRadius ? { borderRadius: imageBorderRadius } : {}),
      }
    : {
        objectFit: 'contain',
        pointerEvents: 'auto',
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        ...(imageBorderRadius ? { borderRadius: imageBorderRadius } : {}),
      };

  const [dir, setDir] = useState('ltr');
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(Math.round(entries[0].contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lightboxPortalStyle = (() => {
    const style: Record<string, string> = { ...(colorVars as Record<string, string>) };
    const articleWidth = containerRef.current
      ? getComputedStyle(containerRef.current).getPropertyValue('--cntrl-article-width').trim()
      : '';
    if (articleWidth) {
      style['--cntrl-article-width'] = articleWidth;
    }
    return style as React.CSSProperties;
  })();

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
          className={`${P}-wrapper ${P}-type-${type}${shouldAlignEntries ? ` ${P}-align-entries` : ''} ${P}-image-align-${align} ${wrapperStateClasses}`.trim()}
          style={{
            gridTemplateColumns: `repeat(${columnsCount}, ${entryWidthScaled})`,
            rowGap: shouldAlignEntries ? 0 : scalingValue(verticalGap ?? 0, isEditor),
            columnGap: scalingValue(gridLayout.horizontalGap ?? 0, isEditor),
            width: scalingValue(gridLayout.wrapperWidth ?? 0, isEditor),
            ...(shouldAlignEntries
              ? { [`--${P}-align-entries-row-gap`]: scalingValue(verticalGap ?? 0, isEditor) }
              : {}),
          }}>
          {cropContent.map((item: any, index: number) => {
            const hasTitle = hasText(item.title);
            const hasSubtitle = hasText(item.subtitle);
            const itemLink = (item.link?.length ?? 0) > 0 && lightbox === 'off' ? item.link : undefined;
            const isLastRow = Math.floor(index / columnsCount)
              === Math.ceil(cropContent.length / columnsCount) - 1;
            const gridColumn = isPartialLastRow && index >= lastRowStartIndex
              ? `${lastRowStartColumn + (index - lastRowStartIndex)}`
              : undefined;

            const typeCTextBlock = isTextBeforeImage ? (
              <div className={`${P}-item-text-block`}>
                {hasTitle && (
                  <p className={titleTextClassName} style={{ width: textBoxWidthStyle, ...titleFieldCss, ...titleTextLeadingVars }}>
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
                  <p className={subtitleTextClassName} style={{ width: textBoxWidthStyle, ...subtitleFieldCss, ...subtitleTextLeadingVars }}>
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
                  <p className={titleTextClassName} style={{ width: textBoxWidthStyle, ...titleFieldCss, ...titleTextLeadingVars }}>
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
                  <p className={subtitleTextClassName} style={{ width: textBoxWidthStyle, ...subtitleFieldCss, ...subtitleTextLeadingVars }}>
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

            const alignedTextRows = itemLink ? (
              <a href={itemLink} target="_blank" className={`${P}-item-text-link`}>
                {titleRow}
                {subtitleRow}
              </a>
            ) : (
              <>
                {titleRow}
                {subtitleRow}
              </>
            );

            const displayItems = getGridDisplayItems(item.gallery);
            const lightboxItemsForEntry = displayItems
              .filter(entry => entry.lightboxMedia)
              .map(entry => entry.lightboxMedia!);

            const imageContent = (
              <div className={imageWrapperClassName} style={imageWrapperStyle}>
                {displayItems.length === 0
                  ? null
                  : slider === 'off'
                    ?
                    (() => {
                      const { displayMedia, lightboxMedia } = displayItems[0];
                      const lightboxIndex = lightboxMedia
                        ? lightboxItemsForEntry.findIndex(item => item.url === lightboxMedia.url)
                        : -1;
                      return (
                        <GridMediaItem
                          media={displayMedia}
                          className={`${P}-item-${isVideoMedia(displayMedia) ? 'video' : 'image'}`.trim()}
                          style={imageStyle}
                          onMediaClick={canOpenLightboxMedia && lightboxIndex >= 0
                            ? () => openLightbox(lightboxItemsForEntry, lightboxIndex)
                            : undefined}
                        />
                      );
                    })()
                    :
                    <>
                    {isFitSlider && shouldAlignEntries && (
                      <div className={`${P}-item-image-wrapper-sizer`} aria-hidden="true">
                        {displayItems.map(({ displayMedia }) => (
                          isVideoMedia(displayMedia) ? (
                            <video key={`sizer-${displayMedia.url}`} src={displayMedia.url} muted playsInline />
                          ) : (
                            <img key={`sizer-${displayMedia.url}`} src={displayMedia.url} alt="" />
                          )
                        ))}
                      </div>
                    )}
                    <Splide
                      key={`${transition}-${size}-${direction}-${sliderTiming}-${containerWidth}-${layoutId}`}
                      className={`${P}-item-slider`}
                      options={{
                        arrows: false,
                        pagination: false,
                        drag: false,
                        perPage: 1,
                        autoplay: true,
                        interval: sliderTiming * 1000,
                        width: '100%',
                        height: '100%',
                        speed: SLIDER_TRANSITION_MS,
                        type: transition === 'fade' ? 'fade' : 'loop',
                        rewind: transition === 'fade',
                        pauseOnHover: false,
                        pauseOnFocus: false,
                        direction: transition === 'fade' ? 'ltr' : direction !== 'random'
                          ? direction === 'horizontal'
                            ? 'ltr'
                            : 'ttb'
                          : dir as 'ltr' | 'ttb' | 'rtl',
                      }}
                      onMoved={(splide) => {
                        if (direction !== 'random' || transition === 'fade') return;
                        const next = Math.random() > 0.5 ? Math.random() > 0.5 ? 'rtl' : 'ltr' : 'ttb';
                        setDir(next);

                        setTimeout(() => {
                          splide.refresh();
                        }, 0);
                      }}
                    >
                      {displayItems.map(({ displayMedia, lightboxMedia }, imgIndex) => {
                        const lightboxIndex = lightboxMedia
                          ? lightboxItemsForEntry.findIndex(item => item.url === lightboxMedia.url)
                          : -1;
                        return (
                          <SplideSlide key={imgIndex}>
                            <GridMediaItem
                              media={displayMedia}
                              className={`${P}-item-${isVideoMedia(displayMedia) ? 'video' : 'image'}`.trim()}
                              style={imageStyle}
                              onMediaClick={canOpenLightboxMedia && lightboxIndex >= 0
                                ? () => openLightbox(lightboxItemsForEntry, lightboxIndex)
                                : undefined}
                            />
                          </SplideSlide>
                        );
                      })}
                    </Splide>
                    </>
                }
              </div>
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
                  style={{ width: textBoxWidthStyle, ...titleFieldCss, ...titleTextLeadingVars }}
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
                  style={{ width: textBoxWidthStyle, ...subtitleFieldCss, ...subtitleTextLeadingVars }}
                >
                  {item.subtitle}
                </p>
              </>
            ) : null;

            return (
            <div
              key={index}
              className={`${P}-item`.trim()}
              style={gridColumn && !shouldAlignEntries ? { gridColumn } : undefined}
            >
              <div
                className={`${isEditMode 
                  ? `${P}-item-inner` 
                  : `${P}-item-inner-hidden`}${shouldAlignEntries && isLastRow ? ` ${P}-item-inner-last-row` : ''}`.trim()}
                style={{
                  width: (textBoxWidth ?? 0) > 100
                    ? `calc(${entryWidthScaled} * (${textBoxWidth} / 100))`
                    : entryWidthScaled,
                  ...(gridColumn && shouldAlignEntries ? { gridColumn } : {}),
                }}
              >
                {shouldAlignEntries ? (
                  <>
                    {isTextBeforeImage ? (
                      <>
                        {alignedTextRows}
                        <a href={itemLink} target="_blank" className={`${P}-item-image-link`}>
                          {imageContent}
                        </a>
                      </>
                    ) : (
                      <>
                        <a href={itemLink} target="_blank" className={`${P}-item-image-link`}>
                          {imageContent}
                        </a>
                        {alignedTextRows}
                      </>
                    )}
                  </>
                ) : itemLink ? (
                  <>
                    <a href={itemLink} target="_blank" className={`${P}-item-image-link`}>
                      {typeCTextBlock}
                      {imageContent}
                    </a>
                    {!isTextBeforeImage && (
                      <a href={itemLink} target="_blank" className={`${P}-item-text-link`}>
                        {typeABText}
                      </a>
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
          <div style={lightboxPortalStyle} data-selection="none">
            <Lightbox
              prefix={P}
              items={lightboxItems}
              index={lightboxIndex}
              imageDisplay={resolveLightboxImageDisplay(lightboxImageDisplay)}
              isEditor={isEditor}
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

type GridSettings = {
  type: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  gridLayout: GridLayoutConfig;
  textBoxWidth: number;
  verticalGap: number;
  entriesCount: number;
  lightbox: 'on' | 'off';
  imageDisplay: {
    display: 'fit' | 'cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
  imageCorners?: number;
  lightboxImageDisplay?: 'fit' | 'cover' | { display?: 'fit' | 'cover' };
  slider: 'on' | 'off';
  sliderTiming: number;
  direction: 'horizontal' | 'vertical' | 'random',
  transition: 'fade' | 'slide',
  showText: 'always' | 'on hover';
  alignEntries: 'on' | 'off';
  align?: 'top' | 'center' | 'bottom';
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
