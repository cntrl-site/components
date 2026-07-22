import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';
import { getDisplayedImageRect } from '../utils/getImageRect';
import {
  HiveLightboxTitles,
  type HiveLightboxTextEntry,
  type HiveLightboxTitleSettings,
} from '../Hive/HiveLightboxTitles';

export type WaterfallMedia = {
  url: string;
  name?: string;
  objectFit?: 'cover' | 'contain';
  type?: 'image' | 'video';
};

export type WaterfallLightboxContentItem = {
  title?: string;
  subtitle?: string;
  caption?: string;
  image?: WaterfallMedia;
};

export type WaterfallLightboxSettings = HiveLightboxTitleSettings;

export type LightboxEntryData = {
  gridIndex: number;
  items: WaterfallMedia[];
  entry: HiveLightboxTextEntry;
};

export type AnimRect = { top: number; left: number; width: number; height: number };

export function getLightboxCSS(P: string): string {
  return `
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
  align-items: baseline;
}
.${P}-titles-row-header {
  flex: 1;
  align-items: baseline;
}
.${P}-titles-row-header-controls {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-shrink: 0;
}
.${P}-close-icon {
  position: relative;
  flex-shrink: 0;
  align-self: center;
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
.${P}-titles-baseline-strut {
  width: 0;
  overflow: hidden;
  flex-shrink: 0;
  pointer-events: none;
  white-space: nowrap;
}
.${P}-titles-row-titles {
  position: relative;
  flex: 1;
  min-width: 0;
  align-self: flex-start;
}
.${P}-titles-stack {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  align-self: flex-start;
  min-width: 0;
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
  align-items: baseline;
  width: 100%;
  flex-shrink: 0;
  margin-bottom: 0;
}
.${P}-titles-row-top .${P}-title-cell[data-title="title1"] {
  flex: 0 0 auto;
  min-width: 0;
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
  align-items: baseline;
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
.${P}-lightbox-edit-mode {
  z-index: 1;
}
.${P}-lightbox-dismiss-area {
  position: relative;
  width: 100%;
  height: 100%;
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
.${P}-lightbox-content-area {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
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
.${P}-control {
  position: relative;
  z-index: 2;
  pointer-events: auto;
  flex-shrink: 0;
}
`;
}

const LIGHTBOX_ANIM_MS = 500;
const SLIDE_ANIM_MS = 650;
const LIGHTBOX_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SWIPE_CLOSE_THRESHOLD = 72;
const SWIPE_NAV_THRESHOLD = 50;
const ARROW_HOLD_ACCELERATE_MS = 10000;
const ARROW_HOLD_NORMAL_INTERVAL_MS = 650;
const ARROW_HOLD_FAST_INTERVAL_MS = 500;

type SwipeAxis = 'none' | 'horizontal' | 'vertical';

function getZoomTransform(from: AnimRect, to: AnimRect): string {
  const scaleX = from.width / to.width;
  const scaleY = from.height / to.height;
  const translateX = from.left - to.left;
  const translateY = from.top - to.top;
  return `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
}

export function getMediaClickSourceRect(
  target: HTMLElement,
  objectFit: 'cover' | 'contain',
): AnimRect {
  if (objectFit === 'contain' && target instanceof HTMLImageElement) {
    const rect = getDisplayedImageRect(target);
    return { left: rect.x, top: rect.y, width: rect.width, height: rect.height };
  }

  const cb = target.getBoundingClientRect();
  return { left: cb.left, top: cb.top, width: cb.width, height: cb.height };
}

export function getItemSourceRect(
  container: HTMLElement,
  gridIndex: number,
  objectFit: 'cover' | 'contain',
): AnimRect | null {
  const mediaEl = container.querySelector(`[data-waterfall-index="${gridIndex}"]`);
  if (!(mediaEl instanceof HTMLElement)) return null;
  return getMediaClickSourceRect(mediaEl, objectFit);
}

export function buildLightboxEntries(content: WaterfallLightboxContentItem[]): LightboxEntryData[] {
  return content.reduce<LightboxEntryData[]>((acc, item, gridIndex) => {
    if (!item.image?.url) return acc;
    acc.push({
      gridIndex,
      items: [item.image],
      entry: {
        title1: item.title ?? '',
        title2: item.subtitle ?? '',
        title3: item.caption ?? '',
      },
    });
    return acc;
  }, []);
}

function getAdjacentEntryMedia(
  entries: LightboxEntryData[],
  entryIdx: number,
  direction: -1 | 1,
): WaterfallMedia | null {
  if (entries.length <= 1) return null;
  const adjacentIdx = (entryIdx + direction + entries.length) % entries.length;
  return entries[adjacentIdx]?.items[0] ?? null;
}

function getFarAdjacentEntryMedia(
  entries: LightboxEntryData[],
  entryIdx: number,
  direction: -1 | 1,
): WaterfallMedia | null {
  if (entries.length <= 2) return null;
  const adjacentIdx = (entryIdx + direction + entries.length) % entries.length;
  return getAdjacentEntryMedia(entries, adjacentIdx, direction);
}

const SIDE_PEEK_WIDTH_RATIO = 0.03;

function getSidePeekWidth(bounds: LightboxBounds): number {
  return bounds.width * SIDE_PEEK_WIDTH_RATIO;
}

type LightboxBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const DEFAULT_LIGHTBOX_BOUNDS: LightboxBounds = {
  left: 0,
  top: 0,
  width: typeof window !== 'undefined' ? window.innerWidth : 1440,
  height: typeof window !== 'undefined' ? window.innerHeight : 900,
};

function toContainerRect(rect: AnimRect, bounds: LightboxBounds): AnimRect {
  return {
    left: rect.left - bounds.left,
    top: rect.top - bounds.top,
    width: rect.width,
    height: rect.height,
  };
}

type MediaDimensions = { width: number; height: number };

function getGhostRect(ghost: HTMLElement): AnimRect {
  const cb = ghost.getBoundingClientRect();
  return { width: cb.width, height: cb.height, left: cb.left, top: cb.top };
}

function getLightboxMediaDimensions(media: HTMLImageElement | HTMLVideoElement) {
  if (media instanceof HTMLVideoElement) {
    return { width: media.videoWidth, height: media.videoHeight };
  }
  return { width: media.naturalWidth, height: media.naturalHeight };
}

function fitMediaRectInGhost(
  ghost: HTMLElement,
  mediaWidth: number,
  mediaHeight: number,
): AnimRect {
  const cb = ghost.getBoundingClientRect();
  const cw = cb.width;
  const ch = cb.height;
  const ir = mediaWidth / mediaHeight;
  const cr = cw / ch;

  if (ir > cr) {
    const dh = cw / ir;
    return { width: cw, height: dh, left: cb.left, top: cb.top + (ch - dh) / 2 };
  }

  const dw = ch * ir;
  return { width: dw, height: ch, left: cb.left + (cw - dw) / 2, top: cb.top };
}

function getMediaFittedRect(
  ghost: HTMLElement | null,
  dimensions: MediaDimensions | undefined,
): AnimRect | null {
  if (!ghost || !dimensions?.width || !dimensions?.height) return null;
  return fitMediaRectInGhost(ghost, dimensions.width, dimensions.height);
}

function preloadMediaDimensions(
  media: WaterfallMedia,
  onDimensions: (url: string, width: number, height: number) => void,
) {
  if (isVideoMedia(media)) {
    const video = document.createElement('video');
    const handleMetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        onDimensions(media.url, video.videoWidth, video.videoHeight);
      }
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
    video.addEventListener('loadedmetadata', handleMetadata);
    video.preload = 'auto';
    video.src = media.url;
    video.load();
    return;
  }

  const image = new Image();
  image.onload = () => {
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      onDimensions(media.url, image.naturalWidth, image.naturalHeight);
    }
  };
  image.src = media.url;
}

export function collectAllWaterfallMedia(content: WaterfallLightboxContentItem[]): WaterfallMedia[] {
  const seen = new Set<string>();
  const result: WaterfallMedia[] = [];
  for (const item of content) {
    const media = item.image;
    if (!media?.url || seen.has(media.url)) continue;
    seen.add(media.url);
    result.push(media);
  }
  return result;
}

export function PreloadedMediaPool({ mediaList }: { mediaList: WaterfallMedia[] }) {
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

function positionPeekRect(fittedRect: AnimRect, side: 'left' | 'right', bounds: LightboxBounds): AnimRect {
  const { width, height, top } = fittedRect;
  const { left: containerLeft, width: containerWidth } = bounds;
  const peekWidth = getSidePeekWidth(bounds);

  if (side === 'left') {
    return {
      left: containerLeft + peekWidth - width,
      top,
      width,
      height,
    };
  }

  return {
    left: containerLeft + containerWidth - peekWidth,
    top,
    width,
    height,
  };
}

function getFarPeekRect(fittedRect: AnimRect, side: 'left' | 'right', bounds: LightboxBounds): AnimRect {
  const peekRect = positionPeekRect(fittedRect, side, bounds);
  return {
    ...peekRect,
    left: 2 * peekRect.left - fittedRect.left,
  };
}

function getSidePeekHitRect(sideRect: AnimRect, side: 'left' | 'right', bounds: LightboxBounds): AnimRect {
  const { left: containerLeft, width: containerWidth } = bounds;
  const peekWidth = getSidePeekWidth(bounds);

  if (side === 'left') {
    return {
      left: containerLeft,
      top: sideRect.top,
      width: peekWidth,
      height: sideRect.height,
    };
  }

  return {
    left: containerLeft + containerWidth - peekWidth,
    top: sideRect.top,
    width: peekWidth,
    height: sideRect.height,
  };
}

type SlidePlacement = 'center' | 'left-adjacent' | 'right-adjacent' | 'far-left' | 'far-right';

function getSlideRects(
  fittedRect: AnimRect,
  placement: SlidePlacement,
  direction: -1 | 1,
  bounds: LightboxBounds,
): { start: AnimRect; end: AnimRect } {
  const leftPeek = positionPeekRect(fittedRect, 'left', bounds);
  const rightPeek = positionPeekRect(fittedRect, 'right', bounds);
  const farLeft = getFarPeekRect(fittedRect, 'left', bounds);
  const farRight = getFarPeekRect(fittedRect, 'right', bounds);

  if (direction === 1) {
    switch (placement) {
      case 'center':
        return { start: fittedRect, end: leftPeek };
      case 'right-adjacent':
        return { start: rightPeek, end: fittedRect };
      case 'left-adjacent':
        return { start: leftPeek, end: farLeft };
      case 'far-right':
        return { start: farRight, end: rightPeek };
      default:
        return { start: fittedRect, end: fittedRect };
    }
  }

  switch (placement) {
    case 'center':
      return { start: fittedRect, end: rightPeek };
    case 'left-adjacent':
      return { start: leftPeek, end: fittedRect };
    case 'right-adjacent':
      return { start: rightPeek, end: farRight };
    case 'far-left':
      return { start: farLeft, end: leftPeek };
    default:
      return { start: fittedRect, end: fittedRect };
  }
}

function getSlideTransform(
  fittedRect: AnimRect,
  placement: SlidePlacement,
  direction: -1 | 1,
  bounds: LightboxBounds,
): { x: number; y: number } {
  const { start, end } = getSlideRects(fittedRect, placement, direction, bounds);
  return {
    x: end.left - start.left,
    y: end.top - start.top,
  };
}

function getSideOpenTransform(
  fittedRect: AnimRect,
  side: 'left' | 'right',
  bounds: LightboxBounds,
): { x: number; y: number } {
  const peekRect = positionPeekRect(fittedRect, side, bounds);
  const farRect = getFarPeekRect(fittedRect, side, bounds);
  return {
    x: farRect.left - peekRect.left,
    y: farRect.top - peekRect.top,
  };
}

function isVideoMedia(media: WaterfallMedia): boolean {
  if (media.type === 'video') return true;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(media.url);
}

function LightboxVideo({
  src,
  phase,
  onMediaElement,
  wrapperStyle,
  videoStyle,
  onLoadedMetadata,
  onTransitionEnd,
}: {
  src: string;
  phase: 'opening' | 'open' | 'closing';
  onMediaElement?: (element: HTMLVideoElement | null) => void;
  wrapperStyle: React.CSSProperties;
  videoStyle: React.CSSProperties;
  onLoadedMetadata?: () => void;
  onTransitionEnd: (e: React.TransitionEvent<HTMLElement>) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    onMediaElement?.(video ?? null);

    return () => {
      video?.pause();
      onMediaElement?.(null);
    };
  }, [src, onMediaElement]);

  return (
    <div style={wrapperStyle} onTransitionEnd={onTransitionEnd}>
      <video
        key={src}
        ref={videoRef}
        src={src}
        controls={phase === 'open'}
        playsInline
        preload='auto'
        onLoadedMetadata={onLoadedMetadata}
        onClick={(e) => e.stopPropagation()}
        style={videoStyle}
      />
    </div>
  );
}

function LightboxSideMedia({
  media,
  style,
  onTransitionEnd,
  onMeasure,
}: {
  media: WaterfallMedia;
  style: React.CSSProperties;
  onTransitionEnd?: (e: React.TransitionEvent<HTMLElement>) => void;
  onMeasure?: (url: string, width: number, height: number) => void;
}) {
  if (isVideoMedia(media)) {
    return (
      <video
        src={media.url}
        muted
        playsInline
        preload='auto'
        style={style}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            onMeasure?.(media.url, video.videoWidth, video.videoHeight);
          }
        }}
        onTransitionEnd={onTransitionEnd}
      />
    );
  }

  return (
    <img
      src={media.url}
      alt={media.name}
      style={style}
      onLoad={(e) => {
        const image = e.currentTarget;
        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
          onMeasure?.(media.url, image.naturalWidth, image.naturalHeight);
        }
      }}
      onTransitionEnd={onTransitionEnd}
    />
  );
}

export function Lightbox({
  prefix: P,
  items,
  index,
  entry,
  settings,
  isEditor,
  isEditMode,
  isPreviewMode,
  canNavigate,
  lightboxEntries,
  entryIdx,
  layoutId,
  sourceRect,
  resolveCloseSourceRect,
  onClose,
  onPrev,
  onNext,
}: {
  prefix: string;
  items: WaterfallMedia[];
  index: number;
  entry: HiveLightboxTextEntry;
  settings: HiveLightboxTitleSettings;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  canNavigate: boolean;
  lightboxEntries: LightboxEntryData[];
  entryIdx: number;
  layoutId?: string;
  sourceRect?: AnimRect | null;
  resolveCloseSourceRect?: () => AnimRect | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const centerMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const mediaDimensionsCacheRef = useRef<Map<string, MediaDimensions>>(new Map());
  const [mediaDimensionsVersion, setMediaDimensionsVersion] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeOffsetRef = useRef(0);
  const swipeDeltaXRef = useRef(0);
  const swipeAxisRef = useRef<SwipeAxis>('none');
  const isSwipingRef = useRef(false);
  const touchInteractionRef = useRef(false);
  const navSwipeAnimatingRef = useRef(false);
  const navSwipeCommitTimerRef = useRef<number | null>(null);
  const slideCommitDirectionRef = useRef<-1 | 1 | null>(null);
  const rapidNavDirectionRef = useRef<-1 | 1 | null>(null);
  const startSlideNavigationRef = useRef<(direction: -1 | 1) => void>(() => {});
  const heldArrowDirectionRef = useRef<-1 | 1 | null>(null);
  const arrowHoldIntervalRef = useRef<number | null>(null);
  const arrowHoldAccelerateTimerRef = useRef<number | null>(null);
  const arrowHoldFastRef = useRef(false);
  const [finalRect, setFinalRect] = useState<AnimRect | null>(null);
  const [containerBounds, setContainerBounds] = useState<LightboxBounds>(DEFAULT_LIGHTBOX_BOUNDS);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [navSwipeOffset, setNavSwipeOffset] = useState(0);
  const [navSwipeAnimating, setNavSwipeAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<-1 | 1 | null>(null);
  const [pendingEntryIdx, setPendingEntryIdx] = useState<number | null>(null);
  const [pendingImageIdx, setPendingImageIdx] = useState<number | null>(null);
  const [zoomTransitionActive, setZoomTransitionActive] = useState(false);
  const [closeSourceRect, setCloseSourceRect] = useState<AnimRect | null>(null);
  const [sidePeekAnimating, setSidePeekAnimating] = useState(false);
  const sidePeekOpenDoneRef = useRef(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDismiss, setSwipeDismiss] = useState(false);
  const prevIndexRef = useRef(index);
  const prevItemUrlRef = useRef<string | undefined>(undefined);
  const currentItem = items[index];
  const isCurrentVideo = currentItem ? isVideoMedia(currentItem) : false;
  const isHorizontalNavActive = navSwipeOffset !== 0 || navSwipeAnimating;
  const allowSwipeDismiss = !isEditMode && (!isEditor || Boolean(isPreviewMode));
  const allowNavigation = canNavigate && !isEditMode;
  const isEntryNavigation = lightboxEntries.length > 1;

  const getAdjacentImage = useCallback((imageIdx: number, direction: -1 | 1): WaterfallMedia | null => {
    if (items.length <= 1) return null;
    return items[(imageIdx + direction + items.length) % items.length] ?? null;
  }, [items]);

  const prevMedia = isEntryNavigation
    ? getAdjacentEntryMedia(lightboxEntries, entryIdx, -1)
    : getAdjacentImage(index, -1);
  const nextMedia = isEntryNavigation
    ? getAdjacentEntryMedia(lightboxEntries, entryIdx, 1)
    : getAdjacentImage(index, 1);

  const farPrevCandidate = slideDirection === -1 && isHorizontalNavActive
    ? isEntryNavigation && pendingEntryIdx !== null
      ? getAdjacentEntryMedia(lightboxEntries, pendingEntryIdx, -1)
      : pendingImageIdx !== null
        ? getAdjacentImage(pendingImageIdx, -1)
        : null
    : null;
  const farNextCandidate = slideDirection === 1 && isHorizontalNavActive
    ? isEntryNavigation && pendingEntryIdx !== null
      ? getAdjacentEntryMedia(lightboxEntries, pendingEntryIdx, 1)
      : pendingImageIdx !== null
        ? getAdjacentImage(pendingImageIdx, 1)
        : null
    : null;
  const farPrevMedia = farPrevCandidate && farPrevCandidate.url !== prevMedia?.url
    ? farPrevCandidate
    : null;
  const farNextMedia = farNextCandidate && farNextCandidate.url !== nextMedia?.url
    ? farNextCandidate
    : null;

  const idleFarPrevMedia = prevMedia && allowNavigation
    ? (() => {
      const candidate = isEntryNavigation
        ? getFarAdjacentEntryMedia(lightboxEntries, entryIdx, -1)
        : items.length > 2
          ? getAdjacentImage((index - 1 + items.length) % items.length, -1)
          : null;
      return candidate && candidate.url !== prevMedia.url ? candidate : null;
    })()
    : null;
  const idleFarNextMedia = nextMedia && allowNavigation
    ? (() => {
      const candidate = isEntryNavigation
        ? getFarAdjacentEntryMedia(lightboxEntries, entryIdx, 1)
        : items.length > 2
          ? getAdjacentImage((index + 1) % items.length, 1)
          : null;
      return candidate && candidate.url !== nextMedia.url ? candidate : null;
    })()
    : null;
  const renderFarPrevMedia = farPrevMedia ?? idleFarPrevMedia;
  const renderFarNextMedia = farNextMedia ?? idleFarNextMedia;

  const rememberMediaDimensions = useCallback((url: string, width: number, height: number) => {
    if (!url || !width || !height) return;

    const cache = mediaDimensionsCacheRef.current;
    const existing = cache.get(url);
    if (existing?.width === width && existing?.height === height) return;

    cache.set(url, { width, height });
    setMediaDimensionsVersion((value) => value + 1);
  }, []);

  const getFittedRectForMedia = useCallback((media: WaterfallMedia | null | undefined): AnimRect | null => {
    if (!media?.url) return null;
    const dimensions = mediaDimensionsCacheRef.current.get(media.url);
    return getMediaFittedRect(ghostRef.current, dimensions);
  }, [mediaDimensionsVersion, layoutVersion]);

  const syncFinalRectForCurrentItem = useCallback(() => {
    if (!currentItem) return;
    const rect = getFittedRectForMedia(currentItem);
    if (rect) {
      setFinalRect(rect);
      return;
    }

    const ghost = ghostRef.current;
    if (ghost) {
      setFinalRect(getGhostRect(ghost));
    }
  }, [currentItem, getFittedRectForMedia]);

  const beginSlideTo = useCallback((direction: -1 | 1) => {
    if (isEntryNavigation) {
      const len = lightboxEntries.length;
      setPendingEntryIdx((entryIdx + direction + len) % len);
      setPendingImageIdx(null);
      return;
    }

    if (items.length > 1) {
      setPendingImageIdx((index + direction + items.length) % items.length);
      setPendingEntryIdx(null);
    }
  }, [isEntryNavigation, lightboxEntries.length, entryIdx, items.length, index]);

  const setNavSwipeAnimatingState = useCallback((value: boolean) => {
    navSwipeAnimatingRef.current = value;
    setNavSwipeAnimating(value);
  }, []);

  const clearNavSwipeCommitTimer = useCallback(() => {
    if (navSwipeCommitTimerRef.current !== null) {
      window.clearTimeout(navSwipeCommitTimerRef.current);
      navSwipeCommitTimerRef.current = null;
    }
  }, []);

  const scheduleNavSwipeSnapBackEnd = useCallback(() => {
    clearNavSwipeCommitTimer();
    navSwipeCommitTimerRef.current = window.setTimeout(() => {
      clearNavSwipeCommitTimer();
      setNavSwipeAnimatingState(false);
    }, SLIDE_ANIM_MS + 32);
  }, [clearNavSwipeCommitTimer, setNavSwipeAnimatingState]);

  const updateContainerBounds = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setContainerBounds({
        left: 0,
        top: 0,
        width: typeof window !== 'undefined' ? window.innerWidth : DEFAULT_LIGHTBOX_BOUNDS.width,
        height: typeof window !== 'undefined' ? window.innerHeight : DEFAULT_LIGHTBOX_BOUNDS.height,
      });
      return;
    }

    const rect = container.getBoundingClientRect();
    setContainerBounds({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const getHorizontalNavTransform = useCallback((
    media: WaterfallMedia,
    placement: SlidePlacement,
  ): string | undefined => {
    if (!isHorizontalNavActive) return undefined;

    if (isSwiping && !navSwipeAnimating) {
      return `translate(${navSwipeOffset}px, 0px)`;
    }

    if (navSwipeAnimating && slideDirection !== null) {
      const fittedRect = getFittedRectForMedia(media);
      if (!fittedRect) return undefined;

      const { x, y } = getSlideTransform(fittedRect, placement, slideDirection, containerBounds);
      return `translate(${x}px, ${y}px)`;
    }

    if (navSwipeAnimating) {
      return 'translate(0px, 0px)';
    }

    return undefined;
  }, [
    isHorizontalNavActive,
    isSwiping,
    navSwipeAnimating,
    navSwipeOffset,
    slideDirection,
    containerBounds,
    getFittedRectForMedia,
  ]);

  const commitSlideNavigation = useCallback(() => {
    const direction = slideCommitDirectionRef.current;
    slideCommitDirectionRef.current = null;
    clearNavSwipeCommitTimer();
    setNavSwipeAnimatingState(false);
    setSlideDirection(null);
    setPendingEntryIdx(null);
    setPendingImageIdx(null);
    setNavSwipeOffset(0);
    setIsSwiping(false);
    isSwipingRef.current = false;
    swipeDeltaXRef.current = 0;
    swipeAxisRef.current = 'none';

    if (direction === -1) onPrev();
    else if (direction === 1) onNext();
  }, [clearNavSwipeCommitTimer, setNavSwipeAnimatingState, onPrev, onNext]);

  const scheduleSlideCommit = useCallback(() => {
    clearNavSwipeCommitTimer();
    navSwipeCommitTimerRef.current = window.setTimeout(() => {
      if (slideCommitDirectionRef.current === null) return;
      commitSlideNavigation();
    }, SLIDE_ANIM_MS + 32);
  }, [clearNavSwipeCommitTimer, commitSlideNavigation]);

  const cancelNavSwipeAnimation = useCallback(() => {
    clearNavSwipeCommitTimer();
    slideCommitDirectionRef.current = null;
    setNavSwipeAnimatingState(false);
    setSlideDirection(null);
    setPendingEntryIdx(null);
    setPendingImageIdx(null);
    setNavSwipeOffset(0);
    setIsSwiping(false);
    isSwipingRef.current = false;
    swipeDeltaXRef.current = 0;
    swipeAxisRef.current = 'none';
  }, [clearNavSwipeCommitTimer, setNavSwipeAnimatingState]);

  const startSlideNavigation = useCallback((direction: -1 | 1) => {
    if (!allowNavigation || !finalRect) return;

    if (navSwipeAnimatingRef.current) {
      if (slideCommitDirectionRef.current === direction) {
        rapidNavDirectionRef.current = direction;
        commitSlideNavigation();
        return;
      }

      cancelNavSwipeAnimation();
    }

    clearNavSwipeCommitTimer();
    beginSlideTo(direction);
    slideCommitDirectionRef.current = direction;
    setSlideDirection(direction);
    setNavSwipeAnimatingState(true);
    scheduleSlideCommit();
  }, [
    allowNavigation,
    finalRect,
    commitSlideNavigation,
    cancelNavSwipeAnimation,
    clearNavSwipeCommitTimer,
    beginSlideTo,
    setNavSwipeAnimatingState,
    scheduleSlideCommit,
  ]);

  startSlideNavigationRef.current = startSlideNavigation;

  const clearArrowHoldNavigation = useCallback(() => {
    heldArrowDirectionRef.current = null;
    arrowHoldFastRef.current = false;

    if (arrowHoldIntervalRef.current !== null) {
      window.clearInterval(arrowHoldIntervalRef.current);
      arrowHoldIntervalRef.current = null;
    }

    if (arrowHoldAccelerateTimerRef.current !== null) {
      window.clearTimeout(arrowHoldAccelerateTimerRef.current);
      arrowHoldAccelerateTimerRef.current = null;
    }
  }, []);

  const restartArrowHoldInterval = useCallback((direction: -1 | 1) => {
    if (arrowHoldIntervalRef.current !== null) {
      window.clearInterval(arrowHoldIntervalRef.current);
    }

    const intervalMs = arrowHoldFastRef.current
      ? ARROW_HOLD_FAST_INTERVAL_MS
      : ARROW_HOLD_NORMAL_INTERVAL_MS;

    arrowHoldIntervalRef.current = window.setInterval(() => {
      startSlideNavigationRef.current(direction);
    }, intervalMs);
  }, []);

  const startArrowHoldNavigation = useCallback((direction: -1 | 1) => {
    if (heldArrowDirectionRef.current === direction) return;

    clearArrowHoldNavigation();
    heldArrowDirectionRef.current = direction;
    arrowHoldFastRef.current = false;

    startSlideNavigationRef.current(direction);
    restartArrowHoldInterval(direction);

    arrowHoldAccelerateTimerRef.current = window.setTimeout(() => {
      arrowHoldAccelerateTimerRef.current = null;
      if (heldArrowDirectionRef.current !== direction) return;

      arrowHoldFastRef.current = true;
      restartArrowHoldInterval(direction);
    }, ARROW_HOLD_ACCELERATE_MS);
  }, [clearArrowHoldNavigation, restartArrowHoldInterval]);

  const computeFinalRect = useCallback(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;

    const url = currentItem?.url;
    const cached = url ? mediaDimensionsCacheRef.current.get(url) : undefined;
    if (cached?.width && cached?.height) {
      setFinalRect(fitMediaRectInGhost(ghost, cached.width, cached.height));
      return;
    }

    const media = centerMediaRef.current;
    if (media && url && (media.src === url || media.currentSrc === url)) {
      const { width, height } = getLightboxMediaDimensions(media);
      if (width && height) {
        rememberMediaDimensions(url, width, height);
        setFinalRect(fitMediaRectInGhost(ghost, width, height));
        return;
      }
    }

    const ghostRect = getGhostRect(ghost);
    if (!ghostRect.width || !ghostRect.height) return;
    setFinalRect(ghostRect);
  }, [currentItem?.url, rememberMediaDimensions]);

  const setCenterMediaElement = useCallback((element: HTMLImageElement | HTMLVideoElement | null) => {
    centerMediaRef.current = element;
    if (!element) return;

    if (element instanceof HTMLVideoElement) {
      if (element.readyState >= 1 && element.videoWidth > 0) {
        computeFinalRect();
      }
      return;
    }

    if (element.complete && element.naturalWidth > 0) {
      computeFinalRect();
    }
  }, [computeFinalRect]);

  const handleLayoutChange = useCallback(() => {
    updateContainerBounds();
    computeFinalRect();
    setLayoutVersion((value) => value + 1);
  }, [updateContainerBounds, computeFinalRect]);

  useEffect(() => {
    handleLayoutChange();
    const ghost = ghostRef.current;
    const container = containerRef.current;
    const ro = new ResizeObserver(() => handleLayoutChange());
    if (ghost) ro.observe(ghost);
    if (container) ro.observe(container);
    window.addEventListener('resize', handleLayoutChange);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleLayoutChange);
    };
  }, [handleLayoutChange, index, layoutId]);

  useLayoutEffect(() => {
    if (!currentItem) return;
    const media = centerMediaRef.current;
    if (!media) return;

    if (media instanceof HTMLImageElement && media.complete && media.naturalWidth > 0) {
      computeFinalRect();
      return;
    }

    if (media instanceof HTMLVideoElement && media.readyState >= 1 && media.videoWidth > 0) {
      computeFinalRect();
    }
  }, [currentItem?.url, index, computeFinalRect]);

  useEffect(() => {
    syncFinalRectForCurrentItem();
  }, [syncFinalRectForCurrentItem, mediaDimensionsVersion]);

  useEffect(() => {
    const seen = new Set<string>();
    const mediaItems: WaterfallMedia[] = [];

    const addMedia = (media: WaterfallMedia | null | undefined) => {
      if (!media?.url || seen.has(media.url)) return;
      seen.add(media.url);
      mediaItems.push(media);
    };

    items.forEach(addMedia);
    lightboxEntries.forEach((entry) => entry.items.forEach(addMedia));

    mediaItems.forEach((media) => {
      if (mediaDimensionsCacheRef.current.has(media.url)) return;
      preloadMediaDimensions(media, rememberMediaDimensions);
    });
  }, [items, lightboxEntries, rememberMediaDimensions]);

  useEffect(() => {
    if (phase !== 'opening' || !finalRect) return;

    if (!sourceRect) {
      setPhase('open');
      return;
    }

    setZoomTransitionActive(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setZoomTransitionActive(true);
        setPhase('open');
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [phase, finalRect, sourceRect]);

  useEffect(() => {
    if (phase !== 'closing') return;
    const t = setTimeout(() => onClose(), LIGHTBOX_ANIM_MS);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  useEffect(() => {
    return () => {
      clearNavSwipeCommitTimer();
    };
  }, [clearNavSwipeCommitTimer]);

  useLayoutEffect(() => {
    if (prevIndexRef.current === index && prevItemUrlRef.current === currentItem?.url) return;

    clearNavSwipeCommitTimer();
    slideCommitDirectionRef.current = null;
    setSlideDirection(null);
    setPendingEntryIdx(null);
    setPendingImageIdx(null);
    setSwipeOffset(0);
    setNavSwipeOffset(0);
    setNavSwipeAnimatingState(false);
    setSwipeDismiss(false);
    setIsSwiping(false);
    swipeOffsetRef.current = 0;
    swipeDeltaXRef.current = 0;
    swipeAxisRef.current = 'none';
    isSwipingRef.current = false;
    touchStartRef.current = null;
    touchInteractionRef.current = false;

    centerMediaRef.current = null;
    syncFinalRectForCurrentItem();

    prevIndexRef.current = index;
    prevItemUrlRef.current = currentItem?.url;
  }, [index, currentItem?.url, setNavSwipeAnimatingState, clearNavSwipeCommitTimer, syncFinalRectForCurrentItem]);

  useLayoutEffect(() => {
    const rapidDirection = rapidNavDirectionRef.current;
    if (rapidDirection === null) return;

    rapidNavDirectionRef.current = null;
    requestAnimationFrame(() => {
      startSlideNavigationRef.current(rapidDirection);
    });
  }, [index, entryIdx, currentItem?.url]);

  useLayoutEffect(() => {
    if (phase === 'opening') {
      sidePeekOpenDoneRef.current = false;
      setSidePeekAnimating(false);
      return;
    }

    if (phase !== 'open' || sidePeekOpenDoneRef.current) return;
    if (!prevMedia && !nextMedia) {
      sidePeekOpenDoneRef.current = true;
      return;
    }

    setSidePeekAnimating(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSidePeekAnimating(true);
        sidePeekOpenDoneRef.current = true;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [phase, prevMedia?.url, nextMedia?.url]);

  useEffect(() => {
    if (phase !== 'open') return;

    const blockSwipeClick = () => {
      const blockClick = (clickEvent: Event) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        document.removeEventListener('click', blockClick, true);
      };
      document.addEventListener('click', blockClick, true);
    };

    const commitNavSwipe = (deltaX: number) => {
      const direction: -1 | 1 = deltaX < 0 ? 1 : -1;
      clearNavSwipeCommitTimer();
      beginSlideTo(direction);
      slideCommitDirectionRef.current = direction;
      setSlideDirection(direction);
      setNavSwipeAnimatingState(true);
      scheduleSlideCommit();
    };

    const startNavSwipeRelease = (deltaX: number) => {
      if (Math.abs(deltaX) > SWIPE_NAV_THRESHOLD && allowNavigation) {
        commitNavSwipe(deltaX);
        return;
      }

      slideCommitDirectionRef.current = null;
      setSlideDirection(null);
      setPendingEntryIdx(null);
      setPendingImageIdx(null);
      setNavSwipeAnimatingState(true);
      setNavSwipeOffset(0);
      scheduleNavSwipeSnapBackEnd();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || navSwipeAnimatingRef.current) return;
      const touch = e.touches[0];

      touchInteractionRef.current = true;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      swipeAxisRef.current = 'none';
      swipeDeltaXRef.current = 0;
      isSwipingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || e.touches.length !== 1 || navSwipeAnimatingRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (swipeAxisRef.current === 'none') {
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (!allowNavigation) return;
          swipeAxisRef.current = 'horizontal';
        } else if (deltaY > 0) {
          if (!allowSwipeDismiss) return;
          swipeAxisRef.current = 'vertical';
        } else {
          return;
        }
      }

      if (swipeAxisRef.current === 'horizontal') {
        isSwipingRef.current = true;
        setIsSwiping(true);
        swipeDeltaXRef.current = deltaX;
        setNavSwipeOffset(deltaX);
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
        startNavSwipeRelease(swipeDeltaXRef.current);
        blockSwipeClick();
      } else if (wasSwiping && axis === 'vertical') {
        const offset = swipeOffsetRef.current;

        if (allowSwipeDismiss && offset > SWIPE_CLOSE_THRESHOLD) {
          const dismissOffset = window.innerHeight;
          swipeOffsetRef.current = dismissOffset;
          setSwipeDismiss(true);
          setSwipeOffset(dismissOffset);
          setPhase('closing');
        } else {
          swipeOffsetRef.current = 0;
          setSwipeOffset(0);
        }

        blockSwipeClick();
      } else if (axis === 'horizontal' && Math.abs(swipeDeltaXRef.current) > 0) {
        startNavSwipeRelease(swipeDeltaXRef.current);
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
    };
  }, [phase, allowNavigation, setNavSwipeAnimatingState, scheduleNavSwipeSnapBackEnd, clearNavSwipeCommitTimer, allowSwipeDismiss, scheduleSlideCommit, beginSlideTo]);

  const startClosing = useCallback(() => {
    const rect = resolveCloseSourceRect?.() ?? sourceRect ?? null;
    if (rect && finalRect) {
      setCloseSourceRect(rect);
      setZoomTransitionActive(true);
    }
    setPhase('closing');
  }, [resolveCloseSourceRect, sourceRect, finalRect]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditor && isPreviewMode) return;
        if (phase === 'closing') return;
        clearArrowHoldNavigation();
        startClosing();
        return;
      }

      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (phase !== 'open') return;
      if (!allowNavigation) return;

      e.preventDefault();

      const direction: -1 | 1 = e.key === 'ArrowLeft' ? -1 : 1;
      if (e.repeat && heldArrowDirectionRef.current === direction) return;

      startArrowHoldNavigation(direction);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const direction: -1 | 1 = e.key === 'ArrowLeft' ? -1 : 1;
      if (heldArrowDirectionRef.current === direction) {
        clearArrowHoldNavigation();
      }
    };

    const onWindowBlur = () => {
      clearArrowHoldNavigation();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      clearArrowHoldNavigation();
    };
  }, [
    phase,
    isEditor,
    isPreviewMode,
    startClosing,
    allowNavigation,
    startArrowHoldNavigation,
    clearArrowHoldNavigation,
  ]);

  useEffect(() => {
    if (phase !== 'open') {
      clearArrowHoldNavigation();
    }
  }, [phase, clearArrowHoldNavigation]);

  const handleClose = () => {
    if (phase === 'closing' || isEditMode) return;
    startClosing();
  };

  const isOpen = phase === 'open';
  const isClosing = phase === 'closing';
  const swipeBackdropOpacity = swipeOffset > 0 ? Math.max(0, 1 - swipeOffset / 500) : 1;
  const swipeMediaOpacity = swipeOffset > 0 ? Math.max(0.35, 1 - swipeOffset / 500) : 1;

  const handleNavSwipeTransitionEnd = useCallback((e: React.TransitionEvent<HTMLElement>) => {
    if (e.propertyName !== 'transform' || !navSwipeAnimatingRef.current) return;

    if (slideCommitDirectionRef.current !== null) {
      commitSlideNavigation();
      return;
    }

    clearNavSwipeCommitTimer();
    setNavSwipeAnimatingState(false);
  }, [clearNavSwipeCommitTimer, setNavSwipeAnimatingState, commitSlideNavigation]);

  const zoomSourceRect = phase === 'closing'
    ? (closeSourceRect ?? sourceRect)
    : sourceRect;

  const zoomTransform = zoomSourceRect && finalRect && (phase === 'opening' || isClosing)
    ? getZoomTransform(zoomSourceRect, finalRect)
    : undefined;

  const mediaTransform = isHorizontalNavActive && currentItem
    ? getHorizontalNavTransform(currentItem, 'center')
    : swipeOffset > 0
      ? `translateY(${swipeOffset}px)`
      : zoomTransform;

  const containerMediaRect = finalRect ? toContainerRect(finalRect, containerBounds) : null;
  const useZoomAnimation = Boolean(zoomSourceRect && finalRect);
  const shouldAnimateZoom = useZoomAnimation && (
    phase === 'closing' || (phase === 'open' && zoomTransitionActive)
  );

  const mediaStyle: React.CSSProperties = {
    position: 'absolute',
    top: containerMediaRect?.top,
    left: containerMediaRect?.left,
    width: containerMediaRect?.width,
    height: containerMediaRect?.height,
    objectFit: 'contain',
    transformOrigin: 'top left',
    transform: mediaTransform,
    opacity: swipeOffset > 0
      ? swipeMediaOpacity
      : useZoomAnimation
        ? 1
        : phase === 'opening' || isClosing
          ? 0
          : 1,
    transition: (isSwiping && !navSwipeAnimating)
      ? 'none'
      : navSwipeAnimating
        ? `transform ${SLIDE_ANIM_MS}ms ${LIGHTBOX_EASING}`
        : swipeDismiss
          ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
          : shouldAnimateZoom
            ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
            : phase === 'opening' || isClosing
              ? `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
              : 'none',
    pointerEvents: isCurrentVideo && isOpen && !isHorizontalNavActive ? 'auto' : 'none',
    touchAction: isCurrentVideo && isOpen ? 'none' : undefined,
    zIndex: 1,
    overflow: isCurrentVideo ? 'hidden' : undefined,
  };

  const lightboxVideoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
    pointerEvents: isOpen && !isHorizontalNavActive ? 'auto' : 'none',
  };

  const getSideMediaStyle = (
    media: WaterfallMedia,
    side: 'left' | 'right',
    placement: 'adjacent' | 'far' = 'adjacent',
  ): React.CSSProperties => {
    const fittedRect = getFittedRectForMedia(media);
    if (!fittedRect) return { display: 'none' };

    const slidePlacement: SlidePlacement = placement === 'far'
      ? (side === 'left' ? 'far-left' : 'far-right')
      : (side === 'left' ? 'left-adjacent' : 'right-adjacent');
    const { start: sideRect } = slideDirection !== null
      ? getSlideRects(fittedRect, slidePlacement, slideDirection, containerBounds)
      : {
        start: placement === 'far'
          ? getFarPeekRect(fittedRect, side, containerBounds)
          : positionPeekRect(fittedRect, side, containerBounds),
      };
    const containerSideRect = toContainerRect(sideRect, containerBounds);
    const swipeTransform = getHorizontalNavTransform(media, slidePlacement);
    const openSlideOffset = !isHorizontalNavActive && placement === 'adjacent' && isOpen && !sidePeekAnimating
      ? getSideOpenTransform(fittedRect, side, containerBounds)
      : null;
    const isFarSlideActive = placement === 'far'
      && isHorizontalNavActive
      && slideDirection === (side === 'left' ? -1 : 1);
    const useSlideTransition = (isSwiping && !navSwipeAnimating)
      ? false
      : navSwipeAnimating;
    const useSideOpenTransition = placement === 'adjacent' && isOpen && sidePeekAnimating && !isHorizontalNavActive;

    return {
      position: 'absolute',
      top: containerSideRect.top,
      left: containerSideRect.left,
      width: containerSideRect.width,
      height: containerSideRect.height,
      objectFit: 'contain',
      transform: swipeTransform ?? (
        openSlideOffset
          ? `translate(${openSlideOffset.x}px, ${openSlideOffset.y}px)`
          : undefined
      ),
      opacity: placement === 'far'
        ? (isOpen && isFarSlideActive ? 1 : 0)
        : (isOpen ? 1 : 0),
      transition: useSlideTransition
        ? placement === 'far'
          ? `transform ${SLIDE_ANIM_MS}ms ${LIGHTBOX_EASING}`
          : `transform ${SLIDE_ANIM_MS}ms ${LIGHTBOX_EASING}, opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
        : useSideOpenTransition
          ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
          : phase === 'opening' || isClosing
            ? `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
            : 'none',
      pointerEvents: 'none',
      zIndex: 1,
    };
  };

  const getPeekHitRectForMedia = (media: WaterfallMedia, side: 'left' | 'right'): AnimRect | null => {
    const fittedRect = getFittedRectForMedia(media);
    if (!fittedRect) return null;
    return getSidePeekHitRect(positionPeekRect(fittedRect, side, containerBounds), side, containerBounds);
  };

  const handleSidePeekClick = (direction: -1 | 1) => (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    if (touchInteractionRef.current) {
      touchInteractionRef.current = false;
      return;
    }
    e.stopPropagation();
    startSlideNavigation(direction);
  };

  const leftPeekHitRect = prevMedia
    ? getPeekHitRectForMedia(prevMedia, 'left')
    : null;
  const rightPeekHitRect = nextMedia
    ? getPeekHitRectForMedia(nextMedia, 'right')
    : null;
  const containerLeftPeekHitRect = leftPeekHitRect
    ? toContainerRect(leftPeekHitRect, containerBounds)
    : null;
  const containerRightPeekHitRect = rightPeekHitRect
    ? toContainerRect(rightPeekHitRect, containerBounds)
    : null;

  return (
    <div
      ref={containerRef}
      className={[
        `${P}-lightbox`,
        isEditor ? `${P}-lightbox-editor` : '',
        isEditMode ? `${P}-lightbox-edit-mode` : '',
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
          background: settings.backgroundColor ?? '#FFFFFF',
          opacity: isOpen ? swipeBackdropOpacity : 0,
          transition: isSwiping ? 'none' : `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
          pointerEvents: 'none',
        }}
      />
      <div className={`${P}-lightbox-dismiss-area`}>
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
          <div style={{ height: '10%' }} />
          <div
            style={{
              width: '70%',
              height: '80%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div ref={ghostRef} style={{ width: '100%', height: '100%' }} />
          </div>
          <div style={{ height: '10%' }} />
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isOpen ? 1 : 0,
            transition: isSwiping ? 'none' : `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
            pointerEvents: 'none',
          }}
        >
          <HiveLightboxTitles
            prefix={P}
            entry={entry}
            settings={settings}
            isEditor={isEditor}
            isEditMode={isEditMode}
            isPreviewMode={isPreviewMode}
            onClose={handleClose}
          />
        </div>
      </div>

      {isOpen && renderFarPrevMedia && (
        <LightboxSideMedia
          key={`far-prev-${renderFarPrevMedia.url}`}
          media={renderFarPrevMedia}
          style={getSideMediaStyle(renderFarPrevMedia, 'left', 'far')}
          onMeasure={rememberMediaDimensions}
          onTransitionEnd={handleNavSwipeTransitionEnd}
        />
      )}

      {isOpen && prevMedia && (
        <>
          <LightboxSideMedia
            key={`prev-${prevMedia.url}`}
            media={prevMedia}
            style={getSideMediaStyle(prevMedia, 'left')}
            onMeasure={rememberMediaDimensions}
            onTransitionEnd={handleNavSwipeTransitionEnd}
          />
          {containerLeftPeekHitRect && (
            <div
              style={{
                position: 'absolute',
                top: containerLeftPeekHitRect.top,
                left: containerLeftPeekHitRect.left,
                width: containerLeftPeekHitRect.width,
                height: containerLeftPeekHitRect.height,
                cursor: isEditMode || isSwiping ? 'default' : 'pointer',
                pointerEvents: isEditMode || isSwiping ? 'none' : 'auto',
                zIndex: 3,
              }}
              onClick={handleSidePeekClick(-1)}
            />
          )}
        </>
      )}

      {isOpen && nextMedia && (
        <>
          <LightboxSideMedia
            key={`next-${nextMedia.url}`}
            media={nextMedia}
            style={getSideMediaStyle(nextMedia, 'right')}
            onMeasure={rememberMediaDimensions}
            onTransitionEnd={handleNavSwipeTransitionEnd}
          />
          {containerRightPeekHitRect && (
            <div
              style={{
                position: 'absolute',
                top: containerRightPeekHitRect.top,
                left: containerRightPeekHitRect.left,
                width: containerRightPeekHitRect.width,
                height: containerRightPeekHitRect.height,
                cursor: isEditMode || isSwiping ? 'default' : 'pointer',
                pointerEvents: isEditMode || isSwiping ? 'none' : 'auto',
                zIndex: 3,
              }}
              onClick={handleSidePeekClick(1)}
            />
          )}
        </>
      )}

      {isOpen && renderFarNextMedia && (
        <LightboxSideMedia
          key={`far-next-${renderFarNextMedia.url}`}
          media={renderFarNextMedia}
          style={getSideMediaStyle(renderFarNextMedia, 'right', 'far')}
          onMeasure={rememberMediaDimensions}
          onTransitionEnd={handleNavSwipeTransitionEnd}
        />
      )}

      {finalRect && currentItem && (
        isCurrentVideo ? (
          <LightboxVideo
            key={`${index}-${currentItem.url}`}
            src={currentItem.url}
            phase={phase}
            onMediaElement={setCenterMediaElement}
            wrapperStyle={mediaStyle}
            videoStyle={lightboxVideoStyle}
            onLoadedMetadata={computeFinalRect}
            onTransitionEnd={handleNavSwipeTransitionEnd}
          />
        ) : (
          <img
            key={`${index}-${currentItem.url}`}
            ref={setCenterMediaElement}
            src={currentItem.url}
            alt={currentItem.name}
            onLoad={computeFinalRect}
            onTransitionEnd={handleNavSwipeTransitionEnd}
            style={mediaStyle}
          />
        )
      )}
    </div>
  );
}
