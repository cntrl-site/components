import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
const DROP_CAP_SIZE_RATIO = 0.92;
/**
 * The vector node editor is portaled straight to `document.body` so its
 * anchors can be grabbed even where a host app's own selection/resize
 * chrome renders in a sibling stacking context above this component's own
 * box — no z-index set inside that box could ever reach past it.
 */
const EDITOR_PORTAL_Z_INDEX = 999;

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
  path?: string;
};

type PretextSettings = {
  shape?: ShapeId;
  customPath?: string;
  pathFit?: PathFit;
  pathViewBox?: string;
  pathSnap?: number;
  shapeMode?: 'contain' | 'avoid';
  overflowMode?: 'clip' | 'visible';
  fitText?: 'on' | 'off';
  dropCap?: 'on' | 'off';
  dropCapLines?: number;
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
 * Top-left of an editable viewBox path's drawn outline. Used when swapping
 * presets so a shape that was dragged stays put instead of jumping to 0,0.
 */
function editablePathOrigin(previous?: {
  customPath?: string;
  pathFit?: string;
  pathViewBox?: string;
}): Pt {
  if (
    !previous
    || previous.pathFit !== 'viewbox'
    || previous.pathViewBox !== EDIT_VIEW_BOX
    || !previous.customPath
  ) {
    return { x: 0, y: 0 };
  }
  const contours = parsePathNodes(previous.customPath);
  if (!contours.length) return { x: 0, y: 0 };
  const bbox = contoursBBox(contours);
  if (!isFinite(bbox.minX) || !isFinite(bbox.minY)) return { x: 0, y: 0 };
  return { x: bbox.minX, y: bbox.minY };
}

/** Turns a preset into the editable viewBox path the editor persists after a shape pick. */
export function settingsForEditablePreset(
  shape: ShapeId,
  aspect = 1,
  previous?: { customPath?: string; pathFit?: string; pathViewBox?: string },
): {
  shape: 'custom';
  customPath: string;
  pathFit: 'viewbox';
  pathViewBox: string;
} {
  const origin = editablePathOrigin(previous);
  const rings = getPresetRings(shape === 'custom' ? 'rectangle' : shape, aspect);
  const contours = mapContours(
    ringsToContours(rings),
    point => ({ x: point.x * EDIT_SPAN + origin.x, y: point.y * EDIT_SPAN + origin.y }),
  );
  return {
    shape: 'custom',
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
  /* Pass through to default item select/drag until a path point is selected. */
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
  pointer-events: stroke;
  cursor: copy;
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
  pointer-events: fill;
  cursor: move;
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
/** How far from the outline a double-click still adds a point, in pixels. */
const ADD_POINT_REACH = 24;
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
  anchor: Pt;
  mirror: boolean;
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

type PathEditorProps = {
  P: string;
  box: { width: number; height: number };
  viewBox: ViewBox;
  contours: VecContour[];
  snap: number;
  onChange: (contours: VecContour[]) => void;
  onCommit: (contours: VecContour[]) => void;
};

function PretextPathEditor({ P, box, viewBox, contours, snap, onChange, onCommit }: PathEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const contoursRef = useRef(contours);
  contoursRef.current = contours;
  const dragRef = useRef<PathDrag | null>(null);
  const shapeDragRef = useRef<ShapeDrag | null>(null);
  const shapeScaleRef = useRef<ShapeScale | null>(null);
  const [selection, setSelection] = useState<PathSelection | null>(null);

  // 1 viewBox unit = 1 px here: the shape is pinned at its natural size, not
  // stretched to fill the box, so the edit handles must agree with that.
  const toPx = useCallback((point: Pt): Pt => ({
    x: point.x - viewBox.x,
    y: point.y - viewBox.y,
  }), [viewBox]);

  const toPath = useCallback((clientX: number, clientY: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: viewBox.x + (clientX - rect.left),
      y: viewBox.y + (clientY - rect.top),
    };
  }, [viewBox]);

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

  // The pointer is captured by the overlay for the whole drag, so the move and
  // release land here whatever they pass over — and stay off the editor around
  // us. Window listeners could not do both: swallowing the release to keep the
  // canvas out of it also kept it from ever reaching the window.
  const onPointerMove = (event: React.PointerEvent) => {
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
      if (!shapeDrag.moved && dx === 0 && dy === 0) return;
      shapeDrag.moved = true;
      onChange(mapContours(shapeDrag.startContours, p => ({ x: p.x + dx, y: p.y + dy })));
      return;
    }
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.stopPropagation();
    event.preventDefault();
    const point = toPath(event.clientX, event.clientY);
    const snapped = { x: snapValue(point.x, snap), y: snapValue(point.y, snap) };
    if (drag.kind === 'anchor') {
      let dx = snapped.x - drag.origin.x;
      let dy = snapped.y - drag.origin.y;
      if (event.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      // A click that never travels selects and nothing more.
      if (!drag.moved && dx === 0 && dy === 0) return;
      drag.moved = true;
      onChange(moveNodeTo(contoursRef.current, drag.contour, drag.node, {
        x: drag.anchor.x + dx,
        y: drag.anchor.y + dy,
      }));
      return;
    }
    drag.moved = true;
    onChange(setNodeHandle(contoursRef.current, drag.contour, drag.node, drag.kind, snapped, drag.mirror && !event.altKey));
  };

  const endDrag = (event: React.PointerEvent) => {
    const shapeScale = shapeScaleRef.current;
    if (shapeScale && event.pointerId === shapeScale.pointerId) {
      shapeScaleRef.current = null;
      event.stopPropagation();
      const svg = svgRef.current;
      if (svg?.hasPointerCapture(shapeScale.pointerId)) svg.releasePointerCapture(shapeScale.pointerId);
      if (shapeScale.moved) onCommit(contoursRef.current);
      return;
    }
    const shapeDrag = shapeDragRef.current;
    if (shapeDrag && event.pointerId === shapeDrag.pointerId) {
      shapeDragRef.current = null;
      event.stopPropagation();
      const svg = svgRef.current;
      if (svg?.hasPointerCapture(shapeDrag.pointerId)) svg.releasePointerCapture(shapeDrag.pointerId);
      if (shapeDrag.moved) {
        onCommit(contoursRef.current);
      } else {
        // A click that never travels deselects, same as the background surface.
        setSelection(null);
      }
      return;
    }
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    event.stopPropagation();
    const svg = svgRef.current;
    if (svg?.hasPointerCapture(drag.pointerId)) svg.releasePointerCapture(drag.pointerId);
    if (drag.moved) onCommit(contoursRef.current);
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
    setSelection(null);
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
      setSelection(kind === 'anchor' ? null : { contour: contourIndex, node: nodeIndex });
      onChange(next);
      onCommit(next);
      return;
    }
    setSelection({ contour: contourIndex, node: nodeIndex });
    dragRef.current = {
      kind,
      contour: contourIndex,
      node: nodeIndex,
      pointerId: event.pointerId,
      origin: toPath(event.clientX, event.clientY),
      anchor: node.p,
      mirror: kind !== 'anchor' && Boolean(node.in && node.out),
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
    setSelection({ contour: hit.contour, node: nodeIndex });
    onChange(next);
    onCommit(next);
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
      onCommit(next);
      return;
    }
    if (!selection) return;
    const { contour, node } = selection;
    if (event.key === 'Escape') {
      event.stopPropagation();
      setSelection(null);
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();
      const next = removeContourNode(contours, contour, node);
      if (next === contours) return;
      setSelection(null);
      onChange(next);
      onCommit(next);
      return;
    }
    const base = snap > 0 ? snap : NUDGE_STEP;
    const step = event.shiftKey ? base * 10 : base;
    const shift = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key as string];
    if (!shift) return;
    event.preventDefault();
    event.stopPropagation();
    const anchor = contours[contour]?.nodes[node]?.p;
    if (!anchor) return;
    const next = moveNodeTo(contours, contour, node, { x: anchor.x + shift[0], y: anchor.y + shift[1] });
    onChange(next);
    onCommit(next);
  };

  const outline = useMemo(() => serializeContours(mapContours(contours, toPx)), [contours, toPx]);
  const shapeBBox = useMemo(() => contoursBBox(contours), [contours]);
  const bboxTopLeft = toPx({ x: shapeBBox.minX, y: shapeBBox.minY });
  const showScaleHandles = !selection
    && isFinite(shapeBBox.minX)
    && isFinite(shapeBBox.maxX)
    && shapeBBox.maxX > shapeBBox.minX
    && shapeBBox.maxY > shapeBBox.minY;

  return (
    <svg
      ref={svgRef}
      className={`${P}-editor${selection ? ` ${P}-editor-armed` : ''}`}
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
      data-pretext-path-editor
      data-selection="none"
    >
      {/* Catches double-clicks that land near the outline rather than on it.
          It never stops propagation, so the editor still selects the item.
          Pointer events are off until a path point is selected (armed). */}
      <rect
        className={`${P}-editor-surface`}
        width={box.width}
        height={box.height}
        onPointerDown={() => setSelection(null)}
        onDoubleClick={insertNode}
      />
      <path className={`${P}-editor-hit`} d={outline} onDoubleClick={insertNode} />
      <path className={`${P}-editor-outline`} d={outline} />
      {/* Dragging anywhere inside the shape moves it as a whole, clamped to
          `box` in onPointerMove. Sits above the surface/hit paths, so it
          also takes over their double-click-to-insert-node duty. */}
      <path
        className={`${P}-editor-body`}
        d={outline}
        fillRule="evenodd"
        onPointerDown={startShapeDrag}
        onDoubleClick={insertNode}
      />
      {contours.map((contour, contourIndex) => contour.nodes.map((node, nodeIndex) => {
        const isSelected = selection?.contour === contourIndex && selection?.node === nodeIndex;
        const anchor = toPx(node.p);
        return (
          <g key={`${contourIndex}-${nodeIndex}`}>
            {isSelected && (['in', 'out'] as const).map((which) => {
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
                onCommit(next);
              }}
            />
          </g>
        );
      }))}
      {/* Uniform scale about the opposite corner. Shown when no point is
          selected (transform mode); click empty/body to dismiss a point. */}
      {showScaleHandles && (
        <g>
          <rect
            className={`${P}-editor-bbox`}
            x={bboxTopLeft.x}
            y={bboxTopLeft.y}
            width={shapeBBox.maxX - shapeBBox.minX}
            height={shapeBBox.maxY - shapeBBox.minY}
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
  showGuides: boolean;
  typography: React.CSSProperties;
  pathEditor?: PathEditorBinding | null;
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
  onChange: (contours: VecContour[]) => void;
  onCommit: (contours: VecContour[]) => void;
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
  showGuides,
  typography,
  pathEditor,
}: ColumnProps) {
  const [columnEl, setColumnEl] = useState<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [metrics, setMetrics] = useState<ColumnMetrics | null>(null);
  const [fontsReady, setFontsReady] = useState(0);

  const blocks = useMemo(() => (Array.isArray(item?.text) ? item.text : []), [item]);
  const tokens = useMemo(() => tokenize(blocks), [blocks]);
  const plainParagraphs = useMemo(() => getPlainText(blocks), [blocks]);
  const dropCapChar = dropCapLines > 0 ? (tokens[0]?.text?.charAt(0) ?? '') : '';

  const aspect = box.height > 0 ? box.width / box.height : 1;
  const draftContours = pathEditor?.contours ?? null;
  // Preset shapes (diamond, ellipse, circle, ...) have no declared size of
  // their own — they only ever make sense stretched to fill the box. An
  // actual path (a shared custom path, a per-column path override, or a live
  // vector-editor draft) does have a natural size, given by its viewBox —
  // `isPathShape` marks that case so it can be pinned instead of stretched.
  const { rings: unitRings, isPathShape } = useMemo(() => {
    if (draftContours) {
      const drawn = flattenContours(draftContours);
      if (drawn.length) return { rings: mapToViewBox(drawn, viewBox), isPathShape: true };
    }
    const spec = (item?.path ?? '').trim() || (shape === 'custom' ? customPath : '');
    const parsed = spec ? parsePathSpec(spec, pathFit, viewBox) : null;
    if (parsed && parsed.length) return { rings: parsed, isPathShape: true };
    return { rings: getPresetRings(shape === 'custom' ? 'rectangle' : shape, aspect), isPathShape: false };
    // aspect only matters for the circle preset; round it to avoid churn
  }, [draftContours, item?.path, shape, customPath, pathFit, viewBox, Math.round(aspect * 100) / 100]);

  // The layout math below (spansAtY etc.) treats rings as normalized 0..1
  // fractions of the box and multiplies them back out by box.width/height.
  // For an actual path, pre-scaling here by (natural size / box size) cancels
  // that multiplication out, so the shape ends up pinned at its own fixed
  // viewBox size, anchored to the component's top-left, instead of
  // stretching to fill the box. Presets keep the old fill-the-box behavior
  // until editing converts them — pin during that conversion so they don't
  // flash at full height first.
  const onConvertPath = pathEditor?.onConvert;
  const needsConversion = pathEditor?.needsConversion ?? false;
  // Conversion pins the path to the viewBox. Apply that pin on this first
  // paint too, otherwise the stretched preset flashes at full box height.
  const pinToViewBox = isPathShape || needsConversion;

  const rings = useMemo(() => {
    if (!pinToViewBox || box.width <= 0 || box.height <= 0) return unitRings;
    const scaleX = viewBox.width / box.width;
    const scaleY = viewBox.height / box.height;
    return unitRings.map(ring => ring.map(point => ({ x: point.x * scaleX, y: point.y * scaleY })));
  }, [unitRings, pinToViewBox, viewBox.width, viewBox.height, box.width, box.height]);

  useEffect(() => {
    if (!needsConversion || !onConvertPath || !unitRings.length) return;
    onConvertPath(mapContours(ringsToContours(unitRings), point => ({ x: point.x * EDIT_SPAN, y: point.y * EDIT_SPAN })));
  }, [needsConversion, onConvertPath, unitRings]);

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
    const lineHeight = Number.isNaN(parsedLineHeight) ? fontSize * 1.2 : parsedLineHeight;

    capSpan.style.fontSize = `${lineHeight * Math.max(1, dropCapLines) * DROP_CAP_SIZE_RATIO}px`;

    const widths = spans.map(span => span.getBoundingClientRect().width);
    const spaceWidth = spaceSpan.getBoundingClientRect().width;
    const capWidth = dropCapChar ? capSpan.getBoundingClientRect().width : 0;

    element.replaceChildren();
    setMetrics({ widths, spaceWidth, lineHeight, capWidth });
  }, [tokens, typography, dropCapChar, dropCapLines, fontsReady, box.width]);

  const capInset = metrics && dropCapChar ? metrics.capWidth + metrics.lineHeight * DROP_CAP_GAP : 0;

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
      capLines: dropCapChar ? dropCapLines : 0,
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
  }, [metrics, tokens, box.width, box.height, rings, mode, align, fitEnabled, capInset, dropCapChar, dropCapLines]);

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
      capLines: dropCapChar ? dropCapLines : 0,
    });
  }, [metrics, tokens, box.width, box.height, rings, mode, align, appliedScale, allowOverflow, capInset, dropCapChar, dropCapLines]);

  const lineHeightPx = metrics ? metrics.lineHeight * appliedScale : 0;
  const textAlign: React.CSSProperties['textAlign'] = align === 'justify' ? 'left' : align;

  const showPathEditor = Boolean(pathEditor && draftContours && box.width > 0 && box.height > 0);
  const editorRect = useFloatingRect(columnEl, showPathEditor);
  const portalTarget = showPathEditor && editorRect ? resolveEditorPortalTarget() : null;

  return (
    <div className={`${P}-column`} ref={setColumnEl}>
      <div
        className={`${P}-flow${allowOverflow ? '' : ` ${P}-clip`}`}
        style={{ ...typography, ['--' + P + '-fit']: appliedScale } as React.CSSProperties}
      >
        <div className={`${P}-measure`} ref={measureRef} style={typography} aria-hidden />
        {dropCapChar && metrics && (
          <div
            className={`${P}-drop-cap`}
            aria-hidden
            style={{
              top: `${result.capTop}px`,
              left: `${result.capLeft}px`,
              fontSize: `${lineHeightPx * Math.max(1, dropCapLines) * DROP_CAP_SIZE_RATIO}px`,
              lineHeight: `${lineHeightPx * Math.max(1, dropCapLines)}px`,
            }}
          >
            {dropCapChar}
          </div>
        )}
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
      {portalTarget && editorRect && draftContours && pathEditor && createPortal(
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
          <PretextPathEditor
            P={P}
            box={{ width: editorRect.width, height: editorRect.height }}
            viewBox={viewBox}
            contours={draftContours}
            snap={pathEditor.snap}
            onChange={pathEditor.onChange}
            onCommit={pathEditor.onCommit}
          />
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
  const mode = settings?.shapeMode ?? 'contain';
  const align = settings?.textAlign ?? 'left';
  const allowOverflow = (settings?.overflowMode ?? 'clip') === 'visible';
  const fitEnabled = (settings?.fitText ?? 'off') === 'on';
  const dropCapLines = (settings?.dropCap ?? 'off') === 'on' ? Math.max(2, Math.round(settings?.dropCapLines ?? 3)) : 0;
  const showGuides = editor && selected && !isPreviewMode;

  // Host editor signals item drag/resize/nudge on window — hide the shape overlay
  // for the same stretch so it doesn't float over the moving selection chrome.
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
  // The draft the handles are dragging. `base` is the stored path the session
  // started from, `serialized` what the draft writes out — while either still
  // matches the setting, the draft is the truth; anything else means the path
  // was changed elsewhere (the text field, undo) and the draft is dropped.
  const [draft, setDraft] = useState<{ base: string; serialized: string; contours: VecContour[] } | null>(null);

  const editContours = useMemo(() => {
    if (!pathEditing) return null;
    if (draft && (draft.base === customPath || draft.serialized === customPath)) return draft.contours;
    const parsed = parsePathNodes(customPath);
    return parsed.length ? parsed : null;
  }, [pathEditing, draft, customPath]);

  const isEditablePath = shape === 'custom'
    && pathFit === 'viewbox'
    && (settings?.pathViewBox ?? '') === EDIT_VIEW_BOX
    && Boolean(editContours);

  const writePath = useCallback((next: VecContour[], commit: boolean) => {
    const serialized = serializeContours(next);
    setDraft(previous => ({
      base: previous && (previous.base === customPath || previous.serialized === customPath)
        ? previous.base
        : customPath,
      serialized,
      contours: next,
    }));
    if (commit) onUpdateSettings?.({ ...settings, customPath: serialized });
  }, [customPath, onUpdateSettings, settings]);

  const pathEditor = useMemo<PathEditorBinding | null>(() => {
    if (!pathEditing) return null;
    return {
      contours: isEditablePath ? editContours : null,
      snap: pathSnap,
      needsConversion: !isEditablePath,
      onConvert: (next: VecContour[]) => {
        const serialized = serializeContours(next);
        setDraft({ base: serialized, serialized, contours: next });
        onUpdateSettings?.({
          ...settings,
          shape: 'custom',
          pathFit: 'viewbox',
          pathViewBox: EDIT_VIEW_BOX,
          customPath: serialized,
        });
      },
      onChange: (next: VecContour[]) => writePath(next, false),
      onCommit: (next: VecContour[]) => writePath(next, true),
    };
  }, [pathEditing, isEditablePath, editContours, pathSnap, onUpdateSettings, settings, writePath]);
  // The path is a component-wide setting, carried by the column unless it has
  // a path of its own.
  const usesSharedPath = !(item?.path ?? '').trim();

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

  const typography = useMemo<React.CSSProperties>(() => ({
    fontFamily: normalizeFontFamilyCssValue(settings?.textFontFamily),
    fontWeight: settings?.textFontSettings?.fontWeight,
    fontStyle: settings?.textFontSettings?.fontStyle,
    fontSize: fitVar(scalingValue(settings?.textFontSize ?? 0.012, editor)),
    lineHeight: fitVar(scalingValue(settings?.textLineHeight ?? settings?.textFontSize ?? 0.012, editor)),
    letterSpacing: fitVar(scalingValue(settings?.textLetterSpacing ?? 0, editor)),
    wordSpacing: fitVar(scalingValue(settings?.textWordSpacing ?? 0, editor)),
    textTransform: settings?.textTextAppearance?.textTransform as React.CSSProperties['textTransform'],
    textDecoration: settings?.textTextAppearance?.textDecoration,
    fontVariant: settings?.textTextAppearance?.fontVariant,
  }), [settings, editor, P]);

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
          showGuides={(showGuides || pathEditing) && shapeOverlayVisible}
          typography={typography}
          pathEditor={usesSharedPath && shapeOverlayVisible ? pathEditor : null}
        />
      </div>
    </>
  );
}
