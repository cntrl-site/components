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
.${P}-ribbon {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
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
const CURVE_AMPLITUDE_SCALE = 100;
const CURVE_FREQUENCY_SCALE = 10;

const normalizeCurveAmplitude = (value: number): number => Math.max(0, value) / CURVE_AMPLITUDE_SCALE;
const normalizeCurveFrequency = (value: number): number => Math.max(0, value) / CURVE_FREQUENCY_SCALE;

const restartTrackAnimation = (track: HTMLElement) => {
  track.style.setProperty('animation-name', 'none');
  track.style.setProperty('-webkit-animation-name', 'none');
  void track.offsetHeight;
  track.style.removeProperty('animation-name');
  track.style.removeProperty('-webkit-animation-name');
};

const expandSetContent = (items: MarqueeTextItem[], repeat: number): MarqueeTextItem[] => (
  Array.from({ length: repeat * items.length }, (_, i) => items[i % items.length])
);

const sharedCanvas = { ctx: undefined as CanvasRenderingContext2D | null | undefined };
const getSharedCanvasCtx = (): CanvasRenderingContext2D | null => {
  if (sharedCanvas.ctx !== undefined) return sharedCanvas.ctx;
  if (typeof document === 'undefined') {
    sharedCanvas.ctx = null;
    return sharedCanvas.ctx;
  }
  sharedCanvas.ctx = document.createElement('canvas').getContext('2d');
  return sharedCanvas.ctx;
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

const applyWaveTransform = (el: HTMLElement, x: number, y: number, rotateDeg: number) => {
  el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotateDeg}deg)`;
};

const clearWaveTransform = (el: HTMLElement) => {
  el.style.transform = '';
};

const readTranslateX = (transform: string): number => {
  if (!transform || transform === 'none') return 0;
  try {
    return new DOMMatrixReadOnly(transform).m41;
  } catch {
    return 0;
  }
};

// Layout-only X in ancestor space; track translateX is added once per frame.
const getLayoutLocalCenterX = (el: HTMLElement, ancestor: HTMLElement): number => {
  const walk = (node: HTMLElement | null, x: number): number => {
    if (!node || node === ancestor) return x;
    const nextX = x + node.offsetLeft;
    const parent = node.offsetParent as HTMLElement | null;
    if (!parent || parent === node) return nextX;
    return walk(parent, nextX);
  };
  return walk(el, el.offsetWidth / 2);
};

type WaveGlyphCache = {
  inner: HTMLElement;
  layoutLocalX: number;
};

type WaveItemCache = {
  item: HTMLElement;
  glyphs: WaveGlyphCache[];
};

const WAVE_ARC_LUT_SAMPLES = 96;

type WaveArcLut = {
  wavelength: number;
  periodArc: number;
  x: Float64Array;
  s: Float64Array;
};

// Invert s(x) = ∫ sqrt(1 + (A k cos(k t))²) dt so glyphs keep their layout
// advance along the curve instead of along horizontal x.
const buildWaveArcLut = (amplitude: number, k: number, samples: number): WaveArcLut | null => {
  if (k <= 0 || amplitude <= 0 || samples < 2) return null;
  const wavelength = (2 * Math.PI) / k;
  const x = new Float64Array(samples + 1);
  const s = new Float64Array(samples + 1);
  const slopeAmp = amplitude * k;
  const ds = (t: number) => Math.sqrt(1 + (slopeAmp * Math.cos(k * t)) ** 2);
  const dx = wavelength / samples;
  Array.from({ length: samples }, (_, i) => {
    const t0 = i * dx;
    const t1 = t0 + dx;
    x[i + 1] = t1;
    s[i + 1] = s[i] + (ds(t0) + ds(t1)) * 0.5 * dx;
  });
  return { wavelength, periodArc: s[samples], x, s };
};

const xFromArcLength = (lut: WaveArcLut, targetS: number): number => {
  if (lut.periodArc <= 0) return targetS;
  const sign = targetS < 0 ? -1 : 1;
  const sAbs = Math.abs(targetS);
  const n = Math.floor(sAbs / lut.periodArc);
  const r = sAbs - n * lut.periodArc;
  const { s, x } = lut;
  const findBracket = (lo: number, hi: number): [number, number] => {
    if (hi - lo <= 1) return [lo, hi];
    const mid = (lo + hi) >> 1;
    return s[mid] <= r ? findBracket(mid, hi) : findBracket(lo, mid);
  };
  const [lo, hi] = findBracket(0, s.length - 1);
  const span = s[hi] - s[lo];
  const t = span > 0 ? (r - s[lo]) / span : 0;
  return sign * (n * lut.wavelength + x[lo] + (x[hi] - x[lo]) * t);
};

const buildCurveBackgroundPath = (
  width: number,
  amplitude: number,
  frequency: number,
  centerY: number,
): string => {
  const periods = Math.max(0, frequency);
  const k = width > 0 ? (2 * Math.PI * periods) / width : 0;
  const yAt = (x: number) => centerY + amplitude * Math.sin(k * x);
  const dyAt = (x: number) => amplitude * k * Math.cos(k * x);
  const segments = Math.max(4, Math.ceil(periods * 4));
  const curveParts = Array.from({ length: segments }, (_, i) => {
    const x0 = (i / segments) * width;
    const x1 = ((i + 1) / segments) * width;
    const dx = x1 - x0;
    const y0 = yAt(x0);
    const y1 = yAt(x1);
    const c1x = x0 + dx / 3;
    const c1y = y0 + (dyAt(x0) * dx) / 3;
    const c2x = x1 - dx / 3;
    const c2y = y1 - (dyAt(x1) * dx) / 3;
    return `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  });
  return [`M0 ${yAt(0).toFixed(2)}`, ...curveParts].join(' ');
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
  const imageNode = image && (isCurve ? <span className={`${P}-item-image-wrap`} data-marquee-wave-node>{image}</span>: image);
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
        ? <a href={item.link} className={`${P}-item-link`} style={{ gap: imageGapPx }}>{content}</a>
        : content}
    </div>
  );
};

export const MarqueeText = ({ settings, content, isEditor, isPreviewMode }: MarqueeTextProps) => {
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
    textFontFamily,
    textFontSettings,
    textFontSize,
    textLineHeight,
    textLetterSpacing,
    textWordSpacing,
    textTextAppearance,
    textColor,
    backgroundColor,
    ribbonWidth: ribbonWidthSetting,
  } = settings;
  const ribbonWidth = ribbonWidthSetting ?? textLineHeight;
  const isCurveLayout = layoutType === 'curve';
  const amplitudeRatio = normalizeCurveAmplitude(curveAmplitude);
  const curvePeriods = normalizeCurveFrequency(curveFrequency);
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
  const hasContent = (content?.length ?? 0) > 0;
  const autoplayEnabled = isEditor ? Boolean(isPreviewMode) : true;
  const useMarqueeTrack = hasContent && (autoplayEnabled || Boolean(isEditor));
  const pxPerSec = Math.max(0, speed) * PX_PER_SEC_PER_SPEED_UNIT;
  const hoverPauseEnabled = autoplayEnabled && pauseOnHover === 'on';
  const [isHovering, setIsHovering] = useState(false);
  const playState: 'paused' | 'running' = !autoplayEnabled
    ? 'paused'
    : hoverPauseEnabled
      ? (isHovering ? 'paused' : 'running')
      : 'running';
  const waveShouldLoop = playState === 'running' && pxPerSec > 0 && animationDistance > 0;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const bandRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const capRefEl = useRef<HTMLSpanElement | null>(null);
  const waveShouldLoopRef = useRef(waveShouldLoop);
  const waveKickRef = useRef<(() => void) | null>(null);
  waveShouldLoopRef.current = waveShouldLoop;
  const [capHeightPx, setCapHeightPx] = useState(0);
  const [opticalOffsetY, setOpticalOffsetY] = useState(0);
  const [curveBandHeightPx, setCurveBandHeightPx] = useState(0);
  const [curveWidthPx, setCurveWidthPx] = useState(0);
  const [ribbonHeightPx, setRibbonHeightPx] = useState(0);

  const contentKey = useMemo(
    () => (content ?? []).map((i) => `${i.text}\0${i.image?.url ?? ''}`).join('\0'),
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

  // Cap-height + optical vertical offset for image sizing / text baseline balance.
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
    const raf = { id: 0 };
    const measure = () => {
      const containerWidth = wrapper.getBoundingClientRect().width || wrapper.offsetWidth;
      const rawSetWidth = set.getBoundingClientRect().width || set.offsetWidth;
      if (hasContent && containerWidth > 0 && rawSetWidth > 0) {
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
    raf.id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf.id);
      raf.id = requestAnimationFrame(measure);
    });
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      cancelAnimationFrame(raf.id);
      ro.disconnect();
    };
  }, [useMarqueeTrack, contentKey, contentSequenceRepeat, hasContent, capHeightPx]);

  useLayoutEffect(() => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;
    const raf = { id: 0 };
    const measure = () => {
      const height = ribbon.offsetHeight;
      if (height > 0) setRibbonHeightPx((prev) => (Math.abs(prev - height) > 0.5 ? height : prev));
    };
    raf.id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf.id);
      raf.id = requestAnimationFrame(measure);
    });
    ro.observe(ribbon);
    return () => {
      cancelAnimationFrame(raf.id);
      ro.disconnect();
    };
  }, [ribbonWidth, isEditor]);

  useLayoutEffect(() => {
    if (!isCurveLayout) {
      setCurveBandHeightPx(0);
      setCurveWidthPx(0);
      return;
    }
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    const raf = { id: 0 };
    const measure = () => {
      const width = wrapper.offsetWidth;
      const bandHeight = set.offsetHeight;
      if (width > 0) setCurveWidthPx((prev) => (Math.abs(prev - width) > 0.5 ? width : prev));
      if (bandHeight > 0) setCurveBandHeightPx((prev) => (Math.abs(prev - bandHeight) > 0.5 ? bandHeight : prev));
    };
    raf.id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf.id);
      raf.id = requestAnimationFrame(measure);
    });
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      cancelAnimationFrame(raf.id);
      ro.disconnect();
    };
  }, [isCurveLayout, contentKey, capHeightPx, textLineHeight, textFontSize, useMarqueeTrack]);

  useLayoutEffect(() => {
    if (!useMarqueeTrack || animationDistance <= 0) return;
    const track = trackRef.current;
    if (!track) return;
    restartTrackAnimation(track);
  }, [useMarqueeTrack, animationDistance, direction, pxPerSec]);

  useLayoutEffect(() => {
    if (!isCurveLayout || !hasContent) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const wave = {
      raf: 0,
      cancelled: false,
      lut: null as WaveArcLut | null,
      lutKey: '',
      itemsCache: [] as WaveItemCache[],
      cacheDirty: true,
    };

    const clearWaveTransforms = () => {
      for (const item of wave.itemsCache) {
        for (const glyph of item.glyphs) clearWaveTransform(glyph.inner);
      }
    };

    const rebuildCache = () => {
      const band = bandRef.current ?? wrapper;
      wave.itemsCache = Array.from(
        wrapper.querySelectorAll<HTMLElement>('[data-marquee-text-item]'),
        (item) => {
          const glyphs: WaveGlyphCache[] = [];
          item.querySelectorAll<HTMLElement>('[data-marquee-wave-node]').forEach((node) => {
            const inner = node.firstElementChild as HTMLElement | null;
            if (!inner) return;
            glyphs.push({
              inner,
              layoutLocalX: getLayoutLocalCenterX(node, band),
            });
          });
          return { item, glyphs };
        },
      );
      wave.cacheDirty = false;
    };

    const applyWave = () => {
      if (wave.cacheDirty) rebuildCache();
      const band = bandRef.current ?? wrapper;
      const width = band.offsetWidth || 1;
      const amplitude = width * amplitudeRatio;
      const k = (2 * Math.PI * curvePeriods) / width;
      const nextLutKey = `${width}|${amplitude}|${k}`;
      if (nextLutKey !== wave.lutKey) {
        wave.lutKey = nextLutKey;
        wave.lut = buildWaveArcLut(amplitude, k, WAVE_ARC_LUT_SAMPLES);
      }

      const track = trackRef.current;
      const trackTx = track ? readTranslateX(getComputedStyle(track).transform) : 0;
      const wrapperRect = wrapper.getBoundingClientRect();
      const viewLeft = wrapperRect.left;
      const viewRight = wrapperRect.right;
      const extraRight = wave.lut && wave.lut.wavelength > 0
        ? Math.max(0, (wave.lut.periodArc / wave.lut.wavelength - 1) * width)
        : 0;

      for (const { item, glyphs } of wave.itemsCache) {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.right < viewLeft || itemRect.left > viewRight + extraRight) continue;
        for (const glyph of glyphs) {
          const localX = glyph.layoutLocalX + trackTx;
          const xPath = wave.lut ? xFromArcLength(wave.lut, localX) : localX;
          const phase = k * xPath;
          const y = amplitude * Math.sin(phase);
          const slope = amplitude * k * Math.cos(phase);
          const rotateDeg = Math.atan(slope) * (180 / Math.PI);
          applyWaveTransform(glyph.inner, xPath - localX, y, rotateDeg);
        }
      }
    };

    const tick = () => {
      if (wave.cancelled) return;
      wave.raf = 0;
      applyWave();
      if (waveShouldLoopRef.current && !document.hidden) {
        wave.raf = requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (wave.cancelled || wave.raf) return;
      wave.raf = requestAnimationFrame(tick);
    };

    waveKickRef.current = kick;
    kick();

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(wave.raf);
        wave.raf = 0;
        return;
      }
      kick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      wave.cancelled = true;
      waveKickRef.current = null;
      cancelAnimationFrame(wave.raf);
      document.removeEventListener('visibilitychange', onVisibility);
      clearWaveTransforms();
    };
  }, [isCurveLayout, amplitudeRatio, curvePeriods, hasContent, setWidth, contentKey, contentSequenceRepeat, capHeightPx]);

  useLayoutEffect(() => {
    waveKickRef.current?.();
  }, [waveShouldLoop]);

  const onTrackEnter = () => {
    if (hoverPauseEnabled) setIsHovering(true);
  };
  const onTrackLeave = () => {
    if (hoverPauseEnabled) setIsHovering(false);
  };

  const curvePaddingPercent = isCurveLayout
    ? amplitudeRatio * 100
    : 0;
  const ribbonHeightCss = scaled(ribbonWidth);
  const bandStyle: CSSProperties = {
    minHeight: ribbonHeightCss,
    ...(isCurveLayout
      ? { paddingTop: `${curvePaddingPercent}%`, paddingBottom: `${curvePaddingPercent}%` }
      : {}),
  };
  const ribbonStyle: CSSProperties = {
    height: ribbonHeightCss,
    ...(!isCurveLayout ? { backgroundColor } : { visibility: 'hidden' }),
  };
  const setStyle: CSSProperties = {
    gap: scaled(gap),
    minHeight: ribbonHeightCss,
  };
  const curveAmplitudePx = curveWidthPx * amplitudeRatio;
  const curveStrokeWidth = ribbonHeightPx > 0 ? ribbonHeightPx : curveBandHeightPx;
  // Keep content band >= stroke so overflow:hidden does not clip sine peaks.
  const curveContentBandPx = Math.max(curveBandHeightPx, curveStrokeWidth);
  const curveBgPath = isCurveLayout && curveWidthPx > 0 && curveContentBandPx > 0
    ? buildCurveBackgroundPath(
      curveWidthPx,
      curveAmplitudePx,
      curvePeriods,
      curveAmplitudePx + curveContentBandPx / 2,
    )
    : '';
  const curveViewBoxH = curveAmplitudePx * 2 + curveContentBandPx;
  const curveBgSvg = curveBgPath ? (
    <svg
      className={`${P}-curve-bg`}
      viewBox={`0 0 ${curveWidthPx} ${curveViewBoxH}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={curveBgPath}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={curveStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : null;
  const ribbon = (
    <div ref={ribbonRef} className={`${P}-ribbon`} style={ribbonStyle} aria-hidden />
  );

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
    const durationMs = animationDistance > 0 && pxPerSec > 0 ? (animationDistance / pxPerSec) * 1000 : 0;
    const durationS = `${Math.max(0, durationMs) / 1000}s`;

    return (
      <div ref={wrapperRef} className={`${P}-wrapper`} aria-label="Marquee text">
        <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        {capRef}
        <div ref={bandRef} className={`${P}-marquee-wrapper`} style={bandStyle}>
          {ribbon}
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
                style={{ ...setStyle, paddingRight: scaled(gap) }}
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
    <div ref={wrapperRef} className={`${P}-wrapper`}>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      {capRef}
      <div ref={bandRef} className={`${P}-marquee-wrapper`} style={bandStyle}>
        {ribbon}
        {curveBgSvg}
        <div
          ref={setRef}
          className={cn(`${P}-marquee-set`, `${P}-marquee-static`)}
          style={setStyle}
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
  ribbonWidth?: number;
  layoutType: 'straight' | 'curve';
  curveAmplitude: number;
  curveFrequency: number;
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
