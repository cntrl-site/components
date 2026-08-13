import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type React from 'react';
import { CommonComponentProps } from '../props';
import {
  buildColorVars,
  scalingValue,
  useScopedStyles,
} from '../utils/index';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';

const DEFAULT_IMG_WIDTH = 300 / 1440;
const DEFAULT_CORNER_RADIUS = 8 / 1440;
const PADDING_HANDLE_SIZE = 0.004;

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function getTextClassName(
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

function getTextLeadingVars(
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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: ${sv(48)};
}
.${P}-single-title-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
.${P}-single-title {
  pointer-events: none;
}
.${P}-item {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
.${P}-item-a {
  flex-direction: row;
}
.${P}-item-b {
  flex-direction: row-reverse;
}
.${P}-item-c {
  flex-direction: column;
}
.${P}-title {
  align-self: flex-start;
  display: flex;
  flex-shrink: 0;
  min-width: 0;
  box-sizing: border-box;
  position: sticky;
  z-index: 1;
  color: var(--${P}-title-color);
}
.${P}-title-text {
  display: block;
  width: fit-content;
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.${P}-title-position-left,
.${P}-title-position-center,
.${P}-title-position-right {
  top: calc(50vh - (var(--${P}-title-height, 0px) / 2));
}
.${P}-title-position-top {
  top: var(--${P}-title-top-padding, 0);
  bottom: auto;
  justify-content: flex-start;
}
.${P}-title-position-left {
  justify-content: flex-start;
}
.${P}-title-position-center {
  justify-content: center;
}
.${P}-title-position-right {
  justify-content: flex-end;
}
.${P}-item-a .${P}-title,
.${P}-item-b .${P}-title {
  flex: 1;
  width: auto;
}
.${P}-item-c .${P}-title {
  width: 100%;
  pointer-events: none;
}
.${P}-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
}
.${P}-item-c .${P}-gallery {
  display: grid;
  width: 100%;
}
.${P}-item-c .${P}-gallery-media {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 0;
}
.${P}-item-c .${P}-title-layer {
  grid-area: 1 / 1;
  align-self: stretch;
  width: 100%;
  min-width: 0;
  z-index: 1;
  pointer-events: none;
}
.${P}-gallery-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.${P}-gallery-image,
.${P}-gallery-video {
  display: block;
  max-width: 100%;
  height: auto;
}
.${P}-gallery-caption {
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}
.${P}-gallery-controls {
  position: relative;
  display: flex;
  flex-shrink: 0;
  box-sizing: border-box;
}
.${P}-gallery-edge-spacer {
  flex-shrink: 0;
}
.${P}-control-anchor {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}
.${P}-padding-handle {
  width: 100%;
  flex-shrink: 0;
  background: transparent;
}
.${P}-text-tight-leading {
  flex-shrink: 0;
  padding-top: var(--${P}-title-leading-gap, 0);
  padding-bottom: var(--${P}-title-leading-gap, 0);
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
`;
}

type MercuryMedia = {
  url: string;
  name?: string;
  type?: 'image' | 'video';
  objectFit?: 'cover' | 'contain';
};

type MercuryMediaPair = {
  media: MercuryMedia[];
};

type MercuryDisplayItem = {
  displayMedia: MercuryMedia;
  lightboxMedia: MercuryMedia | null;
};

export type MercuryContentItem = {
  title?: string;
  gallery?: MercuryMedia[] | MercuryMediaPair[];
};

export type MercurySettings = {
  wrapperWidth?: number;
  type?: 'a' | 'b' | 'c';
  imgWidth?: number;
  galleryPaddingRight?: number;
  galleryPaddingLeft?: number;
  galleryPaddingBetween?: number;
  cornerRadius?: number;
  imgCaption?: 'on' | 'off';
  position?: 'left' | 'center' | 'right' | 'top';
  titleTopPadding?: number;
  transition?: 'fade' | 'retype' | 'scroll';
  titleColor?: string;
  titleFontFamily?: string;
  titleFontSettings?: { fontWeight: number; fontStyle: string };
  titleFontSize?: number;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleWordSpacing?: number;
  titleAlign?: TextStyles['textAlign'];
  titleTextAppearance?: TextStyles['textAppearance'];
  lightbox?: 'on' | 'off';
  lightboxImageDisplay?: 'fit' | 'cover' | { display?: 'fit' | 'cover' };
  backgroundColor?: string;
  lightboxCounterColor?: string;
  lightboxCounterFontFamily?: string;
  lightboxCounterFontSettings?: { fontWeight: number; fontStyle: string };
  lightboxCounterFontSize?: number;
  lightboxCounterLineHeight?: number;
  lightboxCounterLetterSpacing?: number;
  lightboxCounterWordSpacing?: number;
  lightboxCounterTextAppearance?: TextStyles['textAppearance'];
};

type MercuryProps = {
  settings?: MercurySettings;
  content?: MercuryContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  layoutId?: string;
  portalId?: string;
} & CommonComponentProps;

type AnimRect = { top: number; left: number; width: number; height: number };

type LightboxProps = {
  prefix: string;
  items: MercuryMedia[];
  index: number;
  imageDisplay: 'fit' | 'cover';
  isEditor?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  counterClassName: string;
  counterStyle: React.CSSProperties;
  backgroundColor: string;
};

const DEFAULT_LIGHTBOX_BACKGROUND = 'rgba(28,31,34,0.9)';

const LIGHTBOX_ANIM_MS = 500;
const LIGHTBOX_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SWIPE_CLOSE_THRESHOLD = 72;
const SWIPE_NAV_THRESHOLD = 50;

type SwipeAxis = 'none' | 'horizontal' | 'vertical';

const COLOR_VAR_MAP = {
  titleColor: 'title-color',
  lightboxCounterColor: 'lightbox-counter-color',
} as const;

const STATE_KEYS = [] as const;

function isPairFormat(
  gallery: MercuryMedia[] | MercuryMediaPair[] | undefined,
): gallery is MercuryMediaPair[] {
  if (!Array.isArray(gallery) || gallery.length === 0) return false;
  const first = gallery[0];
  return first !== null && typeof first === 'object' && 'media' in first && Array.isArray(first.media);
}

function getDisplayMediaForPair(pair: MercuryMediaPair): MercuryMedia | null {
  const [first, second] = pair.media;
  if (second?.url) return second;
  if (first?.url) return first;
  return null;
}

function getLightboxMediaForPair(pair: MercuryMediaPair): MercuryMedia | null {
  const [first] = pair.media;
  if (first?.url) return first;
  return null;
}

function getMercuryDisplayItems(
  gallery: MercuryMedia[] | MercuryMediaPair[] | undefined,
): MercuryDisplayItem[] {
  if (!Array.isArray(gallery) || gallery.length === 0) return [];

  if (isPairFormat(gallery)) {
    const result: MercuryDisplayItem[] = [];
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

  return (gallery as MercuryMedia[])
    .filter((media) => media?.url)
    .map((media) => ({
      displayMedia: media,
      lightboxMedia: media,
    }));
}

function isVideoMedia(media: MercuryMedia): boolean {
  return media.type === 'video';
}

function unloadVideoElement(video: HTMLVideoElement) {
  video.pause();
  video.removeAttribute('src');
  video.load();
}

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

function resolveLightboxImageDisplay(
  value: MercurySettings['lightboxImageDisplay'],
): 'fit' | 'cover' {
  if (typeof value === 'string') {
    return value === 'cover' ? 'cover' : 'fit';
  }
  return value?.display === 'cover' ? 'cover' : 'fit';
}

function LightboxVideo({
  src,
  phase,
  mediaRef,
  mediaStyle,
  onLoadedMetadata,
  onClick,
  onMouseMove,
  onTransitionEnd,
}: {
  src: string;
  phase: 'opening' | 'open' | 'closing';
  mediaRef: React.RefObject<HTMLVideoElement>;
  mediaStyle: React.CSSProperties;
  onLoadedMetadata: () => void;
  onClick: (e: React.MouseEvent<HTMLVideoElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLVideoElement>) => void;
  onTransitionEnd: (e: React.TransitionEvent<HTMLVideoElement>) => void;
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
      preload="auto"
      onLoadedMetadata={onLoadedMetadata}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onTransitionEnd={onTransitionEnd}
      style={mediaStyle}
    />
  );
}

function Lightbox({
  prefix: P,
  items,
  index,
  imageDisplay,
  isEditor,
  onClose,
  onPrev,
  onNext,
  counterClassName,
  counterStyle,
  backgroundColor,
}: LightboxProps) {
  const isCover = imageDisplay === 'cover';
  const ghostRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeOffsetRef = useRef(0);
  const swipeDeltaXRef = useRef(0);
  const swipeAxisRef = useRef<SwipeAxis>('none');
  const isSwipingRef = useRef(false);
  const touchInteractionRef = useRef(false);
  const navSwipeAnimatingRef = useRef(false);
  const navSwipeCommitTimerRef = useRef<number | null>(null);
  const [finalRect, setFinalRect] = useState<AnimRect | null>(null);
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [navSwipeOffset, setNavSwipeOffset] = useState(0);
  const [navSwipeAnimating, setNavSwipeAnimating] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDismiss, setSwipeDismiss] = useState(false);
  const prevIndexRef = useRef(index);
  const currentItem = items[index];
  const isCurrentVideo = currentItem ? isVideoMedia(currentItem) : false;
  const isHorizontalNavActive = navSwipeOffset !== 0 || navSwipeAnimating;

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

  const computeFinalRect = useCallback(() => {
    const ghost = ghostRef.current;
    const media = mediaRef.current;
    if (!ghost) return;
    const cb = ghost.getBoundingClientRect();
    const cw = cb.width;
    const ch = cb.height;
    if (!cw || !ch) return;

    if (imageDisplay === 'cover') {
      setFinalRect({ width: cw, height: ch, left: cb.left, top: cb.top });
      return;
    }

    if (!media) {
      setFinalRect(getGhostRect(ghost));
      return;
    }

    const { width: nw, height: nh } = getLightboxMediaDimensions(media);
    if (!nw || !nh) {
      setFinalRect(getGhostRect(ghost));
      return;
    }

    const ir = nw / nh;
    const cr = cw / ch;
    if (ir > cr) {
      const dh = cw / ir;
      setFinalRect({ width: cw, height: dh, left: cb.left, top: cb.top + (ch - dh) / 2 });
    } else {
      const dw = ch * ir;
      setFinalRect({ width: dw, height: ch, left: cb.left + (cw - dw) / 2, top: cb.top });
    }
  }, [imageDisplay]);

  useEffect(() => {
    computeFinalRect();
    const c = ghostRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => computeFinalRect());
    ro.observe(c);
    return () => ro.disconnect();
  }, [computeFinalRect, index]);

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
    if (prevIndexRef.current === index) return;

    clearNavSwipeCommitTimer();
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

    const ghost = ghostRef.current;
    if (ghost) {
      setFinalRect(getGhostRect(ghost));
    }

    prevIndexRef.current = index;
  }, [index, setNavSwipeAnimatingState, clearNavSwipeCommitTimer]);

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

    const commitNavSwipe = (deltaX: number) => {
      clearNavSwipeCommitTimer();
      navSwipeAnimatingRef.current = false;
      setNavSwipeAnimating(false);
      setNavSwipeOffset(0);
      setIsSwiping(false);
      isSwipingRef.current = false;
      swipeDeltaXRef.current = 0;
      swipeAxisRef.current = 'none';

      const ghost = ghostRef.current;
      if (ghost) {
        setFinalRect(getGhostRect(ghost));
      }

      if (deltaX < 0) onNext();
      else onPrev();
    };

    const startNavSwipeRelease = (deltaX: number) => {
      if (Math.abs(deltaX) > SWIPE_NAV_THRESHOLD && items.length > 1) {
        commitNavSwipe(deltaX);
        return;
      }

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
      clearBlockSwipeClick();
    };
  }, [phase, items.length, onNext, onPrev, setNavSwipeAnimatingState, scheduleNavSwipeSnapBackEnd, clearNavSwipeCommitTimer]);

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

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.stopPropagation();
    if (touchInteractionRef.current) {
      touchInteractionRef.current = false;
      return;
    }
    if (items.length <= 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const controlsZoneHeight = Math.min(52, rect.height * 0.2);

    if (y > rect.height - controlsZoneHeight) {
      return;
    }

    if (e.clientX - rect.left < rect.width / 2) {
      onPrev();
      return;
    }

    onNext();
  };

  const handleVideoMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (items.length <= 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const controlsZoneHeight = Math.min(52, rect.height * 0.2);

    if (y > rect.height - controlsZoneHeight) {
      e.currentTarget.style.cursor = 'default';
      return;
    }

    e.currentTarget.style.cursor = x < rect.width / 2 ? 'w-resize' : 'e-resize';
  };

  const handleNavSwipeTransitionEnd = useCallback((e: React.TransitionEvent<HTMLElement>) => {
    if (e.propertyName !== 'transform' || !navSwipeAnimatingRef.current) return;

    clearNavSwipeCommitTimer();
    setNavSwipeAnimatingState(false);
  }, [clearNavSwipeCommitTimer, setNavSwipeAnimatingState]);

  const mediaTransform = isHorizontalNavActive
    ? `translateX(${navSwipeOffset}px)`
    : swipeOffset > 0
      ? `translateY(${swipeOffset}px)`
      : undefined;

  const mediaStyle: React.CSSProperties = {
    position: 'fixed',
    top: finalRect?.top,
    left: finalRect?.left,
    width: finalRect?.width,
    height: finalRect?.height,
    objectFit: imageDisplay === 'cover' ? 'cover' : 'contain',
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
    zIndex: 9998,
  };

  const navOverlayBaseStyle = finalRect ? {
    position: 'fixed' as const,
    top: finalRect.top,
    height: finalRect.height,
    width: finalRect.width / 2,
    zIndex: 9999,
  } : null;

  return (
    <div
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
          background: backgroundColor,
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
              {items.length > 1 && (
                <p className={counterClassName} style={counterStyle}>
                  {index + 1} / {items.length}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
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
              {items.length > 1 && (
                <p className={counterClassName} style={counterStyle}>
                  {index + 1} / {items.length}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {finalRect && currentItem && (
        isCurrentVideo ? (
          <LightboxVideo
            key={`${index}-${currentItem.url}`}
            src={currentItem.url}
            phase={phase}
            mediaRef={mediaRef as React.RefObject<HTMLVideoElement>}
            mediaStyle={mediaStyle}
            onLoadedMetadata={computeFinalRect}
            onClick={handleVideoClick}
            onMouseMove={handleVideoMouseMove}
            onTransitionEnd={handleNavSwipeTransitionEnd}
          />
        ) : (
          <img
            key={`${index}-${currentItem.url}`}
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={currentItem.url}
            alt={currentItem.name}
            onLoad={computeFinalRect}
            onTransitionEnd={handleNavSwipeTransitionEnd}
            style={mediaStyle}
          />
        )
      )}

      {isOpen && navOverlayBaseStyle && items.length > 1 && !isCurrentVideo && (
        <>
          <div
            style={{
              ...navOverlayBaseStyle,
              left: finalRect!.left,
              cursor: 'w-resize',
              pointerEvents: isHorizontalNavActive ? 'none' : 'auto',
            }}
            onClick={(e) => {
              if (touchInteractionRef.current) {
                touchInteractionRef.current = false;
                return;
              }
              e.stopPropagation();
              onPrev();
            }}
          />
          <div
            style={{
              ...navOverlayBaseStyle,
              left: finalRect!.left + finalRect!.width / 2,
              cursor: 'e-resize',
              pointerEvents: isHorizontalNavActive ? 'none' : 'auto',
            }}
            onClick={(e) => {
              if (touchInteractionRef.current) {
                touchInteractionRef.current = false;
                return;
              }
              e.stopPropagation();
              onNext();
            }}
          />
        </>
      )}
    </div>
  );
}

function GalleryMediaItem({
  P,
  media,
  imgWidth,
  cornerRadius,
  fillGalleryWidth,
  isEditor,
  galleryPaddingBetween = 0,
  showPaddingAfter = false,
  showControls = false,
  onMediaClick,
}: {
  P: string;
  media: MercuryMedia;
  imgWidth?: number;
  cornerRadius?: number;
  fillGalleryWidth?: boolean;
  isEditor?: boolean;
  galleryPaddingBetween?: number;
  showPaddingAfter?: boolean;
  showControls?: boolean;
  onMediaClick?: () => void;
}) {
  const mediaClassName = `${P}-gallery-${isVideoMedia(media) ? 'video' : 'image'}`;
  const mediaStyle: React.CSSProperties = {
    ...(fillGalleryWidth
      ? { width: '100%', maxWidth: '100%' }
      : imgWidth
        ? { width: scalingValue(imgWidth, isEditor ?? false), maxWidth: '100%' }
        : {}),
    ...(cornerRadius ? { borderRadius: scalingValue(cornerRadius, isEditor ?? false) } : {}),
    ...(onMediaClick ? { cursor: 'pointer', pointerEvents: 'auto' } : {}),
  };

  const handleClick = onMediaClick
    ? (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        onMediaClick();
      }
    : undefined;

  const mediaProps = {
    className: mediaClassName,
    style: mediaStyle,
    onClick: handleClick,
  };
  const galleryPaddingBetweenHeight = Math.max(galleryPaddingBetween, PADDING_HANDLE_SIZE);
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);

  const mediaNode = isVideoMedia(media) ? (
    <video
      {...mediaProps}
      src={media.url}
      muted
      autoPlay
      loop
      playsInline
    />
  ) : (
    <img
      {...mediaProps}
      src={media.url}
      alt={media.name ?? ''}
    />
  );

  return (
    <div className={`${P}-gallery-item`}>
      {mediaNode}
      {showPaddingAfter && galleryPaddingBetween > 0 && (
        <div
          className={`${P}-padding-handle`}
          style={{ height: scaled(galleryPaddingBetween) }}
          aria-hidden="true"
        />
      )}
      {showControls && showPaddingAfter && (
        <div
          data-controls="galleryPaddingBetween"
          data-controls-axis="y"
          data-controls-variant="row-padding"
          data-controls-min="0"
          className={`${P}-control-anchor`}
          style={{
            bottom: 0,
            left: 0,
            width: '100%',
            height: scaled(galleryPaddingBetweenHeight),
          }}
        />
      )}
    </div>
  );
}

function GalleryWithEdgePadding({
  P,
  layoutType,
  galleryWidthStyle,
  galleryPaddingRight,
  galleryPaddingLeft,
  galleryPaddingRightWidth,
  galleryPaddingLeftWidth,
  galleryPaddingMaxFraction,
  showControls,
  scaled,
  children,
}: {
  P: string;
  layoutType: 'a' | 'b' | 'c';
  galleryWidthStyle?: React.CSSProperties;
  galleryPaddingRight: number;
  galleryPaddingLeft: number;
  galleryPaddingRightWidth: number;
  galleryPaddingLeftWidth: number;
  galleryPaddingMaxFraction: number;
  showControls: boolean;
  scaled: (value: number) => string;
  children: React.ReactNode;
}) {
  const edgePadding = layoutType === 'a'
    ? galleryPaddingRight
    : layoutType === 'b'
      ? galleryPaddingLeft
      : 0;
  const edgePaddingWidth = layoutType === 'a'
    ? galleryPaddingRightWidth
    : layoutType === 'b'
      ? galleryPaddingLeftWidth
      : 0;
  const showEdgeSpacer = edgePadding > 0 || showControls;

  return (
    <div className={`${P}-gallery-controls`}>
      {layoutType === 'b' && showEdgeSpacer && (
        <div
          className={`${P}-gallery-edge-spacer`}
          style={{ width: scaled(edgePadding) }}
          aria-hidden="true"
        />
      )}
      {showControls && layoutType === 'b' && (
        <div
          data-controls="galleryPaddingLeft"
          data-controls-axis="x"
          data-controls-variant="column-padding"
          data-controls-min="0"
          data-controls-max-fraction={String(galleryPaddingMaxFraction)}
          className={`${P}-control-anchor`}
          style={{
            top: 0,
            left: 0,
            width: scaled(galleryPaddingLeftWidth),
            height: '100%',
          }}
        />
      )}
      <div className={`${P}-gallery`} style={galleryWidthStyle}>
        {children}
      </div>
      {layoutType === 'a' && showEdgeSpacer && (
        <div
          className={`${P}-gallery-edge-spacer`}
          style={{ width: scaled(edgePadding) }}
          aria-hidden="true"
        />
      )}
      {showControls && layoutType === 'a' && (
        <div
          data-controls="galleryPaddingRight"
          data-controls-axis="x"
          data-controls-variant="column-padding"
          data-controls-reverse=""
          data-controls-min="0"
          data-controls-max-fraction={String(galleryPaddingMaxFraction)}
          className={`${P}-control-anchor`}
          style={{
            top: 0,
            right: 0,
            width: scaled(galleryPaddingRightWidth),
            height: '100%',
          }}
        />
      )}
    </div>
  );
}

type TitlePosition = 'left' | 'center' | 'right' | 'top';

type MercuryTransition = 'fade' | 'retype' | 'scroll';

function resolveTransition(value?: string): MercuryTransition {
  switch (value) {
    case 'fade':
    case 'retype':
    case 'scroll':
      return value;
    case 'default':
      return 'scroll';
    default:
      return 'scroll';
  }
}

function StickyTitle({
  P,
  title,
  position,
  titleRef,
  titleClassName,
  titleContainerStyle,
  titleStyle,
}: {
  P: string;
  title?: string;
  position: TitlePosition;
  titleRef: (element: HTMLDivElement | null) => void;
  titleClassName: string;
  titleContainerStyle: React.CSSProperties;
  titleStyle: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);
  const displayedTitle = title ?? '';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const updateHeight = () => setHeight(el.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayedTitle]);

  return (
    <div
      ref={(element) => {
        ref.current = element;
        titleRef(element);
      }}
      className={[
        titleClassName,
        `${P}-title-position-${position}`,
      ].join(' ')}
      style={{
        [`--${P}-title-height`]: `${height}px`,
        ...titleContainerStyle,
      } as React.CSSProperties}
    >
      <span className={`${P}-title-text`} style={titleStyle}>
        {displayedTitle}
      </span>
    </div>
  );
}

const TITLE_CROSSFADE_SIGMA = 45;

function getTitleStickyDistance(rect: DOMRect, position: TitlePosition, element?: HTMLElement | null): number {
  if (position === 'top') {
    const stickyTop = element
      ? parseFloat(getComputedStyle(element).top) || 0
      : 0;
    return Math.abs(rect.top - stickyTop);
  }
  const titleCenter = rect.top + rect.height / 2;
  return Math.abs(titleCenter - window.innerHeight / 2);
}

function computeTitleTransitionState(
  titleRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  itemCount: number,
  position: TitlePosition,
) {
  const opacities = Array.from({ length: itemCount }, (_, index) => {
    const element = titleRefs.current[index];
    if (!element) return 0;

    const rect = element.getBoundingClientRect();
    const distance = getTitleStickyDistance(rect, position, element);
    return Math.exp(-(distance * distance) / (2 * TITLE_CROSSFADE_SIGMA * TITLE_CROSSFADE_SIGMA));
  });

  let dominantIndex = 0;
  let maxOpacity = -1;

  opacities.forEach((value, index) => {
    if (value > maxOpacity) {
      maxOpacity = value;
      dominantIndex = index;
    }
  });

  return { opacities, dominantIndex };
}

function useTitleTransitionState(itemCount: number, enabled: boolean, position: TitlePosition) {
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [{ opacities, dominantIndex }, setTransitionState] = useState<{
    opacities: number[];
    dominantIndex: number;
  }>(() => ({
    opacities: Array.from({ length: itemCount }, (_, index) => (index === 0 ? 1 : 0)),
    dominantIndex: 0,
  }));

  useLayoutEffect(() => {
    if (!enabled || itemCount === 0) {
      setTransitionState({
        opacities: Array.from({ length: itemCount }, () => 1),
        dominantIndex: 0,
      });
      return;
    }

    let frameId = 0;

    const updateTransitionState = () => {
      setTransitionState(computeTitleTransitionState(titleRefs, itemCount, position));
    };

    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateTransitionState();
      });
    };

    updateTransitionState();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [enabled, itemCount, position]);

  const setTitleRef = (index: number) => (element: HTMLDivElement | null) => {
    titleRefs.current[index] = element;
  };

  return { setTitleRef, opacities, dominantIndex };
}

function useRetypedTitle(title: string, enabled: boolean): string {
  const [displayedTitle, setDisplayedTitle] = useState(title);
  const displayedTitleRef = useRef(title);

  useEffect(() => {
    if (!enabled) {
      displayedTitleRef.current = title;
      setDisplayedTitle(title);
      return;
    }

    const previousLetters = Array.from(displayedTitleRef.current);
    const nextLetters = Array.from(title);
    const steps = Math.max(previousLetters.length, nextLetters.length);

    if (steps === 0 || displayedTitleRef.current === title) return;

    let step = 0;
    const intervalId = window.setInterval(() => {
      step += 1;
      const nextValue = [
        ...nextLetters.slice(0, step),
        ...previousLetters.slice(step),
      ].join('');

      displayedTitleRef.current = nextValue;
      setDisplayedTitle(nextValue);

      if (step >= steps) {
        window.clearInterval(intervalId);
      }
    }, 35);

    return () => window.clearInterval(intervalId);
  }, [enabled, title]);

  return displayedTitle;
}

export function Mercury({
  settings,
  content,
  isEditor,
  isPreviewMode,
  isEditMode,
  portalId,
}: MercuryProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const items = content ?? [];
  const wrapperWidth = settings?.wrapperWidth ?? 1;
  const layoutType = settings?.type ?? 'a';
  const imgWidth = settings?.imgWidth ?? DEFAULT_IMG_WIDTH;
  const cornerRadius = settings?.cornerRadius ?? DEFAULT_CORNER_RADIUS;
  const position = settings?.position ?? 'center';
  const titleTopPadding = settings?.titleTopPadding ?? 0;
  const transition = resolveTransition(settings?.transition);
  const lightbox = settings?.lightbox ?? 'on';
  const isOverlayLayout = layoutType === 'c';
  const animateTransitions = transition === 'fade' || transition === 'retype';
  const { setTitleRef, dominantIndex } = useTitleTransitionState(items.length, animateTransitions, position);
  const activeTitle = items[dominantIndex]?.title ?? '';
  const retypedTitle = useRetypedTitle(activeTitle, transition === 'retype');
  const usesSingleTitle = transition === 'fade' || transition === 'retype';
  const singleTitle = transition === 'retype' ? retypedTitle : activeTitle;
  const galleryWidthStyle = !isOverlayLayout
    ? { width: scalingValue(imgWidth, isEditor ?? false) }
    : undefined;
  const canOpenLightbox = lightbox === 'on' && (!isEditor || isPreviewMode || isEditMode);
  const showControls = isEditMode ?? false;
  const galleryPaddingRight = settings?.galleryPaddingRight ?? 0;
  const galleryPaddingLeft = settings?.galleryPaddingLeft ?? 0;
  const galleryPaddingBetween = settings?.galleryPaddingBetween ?? 0;
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const retypeTitleWidth = `calc(100% - ${scaled(imgWidth)})`;
  const retypeTitleLayoutStyle: React.CSSProperties = isOverlayLayout
    ? { width: '100%' }
    : {
        width: retypeTitleWidth,
        marginLeft: layoutType === 'b' ? scaled(imgWidth) : undefined,
      };
  const galleryPaddingRightWidth = Math.max(galleryPaddingRight, PADDING_HANDLE_SIZE);
  const galleryPaddingLeftWidth = Math.max(galleryPaddingLeft, PADDING_HANDLE_SIZE);
  const galleryPaddingBetweenHeight = Math.max(galleryPaddingBetween, PADDING_HANDLE_SIZE);
  const titleTopPaddingHeight = Math.max(titleTopPadding, PADDING_HANDLE_SIZE);
  const galleryPaddingMaxFraction = Math.max(0, (wrapperWidth ?? 1) - (imgWidth ?? DEFAULT_IMG_WIDTH));
  const entryPaddingControlStyle: React.CSSProperties = isOverlayLayout
    ? { left: 0, width: '100%' }
    : layoutType === 'a'
      ? { right: scaled(galleryPaddingRight), width: scaled(imgWidth) }
      : { left: scaled(galleryPaddingLeft), width: scaled(imgWidth) };

  const {
    titleColor,
    titleFontFamily,
    titleFontSettings,
    titleFontSize,
    titleLineHeight,
    titleLetterSpacing,
    titleWordSpacing,
    titleAlign,
    titleTextAppearance,
    lightboxCounterColor,
    lightboxCounterFontFamily,
    lightboxCounterFontSettings,
    lightboxCounterFontSize,
    lightboxCounterLineHeight,
    lightboxCounterLetterSpacing,
    lightboxCounterWordSpacing,
    lightboxCounterTextAppearance,
  } = settings ?? {};

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
    textAlign: titleAlign ?? 'left',
    textAppearance: titleTextAppearance,
    color: titleColor ?? '#000000',
  };
  const titleTypographyCss = omitTextColors(textStylesToCss(resolvedTitleTextStyle, isEditor));
  const titleStyle = titleTypographyCss;
  const titleContainerStyle = getTextLeadingVars(titleFontSize, titleLineHeight, P, isEditor);
  const titleClassName = getTextClassName(
    titleFontSize,
    titleLineHeight,
    `${P}-title`,
    `${P}-text-tight-leading`,
  );

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
    color: lightboxCounterColor ?? '#DEDDDD',
  };
  const lightboxCounterTypographyCss = omitTextColors(textStylesToCss(resolvedLightboxCounterTextStyle, isEditor));
  const lightboxCounterFieldCss = {
    ...lightboxCounterTypographyCss,
    ...getTextLeadingVars(lightboxCounterFontSize, lightboxCounterLineHeight, P, isEditor),
  } as React.CSSProperties;
  const lightboxCounterClassName = getTextClassName(
    lightboxCounterFontSize,
    lightboxCounterLineHeight,
    `${P}-lightbox-counter`,
    `${P}-text-tight-leading`,
  );

  const colorVars = buildColorVars(P, {
    titleColor: titleColor ?? '#000000',
    lightboxCounterColor: lightboxCounterColor ?? '#DEDDDD',
  }, COLOR_VAR_MAP, STATE_KEYS);

  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<MercuryMedia[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((lightboxMediaItems: MercuryMedia[], idx: number) => {
    if (!canOpenLightbox) return;
    setLightboxItems(lightboxMediaItems);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }, [canOpenLightbox]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const lightboxPortalStyle = useMemo(() => {
    const style: Record<string, string> = { ...(colorVars as Record<string, string>) };
    const articleWidth = containerRef.current
      ? getComputedStyle(containerRef.current).getPropertyValue('--cntrl-article-width').trim()
      : '';
    if (articleWidth) {
      style['--cntrl-article-width'] = articleWidth;
    }
    return style as React.CSSProperties;
  }, [colorVars, lightboxOpen]);

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
    if (!isEditor || isEditMode || isPreviewMode) return;
    setLightboxOpen(false);
  }, [isEditor, isEditMode, isPreviewMode]);

  useEffect(() => {
    if (lightbox === 'off') {
      setLightboxOpen(false);
    }
  }, [lightbox]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div style={colorVars}>
        <div
          ref={containerRef}
          className={`${P}-wrapper`}
          style={{
            width: scalingValue(wrapperWidth, isEditor ?? false),
            [`--${P}-title-top-padding`]: position === 'top' ? scaled(titleTopPadding) : undefined,
          } as React.CSSProperties}
        >
          {showControls && position === 'top' && (
            <div
              data-controls="titleTopPadding"
              data-controls-axis="y"
              data-controls-variant="row-padding"
              data-controls-min="0"
              data-controls-center-only-drag=""
              data-controls-hit-placement="left-y"
              className={`${P}-control-anchor`}
              style={{
                top: 0,
                left: 0,
                width: '100%',
                height: scaled(titleTopPaddingHeight),
              }}
            />
          )}
          {usesSingleTitle && (
            <div className={`${P}-single-title-layer`}>
              <StickyTitle
                P={P}
                title={singleTitle}
                position={position}
                titleRef={() => {}}
                titleClassName={`${titleClassName} ${P}-single-title`}
                titleContainerStyle={{
                  ...titleContainerStyle,
                  ...retypeTitleLayoutStyle,
                }}
                titleStyle={titleStyle}
              />
            </div>
          )}
          {items.map((item, index) => {
            const displayItems = getMercuryDisplayItems(item.gallery);
            const showEntryPaddingAfter = index < items.length - 1;
            const lightboxItemsForEntry = displayItems
              .filter((entry) => entry.lightboxMedia)
              .map((entry) => entry.lightboxMedia!);
            const titleProps = {
              P,
              position,
              titleRef: setTitleRef(index),
              titleClassName,
              titleContainerStyle,
              titleStyle,
            };

            return (
              <div
                key={index}
                data-item-index={index}
                className={`${P}-item ${P}-item-${layoutType}`}
                style={{
                  paddingBottom: showEntryPaddingAfter
                    ? scaled(galleryPaddingBetween)
                    : undefined,
                }}
              >
                {showControls && showEntryPaddingAfter && (
                  <div
                    data-controls="galleryPaddingBetween"
                    data-controls-axis="y"
                    data-controls-variant="row-padding"
                    data-controls-min="0"
                    className={`${P}-control-anchor`}
                    style={{
                      bottom: 0,
                      height: scaled(galleryPaddingBetweenHeight),
                      ...entryPaddingControlStyle,
                    }}
                  />
                )}
                {isOverlayLayout ? (
                  <div className={`${P}-gallery`}>
                    <div className={`${P}-gallery-media`}>
                      {displayItems.map(({ displayMedia, lightboxMedia }, mediaIndex) => {
                        const lightboxItemIndex = lightboxMedia
                          ? lightboxItemsForEntry.findIndex((media) => media.url === lightboxMedia.url)
                          : -1;
                        return (
                          <GalleryMediaItem
                            key={`${displayMedia.url}-${mediaIndex}`}
                            P={P}
                            media={displayMedia}
                            imgWidth={imgWidth || undefined}
                            cornerRadius={cornerRadius || undefined}
                            isEditor={isEditor}
                            galleryPaddingBetween={galleryPaddingBetween}
                            showPaddingAfter={mediaIndex < displayItems.length - 1}
                            showControls={showControls}
                            onMediaClick={canOpenLightbox && lightboxItemIndex >= 0
                              ? () => openLightbox(lightboxItemsForEntry, lightboxItemIndex)
                              : undefined}
                          />
                        );
                      })}
                    </div>
                    <div className={`${P}-title-layer`}>
                      <StickyTitle
                        {...titleProps}
                        title={usesSingleTitle ? '' : item.title}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <StickyTitle
                      {...titleProps}
                      title={usesSingleTitle ? '' : item.title}
                    />
                    {displayItems.length > 0 && (
                      <GalleryWithEdgePadding
                        P={P}
                        layoutType={layoutType}
                        galleryWidthStyle={galleryWidthStyle}
                        galleryPaddingRight={galleryPaddingRight}
                        galleryPaddingLeft={galleryPaddingLeft}
                        galleryPaddingRightWidth={galleryPaddingRightWidth}
                        galleryPaddingLeftWidth={galleryPaddingLeftWidth}
                        galleryPaddingMaxFraction={galleryPaddingMaxFraction}
                        showControls={showControls}
                        scaled={scaled}
                      >
                        {displayItems.map(({ displayMedia, lightboxMedia }, mediaIndex) => {
                          const lightboxItemIndex = lightboxMedia
                            ? lightboxItemsForEntry.findIndex((media) => media.url === lightboxMedia.url)
                            : -1;
                          return (
                            <GalleryMediaItem
                              key={`${displayMedia.url}-${mediaIndex}`}
                              P={P}
                              media={displayMedia}
                              cornerRadius={cornerRadius || undefined}
                              fillGalleryWidth
                              isEditor={isEditor}
                              galleryPaddingBetween={galleryPaddingBetween}
                              showPaddingAfter={mediaIndex < displayItems.length - 1}
                              showControls={showControls}
                              onMediaClick={canOpenLightbox && lightboxItemIndex >= 0
                                ? () => openLightbox(lightboxItemsForEntry, lightboxItemIndex)
                                : undefined}
                            />
                          );
                        })}
                      </GalleryWithEdgePadding>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {lightboxOpen && lightbox === 'on' && typeof document !== 'undefined' && settings && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <div style={lightboxPortalStyle} data-selection="none">
            <Lightbox
              prefix={P}
              items={lightboxItems}
              index={lightboxIndex}
              imageDisplay={resolveLightboxImageDisplay(settings.lightboxImageDisplay)}
              isEditor={isEditor}
              onClose={closeLightbox}
              onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length)}
              onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxItems.length)}
              counterClassName={lightboxCounterClassName}
              counterStyle={lightboxCounterFieldCss}
              backgroundColor={settings.backgroundColor ?? DEFAULT_LIGHTBOX_BACKGROUND}
            />
          </div>,
          portalTarget,
        );
      })()}
    </>
  );
}
