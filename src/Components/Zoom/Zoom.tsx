import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { useScopedStyles } from '../utils/useScopedStyles';

type ZoomContentItem = {
  image?: {
    url?: string;
    name?: string;
  };
};

type ZoomSettings = {
  imageSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  transition?: number;
  bgImage?: 'greyscale' | 'blur' | 'as is';
};

const GREYSCALE_EFFECT_AMOUNT = 100;
const BLUR_EFFECT_AMOUNT = 70;

type ImageDimensions = {
  width: number;
  height: number;
};

type SizePercents = {
  widthPercent: number;
  heightPercent: number;
};

type ZoomProps = {
  settings: ZoomSettings;
  content?: ZoomContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.${P}-background {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}
.${P}-effect-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.${P}-stage {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(var(--${P}-stage-scale, 1));
  overflow: hidden;
}
.${P}-foreground {
  z-index: 2;
}
.${P}-incoming {
  will-change: transform;
}
.${P}-incoming-next {
  z-index: 4;
  transition: transform var(--${P}-transition-ms) ease-in;
}
.${P}-incoming-prev {
  z-index: 4;
  transition: transform var(--${P}-transition-ms) ease-out;
}
.${P}-outgoing {
  will-change: transform;
}
.${P}-outgoing-next {
  z-index: 3;
  transition: transform var(--${P}-transition-ms) ease-in;
}
.${P}-outgoing-prev {
  z-index: 3;
  transition: transform var(--${P}-transition-ms) ease-out;
}
.${P}-outgoing-next .${P}-effect-image {
  transition: filter var(--${P}-transition-ms) ease-in;
}
.${P}-outgoing-prev .${P}-effect-image {
  transition: filter var(--${P}-transition-ms) ease-out;
}
.${P}-incoming .${P}-effect-image {
  transition: filter var(--${P}-transition-ms) ease;
}
.${P}-background .${P}-effect-image {
  transition: filter var(--${P}-transition-ms) ease;
}
.${P}-snap .${P}-incoming,
.${P}-snap .${P}-outgoing,
.${P}-snap .${P}-outgoing .${P}-effect-image,
.${P}-snap .${P}-incoming .${P}-effect-image {
  transition: none !important;
}
.${P}-nav {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 5;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.${P}-nav-prev {
  left: 0;
  cursor: w-resize;
}
.${P}-nav-next {
  right: 0;
  cursor: e-resize;
}
.${P}-nav:focus,
.${P}-nav:focus-visible {
  outline: none;
}
.${P}-editor .${P}-nav {
  cursor: default;
  pointer-events: none;
}
.${P}-foreground {
  pointer-events: none;
}
.${P}-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}
`;
}

function getEffectAmount(bgImage: ZoomSettings['bgImage']): number {
  if (bgImage === 'blur') return BLUR_EFFECT_AMOUNT;
  if (bgImage === 'greyscale') return GREYSCALE_EFFECT_AMOUNT;
  return 0;
}

function getBackgroundFilter(bgImage: ZoomSettings['bgImage'], progress = 1, scale = 1): string {
  const amount = getEffectAmount(bgImage) * Math.max(0, Math.min(1, progress));
  if (bgImage === 'greyscale') {
    return `grayscale(${amount}%)`;
  }
  if (bgImage === 'blur') {
    const blurPx = amount / 4;
    return blurPx <= 0 ? 'none' : `blur(${blurPx / Math.max(scale, 1)}px)`;
  }
  return 'none';
}

function getInitialIndices(itemCount: number): { backgroundIndex: number | null; activeIndex: number } {
  if (itemCount <= 1) {
    return { backgroundIndex: 0, activeIndex: 0 };
  }
  return { backgroundIndex: 0, activeIndex: 1 };
}

function getPreviousBackgroundIndex(targetIndex: number, itemCount: number): number {
  if (itemCount <= 1) return 0;
  return (targetIndex - 1 + itemCount) % itemCount;
}

function getImageAspectRatio(dimensions: ImageDimensions | undefined, fallback = 1): number {
  if (!dimensions || dimensions.height === 0) return fallback;
  return dimensions.width / dimensions.height;
}

function computeFitSize(
  containerWidth: number,
  containerHeight: number,
  imageAspectRatio: number,
  maxWidthPercent: number,
  maxHeightPercent: number,
): SizePercents {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { widthPercent: maxWidthPercent, heightPercent: maxHeightPercent };
  }

  const maxW = containerWidth * maxWidthPercent / 100;
  const maxH = containerHeight * maxHeightPercent / 100;

  let width = maxW;
  let height = width / imageAspectRatio;

  if (height > maxH) {
    height = maxH;
    width = height * imageAspectRatio;
  }

  return {
    widthPercent: (width / containerWidth) * 100,
    heightPercent: (height / containerHeight) * 100,
  };
}

function computeCoverScale(
  containerWidth: number,
  containerHeight: number,
  fitSize: SizePercents,
): number {
  if (containerWidth <= 0 || containerHeight <= 0) return 1;

  const fitW = containerWidth * fitSize.widthPercent / 100;
  const fitH = containerHeight * fitSize.heightPercent / 100;
  if (fitW <= 0 || fitH <= 0) return 1;

  return Math.max(containerWidth / fitW, containerHeight / fitH);
}

function toSizeStyle(size: SizePercents): React.CSSProperties {
  return {
    width: `${size.widthPercent}%`,
    height: `${size.heightPercent}%`,
  };
}

function toStageStyle(size: SizePercents, scale: number, prefix: string): React.CSSProperties {
  return {
    ...toSizeStyle(size),
    [`--${prefix}-stage-scale`]: scale,
  } as React.CSSProperties;
}

function preloadImages(
  urls: string[],
  onDimensions: (url: string, dimensions: ImageDimensions) => void,
): void {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  uniqueUrls.forEach((url) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        onDimensions(url, { width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.src = url;
  });
}

export function Zoom({ settings, content, isEditor, isPreviewMode }: ZoomProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const {
    imageSize,
    maxWidth,
    maxHeight,
    transition = 1000,
    bgImage = 'greyscale',
  } = settings;
  const items = content ?? [];
  const initialIndices = getInitialIndices(items.length);
  const [activeIndex, setActiveIndex] = useState(initialIndices.activeIndex);
  const [backgroundIndex, setBackgroundIndex] = useState<number | null>(initialIndices.backgroundIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapLayout, setSnapLayout] = useState(false);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [incomingScale, setIncomingScale] = useState(0);
  const [outgoingScale, setOutgoingScale] = useState(1);
  const [outgoingFilter, setOutgoingFilter] = useState('none');
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev'>('next');
  const [imageDimensions, setImageDimensions] = useState<Record<string, ImageDimensions>>({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInteractive = !isEditor || Boolean(isPreviewMode);
  const legacyImageSize = imageSize ?? 60;
  const maxWidthPercent = Math.max(10, Math.min(100, maxWidth ?? legacyImageSize));
  const maxHeightPercent = Math.max(10, Math.min(100, maxHeight ?? legacyImageSize));
  const transitionMs = Math.max(100, transition);
  const backgroundFilter = getBackgroundFilter(bgImage);

  const getImageSizePercents = useCallback((url: string | undefined): SizePercents => {
    const aspectRatio = getImageAspectRatio(url ? imageDimensions[url] : undefined);
    return computeFitSize(
      containerSize.width,
      containerSize.height,
      aspectRatio,
      maxWidthPercent,
      maxHeightPercent,
    );
  }, [containerSize.height, containerSize.width, imageDimensions, maxHeightPercent, maxWidthPercent]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const urls = (content ?? []).map((item) => item.image?.url).filter((url): url is string => Boolean(url));
    preloadImages(urls, (url, dimensions) => {
      setImageDimensions((prev) => (
        prev[url]?.width === dimensions.width && prev[url]?.height === dimensions.height
          ? prev
          : { ...prev, [url]: dimensions }
      ));
    });
  }, [content]);

  useEffect(() => {
    const { backgroundIndex: nextBackgroundIndex, activeIndex: nextActiveIndex } = getInitialIndices(items.length);
    setActiveIndex(nextActiveIndex);
    setBackgroundIndex(nextBackgroundIndex);
    setIsAnimating(false);
    setSnapLayout(false);
    setOutgoingIndex(null);
    setIncomingIndex(null);
    setIncomingScale(0);
    setOutgoingScale(1);
    setOutgoingFilter('none');
    setTransitionDirection('next');
  }, [items.length, content]);

  useEffect(() => () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
  }, []);

  const startTransition = useCallback((direction: 'next' | 'prev') => {
    if (!isInteractive || isAnimating || items.length <= 1) return;

    const targetIndex = direction === 'next'
      ? (activeIndex + 1) % items.length
      : (activeIndex - 1 + items.length) % items.length;
    const activeSize = getImageSizePercents(items[activeIndex]?.image?.url);
    const targetSize = getImageSizePercents(items[targetIndex]?.image?.url);
    const activeCoverScale = computeCoverScale(containerSize.width, containerSize.height, activeSize);
    const targetCoverScale = computeCoverScale(containerSize.width, containerSize.height, targetSize);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setTransitionDirection(direction);
    setSnapLayout(true);
    setIsAnimating(true);

    if (direction === 'next') {
      setOutgoingIndex(activeIndex);
      setIncomingIndex(targetIndex);
      setIncomingScale(0);
      setOutgoingScale(1);
      setOutgoingFilter(getBackgroundFilter(bgImage, 0, 1));
    } else {
      setBackgroundIndex(getPreviousBackgroundIndex(targetIndex, items.length));
      setOutgoingIndex(targetIndex);
      setIncomingIndex(activeIndex);
      setIncomingScale(1);
      setOutgoingScale(targetCoverScale);
      setOutgoingFilter(getBackgroundFilter(bgImage, 1, targetCoverScale));
    }

    requestAnimationFrame(() => {
      setSnapLayout(false);
      requestAnimationFrame(() => {
        if (direction === 'next') {
          setIncomingScale(1);
          setOutgoingScale(activeCoverScale);
          setOutgoingFilter(getBackgroundFilter(bgImage, 1, activeCoverScale));
        } else {
          setIncomingScale(0);
          setOutgoingScale(1);
          setOutgoingFilter(getBackgroundFilter(bgImage, 0, 1));
        }
      });
    });

    transitionTimeoutRef.current = setTimeout(() => {
      if (direction === 'next') {
        setBackgroundIndex(activeIndex);
      }
      setActiveIndex(targetIndex);
      setOutgoingIndex(null);
      setIncomingIndex(null);
      setIsAnimating(false);
    }, transitionMs);
  }, [
    activeIndex,
    bgImage,
    containerSize.height,
    containerSize.width,
    getImageSizePercents,
    isAnimating,
    isInteractive,
    items,
    transitionMs,
  ]);

  const foregroundItem = items[activeIndex];
  const backgroundItem = backgroundIndex !== null ? items[backgroundIndex] : null;
  const outgoingItem = outgoingIndex !== null ? items[outgoingIndex] : null;
  const incomingItem = incomingIndex !== null ? items[incomingIndex] : null;
  const prevIndex = items.length <= 1 ? 0 : (activeIndex - 1 + items.length) % items.length;
  const nextIndex = items.length <= 1 ? 0 : (activeIndex + 1) % items.length;
  const foregroundSize = getImageSizePercents(foregroundItem?.image?.url);
  const outgoingFitSize = getImageSizePercents(outgoingItem?.image?.url);
  const incomingFitSize = getImageSizePercents(incomingItem?.image?.url);
  const wrapperStyle = {
    [`--${P}-transition-ms`]: `${transitionMs}ms`,
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        ref={wrapperRef}
        className={cn(`${P}-wrapper`, snapLayout && `${P}-snap`, isEditor && !isPreviewMode && `${P}-editor`)}
        style={wrapperStyle}
        aria-label="Zoom gallery"
      >
        {backgroundItem?.image?.url && (
          <div className={`${P}-background`} aria-hidden="true">
            <img
              className={`${P}-effect-image`}
              src={backgroundItem.image.url}
              alt=""
              style={{ filter: backgroundFilter }}
            />
          </div>
        )}

        {isAnimating && outgoingItem?.image?.url && (
          <div
            className={cn(
              `${P}-stage`,
              `${P}-outgoing`,
              `${P}-outgoing-${transitionDirection}`,
            )}
            style={toStageStyle(outgoingFitSize, outgoingScale, P)}
            aria-hidden="true"
          >
            <img
              className={`${P}-effect-image`}
              src={outgoingItem.image.url}
              alt=""
              style={{ filter: outgoingFilter }}
            />
          </div>
        )}

        {isAnimating && incomingItem?.image?.url && (
          <div
            className={cn(
              `${P}-stage`,
              `${P}-incoming`,
              `${P}-incoming-${transitionDirection}`,
            )}
            style={toStageStyle(incomingFitSize, incomingScale, P)}
            aria-hidden="true"
          >
            <img
              className={`${P}-image`}
              src={incomingItem.image.url}
              alt=""
            />
          </div>
        )}

        {!isAnimating && foregroundItem?.image?.url && (
          <div
            className={cn(`${P}-stage`, `${P}-foreground`)}
            style={toSizeStyle(foregroundSize)}
          >
            <img
              className={`${P}-image`}
              src={foregroundItem.image.url}
              alt={foregroundItem.image.name ?? ''}
            />
          </div>
        )}

        {isInteractive && items.length > 1 && !isAnimating && (
          <>
            <button
              type="button"
              className={cn(`${P}-nav`, `${P}-nav-prev`)}
              onClick={() => startTransition('prev')}
              aria-label={`Show previous image (${prevIndex + 1} of ${items.length})`}
            />
            <button
              type="button"
              className={cn(`${P}-nav`, `${P}-nav-next`)}
              onClick={() => startTransition('next')}
              aria-label={`Show next image (${nextIndex + 1} of ${items.length})`}
            />
          </>
        )}
      </div>
    </>
  );
}
