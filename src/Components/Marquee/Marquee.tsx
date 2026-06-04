import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';

function getCSS(P: string): string {
  return `
.${P}-marquee-wrapper {
  overflow: hidden;
  width: 100%;
  height: auto;
}

@keyframes ${P}-marquee-left {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(calc(-1 * var(--marquee-distance)), 0, 0); }
}

@keyframes ${P}-marquee-right {
  from { transform: translate3d(calc(-1 * var(--marquee-distance)), 0, 0); }
  to { transform: translate3d(0, 0, 0); }
}

.${P}-marquee-track {
  display: flex;
  flex-direction: row;
  width: max-content;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  flex-wrap: nowrap;
  animation-duration: var(--marquee-duration);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: var(--marquee-play-state, running);
}

.${P}-marquee-track[data-direction="left"] {
  animation-name: ${P}-marquee-left;
}

.${P}-marquee-track[data-direction="right"] {
  animation-name: ${P}-marquee-right;
}
.${P}-marquee-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}
.${P}-marquee-set {
  flex: 0 0 auto;
}
.${P}-marquee-static {
  justify-content: center;
  overflow-x: auto;
}
.${P}-marquee-card {
  position: relative;
  flex: 0 0 auto;
  align-self: flex-start;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}
.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  order: 1;
}
.${P}-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.${P}-elements-overlay {
  position: relative;
  inset: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}
.${P}-control {
  position: relative;
  z-index: 2;
  width: 100%;
}

.${P}-marquee-link {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
}
.${P}-marquee-link-contain {
  width: auto;
  height: auto;
}

.${P}-control::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 20px;
  pointer-events: auto;
  z-index: 10;
}
.${P}-image-hover-brightness img {
  transition: filter 0.3s ease;
}
.${P}-image-hover-brightness:hover img {
  filter: brightness(1.25);
}
.${P}-image-hover-grayscale img {
  transition: filter 0.3s ease;
}
.${P}-image-hover-grayscale:hover img {
  filter: grayscale(100%);
}
.${P}-image-hover-saturate img {
  transition: filter 0.3s ease;
}
.${P}-image-hover-saturate:hover img {
  filter: saturate(2);
}
`;
}

const PX_PER_SEC_PER_SPEED_UNIT = 30;
const MIN_CONTENT_SEQUENCE_REPEAT = 2;
const OUTER_SET_COPIES = 2;

const expandSetContent = (items: MarqueeItem[], repeat: number) =>
  Array.from({ length: repeat }, () => items).flat();

const isCardInMarqueeView = (card: Element, wrapper: Element): boolean => {
  const wrapperRect = wrapper.getBoundingClientRect();
  const rect = card.getBoundingClientRect();
  return rect.right > wrapperRect.left && rect.left < wrapperRect.right;
};

const isAnyCopyOfSlotInView = (wrapper: Element, itemIndex: number): boolean => {
  const cards = wrapper.querySelectorAll<HTMLElement>(`[data-marquee-item-index="${itemIndex}"]`);
  return Array.from(cards).some((card) => isCardInMarqueeView(card, wrapper));
};

type MarqueeItemCardProps = {
  item: MarqueeItem;
  prefix: string;
  imageFit: 'cover' | 'contain';
  imageMaxWidth: number;
  imageMaxHeight: number;
  imageHoverClass?: string;
  isEditor?: boolean;
  isFirstSet?: boolean;
  scaled: (value: number) => string;
  onFirstSetImageDone?: () => void;
};

const MarqueeItemCard = ({
  item,
  prefix: P,
  imageFit,
  imageMaxWidth,
  imageMaxHeight,
  imageHoverClass,
  isFirstSet,
  scaled,
  onFirstSetImageDone,
}: MarqueeItemCardProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useLayoutEffect(() => {
    if (!isFirstSet) return;
    const el = imageRef.current;
    if (el?.complete) onFirstSetImageDone?.();
  }, [isFirstSet, item.image?.url, onFirstSetImageDone]);

  const isCover = imageFit === 'cover';
  const imageNode =
    item.image?.url &&
    (
      <img
        ref={imageRef}
        src={item.image.url}
        alt={item.image?.name ?? ''}
        style={
          isCover
            ? {
                pointerEvents: 'auto',
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }
            : {
                pointerEvents: 'auto',
                display: 'block',
                height: '100%',
                width: 'auto',
                maxWidth: scaled(imageMaxWidth),
                objectFit: 'contain',
              }
        }
        onLoad={isFirstSet ? onFirstSetImageDone : undefined}
        onError={isFirstSet ? onFirstSetImageDone : undefined}
      />
    );
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        ...(isCover
          ? { width: scaled(imageMaxWidth) }
          : { width: 'fit-content', maxWidth: scaled(imageMaxWidth), minWidth: 0 }),
      }}
    >
      <div
        className={imageHoverClass}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          ...(isCover
            ? { width: '100%', height: scaled(imageMaxHeight), overflow: 'hidden' }
            : {
                width: 'fit-content',
                maxWidth: scaled(imageMaxWidth),
                height: scaled(imageMaxHeight),
              }),
        }}
      >
        {imageNode && item.link
          ? (
            <a
              href={item.link}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(`${P}-marquee-link`, !isCover && `${P}-marquee-link-contain`)}
            >
              {imageNode}
            </a>
          )
          : imageNode
        }
      </div>
    </div>
  );
};

export const Marquee = ({ settings, content, isEditor, isPreviewMode }: MarqueeProps) => {
  const { prefix: P } = useScopedStyles();
  const { speed, direction, pauseOnHover, gap, imageMaxWidth, imageMaxHeight, imageFit, hoverEffect } = settings;
  const imageHoverClass = hoverEffect === 'off' || hoverEffect === 'randomize' ? undefined : `${P}-image-hover-${hoverEffect}`;
  const autoplayEnabled = !isPreviewMode;
  const pxPerSec = Math.max(0, speed) * PX_PER_SEC_PER_SPEED_UNIT;
  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [setWidth, setSetWidth] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  const hoverPauseEnabled = autoplayEnabled && pauseOnHover === 'on';
  const [isHovering, setIsHovering] = useState(false);
  const [swappedSlots, setSwappedSlots] = useState<Record<number, MarqueeItem>>({});
  const swappedSlotsRef = useRef(swappedSlots);
  swappedSlotsRef.current = swappedSlots;
  const stableCandidateRef = useRef<number | null>(null);
  const loadedFirstSetImagesRef = useRef(0);
  const scheduleRemeasureRef = useRef<(() => void) | null>(null);
  const contentImageUrlsKey = useMemo(() => (content ?? []).map((i) => i.image?.url ?? '').join('\0'),[content]);
  const [contentSequenceRepeat, setContentSequenceRepeat] = useState(MIN_CONTENT_SEQUENCE_REPEAT);
  const setContent = useMemo(() => {
    const items = content ?? [];
    if (!autoplayEnabled || items.length === 0) return items;
    return expandSetContent(items, contentSequenceRepeat);
  }, [content, autoplayEnabled, contentSequenceRepeat]);
  const firstSetImageUrlCount = useMemo(
    () => setContent.filter((i) => Boolean(i.image?.url)).length,
    [setContent],
  );
  const copies = useMemo(() => {
    if (!autoplayEnabled || (content?.length ?? 0) === 0) return 1;
    return OUTER_SET_COPIES;
  }, [autoplayEnabled, content?.length]);

  useLayoutEffect(() => {
    loadedFirstSetImagesRef.current = 0;
    setSwappedSlots({});
    stableCandidateRef.current = null;
    setContentSequenceRepeat(MIN_CONTENT_SEQUENCE_REPEAT);
    setSetWidth(0);
  }, [contentImageUrlsKey]);

  useEffect(() => {
    if (hoverEffect !== 'randomize') return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const revertSwappedSlotsOutOfView = (itemIndices: Iterable<number>) => {
      setSwappedSlots((prev) => {
        let next: Record<number, MarqueeItem> | null = null;
        for (const itemIndex of itemIndices) {
          if (!(itemIndex in prev)) continue;
          if (isAnyCopyOfSlotInView(wrapper, itemIndex)) continue;
          if (!next) next = { ...prev };
          delete next[itemIndex];
        }
        return next ?? prev;
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const itemIndices = new Set<number>();
      for (const entry of entries) {
        const raw = (entry.target as HTMLElement).dataset.marqueeItemIndex;
        const itemIndex = raw !== undefined ? Number(raw) : NaN;
        if (!Number.isNaN(itemIndex)) itemIndices.add(itemIndex);
      }
      if (itemIndices.size > 0) revertSwappedSlotsOutOfView(itemIndices);
    }, { root: wrapper, threshold: 0 });

    Object.keys(swappedSlots).forEach((rawItemIndex) => {
      const itemIndex = Number(rawItemIndex);
      wrapper
        .querySelectorAll<HTMLDivElement>(`[data-marquee-item-index="${itemIndex}"]`)
        .forEach((card) => observer.observe(card));
    });

    let raf = 0;
    const tick = () => {
      const swappedKeys = Object.keys(swappedSlotsRef.current);
      if (swappedKeys.length === 0) return;
      revertSwappedSlotsOutOfView(swappedKeys.map(Number));
      raf = requestAnimationFrame(tick);
    };
    if (Object.keys(swappedSlotsRef.current).length > 0) {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [hoverEffect, swappedSlots]);

  useLayoutEffect(() => {
    if (!autoplayEnabled) return;
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    let raf = 0;
    const measure = () => {
      const nextContainerWidth = wrapper.getBoundingClientRect().width;
      const nextRawSetWidth = set.getBoundingClientRect().width;
      const prevCandidate = stableCandidateRef.current;
      const isStableNow =
        typeof prevCandidate === 'number' &&
        Math.abs(prevCandidate - nextRawSetWidth) <= 0.25;
      stableCandidateRef.current = nextRawSetWidth;
      if (nextRawSetWidth > 0 && contentSequenceRepeat > 0) {
        const singleCycleWidth = nextRawSetWidth / contentSequenceRepeat;
        if (singleCycleWidth > 0 && nextContainerWidth > 0) {
          const targetRepeat = Math.max(
            MIN_CONTENT_SEQUENCE_REPEAT,
            Math.ceil(nextContainerWidth / singleCycleWidth) + 1,
          );
          if (targetRepeat !== contentSequenceRepeat) {
            setContentSequenceRepeat(targetRepeat);
            return;
          }
        }
      }
      if (nextRawSetWidth > 0 && setWidth <= 0) {
        setSetWidth(nextRawSetWidth);
        return;
      }
      if (isStableNow && nextRawSetWidth !== setWidth) {
        setSetWidth(nextRawSetWidth);
      } else if (!isStableNow && setWidth <= 0) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    scheduleRemeasureRef.current = schedule;
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      scheduleRemeasureRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [autoplayEnabled, setWidth, contentImageUrlsKey, contentSequenceRepeat]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!autoplayEnabled || !track) return;
    const safeSetWidth = setWidth > 0 ? setWidth : 0;
    const durationMs = safeSetWidth > 0 && pxPerSec > 0 ? (safeSetWidth / pxPerSec) * 1000 : 0;
    const durationS = `${Math.max(0, durationMs) / 1000}s`;
    track.style.setProperty('--marquee-distance', `${safeSetWidth}px`);
    track.style.setProperty('--marquee-duration', durationS);
  }, [autoplayEnabled, pxPerSec, setWidth]);

  useLayoutEffect(() => {
    if (!autoplayEnabled) {
      setTrackHeight(0);
      return;
    }
    if (setWidth <= 0) {
      setTrackHeight(0);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const next = track.getBoundingClientRect().height;
      setTrackHeight(next > 0 ? next : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [autoplayEnabled, copies, setContent, isEditor, gap, imageMaxWidth, imageMaxHeight, setWidth, imageFit, swappedSlots]);

  const onTrackEnter = () => {
    if (!hoverPauseEnabled) return;
    setIsHovering(true);
  };
  const onTrackLeave = () => {
    if (!hoverPauseEnabled) return;
    setIsHovering(false);
  };

  const onFirstSetImageDone = useCallback(() => {
    loadedFirstSetImagesRef.current = Math.min(
      firstSetImageUrlCount,
      loadedFirstSetImagesRef.current + 1,
    );
    scheduleRemeasureRef.current?.();
  }, [firstSetImageUrlCount]);

  const handleRandomizeEnter = useCallback((slotIndex: number, item: MarqueeItem) => {
    setSwappedSlots((prev) => {
      const current = prev[slotIndex] ?? item;
      const candidates = (content ?? []).filter((c) => c !== current);
      if (candidates.length === 0) return prev;
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      return { ...prev, [slotIndex]: next };
    });
  }, [content]);

  const renderCardWrapper = (item: MarqueeItem, copyIndex: number, slotIndex: number, isFirstSet?: boolean) => {
    const displayItem = hoverEffect === 'randomize' && imageFit === 'cover' ? (swappedSlots[slotIndex] ?? item) : item;
    return (
      <div
        key={`${copyIndex}-${slotIndex}`}
        className={`${P}-marquee-card`}
        data-marquee-item-index={slotIndex}
        onMouseEnter={hoverEffect === 'randomize' && imageFit === 'cover' ? () => handleRandomizeEnter(slotIndex, item) : undefined}
      >
        <MarqueeItemCard
          item={displayItem}
          prefix={P}
          imageFit={imageFit}
          imageMaxWidth={imageMaxWidth}
          imageMaxHeight={imageMaxHeight}
          imageHoverClass={imageHoverClass}
          isEditor={isEditor}
          isFirstSet={isFirstSet}
          scaled={scaled}
          onFirstSetImageDone={onFirstSetImageDone}
        />
        {isEditor && (
          <div
            data-controls="gap"
            data-controls-axis="x"
            style={{
              position: 'absolute',
              top: 0,
              right: `calc(-1 * ${scaled(gap)})`,
              width: scaled(gap),
              height: '100%',
              pointerEvents: 'auto',
              zIndex: 2,
            }}
          />
        )}
      </div>
    );
  };

  if (autoplayEnabled && (content?.length ?? 0) > 0) {
    return (
      <div
        ref={wrapperRef}
        className={cn(`${P}-wrapper`, `${P}-marquee-wrapper`)}
        aria-label="Marquee"
        style={setWidth > 0 && trackHeight > 0 ? { height: trackHeight } : undefined}
      >
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        <div
          key="marquee-track"
          ref={trackRef}
          className={`${P}-marquee-track`}
          data-direction={direction}
          onMouseEnter={onTrackEnter}
          onMouseLeave={onTrackLeave}
          style={{
            ...(hoverPauseEnabled
              ? ({ '--marquee-play-state': isHovering ? 'paused' : 'running' } as React.CSSProperties)
              : ({ '--marquee-play-state': 'running' } as React.CSSProperties)),
          }}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <div
              key={`set-${copyIndex}`}
              ref={copyIndex === 0 ? setRef : undefined}
              className={cn(`${P}-marquee-row`, `${P}-marquee-set`)}
              style={{
                gap: scaled(gap),
                paddingRight: scaled(gap),
              }}
              aria-hidden={copyIndex > 0}
            >
              {setContent.map((marqueeItem, slotIndex) =>
                renderCardWrapper(marqueeItem, copyIndex, slotIndex, copyIndex === 0),
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`${P}-wrapper`}>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div
        key="marquee-static"
        className={cn(`${P}-marquee-row`, `${P}-marquee-static`)}
        style={{ gap: scaled(gap), transform: 'none' }}
        aria-label="Marquee"
      >
        {content?.map((marqueeItem, itemIndex) =>
          renderCardWrapper(marqueeItem, 0, itemIndex),
        )}
      </div>
    </div>
  );
};

export type MarqueeItem = {
  image?: {
    url?: string;
    name?: string;
  };
  link?: string;
};

export type MarqueeSettings = {
  speed: number;
  direction: 'left' | 'right';
  pauseOnHover: 'on' | 'off';
  hoverEffect: 'off' | 'brightness' | 'grayscale' | 'saturate' | 'randomize';
  gap: number;
  imageMaxWidth: number;
  imageMaxHeight: number;
  imageFit: 'cover' | 'contain';
};

type MarqueeProps = {
  settings: MarqueeSettings;
  content?: MarqueeItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;
