import { useLayoutEffect, type DependencyList, type RefObject } from 'react';

export type TestimonialMeasureExtents = {
  maxTextPx: number;
  maxCaptionPx: number;
};

type UseTestimonialMeasureExtentsOpts = {
  enabled: boolean;
  rootRef: RefObject<HTMLElement | null>;
  onExtents: (extents: TestimonialMeasureExtents) => void;
  deps?: DependencyList;
};

export const useTestimonialTextMeasure = ({
  enabled,
  rootRef,
  onExtents,
  deps = [],
}: UseTestimonialMeasureExtentsOpts) => {
  useLayoutEffect(() => {
    if (!enabled) {
      onExtents({ maxTextPx: 0, maxCaptionPx: 0 });
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const readExtents = () => {
      const maxTextPx = Array.from(root.querySelectorAll('[data-testimonial-measure="text"]')).reduce(
        (acc, el) => Math.max(acc, el.getBoundingClientRect().height),
        0
      );
      const maxCaptionPx = Array.from(root.querySelectorAll('[data-testimonial-measure="caption"]')).reduce(
        (acc, el) => Math.max(acc, el.getBoundingClientRect().height),
        0
      );

      onExtents({ maxTextPx, maxCaptionPx });
    };

    readExtents();

    const ro = new ResizeObserver(readExtents);
    ro.observe(root);

    return () => {
      ro.disconnect();
    };
  }, [enabled, rootRef, onExtents, ...deps]);
};
