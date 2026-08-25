import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { CommonComponentProps } from '../../props';
import { scalingValue } from '../../utils/scalingValue';
import { useScopedStyles } from '../../utils/useScopedStyles';

const ORBIT_STEPS = 48;
const DEG_PER_SEC_PER_SPEED_UNIT = 10;
const MAX_TOTAL_ITEMS = 400;
const OVERFLOW_TURNS = 1;
const DEFAULT_WIDTH = 1120 / 1440;
const DEFAULT_IMAGE_WIDTH = 140 / 1440;
const DEFAULT_TURN_HEIGHT = 550 / 1440;
const DEFAULT_ITEMS_PER_TURN = 13;
const DEFAULT_TURNS = 4;
const DEPTH_FACTOR = 38 / 100;
const SCATTER = 28 / 100;
const DEFAULT_SPEED = 2.8;
const MAX_DEPTH_FACTOR = 0.9;
const SIZE_JITTER = 0.22;
const BACKGROUND_OPACITY = 0.5;
const FOREGROUND_OPACITY = 1;
const BACKGROUND_BLUR = 1.5;
const FOREGROUND_BLUR = 0;
const FOREGROUND_OPACITY_ZONE = 0.85;
const LAYOUT_EXEMPLARY = 1440;

function getCSS(P: string, keyframes: string): string {
  return `
.${P}-wrapper {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  clip-path: inset(0);
  isolation: isolate;
}
.${P}-item {
  position: absolute;
  overflow: hidden;
  animation-name: ${P}-orbit;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
  will-change: left, width, height, z-index, opacity, filter;
}
.${P}-item-static {
  animation-name: none;
}
.${P}-media {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  vertical-align: top;
  user-select: none;
  pointer-events: none;
}
.${P}-cover {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.${P}-cover .${P}-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
${keyframes}
`;
}

type SpiralMedia = {
  url?: string;
  name?: string;
  type?: 'image' | 'video';
};

export type SpiralListContentItem = {
  image?: SpiralMedia;
};

export type SpiralListSettings = {
  width?: number;
  /** @deprecated use `width` */
  spread?: number;
  /** @deprecated use `width` */
  wrapperWidth?: number;
  imageWidth?: number;
  turnHeight?: number;
  itemsPerTurn?: number;
  turns?: number;
  speed?: number;
  direction?: 'left' | 'right';
  playback?: 'autoplay' | 'scroll';
  /** @deprecated use `playback` */
  pauseOnHover?: 'on' | 'off';
  cornerRadius?: number;
  imageDisplay?: {
    display?: 'fit' | 'cover';
    ratioValue?: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed?: boolean;
  } | string;
};

type SpiralListProps = {
  settings?: SpiralListSettings;
  content?: SpiralListContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
} & CommonComponentProps;

type ImageDisplay = {
  display: 'fit' | 'cover';
  ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
  reversed: boolean;
};

function round(value: number): number {
  return Number(value.toFixed(4));
}

// Common settings must use `common-numeric-input`. Older saves may contain values
// that were accidentally divided by the layout exemplary (~1440).
function resolveCommonCount(
  value: number | undefined,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const raw = typeof value === 'string' ? Number(value) : value;
  let resolved = raw ?? defaultValue;
  if (!Number.isFinite(resolved)) return defaultValue;
  if (resolved > 0 && resolved < 1) {
    resolved = Math.round(resolved * LAYOUT_EXEMPLARY);
  }
  return Math.min(max, Math.max(min, Math.round(resolved)));
}

function resolveLayoutMetric(
  value: number | undefined,
  defaultValue: number,
  min = 0,
  max = 9999,
): number {
  const raw = typeof value === 'string' ? Number(value) : value;
  let resolved = raw ?? defaultValue;
  if (!Number.isFinite(resolved)) return defaultValue;
  if (resolved > max / LAYOUT_EXEMPLARY) {
    resolved /= LAYOUT_EXEMPLARY;
  }
  return Math.min(max, Math.max(min, resolved));
}

function normalizeImageDisplay(raw: SpiralListSettings['imageDisplay']): ImageDisplay {
  if (typeof raw === 'string') {
    return {
      display: raw.toLowerCase() === 'cover' ? 'cover' : 'fit',
      ratioValue: '2:3',
      reversed: false,
    };
  }
  const display = typeof raw?.display === 'string' ? raw.display.toLowerCase() : '';
  return {
    display: display === 'cover' ? 'cover' : 'fit',
    ratioValue: raw?.ratioValue ?? '2:3',
    reversed: raw?.reversed ?? false,
  };
}

function getAspectHeightFactor(imageDisplay: ImageDisplay): number {
  const [ratioWidth, ratioHeight] = imageDisplay.ratioValue.split(':').map(Number);
  const effectiveWidth = imageDisplay.reversed ? ratioHeight : ratioWidth;
  const effectiveHeight = imageDisplay.reversed ? ratioWidth : ratioHeight;
  return effectiveHeight / effectiveWidth;
}

function isVideoMedia(media: SpiralMedia): boolean {
  if (media.type === 'video') return true;
  if (media.type === 'image') return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(media.name ?? '') || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(media.url ?? '');
}

function getOrbitScale(depthFactor: number, angle: number): number {
  return (1 - depthFactor) / (1 - depthFactor * Math.cos(angle));
}

function getSpreadFactor(depthFactor: number): number {
  let max = 0;
  for (let degrees = 0; degrees < 360; degrees += 1) {
    const angle = (degrees * Math.PI) / 180;
    max = Math.max(max, Math.abs(Math.sin(angle) * getOrbitScale(depthFactor, angle)));
  }
  return max || 1;
}

function getMaxItemWidthFactor(isCover: boolean, scatter: number): number {
  return isCover ? 1 : 1 + SIZE_JITTER * (0.35 + scatter);
}

function getOrbitRadius(
  width: number,
  imageWidth: number,
  isCover: boolean,
  scatter: number,
): number {
  const maxItemWidth = imageWidth * getMaxItemWidthFactor(isCover, scatter);
  return Math.max(0, (width - maxItemWidth) / 2);
}

function getOrbitPose(depthFactor: number, spreadFactor: number, angle: number) {
  const scale = getOrbitScale(depthFactor, angle);
  return {
    offset: (Math.sin(angle) * scale) / spreadFactor,
    scale,
  };
}

function getOrbitCenterX(width: number, orbitRadius: number, offset: number): number {
  return width / 2 + orbitRadius * offset;
}

function getOrbitLeft(
  scaled: (value: number) => string,
  centerX: number,
  layoutWidth: number,
): string {
  return scaled(centerX - layoutWidth / 2);
}

function getOrbitLayoutWidth(baseItemWidth: number, scale: number): number {
  return baseItemWidth * scale;
}

function getOrbitZIndex(scale: number): number {
  return Math.round(scale * 1000);
}

function getOrbitDepthEffect(angle: number, backgroundValue: number, foregroundValue: number): number {
  const cosAngle = Math.cos(angle);
  const fullForegroundCos = Math.cos((FOREGROUND_OPACITY_ZONE * Math.PI) / 2);

  if (cosAngle >= fullForegroundCos) {
    return foregroundValue;
  }

  const t = (cosAngle + 1) / (fullForegroundCos + 1);
  return round(backgroundValue + (foregroundValue - backgroundValue) * t);
}

function getOrbitOpacity(angle: number): number {
  return getOrbitDepthEffect(angle, BACKGROUND_OPACITY, FOREGROUND_OPACITY);
}

function getOrbitBlur(angle: number): number {
  return getOrbitDepthEffect(angle, BACKGROUND_BLUR, FOREGROUND_BLUR);
}

function getOrbitFilter(angle: number): string {
  const blur = getOrbitBlur(angle);
  return blur <= 0 ? 'none' : `blur(${blur}px)`;
}

function getOrbitKeyframeStyles(
  scaled: (value: number) => string,
  width: number,
  orbitRadius: number,
  depthFactor: number,
  spreadFactor: number,
  progress: number,
  isCover: boolean,
): string {
  const { offset, scale } = getOrbitPose(depthFactor, spreadFactor, progress * Math.PI * 2);
  const angle = progress * Math.PI * 2;
  const centerX = getOrbitCenterX(width, orbitRadius, offset);
  const layoutWidthFactor = round(scale);
  const left = `calc(${scaled(centerX)} - var(--spiral-base-w) * ${layoutWidthFactor} / 2)`;
  const widthStyle = `calc(var(--spiral-base-w) * ${layoutWidthFactor})`;
  const heightStyle = isCover ? `height: calc(var(--spiral-base-h) * ${layoutWidthFactor});` : '';
  return `left: ${left}; width: ${widthStyle}; ${heightStyle} z-index: ${getOrbitZIndex(scale)}; transform: translateY(-50%); opacity: ${getOrbitOpacity(angle)}; filter: ${getOrbitFilter(angle)};`;
}

function getOrbitKeyframes(
  P: string,
  scaled: (value: number) => string,
  width: number,
  orbitRadius: number,
  depthFactor: number,
  spreadFactor: number,
  isCover: boolean,
): string {
  const frames: string[] = [];
  for (let step = 0; step <= ORBIT_STEPS; step += 1) {
    const progress = step / ORBIT_STEPS;
    frames.push(
      `  ${round(progress * 100)}% { ${getOrbitKeyframeStyles(scaled, width, orbitRadius, depthFactor, spreadFactor, progress, isCover)} }`,
    );
  }
  return `@keyframes ${P}-orbit {\n${frames.join('\n')}\n}`;
}

function mod(value: number, length: number): number {
  return ((value % length) + length) % length;
}

function getOrbitPhase(index: number, itemsPerTurn: number): number {
  return getOrbitSlotIndex(index, itemsPerTurn) / itemsPerTurn;
}

function getOrbitSlotIndex(index: number, itemsPerTurn: number): number {
  return mod(index, itemsPerTurn);
}

function getTurnIndex(index: number, itemsPerTurn: number): number {
  return Math.floor(index / itemsPerTurn);
}

function getVerticalOffset(index: number, itemsPerTurn: number, turnHeight: number, verticalStep: number): number {
  return getTurnIndex(index, itemsPerTurn) * turnHeight + getOrbitSlotIndex(index, itemsPerTurn) * verticalStep;
}

function getOrbitAnimationDelay(phase: number, durationSeconds: number, direction: 'left' | 'right'): string {
  const delayPhase = direction === 'left' ? 1 - phase : phase;
  return `${round(-delayPhase * durationSeconds)}s`;
}

function hashUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function normalizePhase(value: number): number {
  const mod = value % 1;
  return mod < 0 ? mod + 1 : mod;
}

function getScrollOrbitProgress(scrollProgress: number, speed: number, direction: 'left' | 'right'): number {
  const orbitCycles = speed / DEFAULT_SPEED;
  const signedProgress = direction === 'left' ? -scrollProgress * orbitCycles : scrollProgress * orbitCycles;
  return normalizePhase(signedProgress);
}

export function SpiralList({
  settings,
  content,
  isEditor,
  isPreviewMode,
}: SpiralListProps) {
  const { prefix: P } = useScopedStyles();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const width = resolveLayoutMetric(
    settings?.width ?? settings?.spread ?? settings?.wrapperWidth,
    DEFAULT_WIDTH,
  );
  const imageWidth = resolveLayoutMetric(settings?.imageWidth, DEFAULT_IMAGE_WIDTH);
  const turnHeight = resolveLayoutMetric(settings?.turnHeight, DEFAULT_TURN_HEIGHT);
  const itemsPerTurn = resolveCommonCount(settings?.itemsPerTurn, DEFAULT_ITEMS_PER_TURN, 3, 40);
  const turns = resolveCommonCount(settings?.turns, DEFAULT_TURNS, 1, 30);
  const depthFactor = Math.min(MAX_DEPTH_FACTOR, Math.max(0, DEPTH_FACTOR));
  const scatter = Math.min(1, Math.max(0, SCATTER));
  const speed = Math.max(0, settings?.speed ?? DEFAULT_SPEED);
  const direction = settings?.direction === 'left' ? 'left' : 'right';
  const playback = settings?.playback === 'scroll' ? 'scroll' : 'autoplay';
  const cornerRadius = settings?.cornerRadius ?? 0;
  const imageDisplay = useMemo(() => normalizeImageDisplay(settings?.imageDisplay), [settings?.imageDisplay]);
  const isCover = imageDisplay.display === 'cover';

  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const spreadFactor = useMemo(() => getSpreadFactor(depthFactor), [depthFactor]);
  const orbitRadius = useMemo(
    () => getOrbitRadius(width, imageWidth, isCover, scatter),
    [width, imageWidth, isCover, scatter],
  );
  const scopedCss = useMemo(
    () => getCSS(P, getOrbitKeyframes(P, scaled, width, orbitRadius, depthFactor, spreadFactor, isCover)),
    [P, width, orbitRadius, depthFactor, spreadFactor, isCover, isEditor],
  );

  const mediaItems = useMemo(
    () => (content ?? []).filter((item) => Boolean(item.image?.url)),
    [content],
  );

  const verticalStep = turnHeight / itemsPerTurn;
  const imageHeight = imageWidth * getAspectHeightFactor(imageDisplay);
  const visibleItems = Math.min(MAX_TOTAL_ITEMS, turns * itemsPerTurn);
  const overflowItems = OVERFLOW_TURNS * itemsPerTurn;
  const totalItems = visibleItems + overflowItems * 2;
  const spiralSpan = Math.max(0, turns - 1) * turnHeight + (itemsPerTurn - 1) * verticalStep;
  const wrapperHeight = spiralSpan;

  const motionEnabled = speed > 0;
  const useScrollMotion = playback === 'scroll' && motionEnabled;
  const useCssAnimation = playback === 'autoplay' && motionEnabled && (isEditor ? Boolean(isPreviewMode) : true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!useScrollMotion) return;
    const element = wrapperRef.current;
    if (!element) return;

    const update = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const range = viewportHeight + rect.height;
      if (range <= 0) return;
      setScrollProgress(Math.min(1, Math.max(0, (viewportHeight - rect.top) / range)));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
    };
  }, [useScrollMotion]);

  const scrollOrbitProgress = useScrollMotion ? getScrollOrbitProgress(scrollProgress, speed, direction) : 0;
  const durationSeconds = motionEnabled && playback === 'autoplay' ? 360 / (speed * DEG_PER_SEC_PER_SPEED_UNIT) : 0;

  if (mediaItems.length === 0) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        <div className={`${P}-wrapper`} style={{ width: scaled(width), marginInline: 'auto' }} />
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        ref={wrapperRef}
        className={`${P}-wrapper`}
        style={{
          width: scaled(width),
          height: scaled(wrapperHeight),
          marginInline: 'auto',
        }}
      >
        {Array.from({ length: totalItems }, (_, index) => {
          const logicalIndex = index - overflowItems;
          const item = mediaItems[mod(logicalIndex, mediaItems.length)];
          const media = item.image as SpiralMedia;
          const slotIndex = getOrbitSlotIndex(logicalIndex, itemsPerTurn);
          const phase = getOrbitPhase(logicalIndex, itemsPerTurn);
          const orbitPhase = useScrollMotion ? normalizePhase(phase + scrollOrbitProgress) : phase;
          const verticalOffset = getVerticalOffset(logicalIndex, itemsPerTurn, turnHeight, verticalStep);
          const verticalJitter = scatter === 0 ? 0 : (hashUnit(slotIndex + 7.3) - 0.5) * scatter * verticalStep;
          const sizeJitter = isCover
            ? 1
            : 1 + (hashUnit(slotIndex + 3.1) - 0.5) * 2 * SIZE_JITTER * (0.35 + scatter);
          const angle = orbitPhase * Math.PI * 2;
          const { offset, scale } = getOrbitPose(depthFactor, spreadFactor, angle);
          const itemWidth = imageWidth * sizeJitter;
          const layoutWidth = getOrbitLayoutWidth(itemWidth, scale);
          const centerX = getOrbitCenterX(width, orbitRadius, offset);
          const orbitCssVars = {
            '--spiral-base-w': scaled(itemWidth),
            ...(isCover ? { '--spiral-base-h': scaled(imageHeight) } : {}),
          } as CSSProperties;

          const itemStyle: CSSProperties = {
            top: scaled(verticalOffset + verticalJitter),
            transform: 'translateY(-50%)',
            ...orbitCssVars,
            ...(useCssAnimation
              ? {
                  animationDuration: `${round(durationSeconds)}s`,
                  animationDelay: getOrbitAnimationDelay(phase, durationSeconds, direction),
                  animationDirection: direction === 'left' ? 'reverse' : 'normal',
                }
              : {
                  left: getOrbitLeft(scaled, centerX, layoutWidth),
                  width: scaled(layoutWidth),
                  ...(isCover ? { height: scaled(imageHeight * scale) } : {}),
                  zIndex: getOrbitZIndex(scale),
                  opacity: getOrbitOpacity(angle),
                  filter: getOrbitFilter(angle),
                }),
          };

          const mediaStyle: CSSProperties = cornerRadius > 0 ? { borderRadius: scaled(cornerRadius) } : {};
          const coverMediaStyle: CSSProperties = isCover
            ? {
                ...mediaStyle,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }
            : mediaStyle;
          const mediaNode = isVideoMedia(media) ? (
            <video
              className={`${P}-media`}
              style={coverMediaStyle}
              src={media.url}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
            />
          ) : (
            <img
              className={`${P}-media`}
              style={coverMediaStyle}
              src={media.url}
              alt={media.name ?? ''}
              loading="lazy"
              decoding="async"
            />
          );

          return (
            <div
              key={`${turns}-${itemsPerTurn}-${logicalIndex}`}
              className={useCssAnimation ? `${P}-item` : `${P}-item ${P}-item-static`}
              style={itemStyle}
            >
              {isCover ? (
                <div className={`${P}-cover`} style={mediaStyle}>
                  {mediaNode}
                </div>
              ) : (
                mediaNode
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
