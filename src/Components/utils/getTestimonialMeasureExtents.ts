export type TestimonialMeasureExtents = {
  maxTextPx: number;
  maxCaptionPx: number;
};

export const getTestimonialMeasureExtents = (root: ParentNode): TestimonialMeasureExtents => {
  const maxTextPx = Array.from(root.querySelectorAll('[data-testimonial-measure="text"]')).reduce(
    (acc, el) => Math.max(acc, el.getBoundingClientRect().height),
    0
  );
  const maxCaptionPx = Array.from(root.querySelectorAll('[data-testimonial-measure="caption"]')).reduce(
    (acc, el) => Math.max(acc, el.getBoundingClientRect().height),
    0
  );

  return { maxTextPx, maxCaptionPx };
};
