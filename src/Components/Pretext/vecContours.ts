import { ringOf, DEFAULT_VIEW_BOX, mapToViewBox } from './rings';
import type {
  PathFit,
  Pt,
  Ring,
  ShapeId,
  SnapGuide,
  VecContour,
  VecNode,
  ViewBox,
} from './Pretext';

const PRESET_PATHS: Partial<Record<ShapeId, string>> = {
  bobbin: 'M57.63,0 L57.63,37.24 L74.66,37.24 L74.66,56.07 L57.63,100 L33.84,100 L16.81,56.07 L16.81,37.24 L33.84,37.24 L33.84,0 Z',
  circle: 'M50,0 C77.61,0 100,22.39 100,50 C100,77.61 77.61,100 50,100 C22.39,100 0,77.61 0,50 C0,22.39 22.39,0 50,0 Z',
  shield: 'M0,0 L100,0 L100,50 L50,100 L0,50 Z',
  vase: 'M25.37,0 L91.55,0 C91.55,0 74.8,25.14 83.07,50.03 C91.34,74.92 74.61,100 74.61,100 L8.43,100 C8.43,100 32.3,75.08 23.9,50 C15.5,24.92 25.37,0 25.37,0 Z',
  parallelogram: 'M25.37,0 L91.55,0 L74.61,100 L8.43,100 Z',
  diamond: 'M50,0 L80,50 L50,100 L20,50 Z',
};

export const EDIT_VIEW_BOX = '0 0 100 100';
export const EDIT_SPAN = 100;

const CURVE_SAMPLES = 16;
const CORNER_RING_LIMIT = 12;
const EDIT_NODE_TARGET = 16;
const PATH_COMMANDS = /([MmZzLlHhVvCcSsQqTtAa])([^MmZzLlHhVvCcSsQqTtAa]*)/g;
const PATH_NUMBERS = /[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;
const HANDLE_ANGLE_STEP = Math.PI / 4;
const HANDLE_ANGLE_REACH = 8;
const HANDLE_ANGLE_LIMIT = Math.PI / 18;
const HANDLE_LENGTH_REACH = 8;
const GUIDE_OVERSHOOT = 24;

type VecSegment = { from: VecNode; to: VecNode; index: number };

type AxisSnap = {
  value: number;
  axis: number | null;
  from: Pt | null;
};

export const NO_GUIDES: SnapGuide[] = [];

function unitRectangleContours(): VecContour[] {
  return [{
    closed: true,
    nodes: [
      { p: { x: 0, y: 0 }, in: null, out: null },
      { p: { x: 1, y: 0 }, in: null, out: null },
      { p: { x: 1, y: 1 }, in: null, out: null },
      { p: { x: 0, y: 1 }, in: null, out: null },
    ],
  }];
}

function mapContoursToViewBox(contours: VecContour[], viewBox: ViewBox): VecContour[] {
  return mapContours(contours, point => ({
    x: (point.x - viewBox.x) / viewBox.width,
    y: (point.y - viewBox.y) / viewBox.height,
  }));
}

function normalizeContours(contours: VecContour[]): VecContour[] {
  const bbox = contoursBBox(contours);
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) return contours;
  return mapContours(contours, point => ({
    x: (point.x - bbox.minX) / width,
    y: (point.y - bbox.minY) / height,
  }));
}

function letterboxUnitContours(
  contours: VecContour[],
  box: { width: number; height: number },
): VecContour[] {
  if (!(box.width > 0) || !(box.height > 0)) return contours;
  const side = Math.min(box.width, box.height);
  const ox = (box.width - side) / 2;
  const oy = (box.height - side) / 2;
  return mapContours(contours, point => ({
    x: (ox + point.x * side) / box.width,
    y: (oy + point.y * side) / box.height,
  }));
}

export function resolveUnitContours(
  spec: string,
  draft: VecContour[] | null | undefined,
  pathFit: PathFit,
  viewBox: ViewBox,
  shape: ShapeId,
  box: { width: number; height: number },
): VecContour[] {
  let contours: VecContour[] = [];
  if (draft && draft.length) {
    contours = mapContoursToViewBox(draft, viewBox);
  } else {
    const trimmed = spec.trim();
    if (trimmed && /^[Mm]/.test(trimmed)) {
      const parsed = parsePathNodes(trimmed);
      if (parsed.length) {
        contours = pathFit === 'viewbox'
          ? mapContoursToViewBox(parsed, viewBox)
          : normalizeContours(parsed);
      }
    }
    if (!contours.length) {
      const presetPath = shape !== 'custom' ? PRESET_PATHS[shape] : undefined;
      if (presetPath) {
        contours = mapContoursToViewBox(parsePathNodes(presetPath), DEFAULT_VIEW_BOX);
      } else {
        contours = unitRectangleContours();
      }
    }
  }
  return shape === 'circle' ? letterboxUnitContours(contours, box) : contours;
}

export function unitContoursToPathPx(
  contours: VecContour[],
  box: { width: number; height: number },
): string {
  if (!(box.width > 0) || !(box.height > 0) || !contours.length) return '';
  return serializeContours(mapContours(contours, point => ({
    x: point.x * box.width,
    y: point.y * box.height,
  })));
}

export function getPresetRings(shape: ShapeId | 'rectangle'): Ring[] {
  const presetPath = shape === 'rectangle' || shape === 'custom' ? undefined : PRESET_PATHS[shape];
  if (presetPath) {
    return mapToViewBox(flattenContours(parsePathNodes(presetPath)), DEFAULT_VIEW_BOX);
  }
  return [ringOf([[0, 0], [1, 0], [1, 1], [0, 1]])];
}

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

export function cloneContours(contours: VecContour[]): VecContour[] {
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

export function scaleContours(contours: VecContour[], origin: Pt, scaleX: number, scaleY: number = scaleX): VecContour[] {
  return mapContours(contours, point => ({
    x: origin.x + (point.x - origin.x) * scaleX,
    y: origin.y + (point.y - origin.y) * scaleY,
  }));
}

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
    nodes.push({ p: point, in: activeHandle(inHandle ?? null, point), out: null });
    current = point;
  };
  const setOut = (handle: Pt | null) => {
    if (!nodes.length) return;
    const node = nodes[nodes.length - 1];
    node.out = activeHandle(handle, node.p);
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

function activeHandle(handle: Pt | null | undefined, anchor: Pt): Pt | null {
  if (!handle) return null;
  if (Math.abs(handle.x - anchor.x) < 1e-6 && Math.abs(handle.y - anchor.y) < 1e-6) return null;
  return handle;
}

export function nodeHasCurveHandles(node: VecNode): boolean {
  return Boolean(activeHandle(node.in, node.p) || activeHandle(node.out, node.p));
}

function segmentIsStraight(from: VecNode, to: VecNode): boolean {
  return !activeHandle(from.out, from.p) && !activeHandle(to.in, to.p);
}

function segmentCommand(from: VecNode, to: VecNode): string {
  if (segmentIsStraight(from, to)) {
    return `L${formatCoordinate(to.p.x)},${formatCoordinate(to.p.y)}`;
  }
  const control1 = activeHandle(from.out, from.p) ?? from.p;
  const control2 = activeHandle(to.in, to.p) ?? to.p;
  return `C${formatCoordinate(control1.x)},${formatCoordinate(control1.y)}`
    + ` ${formatCoordinate(control2.x)},${formatCoordinate(control2.y)}`
    + ` ${formatCoordinate(to.p.x)},${formatCoordinate(to.p.y)}`;
}

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

export function contoursBBox(contours: VecContour[]): { minX: number; minY: number; maxX: number; maxY: number } {
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

export function contoursCenter(contours: VecContour[]): Pt | null {
  const bbox = contoursBBox(contours);
  if (!isFinite(bbox.minX) || !isFinite(bbox.maxX) || !isFinite(bbox.minY) || !isFinite(bbox.maxY)) return null;
  return { x: (bbox.minX + bbox.maxX) / 2, y: (bbox.minY + bbox.maxY) / 2 };
}

function smoothHandles(previous: Pt, point: Pt, next: Pt): { in: Pt; out: Pt } {
  const tangent = { x: (next.x - previous.x) / 6, y: (next.y - previous.y) / 6 };
  return {
    in: { x: point.x - tangent.x, y: point.y - tangent.y },
    out: { x: point.x + tangent.x, y: point.y + tangent.y },
  };
}

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

export function pathExceedsEditViewBox(contours: VecContour[], viewBox: ViewBox, pad = 1): boolean {
  if (!contours.length) return false;
  const bbox = contoursBBox(contours);
  if (!isFinite(bbox.minX) || !isFinite(bbox.maxX)) return false;
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  if (width <= viewBox.width * 2.5 && height <= viewBox.height * 2.5) {
    return false;
  }
  const padX = Math.max(pad, viewBox.width * 0.5);
  const padY = Math.max(pad, viewBox.height * 0.5);
  return bbox.minX < viewBox.x - padX
    || bbox.minY < viewBox.y - padY
    || bbox.maxX > viewBox.x + viewBox.width + padX
    || bbox.maxY > viewBox.y + viewBox.height + padY;
}

export function bakeUniformStretchToBoxStretch(
  contours: VecContour[],
  viewBox: ViewBox,
  box: { width: number; height: number },
  stretchOffsetX: number,
  stretchOffsetY: number,
  stretchScaleX: number,
  stretchScaleY: number,
): VecContour[] {
  const scaleX = viewBox.width > 0 ? box.width / viewBox.width : 1;
  const scaleY = viewBox.height > 0 ? box.height / viewBox.height : 1;
  if (!(stretchScaleX > 0) || !(stretchScaleY > 0) || !(scaleX > 0) || !(scaleY > 0)) return contours;
  return mapContours(contours, point => {
    const px = stretchOffsetX + (point.x - viewBox.x) * stretchScaleX;
    const py = stretchOffsetY + (point.y - viewBox.y) * stretchScaleY;
    return {
      x: viewBox.x + px / scaleX,
      y: viewBox.y + py / scaleY,
    };
  });
}

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

export function settingsForEditablePreset(
  shape: ShapeId,
): {
  shape: ShapeId;
  customPath: string;
  pathFit: 'viewbox';
  pathViewBox: string;
} {
  const target = { x: 0, y: 0, width: EDIT_SPAN, height: EDIT_SPAN };
  const presetPath = shape !== 'custom' ? PRESET_PATHS[shape] : undefined;
  const mapped = presetPath
    ? mapContours(
      parsePathNodes(presetPath),
      (point: Pt) => ({
        x: (point.x / 100) * target.width + target.x,
        y: (point.y / 100) * target.height + target.y,
      }),
    )
    : mapContours(
      ringsToContours(getPresetRings('rectangle')),
      point => ({ x: point.x * target.width + target.x, y: point.y * target.height + target.y }),
    );
  const contours = fitContoursInRect(mapped, target);
  return {
    shape,
    customPath: serializeContours(contours),
    pathFit: 'viewbox',
    pathViewBox: EDIT_VIEW_BOX,
  };
}

export function snapValue(value: number, step: number): number {
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

export function toggleNodeSmooth(contours: VecContour[], contourIndex: number, nodeIndex: number): VecContour[] {
  const contour = contours[contourIndex];
  const node = contour?.nodes[nodeIndex];
  if (!node) return contours;
  const next = cloneContours(contours);
  const nodes = next[contourIndex].nodes;
  const target = nodes[nodeIndex];
  const count = nodes.length;
  const prevIndex = (nodeIndex - 1 + count) % count;
  const nextIndex = (nodeIndex + 1) % count;
  const prevOut = Boolean(activeHandle(nodes[prevIndex].out, nodes[prevIndex].p));
  const nextIn = Boolean(activeHandle(nodes[nextIndex].in, nodes[nextIndex].p));
  if (nodeHasCurveHandles(target) || prevOut || nextIn) {
    target.in = null;
    target.out = null;
    nodes[prevIndex].out = null;
    nodes[nextIndex].in = null;
    return next;
  }
  const handles = smoothHandles(nodes[prevIndex].p, target.p, nodes[nextIndex].p);
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

export function collectSnapTargets(contours: VecContour[], exclude: { contour: number; node: number }): Pt[] {
  const points: Pt[] = [];
  contours.forEach((contour, contourIndex) => {
    contour.nodes.forEach((node, nodeIndex) => {
      if (contourIndex === exclude.contour && nodeIndex === exclude.node) return;
      points.push(node.p);
    });
  });
  return points;
}

export function axisCandidates(points: Pt[], centers: number[], axis: 'x' | 'y'): AxisSnap[] {
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

export function nearestAxisSnap(candidates: AxisSnap[], target: Pt, axis: 'x' | 'y', toPx: (point: Pt) => Pt, reach: number): AxisSnap | null {
  const targetPx = toPx(target)[axis];
  let best: AxisSnap | null = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const probe = axis === 'x' ? { x: candidate.value, y: target.y } : { x: target.x, y: candidate.value };
    const distance = Math.abs(toPx(probe)[axis] - targetPx);
    if (distance > reach) continue;
    if (best && distance >= bestDistance) continue;
    best = candidate;
    bestDistance = distance;
  }
  return best;
}

export function sameGuides(a: SnapGuide[], b: SnapGuide[]): boolean {
  return a.length === b.length && a.every((guide, index) => (
    guide.kind === b[index].kind
    && guide.a.x === b[index].a.x && guide.a.y === b[index].a.y
    && guide.b.x === b[index].b.x && guide.b.y === b[index].b.y
  ));
}

export function normalizeAngle(angle: number): number {
  const turn = Math.PI * 2;
  return ((angle + Math.PI) % turn + turn) % turn - Math.PI;
}

export function unitVector(from: Pt, to: Pt): Pt | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) return null;
  return { x: dx / length, y: dy / length };
}

export function alignmentGuide(from: Pt, to: Pt): SnapGuide {
  const direction = unitVector(from, to);
  if (!direction) return { kind: 'align', a: from, b: to };
  return {
    kind: 'align',
    a: { x: from.x - direction.x * GUIDE_OVERSHOOT, y: from.y - direction.y * GUIDE_OVERSHOOT },
    b: { x: to.x + direction.x * GUIDE_OVERSHOOT, y: to.y + direction.y * GUIDE_OVERSHOOT },
  };
}

export function centreGuide(at: number, axis: 'x' | 'y', frame: { width: number; height: number }): SnapGuide {
  return axis === 'x'
    ? { kind: 'center', a: { x: at, y: 0 }, b: { x: at, y: frame.height } }
    : { kind: 'center', a: { x: 0, y: at }, b: { x: frame.width, y: at } };
}

export function axisGuide(snap: AxisSnap, axis: 'x' | 'y', landingPx: Pt, frame: { width: number; height: number }, toPx: (point: Pt) => Pt): SnapGuide {
  if (snap.axis === null) return alignmentGuide(landingPx, toPx(snap.from ?? landingPx));
  const probe = axis === 'x' ? { x: snap.axis, y: 0 } : { x: 0, y: snap.axis };
  return centreGuide(toPx(probe)[axis], axis, frame);
}

export function axisGuides(
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

export function smoothTangent(
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
  const control = (which === 'in' ? neighbour.in : neighbour.out) ?? neighbour.p;
  return unitVector(toPx(control), anchorPx);
}

export function snapHandlePoint(
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
