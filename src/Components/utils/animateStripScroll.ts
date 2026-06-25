type AnimateStripScrollOptions = {
  duration: number;
  easing: string;
  onComplete?: () => void;
};

export const getDistanceScaledDuration = (
  distance: number,
  minMs: number,
  maxMs: number,
  referenceDistance: number,
) => {
  const ratio = Math.min(Math.abs(distance) / Math.max(referenceDistance, 1), 1);
  return minMs + (maxMs - minMs) * ratio;
};

const clearTrackMotion = (track: HTMLElement) => {
  track.style.transition = '';
  track.style.transform = '';
  track.style.willChange = '';
};

const getTrackTranslateX = (track: HTMLElement) => {
  const transform = getComputedStyle(track).transform;
  if (transform === 'none') return 0;
  return new DOMMatrixReadOnly(transform).m41;
};

export const animateStripScroll = (
  strip: HTMLElement,
  track: HTMLElement,
  targetLeft: number,
  { duration, easing, onComplete }: AnimateStripScrollOptions,
): (() => void) => {
  const from = strip.scrollLeft;
  const distance = targetLeft - from;
  const offsetX = from - targetLeft;

  const settle = (commitScroll: number, invokeComplete: boolean) => {
    clearTrackMotion(track);
    strip.scrollLeft = commitScroll;
    if (invokeComplete) {
      onComplete?.();
    }
  };

  if (Math.abs(distance) < 0.5) {
    settle(targetLeft, true);
    return () => {};
  }

  let cancelled = false;
  let timeoutId = 0;

  const cleanupListeners = () => {
    track.removeEventListener('transitionend', onTransitionEnd);
    clearTimeout(timeoutId);
  };

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== track || event.propertyName !== 'transform') return;
    if (cancelled) return;
    cancelled = true;
    cleanupListeners();
    settle(targetLeft, true);
  };

  track.addEventListener('transitionend', onTransitionEnd);
  track.style.willChange = 'transform';
  track.style.transition = 'none';
  track.style.transform = 'translate3d(0, 0, 0)';
  void track.offsetHeight;
  track.style.transition = `transform ${duration}ms ${easing}`;
  track.style.transform = `translate3d(${offsetX}px, 0, 0)`;

  timeoutId = window.setTimeout(() => {
    if (cancelled) return;
    cancelled = true;
    cleanupListeners();
    settle(targetLeft, true);
  }, duration + 64);

  return () => {
    if (cancelled) return;
    cancelled = true;
    cleanupListeners();
    settle(from - getTrackTranslateX(track), false);
  };
};
