import { useCallback, useMemo, useRef, useState } from 'react';

const SWIPE_DISMISS_MIN_PX = 100;
const SWIPE_DISMISS_SCREEN_RATIO = 0.2;
const SWIPE_DIRECTION_LOCK_PX = 8;

type UseLightboxSwipeDismissOptions = {
  enabled: boolean;
  onClose: () => void;
  animMs?: number;
  isBlockedTarget?: (target: HTMLElement) => boolean;
};

export const useLightboxSwipeDismiss = ({
  enabled,
  onClose,
  animMs = 300,
  isBlockedTarget,
}: UseLightboxSwipeDismissOptions) => {
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    isLocked: boolean | null;
    pointerId: number;
  } | null>(null);
  const dragOffsetYRef = useRef(0);
  dragOffsetYRef.current = dragOffsetY;

  const dismissThreshold = useMemo(() => {
    if (typeof window === 'undefined') return SWIPE_DISMISS_MIN_PX;
    return Math.max(SWIPE_DISMISS_MIN_PX, window.innerHeight * SWIPE_DISMISS_SCREEN_RATIO);
  }, []);

  const getBackdropOpacity = useCallback((offset: number) => (
    Math.max(0, 1 - offset / (dismissThreshold * 1.5))
  ), [dismissThreshold]);

  const getChromeOpacity = useCallback((offset: number) => (
    Math.max(0, 1 - offset / (dismissThreshold * 0.45))
  ), [dismissThreshold]);

  const getMediaAreaTransform = useCallback((offset: number) => {
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const scale = Math.max(0.88, 1 - (offset / viewportHeight) * 0.12);
    return `translateY(${offset}px) scale(${scale})`;
  }, []);

  const resetGesture = useCallback(() => {
    gestureRef.current = null;
  }, []);

  const snapBack = useCallback(() => {
    setIsAnimating(true);
    setDragOffsetY(0);
    window.setTimeout(() => setIsAnimating(false), animMs);
    resetGesture();
  }, [animMs, resetGesture]);

  const dismissWithAnimation = useCallback(() => {
    const exitY = typeof window !== 'undefined' ? window.innerHeight : 800;
    setIsAnimating(true);
    setDragOffsetY(exitY);
    window.setTimeout(() => {
      onClose();
      resetGesture();
      setDragOffsetY(0);
      setIsAnimating(false);
    }, Math.min(animMs, 200));
  }, [animMs, onClose, resetGesture]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || isAnimating) return;
    if (event.pointerType !== 'touch') return;
    if (isBlockedTarget?.(event.target as HTMLElement)) return;

    gestureRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      isLocked: null,
      pointerId: event.pointerId,
    };
  }, [enabled, isAnimating, isBlockedTarget]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!enabled || !gesture) return;
    if (event.pointerType !== 'touch') return;
    if (gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (gesture.isLocked === null) {
      if (Math.abs(deltaX) < SWIPE_DIRECTION_LOCK_PX && Math.abs(deltaY) < SWIPE_DIRECTION_LOCK_PX) {
        return;
      }
      if (deltaY > 0 && deltaY > Math.abs(deltaX)) {
        gesture.isLocked = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      } else {
        gesture.isLocked = false;
        resetGesture();
        return;
      }
    }

    if (!gesture.isLocked) return;

    event.preventDefault();
    const nextOffset = Math.max(0, deltaY);
    dragOffsetYRef.current = nextOffset;
    setDragOffsetY(nextOffset);
  }, [enabled, resetGesture]);

  const finishGesture = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!enabled || !gesture) return;
    if (event.pointerType !== 'touch') return;
    if (gesture.pointerId !== event.pointerId) return;

    const wasLocked = gesture.isLocked === true;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!wasLocked) {
      resetGesture();
      return;
    }

    const deltaY = event.clientY - gesture.startY;
    if (deltaY >= dismissThreshold) {
      dismissWithAnimation();
    } else {
      snapBack();
    }
  }, [dismissThreshold, dismissWithAnimation, enabled, resetGesture, snapBack]);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    finishGesture(event);
  }, [finishGesture]);

  const onPointerCancel = useCallback((event: React.PointerEvent<HTMLElement>) => {
    finishGesture(event);
  }, [finishGesture]);

  const isSwipeDragging = dragOffsetY > 0;
  const transition = isAnimating ? `transform ${animMs}ms ease` : 'none';
  const opacityTransition = isAnimating ? `opacity ${animMs}ms ease` : 'none';
  const isChromeFading = dragOffsetY > 0 || isAnimating;

  return {
    isSwipeDragging,
    backdropStyle: {
      opacity: getBackdropOpacity(dragOffsetY),
      transition: opacityTransition,
    } as React.CSSProperties,
    mediaAreaStyle: {
      transform: getMediaAreaTransform(dragOffsetY),
      transition,
      touchAction: isSwipeDragging ? 'none' : undefined,
      willChange: isSwipeDragging ? 'transform' : undefined,
    } as React.CSSProperties,
    chromeStyle: isChromeFading ? {
      opacity: getChromeOpacity(dragOffsetY),
      transition: opacityTransition,
    } as React.CSSProperties : undefined,
    swipeHandlers: enabled ? {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    } : {},
  };
};
