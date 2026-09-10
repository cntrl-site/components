import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import {
  NO_GUIDES,
  axisCandidates,
  axisGuides,
  bakeUniformStretchToBoxStretch,
  centreGuide,
  clearNodeHandle,
  cloneContours,
  collectSnapTargets,
  contoursBBox,
  contoursCenter,
  insertNodeOnSegment,
  mapContours,
  moveNodeTo,
  moveSelectedNodesBy,
  nearestAxisSnap,
  nearestSegmentHit,
  nodeHasCurveHandles,
  removeContourNode,
  removeContourNodes,
  sameGuides,
  scaleContours,
  serializeContours,
  setNodeHandle,
  snapHandlePoint,
  snapValue,
  smoothTangent,
  toggleNodeSmooth,
} from './vecContours';
import type {
  GroupDrag,
  PathCommitOptions,
  PathDrag,
  PathEditorProps,
  PathSelection,
  Pt,
  ScaleCorner,
  ShapeDrag,
  ShapeScale,
  SnapGuide,
  VecContour,
} from './Pretext';
import { bboxCorner, oppositeScaleCorner, scaleHandlePoint } from './imageUtils';

const ADD_POINT_REACH = 24;
const ANCHOR_SIZE = 7;
const CLICK_SLOP_PX = 4;
const GRAB_RADIUS = 9;
const HANDLE_RADIUS = 3.5;
const KEYBOARD_SCALE_STEP = 1.08;
const MIN_SHAPE_SCALE = 0.05;
const NODE_SNAP_REACH = 14;
const NUDGE_STEP = 1;
const SCALE_GRAB_SIZE = 14;
const SCALE_HANDLE_SIZE = 8;

export function PretextPathEditor({ P, box, viewBox, contours, snap, stretchToBox, uniformStretch = false, stage, onStageChange, onSelectionChange, onChange, onCommit }: PathEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const bodyPathRef = useRef<SVGPathElement | null>(null);
  const contoursRef = useRef(contours);
  contoursRef.current = contours;
  const dragRef = useRef<PathDrag | null>(null);
  const shapeDragRef = useRef<ShapeDrag | null>(null);
  const shapeScaleRef = useRef<ShapeScale | null>(null);
  const groupDragRef = useRef<GroupDrag | null>(null);
  const [selection, setSelection] = useState<PathSelection[]>([]);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>(NO_GUIDES);
  const showSnapGuides = useCallback((next: SnapGuide[]) => {
    setSnapGuides(current => (sameGuides(current, next) ? current : next));
  }, []);
  const shapeArmed = stage === 'shape';

  useEffect(() => {
    if (shapeArmed) svgRef.current?.focus({ preventScroll: true });
  }, [shapeArmed]);

  useEffect(() => {
    if (!shapeArmed) setSelection(current => (current.length ? [] : current));
  }, [shapeArmed]);

  const hasSelection = selection.length > 0;
  useEffect(() => {
    onSelectionChange?.(hasSelection);
  }, [hasSelection, onSelectionChange]);
  useEffect(() => () => onSelectionChange?.(false), [onSelectionChange]);

  const scaleX = viewBox.width > 0 ? box.width / viewBox.width : 1;
  const scaleY = viewBox.height > 0 ? box.height / viewBox.height : 1;
  const uniformScale = Math.min(scaleX, scaleY);
  const stretchScaleX = stretchToBox && uniformStretch ? uniformScale : scaleX;
  const stretchScaleY = stretchToBox && uniformStretch ? uniformScale : scaleY;
  const stretchOffsetX = stretchToBox && uniformStretch
    ? (box.width - viewBox.width * uniformScale) / 2
    : 0;
  const stretchOffsetY = stretchToBox && uniformStretch
    ? (box.height - viewBox.height * uniformScale) / 2
    : 0;

  const toPx = useCallback((point: Pt): Pt => (
    stretchToBox
      ? {
        x: stretchOffsetX + (point.x - viewBox.x) * stretchScaleX,
        y: stretchOffsetY + (point.y - viewBox.y) * stretchScaleY,
      }
      : {
        x: point.x - viewBox.x,
        y: point.y - viewBox.y,
      }
  ), [stretchToBox, viewBox, stretchScaleX, stretchScaleY, stretchOffsetX, stretchOffsetY]);

  const fromPx = useCallback((point: Pt): Pt => (
    stretchToBox
      ? {
        x: viewBox.x + (stretchScaleX > 0 ? (point.x - stretchOffsetX) / stretchScaleX : 0),
        y: viewBox.y + (stretchScaleY > 0 ? (point.y - stretchOffsetY) / stretchScaleY : 0),
      }
      : {
        x: viewBox.x + point.x,
        y: viewBox.y + point.y,
      }
  ), [stretchToBox, viewBox, stretchScaleX, stretchScaleY, stretchOffsetX, stretchOffsetY]);

  const frameCenter = useMemo(() => fromPx({ x: box.width / 2, y: box.height / 2 }), [fromPx, box.width, box.height]);

  const toPath = useCallback((clientX: number, clientY: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    if (stretchToBox) {
      const localX = ((clientX - rect.left) / rect.width) * box.width;
      const localY = ((clientY - rect.top) / rect.height) * box.height;
      return {
        x: viewBox.x + (stretchScaleX > 0 ? (localX - stretchOffsetX) / stretchScaleX : 0),
        y: viewBox.y + (stretchScaleY > 0 ? (localY - stretchOffsetY) / stretchScaleY : 0),
      };
    }
    return {
      x: viewBox.x + (clientX - rect.left),
      y: viewBox.y + (clientY - rect.top),
    };
  }, [stretchToBox, viewBox, box.width, box.height, stretchScaleX, stretchScaleY, stretchOffsetX, stretchOffsetY]);

  const toLocalPx = useCallback((clientX: number, clientY: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * box.width,
      y: ((clientY - rect.top) / rect.height) * box.height,
    };
  }, [box.width, box.height]);

  const commitContours = useCallback((next: VecContour[], options?: PathCommitOptions) => {
    const payload = uniformStretch && !options?.preserveShape
      ? bakeUniformStretchToBoxStretch(
        next,
        viewBox,
        box,
        stretchOffsetX,
        stretchOffsetY,
        stretchScaleX,
        stretchScaleY,
      )
      : next;
    onCommit(payload, options);
  }, [onCommit, uniformStretch, viewBox, box, stretchOffsetX, stretchOffsetY, stretchScaleX, stretchScaleY]);

  const onPointerMove = (event: React.PointerEvent) => {
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
      const { bbox } = shapeDrag;
      const bboxWidth = bbox.maxX - bbox.minX;
      const bboxHeight = bbox.maxY - bbox.minY;
      const rawDx = point.x - shapeDrag.origin.x;
      const rawDy = point.y - shapeDrag.origin.y;
      let dx = rawDx;
      let dy = rawDy;
      if (isFinite(bboxWidth) && isFinite(bboxHeight)) {
        if (stretchToBox) {
          let boundMinX = viewBox.x;
          let boundMaxX = viewBox.x + viewBox.width;
          let boundMinY = viewBox.y;
          let boundMaxY = viewBox.y + viewBox.height;
          if (uniformStretch) {
            if (stretchScaleX > 0) {
              boundMinX = viewBox.x + (0 - stretchOffsetX) / stretchScaleX;
              boundMaxX = viewBox.x + (box.width - stretchOffsetX) / stretchScaleX;
            }
            if (stretchScaleY > 0) {
              boundMinY = viewBox.y + (0 - stretchOffsetY) / stretchScaleY;
              boundMaxY = viewBox.y + (box.height - stretchOffsetY) / stretchScaleY;
            }
          }
          const lowX = Math.min(boundMinX, boundMaxX - bboxWidth);
          const highX = Math.max(boundMinX, boundMaxX - bboxWidth);
          const lowY = Math.min(boundMinY, boundMaxY - bboxHeight);
          const highY = Math.max(boundMinY, boundMaxY - bboxHeight);
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
      const guides: SnapGuide[] = [];
      if (!freeDrag && isFinite(bboxWidth) && isFinite(bboxHeight)) {
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
      const raw = {
        x: drag.anchor.x + (point.x - drag.origin.x),
        y: drag.anchor.y + (point.y - drag.origin.y),
      };
      const targets = freeDrag ? [] : collectSnapTargets(contoursRef.current, { contour: drag.contour, node: drag.node });
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
      if (!drag.moved && landing.x === drag.anchor.x && landing.y === drag.anchor.y) return;
      drag.moved = true;
      showSnapGuides(axisGuides(landing, snapX, snapY, box, toPx));
      onChange(moveNodeTo(contoursRef.current, drag.contour, drag.node, landing));
      return;
    }
    const node = contoursRef.current[drag.contour]?.nodes[drag.node];
    const mirroring = drag.mirror && !event.altKey;
    const opposite = mirroring || freeDrag ? null : (drag.kind === 'in' ? node?.out : node?.in);
    const anchorPx = node ? toPx(node.p) : null;
    const oppositePx = opposite ? toPx(opposite) : null;
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
    const toggleOnRelease = event.metaKey || event.ctrlKey;
    if (kind === 'anchor' && event.shiftKey && !toggleOnRelease) {
      setSelection(current => (
        current.some(entry => entry.contour === contourIndex && entry.node === nodeIndex)
          ? current.filter(entry => !(entry.contour === contourIndex && entry.node === nodeIndex))
          : [...current, { contour: contourIndex, node: nodeIndex }]
      ));
      return;
    }
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
        event.preventDefault();
      }}
      data-pretext-path-editor
      data-selection="none"
    >
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
              rx={nodeHasCurveHandles(node) ? ANCHOR_SIZE / 2 : 0}
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
