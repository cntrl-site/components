import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import { EDIT_SPAN } from './vecContours';
import {
  coveredImageSize,
  imageOffsetFromFocal,
  preserveImageTransformAcrossBoundsChange,
} from './imageUtils';
import { PretextImageEditor } from './PretextImageEditor';
import { PretextPathEditor } from './PretextPathEditor';
import {
  getLeafCss,
  getPlainText,
  layoutText,
  tokenize,
} from './textLayout';
import type { LayoutResult } from './textLayout';
import type { ColumnMetrics, ColumnProps, EditStage, FrozenShapeImage, Ring } from './Pretext';
import {
  mapToViewBox,
  parsePathSpec,
  ringsBBoxPx,
  ringsToPathPx,
} from './rings';
import {
  flattenContours,
  getPresetRings,
  mapContours,
  parsePathNodes,
  pathExceedsEditViewBox,
  resolveUnitContours,
  ringsToContours,
  serializeContours,
  unitContoursToPathPx,
} from './vecContours';

const DROP_CAP_GAP = 0.12;
const EDITOR_PORTAL_Z_INDEX = 2;
const FIT_ITERATIONS = 10;
const MIN_FIT_SCALE = 0.25;

type FloatingRect = { top: number; left: number; width: number; height: number };

const readFloatingRect = (element: HTMLElement): FloatingRect => {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
};

const floatingRectsEqual = (a: FloatingRect, b: FloatingRect): boolean => (
  Math.abs(a.top - b.top) < 0.5
  && Math.abs(a.left - b.left) < 0.5
  && Math.abs(a.width - b.width) < 0.5
  && Math.abs(a.height - b.height) < 0.5
);

const useFloatingRect = (element: HTMLElement | null, active: boolean): FloatingRect | null => {
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
};

const letterboxUnitRings = (
  rings: Ring[],
  box: { width: number; height: number },
): Ring[] => {
  if (!(box.width > 0) || !(box.height > 0)) return rings;
  const side = Math.min(box.width, box.height);
  const ox = (box.width - side) / 2;
  const oy = (box.height - side) / 2;
  return rings.map(ring => ring.map(point => ({
    x: (ox + point.x * side) / box.width,
    y: (oy + point.y * side) / box.height,
  })));
};

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function resolveEditorPortalTarget(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.body;
}

export function PretextColumn({
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
  const dropCapChar = dropCapLines > 0 && dropCapSize > 1 ? (tokens[0]?.text?.charAt(0) ?? '') : '';

  const draftContours = pathEditor?.contours ?? null;
  const unitRings = useMemo(() => {
    let result: Ring[] = [];
    if (draftContours) {
      const drawn = flattenContours(draftContours);
      if (drawn.length) result = mapToViewBox(drawn, viewBox);
    }
    if (!result.length) {
      const spec = customPath.trim();
      const parsed = spec ? parsePathSpec(spec, pathFit, viewBox) : null;
      if (parsed && parsed.length) result = parsed;
      else result = getPresetRings(shape === 'custom' ? 'rectangle' : shape);
    }
    return shape === 'circle' ? letterboxUnitRings(result, box) : result;
  }, [draftContours, shape, customPath, pathFit, viewBox, box.width, box.height]);

  const onConvertPath = pathEditor?.onConvert;
  const needsConversion = pathEditor?.needsConversion ?? false;
  const exceedsEditViewBox = useMemo(() => {
    if (shape === 'circle') return false;
    const contours = draftContours
      ?? (customPath.trim() ? parsePathNodes(customPath) : null);
    return Boolean(contours && pathExceedsEditViewBox(contours, viewBox));
  }, [draftContours, customPath, viewBox, shape]);

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

  const committedUnitRings = useMemo(() => {
    if (draftContours) {
      const drawn = flattenContours(draftContours);
      if (drawn.length) {
        const mapped = mapToViewBox(drawn, viewBox);
        return shape === 'circle' ? letterboxUnitRings(mapped, box) : mapped;
      }
    }
    const spec = imageCustomPath.trim();
    const parsed = spec ? parsePathSpec(spec, pathFit, viewBox) : null;
    const base = parsed && parsed.length
      ? parsed
      : getPresetRings(shape === 'custom' ? 'rectangle' : shape);
    return shape === 'circle' ? letterboxUnitRings(base, box) : base;
  }, [draftContours, shape, imageCustomPath, pathFit, viewBox, box.width, box.height]);

  const imageRings = useMemo(() => {
    if (!exceedsEditViewBox || box.width <= 0 || box.height <= 0) return committedUnitRings;
    const ref = legacyRefBox ?? box;
    const scaleX = viewBox.width / ref.width;
    const scaleY = viewBox.height / ref.height;
    return committedUnitRings.map(ring => ring.map(point => ({ x: point.x * scaleX, y: point.y * scaleY })));
  }, [committedUnitRings, exceedsEditViewBox, legacyRefBox, viewBox.width, viewBox.height, box.width, box.height]);

  const migratedPathRef = useRef<string | null>(null);
  const didAutoConvertRef = useRef(false);
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

    if (!needsConversion || !unitRings.length || didAutoConvertRef.current) return;
    didAutoConvertRef.current = true;
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

    const capProbeChar = dropCapChar || 'H';
    const capSpan = document.createElement('span');
    capSpan.textContent = capProbeChar;
    capSpan.style.lineHeight = '1';
    fragment.appendChild(capSpan);

    element.replaceChildren(fragment);

    const computed = window.getComputedStyle(element);
    const fontSize = parseFloat(computed.fontSize) || 16;
    const parsedLineHeight = parseFloat(computed.lineHeight);
    const rawLineHeight = Number.isNaN(parsedLineHeight) ? fontSize * 1.2 : parsedLineHeight;
    const lineHeight = Math.max(rawLineHeight, fontSize);

    const ascentProbe = document.createElement('span');
    ascentProbe.textContent = capProbeChar;
    ascentProbe.style.lineHeight = `${lineHeight}px`;
    const ascentMarker = document.createElement('span');
    ascentMarker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    ascentProbe.appendChild(ascentMarker);
    element.appendChild(ascentProbe);

    const probeTop = ascentProbe.getBoundingClientRect().top;
    const markerTop = ascentMarker.getBoundingClientRect().top;
    const ascent = Math.max(1, markerTop - probeTop);
    ascentProbe.remove();

    // Tight capital ink height (cap-height). Sizing by line-box ascent makes the
    // visible letter short of N lines — same model as CSS initial-letter.
    let capHeight = ascent * 0.8;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontShorthand = (size: number) => (
      `${computed.fontStyle} ${computed.fontWeight} ${size}px ${computed.fontFamily}`
    );
    if (ctx) {
      ctx.font = fontShorthand(fontSize);
      const bodyInk = ctx.measureText(capProbeChar).actualBoundingBoxAscent;
      if (bodyInk > 0) capHeight = bodyInk;
    }

    const targetCapHeight = dropCapSize > 1
      ? (dropCapSize - 1) * lineHeight + capHeight
      : capHeight;
    let dropCapFontSize = fontSize * (targetCapHeight / capHeight);

    // Remeasure ink at the trial size — ratio is not perfectly linear.
    if (ctx) {
      ctx.font = fontShorthand(dropCapFontSize);
      const trialInk = ctx.measureText(capProbeChar).actualBoundingBoxAscent;
      if (trialInk > 0) dropCapFontSize = dropCapFontSize * (targetCapHeight / trialInk);
    }

    capSpan.style.fontSize = `${dropCapFontSize}px`;
    capSpan.style.lineHeight = `${dropCapFontSize}px`;
    const capMarker = document.createElement('span');
    capMarker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    capSpan.appendChild(capMarker);
    const dropAscent = Math.max(1, capMarker.getBoundingClientRect().top - capSpan.getBoundingClientRect().top);
    capMarker.remove();

    // `ascent` is measured with the body line-height, so it already includes half-leading.
    const nthBaselineFromTop = (dropCapSize - 1) * lineHeight + ascent;
    const dropCapTopAdjust = nthBaselineFromTop - dropAscent;

    const widths = spans.map(span => span.getBoundingClientRect().width);
    const spaceWidth = spaceSpan.getBoundingClientRect().width;
    const capWidth = dropCapChar ? capSpan.getBoundingClientRect().width : 0;

    element.replaceChildren();
    setMetrics({
      widths,
      spaceWidth,
      lineHeight,
      capWidth,
      dropCapFontSize,
      dropCapTopAdjust,
    });
  }, [tokens, typography, dropCapChar, dropCapLines, dropCapSize, fontsReady, box.width]);

  const capInset = metrics && dropCapChar ? metrics.capWidth + metrics.lineHeight * DROP_CAP_GAP : 0;
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

  const dropCapFontSizePx = metrics ? metrics.dropCapFontSize * appliedScale : 0;
  const dropCapTopAdjustPx = metrics ? metrics.dropCapTopAdjust * appliedScale : 0;
  const textAlign: React.CSSProperties['textAlign'] = align === 'justify' ? 'left' : align;

  const showPathEditor = Boolean(pathEditor && draftContours && box.width > 0 && box.height > 0);
  const canArmImage = Boolean(imageEditor);
  const showOverlayPortal = (showPathEditor || canArmImage) && box.width > 0 && box.height > 0;
  const editorRect = useFloatingRect(columnEl, showOverlayPortal);
  const portalTarget = showOverlayPortal && editorRect ? resolveEditorPortalTarget() : null;

  const pathHasSelectionRef = useRef(false);
  const onPathSelectionChange = useCallback((hasSelection: boolean) => {
    pathHasSelectionRef.current = hasSelection;
  }, []);

  useEffect(() => {
    if (!showPathEditor && !canArmImage) return;
    const onDblClick = (event: MouseEvent) => {
      const element = columnEl;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const within = event.clientX >= rect.left && event.clientX <= rect.right
        && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!within) return;
      event.preventDefault();
      event.stopPropagation();
      setEditStage((current) => {
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

  const imagePathAnchorRef = useRef<FrozenShapeImage | null>(null);
  const pathPreservedTransform = (() => {
    const anchor = imagePathAnchorRef.current;
    if (
      pathCarryImage
      || !imageEditor
      || !naturalImageSize
      || !committedShapeImageBounds
      || !anchor
      || imageCustomPath === anchor.customPath
    ) {
      return null;
    }
    if (anchor.shape !== shape && shape !== 'custom') {
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
    if (pathChanged && pathCarryImage) onCarryImageConsumed?.();
    imagePathAnchorRef.current = {
      rings: imageRings,
      bounds: committedShapeImageBounds,
      focalX: pathPreservedTransform?.focalX ?? imageFocalX,
      focalY: pathPreservedTransform?.focalY ?? imageFocalY,
      scale: pathPreservedTransform?.scale ?? imageScale,
      customPath: imageCustomPath,
      shape,
    };
  }, [
    pathDragActive,
    pathCarryImage,
    imageCustomPath,
    shape,
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

  const imageAnchor = imagePathAnchorRef.current;
  const freezeImage = Boolean(pathDragActive && !pathCarryImage && imageAnchor && !pathPreservedTransform);
  const activeImageFocalX = freezeImage && imageAnchor
    ? imageAnchor.focalX
    : (pathPreservedTransform?.focalX ?? imageFocalX);
  const activeImageFocalY = freezeImage && imageAnchor
    ? imageAnchor.focalY
    : (pathPreservedTransform?.focalY ?? imageFocalY);
  const activeImageScale = freezeImage && imageAnchor
    ? imageAnchor.scale
    : (pathPreservedTransform?.scale ?? imageScale);
  const placementBounds = freezeImage && imageAnchor ? imageAnchor.bounds : committedShapeImageBounds;

  const shapeFillPath = useMemo(() => {
    if (!(box.width > 0) || !(box.height > 0)) return '';
    let unit = resolveUnitContours(customPath, draftContours, pathFit, viewBox, shape, box);
    if (exceedsEditViewBox) {
      const ref = legacyRefBox ?? box;
      const scaleX = viewBox.width / ref.width;
      const scaleY = viewBox.height / ref.height;
      unit = mapContours(unit, point => ({ x: point.x * scaleX, y: point.y * scaleY }));
    }
    return unitContoursToPathPx(unit, box) || ringsToPathPx(rings, box);
  }, [
    customPath,
    draftContours,
    pathFit,
    viewBox,
    shape,
    box.width,
    box.height,
    exceedsEditViewBox,
    legacyRefBox,
    rings,
  ]);
  const shapeImagePath = useMemo(() => {
    if (!imageUrl || !(box.width > 0) || !(box.height > 0)) return '';
    let unit = resolveUnitContours(imageCustomPath, draftContours, pathFit, viewBox, shape, box);
    if (exceedsEditViewBox) {
      const ref = legacyRefBox ?? box;
      const scaleX = viewBox.width / ref.width;
      const scaleY = viewBox.height / ref.height;
      unit = mapContours(unit, point => ({ x: point.x * scaleX, y: point.y * scaleY }));
    }
    return unitContoursToPathPx(unit, box) || ringsToPathPx(imageRings, box);
  }, [
    imageUrl,
    imageCustomPath,
    draftContours,
    pathFit,
    viewBox,
    shape,
    box.width,
    box.height,
    exceedsEditViewBox,
    legacyRefBox,
    imageRings,
  ]);
  const clipId = `${imageId}-clip`;
  const imageRect = useMemo(() => {
    if (!placementBounds) return null;
    const natural = naturalImageSize ?? { width: placementBounds.width, height: placementBounds.height };
    const size = coveredImageSize(placementBounds, natural, activeImageScale);
    return {
      x: imageOffsetFromFocal(placementBounds.width, size.width, activeImageFocalX),
      y: imageOffsetFromFocal(placementBounds.height, size.height, activeImageFocalY),
      width: size.width,
      height: size.height,
    };
  }, [placementBounds, naturalImageSize, activeImageFocalX, activeImageFocalY, activeImageScale]);

  return (
    <div className={`${P}-column`} ref={setColumnEl}>
      {shapeFillPath ? (
        <svg
          className={`${P}-shape-fill`}
          viewBox={`0 0 ${box.width} ${box.height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path className={`${P}-shape-fill-path`} d={shapeFillPath} fillRule="evenodd" />
          {imageUrl && shapeImagePath && placementBounds && imageRect ? (
            <>
              <defs>
                <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                  <path d={shapeImagePath} fillRule="evenodd" />
                </clipPath>
              </defs>
              <image
                href={imageUrl}
                x={placementBounds.x + imageRect.x}
                y={placementBounds.y + imageRect.y}
                width={imageRect.width}
                height={imageRect.height}
                preserveAspectRatio="none"
                clipPath={`url(#${clipId})`}
              />
            </>
          ) : null}
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
                  ? <a className={`${P}-link`} href={token.href} target={token.target} rel={token.target ? 'noopener noreferrer' : undefined} style={leafStyle}>{text}</a>
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
            top: `${result.capTop + dropCapTopAdjustPx}px`,
            left: `${result.capLeft}px`,
            fontSize: `${dropCapFontSizePx}px`,
            lineHeight: `${dropCapFontSizePx}px`,
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
              uniformStretch={shape === 'circle'}
              stage={editStage}
              onStageChange={setEditStage}
              onSelectionChange={onPathSelectionChange}
              onChange={pathEditor.onChange}
              onCommit={pathEditor.onCommit}
            />
          )}
          {imageEditor && placementBounds && (
            <PretextImageEditor
              P={P}
              box={{ width: editorRect.width, height: editorRect.height }}
              bounds={placementBounds}
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
