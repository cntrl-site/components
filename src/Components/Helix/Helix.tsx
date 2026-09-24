import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';

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

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  isolation: isolate;
  contain: layout paint;
}
.${P}-item {
  position: absolute;
  left: 0;
  width: var(--helix-base-w);
  overflow: hidden;
  transform-origin: center center;
}
.${P}-item-cover {
  height: var(--helix-base-h);
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
`;
}

type HelixMedia = {
  url?: string;
  name?: string;
  type?: 'image' | 'video';
};

export type HelixContentItem = {
  image?: HelixMedia;
};

export type HelixSettings = {
  width?: number;
  spread?: number;
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
  blur?: 'on' | 'off';
  imageDisplay?: {
    display?: 'fit' | 'cover';
    ratioValue?: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed?: boolean;
  } | string;
};

type HelixProps = {
  settings?: HelixSettings;
  content?: HelixContentItem[];
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

function resolveCommonCount(
  value: number | undefined,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const raw = typeof value === 'string' ? Number(value) : value;
  const resolved = raw ?? defaultValue;
  if (!Number.isFinite(resolved)) return defaultValue;
  return Math.min(max, Math.max(min, Math.round(resolved)));
}

function resolveLayoutMetric(
  value: number | undefined,
  defaultValue: number,
  min = 0,
  max = 9999,
): number {
  const raw = typeof value === 'string' ? Number(value) : value;
  const resolved = raw ?? defaultValue;
  if (!Number.isFinite(resolved)) return defaultValue;
  return Math.min(max, Math.max(min, resolved));
}

function normalizeImageDisplay(raw: HelixSettings['imageDisplay']): ImageDisplay {
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

function isVideoMedia(media: HelixMedia): boolean {
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

function getOrbitTransform(
  scaled: (value: number) => string,
  centerX: number,
  scale: number,
): string {
  return `translate(calc(${scaled(centerX)} - var(--helix-base-w) / 2), -50%) scale(${round(scale)})`;
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

function getOrbitFilter(angle: number, blurEnabled: boolean): string {
  if (!blurEnabled) return 'none';
  const blur = getOrbitBlur(angle);
  return blur <= 0 ? 'none' : `blur(${blur}px)`;
}

type OrbitParams = {
  scaled: (value: number) => string;
  width: number;
  orbitRadius: number;
  depthFactor: number;
  spreadFactor: number;
  blurEnabled: boolean;
};

type OrbitItemStyle = {
  transform: string;
  zIndex: number;
  opacity: number;
  filter: string;
};

function getOrbitItemStyle(params: OrbitParams, orbitPhase: number): OrbitItemStyle {
  const angle = orbitPhase * Math.PI * 2;
  const { offset, scale } = getOrbitPose(params.depthFactor, params.spreadFactor, angle);
  const centerX = getOrbitCenterX(params.width, params.orbitRadius, offset);
  return {
    transform: getOrbitTransform(params.scaled, centerX, scale),
    zIndex: getOrbitZIndex(scale),
    opacity: getOrbitOpacity(angle),
    filter: getOrbitFilter(angle, params.blurEnabled),
  };
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

export function Helix({
  settings,
  content,
  isEditor,
  isPreviewMode,
}: HelixProps) {
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
  const blurEnabled = settings?.blur !== 'off';
  const imageDisplay = useMemo(() => normalizeImageDisplay(settings?.imageDisplay), [settings?.imageDisplay]);
  const isCover = imageDisplay.display === 'cover';

  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const spreadFactor = useMemo(() => getSpreadFactor(depthFactor), [depthFactor]);
  const orbitRadius = useMemo(
    () => getOrbitRadius(width, imageWidth, isCover, scatter),
    [width, imageWidth, isCover, scatter],
  );
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const orbitParams = useMemo<OrbitParams>(
    () => ({
      scaled: (value: number) => scalingValue(value, isEditor ?? false),
      width,
      orbitRadius,
      depthFactor,
      spreadFactor,
      blurEnabled,
    }),
    [isEditor, width, orbitRadius, depthFactor, spreadFactor, blurEnabled],
  );
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbitProgressRef = useRef(0);

  const mediaItems = useMemo(
    () => (content ?? []).filter((item) => Boolean(item.image?.url)),
    [content],
  );

  const verticalStep = turnHeight / itemsPerTurn;
  const imageHeight = imageWidth * getAspectHeightFactor(imageDisplay);
  const visibleItems = Math.min(MAX_TOTAL_ITEMS, turns * itemsPerTurn);
  const overflowItems = OVERFLOW_TURNS * itemsPerTurn;
  const totalItems = visibleItems + overflowItems * 2;
  const helixSpan = Math.max(0, turns - 1) * turnHeight + (itemsPerTurn - 1) * verticalStep;
  const wrapperHeight = helixSpan;

  const motionEnabled = speed > 0;
  const useScrollMotion = playback === 'scroll' && motionEnabled;
  const useAutoplayMotion = playback === 'autoplay' && motionEnabled && (isEditor ? Boolean(isPreviewMode) : true);
  const durationSeconds = useAutoplayMotion ? 360 / (speed * DEG_PER_SEC_PER_SPEED_UNIT) : 0;
  const renderedItemCount = mediaItems.length === 0 ? 0 : totalItems;
  const itemPhases = useMemo(
    () => Array.from({ length: renderedItemCount }, (_, index) => getOrbitPhase(index - overflowItems, itemsPerTurn)),
    [renderedItemCount, overflowItems, itemsPerTurn],
  );

  useEffect(() => {
    if (!useAutoplayMotion && !useScrollMotion) return;
    const element = wrapperRef.current;
    if (!element) return;

    const applyOrbitProgress = (progress: number) => {
      orbitProgressRef.current = progress;
      itemPhases.forEach((phase, index) => {
        const node = itemRefs.current[index];
        if (!node) return;
        const style = getOrbitItemStyle(orbitParams, normalizePhase(phase + progress));
        node.style.transform = style.transform;
        node.style.zIndex = String(style.zIndex);
        node.style.opacity = String(style.opacity);
        node.style.filter = style.filter;
      });
    };

    if (useScrollMotion) {
      const view = element.ownerDocument.defaultView ?? window;
      const update = () => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = view.innerHeight || element.ownerDocument.documentElement.clientHeight;
        const range = viewportHeight + rect.height;
        if (range <= 0) return;
        const scrollProgress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / range));
        applyOrbitProgress(getScrollOrbitProgress(scrollProgress, speed, direction));
      };

      update();
      view.addEventListener('scroll', update, { passive: true, capture: true });
      view.addEventListener('resize', update);
      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(element);
      return () => {
        view.removeEventListener('scroll', update, { capture: true });
        view.removeEventListener('resize', update);
        resizeObserver.disconnect();
      };
    }

    const directionSign = direction === 'left' ? -1 : 1;
    let frameId: number | null = null;
    let lastTime: number | null = null;

    const tick = (time: number) => {
      if (lastTime !== null) {
        const delta = ((time - lastTime) / 1000 / durationSeconds) * directionSign;
        orbitProgressRef.current = normalizePhase(orbitProgressRef.current + delta);
      }
      lastTime = time;
      applyOrbitProgress(orbitProgressRef.current);
      frameId = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frameId !== null) return;
      lastTime = null;
      frameId = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) start();
      else stop();
    });
    intersectionObserver.observe(element);
    return () => {
      stop();
      intersectionObserver.disconnect();
    };
  }, [useAutoplayMotion, useScrollMotion, itemPhases, orbitParams, durationSeconds, speed, direction]);

  const renderProgress = useAutoplayMotion || useScrollMotion ? orbitProgressRef.current : 0;

  if (mediaItems.length === 0) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        <div className={`${P}-wrapper`} style={{ width: scaled(width) }} />
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
          height: scaled(wrapperHeight)
        }}
      >
        {Array.from({ length: totalItems }, (_, index) => {
          const logicalIndex = index - overflowItems;
          const item = mediaItems[mod(logicalIndex, mediaItems.length)];
          const media = item.image as HelixMedia;
          const slotIndex = getOrbitSlotIndex(logicalIndex, itemsPerTurn);
          const phase = itemPhases[index];
          const verticalOffset = getVerticalOffset(logicalIndex, itemsPerTurn, turnHeight, verticalStep);
          const verticalJitter = scatter === 0 ? 0 : (hashUnit(slotIndex + 7.3) - 0.5) * scatter * verticalStep;
          const sizeJitter = isCover
            ? 1
            : 1 + (hashUnit(slotIndex + 3.1) - 0.5) * 2 * SIZE_JITTER * (0.35 + scatter);
          const itemWidth = imageWidth * sizeJitter;
          const orbitCssVars = {
            '--helix-base-w': scaled(itemWidth),
            ...(isCover ? { '--helix-base-h': scaled(imageHeight) } : {}),
          } as CSSProperties;

          const itemStyle: CSSProperties = {
            top: scaled(verticalOffset + verticalJitter),
            ...orbitCssVars,
            ...getOrbitItemStyle(orbitParams, normalizePhase(phase + renderProgress)),
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
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={isCover ? `${P}-item ${P}-item-cover` : `${P}-item`}
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
