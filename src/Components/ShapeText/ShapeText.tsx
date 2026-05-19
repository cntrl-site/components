import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  clearCache as clearPretextCache,
  layoutNextLineRange,
  materializeLineRange,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments
} from '@chenglou/pretext';
import { CommonComponentProps } from '../props';
import { scalingValue, useScopedStyles } from '../utils/index';
import {
  normalizeFontFamilyCssValue,
  omitTextColors,
  textStylesToCss,
  type TextStyles
} from '../utils/textStylesToCss';

type Point = { x: number; y: number };

export type ShapeTextSettings = {
  text?: string;
  points?: Point[];
  shapeClosed?: boolean;
  fontFamily?: string;
  fontSettings?: { fontWeight: number; fontStyle: string };
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  textAppearance?: TextStyles['textAppearance'];
  color?: string;
  bgColor?: string;
};

type ShapeTextProps = {
  settings: ShapeTextSettings;
  isEditor?: boolean;
  isPreviewMode?: boolean;
  onUpdateSettings?: (next: Record<string, unknown>) => void;
} & CommonComponentProps;

type Metrics = {
  width: number;
  height: number;
  fontPx: number;
  lineHeightPx: number;
  letterSpacingPx: number;
};

type RenderedLine = {
  text: string;
  x: number;
  y: number;
  width: number;
};

const DRAG_THRESHOLD_PX = 3;
const HIT_RADIUS_RATIO = 0.02;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getCSS(P: string): string {
  return `
.${P}-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.${P}-textLayer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.${P}-line {
  position: absolute;
  white-space: pre;
  pointer-events: none;
}
.${P}-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.${P}-svg.${P}-editable {
  cursor: crosshair;
  pointer-events: auto;
}
.${P}-shapeFill {
  fill: rgba(10, 0, 248, 0.08);
}
.${P}-shapeStroke {
  fill: none;
  stroke: #0A00F8;
  stroke-width: 1px;
  stroke-dasharray: 4 4;
  pointer-events: none;
  vector-effect: non-scaling-stroke;
}
.${P}-shapeStroke.${P}-closed {
  stroke-dasharray: none;
}
.${P}-handle {
  cursor: grab;
  pointer-events: auto;
  fill: #ffffff;
  stroke: #0A00F8;
  stroke-width: 1.5px;
  vector-effect: non-scaling-stroke;
  transition: r 120ms ease;
}
.${P}-handle.${P}-handleFirst {
  fill: #0A00F8;
}
.${P}-handle:hover {
  fill: #ffd400;
}
.${P}-handle.${P}-handleSelected {
  fill: #0A00F8;
  stroke: #ffffff;
}
.${P}-handle.${P}-handleDragging {
  cursor: grabbing;
}
.${P}-hint {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  padding: 4px 8px;
  font-family: -apple-system, system-ui, sans-serif;
  font-size: 11px;
  color: #ffffff;
  background: rgba(10, 0, 248, 0.85);
  border-radius: 3px;
  pointer-events: none;
  white-space: nowrap;
}
`;
}

function computeIntersectionXs(polygon: ReadonlyArray<Point>, y: number, height: number): number[] {
  const xs: number[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const ay = a.y * height;
    const by = b.y * height;
    if ((ay <= y && by > y) || (by <= y && ay > y)) {
      const t = (y - ay) / (by - ay);
      xs.push(a.x + t * (b.x - a.x));
    }
  }
  return xs;
}

function computeSpansAtPixelY(
  polygon: ReadonlyArray<Point>,
  yPx: number,
  width: number,
  height: number
): Array<[number, number]> {
  const xs = computeIntersectionXs(polygon, yPx, height);
  xs.sort((a, b) => a - b);
  const spans: Array<[number, number]> = [];
  for (let i = 0; i + 1 < xs.length; i += 2) {
    const left = xs[i] * width;
    const right = xs[i + 1] * width;
    if (right > left) spans.push([left, right]);
  }
  return spans;
}

function buildFontString(
  fontFamily: string | undefined,
  fontWeight: number,
  fontStyle: string,
  fontPx: number
): string {
  const family = normalizeFontFamilyCssValue(fontFamily) || 'sans-serif';
  return `${fontStyle} ${fontWeight} ${fontPx}px ${family}`;
}

export const ShapeText = ({
  settings,
  isEditor,
  isPreviewMode,
  onUpdateSettings
}: ShapeTextProps) => {
  const { prefix: P } = useScopedStyles();
  const {
    text = '',
    points = [],
    shapeClosed = false,
    fontFamily,
    fontSettings,
    fontSize = 0.015,
    lineHeight,
    letterSpacing = 0,
    wordSpacing = 0,
    textAppearance,
    color = '#000000',
    bgColor = 'transparent'
  } = settings;

  const fontWeight = fontSettings?.fontWeight ?? 400;
  const fontStyle = fontSettings?.fontStyle ?? 'normal';
  const effectiveLineHeight = lineHeight ?? fontSize * 1.2;

  const canvasRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    width: 0,
    height: 0,
    fontPx: 16,
    lineHeightPx: 19.2,
    letterSpacingPx: 0
  });
  const [fontsReadyVersion, setFontsReadyVersion] = useState(0);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    if (!canvas || !probe) return;

    const update = () => {
      const rect = canvas.getBoundingClientRect();
      const probeStyle = getComputedStyle(probe);
      const fontPx = parseFloat(probeStyle.fontSize) || 16;
      const parsedLineHeight = parseFloat(probeStyle.lineHeight);
      const lineHeightPx = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontPx * 1.2;
      const letterSpacingPx = parseFloat(probeStyle.letterSpacing) || 0;
      setMetrics(prev => {
        if (
          prev.width === rect.width &&
          prev.height === rect.height &&
          prev.fontPx === fontPx &&
          prev.lineHeightPx === lineHeightPx &&
          prev.letterSpacingPx === letterSpacingPx
        ) {
          return prev;
        }
        return {
          width: rect.width,
          height: rect.height,
          fontPx,
          lineHeightPx,
          letterSpacingPx
        };
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(canvas);
    ro.observe(probe);
    return () => ro.disconnect();
  }, [fontSize, effectiveLineHeight, letterSpacing, fontFamily, fontWeight, fontStyle, fontsReadyVersion]);

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      try {
        clearPretextCache();
      } catch {
        // ignore
      }
      setFontsReadyVersion(v => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontWeight, fontStyle]);

  const prepared = useMemo<PreparedTextWithSegments | null>(() => {
    if (!text || typeof window === 'undefined') return null;
    if (metrics.fontPx <= 0) return null;
    const fontStr = buildFontString(fontFamily, fontWeight, fontStyle, metrics.fontPx);
    try {
      return prepareWithSegments(text, fontStr, {
        whiteSpace: 'pre-wrap',
        letterSpacing: metrics.letterSpacingPx
      });
    } catch {
      return null;
    }
  }, [text, metrics.fontPx, metrics.letterSpacingPx, fontFamily, fontWeight, fontStyle, fontsReadyVersion]);

  const renderedLines = useMemo<RenderedLine[]>(() => {
    if (!prepared) return [];
    const { width: W, height: H, lineHeightPx } = metrics;
    if (W <= 0 || H <= 0 || lineHeightPx <= 0) return [];

    const polygon: Point[] = shapeClosed && points.length >= 3
      ? points
      : [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 }
        ];

    let yMin = Infinity;
    let yMax = -Infinity;
    for (const p of polygon) {
      const yPx = p.y * H;
      if (yPx < yMin) yMin = yPx;
      if (yPx > yMax) yMax = yPx;
    }
    yMin = Math.max(0, yMin);
    yMax = Math.min(H, yMax);

    const result: RenderedLine[] = [];
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
    let lineTop = yMin;
    let safetyGuard = 0;
    const maxIterations = 5000;

    while (lineTop + lineHeightPx <= yMax + 0.5 && safetyGuard < maxIterations) {
      safetyGuard += 1;
      const midY = lineTop + lineHeightPx * 0.5;
      const spans = computeSpansAtPixelY(polygon, midY, W, H);
      for (const [xIn, xOut] of spans) {
        const maxW = xOut - xIn;
        if (maxW <= 0) continue;
        const range = layoutNextLineRange(prepared, cursor, maxW);
        if (range === null) return result;
        const line = materializeLineRange(prepared, range);
        result.push({
          text: line.text,
          x: xIn,
          y: lineTop,
          width: maxW
        });
        cursor = range.end;
      }
      lineTop += lineHeightPx;
    }
    return result;
  }, [prepared, metrics, points, shapeClosed]);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [livePoints, setLivePoints] = useState<Point[] | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const dragRef = useRef<{
    idx: number;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    moved: boolean;
  } | null>(null);

  const canvasGestureRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    target: Element;
  } | null>(null);

  const commitPoints = useCallback(
    (next: Point[], extra?: Record<string, unknown>) => {
      onUpdateSettings?.({ points: next, ...(extra ?? {}) });
    },
    [onUpdateSettings]
  );

  useEffect(() => {
    if (!isEditor) return;
    if (selectedIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const idx = selectedIdx;
        const nextPoints = points.filter((_, i) => i !== idx);
        const stillClosed = shapeClosed && nextPoints.length >= 3;
        commitPoints(nextPoints, { shapeClosed: stillClosed });
        setSelectedIdx(null);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIdx(null);
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [isEditor, selectedIdx, points, shapeClosed, commitPoints]);

  useEffect(() => {
    if (!isPreviewMode) setSelectedIdx(null);
  }, [isPreviewMode]);

  const handleHandlePointerDown = (e: ReactPointerEvent<SVGCircleElement>, idx: number) => {
    if (!isEditor || !isPreviewMode) return;
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = {
      idx,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: false
    };
    setSelectedIdx(idx);
  };

  const handleHandlePointerMove = (e: ReactPointerEvent<SVGCircleElement>) => {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startClientX;
    const dy = e.clientY - s.startClientY;
    if (!s.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    if (!s.moved) {
      s.moved = true;
      setDraggingIdx(s.idx);
      setLivePoints(points);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    setLivePoints(prev => {
      const base = prev ?? points;
      return base.map((p, i) => (i === s.idx ? { x: nx, y: ny } : p));
    });
  };

  const handleHandlePointerUp = (e: ReactPointerEvent<SVGCircleElement>) => {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = null;
    setDraggingIdx(null);

    if (s.moved) {
      const final = livePoints ?? points;
      setLivePoints(null);
      commitPoints(final);
    } else {
      setLivePoints(null);
      if (s.idx === 0 && !shapeClosed && points.length >= 3) {
        onUpdateSettings?.({ shapeClosed: true });
      }
    }
  };

  const handleHandlePointerCancel = (e: ReactPointerEvent<SVGCircleElement>) => {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDraggingIdx(null);
    setLivePoints(null);
  };

  const handleSvgPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!isEditor || !isPreviewMode) return;
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    canvasGestureRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      target
    };
  };

  const handleSvgPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    const g = canvasGestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    try {
      g.target.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    canvasGestureRef.current = null;
    const moved = Math.hypot(e.clientX - g.startClientX, e.clientY - g.startClientY);
    if (moved >= DRAG_THRESHOLD_PX) return;
    if (selectedIdx !== null) {
      setSelectedIdx(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const nextPoints = [...points, { x, y }];
    commitPoints(nextPoints);
    setSelectedIdx(nextPoints.length - 1);
  };

  const displayPoints = livePoints ?? points;
  const interactive = Boolean(isEditor && isPreviewMode);

  const fontFamilyCss = normalizeFontFamilyCssValue(fontFamily);
  const probeStyle: CSSProperties = {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    top: 0,
    left: 0,
    whiteSpace: 'nowrap',
    fontFamily: fontFamilyCss,
    fontWeight,
    fontStyle,
    fontSize: scalingValue(fontSize, isEditor),
    lineHeight: scalingValue(effectiveLineHeight, isEditor),
    letterSpacing: scalingValue(letterSpacing, isEditor),
    wordSpacing: scalingValue(wordSpacing, isEditor)
  };

  const textStyles: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight,
      fontStyle
    },
    fontSize,
    lineHeight: effectiveLineHeight,
    letterSpacing,
    wordSpacing,
    textAppearance,
    color
  };
  const typographyCss = omitTextColors(textStylesToCss(textStyles, isEditor));

  const polygonPath = displayPoints.length === 0
    ? ''
    : displayPoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.x * metrics.width).toFixed(2)},${(p.y * metrics.height).toFixed(2)}`)
        .join(' ') + (shapeClosed ? ' Z' : '');

  const handleRadius = Math.max(4, Math.min(metrics.width, metrics.height) * HIT_RADIUS_RATIO);

  const canCloseHint = !shapeClosed && displayPoints.length >= 3;

  return (
    <div
      ref={canvasRef}
      className={`${P}-canvas`}
      style={{
        backgroundColor: bgColor,
        color,
        ...typographyCss
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <span ref={probeRef} className={`${P}-probe`} style={probeStyle} aria-hidden>
        M
      </span>
      <div className={`${P}-textLayer`}>
        {renderedLines.map((line, i) => (
          <div
            key={i}
            className={`${P}-line`}
            style={{
              left: `${line.x}px`,
              top: `${line.y}px`,
              width: `${line.width}px`,
              height: `${metrics.lineHeightPx}px`,
              lineHeight: `${metrics.lineHeightPx}px`,
              color
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
      {interactive && (
        <svg
          className={`${P}-svg ${P}-editable`}
          viewBox={`0 0 ${Math.max(1, metrics.width)} ${Math.max(1, metrics.height)}`}
          preserveAspectRatio="none"
          onPointerDown={handleSvgPointerDown}
          onPointerUp={handleSvgPointerUp}
        >
          {displayPoints.length >= 2 && (
            <>
              {shapeClosed && (
                <path className={`${P}-shapeFill`} d={polygonPath} />
              )}
              <path
                className={`${P}-shapeStroke${shapeClosed ? ` ${P}-closed` : ''}`}
                d={polygonPath}
              />
            </>
          )}
          {displayPoints.map((p, i) => {
              const isSelected = selectedIdx === i;
              const isDragging = draggingIdx === i;
              const isFirst = i === 0 && !shapeClosed && displayPoints.length >= 3;
              return (
                <circle
                  key={i}
                  className={[
                    `${P}-handle`,
                    isSelected ? `${P}-handleSelected` : '',
                    isDragging ? `${P}-handleDragging` : '',
                    isFirst ? `${P}-handleFirst` : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  cx={p.x * metrics.width}
                  cy={p.y * metrics.height}
                  r={isSelected ? handleRadius * 1.15 : handleRadius}
                  onPointerDown={e => handleHandlePointerDown(e, i)}
                  onPointerMove={handleHandlePointerMove}
                  onPointerUp={handleHandlePointerUp}
                  onPointerCancel={handleHandlePointerCancel}
                />
              );
            })}
        </svg>
      )}
      {interactive && (canCloseHint || displayPoints.length === 0) && (
        <div className={`${P}-hint`}>
          {displayPoints.length === 0
            ? 'Click to add points • close shape to constrain text'
            : 'Click the first point to close the shape'}
        </div>
      )}
    </div>
  );
};
