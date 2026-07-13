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
  transition?: number;
  bgImage?: 'greyscale' | 'blur' | 'as is';
  effectAmount?: number;
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
  transform: scale(var(--${P}-effect-bleed-scale, 1));
  transform-origin: center center;
}
.${P}-stage {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
}
.${P}-foreground {
  z-index: 2;
  width: var(--${P}-image-size);
  height: var(--${P}-image-size);
}
.${P}-incoming {
  z-index: 4;
  width: var(--${P}-incoming-size);
  height: var(--${P}-incoming-size);
  transition: width var(--${P}-transition-ms) ease, height var(--${P}-transition-ms) ease;
  will-change: width, height;
}
.${P}-outgoing {
  z-index: 3;
  width: var(--${P}-outgoing-size);
  height: var(--${P}-outgoing-size);
  transition: width var(--${P}-transition-ms) ease, height var(--${P}-transition-ms) ease;
  will-change: width, height;
}
.${P}-outgoing .${P}-effect-image {
  transition: filter var(--${P}-transition-ms) ease, transform var(--${P}-transition-ms) ease;
}
.${P}-background .${P}-effect-image {
  transition: filter var(--${P}-transition-ms) ease, transform var(--${P}-transition-ms) ease;
}
.${P}-snap .${P}-incoming,
.${P}-snap .${P}-outgoing,
.${P}-snap .${P}-outgoing .${P}-effect-image {
  transition: none !important;
}
.${P}-foreground-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.${P}-foreground-button:disabled {
  cursor: default;
  pointer-events: none;
}
.${P}-foreground-button:focus,
.${P}-foreground-button:focus-visible {
  outline: none;
}
.${P}-editor .${P}-foreground-button {
  cursor: default;
}
.${P}-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
`;
}

function getBackgroundFilter(bgImage: ZoomSettings['bgImage'], effectAmount: number, progress = 1): string {
  const amount = effectAmount * Math.max(0, Math.min(1, progress));
  if (bgImage === 'greyscale') {
    return `grayscale(${amount}%)`;
  }
  if (bgImage === 'blur') {
    return `blur(${amount / 4}px)`;
  }
  return 'none';
}

function getBlurBleedScale(bgImage: ZoomSettings['bgImage'], effectAmount: number, progress = 1): number {
  if (bgImage !== 'blur') return 1;
  const blurPx = (effectAmount / 4) * Math.max(0, Math.min(1, progress));
  if (blurPx <= 0) return 1;
  return 1 + Math.min(0.3, blurPx / 70);
}

function getInitialIndices(itemCount: number): { backgroundIndex: number | null; activeIndex: number } {
  if (itemCount <= 1) {
    return { backgroundIndex: 0, activeIndex: 0 };
  }
  return { backgroundIndex: 0, activeIndex: 1 };
}

function preloadImages(urls: string[]): void {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  uniqueUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

export function Zoom({ settings, content, isEditor, isPreviewMode }: ZoomProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const {
    imageSize = 60,
    transition = 1000,
    bgImage = 'greyscale',
    effectAmount = 50,
  } = settings;
  const items = content ?? [];
  const initialIndices = getInitialIndices(items.length);
  const [activeIndex, setActiveIndex] = useState(initialIndices.activeIndex);
  const [backgroundIndex, setBackgroundIndex] = useState<number | null>(initialIndices.backgroundIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [snapLayout, setSnapLayout] = useState(false);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [incomingSizePercent, setIncomingSizePercent] = useState(0);
  const [outgoingSizePercent, setOutgoingSizePercent] = useState(0);
  const [outgoingFilter, setOutgoingFilter] = useState('none');
  const [outgoingBleedScale, setOutgoingBleedScale] = useState(1);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInteractive = !isEditor || Boolean(isPreviewMode);
  const imageSizePercent = Math.max(10, Math.min(100, imageSize));
  const transitionMs = Math.max(100, transition);
  const backgroundFilter = getBackgroundFilter(bgImage, effectAmount);
  const effectBleedScale = getBlurBleedScale(bgImage, effectAmount, 1);

  useEffect(() => {
    const urls = (content ?? []).map((item) => item.image?.url).filter((url): url is string => Boolean(url));
    preloadImages(urls);
  }, [content]);

  useEffect(() => {
    const { backgroundIndex: nextBackgroundIndex, activeIndex: nextActiveIndex } = getInitialIndices(items.length);
    setActiveIndex(nextActiveIndex);
    setBackgroundIndex(nextBackgroundIndex);
    setIsAnimating(false);
    setSnapLayout(false);
    setOutgoingIndex(null);
    setIncomingIndex(null);
    setIncomingSizePercent(0);
    setOutgoingSizePercent(0);
    setOutgoingFilter('none');
    setOutgoingBleedScale(1);
  }, [items.length, content]);

  useEffect(() => () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
  }, []);

  const startTransition = useCallback(() => {
    if (!isInteractive || isAnimating || items.length <= 1) return;

    const nextIndex = (activeIndex + 1) % items.length;
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setSnapLayout(true);
    setIsAnimating(true);
    setOutgoingIndex(activeIndex);
    setIncomingIndex(nextIndex);
    setIncomingSizePercent(0);
    setOutgoingSizePercent(imageSizePercent);
    setOutgoingFilter(getBackgroundFilter(bgImage, effectAmount, 0));
    setOutgoingBleedScale(getBlurBleedScale(bgImage, effectAmount, 0));

    requestAnimationFrame(() => {
      setSnapLayout(false);
      requestAnimationFrame(() => {
        setIncomingSizePercent(imageSizePercent);
        setOutgoingSizePercent(100);
        setOutgoingFilter(getBackgroundFilter(bgImage, effectAmount, 1));
        setOutgoingBleedScale(getBlurBleedScale(bgImage, effectAmount, 1));
      });
    });

    transitionTimeoutRef.current = setTimeout(() => {
      setSnapLayout(true);
      setBackgroundIndex(activeIndex);
      setActiveIndex(nextIndex);
      setOutgoingIndex(null);
      setIncomingIndex(null);
      setIncomingSizePercent(0);
      setOutgoingSizePercent(0);
      setOutgoingFilter('none');
      setOutgoingBleedScale(1);
      setIsAnimating(false);

      requestAnimationFrame(() => {
        setSnapLayout(false);
      });
    }, transitionMs);
  }, [activeIndex, bgImage, effectAmount, imageSizePercent, isAnimating, isInteractive, items.length, transitionMs]);

  const foregroundItem = items[activeIndex];
  const backgroundItem = backgroundIndex !== null ? items[backgroundIndex] : null;
  const outgoingItem = outgoingIndex !== null ? items[outgoingIndex] : null;
  const incomingItem = incomingIndex !== null ? items[incomingIndex] : null;
  const wrapperStyle = {
    [`--${P}-image-size`]: `${imageSizePercent}%`,
    [`--${P}-incoming-size`]: `${incomingSizePercent}%`,
    [`--${P}-outgoing-size`]: `${outgoingSizePercent}%`,
    [`--${P}-transition-ms`]: `${transitionMs}ms`,
    [`--${P}-effect-bleed-scale`]: effectBleedScale,
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
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
          <div className={cn(`${P}-stage`, `${P}-outgoing`)} aria-hidden="true">
            <img
              className={`${P}-effect-image`}
              src={outgoingItem.image.url}
              alt=""
              style={{
                filter: outgoingFilter,
                transform: `scale(${outgoingBleedScale})`,
              }}
            />
          </div>
        )}

        {isAnimating && incomingItem?.image?.url && (
          <div className={cn(`${P}-stage`, `${P}-incoming`)} aria-hidden="true">
            <img
              className={`${P}-image`}
              src={incomingItem.image.url}
              alt=""
            />
          </div>
        )}

        {!isAnimating && foregroundItem?.image?.url && (
          <div className={cn(`${P}-stage`, `${P}-foreground`)}>
            <button
              type="button"
              className={`${P}-foreground-button`}
              onClick={startTransition}
              disabled={!isInteractive}
              aria-label={`Show next image (${activeIndex + 1} of ${items.length})`}
            >
              <img
                className={`${P}-image`}
                src={foregroundItem.image.url}
                alt={foregroundItem.image.name ?? ''}
              />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
