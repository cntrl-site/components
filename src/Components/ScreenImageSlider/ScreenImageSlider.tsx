import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from 'react';
import { type CommonComponentProps } from '../props';
import { useScopedStyles } from '../utils/useScopedStyles';

function getCSS(P: string): string {
  return `
.${P}-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--${P}-background);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}

.${P}-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.${P}-active {
  z-index: 3;
}

.${P}-backdrop {
  z-index: 0;
}

.${P}-backdrop .${P}-image {
  transform: scale(var(--${P}-backdrop-scale));
}

.${P}-expanding {
  z-index: 2;
}

.${P}-returning {
  z-index: 2;
}

.${P}-leaving {
  z-index: 3;
}

.${P}-image {
  display: block;
  width: var(--${P}-image-width);
  max-width: 100%;
  max-height: var(--${P}-image-max-height);
  height: auto;
  border-radius: var(--${P}-image-radius);
  object-fit: contain;
  transform-origin: center center;
  will-change: transform;
}

.${P}-entering .${P}-image {
  animation: ${P}-enter var(--${P}-duration) var(--${P}-ease) both;
}

.${P}-expanding .${P}-image {
  animation: ${P}-expand var(--${P}-duration) var(--${P}-ease) both;
}

.${P}-returning .${P}-image {
  animation: ${P}-return var(--${P}-duration) var(--${P}-ease) both;
}

.${P}-leaving .${P}-image {
  animation: ${P}-leave var(--${P}-duration) var(--${P}-ease) both;
}

.${P}-empty {
  position: absolute;
  inset: 0;
}

@keyframes ${P}-enter {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes ${P}-expand {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(var(--${P}-backdrop-scale));
  }
}

@keyframes ${P}-return {
  from {
    transform: scale(var(--${P}-backdrop-scale));
  }
  to {
    transform: scale(1);
  }
}

@keyframes ${P}-leave {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0);
  }
}
`;
}

type ScreenImageSliderProps = {
  settings: ScreenImageSliderSettings;
  content?: ScreenImageSliderItem[];
  isEditor?: boolean;
} & CommonComponentProps;

type ScreenImageSliderSettings = {
  imageWidth: number;
  imageMaxHeight: number;
  imageRadius: number;
  backgroundColor: string;
  transitionDuration: number;
  backdropScale: number;
};

type ScreenImageSliderItem = {
  image?: {
    url?: string;
    name?: string;
  };
};

type ScreenImageSliderImageItem = ScreenImageSliderItem & {
  image: {
    url: string;
    name?: string;
  };
};

type TransitionState = {
  fromIndex: number;
  toIndex: number;
  direction: 1 | -1;
  key: number;
};

export function ScreenImageSlider({ settings, content = [] }: ScreenImageSliderProps) {
  const { prefix: P } = useScopedStyles();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const clearTimerRef = useRef<number | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const slides = content.filter(hasImageUrl);
  const imageSignature = slides.map(item => item.image.url).join('|');
  const hasImages = slides.length > 0;
  const isAdvancing = transition?.direction === 1;
  const isReversing = transition?.direction === -1;
  const visibleActiveIndex = isAdvancing ? transition.toIndex : activeIndex;
  const activeItem = slides[hasImages ? wrapIndex(visibleActiveIndex, slides.length) : 0];
  const backdropIndex = transition
    ? wrapIndex(transition.fromIndex - 1, slides.length)
    : wrapIndex(activeIndex - 1, slides.length);
  const backdropItem = slides.length > 1 ? slides[backdropIndex] : undefined;
  const backdropScale = settings.backdropScale ?? 3.8;
  const expandingItem = isAdvancing ? slides[transition.fromIndex] : undefined;
  const returningItem = isReversing ? slides[transition.toIndex] : undefined;
  const leavingItem = isReversing ? slides[transition.fromIndex] : undefined;
  const duration = settings.transitionDuration ?? 700;

  useEffect(() => {
    setActiveIndex(0);
    setTransition(null);
    setTransitionKey(0);
  }, [imageSignature]);

  useEffect(() => () => {
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
    }
  }, []);

  const wrapperStyle: CSSProperties = {
    [`--${P}-background` as string]: settings.backgroundColor ?? 'oklch(1 0.0001 90 / 0)',
    [`--${P}-image-width` as string]: `${settings.imageWidth ?? 56}%`,
    [`--${P}-image-max-height` as string]: `${settings.imageMaxHeight ?? 74}%`,
    [`--${P}-image-radius` as string]: `${settings.imageRadius ?? 0}px`,
    [`--${P}-duration` as string]: `${duration}ms`,
    [`--${P}-ease` as string]: 'cubic-bezier(0.76, 0, 0.24, 1)',
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!hasImages || slides.length < 2 || transition || !activeItem) return;
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const direction = event.clientX - rect.left >= rect.width / 2 ? 1 : -1;
    const nextIndex = wrapIndex(activeIndex + direction, slides.length);

    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
    }

    const nextTransitionKey = transitionKey + 1;
    setTransition({
      fromIndex: activeIndex,
      toIndex: nextIndex,
      direction,
      key: nextTransitionKey,
    });
    setTransitionKey(prev => prev + 1);
    clearTimerRef.current = window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setTransition(null);
    }, duration);
  };

  return (
    <div
      className={`${P}-slider`}
      ref={rootRef}
      onClick={handleClick}
      style={wrapperStyle}
      aria-label="Image slider"
    >
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      {!hasImages ? <div className={`${P}-empty`} /> : null}
      {backdropItem && !isReversing ? (
        <div
          className={`${P}-slide ${P}-backdrop`}
          key={`backdrop-${backdropIndex}`}
          style={{ [`--${P}-backdrop-scale` as string]: String(backdropScale) }}
        >
          <img
            className={`${P}-image`}
            src={backdropItem.image.url}
            alt={backdropItem.image.name ?? ''}
            draggable={false}
          />
        </div>
      ) : null}
      {returningItem ? (
        <div
          className={`${P}-slide ${P}-returning`}
          key={`returning-${transition?.key}`}
          style={{ [`--${P}-backdrop-scale` as string]: String(backdropScale) }}
        >
          <img
            className={`${P}-image`}
            src={returningItem.image.url}
            alt={returningItem.image.name ?? ''}
            draggable={false}
          />
        </div>
      ) : null}
      {transition && expandingItem ? (
        <div
          className={`${P}-slide ${P}-expanding`}
          key={`expanding-${transition.key}`}
          style={{ [`--${P}-backdrop-scale` as string]: String(backdropScale) }}
        >
          <img
            className={`${P}-image`}
            src={expandingItem.image.url}
            alt={expandingItem.image.name ?? ''}
            draggable={false}
          />
        </div>
      ) : null}
      {leavingItem ? (
        <div
          className={`${P}-slide ${P}-leaving`}
          key={`leaving-${transition?.key}`}
        >
          <img
            className={`${P}-image`}
            src={leavingItem.image.url}
            alt={leavingItem.image.name ?? ''}
            draggable={false}
          />
        </div>
      ) : null}
      {activeItem && !isReversing ? (
        <div
          className={`${P}-slide ${P}-active ${isAdvancing ? `${P}-entering` : ''}`}
          key={`active-${visibleActiveIndex}-${transitionKey}`}
        >
          <img
            className={`${P}-image`}
            src={activeItem.image.url}
            alt={activeItem.image.name ?? ''}
            draggable={false}
          />
        </div>
      ) : null}
    </div>
  );
}

function wrapIndex(index: number, total: number) {
  return ((index % total) + total) % total;
}

function hasImageUrl(item: ScreenImageSliderItem): item is ScreenImageSliderImageItem {
  return Boolean(item.image?.url);
}
