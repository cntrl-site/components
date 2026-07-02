import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import { CommonComponentProps } from '../props';
import { buildColorVars, getFormFieldValidationError, scalingValue, useScopedStyles } from '../utils/index';
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
  outline: 1px solid #ccc;
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
  height: 100%;
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
.${P}-type-b .${P}-item-inner,
.${P}-type-b .${P}-item-inner-hidden,
.${P}-type-c .${P}-item-inner,
.${P}-type-c .${P}-item-inner-hidden {
  align-items: flex-start;
}
.${P}-type-b .${P}-item-image-link,
.${P}-type-c .${P}-item-image-link {
  align-items: center;
}
.${P}-type-b .${P}-item-title,
.${P}-type-b .${P}-item-subtitle,
.${P}-type-c .${P}-item-title,
.${P}-type-c .${P}-item-subtitle {
  text-align: left;
}
.${P}-item-text-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  flex-shrink: 0;
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
.${P}-align-entries .${P}-item-image-link {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.${P}-lightbox-counter {
  margin: 0;
  color: var(--${P}-lightbox-counter-color);
}

.${P}-control {
  position: relative;
  z-index: 2;
  width: 100%;
}

.${P}-control::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 20px;
  pointer-events: auto;
  z-index: 10;
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
  onUpdateSettings?: (settings: GridSettings) => void;
} & CommonComponentProps;

type AnimRect = { top: number; left: number; width: number; height: number };

type LightboxProps = {
  items: GridMedia[];
  index: number;
  imageDisplay: 'fit' | 'cover';
  originRect: AnimRect | null;
  reverseClose: boolean;
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

function getLightboxMediaDimensions(media: HTMLImageElement | HTMLVideoElement) {
  if (media instanceof HTMLVideoElement) {
    return { width: media.videoWidth, height: media.videoHeight };
  }
  return { width: media.naturalWidth, height: media.naturalHeight };
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
      preload='auto'
      onLoadedMetadata={onLoadedMetadata}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onTransitionEnd={onTransitionEnd}
      style={mediaStyle}
    />
  );
}

function Lightbox({ items, index, imageDisplay, originRect, reverseClose, onClose, onPrev, onNext, counterClassName, counterStyle }: LightboxProps) {
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
  const navSwipeAnimatingRef = useRef(false);
  const navSwipeCommitTimerRef = useRef<number | null>(null);
  const [finalRect, setFinalRect] = useState<AnimRect | null>(null);
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>(originRect ? 'opening' : 'open');
  const [transitionsEnabled, setTransitionsEnabled] = useState(true);
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
    setTransitionsEnabled(false);
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

    const blockSwipeClick = () => {
      const blockClick = (clickEvent: Event) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        document.removeEventListener('click', blockClick, true);
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
      setTransitionsEnabled(false);

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
  }, [phase, items.length, onNext, onPrev, setNavSwipeAnimatingState, scheduleNavSwipeSnapBackEnd]);

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
  const reverseAnimateClose = isClosing && reverseClose && !!originRect && !swipeDismiss;
  const swipeBackdropOpacity = swipeOffset > 0 ? Math.max(0, 1 - swipeOffset / 500) : 1;
  const swipeMediaOpacity = swipeOffset > 0 ? Math.max(0.35, 1 - swipeOffset / 500) : 1;
  const animatedRect = phase === 'opening'
    ? (originRect ?? finalRect)
    : reverseAnimateClose
      ? originRect
      : finalRect;

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
    top: animatedRect?.top,
    left: animatedRect?.left,
    width: animatedRect?.width,
    height: animatedRect?.height,
    objectFit: imageDisplay === 'cover' ? 'cover' : 'contain',
    transform: mediaTransform,
    opacity: swipeOffset > 0
      ? swipeMediaOpacity
      : isClosing && !reverseAnimateClose
        ? 0
        : 1,
    transition: (isSwiping && !navSwipeAnimating)
      ? 'none'
      : navSwipeAnimating
        ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
        : swipeDismiss
          ? `transform ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
          : isClosing && !reverseAnimateClose
            ? `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
            : (reverseAnimateClose || transitionsEnabled)
              ? `top ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, left ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, width ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, height ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
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
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9997,
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

      {animatedRect && currentItem && (
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

function resolveLightboxImageDisplay(
  value: GridSettings['lightboxImageDisplay'],
): 'fit' | 'cover' {
  if (typeof value === 'string') {
    return value === 'cover' ? 'cover' : 'fit';
  }
  return value?.display === 'cover' ? 'cover' : 'fit';
}

export function Grid({ settings, content, isEditor, isPreviewMode, isEditMode, metadata, activeEvent, layoutId }: GridProps) {
  const { prefix: P } = useScopedStyles();
  const {
    type = 'a',
    gridLayout,
    textBoxWidth = 100,
    verticalGap,
    entriesCount,
    lightbox,
    imageDisplay,
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

  const size = gridLayout.entryWidth ?? 0.2;

  const isCover = imageDisplay?.display === 'cover';
  const ratioValue = imageDisplay?.ratioValue ?? '1:1';
  const ratioReversed = imageDisplay?.reversed ?? false;
  const [rW, rH] = ratioValue.split(':').map(Number);
  const effW = ratioReversed ? rH : rW;
  const effH = ratioReversed ? rW : rH;
  const aspectRatio = `${effW} / ${effH}`;

  const imageWrapperWidth = scalingValue(size ?? 0, isEditor);
  const isFitSlider = !isCover && slider !== 'off';

  const imageWrapperStyle: React.CSSProperties = {
    width: imageWrapperWidth,
    ...(isCover
      ? { aspectRatio, height: 'auto', overflow: 'hidden' }
      : { height: 'auto' }),
  };

  const imageWrapperClassName = `${P}-item-image-wrapper${isFitSlider ? ` ${P}-item-image-wrapper-fit-slider` : ''}`.trim();
  const isTypeC = type === 'c';
  const shouldAlignEntries = isTypeC && alignEntries === 'on';
  const textBoxWidthStyle = `calc(${scalingValue(size ?? 0, isEditor)} * (${textBoxWidth} / 100))`;
  const controlWidthStyle = scalingValue(size * textBoxWidth / 100, isEditor);

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
  const [lightboxOriginRect, setLightboxOriginRect] = useState<AnimRect | null>(null);

  const canOpenLightboxMedia = lightbox === 'on' && (!isEditor || isPreviewMode);

  const openLightbox = (e: React.MouseEvent<HTMLElement>, items: GridMedia[], idx: number) => {
    if (isEditor && !isPreviewMode) return;
    if (lightbox === 'off') return;
    const r = e.currentTarget.getBoundingClientRect();
    setLightboxOriginRect({ top: r.top, left: r.left, width: r.width, height: r.height });
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
    setLightboxOriginRect(null);
  }, [isEditor, isPreviewMode]);

  const scopedCss = useMemo(() => getCSS(P), [P]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div style={colorVars}>
        <div
          ref={containerRef}
          className={`${P}-wrapper ${P}-type-${type}${shouldAlignEntries ? ` ${P}-align-entries` : ''} ${wrapperStateClasses}`.trim()}
          style={{
            gridTemplateColumns: `repeat(${gridLayout.columnsCount}, minmax(0, 1fr))`,
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
            const isLastRow = Math.floor(index / gridLayout.columnsCount)
              === Math.ceil(cropContent.length / gridLayout.columnsCount) - 1;

            const typeCTextBlock = isTypeC ? (
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

            const titleRow = isTypeC ? (
              <div className={`${P}-item-title-row`}>
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
              </div>
            ) : null;

            const subtitleRow = isTypeC ? (
              <div className={`${P}-item-subtitle-row`}>
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
                            ? (e) => openLightbox(e, lightboxItemsForEntry, lightboxIndex)
                            : undefined}
                        />
                      );
                    })()
                    :
                    <>
                    {isFitSlider && (
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
                                ? (e) => openLightbox(e, lightboxItemsForEntry, lightboxIndex)
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

            const typeABText = !isTypeC ? (
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
            >
              <div
                className={`${isEditMode 
                  ? `${P}-item-inner` 
                  : `${P}-item-inner-hidden`}${shouldAlignEntries && isLastRow ? ` ${P}-item-inner-last-row` : ''}`.trim()}
                style={{ width: (textBoxWidth ?? 0) > 100 
                  ? `calc(${scalingValue(size ?? 0, isEditor)} * (${textBoxWidth} / 100))` 
                  : scalingValue(size ?? 0, isEditor) }}
              >
                {shouldAlignEntries ? (
                  <>
                    {alignedTextRows}
                    <a href={itemLink} target="_blank" className={`${P}-item-image-link`}>
                      {imageContent}
                    </a>
                  </>
                ) : (
                  <a href={itemLink} target="_blank" className={`${P}-item-image-link`}>
                    {typeCTextBlock}
                    {imageContent}
                    {typeABText}
                  </a>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>
      {(!isEditor || isPreviewMode) && lightboxOpen && typeof document !== 'undefined' && lightbox === 'on' &&
        createPortal(
          <div style={lightboxPortalStyle} data-selection="none">
            <Lightbox
              items={lightboxItems}
              index={lightboxIndex}
              imageDisplay={resolveLightboxImageDisplay(lightboxImageDisplay)}
              originRect={lightboxOriginRect}
              reverseClose={slider === 'off'}
              onClose={() => setLightboxOpen(false)}
              onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length)}
              onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxItems.length)}
              counterClassName={lightboxCounterClassName}
              counterStyle={lightboxCounterFieldCss}
            />
          </div>,
          document.body
        )}
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
  type: 'a' | 'b' | 'c';
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
  lightboxImageDisplay?: 'fit' | 'cover' | { display?: 'fit' | 'cover' };
  slider: 'on' | 'off';
  sliderTiming: number;
  direction: 'horizontal' | 'vertical' | 'random',
  transition: 'fade' | 'slide',
  showText: 'always' | 'on hover';
  alignEntries: 'on' | 'off';
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
