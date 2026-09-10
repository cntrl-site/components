import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import type React from 'react';
import type { ImageEditorProps, ImageTransform, Pt, ScaleCorner } from './Pretext';
import {
  bboxCorner,
  coveredImageSize,
  focalFromImageOffset,
  imageOffsetFromFocal,
  MAX_IMAGE_SCALE,
  MIN_IMAGE_SCALE,
  oppositeScaleCorner,
  scaleHandlePoint,
} from './imageUtils';

const KEYBOARD_SCALE_STEP = 1.08;
const SCALE_GRAB_SIZE = 14;
const SCALE_HANDLE_SIZE = 8;

type ImagePan = {
  pointerId: number;
  origin: Pt;
  startX: number;
  startY: number;
  width: number;
  height: number;
  moved: boolean;
};

type ImageScaleDrag = {
  pointerId: number;
  anchor: Pt;
  startDistance: number;
  startScale: number;
  startX: number;
  startY: number;
  moved: boolean;
};

export function PretextImageEditor({ P, box, bounds, natural, imageUrl, maskPath, stage, onStageChange, focalX, focalY, scale, onChange, onCommit }: ImageEditorProps) {
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
      const pointBox = toLocalPx(event.clientX, event.clientY);
      const point = { x: pointBox.x - bounds.x, y: pointBox.y - bounds.y };
      const distance = Math.hypot(point.x - scaleDrag.anchor.x, point.y - scaleDrag.anchor.y);
      const nextScale = Math.min(
        MAX_IMAGE_SCALE,
        Math.max(MIN_IMAGE_SCALE, scaleDrag.startScale * (distance / scaleDrag.startDistance)),
      );
      if (!scaleDrag.moved && Math.abs(nextScale - scaleDrag.startScale) < 1e-4) return;
      scaleDrag.moved = true;
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
