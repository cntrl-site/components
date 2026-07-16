import { CommonComponentProps } from '../props';
import { scalingValue, useScopedStyles } from '../utils/index';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  HiveLightboxTitles,
  type HiveLightboxTextEntry,
  type HiveLightboxTitleSettings,
} from './HiveLightboxTitles';

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
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
.${P}-item-image-link {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
.${P}-image-align-top .${P}-item-image-wrapper {
  align-items: flex-start;
}
.${P}-image-align-center .${P}-item-image-wrapper {
  align-items: center;
}
.${P}-image-align-bottom .${P}-item-image-wrapper {
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
.${P}-align-entries .${P}-item-title-row,
.${P}-align-entries .${P}-item-subtitle-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100%;
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
.${P}-image-align-top.${P}-align-entries .${P}-item-image-wrapper {
  align-items: flex-start;
}
.${P}-image-align-center.${P}-align-entries .${P}-item-image-wrapper {
  align-items: center;
}
.${P}-image-align-bottom.${P}-align-entries .${P}-item-image-wrapper {
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

type GridLayoutConfig = {
  entryWidth: number;
  horizontalGap: number;
  wrapperWidth: number;
  columnsCount: number;
  lockedParam?: 'wrapperWidth' | 'entryWidth' | 'horizontalGap' | null;
};

type HiveSettings = {
  gridLayout: GridLayoutConfig;
  verticalGap: number;
  align?: 'top' | 'center' | 'bottom';
  imageDisplay: {
    display: 'fit' | 'cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
} & HiveLightboxTitleSettings;

type HiveMedia = {
  url: string;
  name?: string;
  objectFit?: 'cover' | 'contain';
  type?: 'image' | 'video';
};

type HiveMediaPair = {
  media: HiveMedia[];
};

type HiveContentItem = {
  title1?: string;
  title2?: string;
  title3?: string;
  gallery?: HiveMediaPair[];
};

type HiveProps = {
  settings: HiveSettings;
  content?: HiveContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  activeEvent?: string;
  layoutId?: string;
  portalId?: string;
} & CommonComponentProps;

const EMPTY_MEDIA: HiveMedia = { url: '', name: '', objectFit: 'cover' };

const LIGHTBOX_ANIM_MS = 500;
const LIGHTBOX_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SWIPE_CLOSE_THRESHOLD = 72;
const SWIPE_NAV_THRESHOLD = 50;

type AnimRect = { top: number; left: number; width: number; height: number };
type SwipeAxis = 'none' | 'horizontal' | 'vertical';

type DisplayItem = {
  displayMedia: HiveMedia;
  lightboxMedia: HiveMedia | null;
};

type LightboxEntryData = {
  gridIndex: number;
  items: HiveMedia[];
  entry: HiveLightboxTextEntry;
};

function buildLightboxEntries(content: HiveContentItem[]): LightboxEntryData[] {
  return content.reduce<LightboxEntryData[]>((acc, item, gridIndex) => {
    const gallery = normalizeGallery(item.gallery);
    const displayItems = getDisplayItems(gallery);
    const lightboxItems = displayItems
      .filter(entry => entry.lightboxMedia)
      .map(entry => entry.lightboxMedia!);
    if (lightboxItems.length === 0) return acc;

    acc.push({
      gridIndex,
      items: lightboxItems,
      entry: {
        title1: item.title1 ?? '',
        title2: item.title2 ?? '',
        title3: item.title3 ?? '',
      },
    });
    return acc;
  }, []);
}

function getAdjacentEntryMedia(
  entries: LightboxEntryData[],
  entryIdx: number,
  direction: -1 | 1,
): HiveMedia | null {
  if (entries.length <= 1) return null;
  const adjacentIdx = (entryIdx + direction + entries.length) % entries.length;
  return entries[adjacentIdx]?.items[0] ?? null;
}

const SIDE_PEEK_WIDTH_RATIO = 0.05;

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
  media: HiveMedia,
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

function collectAllHiveMedia(content: HiveContentItem[]): HiveMedia[] {
  const seen = new Set<string>();
  const result: HiveMedia[] = [];

  for (const item of content) {
    const gallery = normalizeGallery(item.gallery);
    const displayItems = getDisplayItems(gallery);
    for (const entry of displayItems) {
      for (const media of [entry.displayMedia, entry.lightboxMedia]) {
        if (media?.url && !seen.has(media.url)) {
          seen.add(media.url);
          result.push(media);
        }
      }
    }
  }

  return result;
}

function PreloadedMediaPool({ mediaList }: { mediaList: HiveMedia[] }) {
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

function isMediaPairGallery(gallery: unknown): gallery is HiveMediaPair[] {
  if (!Array.isArray(gallery) || gallery.length === 0) return false;
  const first = gallery[0];
  return first !== null && typeof first === 'object' && 'media' in first && Array.isArray(first.media);
}

function normalizeGallery(gallery: unknown): HiveMediaPair[] | undefined {
  if (!gallery) return undefined;
  if (isMediaPairGallery(gallery)) return gallery;
  if (!Array.isArray(gallery)) return undefined;

  const [gridImage, lightboxImage] = gallery as HiveMedia[];
  const grid = gridImage?.url ? gridImage : undefined;
  const lightbox = lightboxImage?.url ? lightboxImage : undefined;

  if (!grid && !lightbox) return undefined;

  return [{
    media: [
      lightbox ?? grid ?? EMPTY_MEDIA,
      grid ?? lightbox ?? EMPTY_MEDIA,
    ],
  }];
}

function getDisplayMediaForPair(pair: HiveMediaPair): HiveMedia | null {
  const [first, second] = pair.media;
  if (second?.url) return second;
  if (first?.url) return first;
  return null;
}

function getLightboxMediaForPair(pair: HiveMediaPair): HiveMedia | null {
  const [first] = pair.media;
  if (first?.url) return first;
  return null;
}

function getDisplayItems(gallery: HiveMedia[] | HiveMediaPair[] | undefined): DisplayItem[] {
  if (!Array.isArray(gallery) || gallery.length === 0) return [];

  if (isMediaPairGallery(gallery)) {
    const result: DisplayItem[] = [];
    for (const pair of gallery) {
      const displayMedia = getDisplayMediaForPair(pair);
      if (!displayMedia) continue;

      const lightboxMedia = getLightboxMediaForPair(pair);
      result.push({
        displayMedia,
        lightboxMedia: lightboxMedia?.url ? lightboxMedia : null,
      });
    }
    return result;
  }

  return (gallery as HiveMedia[])
    .filter(media => media?.url)
    .map(media => ({
      displayMedia: media,
      lightboxMedia: media,
    }));
}

function isVideoMedia(media: HiveMedia): boolean {
  if (media.type === 'video') return true;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(media.url);
}

function pauseVideoElement(video: HTMLVideoElement) {
  video.pause();
}

function MediaItem({
  media,
  className,
  style,
  onMediaClick,
}: {
  media: HiveMedia;
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
        preload='auto'
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
      if (video) pauseVideoElement(video);
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
  media: HiveMedia;
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

function Lightbox({
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
  onClose,
  onPrev,
  onNext,
}: {
  prefix: string;
  items: HiveMedia[];
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
  const [farMediaAnimating, setFarMediaAnimating] = useState(false);
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

  const getAdjacentImage = useCallback((imageIdx: number, direction: -1 | 1): HiveMedia | null => {
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

  const rememberMediaDimensions = useCallback((url: string, width: number, height: number) => {
    if (!url || !width || !height) return;

    const cache = mediaDimensionsCacheRef.current;
    const existing = cache.get(url);
    if (existing?.width === width && existing?.height === height) return;

    cache.set(url, { width, height });
    setMediaDimensionsVersion((value) => value + 1);
  }, []);

  const getFittedRectForMedia = useCallback((media: HiveMedia | null | undefined): AnimRect | null => {
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
    }, LIGHTBOX_ANIM_MS + 32);
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
    media: HiveMedia,
    placement: SlidePlacement,
    options?: { farMediaReady?: boolean },
  ): string | undefined => {
    if (!isHorizontalNavActive) return undefined;

    if (isSwiping && !navSwipeAnimating) {
      return `translate(${navSwipeOffset}px, 0px)`;
    }

    if (navSwipeAnimating && slideDirection !== null) {
      if (placement === 'far-left' || placement === 'far-right') {
        if (!options?.farMediaReady) {
          return 'translate(0px, 0px)';
        }
      }

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
    setFarMediaAnimating(false);
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
    }, LIGHTBOX_ANIM_MS + 32);
  }, [clearNavSwipeCommitTimer, commitSlideNavigation]);

  const startSlideNavigation = useCallback((direction: -1 | 1) => {
    if (!allowNavigation || !finalRect || navSwipeAnimatingRef.current) return;

    clearNavSwipeCommitTimer();
    beginSlideTo(direction);
    slideCommitDirectionRef.current = direction;
    setSlideDirection(direction);
    setNavSwipeAnimatingState(true);
    scheduleSlideCommit();
  }, [
    allowNavigation,
    finalRect,
    clearNavSwipeCommitTimer,
    beginSlideTo,
    setNavSwipeAnimatingState,
    scheduleSlideCommit,
  ]);

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
    const mediaItems: HiveMedia[] = [];

    const addMedia = (media: HiveMedia | null | undefined) => {
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
    if (phase === 'opening' && finalRect) setPhase('open');
  }, [phase, finalRect]);

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
    setFarMediaAnimating(false);
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
    if (!(farPrevMedia || farNextMedia) || !isHorizontalNavActive) {
      setFarMediaAnimating(false);
      return;
    }

    setFarMediaAnimating(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFarMediaAnimating(true));
    });

    return () => cancelAnimationFrame(frame);
  }, [farPrevMedia?.url, farNextMedia?.url, isHorizontalNavActive]);

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
      setFarMediaAnimating(false);
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isEditor && isPreviewMode) return;
      if (phase === 'closing') return;
      setPhase('closing');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, isEditor, isPreviewMode]);

  const handleClose = () => {
    if (phase === 'closing' || isEditMode) return;
    setPhase('closing');
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

  const mediaTransform = isHorizontalNavActive && currentItem
    ? getHorizontalNavTransform(currentItem, 'center')
    : swipeOffset > 0
      ? `translateY(${swipeOffset}px)`
      : undefined;

  const containerMediaRect = finalRect ? toContainerRect(finalRect, containerBounds) : null;

  const mediaStyle: React.CSSProperties = {
    position: 'absolute',
    top: containerMediaRect?.top,
    left: containerMediaRect?.left,
    width: containerMediaRect?.width,
    height: containerMediaRect?.height,
    objectFit: 'contain',
    transform: mediaTransform,
    opacity: swipeOffset > 0
      ? swipeMediaOpacity
      : phase === 'opening' || isClosing
        ? 0
        : 1,
    transition: (isSwiping && !navSwipeAnimating)
      ? 'none'
      : navSwipeAnimating
        ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
        : swipeDismiss
          ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
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
    media: HiveMedia,
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
    const swipeTransform = getHorizontalNavTransform(media, slidePlacement, {
      farMediaReady: placement !== 'far' || farMediaAnimating,
    });
    const useSlideTransition = (isSwiping && !navSwipeAnimating)
      ? false
      : navSwipeAnimating || (placement === 'far' && farMediaAnimating);

    return {
      position: 'absolute',
      top: containerSideRect.top,
      left: containerSideRect.left,
      width: containerSideRect.width,
      height: containerSideRect.height,
      objectFit: 'contain',
      transform: swipeTransform,
      opacity: placement === 'far'
        ? (farMediaAnimating && isOpen ? 1 : 0)
        : (isOpen ? 1 : 0),
      transition: useSlideTransition
        ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
        : phase === 'opening' || isClosing
          ? `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
          : 'none',
      pointerEvents: 'none',
      zIndex: 1,
    };
  };

  const getPeekHitRectForMedia = (media: HiveMedia, side: 'left' | 'right'): AnimRect | null => {
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
          background: '#ffffff',
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

      {isOpen && farPrevMedia && (
        <LightboxSideMedia
          key={`far-prev-${farPrevMedia.url}`}
          media={farPrevMedia}
          style={getSideMediaStyle(farPrevMedia, 'left', 'far')}
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
                cursor: isHorizontalNavActive || isEditMode ? 'default' : 'pointer',
                pointerEvents: isHorizontalNavActive || isEditMode ? 'none' : 'auto',
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
                cursor: isHorizontalNavActive || isEditMode ? 'default' : 'pointer',
                pointerEvents: isHorizontalNavActive || isEditMode ? 'none' : 'auto',
                zIndex: 3,
              }}
              onClick={handleSidePeekClick(1)}
            />
          )}
        </>
      )}

      {isOpen && farNextMedia && (
        <LightboxSideMedia
          key={`far-next-${farNextMedia.url}`}
          media={farNextMedia}
          style={getSideMediaStyle(farNextMedia, 'right', 'far')}
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

export function Hive({
  settings,
  content,
  isEditor,
  isPreviewMode,
  isEditMode,
  layoutId,
  portalId,
}: HiveProps) {
  const { prefix: P } = useScopedStyles();
  const { gridLayout, verticalGap, align = 'top', imageDisplay } = settings;

  const isCover = imageDisplay?.display === 'cover';
  const ratioValue = imageDisplay?.ratioValue ?? '1:1';
  const ratioReversed = imageDisplay?.reversed ?? false;
  const [rW, rH] = ratioValue.split(':').map(Number);
  const effW = ratioReversed ? rH : rW;
  const effH = ratioReversed ? rW : rH;
  const aspectRatio = `${effW} / ${effH}`;

  const size = gridLayout.entryWidth ?? 0.2;
  const columnsCount = gridLayout.columnsCount;
  const entryWidthScaled = scalingValue(size, isEditor);
  const horizontalGapScaled = scalingValue(gridLayout.horizontalGap ?? 0, isEditor);
  const imageWrapperWidth = entryWidthScaled;
  const controlWidthStyle = entryWidthScaled;

  const imageWrapperStyle: React.CSSProperties = {
    width: imageWrapperWidth,
    ...(isCover
      ? { aspectRatio, height: 'auto', overflow: 'hidden' }
      : { height: 'auto' }),
  };

  const imageStyle: React.CSSProperties = isCover
    ? {
        objectFit: 'cover',
        pointerEvents: 'auto',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
      }
    : {
        objectFit: 'contain',
        pointerEvents: 'auto',
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
      };

  const containerRef = useRef<HTMLDivElement>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<HiveMedia[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxEntryIdx, setLightboxEntryIdx] = useState(0);
  const [lightboxEntry, setLightboxEntry] = useState<HiveLightboxTextEntry>({
    title1: '',
    title2: '',
    title3: '',
  });

  const lightboxPortalStyle = (() => {
    const style: Record<string, string> = {};
    const articleWidth = containerRef.current
      ? getComputedStyle(containerRef.current).getPropertyValue('--cntrl-article-width').trim()
      : '';
    if (articleWidth) {
      style['--cntrl-article-width'] = articleWidth;
    }
    return style as React.CSSProperties;
  })();

  const canOpenLightbox = !isEditor || isPreviewMode || isEditMode;
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const items = content ?? [];
  const itemsInLastRow = items.length % columnsCount || columnsCount;
  const isPartialLastRow = itemsInLastRow < columnsCount && items.length > 0;
  const lastRowStartIndex = items.length - itemsInLastRow;
  const lastRowStartColumn = isPartialLastRow
    ? Math.floor((columnsCount - itemsInLastRow) / 2) + 1
    : 1;
  const allLightboxEntries = useMemo(() => buildLightboxEntries(items), [items]);
  const allMedia = useMemo(() => collectAllHiveMedia(items), [items]);

  const openLightbox = (gridIndex: number, imageIdx: number) => {
    if (isEditor && !isEditMode && !isPreviewMode) return;
    const entryIdx = allLightboxEntries.findIndex(entry => entry.gridIndex === gridIndex);
    if (entryIdx < 0) return;

    const data = allLightboxEntries[entryIdx];
    setLightboxEntryIdx(entryIdx);
    setLightboxItems(data.items);
    setLightboxIndex(imageIdx);
    setLightboxEntry(data.entry);
    setLightboxOpen(true);
  };

  const navigateLightbox = useCallback((direction: -1 | 1) => {
    if (allLightboxEntries.length > 1) {
      const len = allLightboxEntries.length;
      const newEntryIdx = (lightboxEntryIdx + direction + len) % len;
      const newData = allLightboxEntries[newEntryIdx];
      const newImageIdx = Math.min(lightboxIndex, newData.items.length - 1);

      setLightboxEntryIdx(newEntryIdx);
      setLightboxItems(newData.items);
      setLightboxIndex(newImageIdx);
      setLightboxEntry(newData.entry);
      return;
    }

    setLightboxIndex((prev) => (prev + direction + lightboxItems.length) % lightboxItems.length);
  }, [allLightboxEntries, lightboxEntryIdx, lightboxIndex, lightboxItems.length]);

  const canNavigateLightbox = allLightboxEntries.length > 1 || lightboxItems.length > 1;

  useEffect(() => {
    if (!lightboxOpen) return;
    if (typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!isEditor || isEditMode || isPreviewMode) return;
    setLightboxOpen(false);
  }, [isEditor, isEditMode, isPreviewMode]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <PreloadedMediaPool mediaList={allMedia} />
      <div
        ref={containerRef}
        className={`${P}-wrapper ${P}-align-entries ${P}-image-align-${align}`.trim()}
        style={{
          gridTemplateColumns: `repeat(${columnsCount}, ${entryWidthScaled})`,
          rowGap: 0,
          columnGap: horizontalGapScaled,
          width: scalingValue(gridLayout.wrapperWidth ?? 0, isEditor),
          [`--${P}-align-entries-row-gap`]: scalingValue(verticalGap ?? 0, isEditor),
        }}
      >
        {items.map((item, index) => {
          const gallery = normalizeGallery(item.gallery);
          const displayItems = getDisplayItems(gallery);
          const lightboxItemsForEntry = displayItems
            .filter(entry => entry.lightboxMedia)
            .map(entry => entry.lightboxMedia!);
          const isLastRow = Math.floor(index / columnsCount)
            === Math.ceil(items.length / columnsCount) - 1;
          const gridColumn = isPartialLastRow && index >= lastRowStartIndex
            ? `${lastRowStartColumn + (index - lastRowStartIndex)}`
            : undefined;

          const imageContent = (
            <div className={`${P}-item-image-wrapper`} style={imageWrapperStyle}>
              {displayItems.length === 0
                ? null
                : (() => {
                    const { displayMedia, lightboxMedia } = displayItems[0];
                    const entryLightboxIndex = lightboxMedia
                      ? lightboxItemsForEntry.findIndex(media => media.url === lightboxMedia.url)
                      : -1;
                    return (
                      <MediaItem
                        media={displayMedia}
                        className={`${P}-item-${isVideoMedia(displayMedia) ? 'video' : 'image'}`.trim()}
                        style={imageStyle}
                        onMediaClick={canOpenLightbox && entryLightboxIndex >= 0
                          ? () => openLightbox(index, entryLightboxIndex)
                          : undefined}
                      />
                    );
                  })()}
            </div>
          );

          return (
            <div key={index} className={`${P}-item`}>
              <div
                className={[
                  isEditMode ? `${P}-item-inner` : `${P}-item-inner-hidden`,
                  isLastRow ? `${P}-item-inner-last-row` : '',
                ].filter(Boolean).join(' ')}
                style={{
                  width: entryWidthScaled,
                  ...(gridColumn ? { gridColumn } : {}),
                }}
              >
                <div className={`${P}-item-title-row`}>
                  <div style={{ height: 0, width: controlWidthStyle }} />
                </div>
                <a className={`${P}-item-image-link`}>
                  {imageContent}
                </a>
                <div className={`${P}-item-subtitle-row`}>
                  <div style={{ height: 0, width: controlWidthStyle }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {lightboxOpen && typeof document !== 'undefined' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <div style={lightboxPortalStyle} data-selection="none">
            <Lightbox
              prefix={P}
              items={lightboxItems}
              index={lightboxIndex}
              entry={lightboxEntry}
              settings={settings}
              isEditor={isEditor}
              isEditMode={isEditMode}
              isPreviewMode={isPreviewMode}
              canNavigate={canNavigateLightbox}
              lightboxEntries={allLightboxEntries}
              entryIdx={lightboxEntryIdx}
              layoutId={layoutId}
              onClose={() => setLightboxOpen(false)}
              onPrev={() => navigateLightbox(-1)}
              onNext={() => navigateLightbox(1)}
            />
          </div>,
          portalTarget,
        );
      })()}
    </>
  );
}
