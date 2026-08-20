import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { textStylesToCss } from '../utils/textStylesToCss';

function getCSS(P: string, setWidthPx: number, isCurve: boolean): string {
  const distance = setWidthPx > 0 ? `${setWidthPx}px` : '0px';
  const curveCss = isCurve ? `
.${P}-item-image-wrap {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}
.${P}-glyph {
  display: inline-block;
}
.${P}-glyph-inner {
  display: inline-block;
  transform-origin: 50% 50%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.${P}-item-image {
  transform-origin: 50% 50%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
` : '';
  return `
.${P}-wrapper {
  position: relative;
  width: 100%;
  height: auto;
}
.${P}-marquee-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: auto;
}
.${P}-curve-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 0;
}

@keyframes ${P}-marquee-left {
  from { -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); }
  to { -webkit-transform: translate3d(-${distance}, 0, 0); transform: translate3d(-${distance}, 0, 0); }
}

@keyframes ${P}-marquee-right {
  from { -webkit-transform: translate3d(-${distance}, 0, 0); transform: translate3d(-${distance}, 0, 0); }
  to { -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); }
}

.${P}-marquee-track {
  display: flex;
  flex-direction: row;
  width: max-content;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  flex-wrap: nowrap;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  position: relative;
  z-index: 1;
}
.${P}-marquee-track[data-direction="left"] {
  -webkit-animation-name: ${P}-marquee-left;
  animation-name: ${P}-marquee-left;
}
.${P}-marquee-track[data-direction="right"] {
  -webkit-animation-name: ${P}-marquee-right;
  animation-name: ${P}-marquee-right;
}
.${P}-marquee-set {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
}
.${P}-marquee-static {
  justify-content: center;
  overflow-x: auto;
}
.${P}-item {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 0 0 auto;
  white-space: nowrap;
}
.${P}-item-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
.${P}-item-image {
  display: block;
  width: auto;
  flex: 0 0 auto;
  object-fit: contain;
}
.${P}-text {
  display: inline-block;
}
${curveCss}
.${P}-cap-ref {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
  left: -9999px;
  top: 0;
}
`;
}

const PX_PER_SEC_PER_SPEED_UNIT = 30;
const MIN_CONTENT_SEQUENCE_REPEAT = 3;
const MAX_CONTENT_SEQUENCE_REPEAT = 12;
const OUTER_SET_COPIES = 3;
const DEFAULT_CAP_HEIGHT_RATIO = 0.72;

const restartTrackAnimation = (track: HTMLElement) => {
  track.style.setProperty('animation-name', 'none');
  track.style.setProperty('-webkit-animation-name', 'none');
  void track.offsetHeight;
  track.style.removeProperty('animation-name');
  track.style.removeProperty('-webkit-animation-name');
};

const expandSetContent = (items: MarqueeTextItem[], repeat: number): MarqueeTextItem[] => {
  const result: MarqueeTextItem[] = [];
  for (let i = 0; i < repeat; i++) result.push(...items);
  return result;
};

let sharedCanvasCtx: CanvasRenderingContext2D | null | undefined;
const getSharedCanvasCtx = (): CanvasRenderingContext2D | null => {
  if (sharedCanvasCtx !== undefined) return sharedCanvasCtx;
  if (typeof document === 'undefined') {
    sharedCanvasCtx = null;
    return sharedCanvasCtx;
  }
  sharedCanvasCtx = document.createElement('canvas').getContext('2d');
  return sharedCanvasCtx;
};

type MarqueeTextItemViewProps = {
  item: MarqueeTextItem;
  prefix: string;
  textCss: CSSProperties;
  capHeightPx: number;
  opticalOffsetY: number;
  imageGapPx: string;
  isCurve: boolean;
};

const applyWaveTransform = (el: HTMLElement, y: number, rotateDeg: number) => {
  el.style.transform = `translate3d(0, ${y}px, 0) rotate(${rotateDeg}deg)`;
};

const clearWaveTransform = (el: HTMLElement) => {
  el.style.transform = '';
};

const buildCurveBackgroundPath = (
  width: number,
  amplitude: number,
  frequency: number,
  centerY: number,
): string => {
  const samples = Math.max(48, Math.ceil(Math.max(0, frequency) * 32));
  const k = width > 0 ? (2 * Math.PI * Math.max(0, frequency)) / width : 0;
  const parts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * width;
    const y = centerY + amplitude * Math.sin(k * x);
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join(' ');
};

const MarqueeTextItemView = ({ item, prefix: P, textCss, capHeightPx, opticalOffsetY, imageGapPx, isCurve }: MarqueeTextItemViewProps) => {
  const textStyle: CSSProperties = opticalOffsetY !== 0 ? { ...textCss, transform: `translateY(${opticalOffsetY}px)` } : textCss;
  const imageHeightStyle: CSSProperties = capHeightPx > 0 ? { height: `${capHeightPx}px` } : { fontSize: textCss.fontSize, height: `${DEFAULT_CAP_HEIGHT_RATIO}em` };
  const image = item.image?.url && (
    <img
      src={item.image.url}
      alt={item.image.name ?? ''}
      className={`${P}-item-image`}
      style={imageHeightStyle}
    />
  );
  const imageNode = image && (isCurve
    ? <span className={`${P}-item-image-wrap`} data-marquee-wave-node>{image}</span>
    : image);
  const textNode = isCurve
    ? (
      <span className={`${P}-text`} style={textStyle}>
        {Array.from(item.text).map((char, index) => (
          <span key={index} className={`${P}-glyph`} data-marquee-wave-node>
            <span className={`${P}-glyph-inner`}>{char === ' ' ? '\u00A0' : char}</span>
          </span>
        ))}
      </span>
    )
    : <span className={`${P}-text`} style={textStyle}>{item.text}</span>;
  const content = (
    <>
      {imageNode}
      {textNode}
    </>
  );
  return (
    <div className={`${P}-item`} data-marquee-text-item style={{ gap: imageGapPx }}>
      {item.link
        ? (
          <a href={item.link} target="_self" rel="noopener noreferrer" className={`${P}-item-link`} style={{ gap: imageGapPx }}>
            {content}
          </a>
        )
        : content}
    </div>
  );
};

export const MarqueeText = ({ settings, content, isEditor, isPreviewMode, isEditMode }: MarqueeTextProps) => {
  const { prefix: P } = useScopedStyles();
  const [setWidth, setSetWidth] = useState(0);
  const animationDistance = setWidth > 0 ? Math.round(setWidth) : 0;
  const {
    speed,
    direction,
    pauseOnHover,
    gap,
    layoutType,
    curveAmplitude,
    curveFrequency,
    angle,
    textFontFamily,
    textFontSettings,
    textFontSize,
    textLineHeight,
    textLetterSpacing,
    textWordSpacing,
    textTextAppearance,
    textColor,
    backgroundColor,
  } = settings;
  const isCurveLayout = layoutType === 'curve';
  const scopedCss = useMemo(() => getCSS(P, animationDistance, isCurveLayout), [P, animationDistance, isCurveLayout]);

  const textCss = useMemo<CSSProperties>(() => textStylesToCss({
    fontSettings: {
      fontFamily: textFontFamily,
      fontWeight: textFontSettings.fontWeight,
      fontStyle: textFontSettings.fontStyle,
    },
    letterSpacing: textLetterSpacing,
    wordSpacing: textWordSpacing,
    fontSize: textFontSize,
    lineHeight: textLineHeight,
    textAppearance: textTextAppearance,
    color: textColor,
  }, isEditor), [textFontFamily, textFontSettings, textLetterSpacing, textWordSpacing, textFontSize, textLineHeight, textTextAppearance, textColor, isEditor]);

  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const originalItemCount = content?.length ?? 0;
  const hasContent = originalItemCount > 0;
  const autoplayEnabled = isEditor ? Boolean(isPreviewMode) : true;
  const useMarqueeTrack = hasContent && (autoplayEnabled || Boolean(isEditor));
  const pxPerSec = Math.max(0, speed) * PX_PER_SEC_PER_SPEED_UNIT;
  const hoverPauseEnabled = autoplayEnabled && pauseOnHover === 'on';
  const [isHovering, setIsHovering] = useState(false);
  void isEditMode;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const capRefEl = useRef<HTMLSpanElement | null>(null);
  const [capHeightPx, setCapHeightPx] = useState(0);
  const [opticalOffsetY, setOpticalOffsetY] = useState(0);
  const [curveBandHeightPx, setCurveBandHeightPx] = useState(0);
  const [curveWidthPx, setCurveWidthPx] = useState(0);

  const contentKey = useMemo(
    () => (content ?? []).map((i) => `${i.text}${i.image?.url ?? ''}`).join(' '),
    [content],
  );
  const [contentSequenceRepeat, setContentSequenceRepeat] = useState(MIN_CONTENT_SEQUENCE_REPEAT);
  const setContent = useMemo(() => {
    const items = content ?? [];
    if (items.length === 0) return items;
    if (!(autoplayEnabled || isEditor)) return items;
    return expandSetContent(items, contentSequenceRepeat);
  }, [content, autoplayEnabled, contentSequenceRepeat, isEditor]);
  const copies = useMarqueeTrack ? OUTER_SET_COPIES : 1;

  useLayoutEffect(() => {
    setContentSequenceRepeat(MIN_CONTENT_SEQUENCE_REPEAT);
    setSetWidth(0);
  }, [contentKey]);

  // Cap-height + optical vertical offset: canvas metrics size images to the glyph
  // cap height and shift text so empty space above/below ink is equal in the line box.
  useLayoutEffect(() => {
    const el = capRefEl.current;
    if (!el) return;
    const measure = () => {
      const computed = getComputedStyle(el);
      const fontSizePx = parseFloat(computed.fontSize) || 0;
      if (fontSizePx <= 0) return;
      const ctx = getSharedCanvasCtx();
      if (!ctx) {
        setCapHeightPx(fontSizePx * DEFAULT_CAP_HEIGHT_RATIO);
        setOpticalOffsetY(0);
        return;
      }
      ctx.font = `${computed.fontStyle} ${computed.fontWeight} ${fontSizePx}px ${computed.fontFamily}`;
      const metrics = ctx.measureText('H');
      const inkAscent = metrics.actualBoundingBoxAscent > 0
        ? metrics.actualBoundingBoxAscent
        : fontSizePx * DEFAULT_CAP_HEIGHT_RATIO;
      const inkDescent = Math.max(0, metrics.actualBoundingBoxDescent || 0);
      const fontAscent = metrics.fontBoundingBoxAscent || 0;
      const fontDescent = metrics.fontBoundingBoxDescent || 0;
      setCapHeightPx((prev) => (Math.abs(prev - inkAscent) > 0.5 ? inkAscent : prev));
      // Equalize empty space above/below ink inside the font bounding box (half-leading
      // is already symmetric, so only the font-box asymmetry needs correcting).
      const nextOffset = (fontAscent > 0 || fontDescent > 0)
        ? ((fontDescent - inkDescent) - (fontAscent - inkAscent)) / 2
        : 0;
      setOpticalOffsetY((prev) => (Math.abs(prev - nextOffset) > 0.25 ? nextOffset : prev));
    };
    measure();
    const fonts: FontFaceSet | undefined = typeof document !== 'undefined' ? document.fonts : undefined;
    fonts?.ready?.then(measure).catch(() => {});
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [textCss.fontFamily, textCss.fontWeight, textCss.fontStyle, textCss.fontSize, textCss.lineHeight]);

  useLayoutEffect(() => {
    if (!useMarqueeTrack) return;
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    let raf = 0;
    const measure = () => {
      const containerWidth = wrapper.getBoundingClientRect().width || wrapper.offsetWidth;
      const rawSetWidth = set.getBoundingClientRect().width || set.offsetWidth;
      if (originalItemCount > 0 && containerWidth > 0 && rawSetWidth > 0) {
        const singleCycleWidth = rawSetWidth / contentSequenceRepeat;
        if (singleCycleWidth > 0) {
          const targetRepeat = Math.min(
            MAX_CONTENT_SEQUENCE_REPEAT,
            Math.max(MIN_CONTENT_SEQUENCE_REPEAT, Math.ceil(containerWidth / singleCycleWidth) + 1),
          );
          if (targetRepeat !== contentSequenceRepeat) {
            setContentSequenceRepeat(targetRepeat);
            return;
          }
        }
      }
      if (rawSetWidth > 0) setSetWidth(rawSetWidth);
    };
    raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [useMarqueeTrack, contentKey, contentSequenceRepeat, originalItemCount, capHeightPx]);

  useLayoutEffect(() => {
    if (!isCurveLayout) {
      setCurveBandHeightPx(0);
      setCurveWidthPx(0);
      return;
    }
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    let raf = 0;
    const measure = () => {
      const width = wrapper.getBoundingClientRect().width || wrapper.offsetWidth;
      const bandHeight = set.offsetHeight;
      if (width > 0) setCurveWidthPx((prev) => (Math.abs(prev - width) > 0.5 ? width : prev));
      if (bandHeight > 0) setCurveBandHeightPx((prev) => (Math.abs(prev - bandHeight) > 0.5 ? bandHeight : prev));
    };
    raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isCurveLayout, contentKey, capHeightPx, textLineHeight, textFontSize, useMarqueeTrack]);

  useLayoutEffect(() => {
    if (!useMarqueeTrack || animationDistance <= 0) return;
    const track = trackRef.current;
    if (!track) return;
    restartTrackAnimation(track);
  }, [useMarqueeTrack, animationDistance, direction, pxPerSec]);

  // Curve layout only: a sine wave (amplitude + frequency across the wrapper width).
  // Each glyph and image is placed independently from its untransformed x in the
  // viewport, with rotation from the wave's local slope. Straight and angle never
  // enter this loop, and a cancelled flag stops any in-flight frame after leaving curve.
  useLayoutEffect(() => {
    if (!isCurveLayout || !hasContent) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let raf = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const width = wrapperRect.width || 1;
      const amplitude = width * Math.max(0, curveAmplitude);
      const k = (2 * Math.PI * Math.max(0, curveFrequency)) / width;
      const viewLeft = wrapperRect.left;
      const viewRight = wrapperRect.right;
      const items = wrapper.querySelectorAll<HTMLElement>('[data-marquee-text-item]');
      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.right < viewLeft || itemRect.left > viewRight) return;
        const nodes = item.querySelectorAll<HTMLElement>('[data-marquee-wave-node]');
        nodes.forEach((el) => {
          const inner = el.firstElementChild as HTMLElement | null;
          if (!inner) return;
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2 - wrapperRect.left;
          const phase = k * centerX;
          const y = amplitude * Math.sin(phase);
          const slope = amplitude * k * Math.cos(phase);
          const rotateDeg = Math.atan(slope) * (180 / Math.PI);
          applyWaveTransform(inner, y, rotateDeg);
        });
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      wrapper.querySelectorAll<HTMLElement>('[data-marquee-wave-node]').forEach((el) => {
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) clearWaveTransform(inner);
      });
      wrapper.querySelectorAll<HTMLElement>('[data-marquee-text-item]').forEach(clearWaveTransform);
    };
  }, [isCurveLayout, curveAmplitude, curveFrequency, hasContent, setWidth, contentKey]);

  const onTrackEnter = () => {
    if (hoverPauseEnabled) setIsHovering(true);
  };
  const onTrackLeave = () => {
    if (hoverPauseEnabled) setIsHovering(false);
  };

  // Angle layout: rotating the band in place clips its corners against the
  // wrapper's own box, since a CSS transform doesn't affect layout size. Instead
  // the wrapper gets extra top/bottom padding sized to fit the rotated band.
  // Percentage padding-top/bottom resolves against the containing block's WIDTH
  // (a CSS quirk), so this is exact without measuring anything - it's a plain
  // function of the `angle` prop, computed the same way on the server (where the
  // editor's "auto" height calculator renders this via renderToStaticMarkup, and
  // any effect/ref-based measurement would just read back zero) and the client.
  const anglePaddingPercent = layoutType === 'angle'
    ? Math.abs(Math.sin((angle * Math.PI) / 180)) * 50
    : 0;
  const curvePaddingPercent = isCurveLayout
    ? Math.max(0, curveAmplitude) * 100
    : 0;
  const wrapperStyle: CSSProperties | undefined = layoutType === 'angle'
    ? { paddingTop: `${anglePaddingPercent}%`, paddingBottom: `${anglePaddingPercent}%` }
    : undefined;
  const bandStyle: CSSProperties = {
    ...(layoutType === 'angle'
      ? { transform: `rotate(${angle}deg)`, transformOrigin: 'center' }
      : isCurveLayout
        ? { paddingTop: `${curvePaddingPercent}%`, paddingBottom: `${curvePaddingPercent}%` }
        : {}),
    ...(!isCurveLayout ? { backgroundColor } : {}),
  };
  const curveAmplitudePx = curveWidthPx * Math.max(0, curveAmplitude);
  const curveBgPath = isCurveLayout && curveWidthPx > 0 && curveBandHeightPx > 0
    ? buildCurveBackgroundPath(
      curveWidthPx,
      curveAmplitudePx,
      curveFrequency,
      curveAmplitudePx + curveBandHeightPx / 2,
    )
    : '';
  const curveBgSvg = curveBgPath ? (
    <svg
      className={`${P}-curve-bg`}
      viewBox={`0 0 ${curveWidthPx} ${curveAmplitudePx * 2 + curveBandHeightPx}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={curveBgPath}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={curveBandHeightPx}
        strokeLinecap="square"
      />
    </svg>
  ) : null;

  const renderItem = (item: MarqueeTextItem, copyIndex: number, slotIndex: number) => (
    <MarqueeTextItemView
      key={`${copyIndex}-${slotIndex}`}
      item={item}
      prefix={P}
      textCss={textCss}
      capHeightPx={capHeightPx}
      opticalOffsetY={opticalOffsetY}
      imageGapPx={scaled(gap)}
      isCurve={isCurveLayout}
    />
  );

  const capRef = (
    <span ref={capRefEl} aria-hidden className={`${P}-cap-ref`} style={textCss}>H</span>
  );

  if (useMarqueeTrack) {
    const playState = !autoplayEnabled
      ? 'paused'
      : hoverPauseEnabled
        ? (isHovering ? 'paused' : 'running')
        : 'running';
    const durationMs = animationDistance > 0 && pxPerSec > 0 ? (animationDistance / pxPerSec) * 1000 : 0;
    const durationS = `${Math.max(0, durationMs) / 1000}s`;

    return (
      <div ref={wrapperRef} className={`${P}-wrapper`} aria-label="Marquee text" style={wrapperStyle}>
        <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        {capRef}
        <div className={`${P}-marquee-wrapper`} style={bandStyle}>
          {curveBgSvg}
          <div
            ref={trackRef}
            className={`${P}-marquee-track`}
            data-direction={direction}
            onMouseEnter={onTrackEnter}
            onMouseLeave={onTrackLeave}
            style={{
              WebkitAnimationDuration: durationS,
              animationDuration: durationS,
              WebkitAnimationPlayState: playState,
              animationPlayState: playState,
            }}
          >
            {Array.from({ length: copies }, (_, copyIndex) => (
              <div
                key={`set-${copyIndex}`}
                ref={copyIndex === 0 ? setRef : undefined}
                className={`${P}-marquee-set`}
                style={{ gap: scaled(gap), paddingRight: scaled(gap) }}
                aria-hidden={copyIndex > 0}
              >
                {setContent.map((item, slotIndex) => renderItem(item, copyIndex, slotIndex))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`${P}-wrapper`} style={wrapperStyle}>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      {capRef}
      <div className={`${P}-marquee-wrapper`} style={bandStyle}>
        {curveBgSvg}
        <div
          ref={setRef}
          className={cn(`${P}-marquee-set`, `${P}-marquee-static`)}
          style={{ gap: scaled(gap) }}
          aria-label="Marquee text"
        >
          {content?.map((item, itemIndex) => renderItem(item, 0, itemIndex))}
        </div>
      </div>
    </div>
  );
};

export type MarqueeTextItem = {
  text: string;
  image?: {
    url?: string;
    name?: string;
  };
  link?: string;
};

export type MarqueeTextSettings = {
  speed: number;
  direction: 'left' | 'right';
  pauseOnHover: 'on' | 'off';
  gap: number;
  layoutType: 'curve' | 'angle';
  curveAmplitude: number;
  curveFrequency: number;
  angle: number;
  textFontFamily: string;
  textFontSettings: {
    fontWeight: number;
    fontStyle: string;
  };
  textFontSize: number;
  textLineHeight: number;
  textLetterSpacing: number;
  textWordSpacing: number;
  textTextAppearance: {
    textTransform: string;
    textDecoration: string;
    fontVariant: string;
  };
  textColor: string;
  backgroundColor: string;
};

type MarqueeTextProps = {
  settings: MarqueeTextSettings;
  content?: MarqueeTextItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
} & CommonComponentProps;
