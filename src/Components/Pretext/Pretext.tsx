import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue, useScopedStyles } from '../utils/index';
import { normalizeFontFamilyCssValue, TextStyles } from '../utils/textStylesToCss';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const SHAPE_SAMPLES = 120;
const BAND_SAMPLES = 3;
/** Vertical slack taken off a line box before probing the shape, in line-height units. */
const BAND_SLACK = 0.12;
const MIN_FIT_SCALE = 0.25;
const FIT_ITERATIONS = 10;
const MAX_LINES = 4000;
const DROP_CAP_GAP = 0.12;
const DROP_CAP_SIZE_DEFAULT = 3;
/**
 * The vector node editor is portaled straight to `document.body` so its
 * anchors can be grabbed even where a host app's own selection/resize
 * chrome renders in a sibling stacking context above this component's own
 * box — no z-index set inside that box could ever reach past it.
 *
 * Keep this above the CMS article/editor stack (`.editor` is z-index 1,
 * `#component-portal` is 2) and below host UI chrome (toolbar 4, ItemParams
 * SnapBar container 5) so the orange outline never paints over panels.
 */
const EDITOR_PORTAL_Z_INDEX = 3;

export const SHAPE_IDS = [
  'rectangle',
  'ellipse',
  'circle',
  'triangle-up',
  'triangle-down',
  'diamond',
  'hourglass',
  'teardrop',
  'leaf',
  'wave',
  'custom',
] as const;

export type ShapeId = typeof SHAPE_IDS[number];

type Align = 'left' | 'center' | 'right' | 'justify';

type PathFit = 'stretch' | 'viewbox';

type RichLeaf = {
  text?: string;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  textTransform?: string;
  fontVariant?: string;
  verticalAlign?: string;
};

type RichLink = {
  type: 'link';
  value?: string;
  target?: string;
  children?: RichNode[];
};

type RichNode = RichLeaf | RichLink;

type RichBlock = {
  type?: string;
  children?: RichNode[];
};

type PretextContentItem = {
  text?: RichBlock[];
};

type PretextSettings = {
  shape?: ShapeId;
  customPath?: string;
  pathFit?: PathFit;
  pathViewBox?: string;
  pathSnap?: number;
  shapeMode?: 'A' | 'B';
  overflowMode?: 'clip' | 'visible';
  fitText?: 'on' | 'off';
  dropCap?: 'on' | 'off';
  dropCapLines?: number;
  dropCapSize?: number;
  image?: string | null;
  /** Focal point of the image within the shape's mask, 0..1 (like object-position). Defaults to center. */
  imageFocalX?: number;
  imageFocalY?: number;
  /** Extra zoom on top of the cover fit. 1 = just covers the mask. */
  imageScale?: number;
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  textFontFamily?: string;
  textFontSettings?: { fontWeight: number; fontStyle: string };
  textFontSize?: number;
  textLineHeight?: number;
  textLetterSpacing?: number;
  textWordSpacing?: number;
  textAlign?: Align;
  textTextAppearance?: TextStyles['textAppearance'];
};

type PretextProps = {
  settings?: PretextSettings;
  content?: PretextContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  isSelected?: boolean;
  onUpdateSettings?: (settings: PretextSettings) => void;
} & CommonComponentProps;

/* ------------------------------------------------------------------ *
 * Geometry — a shape is one or more normalized rings (0..1 of the box)
 * ------------------------------------------------------------------ */

type Pt = { x: number; y: number };
type Ring = Pt[];
type Span = { x0: number; x1: number };

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function ringsToPathPx(rings: Ring[], box: { width: number; height: number }): string {
  return rings
    .filter(ring => ring.length > 0)
    .map(ring => `M ${ring.map(point => `${point.x * box.width} ${point.y * box.height}`).join(' L ')} Z`)
    .join(' ');
}

function ringsBBoxPx(rings: Ring[], box: { width: number; height: number }): {
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

function ringOf(pairs: [number, number][]): Ring {
  return pairs.map(([x, y]) => ({ x, y }));
}

function sampleClosed(fn: (t: number) => Pt, count: number = SHAPE_SAMPLES): Ring {
  const ring: Ring = [];
  for (let i = 0; i < count; i += 1) {
    ring.push(fn(i / count));
  }
  return ring;
}

/** Stretches rings so their bounding box fills the unit box. */
function normalizeRings(rings: Ring[]): Ring[] {
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

function getPresetRings(shape: ShapeId, aspect: number): Ring[] {
  switch (shape) {
    case 'ellipse':
      return [sampleClosed((t) => {
        const a = t * Math.PI * 2;
        return { x: 0.5 + Math.cos(a) * 0.5, y: 0.5 + Math.sin(a) * 0.5 };
      })];
    case 'circle': {
      const rx = aspect >= 1 ? 0.5 / aspect : 0.5;
      const ry = aspect >= 1 ? 0.5 : 0.5 * aspect;
      return [sampleClosed((t) => {
        const a = t * Math.PI * 2;
        return { x: 0.5 + Math.cos(a) * rx, y: 0.5 + Math.sin(a) * ry };
      })];
    }
    case 'triangle-up':
      return [ringOf([[0.5, 0], [1, 1], [0, 1]])];
    case 'triangle-down':
      return [ringOf([[0, 0], [1, 0], [0.5, 1]])];
    case 'diamond':
      return [ringOf([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]])];
    case 'hourglass':
      return [ringOf([[0, 0], [1, 0], [0.56, 0.5], [1, 1], [0, 1], [0.44, 0.5]])];
    case 'teardrop':
      return normalizeRings([sampleClosed((t) => {
        const a = t * Math.PI * 2;
        const along = Math.cos(a);
        const across = Math.sin(a) * Math.pow(Math.sin(a / 2), 2);
        return { x: 0.5 + across * 0.5, y: 0.5 - along * 0.5 };
      })]);
    case 'leaf': {
      const half = Math.round(SHAPE_SAMPLES / 2);
      const ring: Ring = [];
      for (let i = 0; i <= half; i += 1) {
        const t = i / half;
        ring.push({ x: 0.5 + Math.sin(Math.PI * t) * 0.5, y: t });
      }
      for (let i = half; i >= 0; i -= 1) {
        const t = i / half;
        ring.push({ x: 0.5 - Math.sin(Math.PI * t) * 0.5, y: t });
      }
      return [ring];
    }
    case 'wave': {
      const waves = 2;
      const amplitude = 0.09;
      const steps = SHAPE_SAMPLES;
      const ring: Ring = [];
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        ring.push({ x: amplitude + Math.sin(Math.PI * 2 * waves * t) * amplitude, y: t });
      }
      for (let i = steps; i >= 0; i -= 1) {
        const t = i / steps;
        ring.push({ x: 1 - amplitude + Math.sin(Math.PI * 2 * waves * t + Math.PI / 3) * amplitude, y: t });
      }
      return [ring];
    }
    case 'rectangle':
    case 'custom':
    default:
      return [ringOf([[0, 0], [1, 0], [1, 1], [0, 1]])];
  }
}

type ViewBox = { x: number; y: number; width: number; height: number };

const DEFAULT_VIEW_BOX: ViewBox = { x: 0, y: 0, width: 100, height: 100 };

function parseViewBox(value?: string): ViewBox {
  const numbers = (value ?? '').trim().split(/[\s,]+/).map(Number).filter(entry => !Number.isNaN(entry));
  if (numbers.length < 4 || numbers[2] <= 0 || numbers[3] <= 0) return DEFAULT_VIEW_BOX;
  return { x: numbers[0], y: numbers[1], width: numbers[2], height: numbers[3] };
}

function mapToViewBox(rings: Ring[], viewBox: ViewBox): Ring[] {
  return rings.map(ring => ring.map(point => ({
    x: (point.x - viewBox.x) / viewBox.width,
    y: (point.y - viewBox.y) / viewBox.height,
  })));
}

/* ------------------------------------------------------------------ *
 * Vector path — the editable nodes behind the `d` string
 * ------------------------------------------------------------------ */

/** One anchor plus the two cubic handles meeting on it. `null` handle = straight. */
export type VecNode = {
  p: Pt;
  in?: Pt | null;
  out?: Pt | null;
};

export type VecContour = {
  nodes: VecNode[];
  closed: boolean;
};

type VecSegment = { from: VecNode; to: VecNode; index: number };

const CURVE_SAMPLES = 16;
/** Rings up to this many points keep every corner when they become nodes. */
const CORNER_RING_LIMIT = 12;
/** Nodes aimed for when a sampled preset is converted into an editable path. */
const EDIT_NODE_TARGET = 16;
/** Vector editing always happens in this coordinate space, so a drag is 1:1. */
export const EDIT_VIEW_BOX = '0 0 100 100';
const EDIT_SPAN = 100;

const PATH_COMMANDS = /([MmZzLlHhVvCcSsQqTtAa])([^MmZzLlHhVvCcSsQqTtAa]*)/g;
const PATH_NUMBERS = /[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;

function readNumbers(source: string): number[] {
  const found = source.match(PATH_NUMBERS);
  return found ? found.map(Number).filter(value => !Number.isNaN(value)) : [];
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function reflect(point: Pt, about: Pt): Pt {
  return { x: about.x * 2 - point.x, y: about.y * 2 - point.y };
}

function clonePoint(point: Pt): Pt {
  return { x: point.x, y: point.y };
}

function cloneNode(node: VecNode): VecNode {
  return {
    p: clonePoint(node.p),
    in: node.in ? clonePoint(node.in) : null,
    out: node.out ? clonePoint(node.out) : null,
  };
}

function cloneContours(contours: VecContour[]): VecContour[] {
  return contours.map(contour => ({ closed: contour.closed, nodes: contour.nodes.map(cloneNode) }));
}

export function mapContours(contours: VecContour[], transform: (point: Pt) => Pt): VecContour[] {
  return contours.map(contour => ({
    closed: contour.closed,
    nodes: contour.nodes.map(node => ({
      p: transform(node.p),
      in: node.in ? transform(node.in) : null,
      out: node.out ? transform(node.out) : null,
    })),
  }));
}

/** Uniform (or axis-independent) scale about `origin` — keeps proportions when sx === sy. */
export function scaleContours(contours: VecContour[], origin: Pt, scaleX: number, scaleY: number = scaleX): VecContour[] {
  return mapContours(contours, point => ({
    x: origin.x + (point.x - origin.x) * scaleX,
    y: origin.y + (point.y - origin.y) * scaleY,
  }));
}

/** Cubic arc → up to four cubic segments, so pasted SVGs keep their curves. */
function arcToCubics(
  from: Pt,
  radiusX: number,
  radiusY: number,
  rotation: number,
  largeArc: boolean,
  sweep: boolean,
  to: Pt,
): { c1: Pt; c2: Pt; p: Pt }[] {
  let rx = Math.abs(radiusX);
  let ry = Math.abs(radiusY);
  if (!rx || !ry || (from.x === to.x && from.y === to.y)) {
    return [{ c1: clonePoint(from), c2: clonePoint(to), p: clonePoint(to) }];
  }
  const phi = (rotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const halfDx = (from.x - to.x) / 2;
  const halfDy = (from.y - to.y) / 2;
  const x1 = cosPhi * halfDx + sinPhi * halfDy;
  const y1 = -sinPhi * halfDx + cosPhi * halfDy;
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rx *= scale;
    ry *= scale;
  }
  const sign = largeArc === sweep ? -1 : 1;
  const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const numerator = Math.max(0, rx * rx * ry * ry - denominator);
  const coefficient = denominator === 0 ? 0 : sign * Math.sqrt(numerator / denominator);
  const cx1 = (coefficient * rx * y1) / ry;
  const cy1 = (-coefficient * ry * x1) / rx;
  const cx = cosPhi * cx1 - sinPhi * cy1 + (from.x + to.x) / 2;
  const cy = sinPhi * cx1 + cosPhi * cy1 + (from.y + to.y) / 2;
  const startAngle = Math.atan2((y1 - cy1) / ry, (x1 - cx1) / rx);
  const endAngle = Math.atan2((-y1 - cy1) / ry, (-x1 - cx1) / rx);
  let sweepAngle = endAngle - startAngle;
  if (!sweep && sweepAngle > 0) sweepAngle -= Math.PI * 2;
  if (sweep && sweepAngle < 0) sweepAngle += Math.PI * 2;
  const steps = Math.max(1, Math.ceil(Math.abs(sweepAngle) / (Math.PI / 2)));
  const delta = sweepAngle / steps;
  const alpha = (4 / 3) * Math.tan(delta / 4);
  const onEllipse = (unitX: number, unitY: number): Pt => ({
    x: cx + cosPhi * rx * unitX - sinPhi * ry * unitY,
    y: cy + sinPhi * rx * unitX + cosPhi * ry * unitY,
  });
  const cubics: { c1: Pt; c2: Pt; p: Pt }[] = [];
  let angle = startAngle;
  for (let step = 0; step < steps; step += 1) {
    const next = angle + delta;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const cosB = Math.cos(next);
    const sinB = Math.sin(next);
    cubics.push({
      c1: onEllipse(cosA - alpha * sinA, sinA + alpha * cosA),
      c2: onEllipse(cosB + alpha * sinB, sinB - alpha * cosB),
      p: step === steps - 1 ? clonePoint(to) : onEllipse(cosB, sinB),
    });
    angle = next;
  }
  return cubics;
}

/**
 * SVG path string → editable contours. Every command is normalized to cubic
 * nodes, so what comes back can be dragged around and written out again.
 */
export function parsePathNodes(d: string): VecContour[] {
  const source = (d ?? '').trim();
  if (!source) return [];

  const contours: VecContour[] = [];
  let nodes: VecNode[] = [];
  let closed = false;
  let current: Pt = { x: 0, y: 0 };
  let subpathStart: Pt = { x: 0, y: 0 };
  let lastCubicControl: Pt | null = null;
  let lastQuadControl: Pt | null = null;

  const flush = () => {
    // A closed path that draws its way back to the start ends on a duplicate of
    // the first anchor. Fold it in, keeping the handle it arrived with.
    if (closed && nodes.length > 2) {
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (Math.abs(first.p.x - last.p.x) < 1e-6 && Math.abs(first.p.y - last.p.y) < 1e-6) {
        first.in = last.in ?? first.in;
        nodes.pop();
      }
    }
    if (nodes.length > 1) contours.push({ nodes, closed });
    nodes = [];
    closed = false;
  };
  const addNode = (point: Pt, inHandle?: Pt | null) => {
    nodes.push({ p: point, in: inHandle ?? null, out: null });
    current = point;
  };
  const setOut = (handle: Pt | null) => {
    if (nodes.length) nodes[nodes.length - 1].out = handle;
  };

  PATH_COMMANDS.lastIndex = 0;
  let match: RegExpExecArray | null = PATH_COMMANDS.exec(source);
  while (match !== null) {
    const command = match[1];
    const upper = command.toUpperCase();
    const relative = command !== upper;
    const args = readNumbers(match[2]);
    const at = (index: number): Pt => (
      relative
        ? { x: current.x + args[index], y: current.y + args[index + 1] }
        : { x: args[index], y: args[index + 1] }
    );

    if (upper === 'Z') {
      closed = true;
      flush();
      current = clonePoint(subpathStart);
      lastCubicControl = null;
      lastQuadControl = null;
    } else if (upper === 'M') {
      for (let i = 0; i + 1 < args.length; i += 2) {
        const point = at(i);
        if (i === 0) {
          flush();
          subpathStart = clonePoint(point);
        }
        addNode(point);
      }
      lastCubicControl = null;
      lastQuadControl = null;
    } else if (upper === 'L') {
      for (let i = 0; i + 1 < args.length; i += 2) addNode(at(i));
      lastCubicControl = null;
      lastQuadControl = null;
    } else if (upper === 'H') {
      for (const value of args) addNode({ x: relative ? current.x + value : value, y: current.y });
      lastCubicControl = null;
      lastQuadControl = null;
    } else if (upper === 'V') {
      for (const value of args) addNode({ x: current.x, y: relative ? current.y + value : value });
      lastCubicControl = null;
      lastQuadControl = null;
    } else if (upper === 'C') {
      for (let i = 0; i + 5 < args.length; i += 6) {
        const control1 = at(i);
        const control2 = at(i + 2);
        const end = at(i + 4);
        setOut(control1);
        addNode(end, control2);
        lastCubicControl = control2;
      }
      lastQuadControl = null;
    } else if (upper === 'S') {
      for (let i = 0; i + 3 < args.length; i += 4) {
        const control1: Pt = lastCubicControl ? reflect(lastCubicControl, current) : clonePoint(current);
        const control2 = at(i);
        const end = at(i + 2);
        setOut(control1);
        addNode(end, control2);
        lastCubicControl = control2;
      }
      lastQuadControl = null;
    } else if (upper === 'Q') {
      for (let i = 0; i + 3 < args.length; i += 4) {
        const control = at(i);
        const end = at(i + 2);
        setOut(lerp(current, control, 2 / 3));
        addNode(end, lerp(end, control, 2 / 3));
        lastQuadControl = control;
        lastCubicControl = null;
      }
    } else if (upper === 'T') {
      for (let i = 0; i + 1 < args.length; i += 2) {
        const control: Pt = lastQuadControl ? reflect(lastQuadControl, current) : clonePoint(current);
        const end = at(i);
        setOut(lerp(current, control, 2 / 3));
        addNode(end, lerp(end, control, 2 / 3));
        lastQuadControl = control;
        lastCubicControl = null;
      }
    } else if (upper === 'A') {
      for (let i = 0; i + 6 < args.length; i += 7) {
        const end = relative
          ? { x: current.x + args[i + 5], y: current.y + args[i + 6] }
          : { x: args[i + 5], y: args[i + 6] };
        for (const cubic of arcToCubics(current, args[i], args[i + 1], args[i + 2], args[i + 3] !== 0, args[i + 4] !== 0, end)) {
          setOut(cubic.c1);
          addNode(cubic.p, cubic.c2);
        }
        lastCubicControl = null;
        lastQuadControl = null;
      }
    }

    match = PATH_COMMANDS.exec(source);
  }
  flush();

  return contours;
}

function formatCoordinate(value: number): string {
  return `${Number(value.toFixed(2))}`;
}

function segmentIsStraight(from: VecNode, to: VecNode): boolean {
  return !from.out && !to.in;
}

function segmentCommand(from: VecNode, to: VecNode): string {
  if (segmentIsStraight(from, to)) {
    return `L${formatCoordinate(to.p.x)},${formatCoordinate(to.p.y)}`;
  }
  const control1 = from.out ?? from.p;
  const control2 = to.in ?? to.p;
  return `C${formatCoordinate(control1.x)},${formatCoordinate(control1.y)}`
    + ` ${formatCoordinate(control2.x)},${formatCoordinate(control2.y)}`
    + ` ${formatCoordinate(to.p.x)},${formatCoordinate(to.p.y)}`;
}

/** Contours → an SVG path string, which is what the setting stores. */
export function serializeContours(contours: VecContour[]): string {
  const parts: string[] = [];
  for (const contour of contours) {
    if (contour.nodes.length < 2) continue;
    const [first, ...rest] = contour.nodes;
    parts.push(`M${formatCoordinate(first.p.x)},${formatCoordinate(first.p.y)}`);
    let previous = first;
    for (const node of rest) {
      parts.push(segmentCommand(previous, node));
      previous = node;
    }
    if (contour.closed) {
      const closing = segmentCommand(previous, first);
      if (closing.charAt(0) === 'C') parts.push(closing);
      parts.push('Z');
    }
  }
  return parts.join(' ');
}

function contourSegments(contour: VecContour): VecSegment[] {
  const segments: VecSegment[] = [];
  for (let i = 0; i + 1 < contour.nodes.length; i += 1) {
    segments.push({ from: contour.nodes[i], to: contour.nodes[i + 1], index: i });
  }
  if (contour.closed && contour.nodes.length > 2) {
    const last = contour.nodes.length - 1;
    segments.push({ from: contour.nodes[last], to: contour.nodes[0], index: last });
  }
  return segments;
}

function pointOnSegment(from: VecNode, to: VecNode, t: number): Pt {
  if (segmentIsStraight(from, to)) return lerp(from.p, to.p, t);
  const control1 = from.out ?? from.p;
  const control2 = to.in ?? to.p;
  const inverse = 1 - t;
  const a = inverse * inverse * inverse;
  const b = 3 * inverse * inverse * t;
  const c = 3 * inverse * t * t;
  const d = t * t * t;
  return {
    x: a * from.p.x + b * control1.x + c * control2.x + d * to.p.x,
    y: a * from.p.y + b * control1.y + c * control2.y + d * to.p.y,
  };
}

/** Contours → polygon rings, the form the text layout reads. */
export function flattenContours(contours: VecContour[]): Ring[] {
  const rings: Ring[] = [];
  for (const contour of contours) {
    if (contour.nodes.length < 2) continue;
    const ring: Ring = [];
    for (const segment of contourSegments(contour)) {
      if (segmentIsStraight(segment.from, segment.to)) {
        ring.push(clonePoint(segment.from.p));
        continue;
      }
      for (let i = 0; i < CURVE_SAMPLES; i += 1) {
        ring.push(pointOnSegment(segment.from, segment.to, i / CURVE_SAMPLES));
      }
    }
    if (!contour.closed) ring.push(clonePoint(contour.nodes[contour.nodes.length - 1].p));
    if (ring.length > 2) rings.push(ring);
  }
  return rings;
}

/** Bounding box of the drawn outline (curves included), in path/viewBox units. */
function contoursBBox(contours: VecContour[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of flattenContours(contours)) {
    for (const point of ring) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
    }
  }
  return { minX, minY, maxX, maxY };
}

/** Centre of the drawn shape — the bbox the editor already puts on screen. */
function contoursCenter(contours: VecContour[]): Pt | null {
  const bbox = contoursBBox(contours);
  if (!isFinite(bbox.minX) || !isFinite(bbox.maxX) || !isFinite(bbox.minY) || !isFinite(bbox.maxY)) return null;
  return { x: (bbox.minX + bbox.maxX) / 2, y: (bbox.minY + bbox.maxY) / 2 };
}

/** Handles that make a point sit smoothly between its neighbours. */
function smoothHandles(previous: Pt, point: Pt, next: Pt): { in: Pt; out: Pt } {
  const tangent = { x: (next.x - previous.x) / 6, y: (next.y - previous.y) / 6 };
  return {
    in: { x: point.x - tangent.x, y: point.y - tangent.y },
    out: { x: point.x + tangent.x, y: point.y + tangent.y },
  };
}

/**
 * Sampled rings → contours, so any preset can be picked up and dragged.
 * Few points means a polygon: its corners are kept. Many points means a curve:
 * it is thinned out and smoothed back, which lands within a hair of the original.
 */
export function ringsToContours(rings: Ring[]): VecContour[] {
  return rings
    .filter(ring => ring.length > 2)
    .map((ring) => {
      if (ring.length <= CORNER_RING_LIMIT) {
        return { closed: true, nodes: ring.map(point => ({ p: clonePoint(point), in: null, out: null })) };
      }
      const step = Math.max(1, Math.round(ring.length / EDIT_NODE_TARGET));
      const points: Pt[] = [];
      for (let i = 0; i < ring.length; i += step) points.push(ring[i]);
      const count = points.length;
      return {
        closed: true,
        nodes: points.map((point, index) => ({
          p: clonePoint(point),
          ...smoothHandles(points[(index - 1 + count) % count], point, points[(index + 1) % count]),
        })),
      };
    });
}

/**
 * Where a newly picked preset should sit in path coordinates.
 * Reuses the previous path's drawn bbox so switching forms keeps size/position
 * (including after a stretch commit rematerialized the path into pixels).
 * Falls back to the full edit viewBox when there is no usable previous path.
 */
function editablePathTargetRect(previous?: {
  customPath?: string;
  pathFit?: string;
  pathViewBox?: string;
}): { x: number; y: number; width: number; height: number } {
  const full = { x: 0, y: 0, width: EDIT_SPAN, height: EDIT_SPAN };
  if (
    !previous
    || previous.pathFit !== 'viewbox'
    || previous.pathViewBox !== EDIT_VIEW_BOX
    || !previous.customPath
  ) {
    return full;
  }
  const contours = parsePathNodes(previous.customPath);
  if (!contours.length) return full;
  const bbox = contoursBBox(contours);
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  if (!isFinite(bbox.minX) || !isFinite(bbox.minY) || !(width > 0) || !(height > 0)) {
    return full;
  }
  return { x: bbox.minX, y: bbox.minY, width, height };
}

/**
 * True when path coords look like legacy rematerialized pixels (hundreds of
 * units), not a 0–100 edit path whose bezier handles only poke slightly out.
 */
function pathExceedsEditViewBox(contours: VecContour[], viewBox: ViewBox, pad = 1): boolean {
  if (!contours.length) return false;
  const bbox = contoursBBox(contours);
  if (!isFinite(bbox.minX) || !isFinite(bbox.maxX)) return false;
  // Curved presets (esp. wave) overshoot the edit viewBox by a few units via
  // smooth handles. Require ~half a viewBox of overflow so those aren't treated
  // as pixel-space paths and wrongly shrunk by boxWidth/viewBox.
  const padX = Math.max(pad, viewBox.width * 0.5);
  const padY = Math.max(pad, viewBox.height * 0.5);
  return bbox.minX < viewBox.x - padX
    || bbox.minY < viewBox.y - padY
    || bbox.maxX > viewBox.x + viewBox.width + padX
    || bbox.maxY > viewBox.y + viewBox.height + padY;
}

/** Scale contours so their drawn outline fits inside `rect` (uniform, centered). */
function fitContoursInRect(
  contours: VecContour[],
  rect: { x: number; y: number; width: number; height: number },
): VecContour[] {
  if (!contours.length) return contours;
  const bbox = contoursBBox(contours);
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  if (!(width > 0) || !(height > 0)) return contours;
  const inside = bbox.minX >= rect.x - 1e-6
    && bbox.minY >= rect.y - 1e-6
    && bbox.maxX <= rect.x + rect.width + 1e-6
    && bbox.maxY <= rect.y + rect.height + 1e-6;
  if (inside) return contours;
  const scale = Math.min(rect.width / width, rect.height / height);
  const originX = rect.x + (rect.width - width * scale) / 2;
  const originY = rect.y + (rect.height - height * scale) / 2;
  return mapContours(contours, point => ({
    x: originX + (point.x - bbox.minX) * scale,
    y: originY + (point.y - bbox.minY) * scale,
  }));
}

/** Turns a preset into the editable viewBox path the editor persists after a shape pick. */
export function settingsForEditablePreset(
  shape: ShapeId,
  aspect = 1,
  previous?: { customPath?: string; pathFit?: string; pathViewBox?: string },
): {
  shape: ShapeId;
  customPath: string;
  pathFit: 'viewbox';
  pathViewBox: string;
} {
  const target = editablePathTargetRect(previous);
  const rings = getPresetRings(shape === 'custom' ? 'rectangle' : shape, aspect);
  // Fit after mapping so curved-preset handle overshoot stays inside the target
  // (and the edit viewBox), avoiding false legacy-pixel migration.
  const contours = fitContoursInRect(
    mapContours(
      ringsToContours(rings),
      point => ({ x: point.x * target.width + target.x, y: point.y * target.height + target.y }),
    ),
    target,
  );
  return {
    // Keep the preset id so the settings dropdown reflects the pick; point
    // edits later flip to `custom` via writePath (move/scale keep the id).
    shape,
    customPath: serializeContours(contours),
    pathFit: 'viewbox',
    pathViewBox: EDIT_VIEW_BOX,
  };
}

function snapValue(value: number, step: number): number {
  return step > 0 ? Math.round(value / step) * step : value;
}

export function moveNodeTo(contours: VecContour[], contourIndex: number, nodeIndex: number, point: Pt): VecContour[] {
  const node = contours[contourIndex]?.nodes[nodeIndex];
  if (!node) return contours;
  const dx = point.x - node.p.x;
  const dy = point.y - node.p.y;
  const next = cloneContours(contours);
  const target = next[contourIndex].nodes[nodeIndex];
  target.p = { x: node.p.x + dx, y: node.p.y + dy };
  if (target.in) target.in = { x: target.in.x + dx, y: target.in.y + dy };
  if (target.out) target.out = { x: target.out.x + dx, y: target.out.y + dy };
  return next;
}

/** Translates a set of selected anchors (and their handles) together, leaving the rest of the shape fixed. */
export function moveSelectedNodesBy(
  contours: VecContour[],
  selection: { contour: number; node: number }[],
  dx: number,
  dy: number,
): VecContour[] {
  if (!selection.length) return contours;
  const next = cloneContours(contours);
  for (const { contour, node } of selection) {
    const target = next[contour]?.nodes[node];
    if (!target) continue;
    target.p = { x: target.p.x + dx, y: target.p.y + dy };
    if (target.in) target.in = { x: target.in.x + dx, y: target.in.y + dy };
    if (target.out) target.out = { x: target.out.x + dx, y: target.out.y + dy };
  }
  return next;
}

/** Removes several nodes at once — descending per contour so earlier removals don't shift later indices. */
export function removeContourNodes(
  contours: VecContour[],
  selection: { contour: number; node: number }[],
): VecContour[] {
  const byContour = new Map<number, number[]>();
  for (const { contour, node } of selection) {
    const nodes = byContour.get(contour) ?? [];
    nodes.push(node);
    byContour.set(contour, nodes);
  }
  let next = contours;
  byContour.forEach((nodeIndices, contourIndex) => {
    const sorted = [...nodeIndices].sort((a, b) => b - a);
    for (const nodeIndex of sorted) {
      next = removeContourNode(next, contourIndex, nodeIndex);
    }
  });
  return next;
}

export function setNodeHandle(
  contours: VecContour[],
  contourIndex: number,
  nodeIndex: number,
  which: 'in' | 'out',
  point: Pt,
  mirror: boolean,
): VecContour[] {
  const node = contours[contourIndex]?.nodes[nodeIndex];
  if (!node) return contours;
  const next = cloneContours(contours);
  const target = next[contourIndex].nodes[nodeIndex];
  target[which] = clonePoint(point);
  if (mirror) {
    const opposite = which === 'in' ? 'out' : 'in';
    target[opposite] = reflect(point, target.p);
  }
  return next;
}

/** Pulls a handle back into its anchor, straightening that side of the node. */
export function clearNodeHandle(
  contours: VecContour[],
  contourIndex: number,
  nodeIndex: number,
  which: 'in' | 'out',
): VecContour[] {
  const node = contours[contourIndex]?.nodes[nodeIndex];
  if (!node || !node[which]) return contours;
  const next = cloneContours(contours);
  next[contourIndex].nodes[nodeIndex][which] = null;
  return next;
}

/** Splits a segment at `t` (de Casteljau), so the new node sits on the curve. */
export function insertNodeOnSegment(
  contours: VecContour[],
  contourIndex: number,
  segmentIndex: number,
  t: number,
): { contours: VecContour[]; nodeIndex: number } {
  const contour = contours[contourIndex];
  if (!contour) return { contours, nodeIndex: -1 };
  const from = contour.nodes[segmentIndex];
  const to = contour.nodes[(segmentIndex + 1) % contour.nodes.length];
  if (!from || !to) return { contours, nodeIndex: -1 };

  const next = cloneContours(contours);
  const nodes = next[contourIndex].nodes;
  const insertAt = segmentIndex + 1;

  if (segmentIsStraight(from, to)) {
    nodes.splice(insertAt, 0, { p: lerp(from.p, to.p, t), in: null, out: null });
    return { contours: next, nodeIndex: insertAt };
  }

  const control1 = from.out ?? from.p;
  const control2 = to.in ?? to.p;
  const a = lerp(from.p, control1, t);
  const b = lerp(control1, control2, t);
  const c = lerp(control2, to.p, t);
  const d = lerp(a, b, t);
  const e = lerp(b, c, t);
  const middle = lerp(d, e, t);

  const followingIndex = (segmentIndex + 1) % contour.nodes.length;
  nodes[segmentIndex].out = a;
  nodes[followingIndex].in = c;
  nodes.splice(insertAt, 0, { p: middle, in: d, out: e });
  return { contours: next, nodeIndex: insertAt };
}

export function removeContourNode(contours: VecContour[], contourIndex: number, nodeIndex: number): VecContour[] {
  const contour = contours[contourIndex];
  if (!contour || contour.nodes.length <= 3) return contours;
  const next = cloneContours(contours);
  next[contourIndex].nodes.splice(nodeIndex, 1);
  return next;
}

/** Corner ⇄ smooth: drops both handles, or grows them from the neighbours. */
export function toggleNodeSmooth(contours: VecContour[], contourIndex: number, nodeIndex: number): VecContour[] {
  const contour = contours[contourIndex];
  const node = contour?.nodes[nodeIndex];
  if (!node) return contours;
  const next = cloneContours(contours);
  const target = next[contourIndex].nodes[nodeIndex];
  if (target.in || target.out) {
    target.in = null;
    target.out = null;
    return next;
  }
  const count = contour.nodes.length;
  const previous = contour.nodes[(nodeIndex - 1 + count) % count].p;
  const following = contour.nodes[(nodeIndex + 1) % count].p;
  const handles = smoothHandles(previous, target.p, following);
  target.in = handles.in;
  target.out = handles.out;
  return next;
}

function projectOnLine(point: Pt, a: Pt, b: Pt): { t: number; distance: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  const closest = { x: a.x + dx * t, y: a.y + dy * t };
  return { t, distance: Math.hypot(point.x - closest.x, point.y - closest.y) };
}

export function nearestSegmentHit(contours: VecContour[], point: Pt): {
  contour: number;
  segment: number;
  t: number;
  distance: number;
} | null {
  let best: { contour: number; segment: number; t: number; distance: number } | null = null;
  contours.forEach((contour, contourIndex) => {
    for (const segment of contourSegments(contour)) {
      const steps = segmentIsStraight(segment.from, segment.to) ? 1 : CURVE_SAMPLES;
      for (let i = 0; i < steps; i += 1) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        const hit = projectOnLine(point, pointOnSegment(segment.from, segment.to, t0), pointOnSegment(segment.from, segment.to, t1));
        if (!best || hit.distance < best.distance) {
          best = { contour: contourIndex, segment: segment.index, t: t0 + (t1 - t0) * hit.t, distance: hit.distance };
        }
      }
    }
  });
  return best;
}

/**
 * Every other anchor in the shape — what a dragged anchor can axis-align
 * with. Curve anchors count as targets and as draggers: an anchor carries its
 * handles with it, so lining one up on an axis slides the curve rather than
 * reshaping it. Handle tips stay out; those snap by angle, not by axis.
 */
function collectSnapTargets(contours: VecContour[], exclude: { contour: number; node: number }): Pt[] {
  const points: Pt[] = [];
  contours.forEach((contour, contourIndex) => {
    contour.nodes.forEach((node, nodeIndex) => {
      if (contourIndex === exclude.contour && nodeIndex === exclude.node) return;
      points.push(node.p);
    });
  });
  return points;
}

/** One coordinate a dragged point can land on, and what explains it. */
type AxisSnap = {
  value: number;
  /** Where the symmetry axis sits, when this candidate is about one. */
  axis: number | null;
  /** The point it was borrowed from: an alignment partner, or the one mirrored. */
  from: Pt | null;
};

/**
 * Everything one axis can offer a dragged point, in the order ties break:
 * the symmetry axes themselves, then the shape's other points, then those
 * points reflected across the axes. The reflections are what turn "aligned"
 * into "symmetric" — the perpendicular axis lines the pair up at the same
 * time, so landing on both puts the point exactly opposite its counterpart.
 */
function axisCandidates(points: Pt[], centers: number[], axis: 'x' | 'y'): AxisSnap[] {
  const axes = centers.filter((center, index) => (
    isFinite(center) && centers.findIndex(other => Math.abs(other - center) < 1e-6) === index
  ));
  const candidates: AxisSnap[] = axes.map(center => ({ value: center, axis: center, from: null }));
  for (const point of points) candidates.push({ value: point[axis], axis: null, from: point });
  for (const center of axes) {
    for (const point of points) candidates.push({ value: center * 2 - point[axis], axis: center, from: point });
  }
  return candidates;
}

/**
 * Nearest candidate on one axis, independent of the other axis — so a point
 * can align its X with another point's X (or Y with Y) no matter how far
 * apart they sit on the other axis, the way alignment guides work. Compared
 * in pixel space via `toPx`. Null when nothing is within `reach`.
 */
function nearestAxisSnap(candidates: AxisSnap[], target: Pt, axis: 'x' | 'y', toPx: (point: Pt) => Pt, reach: number): AxisSnap | null {
  const targetPx = toPx(target)[axis];
  let best: AxisSnap | null = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    // `toPx` is separable, so the off-axis half of the probe is free to be
    // the target's own — only the snapped axis is being measured.
    const probe = axis === 'x' ? { x: candidate.value, y: target.y } : { x: target.x, y: candidate.value };
    const distance = Math.abs(toPx(probe)[axis] - targetPx);
    if (distance > reach) continue;
    // Ties go to whichever came first, which is why the list is ordered.
    if (best && distance >= bestDistance) continue;
    best = candidate;
    bestDistance = distance;
  }
  return best;
}

/* ------------------------------------------------------------------ *
 * Smart snapping for curve points
 *
 * An anchor snaps by axis (above) whether or not it carries handles. A
 * bezier handle can't: its X and Y mean nothing on their own, only the ray
 * it makes with its anchor does. So handles snap by direction and length
 * instead — the tangent that keeps the node smooth, the 45° family, and the
 * opposite handle's length.
 * ------------------------------------------------------------------ */

/** Directions a dragged handle settles onto, on top of the smooth tangent. */
const HANDLE_ANGLE_STEP = Math.PI / 4;
/** How far off that ray a handle may sit and still snap onto it, in pixels. */
const HANDLE_ANGLE_REACH = 8;
/** ...and how far off in angle, so a short handle doesn't snap from anywhere. */
const HANDLE_ANGLE_LIMIT = Math.PI / 18;
/** Pixel gap that still reads as "the same length as the other handle". */
const HANDLE_LENGTH_REACH = 8;
/** How far past the points it explains a guide keeps drawing, in pixels. */
const GUIDE_OVERSHOOT = 24;

/**
 * A line painted while a snap is holding, in the editor's own pixel space.
 * Without it a snap that moved the point three pixels is indistinguishable
 * from a steady hand, and the user never learns the snaps are there.
 */
type SnapGuide = { kind: 'align' | 'angle' | 'center'; a: Pt; b: Pt };

const NO_GUIDES: SnapGuide[] = [];

function sameGuides(a: SnapGuide[], b: SnapGuide[]): boolean {
  return a.length === b.length && a.every((guide, index) => (
    guide.kind === b[index].kind
    && guide.a.x === b[index].a.x && guide.a.y === b[index].a.y
    && guide.b.x === b[index].b.x && guide.b.y === b[index].b.y
  ));
}

/** Wraps an angle into (-π, π], so two directions can be compared. */
function normalizeAngle(angle: number): number {
  const turn = Math.PI * 2;
  return ((angle + Math.PI) % turn + turn) % turn - Math.PI;
}

function unitVector(from: Pt, to: Pt): Pt | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) return null;
  return { x: dx / length, y: dy / length };
}

/** One alignment line, run past both ends so it reads as a guide, not a chord. */
function alignmentGuide(from: Pt, to: Pt): SnapGuide {
  const direction = unitVector(from, to);
  if (!direction) return { kind: 'align', a: from, b: to };
  return {
    kind: 'align',
    a: { x: from.x - direction.x * GUIDE_OVERSHOOT, y: from.y - direction.y * GUIDE_OVERSHOOT },
    b: { x: to.x + direction.x * GUIDE_OVERSHOOT, y: to.y + direction.y * GUIDE_OVERSHOOT },
  };
}

/** A symmetry axis, drawn right across the frame — what it stands for is the
 *  mirror, not the pair of points that happened to suggest it. */
function centreGuide(at: number, axis: 'x' | 'y', frame: { width: number; height: number }): SnapGuide {
  return axis === 'x'
    ? { kind: 'center', a: { x: at, y: 0 }, b: { x: at, y: frame.height } }
    : { kind: 'center', a: { x: 0, y: at }, b: { x: frame.width, y: at } };
}

function axisGuide(snap: AxisSnap, axis: 'x' | 'y', landingPx: Pt, frame: { width: number; height: number }, toPx: (point: Pt) => Pt): SnapGuide {
  if (snap.axis === null) return alignmentGuide(landingPx, toPx(snap.from ?? landingPx));
  const probe = axis === 'x' ? { x: snap.axis, y: 0 } : { x: 0, y: snap.axis };
  return centreGuide(toPx(probe)[axis], axis, frame);
}

/**
 * Lines for whichever axis snaps actually decided where the anchor landed.
 * Shift-locking an axis can override a snap, and a guide for an alignment
 * that isn't holding is worse than no guide at all.
 */
function axisGuides(
  landing: Pt,
  snapX: AxisSnap | null,
  snapY: AxisSnap | null,
  frame: { width: number; height: number },
  toPx: (point: Pt) => Pt,
): SnapGuide[] {
  const guides: SnapGuide[] = [];
  const landingPx = toPx(landing);
  if (snapX && landing.x === snapX.value) guides.push(axisGuide(snapX, 'x', landingPx, frame, toPx));
  if (snapY && landing.y === snapY.value) guides.push(axisGuide(snapY, 'y', landingPx, frame, toPx));
  return guides;
}

/**
 * The direction that keeps a node smooth: the continuation, through the
 * anchor, of whatever enters it from the handle's other side — the opposite
 * handle if the node has one, else the neighbour's control point on that
 * segment, else the neighbouring anchor itself when the segment is straight.
 * Snapping onto it is what lets a curve leave a straight edge, or a corner
 * become properly smooth, without eyeballing the angle. Pixel space, so the
 * snap follows what the user sees even on a stretched preset.
 */
function smoothTangent(
  contour: VecContour | undefined,
  nodeIndex: number,
  which: 'in' | 'out',
  toPx: (point: Pt) => Pt,
): Pt | null {
  const node = contour?.nodes[nodeIndex];
  if (!contour || !node) return null;
  const anchorPx = toPx(node.p);
  const opposite = which === 'in' ? node.out : node.in;
  if (opposite) return unitVector(toPx(opposite), anchorPx);
  const count = contour.nodes.length;
  const neighbourIndex = nodeIndex + (which === 'in' ? 1 : -1);
  if (!contour.closed && (neighbourIndex < 0 || neighbourIndex >= count)) return null;
  const neighbour = contour.nodes[(neighbourIndex + count) % count];
  if (!neighbour) return null;
  // With our own handle missing, the segment's tangent at this anchor runs
  // from the neighbour's control point — or from the neighbour itself when
  // that side has no handles either, i.e. a plain straight edge.
  const control = (which === 'in' ? neighbour.in : neighbour.out) ?? neighbour.p;
  return unitVector(toPx(control), anchorPx);
}

/**
 * Settles a dragged handle onto whichever smart target it is already close
 * to: the smooth tangent first — a curve that doesn't kink beats a round
 * angle — then the 45° family, which is where the horizontal and vertical
 * tangents that make circles and rounded corners come out clean live. Length
 * is decided separately, so a curve can be made symmetric with its other
 * handle without measuring. `lock` (shift) takes the nearest 45° step no
 * matter how far off it is. Empty guides mean nothing snapped.
 */
function snapHandlePoint(
  point: Pt,
  anchor: Pt,
  tangent: Pt | null,
  oppositeLength: number | null,
  lock: boolean,
  toPx: (point: Pt) => Pt,
  fromPx: (point: Pt) => Pt,
): { point: Pt; guides: SnapGuide[] } {
  const anchorPx = toPx(anchor);
  const pointPx = toPx(point);
  const dx = pointPx.x - anchorPx.x;
  const dy = pointPx.y - anchorPx.y;
  const length = Math.hypot(dx, dy);
  // A handle sitting on its anchor has no direction to snap.
  if (length < 1e-6) return { point, guides: NO_GUIDES };
  const angle = Math.atan2(dy, dx);
  const step = Math.round(angle / HANDLE_ANGLE_STEP) * HANDLE_ANGLE_STEP;

  let snappedAngle: number | null = lock ? step : null;
  let smooth = false;
  if (!lock) {
    const candidates: { angle: number; smooth: boolean }[] = [];
    if (tangent) candidates.push({ angle: Math.atan2(tangent.y, tangent.x), smooth: true });
    candidates.push({ angle: step, smooth: false });
    for (const candidate of candidates) {
      const delta = normalizeAngle(candidate.angle - angle);
      if (Math.abs(delta) > HANDLE_ANGLE_LIMIT) continue;
      // Perpendicular distance, not raw angle: a long handle has to be held
      // much straighter than a short one to read as "on the ray".
      if (Math.abs(Math.sin(delta)) * length > HANDLE_ANGLE_REACH) continue;
      snappedAngle = candidate.angle;
      smooth = candidate.smooth;
      break;
    }
  }

  const matchLength = oppositeLength !== null
    && oppositeLength > 0
    && Math.abs(length - oppositeLength) <= HANDLE_LENGTH_REACH;
  if (snappedAngle === null && !matchLength) return { point, guides: NO_GUIDES };

  const finalAngle = snappedAngle ?? angle;
  const finalLength = matchLength ? oppositeLength as number : length;
  const direction = { x: Math.cos(finalAngle), y: Math.sin(finalAngle) };
  // The guide runs past the handle, and back through the anchor whenever the
  // far side is part of what snapped — a smooth ray, or a matched length.
  const forward = finalLength + (snappedAngle === null ? 0 : GUIDE_OVERSHOOT);
  const back = matchLength ? finalLength : (smooth ? GUIDE_OVERSHOOT : 0);
  return {
    point: fromPx({ x: anchorPx.x + direction.x * finalLength, y: anchorPx.y + direction.y * finalLength }),
    guides: [{
      kind: 'angle',
      a: { x: anchorPx.x - direction.x * back, y: anchorPx.y - direction.y * back },
      b: { x: anchorPx.x + direction.x * forward, y: anchorPx.y + direction.y * forward },
    }],
  };
}

/**
 * Parses a user-authored path: either an SVG path (`M0,0 C…`, several subpaths
 * allowed — each becomes a ring, so overlaps read as holes) or a plain point
 * list (`0,0 100,0 50,100`). With `fit: 'stretch'` the drawing is stretched to
 * fill the text box; with `fit: 'viewbox'` it keeps its place inside the
 * declared coordinate space — which is what `avoid` mode needs.
 */
function parsePathSpec(spec: string, fit: PathFit = 'stretch', viewBox: ViewBox = DEFAULT_VIEW_BOX): Ring[] | null {
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

/** Inside intervals of the shape at one scanline, even-odd rule. */
function spansAtY(rings: Ring[], y: number): Span[] {
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

function subtractSpan(spans: Span[], hole: Span): Span[] {
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

/** Spans usable by a whole line box — conservative across the band. */
function spansForBand(rings: Ring[], yTop: number, yBottom: number, mode: 'contain' | 'avoid'): Span[] {
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

/* ------------------------------------------------------------------ *
 * Rich text
 * ------------------------------------------------------------------ */

type Token = {
  text: string;
  leaf: RichLeaf;
  href?: string;
  target?: string;
  para: number;
};

function isLinkNode(node: RichNode): node is RichLink {
  return !!node && typeof node === 'object' && (node as RichLink).type === 'link';
}

function tokenize(blocks: RichBlock[]): Token[] {
  const tokens: Token[] = [];
  blocks.forEach((block, para) => {
    const walk = (nodes: RichNode[], href?: string, target?: string) => {
      for (const node of nodes) {
        if (isLinkNode(node)) {
          walk(node.children ?? [], node.value, node.target);
          continue;
        }
        const leaf = node as RichLeaf;
        const text = leaf?.text ?? '';
        if (!text.trim()) continue;
        for (const word of text.split(/\s+/)) {
          if (!word) continue;
          tokens.push({ text: word, leaf, href, target, para });
        }
      }
    };
    walk(block?.children ?? []);
  });
  return tokens;
}

function getLeafCss(leaf: RichLeaf): React.CSSProperties {
  return {
    ...(leaf.fontFamily && { fontFamily: normalizeFontFamilyCssValue(leaf.fontFamily) }),
    ...(leaf.fontWeight && { fontWeight: leaf.fontWeight }),
    ...(leaf.fontStyle && { fontStyle: leaf.fontStyle }),
    ...(leaf.textDecoration && { textDecoration: leaf.textDecoration }),
    ...(leaf.textTransform && { textTransform: leaf.textTransform as React.CSSProperties['textTransform'] }),
    ...(leaf.fontVariant && { fontVariant: leaf.fontVariant }),
    ...(leaf.verticalAlign && { verticalAlign: leaf.verticalAlign as React.CSSProperties['verticalAlign'], lineHeight: '0px' }),
  };
}

function getPlainText(blocks: RichBlock[]): string[] {
  return blocks.map((block) => {
    const parts: string[] = [];
    const walk = (nodes: RichNode[]) => {
      for (const node of nodes) {
        if (isLinkNode(node)) {
          walk(node.children ?? []);
          continue;
        }
        parts.push((node as RichLeaf)?.text ?? '');
      }
    };
    walk(block?.children ?? []);
    return parts.join('');
  });
}

/* ------------------------------------------------------------------ *
 * Line breaking
 * ------------------------------------------------------------------ */

type Segment = {
  top: number;
  left: number;
  width: number;
  from: number;
  to: number;
  justify: boolean;
};

type LayoutResult = {
  segments: Segment[];
  placed: number;
  height: number;
  /** Where the drop cap has to sit — the start of the first line that has room. */
  capLeft: number;
  capTop: number;
};

type LayoutParams = {
  tokens: Token[];
  widths: number[];
  spaceWidth: number;
  lineHeight: number;
  width: number;
  height: number;
  rings: Ring[];
  mode: 'contain' | 'avoid';
  align: Align;
  scale: number;
  allowOverflow: boolean;
  capInset: number;
  capLines: number;
};

function layoutText(params: LayoutParams): LayoutResult {
  const {
    tokens, widths, rings, mode, align, scale,
    width, height, allowOverflow, capInset, capLines,
  } = params;
  const lineHeight = params.lineHeight * scale;
  const spaceWidth = params.spaceWidth * scale;
  const segments: Segment[] = [];

  if (!tokens.length || width <= 0 || lineHeight <= 0) {
    return { segments, placed: 0, height: 0, capLeft: 0, capTop: 0 };
  }

  const minSegment = Math.max(1, spaceWidth * 0.5);
  const slack = lineHeight * BAND_SLACK;
  let index = 0;
  let y = 0;
  let line = 0;
  let previousPara = tokens[0].para;
  let capLeft = 0;
  let capTop = 0;
  let capFirstLine: number | null = null;

  while (index < tokens.length && line < MAX_LINES) {
    const beyondShape = y + lineHeight > height;
    if (beyondShape && !allowOverflow) break;

    const para = tokens[index].para;
    // Empty paragraphs carry no tokens — keep them as blank lines.
    if (para > previousPara + 1) {
      y += lineHeight * (para - previousPara - 1);
      previousPara = para - 1;
      line += 1;
      continue;
    }

    let spans: Span[] = beyondShape
      ? [{ x0: 0, x1: width }]
      : spansForBand(rings, (y + slack) / height, (y + lineHeight - slack) / height, mode)
        .map(span => ({ x0: span.x0 * width, x1: span.x1 * width }));

    if (capInset > 0 && capLines > 0 && !beyondShape && spans.length) {
      if (capFirstLine === null) {
        capFirstLine = line;
        capLeft = spans[0].x0;
        capTop = y;
      }
      if (line - capFirstLine < capLines) {
        spans = subtractSpan(spans, { x0: capLeft, x1: capLeft + capInset });
      }
    }

    const widest = spans.reduce((max, span) => Math.max(max, span.x1 - span.x0), 0);

    for (const span of spans) {
      const available = span.x1 - span.x0;
      if (available < minSegment) continue;
      if (index >= tokens.length || tokens[index].para !== para) break;

      const start = index;
      let used = 0;
      while (index < tokens.length && tokens[index].para === para) {
        const tokenWidth = widths[index] * scale;
        const advance = index === start ? tokenWidth : spaceWidth + tokenWidth;
        if (used + advance > available) {
          // A word wider than the whole box can never fit — place it anyway so
          // the loop always makes progress.
          const unbreakable = index === start && available >= widest - 0.5 && tokenWidth > width - 0.5;
          if (!unbreakable) break;
        }
        used += advance;
        index += 1;
      }

      if (index > start) {
        const paragraphEnded = index >= tokens.length || tokens[index].para !== para;
        segments.push({
          top: y,
          left: span.x0,
          width: available,
          from: start,
          to: index,
          justify: align === 'justify' && !paragraphEnded,
        });
      }

      if (index >= tokens.length || tokens[index].para !== para) break;
    }

    previousPara = para;
    y += lineHeight;
    line += 1;
  }

  return { segments, placed: index, height: segments.length ? y : 0, capLeft, capTop };
}

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 1px;
  background-color: var(--${P}-background-color, transparent);
  color: var(--${P}-text-color, #000000);
}
.${P}-column {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
}
.${P}-shape-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
.${P}-flow {
  position: absolute;
  inset: 0;
}
.${P}-clip {
  overflow: hidden;
}
.${P}-line {
  position: absolute;
  white-space: pre;
  box-sizing: border-box;
}
.${P}-line-justify {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: baseline;
}
.${P}-link {
  color: var(--${P}-link-color, inherit);
  text-decoration: underline;
}
.${P}-drop-cap {
  position: absolute;
  top: 0;
  left: 0;
  white-space: pre;
  pointer-events: none;
}
.${P}-measure {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
  white-space: pre;
  width: max-content;
  --${P}-fit: 1;
}
.${P}-measure > span {
  display: inline-block;
}
.${P}-guides {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}
.${P}-guides polygon {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.${P}-editor {
  position: absolute;
  top: 0;
  left: 0;
  /* Sits above the editor's own interaction blocker, which is z-index 1. */
  z-index: 10;
  overflow: visible;
  /* Pass through to default item select/drag until a point is selected or
     the shape is double-clicked into move mode. Scale/anchor grabs stay live. */
  pointer-events: none;
  touch-action: none;
  outline: none;
}
.${P}-editor-armed {
  pointer-events: auto;
}
.${P}-editor-surface {
  fill: transparent;
  cursor: default;
  pointer-events: none;
}
.${P}-editor-armed .${P}-editor-surface {
  pointer-events: auto;
}
.${P}-editor-hit {
  fill: none;
  stroke: transparent;
  stroke-width: 16;
  pointer-events: none;
  cursor: copy;
}
.${P}-editor-armed .${P}-editor-hit {
  pointer-events: stroke;
}
.${P}-editor-grab {
  fill: transparent;
  stroke: none;
  pointer-events: auto;
  cursor: grab;
}
.${P}-editor-grab:active {
  cursor: grabbing;
}
.${P}-editor-outline {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  pointer-events: none;
}
.${P}-editor-body {
  fill: transparent;
  pointer-events: none;
  cursor: move;
}
.${P}-editor-armed .${P}-editor-body {
  pointer-events: fill;
}
.${P}-editor-body:active {
  cursor: grabbing;
}
.${P}-editor-bbox {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  stroke-dasharray: 4 3;
  opacity: 0.55;
  pointer-events: none;
}
.${P}-editor-scale {
  fill: #FFFFFF;
  stroke: #FF5C02;
  stroke-width: 1.5;
  pointer-events: none;
}
.${P}-editor-scale-grab {
  fill: transparent;
  stroke: none;
  pointer-events: auto;
  cursor: nwse-resize;
}
.${P}-editor-scale-grab-nesw {
  cursor: nesw-resize;
}
/* Snap feedback. Deliberately not the editor's orange: a guide has to be
   readable *through* the outline and handles it is drawn across. */
.${P}-editor-snap {
  stroke: #00B2FF;
  stroke-width: 1;
  pointer-events: none;
}
.${P}-editor-snap-angle {
  stroke-dasharray: 4 3;
}
/* A symmetry axis runs the whole frame, so it has to sit back further than
   an alignment line that only spans the two points it explains. */
.${P}-editor-snap-center {
  stroke-dasharray: 2 4;
  opacity: 0.8;
}
.${P}-editor-handle-line {
  stroke: #FF5C02;
  stroke-width: 1;
  opacity: 0.5;
  pointer-events: none;
}
.${P}-editor-handle {
  fill: #FF5C02;
  stroke: #FFFFFF;
  stroke-width: 1;
  pointer-events: none;
}
.${P}-editor-anchor {
  fill: #FFFFFF;
  stroke: #FF5C02;
  stroke-width: 1.5;
  pointer-events: none;
}
.${P}-editor-anchor-selected {
  fill: #FF5C02;
}
/* The part of the photo the mask crops away, shown while the image is armed.
   Dimmed rather than desaturated on purpose: a filter would be re-rasterized
   every frame of a pan drag, and dimming is what a crop UI reads as anyway. */
.${P}-editor-ghost {
  opacity: 0.3;
  pointer-events: none;
}
.${P}-editor-image-bounds {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  opacity: 0.7;
  pointer-events: none;
}
.${P}-a11y {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
`;
}

/* ------------------------------------------------------------------ *
 * Path editor — drag the vectors on the canvas
 * ------------------------------------------------------------------ */

const ANCHOR_SIZE = 7;
const HANDLE_RADIUS = 3.5;
/** Invisible grab radius around a point, so it can be caught without aiming. */
const GRAB_RADIUS = 9;
/** Visible size of a uniform-scale corner handle. */
const SCALE_HANDLE_SIZE = 8;
/** Invisible grab around a scale corner, so it can be caught without aiming. */
const SCALE_GRAB_SIZE = 14;
/** Push scale handles outside the bbox so they don't cover corner anchors. */
const SCALE_HANDLE_OUTSET = 10;
/** How far from the outline a click still adds a point, in pixels. */
const ADD_POINT_REACH = 24;
/** Catch radius for snapping a dragged anchor/handle onto another node's anchor or handle, in pixels. */
const NODE_SNAP_REACH = 14;
/** Pointer travel below this (px) still counts as a click — used so ⌘/Ctrl+click can
 *  toggle node type without a sub-pixel jitter counting as a free-move drag. */
const CLICK_SLOP_PX = 4;
/** Nudge step for arrow keys, in path units. */
const NUDGE_STEP = 1;
/** Smallest allowed uniform scale while dragging a corner (avoids collapse). */
const MIN_SHAPE_SCALE = 0.05;
/** Keyboard +/- scale factor about the shape's center. */
const KEYBOARD_SCALE_STEP = 1.08;

type PathSelection = { contour: number; node: number };

type PathDrag = {
  kind: 'anchor' | 'in' | 'out';
  contour: number;
  node: number;
  pointerId: number;
  origin: Pt;
  /** Screen position at pointer-down — click vs drag is decided in pixels, not path space. */
  clientOrigin: Pt;
  anchor: Pt;
  /** The shape's centre when the drag began — its axis of symmetry, held still
   *  so the point being dragged can't drag the axis along with it. */
  center: Pt | null;
  mirror: boolean;
  /** ⌘/Ctrl was down at pointer-down: switch the node's type if it never moves. */
  toggleOnRelease: boolean;
  moved: boolean;
};

/** Dragging the shape's body translates every contour together, clamped to `box`. */
type ShapeDrag = {
  pointerId: number;
  origin: Pt;
  startContours: VecContour[];
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
  moved: boolean;
};

/** Dragging one anchor of a multi-point selection translates the whole selection together. */
type GroupDrag = {
  pointerId: number;
  origin: Pt;
  startContours: VecContour[];
  selection: PathSelection[];
  moved: boolean;
};

type ScaleCorner = 'nw' | 'ne' | 'se' | 'sw';

/** Dragging a bbox corner scales every contour about the opposite corner. */
type ShapeScale = {
  pointerId: number;
  corner: ScaleCorner;
  origin: Pt;
  /** Distance from origin to the dragged corner at pointer-down — scale = current / start. */
  startDistance: number;
  startContours: VecContour[];
  moved: boolean;
};

function bboxCorner(
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  corner: ScaleCorner,
): Pt {
  switch (corner) {
    case 'nw': return { x: bbox.minX, y: bbox.minY };
    case 'ne': return { x: bbox.maxX, y: bbox.minY };
    case 'se': return { x: bbox.maxX, y: bbox.maxY };
    case 'sw': return { x: bbox.minX, y: bbox.maxY };
  }
}

function oppositeScaleCorner(corner: ScaleCorner): ScaleCorner {
  switch (corner) {
    case 'nw': return 'se';
    case 'ne': return 'sw';
    case 'se': return 'nw';
    case 'sw': return 'ne';
  }
}

/** Bbox corner pushed outward — keeps scale grabs clear of path anchors. */
function scaleHandlePoint(
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  corner: ScaleCorner,
): Pt {
  const point = bboxCorner(bbox, corner);
  const outwardX = corner === 'nw' || corner === 'sw' ? -1 : 1;
  const outwardY = corner === 'nw' || corner === 'ne' ? -1 : 1;
  return {
    x: point.x + outwardX * SCALE_HANDLE_OUTSET,
    y: point.y + outwardY * SCALE_HANDLE_OUTSET,
  };
}

type PathChangeOptions = {
  /**
   * Set by the whole-shape body drag, which moves the mask and the photo as one
   * piece. `focalX`/`focalY`/`scale` are relative to the mask bbox's *size*, so
   * a pure translation already carries the photo along for free — this flag
   * just tells the column to stand down the machinery that otherwise pins the
   * photo in place while the mask slides over it.
   *
   * Left unset by the gestures that should still re-crop rather than move:
   * node drags, whole-shape scale, and keyboard nudge/scale.
   */
  carryImage?: boolean;
};

type PathCommitOptions = {
  /** Whole-shape move/scale keeps the preset id; point edits diverge to `custom`. */
  preserveShape?: boolean;
};

/* ------------------------------------------------------------------ *
 * Shape-image geometry — an image panned/zoomed independently of the
 * mask it's clipped to, in the mask bbox's own pixel space.
 * ------------------------------------------------------------------ */

/** Extra zoom on top of cover. 1 = just covers; below 1 letterboxes inside the mask. */
const MIN_IMAGE_SCALE = 0.1;
const MAX_IMAGE_SCALE = 8;
/**
 * Below this much |slack| (px), an axis is pinned centered instead of panned.
 * At scale 1 one axis is *always* exactly flush with the mask (zero slack,
 * by construction of the cover fit) — dividing a pointer offset by a span
 * that thin amplifies ordinary sub-pixel pointer noise into 0↔1 swings.
 */
const MIN_PANNABLE_SLACK = 4;

type ImageTransform = { focalX: number; focalY: number; scale: number };

/** Smallest uniform scale that makes the image cover `bounds` (like background-size: cover). */
function coverScale(bounds: { width: number; height: number }, natural: { width: number; height: number }): number {
  if (!(natural.width > 0) || !(natural.height > 0) || !(bounds.width > 0) || !(bounds.height > 0)) return 1;
  return Math.max(bounds.width / natural.width, bounds.height / natural.height);
}

/** Rendered image size at a given zoom, before it's positioned. */
function coveredImageSize(
  bounds: { width: number; height: number },
  natural: { width: number; height: number },
  scale: number,
): { width: number; height: number } {
  const factor = coverScale(bounds, natural) * scale;
  return { width: natural.width * factor, height: natural.height * factor };
}

/**
 * Image's top-left in `bounds`-local px, from a focal point (0..1, like
 * `object-position`: 0 = image's edge flush with the mask's near edge, 1 =
 * flush with the far edge). Works for both cover (image larger) and contain
 * (image smaller) — `boundsSize - renderedSize` flips sign either way.
 */
function imageOffsetFromFocal(
  boundsSize: number,
  renderedSize: number,
  focal: number,
): number {
  return (boundsSize - renderedSize) * focal;
}

/** Inverse of `imageOffsetFromFocal`. */
function focalFromImageOffset(boundsSize: number, renderedSize: number, offset: number): number {
  const span = boundsSize - renderedSize;
  if (Math.abs(span) < MIN_PANNABLE_SLACK) return 0.5;
  return clamp01(offset / span);
}

/**
 * Keep the image's box-absolute size and placement when the shape mask bbox
 * changes (path-point edits). `imageScale` is extra zoom on top of cover, so a
 * new cover fit would otherwise resize the photo with the mask.
 */
function preserveImageTransformAcrossBoundsChange(
  prevBounds: { x: number; y: number; width: number; height: number },
  nextBounds: { x: number; y: number; width: number; height: number },
  natural: { width: number; height: number },
  focalX: number,
  focalY: number,
  scale: number,
): ImageTransform {
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
}

type EditStage = 'none' | 'shape' | 'image';

type PathEditorProps = {
  P: string;
  box: { width: number; height: number };
  viewBox: ViewBox;
  contours: VecContour[];
  snap: number;
  /** When true, map the edit viewBox across the full component box (presets). */
  stretchToBox: boolean;
  /** Shape and image editing are mutually exclusive; the host (PretextColumn) owns the cycle. */
  stage: EditStage;
  onStageChange: (stage: EditStage) => void;
  /** Lifts the node selection up to the column, which owns the double-click cycle. */
  onSelectionChange?: (hasSelection: boolean) => void;
  onChange: (contours: VecContour[], options?: PathChangeOptions) => void;
  onCommit: (contours: VecContour[], options?: PathCommitOptions) => void;
};

function PretextPathEditor({ P, box, viewBox, contours, snap, stretchToBox, stage, onStageChange, onSelectionChange, onChange, onCommit }: PathEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const bodyPathRef = useRef<SVGPathElement | null>(null);
  const contoursRef = useRef(contours);
  contoursRef.current = contours;
  const dragRef = useRef<PathDrag | null>(null);
  const shapeDragRef = useRef<ShapeDrag | null>(null);
  const shapeScaleRef = useRef<ShapeScale | null>(null);
  const groupDragRef = useRef<GroupDrag | null>(null);
  /** Multiple nodes at once — shift-click adds/removes a node from this set. */
  const [selection, setSelection] = useState<PathSelection[]>([]);
  /** Lines for the snap currently holding, in this editor's px space. */
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>(NO_GUIDES);
  // Guides are recomputed on every pointer move but only change on the frames
  // a snap starts or stops, so bail out of the identical ones.
  const showSnapGuides = useCallback((next: SnapGuide[]) => {
    setSnapGuides(current => (sameGuides(current, next) ? current : next));
  }, []);
  const shapeArmed = stage === 'shape';

  // Move keyboard focus onto this editor whenever the host arms shape editing,
  // so Escape/+-/arrow keys land here without a separate click.
  useEffect(() => {
    if (shapeArmed) svgRef.current?.focus({ preventScroll: true });
  }, [shapeArmed]);

  // Handing the stage to the image editor (or dropping out entirely) has to
  // drop the node selection too: `armed` ORs the selection in, so a point left
  // selected from the shape pass would keep anchors, handles and the outline
  // painted on top of the image the user just stepped into. Keyed on the
  // transition only, so the selection `insertNode` sets from a near-outline
  // click — which lands after the surface has already set the stage to 'none'
  // — still re-arms the editor the way it does today.
  useEffect(() => {
    if (!shapeArmed) setSelection(current => (current.length ? [] : current));
  }, [shapeArmed]);

  const hasSelection = selection.length > 0;
  useEffect(() => {
    onSelectionChange?.(hasSelection);
  }, [hasSelection, onSelectionChange]);
  // Unmounting with a point still selected would strand the column's flag on.
  useEffect(() => () => onSelectionChange?.(false), [onSelectionChange]);

  const scaleX = viewBox.width > 0 ? box.width / viewBox.width : 1;
  const scaleY = viewBox.height > 0 ? box.height / viewBox.height : 1;

  // Pinned custom paths: 1 viewBox unit = 1 px. Presets stretch the edit
  // space across the full component so handles track the text shape.
  const toPx = useCallback((point: Pt): Pt => (
    stretchToBox
      ? {
        x: (point.x - viewBox.x) * scaleX,
        y: (point.y - viewBox.y) * scaleY,
      }
      : {
        x: point.x - viewBox.x,
        y: point.y - viewBox.y,
      }
  ), [stretchToBox, viewBox, scaleX, scaleY]);

  const fromPx = useCallback((point: Pt): Pt => (
    stretchToBox
      ? {
        x: viewBox.x + (scaleX > 0 ? point.x / scaleX : 0),
        y: viewBox.y + (scaleY > 0 ? point.y / scaleY : 0),
      }
      : {
        x: viewBox.x + point.x,
        y: viewBox.y + point.y,
      }
  ), [stretchToBox, viewBox, scaleX, scaleY]);

  const frameCenter = useMemo(() => fromPx({ x: box.width / 2, y: box.height / 2 }), [fromPx, box.width, box.height]);

  const toPath = useCallback((clientX: number, clientY: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    if (stretchToBox) {
      return {
        x: viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.width,
        y: viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.height,
      };
    }
    return {
      x: viewBox.x + (clientX - rect.left),
      y: viewBox.y + (clientY - rect.top),
    };
  }, [stretchToBox, viewBox]);

  // Same as toPath, but into this editor's own pixel space (its viewBox is the
  // box's own width/height) — what the outline is drawn in and what the
  // pointer-distance check below needs, so it agrees with the `+` cursor.
  const toLocalPx = useCallback((clientX: number, clientY: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * box.width,
      y: ((clientY - rect.top) / rect.height) * box.height,
    };
  }, [box.width, box.height]);

  // Keep path coords in viewBox space (0–100) so top/left stay proportional
  // when the component box scales with the article — never rematerialize to px.
  const commitContours = useCallback((next: VecContour[], options?: PathCommitOptions) => {
    onCommit(next, options);
  }, [onCommit]);

  // The pointer is captured by the overlay for the whole drag, so the move and
  // release land here whatever they pass over — and stay off the editor around
  // us. Window listeners could not do both: swallowing the release to keep the
  // canvas out of it also kept it from ever reaching the window.
  const onPointerMove = (event: React.PointerEvent) => {
    // ⌘/Ctrl suspends snapping for as long as it's held — for the times a
    // point belongs a hair off the alignment the editor keeps offering. It
    // takes the grid with it: "free" has to mean free, or the user is still
    // fighting something. Shift's constraints are asked for outright, so they
    // go on working alongside it. Read live off the move rather than latched
    // at pointer-down, so it can be pressed and released mid-drag.
    const freeDrag = event.metaKey || event.ctrlKey;
    const shapeScale = shapeScaleRef.current;
    if (shapeScale && event.pointerId === shapeScale.pointerId) {
      event.stopPropagation();
      event.preventDefault();
      if (shapeScale.startDistance <= 0) return;
      const point = toPath(event.clientX, event.clientY);
      const distance = Math.hypot(point.x - shapeScale.origin.x, point.y - shapeScale.origin.y);
      const nextScale = Math.max(MIN_SHAPE_SCALE, distance / shapeScale.startDistance);
      if (!shapeScale.moved && Math.abs(nextScale - 1) < 1e-4) return;
      shapeScale.moved = true;
      onChange(scaleContours(shapeScale.startContours, shapeScale.origin, nextScale));
      return;
    }
    const shapeDrag = shapeDragRef.current;
    if (shapeDrag && event.pointerId === shapeDrag.pointerId) {
      event.stopPropagation();
      event.preventDefault();
      const point = toPath(event.clientX, event.clientY);
      // Clamp so the shape's own bounding box never moves fully clear of
      // `box` — smaller than the box, it's confined inside it; larger, it's
      // confined to always keep the box covered (same formula either way).
      const { bbox } = shapeDrag;
      const bboxWidth = bbox.maxX - bbox.minX;
      const bboxHeight = bbox.maxY - bbox.minY;
      const rawDx = point.x - shapeDrag.origin.x;
      const rawDy = point.y - shapeDrag.origin.y;
      // A too-thin contour (fewer than 3 drawn points) has no finite bbox to
      // clamp against — move it unclamped rather than stick it at NaN.
      let dx = rawDx;
      let dy = rawDy;
      if (isFinite(bboxWidth) && isFinite(bboxHeight)) {
        if (stretchToBox) {
          const lowX = Math.min(viewBox.x, viewBox.x + viewBox.width - bboxWidth);
          const highX = Math.max(viewBox.x, viewBox.x + viewBox.width - bboxWidth);
          const lowY = Math.min(viewBox.y, viewBox.y + viewBox.height - bboxHeight);
          const highY = Math.max(viewBox.y, viewBox.y + viewBox.height - bboxHeight);
          const clampedMinX = Math.min(highX, Math.max(lowX, bbox.minX + rawDx));
          const clampedMinY = Math.min(highY, Math.max(lowY, bbox.minY + rawDy));
          dx = clampedMinX - bbox.minX;
          dy = clampedMinY - bbox.minY;
        } else {
          const pxMinX = bbox.minX - viewBox.x;
          const pxMinY = bbox.minY - viewBox.y;
          const lowX = Math.min(0, box.width - bboxWidth);
          const highX = Math.max(0, box.width - bboxWidth);
          const lowY = Math.min(0, box.height - bboxHeight);
          const highY = Math.max(0, box.height - bboxHeight);
          const clampedMinX = Math.min(highX, Math.max(lowX, pxMinX + rawDx));
          const clampedMinY = Math.min(highY, Math.max(lowY, pxMinY + rawDy));
          dx = clampedMinX - pxMinX;
          dy = clampedMinY - pxMinY;
        }
      }
      // The same centre snap the points get, one level up: the shape's own
      // middle settles onto the frame's, so it can be centred by eye without
      // the result being off by a pixel. Per axis, so it can be centred
      // horizontally while sitting wherever it likes vertically.
      const guides: SnapGuide[] = [];
      if (!freeDrag && isFinite(bboxWidth) && isFinite(bboxHeight)) {
        // Where the shape's middle would land, against where the frame's is.
        const centerPx = toPx({ x: bbox.minX + bboxWidth / 2 + dx, y: bbox.minY + bboxHeight / 2 + dy });
        const framePx = { x: box.width / 2, y: box.height / 2 };
        if (Math.abs(centerPx.x - framePx.x) <= NODE_SNAP_REACH) {
          dx = frameCenter.x - bbox.minX - bboxWidth / 2;
          guides.push(centreGuide(framePx.x, 'x', box));
        }
        if (Math.abs(centerPx.y - framePx.y) <= NODE_SNAP_REACH) {
          dy = frameCenter.y - bbox.minY - bboxHeight / 2;
          guides.push(centreGuide(framePx.y, 'y', box));
        }
      }
      if (!shapeDrag.moved && dx === 0 && dy === 0) return;
      shapeDrag.moved = true;
      showSnapGuides(guides.length ? guides : NO_GUIDES);
      onChange(
        mapContours(shapeDrag.startContours, p => ({ x: p.x + dx, y: p.y + dy })),
        { carryImage: true },
      );
      return;
    }
    const groupDrag = groupDragRef.current;
    if (groupDrag && event.pointerId === groupDrag.pointerId) {
      event.stopPropagation();
      event.preventDefault();
      const point = toPath(event.clientX, event.clientY);
      let dx = point.x - groupDrag.origin.x;
      let dy = point.y - groupDrag.origin.y;
      if (event.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      if (!groupDrag.moved && dx === 0 && dy === 0) return;
      groupDrag.moved = true;
      onChange(moveSelectedNodesBy(groupDrag.startContours, groupDrag.selection, dx, dy));
      return;
    }
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.stopPropagation();
    event.preventDefault();
    const point = toPath(event.clientX, event.clientY);
    if (drag.kind === 'anchor') {
      // Snap where the *anchor* would land, not where the pointer is: the grab
      // radius puts the two a few pixels apart, so aligning the pointer leaves
      // the point itself that far out of line.
      const raw = {
        x: drag.anchor.x + (point.x - drag.origin.x),
        y: drag.anchor.y + (point.y - drag.origin.y),
      };
      const targets = freeDrag ? [] : collectSnapTargets(contoursRef.current, { contour: drag.contour, node: drag.node });
      // Symmetry axis for a dragged point is the shape's own centre (latched at
      // pointer-down so moving the point can't drag the axis with it). Frame
      // centering is handled by whole-shape drag — offering both here draws
      // identical centre guides at two places whenever the shape is off-centre.
      const centers = freeDrag || !drag.center ? [] : [drag.center];
      const snapX = nearestAxisSnap(axisCandidates(targets, centers.map(center => center.x), 'x'), raw, 'x', toPx, NODE_SNAP_REACH);
      const snapY = nearestAxisSnap(axisCandidates(targets, centers.map(center => center.y), 'y'), raw, 'y', toPx, NODE_SNAP_REACH);
      const landing = freeDrag
        ? raw
        : {
          x: snapX?.value ?? snapValue(raw.x, snap),
          y: snapY?.value ?? snapValue(raw.y, snap),
        };
      if (event.shiftKey) {
        if (Math.abs(landing.x - drag.anchor.x) > Math.abs(landing.y - drag.anchor.y)) landing.y = drag.anchor.y;
        else landing.x = drag.anchor.x;
      }
      // A click that never travels selects and nothing more.
      if (!drag.moved && landing.x === drag.anchor.x && landing.y === drag.anchor.y) return;
      drag.moved = true;
      showSnapGuides(axisGuides(landing, snapX, snapY, box, toPx));
      onChange(moveNodeTo(contoursRef.current, drag.contour, drag.node, landing));
      return;
    }
    // A handle's X and Y mean nothing on their own, so it snaps by the ray it
    // makes with its anchor instead: the smooth tangent, the 45° family, and
    // the opposite handle's length. Only when none of those catch does it fall
    // back to the coordinate grid.
    const node = contoursRef.current[drag.contour]?.nodes[drag.node];
    const mirroring = drag.mirror && !event.altKey;
    // A mirrored opposite is a reflection of the handle being dragged: it is
    // collinear and equal-length by construction, so offering it as a target
    // would only snap the handle onto where it already is.
    const opposite = mirroring || freeDrag ? null : (drag.kind === 'in' ? node?.out : node?.in);
    const anchorPx = node ? toPx(node.p) : null;
    const oppositePx = opposite ? toPx(opposite) : null;
    // Under ⌘/Ctrl the only thing left is shift's outright 45° lock, so skip
    // the search entirely unless shift is down — every target it could offer
    // has just been withdrawn.
    const smart = node && (!freeDrag || event.shiftKey)
      ? snapHandlePoint(
        point,
        node.p,
        mirroring || freeDrag ? null : smoothTangent(contoursRef.current[drag.contour], drag.node, drag.kind, toPx),
        anchorPx && oppositePx ? Math.hypot(oppositePx.x - anchorPx.x, oppositePx.y - anchorPx.y) : null,
        event.shiftKey,
        toPx,
        fromPx,
      )
      : { point, guides: NO_GUIDES };
    const landing = smart.guides.length
      ? smart.point
      : (freeDrag ? point : { x: snapValue(point.x, snap), y: snapValue(point.y, snap) });
    const current = drag.kind === 'in' ? node?.in : node?.out;
    // A click that never travels leaves the handle alone, same as an anchor.
    if (!drag.moved && current && landing.x === current.x && landing.y === current.y) return;
    drag.moved = true;
    showSnapGuides(smart.guides);
    onChange(setNodeHandle(contoursRef.current, drag.contour, drag.node, drag.kind, landing, mirroring));
  };

  const endDrag = (event: React.PointerEvent) => {
    showSnapGuides(NO_GUIDES);
    const shapeScale = shapeScaleRef.current;
    if (shapeScale && event.pointerId === shapeScale.pointerId) {
      shapeScaleRef.current = null;
      event.stopPropagation();
      const svg = svgRef.current;
      if (svg?.hasPointerCapture(shapeScale.pointerId)) svg.releasePointerCapture(shapeScale.pointerId);
      if (shapeScale.moved) commitContours(contoursRef.current, { preserveShape: true });
      return;
    }
    const shapeDrag = shapeDragRef.current;
    if (shapeDrag && event.pointerId === shapeDrag.pointerId) {
      shapeDragRef.current = null;
      event.stopPropagation();
      const svg = svgRef.current;
      if (svg?.hasPointerCapture(shapeDrag.pointerId)) svg.releasePointerCapture(shapeDrag.pointerId);
      if (shapeDrag.moved) {
        commitContours(contoursRef.current, { preserveShape: true });
      } else {
        // A click that never travels deselects the point, same as the surface.
        setSelection([]);
      }
      return;
    }
    const groupDrag = groupDragRef.current;
    if (groupDrag && event.pointerId === groupDrag.pointerId) {
      groupDragRef.current = null;
      event.stopPropagation();
      const svg = svgRef.current;
      if (svg?.hasPointerCapture(groupDrag.pointerId)) svg.releasePointerCapture(groupDrag.pointerId);
      if (groupDrag.moved) commitContours(contoursRef.current);
      return;
    }
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    event.stopPropagation();
    const svg = svgRef.current;
    if (svg?.hasPointerCapture(drag.pointerId)) svg.releasePointerCapture(drag.pointerId);
    const clientTravel = Math.hypot(event.clientX - drag.clientOrigin.x, event.clientY - drag.clientOrigin.y);
    // Path-space `moved` can stay false when Control+drag on macOS loses capture
    // before any pointermove (context-menu gesture). Screen travel still means
    // this was a drag — only a real unmoved pointerup may toggle type.
    const travelled = drag.moved || clientTravel > CLICK_SLOP_PX;
    if (travelled) {
      if (drag.moved) commitContours(contoursRef.current);
      return;
    }
    if (!drag.toggleOnRelease || event.type !== 'pointerup') return;
    const next = toggleNodeSmooth(contoursRef.current, drag.contour, drag.node);
    if (next === contoursRef.current) return;
    onChange(next);
    commitContours(next);
  };


  /** Grab affordances are editor-only: nothing outside should act on them. */
  const swallow = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const startShapeDrag = (event: React.PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    svgRef.current?.focus({ preventScroll: true });
    shapeDragRef.current = {
      pointerId: event.pointerId,
      origin: toPath(event.clientX, event.clientY),
      startContours: cloneContours(contours),
      bbox: contoursBBox(contours),
      moved: false,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const startShapeScale = (event: React.PointerEvent, corner: ScaleCorner) => {
    event.stopPropagation();
    event.preventDefault();
    svgRef.current?.focus({ preventScroll: true });
    setSelection([]);
    onStageChange('shape');
    const bbox = contoursBBox(contours);
    const origin = bboxCorner(bbox, oppositeScaleCorner(corner));
    const handle = scaleHandlePoint(bbox, corner);
    const startDistance = Math.hypot(handle.x - origin.x, handle.y - origin.y);
    if (!isFinite(startDistance) || startDistance <= 0) return;
    shapeScaleRef.current = {
      pointerId: event.pointerId,
      corner,
      origin,
      startDistance,
      startContours: cloneContours(contours),
      moved: false,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const startDrag = (
    event: React.PointerEvent,
    kind: PathDrag['kind'],
    contourIndex: number,
    nodeIndex: number,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    svgRef.current?.focus({ preventScroll: true });
    const node = contours[contourIndex]?.nodes[nodeIndex];
    if (!node) return;
    // Alt removes whatever it lands on: a handle retracts into its anchor, an
    // anchor leaves the path. Handles sit close to the anchor on tight curves,
    // so without this an alt-click aimed at a point can quietly miss.
    if (event.altKey) {
      const next = kind === 'anchor'
        ? removeContourNode(contours, contourIndex, nodeIndex)
        : clearNodeHandle(contours, contourIndex, nodeIndex, kind);
      if (next === contours) return;
      setSelection(kind === 'anchor' ? [] : [{ contour: contourIndex, node: nodeIndex }]);
      onChange(next);
      commitContours(next);
      return;
    }
    // Cmd (ctrl off Mac) switches the node's type: a straight corner grows
    // bezier handles from its neighbours, a curve point drops them. Handles
    // crowd the anchor on tight curves, so a click that lands on one still
    // targets the node it belongs to rather than missing. Held through a drag
    // the same key means the opposite — leave the node as it is and let it
    // move unsnapped — so the switch waits for a release that never travelled,
    // and the branches below stand aside for it.
    const toggleOnRelease = event.metaKey || event.ctrlKey;
    // Shift-click an anchor toggles it into/out of the multi-selection
    // instead of dragging — mirrors the usual vector-editor convention.
    if (kind === 'anchor' && event.shiftKey && !toggleOnRelease) {
      setSelection(current => (
        current.some(entry => entry.contour === contourIndex && entry.node === nodeIndex)
          ? current.filter(entry => !(entry.contour === contourIndex && entry.node === nodeIndex))
          : [...current, { contour: contourIndex, node: nodeIndex }]
      ));
      return;
    }
    // A plain click on an anchor that's already part of a multi-selection
    // drags the whole group together; anything else replaces the selection.
    if (kind === 'anchor' && !toggleOnRelease && selection.length > 1
      && selection.some(entry => entry.contour === contourIndex && entry.node === nodeIndex)) {
      groupDragRef.current = {
        pointerId: event.pointerId,
        origin: toPath(event.clientX, event.clientY),
        startContours: cloneContours(contours),
        selection,
        moved: false,
      };
      svgRef.current?.setPointerCapture(event.pointerId);
      return;
    }
    setSelection([{ contour: contourIndex, node: nodeIndex }]);
    dragRef.current = {
      kind,
      contour: contourIndex,
      node: nodeIndex,
      pointerId: event.pointerId,
      origin: toPath(event.clientX, event.clientY),
      clientOrigin: { x: event.clientX, y: event.clientY },
      anchor: node.p,
      center: contoursCenter(contours),
      mirror: kind !== 'anchor' && Boolean(node.in && node.out),
      toggleOnRelease,
      moved: false,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const insertNode = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    // Hit-test against the outline in the same pixel space it's drawn in
    // (via toPx) — matching path-space units here would skew distances
    // whenever the box isn't square relative to the shape's viewBox, so the
    // `+` cursor (an accurate pixel-space stroke hit) and this check could
    // disagree and silently drop the click.
    const pixelContours = mapContours(contours, toPx);
    const hit = nearestSegmentHit(pixelContours, toLocalPx(event.clientX, event.clientY));
    if (!hit || hit.distance > ADD_POINT_REACH) return;
    const { contours: next, nodeIndex } = insertNodeOnSegment(contours, hit.contour, hit.segment, hit.t);
    if (nodeIndex < 0) return;
    setSelection([{ contour: hit.contour, node: nodeIndex }]);
    onChange(next);
    commitContours(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // +/- grow/shrink the whole shape about its center, keeping proportions.
    // Works with or without a selected point — scaling is always about the bbox.
    if (event.key === '=' || event.key === '+' || event.key === '-' || event.key === '_') {
      event.preventDefault();
      event.stopPropagation();
      const bbox = contoursBBox(contours);
      if (!isFinite(bbox.minX) || !isFinite(bbox.maxX)) return;
      const origin = { x: (bbox.minX + bbox.maxX) / 2, y: (bbox.minY + bbox.maxY) / 2 };
      const grow = event.key === '=' || event.key === '+';
      const factor = grow ? KEYBOARD_SCALE_STEP : 1 / KEYBOARD_SCALE_STEP;
      const next = scaleContours(contours, origin, factor);
      onChange(next);
      commitContours(next, { preserveShape: true });
      return;
    }
    if (event.key === 'Escape') {
      event.stopPropagation();
      setSelection([]);
      onStageChange('none');
      return;
    }
    if (!selection.length) return;
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      const next = removeContourNodes(contours, selection);
      if (next === contours) return;
      setSelection([]);
      onChange(next);
      commitContours(next);
      return;
    }
    const base = snap > 0 ? snap : NUDGE_STEP;
    const step = event.shiftKey ? base * 10 : base;
    const shift = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key as string];
    if (!shift) return;
    event.preventDefault();
    event.stopPropagation();
    const next = moveSelectedNodesBy(contours, selection, shift[0], shift[1]);
    onChange(next);
    commitContours(next);
  };

  const outline = useMemo(() => serializeContours(mapContours(contours, toPx)), [contours, toPx]);
  const shapeBBox = useMemo(() => contoursBBox(contours), [contours]);
  const bboxTopLeft = toPx({ x: shapeBBox.minX, y: shapeBBox.minY });
  const bboxSize = {
    width: toPx({ x: shapeBBox.maxX, y: shapeBBox.minY }).x - bboxTopLeft.x,
    height: toPx({ x: shapeBBox.minX, y: shapeBBox.maxY }).y - bboxTopLeft.y,
  };
  const showScaleHandles = shapeArmed
    && selection.length === 0
    && isFinite(shapeBBox.minX)
    && isFinite(shapeBBox.maxX)
    && shapeBBox.maxX > shapeBBox.minX
    && shapeBBox.maxY > shapeBBox.minY;
  const armed = selection.length > 0 || shapeArmed;
  /** Outline, anchors, and scale chrome — only after double-click. */
  const showControls = armed;

  return (
    <svg
      ref={svgRef}
      className={`${P}-editor${armed ? ` ${P}-editor-armed` : ''}`}
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={() => svgRef.current?.focus({ preventScroll: true })}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onContextMenu={(event) => {
        // macOS treats Control+click as a context-menu gesture; without this,
        // capture is lost mid-drag and a free-move is misread as a type toggle.
        event.preventDefault();
      }}
      data-pretext-path-editor
      data-selection="none"
    >
      {/* Catches clicks that land near the outline rather than on it. It
          never stops propagation, so the editor still selects the item.
          Pointer events are off until double-click arms the shape. */}
      <rect
        className={`${P}-editor-surface`}
        width={box.width}
        height={box.height}
        onPointerDown={() => {
          setSelection([]);
          onStageChange('none');
        }}
        onClick={insertNode}
      />
      {showControls && <path className={`${P}-editor-hit`} d={outline} onClick={insertNode} />}
      {showControls && <path className={`${P}-editor-outline`} d={outline} />}
      {showControls && snapGuides.map((guide, index) => (
        <line
          key={`${guide.kind}-${index}`}
          className={`${P}-editor-snap ${P}-editor-snap-${guide.kind}`}
          x1={guide.a.x}
          y1={guide.a.y}
          x2={guide.b.x}
          y2={guide.b.y}
        />
      ))}
      {/* Body hit target for whole-shape drag while armed. */}
      <path
        ref={bodyPathRef}
        className={`${P}-editor-body`}
        d={outline}
        fillRule="evenodd"
        onPointerDown={startShapeDrag}
        onClick={insertNode}
      />
      {showControls && contours.map((contour, contourIndex) => contour.nodes.map((node, nodeIndex) => {
        const isSelected = selection.some(entry => entry.contour === contourIndex && entry.node === nodeIndex);
        const anchor = toPx(node.p);
        return (
          <g key={`${contourIndex}-${nodeIndex}`}>
            {/* Bezier handles are single-node controls — only surface them when exactly one node is selected. */}
            {isSelected && selection.length === 1 && (['in', 'out'] as const).map((which) => {
              const handle = node[which];
              if (!handle) return null;
              const point = toPx(handle);
              return (
                <g key={which}>
                  <line className={`${P}-editor-handle-line`} x1={anchor.x} y1={anchor.y} x2={point.x} y2={point.y} />
                  <circle className={`${P}-editor-handle`} cx={point.x} cy={point.y} r={HANDLE_RADIUS} />
                  <circle
                    className={`${P}-editor-grab`}
                    cx={point.x}
                    cy={point.y}
                    r={GRAB_RADIUS}
                    onPointerDown={event => startDrag(event, which, contourIndex, nodeIndex)}
                    onClick={swallow}
                  />
                </g>
              );
            })}
            <rect
              className={`${P}-editor-anchor${isSelected ? ` ${P}-editor-anchor-selected` : ''}`}
              x={anchor.x - ANCHOR_SIZE / 2}
              y={anchor.y - ANCHOR_SIZE / 2}
              width={ANCHOR_SIZE}
              height={ANCHOR_SIZE}
              rx={node.in || node.out ? ANCHOR_SIZE / 2 : 0}
            />
            <rect
              className={`${P}-editor-grab`}
              x={anchor.x - GRAB_RADIUS}
              y={anchor.y - GRAB_RADIUS}
              width={GRAB_RADIUS * 2}
              height={GRAB_RADIUS * 2}
              onPointerDown={event => startDrag(event, 'anchor', contourIndex, nodeIndex)}
              onClick={swallow}
              onDoubleClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                const next = toggleNodeSmooth(contours, contourIndex, nodeIndex);
                onChange(next);
                commitContours(next);
              }}
            />
          </g>
        );
      }))}
      {/* Uniform scale about the opposite corner. Shown after double-click
          when no point is selected (transform mode). */}
      {showScaleHandles && (
        <g>
          <rect
            className={`${P}-editor-bbox`}
            x={bboxTopLeft.x}
            y={bboxTopLeft.y}
            width={bboxSize.width}
            height={bboxSize.height}
          />
          {(['nw', 'ne', 'se', 'sw'] as const).map((corner) => {
            const point = toPx(scaleHandlePoint(shapeBBox, corner));
            const nesw = corner === 'ne' || corner === 'sw';
            return (
              <g key={corner}>
                <rect
                  className={`${P}-editor-scale`}
                  x={point.x - SCALE_HANDLE_SIZE / 2}
                  y={point.y - SCALE_HANDLE_SIZE / 2}
                  width={SCALE_HANDLE_SIZE}
                  height={SCALE_HANDLE_SIZE}
                />
                <rect
                  className={`${P}-editor-scale-grab${nesw ? ` ${P}-editor-scale-grab-nesw` : ''}`}
                  x={point.x - SCALE_GRAB_SIZE / 2}
                  y={point.y - SCALE_GRAB_SIZE / 2}
                  width={SCALE_GRAB_SIZE}
                  height={SCALE_GRAB_SIZE}
                  onPointerDown={event => startShapeScale(event, corner)}
                  onClick={swallow}
                />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

/** Dragging the image body pans it; the mask (`bounds`) never moves. */
type ImagePan = {
  pointerId: number;
  origin: Pt;
  startX: number;
  startY: number;
  width: number;
  height: number;
  moved: boolean;
};

/** Dragging a corner zooms about the opposite corner of `bounds`, same feel as the shape's own scale handles. */
type ImageScaleDrag = {
  pointerId: number;
  anchor: Pt;
  startDistance: number;
  startScale: number;
  startX: number;
  startY: number;
  moved: boolean;
};

type ImageEditorProps = {
  P: string;
  box: { width: number; height: number };
  /** The shape's own bbox, in the same px space as `box` — the mask the image is clipped to. */
  bounds: { x: number; y: number; width: number; height: number };
  natural: { width: number; height: number } | null;
  /** Source of the ghost drawn outside the mask while cropping. */
  imageUrl?: string | null;
  /** The mask itself, as a px path in the same space as `bounds`. */
  maskPath: string;
  stage: EditStage;
  onStageChange: (stage: EditStage) => void;
  focalX: number;
  focalY: number;
  scale: number;
  onChange: (next: ImageTransform) => void;
  onCommit: (next: ImageTransform) => void;
};

/**
 * Pan/zoom overlay for the image behind a shape mask — a sibling to
 * `PretextPathEditor`, armed by the same double-click cycle (owned by
 * `PretextColumn`) instead of shape editing, so the two never fight over
 * the pointer at once.
 */
function PretextImageEditor({ P, box, bounds, natural, imageUrl, maskPath, stage, onStageChange, focalX, focalY, scale, onChange, onCommit }: ImageEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const ghostMaskId = `pretext-image-ghost-${useId().replace(/:/g, '')}`;
  const panRef = useRef<ImagePan | null>(null);
  const scaleRef = useRef<ImageScaleDrag | null>(null);
  const liveRef = useRef<ImageTransform>({ focalX, focalY, scale });
  liveRef.current = { focalX, focalY, scale };

  const armed = stage === 'image';

  useEffect(() => {
    if (armed) svgRef.current?.focus({ preventScroll: true });
  }, [armed]);

  const toLocalPx = useCallback((clientX: number, clientY: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * box.width,
      y: ((clientY - rect.top) / rect.height) * box.height,
    };
  }, [box.width, box.height]);

  const startPan = (event: React.PointerEvent) => {
    if (!natural) return;
    event.stopPropagation();
    event.preventDefault();
    svgRef.current?.focus({ preventScroll: true });
    const size = coveredImageSize(bounds, natural, scale);
    panRef.current = {
      pointerId: event.pointerId,
      origin: toLocalPx(event.clientX, event.clientY),
      startX: imageOffsetFromFocal(bounds.width, size.width, focalX),
      startY: imageOffsetFromFocal(bounds.height, size.height, focalY),
      width: size.width,
      height: size.height,
      moved: false,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const startScale = (event: React.PointerEvent, corner: ScaleCorner) => {
    if (!natural) return;
    event.stopPropagation();
    event.preventDefault();
    svgRef.current?.focus({ preventScroll: true });
    const size = coveredImageSize(bounds, natural, scale);
    const startX = imageOffsetFromFocal(bounds.width, size.width, focalX);
    const startY = imageOffsetFromFocal(bounds.height, size.height, focalY);
    // The photo's own rect, in the bounds-local space the drag math runs in.
    // Anchoring on its opposite corner is what pins that corner while you drag
    // — anchored on the mask's corner instead, the photo slid as it resized.
    const localBBox = { minX: startX, minY: startY, maxX: startX + size.width, maxY: startY + size.height };
    const anchor = bboxCorner(localBBox, oppositeScaleCorner(corner));
    const handle = bboxCorner(localBBox, corner);
    const startDistance = Math.hypot(handle.x - anchor.x, handle.y - anchor.y);
    if (!isFinite(startDistance) || startDistance <= 0) return;
    scaleRef.current = {
      pointerId: event.pointerId,
      anchor,
      startDistance,
      startScale: scale,
      startX,
      startY,
      moved: false,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!natural) return;
    const scaleDrag = scaleRef.current;
    if (scaleDrag && event.pointerId === scaleDrag.pointerId) {
      event.stopPropagation();
      event.preventDefault();
      // Anchor/start offsets live in bounds-local space; pointer is box-local.
      const pointBox = toLocalPx(event.clientX, event.clientY);
      const point = { x: pointBox.x - bounds.x, y: pointBox.y - bounds.y };
      const distance = Math.hypot(point.x - scaleDrag.anchor.x, point.y - scaleDrag.anchor.y);
      const nextScale = Math.min(
        MAX_IMAGE_SCALE,
        Math.max(MIN_IMAGE_SCALE, scaleDrag.startScale * (distance / scaleDrag.startDistance)),
      );
      if (!scaleDrag.moved && Math.abs(nextScale - scaleDrag.startScale) < 1e-4) return;
      scaleDrag.moved = true;
      // Uniform scale about the opposite corner — same construction as
      // `scaleContours`, just applied to the image's own translate/scale.
      const ratio = nextScale / scaleDrag.startScale;
      const nextX = scaleDrag.anchor.x + (scaleDrag.startX - scaleDrag.anchor.x) * ratio;
      const nextY = scaleDrag.anchor.y + (scaleDrag.startY - scaleDrag.anchor.y) * ratio;
      const size = coveredImageSize(bounds, natural, nextScale);
      onChange({
        focalX: focalFromImageOffset(bounds.width, size.width, nextX),
        focalY: focalFromImageOffset(bounds.height, size.height, nextY),
        scale: nextScale,
      });
      return;
    }
    const pan = panRef.current;
    if (pan && event.pointerId === pan.pointerId) {
      event.stopPropagation();
      event.preventDefault();
      const point = toLocalPx(event.clientX, event.clientY);
      const dx = point.x - pan.origin.x;
      const dy = point.y - pan.origin.y;
      if (!pan.moved && dx === 0 && dy === 0) return;
      pan.moved = true;
      onChange({
        focalX: focalFromImageOffset(bounds.width, pan.width, pan.startX + dx),
        focalY: focalFromImageOffset(bounds.height, pan.height, pan.startY + dy),
        scale,
      });
    }
  };

  const endDrag = (event: React.PointerEvent) => {
    const pan = panRef.current;
    if (pan && event.pointerId === pan.pointerId) {
      panRef.current = null;
      event.stopPropagation();
      if (svgRef.current?.hasPointerCapture(pan.pointerId)) svgRef.current.releasePointerCapture(pan.pointerId);
      if (pan.moved) onCommit(liveRef.current);
      return;
    }
    const scaleDrag = scaleRef.current;
    if (scaleDrag && event.pointerId === scaleDrag.pointerId) {
      scaleRef.current = null;
      event.stopPropagation();
      if (svgRef.current?.hasPointerCapture(scaleDrag.pointerId)) svgRef.current.releasePointerCapture(scaleDrag.pointerId);
      if (scaleDrag.moved) onCommit(liveRef.current);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onStageChange('none');
      return;
    }
    if (event.key === '=' || event.key === '+' || event.key === '-' || event.key === '_') {
      event.preventDefault();
      event.stopPropagation();
      const grow = event.key === '=' || event.key === '+';
      const nextScale = Math.min(MAX_IMAGE_SCALE, Math.max(MIN_IMAGE_SCALE, scale * (grow ? KEYBOARD_SCALE_STEP : 1 / KEYBOARD_SCALE_STEP)));
      const next = { focalX, focalY, scale: nextScale };
      onChange(next);
      onCommit(next);
    }
  };

  const corners: ScaleCorner[] = ['nw', 'ne', 'se', 'sw'];
  const boundsBBox = { minX: bounds.x, minY: bounds.y, maxX: bounds.x + bounds.width, maxY: bounds.y + bounds.height };

  // The photo's full extent, in the same px space as `bounds` — the same
  // construction the column uses to place the clipped <image>, so the ghost
  // stays welded to the real thing through a pan or zoom.
  const imageRect = useMemo(() => {
    const source = natural ?? { width: bounds.width, height: bounds.height };
    const size = coveredImageSize(bounds, source, scale);
    if (!(size.width > 0) || !(size.height > 0)) return null;
    return {
      x: bounds.x + imageOffsetFromFocal(bounds.width, size.width, focalX),
      y: bounds.y + imageOffsetFromFocal(bounds.height, size.height, focalY),
      width: size.width,
      height: size.height,
    };
  }, [natural, bounds.x, bounds.y, bounds.width, bounds.height, focalX, focalY, scale]);

  // Scale handles sit on the photo, not on the mask — so the frame you grab is
  // the size of the thing you're resizing. Falls back to the mask bbox for the
  // moment before `natural` loads, when the two are the same rect anyway.
  const handleBBox = imageRect
    ? {
      minX: imageRect.x,
      minY: imageRect.y,
      maxX: imageRect.x + imageRect.width,
      maxY: imageRect.y + imageRect.height,
    }
    : boundsBBox;

  return (
    <svg
      ref={svgRef}
      className={`${P}-editor${armed ? ` ${P}-editor-armed` : ''}`}
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      data-pretext-image-editor
    >
      <rect
        className={`${P}-editor-surface`}
        width={box.width}
        height={box.height}
        onPointerDown={() => onStageChange('none')}
      />
      {armed && imageUrl && imageRect && maskPath && (
        <>
          {/* Luminance mask: white over the whole photo, the shape punched out
              in black. Only the cropped-away remainder gets painted, so the
              live image inside the mask is never double-covered and dulled. */}
          <defs>
            <mask id={ghostMaskId} maskUnits="userSpaceOnUse" x={imageRect.x} y={imageRect.y} width={imageRect.width} height={imageRect.height}>
              <rect x={imageRect.x} y={imageRect.y} width={imageRect.width} height={imageRect.height} fill="#FFFFFF" />
              <path d={maskPath} fillRule="evenodd" fill="#000000" />
            </mask>
          </defs>
          <image
            className={`${P}-editor-ghost`}
            href={imageUrl ?? undefined}
            x={imageRect.x}
            y={imageRect.y}
            width={imageRect.width}
            height={imageRect.height}
            preserveAspectRatio="none"
            mask={`url(#${ghostMaskId})`}
          />
          <rect
            className={`${P}-editor-image-bounds`}
            x={imageRect.x}
            y={imageRect.y}
            width={imageRect.width}
            height={imageRect.height}
          />
        </>
      )}
      {armed && (
        <>
          <rect
            className={`${P}-editor-bbox`}
            x={bounds.x}
            y={bounds.y}
            width={bounds.width}
            height={bounds.height}
          />
          <rect
            className={`${P}-editor-body`}
            x={bounds.x}
            y={bounds.y}
            width={bounds.width}
            height={bounds.height}
            onPointerDown={startPan}
          />
          {corners.map((corner) => {
            const point = scaleHandlePoint(handleBBox, corner);
            const nesw = corner === 'ne' || corner === 'sw';
            return (
              <g key={corner}>
                <rect
                  className={`${P}-editor-scale`}
                  x={point.x - SCALE_HANDLE_SIZE / 2}
                  y={point.y - SCALE_HANDLE_SIZE / 2}
                  width={SCALE_HANDLE_SIZE}
                  height={SCALE_HANDLE_SIZE}
                />
                <rect
                  className={`${P}-editor-scale-grab${nesw ? ` ${P}-editor-scale-grab-nesw` : ''}`}
                  x={point.x - SCALE_GRAB_SIZE / 2}
                  y={point.y - SCALE_GRAB_SIZE / 2}
                  width={SCALE_GRAB_SIZE}
                  height={SCALE_GRAB_SIZE}
                  onPointerDown={event => startScale(event, corner)}
                />
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}

type FloatingRect = { top: number; left: number; width: number; height: number };

function readFloatingRect(element: HTMLElement): FloatingRect {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function floatingRectsEqual(a: FloatingRect, b: FloatingRect): boolean {
  return Math.abs(a.top - b.top) < 0.5
    && Math.abs(a.left - b.left) < 0.5
    && Math.abs(a.width - b.width) < 0.5
    && Math.abs(a.height - b.height) < 0.5;
}

/**
 * Tracks `element`'s viewport rect for as long as `active` is true, by
 * polling every frame rather than via ResizeObserver/scroll listeners: a
 * host canvas can pan or zoom through a CSS transform with no accompanying
 * scroll/resize event, and that's the one signal a portaled overlay can't
 * afford to miss while it's glued to an anchor living in a different part
 * of the DOM.
 */
function useFloatingRect(element: HTMLElement | null, active: boolean): FloatingRect | null {
  const [rect, setRect] = useState<FloatingRect | null>(null);
  useEffect(() => {
    if (!element || !active) {
      setRect(null);
      return;
    }
    let frame = 0;
    let last: FloatingRect | null = null;
    const tick = () => {
      const next = readFloatingRect(element);
      if (!last || !floatingRectsEqual(last, next)) {
        last = next;
        setRect(next);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [element, active]);
  return rect;
}

// Deliberately not the host's own `portalId` container: shared portal nodes
// like the CMS's `#component-portal` set their own z-index and so form a
// stacking context of their own — anything dropped inside is capped at that
// z-index no matter what value it declares internally. document.body has no
// such ceiling, which is the whole point of floating above the host's chrome
// (e.g. resize handles) instead of just above sibling components.
function resolveEditorPortalTarget(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.body;
}

/* ------------------------------------------------------------------ *
 * Column
 * ------------------------------------------------------------------ */

type ColumnMetrics = {
  widths: number[];
  spaceWidth: number;
  lineHeight: number;
  capWidth: number;
};

type ColumnProps = {
  P: string;
  item: PretextContentItem;
  shape: ShapeId;
  customPath: string;
  pathFit: PathFit;
  viewBox: ViewBox;
  mode: 'contain' | 'avoid';
  align: Align;
  allowOverflow: boolean;
  fitEnabled: boolean;
  scale: number;
  onFitScale: (scale: number) => void;
  dropCapLines: number;
  dropCapSize: number;
  showGuides: boolean;
  typography: React.CSSProperties;
  imageUrl?: string | null;
  imageFocalX: number;
  imageFocalY: number;
  imageScale: number;
  /** Path used for the image mask — may lead `customPath` while settings sync. */
  imageCustomPath: string;
  pathDragActive: boolean;
  /** The live drag moves the whole shape: let the photo ride along with it. */
  pathCarryImage: boolean;
  /** Fired once the carried placement has been adopted, to clear the flag. */
  onCarryImageConsumed?: () => void;
  pathEditor?: PathEditorBinding | null;
  imageEditor?: ImageEditorBinding | null;
};

/**
 * Vector editing runs on the column that owns the shared path. `contours` is
 * the live draft — while a handle is dragged the text reflows against it,
 * and only `onCommit` writes the path back into the settings.
 */
type PathEditorBinding = {
  contours: VecContour[] | null;
  snap: number;
  needsConversion: boolean;
  onConvert: (contours: VecContour[]) => void;
  onChange: (contours: VecContour[], options?: PathChangeOptions) => void;
  onCommit: (contours: VecContour[], options?: PathCommitOptions) => void;
};

/** Same draft/commit split as `PathEditorBinding`, for the image's own pan/zoom. */
type ImageEditorBinding = {
  onChange: (next: ImageTransform) => void;
  onCommit: (next: ImageTransform) => void;
};

/** Image mask/placement frozen for the duration of a path-edit session. */
type FrozenShapeImage = {
  rings: Ring[];
  bounds: { x: number; y: number; width: number; height: number };
  focalX: number;
  focalY: number;
  scale: number;
  customPath: string;
};

function PretextColumn({
  P,
  item,
  shape,
  customPath,
  pathFit,
  viewBox,
  mode,
  align,
  allowOverflow,
  fitEnabled,
  scale,
  onFitScale,
  dropCapLines,
  dropCapSize,
  showGuides,
  typography,
  imageUrl,
  imageFocalX,
  imageFocalY,
  imageScale,
  imageCustomPath,
  pathDragActive,
  pathCarryImage,
  onCarryImageConsumed,
  pathEditor,
  imageEditor,
}: ColumnProps) {
  const imageId = `pretext-shape-image-${useId().replace(/:/g, '')}`;
  const [columnEl, setColumnEl] = useState<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [metrics, setMetrics] = useState<ColumnMetrics | null>(null);
  const [fontsReady, setFontsReady] = useState(0);
  /** Shape and image editing share one arm/disarm cycle — never both at once. */
  const [editStage, setEditStage] = useState<EditStage>('none');
  useEffect(() => {
    if (!pathEditor && !imageEditor) setEditStage('none');
  }, [pathEditor, imageEditor]);

  const [naturalImageSize, setNaturalImageSize] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    if (!imageUrl || typeof Image === 'undefined') {
      setNaturalImageSize(null);
      return;
    }
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) setNaturalImageSize({ width: probe.naturalWidth, height: probe.naturalHeight });
    };
    probe.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const blocks = useMemo(() => (Array.isArray(item?.text) ? item.text : []), [item]);
  const tokens = useMemo(() => tokenize(blocks), [blocks]);
  const plainParagraphs = useMemo(() => getPlainText(blocks), [blocks]);
  const dropCapChar = dropCapLines > 0 ? (tokens[0]?.text?.charAt(0) ?? '') : '';

  const aspect = box.height > 0 ? box.width / box.height : 1;
  const draftContours = pathEditor?.contours ?? null;
  const unitRings = useMemo(() => {
    if (draftContours) {
      const drawn = flattenContours(draftContours);
      if (drawn.length) return mapToViewBox(drawn, viewBox);
    }
    // Prefer a stored path whenever present (preset picks materialize into
    // customPath while keeping the preset id on `shape` for the dropdown).
    const spec = customPath.trim();
    const parsed = spec ? parsePathSpec(spec, pathFit, viewBox) : null;
    if (parsed && parsed.length) return parsed;
    return getPresetRings(shape === 'custom' ? 'rectangle' : shape, aspect);
    // aspect only matters for the circle preset; round it to avoid churn
  }, [draftContours, shape, customPath, pathFit, viewBox, Math.round(aspect * 100) / 100]);

  // Layout treats rings as 0..1 fractions of the box. Paths stored in the
  // edit viewBox (0–100) map through mapToViewBox and scale with the box —
  // matching CMS article-width scaling for top/left.
  //
  // Legacy paths rematerialized into component pixels (while pathViewBox is
  // still 0 0 100 100) must not pin to absolute px on every resize. Freeze the
  // first measured box as a reference so pixel coords become stable fractions,
  // and migrate to real viewBox coords when the editor can persist.
  const onConvertPath = pathEditor?.onConvert;
  const needsConversion = pathEditor?.needsConversion ?? false;
  const exceedsEditViewBox = useMemo(() => {
    const contours = draftContours
      ?? (customPath.trim() ? parsePathNodes(customPath) : null);
    return Boolean(contours && pathExceedsEditViewBox(contours, viewBox));
  }, [draftContours, customPath, viewBox]);

  const [legacyRefBox, setLegacyRefBox] = useState<{ width: number; height: number } | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!exceedsEditViewBox) {
      if (legacyRefBox) setLegacyRefBox(null);
      return;
    }
    if (!legacyRefBox && box.width > 0 && box.height > 0) {
      setLegacyRefBox({ width: box.width, height: box.height });
    }
  }, [exceedsEditViewBox, box.width, box.height, legacyRefBox]);

  const rings = useMemo(() => {
    if (!exceedsEditViewBox || box.width <= 0 || box.height <= 0) return unitRings;
    const ref = legacyRefBox ?? box;
    const scaleX = viewBox.width / ref.width;
    const scaleY = viewBox.height / ref.height;
    return unitRings.map(ring => ring.map(point => ({ x: point.x * scaleX, y: point.y * scaleY })));
  }, [unitRings, exceedsEditViewBox, legacyRefBox, viewBox.width, viewBox.height, box.width, box.height]);

  // The shape image reads from the *committed* path, not the in-progress drag
  // draft — text reflows live as nodes are dragged, but the image mask should
  // hold still until the edit is committed rather than warping every frame.
  const committedUnitRings = useMemo(() => {
    const spec = imageCustomPath.trim();
    const parsed = spec ? parsePathSpec(spec, pathFit, viewBox) : null;
    if (parsed && parsed.length) return parsed;
    return getPresetRings(shape === 'custom' ? 'rectangle' : shape, aspect);
    // aspect only matters for the circle preset; round it to avoid churn
  }, [shape, imageCustomPath, pathFit, viewBox, Math.round(aspect * 100) / 100]);

  const imageRings = useMemo(() => {
    if (!exceedsEditViewBox || box.width <= 0 || box.height <= 0) return committedUnitRings;
    const ref = legacyRefBox ?? box;
    const scaleX = viewBox.width / ref.width;
    const scaleY = viewBox.height / ref.height;
    return committedUnitRings.map(ring => ring.map(point => ({ x: point.x * scaleX, y: point.y * scaleY })));
  }, [committedUnitRings, exceedsEditViewBox, legacyRefBox, viewBox.width, viewBox.height, box.width, box.height]);

  const migratedPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (!onConvertPath || box.width <= 0 || box.height <= 0) return;

    if (exceedsEditViewBox) {
      if (migratedPathRef.current === customPath) return;
      const contours = draftContours
        ?? (customPath.trim() ? parsePathNodes(customPath) : null);
      if (!contours?.length) return;
      const normalized = mapContours(contours, point => ({
        x: viewBox.x + ((point.x - viewBox.x) / box.width) * viewBox.width,
        y: viewBox.y + ((point.y - viewBox.y) / box.height) * viewBox.height,
      }));
      migratedPathRef.current = serializeContours(normalized);
      onConvertPath(normalized);
      return;
    }

    if (!needsConversion || !unitRings.length) return;
    onConvertPath(mapContours(ringsToContours(unitRings), point => ({ x: point.x * EDIT_SPAN, y: point.y * EDIT_SPAN })));
  }, [
    needsConversion,
    exceedsEditViewBox,
    onConvertPath,
    unitRings,
    draftContours,
    customPath,
    viewBox,
    box.width,
    box.height,
  ]);

  useIsomorphicLayoutEffect(() => {
    const element = columnEl;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      setBox(previous => (
        Math.abs(previous.width - rect.width) < 0.5 && Math.abs(previous.height - rect.height) < 0.5
          ? previous
          : { width: rect.width, height: rect.height }
      ));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [columnEl]);

  useEffect(() => {
    const fonts = typeof document !== 'undefined' ? (document as any).fonts : undefined;
    if (!fonts?.ready) return;
    let cancelled = false;
    fonts.ready.then(() => {
      if (!cancelled) setFontsReady(value => value + 1);
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    const element = measureRef.current;
    if (!element) return;
    if (!tokens.length) {
      setMetrics(null);
      return;
    }

    const spans: HTMLSpanElement[] = [];
    const fragment = document.createDocumentFragment();
    for (const token of tokens) {
      const span = document.createElement('span');
      Object.assign(span.style, getLeafCss(token.leaf) as Record<string, string>);
      span.textContent = token.text;
      fragment.appendChild(span);
      spans.push(span);
    }
    const spaceSpan = document.createElement('span');
    spaceSpan.textContent = ' ';
    fragment.appendChild(spaceSpan);

    const capSpan = document.createElement('span');
    capSpan.textContent = dropCapChar || 'H';
    capSpan.style.lineHeight = '1';
    fragment.appendChild(capSpan);

    element.replaceChildren(fragment);

    const computed = window.getComputedStyle(element);
    const fontSize = parseFloat(computed.fontSize) || 16;
    const parsedLineHeight = parseFloat(computed.lineHeight);
    const rawLineHeight = Number.isNaN(parsedLineHeight) ? fontSize * 1.2 : parsedLineHeight;
    // Line boxes shorter than the glyphs overflow and get clipped by the flow container.
    const lineHeight = Math.max(rawLineHeight, fontSize);

    capSpan.style.fontSize = `${lineHeight * dropCapSize}px`;

    const widths = spans.map(span => span.getBoundingClientRect().width);
    const spaceWidth = spaceSpan.getBoundingClientRect().width;
    const capWidth = dropCapChar ? capSpan.getBoundingClientRect().width : 0;

    element.replaceChildren();
    setMetrics({ widths, spaceWidth, lineHeight, capWidth });
  }, [tokens, typography, dropCapChar, dropCapLines, dropCapSize, fontsReady, box.width]);

  const capInset = metrics && dropCapChar ? metrics.capWidth + metrics.lineHeight * DROP_CAP_GAP : 0;
  // A glyph taller than `dropCapLines` (e.g. a big dropCapSize) still needs that many
  // wrapped lines cleared, or trailing text would overlap the cap's lower half.
  const capLineSpan = Math.max(dropCapLines, Math.ceil(dropCapSize));

  const naturalScale = useMemo(() => {
    if (!metrics || !tokens.length || box.width <= 0 || box.height <= 0) return 1;
    if (!fitEnabled) return 1;
    const run = (candidate: number) => layoutText({
      tokens,
      widths: metrics.widths,
      spaceWidth: metrics.spaceWidth,
      lineHeight: metrics.lineHeight,
      width: box.width,
      height: box.height,
      rings,
      mode,
      align,
      scale: candidate,
      allowOverflow: false,
      capInset: capInset * candidate,
      capLines: dropCapChar ? capLineSpan : 0,
    });
    if (run(1).placed >= tokens.length) return 1;
    if (run(MIN_FIT_SCALE).placed < tokens.length) return MIN_FIT_SCALE;
    let low = MIN_FIT_SCALE;
    let high = 1;
    for (let i = 0; i < FIT_ITERATIONS; i += 1) {
      const middle = (low + high) / 2;
      if (run(middle).placed >= tokens.length) low = middle;
      else high = middle;
    }
    return low;
  }, [metrics, tokens, box.width, box.height, rings, mode, align, fitEnabled, capInset, dropCapChar, capLineSpan]);

  useEffect(() => {
    onFitScale(naturalScale);
  }, [naturalScale, onFitScale]);

  const appliedScale = fitEnabled ? Math.min(scale, naturalScale) : 1;

  const result = useMemo(() => {
    if (!metrics || !tokens.length || box.width <= 0 || box.height <= 0) {
      return { segments: [], placed: 0, height: 0, capLeft: 0, capTop: 0 } as LayoutResult;
    }
    return layoutText({
      tokens,
      widths: metrics.widths,
      spaceWidth: metrics.spaceWidth,
      lineHeight: metrics.lineHeight,
      width: box.width,
      height: box.height,
      rings,
      mode,
      align,
      scale: appliedScale,
      allowOverflow,
      capInset: capInset * appliedScale,
      capLines: dropCapChar ? capLineSpan : 0,
    });
  }, [metrics, tokens, box.width, box.height, rings, mode, align, appliedScale, allowOverflow, capInset, dropCapChar, capLineSpan]);

  const lineHeightPx = metrics ? metrics.lineHeight * appliedScale : 0;
  const textAlign: React.CSSProperties['textAlign'] = align === 'justify' ? 'left' : align;

  const showPathEditor = Boolean(pathEditor && draftContours && box.width > 0 && box.height > 0);
  const canArmImage = Boolean(imageEditor);
  const showOverlayPortal = (showPathEditor || canArmImage) && box.width > 0 && box.height > 0;
  const editorRect = useFloatingRect(columnEl, showOverlayPortal);
  const portalTarget = showOverlayPortal && editorRect ? resolveEditorPortalTarget() : null;

  // Read at event time rather than held in state: the cycle listener below
  // should not rebind every time a point is selected or dropped.
  const pathHasSelectionRef = useRef(false);
  const onPathSelectionChange = useCallback((hasSelection: boolean) => {
    pathHasSelectionRef.current = hasSelection;
  }, []);

  // Double-click anywhere over the column (capture, before the host item's own
  // dblclick enters preview) cycles shape → image editing — the single place
  // that decides which of the two overlays gets the pointer next.
  useEffect(() => {
    if (!showPathEditor && !canArmImage) return;
    const onDblClick = (event: MouseEvent) => {
      const element = columnEl;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const within = event.clientX >= rect.left && event.clientX <= rect.right
        && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!within) return;
      // Swallow so the host does not enter preview and unmount the editors.
      event.preventDefault();
      event.stopPropagation();
      setEditStage((current) => {
        // Mid node-edit with a point selected, hold the stage. The anchor's own
        // dblclick (toggle smooth) calls stopPropagation, but this listener is
        // on document in the capture phase and runs first, so the guard has to
        // be here — nothing downstream can prevent it.
        if (current === 'shape' && pathHasSelectionRef.current) return current;
        if (current === 'shape' && canArmImage) return 'image';
        return showPathEditor ? 'shape' : 'image';
      });
    };
    document.addEventListener('dblclick', onDblClick, true);
    return () => document.removeEventListener('dblclick', onDblClick, true);
  }, [showPathEditor, canArmImage, columnEl]);

  const committedShapeImageBounds = useMemo(
    () => (imageUrl && box.width > 0 && box.height > 0 ? ringsBBoxPx(imageRings, box) : null),
    [imageUrl, imageRings, box.width, box.height],
  );

  // Freeze the image mask only while a path handle is actively dragged. Between
  // commits, `imageCustomPath` tracks the local draft so the clip updates without
  // waiting on settings sync.
  const freezeImageForPathEdit = pathDragActive && !pathCarryImage && editStage !== 'image';
  const lastStableImageRef = useRef<FrozenShapeImage | null>(null);

  if (!pathDragActive && imageUrl && committedShapeImageBounds) {
    lastStableImageRef.current = {
      rings: imageRings,
      bounds: committedShapeImageBounds,
      focalX: imageFocalX,
      focalY: imageFocalY,
      scale: imageScale,
      customPath: imageCustomPath,
    };
  }

  const dragFrozen = freezeImageForPathEdit ? lastStableImageRef.current : null;

  const imagePathAnchorRef = useRef<FrozenShapeImage | null>(null);
  const pathPreservedTransform = (() => {
    const anchor = imagePathAnchorRef.current;
    if (
      pathDragActive
      // Stays true through the commit and the re-anchor below, so the moved
      // photo is adopted as the new resting state instead of being corrected
      // back. The next drag's first onChange resets it.
      || pathCarryImage
      || !imageEditor
      || !naturalImageSize
      || !committedShapeImageBounds
      || !anchor
      || imageCustomPath === anchor.customPath
    ) {
      return null;
    }
    return preserveImageTransformAcrossBoundsChange(
      anchor.bounds,
      committedShapeImageBounds,
      naturalImageSize,
      anchor.focalX,
      anchor.focalY,
      anchor.scale,
    );
  })();

  useIsomorphicLayoutEffect(() => {
    if (pathDragActive || !imageEditor || !naturalImageSize || !committedShapeImageBounds) return;
    const anchor = imagePathAnchorRef.current;
    const pathChanged = Boolean(anchor && imageCustomPath !== anchor.customPath);
    if (pathChanged && pathPreservedTransform) {
      imageEditor.onCommit(pathPreservedTransform);
    }
    // The carry has now been folded into the anchor below, so retire the flag —
    // otherwise it would keep suppressing the correction for the *next* path
    // change, whatever caused it (undo, the shape dropdown, the path field).
    if (pathChanged && pathCarryImage) onCarryImageConsumed?.();
    imagePathAnchorRef.current = {
      rings: imageRings,
      bounds: committedShapeImageBounds,
      focalX: pathPreservedTransform?.focalX ?? imageFocalX,
      focalY: pathPreservedTransform?.focalY ?? imageFocalY,
      scale: pathPreservedTransform?.scale ?? imageScale,
      customPath: imageCustomPath,
    };
  }, [
    pathDragActive,
    pathCarryImage,
    imageCustomPath,
    imageRings,
    committedShapeImageBounds,
    imageEditor,
    naturalImageSize,
    imageFocalX,
    imageFocalY,
    imageScale,
    pathPreservedTransform,
    onCarryImageConsumed,
  ]);

  const activeImageRings = dragFrozen?.rings ?? imageRings;
  const activeImageBounds = dragFrozen?.bounds ?? committedShapeImageBounds;
  const activeImageFocalX = dragFrozen?.focalX ?? pathPreservedTransform?.focalX ?? imageFocalX;
  const activeImageFocalY = dragFrozen?.focalY ?? pathPreservedTransform?.focalY ?? imageFocalY;
  const activeImageScale = dragFrozen?.scale ?? pathPreservedTransform?.scale ?? imageScale;

  const shapeImagePath = useMemo(
    () => (imageUrl && box.width > 0 && box.height > 0 ? ringsToPathPx(activeImageRings, box) : ''),
    [imageUrl, activeImageRings, box.width, box.height],
  );
  const shapeImageBounds = activeImageBounds;
  const clipId = `${imageId}-clip`;
  // Before the natural size loads, fall back to filling the mask bbox exactly
  // (equivalent to the old xMidYMid-slice default) rather than a jump cut once it's known.
  const imageRect = useMemo(() => {
    if (!shapeImageBounds) return null;
    const natural = naturalImageSize ?? { width: shapeImageBounds.width, height: shapeImageBounds.height };
    const size = coveredImageSize(shapeImageBounds, natural, activeImageScale);
    return {
      x: imageOffsetFromFocal(shapeImageBounds.width, size.width, activeImageFocalX),
      y: imageOffsetFromFocal(shapeImageBounds.height, size.height, activeImageFocalY),
      width: size.width,
      height: size.height,
    };
  }, [shapeImageBounds, naturalImageSize, activeImageFocalX, activeImageFocalY, activeImageScale]);

  return (
    <div className={`${P}-column`} ref={setColumnEl}>
      {imageUrl && shapeImagePath && shapeImageBounds && imageRect ? (
        <svg
          className={`${P}-shape-image`}
          viewBox={`0 0 ${box.width} ${box.height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <path d={shapeImagePath} fillRule="evenodd" />
            </clipPath>
          </defs>
          <image
            href={imageUrl}
            x={shapeImageBounds.x + imageRect.x}
            y={shapeImageBounds.y + imageRect.y}
            width={imageRect.width}
            height={imageRect.height}
            preserveAspectRatio="none"
            clipPath={`url(#${clipId})`}
          />
        </svg>
      ) : null}
      <div
        className={`${P}-flow${allowOverflow ? '' : ` ${P}-clip`}`}
        style={{ ...typography, ['--' + P + '-fit']: appliedScale } as React.CSSProperties}
      >
        <div className={`${P}-measure`} ref={measureRef} style={typography} aria-hidden />
        {result.segments.map((segment, segmentIndex) => {
          const segmentTokens = tokens.slice(segment.from, segment.to);
          const isFirstSegment = segmentIndex === 0;
          return (
            <div
              key={`${segment.from}-${segment.to}-${segmentIndex}`}
              className={`${P}-line${segment.justify ? ` ${P}-line-justify` : ''}`}
              aria-hidden
              style={{
                top: `${segment.top}px`,
                left: `${segment.left}px`,
                width: `${segment.width}px`,
                textAlign: segment.justify ? undefined : textAlign,
              }}
            >
              {segmentTokens.map((token, tokenIndex) => {
                const skipFirstChar = dropCapChar && isFirstSegment && segment.from === 0 && tokenIndex === 0;
                const text = skipFirstChar ? token.text.slice(1) : token.text;
                const leafStyle = getLeafCss(token.leaf);
                const body = token.href
                  ? <a className={`${P}-link`} href={token.href} target={token.target} style={leafStyle}>{text}</a>
                  : <span style={leafStyle}>{text}</span>;
                return (
                  <span key={tokenIndex}>
                    {!segment.justify && tokenIndex > 0 ? ' ' : null}
                    {body}
                  </span>
                );
              })}
            </div>
          );
        })}
        {showGuides && !draftContours && (
          <svg className={`${P}-guides`} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden>
            {rings.map((ring, ringIndex) => (
              <polygon key={ringIndex} points={ring.map(point => `${point.x},${point.y}`).join(' ')} />
            ))}
          </svg>
        )}
      </div>
      {dropCapChar && metrics && (
        <div
          className={`${P}-drop-cap`}
          aria-hidden
          style={{
            ...typography,
            top: `${result.capTop}px`,
            left: `${result.capLeft}px`,
            fontSize: `${lineHeightPx * dropCapSize}px`,
            lineHeight: `${lineHeightPx * dropCapSize}px`,
          }}
        >
          {dropCapChar}
        </div>
      )}
      {portalTarget && editorRect && ((draftContours && pathEditor) || imageEditor) && createPortal(
        <div
          data-selection="none"
          style={{
            position: 'fixed',
            top: editorRect.top,
            left: editorRect.left,
            width: editorRect.width,
            height: editorRect.height,
            zIndex: EDITOR_PORTAL_Z_INDEX,
            pointerEvents: 'none',
          }}
        >
          {draftContours && pathEditor && (
            <PretextPathEditor
              P={P}
              box={{ width: editorRect.width, height: editorRect.height }}
              viewBox={viewBox}
              contours={draftContours}
              snap={pathEditor.snap}
              stretchToBox={!exceedsEditViewBox}
              stage={editStage}
              onStageChange={setEditStage}
              onSelectionChange={onPathSelectionChange}
              onChange={pathEditor.onChange}
              onCommit={pathEditor.onCommit}
            />
          )}
          {imageEditor && shapeImageBounds && (
            <PretextImageEditor
              P={P}
              box={{ width: editorRect.width, height: editorRect.height }}
              bounds={shapeImageBounds}
              natural={naturalImageSize}
              imageUrl={imageUrl}
              maskPath={shapeImagePath}
              stage={editStage}
              onStageChange={setEditStage}
              focalX={activeImageFocalX}
              focalY={activeImageFocalY}
              scale={activeImageScale}
              onChange={imageEditor.onChange}
              onCommit={imageEditor.onCommit}
            />
          )}
        </div>,
        portalTarget,
      )}
      <div className={`${P}-a11y`}>
        {plainParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </div>
  );
}

export function Pretext({ settings, content, isEditor, isPreviewMode, isEditMode, isSelected, onUpdateSettings }: PretextProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const editor = isEditor ?? false;
  const selected = Boolean(isSelected) || Boolean(isEditMode);

  const item = useMemo<PretextContentItem>(
    () => (Array.isArray(content) ? content[0] ?? {} : {}),
    [content],
  );

  const shape = settings?.shape ?? 'rectangle';
  const customPath = settings?.customPath ?? '';
  const pathFit = settings?.pathFit ?? 'stretch';
  const viewBox = useMemo(() => parseViewBox(settings?.pathViewBox), [settings?.pathViewBox]);
  const mode = settings?.shapeMode === 'B' ? 'avoid' : 'contain';
  const align = settings?.textAlign ?? 'left';
  const allowOverflow = (settings?.overflowMode ?? 'clip') === 'visible';
  const fitEnabled = (settings?.fitText ?? 'off') === 'on';
  const dropCapLines = (settings?.dropCap ?? 'off') === 'on' ? Math.max(2, Math.round(settings?.dropCapLines ?? 3)) : 0;
  const dropCapSize = settings?.dropCapSize ?? DROP_CAP_SIZE_DEFAULT;
  const showGuides = editor && selected && !isPreviewMode;

  const [isItemTransforming, setIsItemTransforming] = useState(false);
  useEffect(() => {
    if (!editor || !selected) {
      setIsItemTransforming(false);
      return;
    }
    const start = () => setIsItemTransforming(true);
    const end = () => setIsItemTransforming(false);
    const startEvents = [
      'ArticleEditor.Item:drag-start',
      'ArticleEditor.Selection:resize-start',
      'ArticleEditor.Selection:move-start',
    ] as const;
    const endEvents = [
      'ArticleEditor.Item:drag-end',
      'ArticleEditor.Selection:resize-end',
      'ArticleEditor.Selection:move-end',
    ] as const;
    for (const name of startEvents) window.addEventListener(name, start);
    for (const name of endEvents) window.addEventListener(name, end);
    return () => {
      for (const name of startEvents) window.removeEventListener(name, start);
      for (const name of endEvents) window.removeEventListener(name, end);
    };
  }, [editor, selected]);

  /* -- vector editing ----------------------------------------------------- */

  const pathEditing = editor && selected && !isPreviewMode
    && typeof onUpdateSettings === 'function';
  const shapeOverlayVisible = !isItemTransforming;
  const pathSnap = Math.max(0, settings?.pathSnap ?? 0);
  const settingsRef = useRef(settings ?? {});
  const settingsPropsKeyRef = useRef('');
  const settingsPropsKey = [
    settings?.customPath,
    settings?.shape,
    settings?.pathFit,
    settings?.pathViewBox,
    settings?.imageScale,
    settings?.imageFocalX,
    settings?.imageFocalY,
    settings?.image,
  ].join('\0');
  if (settingsPropsKey !== settingsPropsKeyRef.current) {
    settingsPropsKeyRef.current = settingsPropsKey;
    settingsRef.current = settings ?? {};
  }
  const [draft, setDraft] = useState<{ base: string; serialized: string; contours: VecContour[] } | null>(null);
  const [pathDragActive, setPathDragActive] = useState(false);
  // Latched by the drag that set it and deliberately *not* cleared on commit —
  // the column reads it again after `pathDragActive` drops, to decide whether
  // the photo's new spot is the intended one. Cleared by the next drag.
  const [pathCarryImage, setPathCarryImage] = useState(false);
  const onCarryImageConsumed = useCallback(() => setPathCarryImage(false), []);

  const imageCustomPath = useMemo(() => {
    if (!draft || draft.serialized === customPath) return customPath;
    return draft.serialized;
  }, [draft, customPath]);

  useEffect(() => {
    if (!pathEditing) {
      setPathDragActive(false);
      setPathCarryImage(false);
    }
  }, [pathEditing]);

  const editContours = useMemo(() => {
    if (!pathEditing) return null;
    if (draft && (draft.base === customPath || draft.serialized === customPath)) return draft.contours;
    const parsed = parsePathNodes(customPath);
    return parsed.length ? parsed : null;
  }, [pathEditing, draft, customPath]);

  const isEditablePath = pathFit === 'viewbox'
    && (settings?.pathViewBox ?? '') === EDIT_VIEW_BOX
    && Boolean(editContours && !pathExceedsEditViewBox(editContours, viewBox));

  const writePath = useCallback((next: VecContour[], commit: boolean, options?: PathCommitOptions) => {
    const serialized = serializeContours(next);
    setDraft(previous => ({
      base: previous && (previous.base === customPath || previous.serialized === customPath)
        ? previous.base
        : customPath,
      serialized,
      contours: next,
    }));
    if (commit) {

      const latest = settingsRef.current;
      const nextShape = options?.preserveShape ? latest.shape : 'custom';
      const nextSettings = { ...latest, shape: nextShape, customPath: serialized };
      settingsRef.current = nextSettings;
      onUpdateSettings?.(nextSettings);
    }
  }, [customPath, onUpdateSettings]);

  const pathEditor = useMemo<PathEditorBinding | null>(() => {
    if (!pathEditing) return null;
    return {
      contours: isEditablePath ? editContours : null,
      snap: pathSnap,
      needsConversion: !isEditablePath,
      onConvert: (next: VecContour[]) => {
        const serialized = serializeContours(next);
        setDraft({ base: serialized, serialized, contours: next });
        const nextSettings = {
          ...settingsRef.current,
          pathFit: 'viewbox' as const,
          pathViewBox: EDIT_VIEW_BOX,
          customPath: serialized,
        };
        settingsRef.current = nextSettings;
        onUpdateSettings?.(nextSettings);
      },
      onChange: (next: VecContour[], options?: PathChangeOptions) => {
        setPathDragActive(true);
        setPathCarryImage(Boolean(options?.carryImage));
        writePath(next, false);
      },
      onCommit: (next: VecContour[], options?: PathCommitOptions) => {
        writePath(next, true, options);
        setPathDragActive(false);
      },
    };
  }, [pathEditing, isEditablePath, editContours, pathSnap, onUpdateSettings, writePath]);

  /* -- shape-image pan/zoom ------------------------------------------------ */

  const hasShapeImage = mode === 'avoid' && Boolean(settings?.image);
  const committedImageTransform = useMemo<ImageTransform>(() => ({
    focalX: settings?.imageFocalX ?? 0.5,
    focalY: settings?.imageFocalY ?? 0.5,
    scale: settings?.imageScale ?? 1,
  }), [settings?.imageFocalX, settings?.imageFocalY, settings?.imageScale]);
  const [imageDraft, setImageDraft] = useState<ImageTransform | null>(null);
  const liveImageTransform = imageDraft ?? committedImageTransform;

  const handleImageChange = useCallback((next: ImageTransform) => setImageDraft(next), []);
  const handleImageCommit = useCallback((next: ImageTransform) => {
    setImageDraft(next);
    const nextSettings = {
      ...settingsRef.current,
      imageFocalX: next.focalX,
      imageFocalY: next.focalY,
      imageScale: next.scale,
    };
    settingsRef.current = nextSettings;
    onUpdateSettings?.(nextSettings);
  }, [onUpdateSettings]);

  useEffect(() => {
    if (!imageDraft) return;
    if (
      Math.abs(imageDraft.focalX - committedImageTransform.focalX) < 1e-9
      && Math.abs(imageDraft.focalY - committedImageTransform.focalY) < 1e-9
      && Math.abs(imageDraft.scale - committedImageTransform.scale) < 1e-9
    ) {
      setImageDraft(null);
    }
  }, [imageDraft, committedImageTransform]);

  const imageEditor = useMemo<ImageEditorBinding | null>(() => {
    if (!pathEditing || !hasShapeImage) return null;
    return { onChange: handleImageChange, onCommit: handleImageCommit };
  }, [pathEditing, hasShapeImage, handleImageChange, handleImageCommit]);

  const [fitScale, setFitScale] = useState<number | undefined>(undefined);
  const fitScaleRef = useRef<number | undefined>(undefined);

  const handleFitScale = useCallback((value: number) => {
    const current = fitScaleRef.current;
    if (current !== undefined && Math.abs(current - value) < 0.005) return;
    fitScaleRef.current = value;
    setFitScale(value);
  }, []);

  const sharedScale = useMemo(() => (
    fitEnabled && typeof fitScale === 'number' ? fitScale : 1
  ), [fitScale, fitEnabled]);

  const fitVar = (value: string) => `calc(${value} * var(--${P}-fit, 1))`;

  const typography = useMemo<React.CSSProperties>(() => {
    const textFontSize = settings?.textFontSize ?? 0.012;
    const textLineHeight = Math.max(settings?.textLineHeight ?? textFontSize, textFontSize);
    return {
    fontFamily: normalizeFontFamilyCssValue(settings?.textFontFamily),
    fontWeight: settings?.textFontSettings?.fontWeight,
    fontStyle: settings?.textFontSettings?.fontStyle,
    fontSize: fitVar(scalingValue(textFontSize, editor)),
    lineHeight: fitVar(scalingValue(textLineHeight, editor)),
    letterSpacing: fitVar(scalingValue(settings?.textLetterSpacing ?? 0, editor)),
    wordSpacing: fitVar(scalingValue(settings?.textWordSpacing ?? 0, editor)),
    textTransform: settings?.textTextAppearance?.textTransform as React.CSSProperties['textTransform'],
    textDecoration: settings?.textTextAppearance?.textDecoration,
    fontVariant: settings?.textTextAppearance?.fontVariant,
  };
  }, [settings, editor, P]);

  const colorVars = {
    [`--${P}-text-color`]: settings?.textColor ?? '#000000',
    [`--${P}-link-color`]: settings?.linkColor ?? settings?.textColor ?? '#000000',
    [`--${P}-background-color`]: settings?.backgroundColor ?? 'transparent',
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        className={`${P}-wrapper`}
        style={{
          ...colorVars,
        }}
      >
        <PretextColumn
          P={P}
          item={item}
          shape={shape}
          customPath={customPath}
          pathFit={pathFit}
          viewBox={viewBox}
          mode={mode}
          align={align}
          allowOverflow={allowOverflow}
          fitEnabled={fitEnabled}
          scale={sharedScale}
          onFitScale={handleFitScale}
          dropCapLines={dropCapLines}
          dropCapSize={dropCapSize}
          showGuides={(showGuides || pathEditing) && shapeOverlayVisible}
          typography={typography}
          imageUrl={mode === 'avoid' ? settings?.image : null}
          imageFocalX={liveImageTransform.focalX}
          imageFocalY={liveImageTransform.focalY}
          imageScale={liveImageTransform.scale}
          imageCustomPath={imageCustomPath}
          pathDragActive={pathDragActive}
          pathCarryImage={pathCarryImage}
          onCarryImageConsumed={onCarryImageConsumed}
          pathEditor={shapeOverlayVisible ? pathEditor : null}
          imageEditor={shapeOverlayVisible ? imageEditor : null}
        />
      </div>
    </>
  );
}
