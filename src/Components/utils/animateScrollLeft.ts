type AnimateScrollLeftOptions = {
  duration: number;
  ease: (progress: number) => number;
  onFrame?: () => void;
  onComplete?: () => void;
};

export const animateScrollLeft = (
  element: HTMLElement,
  targetLeft: number,
  { duration, ease, onFrame, onComplete }: AnimateScrollLeftOptions,
): (() => void) => {
  const from = element.scrollLeft;
  const distance = targetLeft - from;

  if (Math.abs(distance) < 0.5) {
    element.scrollLeft = targetLeft;
    onComplete?.();
    return () => {};
  }

  const start = performance.now();
  let frameId = 0;

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    element.scrollLeft = from + distance * ease(progress);
    onFrame?.();

    if (progress < 1) {
      frameId = requestAnimationFrame(tick);
    } else {
      element.scrollLeft = targetLeft;
      onComplete?.();
    }
  };

  frameId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frameId);
  };
};
