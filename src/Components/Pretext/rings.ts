import type { PathFit, Pt, Ring, Span, ViewBox } from './Pretext';
import { flattenContours, parsePathNodes } from './vecContours';

const SHAPE_SAMPLES = 120;
const BAND_SAMPLES = 3;
export const BAND_SLACK = 0.12;

export const DEFAULT_VIEW_BOX: ViewBox = { x: 0, y: 0, width: 100, height: 100 };

export function mapToViewBox(rings: Ring[], viewBox: ViewBox): Ring[] {
  return rings.map(ring => ring.map(point => ({
    x: (point.x - viewBox.x) / viewBox.width,
    y: (point.y - viewBox.y) / viewBox.height,
  })));
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function ringsToPathPx(rings: Ring[], box: { width: number; height: number }): string {
  return rings
    .filter(ring => ring.length > 0)
    .map(ring => `M ${ring.map(point => `${point.x * box.width} ${point.y * box.height}`).join(' L ')} Z`)
    .join(' ');
}

export function ringsBBoxPx(rings: Ring[], box: { width: number; height: number }): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of rings) {
    for (const point of ring) {
      const x = point.x * box.width;
      const y = point.y * box.height;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const width = maxX - minX;
  const height = maxY - minY;
  if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) return null;
  return { x: minX, y: minY, width, height };
}

export function ringOf(pairs: [number, number][]): Ring {
  return pairs.map(([x, y]) => ({ x, y }));
}

export function normalizeRings(rings: Ring[]): Ring[] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of rings) {
    for (const point of ring) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
    }
  }
  const width = maxX - minX;
  const height = maxY - minY;
  if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) return rings;
  return rings.map(ring => ring.map(point => ({
    x: (point.x - minX) / width,
    y: (point.y - minY) / height,
  })));
}

export function spansAtY(rings: Ring[], y: number): Span[] {
  const crossings: number[] = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i += 1) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
        crossings.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
      }
    }
  }
  crossings.sort((left, right) => left - right);
  const spans: Span[] = [];
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    const x0 = clamp01(crossings[i]);
    const x1 = clamp01(crossings[i + 1]);
    if (x1 > x0) spans.push({ x0, x1 });
  }
  return mergeSpans(spans);
}

function mergeSpans(spans: Span[]): Span[] {
  if (spans.length < 2) return spans;
  const sorted = [...spans].sort((a, b) => a.x0 - b.x0);
  const merged: Span[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const last = merged[merged.length - 1];
    const next = sorted[i];
    if (next.x0 <= last.x1) {
      last.x1 = Math.max(last.x1, next.x1);
    } else {
      merged.push({ ...next });
    }
  }
  return merged;
}

function intersectSpans(a: Span[], b: Span[]): Span[] {
  const result: Span[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const x0 = Math.max(a[i].x0, b[j].x0);
    const x1 = Math.min(a[i].x1, b[j].x1);
    if (x1 > x0) result.push({ x0, x1 });
    if (a[i].x1 < b[j].x1) i += 1;
    else j += 1;
  }
  return result;
}

function invertSpans(spans: Span[]): Span[] {
  const result: Span[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.x0 > cursor) result.push({ x0: cursor, x1: span.x0 });
    cursor = Math.max(cursor, span.x1);
  }
  if (cursor < 1) result.push({ x0: cursor, x1: 1 });
  return result;
}

export function subtractSpan(spans: Span[], hole: Span): Span[] {
  const result: Span[] = [];
  for (const span of spans) {
    if (hole.x1 <= span.x0 || hole.x0 >= span.x1) {
      result.push(span);
      continue;
    }
    if (hole.x0 > span.x0) result.push({ x0: span.x0, x1: hole.x0 });
    if (hole.x1 < span.x1) result.push({ x0: hole.x1, x1: span.x1 });
  }
  return result;
}

export function spansForBand(rings: Ring[], yTop: number, yBottom: number, mode: 'contain' | 'avoid'): Span[] {
  let accumulated: Span[] | null = null;
  for (let i = 0; i < BAND_SAMPLES; i += 1) {
    const y = clamp01(yTop + ((yBottom - yTop) * i) / Math.max(1, BAND_SAMPLES - 1));
    const inside = spansAtY(rings, y);
    const usable = mode === 'avoid' ? invertSpans(inside) : inside;
    accumulated = accumulated === null ? usable : intersectSpans(accumulated, usable);
    if (accumulated.length === 0) return [];
  }
  return accumulated ?? [];
}

export function parsePathSpec(spec: string, fit: PathFit = 'stretch', viewBox: ViewBox = DEFAULT_VIEW_BOX): Ring[] | null {
  const trimmed = spec.trim();
  if (!trimmed) return null;

  if (/^[Mm]/.test(trimmed)) {
    const contours = parsePathNodes(trimmed);
    const parsed = flattenContours(contours);
    if (parsed.length) {
      return fit === 'viewbox' ? mapToViewBox(parsed, viewBox) : normalizeRings(parsed);
    }
    if (typeof document === 'undefined') return null;
    const subpaths = trimmed.split(/(?=[Mm])/).map(part => part.trim()).filter(Boolean);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rings: Ring[] = [];
    for (const subpath of subpaths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', subpath);
      svg.appendChild(path);
      let length = 0;
      try {
        length = path.getTotalLength();
      } catch {
        length = 0;
      }
      if (!length) continue;
      const ring: Ring = [];
      for (let i = 0; i < SHAPE_SAMPLES; i += 1) {
        const point = path.getPointAtLength((i / SHAPE_SAMPLES) * length);
        ring.push({ x: point.x, y: point.y });
      }
      rings.push(ring);
    }
    if (!rings.length) return null;
    return fit === 'viewbox' ? mapToViewBox(rings, viewBox) : normalizeRings(rings);
  }

  const numbers = trimmed.split(/[\s,]+/).map(Number).filter(value => !Number.isNaN(value));
  if (numbers.length < 6) return null;
  const ring: Ring = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    ring.push({ x: numbers[i], y: numbers[i + 1] });
  }
  return fit === 'viewbox' ? mapToViewBox([ring], viewBox) : normalizeRings([ring]);
}
