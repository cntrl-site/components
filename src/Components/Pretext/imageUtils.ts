import type { ImageTransform, Pt, ScaleCorner } from './Pretext';
import { clamp01 } from './rings';

const MIN_IMAGE_SCALE = 0.1;
const MAX_IMAGE_SCALE = 8;
const MIN_PANNABLE_SLACK = 4;
const SCALE_HANDLE_OUTSET = 10;

export { MIN_IMAGE_SCALE, MAX_IMAGE_SCALE };

export const bboxCorner = (
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  corner: ScaleCorner,
): Pt => {
  switch (corner) {
    case 'nw': return { x: bbox.minX, y: bbox.minY };
    case 'ne': return { x: bbox.maxX, y: bbox.minY };
    case 'se': return { x: bbox.maxX, y: bbox.maxY };
    case 'sw': return { x: bbox.minX, y: bbox.maxY };
  }
};

export const oppositeScaleCorner = (corner: ScaleCorner): ScaleCorner => {
  switch (corner) {
    case 'nw': return 'se';
    case 'ne': return 'sw';
    case 'se': return 'nw';
    case 'sw': return 'ne';
  }
};

export const scaleHandlePoint = (
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  corner: ScaleCorner,
): Pt => {
  const point = bboxCorner(bbox, corner);
  const outwardX = corner === 'nw' || corner === 'sw' ? -1 : 1;
  const outwardY = corner === 'nw' || corner === 'ne' ? -1 : 1;
  return {
    x: point.x + outwardX * SCALE_HANDLE_OUTSET,
    y: point.y + outwardY * SCALE_HANDLE_OUTSET,
  };
};

const coverScale = (
  bounds: { width: number; height: number },
  natural: { width: number; height: number },
): number => {
  if (!(natural.width > 0) || !(natural.height > 0) || !(bounds.width > 0) || !(bounds.height > 0)) return 1;
  return Math.max(bounds.width / natural.width, bounds.height / natural.height);
};

export const coveredImageSize = (
  bounds: { width: number; height: number },
  natural: { width: number; height: number },
  scale: number,
): { width: number; height: number } => {
  const factor = coverScale(bounds, natural) * scale;
  return { width: natural.width * factor, height: natural.height * factor };
};

export const imageOffsetFromFocal = (
  boundsSize: number,
  renderedSize: number,
  focal: number,
): number => (boundsSize - renderedSize) * focal;

export const focalFromImageOffset = (boundsSize: number, renderedSize: number, offset: number): number => {
  const span = boundsSize - renderedSize;
  if (Math.abs(span) < MIN_PANNABLE_SLACK) return 0.5;
  return clamp01(offset / span);
};

export const preserveImageTransformAcrossBoundsChange = (
  prevBounds: { x: number; y: number; width: number; height: number },
  nextBounds: { x: number; y: number; width: number; height: number },
  natural: { width: number; height: number },
  focalX: number,
  focalY: number,
  scale: number,
): ImageTransform => {
  const oldSize = coveredImageSize(prevBounds, natural, scale);
  const absX = prevBounds.x + imageOffsetFromFocal(prevBounds.width, oldSize.width, focalX);
  const absY = prevBounds.y + imageOffsetFromFocal(prevBounds.height, oldSize.height, focalY);
  const prevCover = coverScale(prevBounds, natural);
  const nextCover = coverScale(nextBounds, natural);
  const nextScale = Math.min(
    MAX_IMAGE_SCALE,
    Math.max(MIN_IMAGE_SCALE, nextCover > 0 ? scale * (prevCover / nextCover) : scale),
  );
  const newSize = coveredImageSize(nextBounds, natural, nextScale);
  return {
    focalX: focalFromImageOffset(nextBounds.width, newSize.width, absX - nextBounds.x),
    focalY: focalFromImageOffset(nextBounds.height, newSize.height, absY - nextBounds.y),
    scale: nextScale,
  };
};
