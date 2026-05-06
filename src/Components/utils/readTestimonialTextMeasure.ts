export type TestimonialMeasureExtents = {
  maxTextPx: number;
  maxCaptionPx: number;
};

export const readTestimonialTextMeasure = (
  root: HTMLElement,
  onExtents: (extents: TestimonialMeasureExtents) => void
) => {
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
