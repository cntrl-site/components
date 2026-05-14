import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

.${P}-marquee-track {
  display: flex;
  flex-direction: row;
  width: max-content;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  perspective: 1000px;
}

.${P}-marquee-set {
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;

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
`;
}

type MarqueeProps = {
  settings: MarqueeSettings;
  content?: MarqueeItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

const PX_PER_SEC_PER_SPEED_UNIT = 30;
const SET_WIDTH_STREAK_MIN = 12;
const SET_WIDTH_RAF_FALLBACK = 180;

export const Marquee = ({ settings, content, isEditor, isPreviewMode }: MarqueeProps) => {
  const { prefix: P } = useScopedStyles();
  const { speed, direction, pauseOnHover, gap, imageMaxWidth, imageMaxHeight } = settings;
  const autoplayEnabled = !isPreviewMode;
  const isAnimating = autoplayEnabled;
  const pxPerSec = Math.max(0, speed) * PX_PER_SEC_PER_SPEED_UNIT;
  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [setWidth, setSetWidth] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  const hoverPauseEnabled = isAnimating && pauseOnHover === 'on';
  const [isHovering, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const widthStreakRef = useRef<{ w: number; n: number }>({ w: -1, n: 0 });
  const settleFramesRef = useRef(0);
  const loadedFirstSetImagesRef = useRef(0);
  const scheduleRemeasureRef = useRef<(() => void) | null>(null);
  const contentImageUrlsKey = useMemo(
    () => (content ?? []).map((i) => i.image?.url ?? '').join('\0'),
    [content],
  );
  const firstSetImageUrlCount = useMemo(
    () => (content ?? []).filter((i) => Boolean(i.image?.url)).length,
    [content],
  );
  const copies = useMemo(() => {
    if (!autoplayEnabled || content?.length === 0) return 1;
    if (setWidth <= 0 || containerWidth <= 0) return 2;
    return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
  }, [autoplayEnabled, content?.length, setWidth, containerWidth]);

  useLayoutEffect(() => {
    loadedFirstSetImagesRef.current = 0;
  }, [contentImageUrlsKey]);

  useLayoutEffect(() => {
    if (!autoplayEnabled) return;
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    let raf = 0;
    const measure = () => {
      const nextContainerWidth = wrapper.getBoundingClientRect().width;
      const rectW = set.getBoundingClientRect().width;
      if (rectW > 0) loopWidthRef.current = rectW;
      const nextRawSetWidth =
        set.offsetWidth > 0 ? set.offsetWidth : Math.max(0, Math.round(rectW));
      if (widthStreakRef.current.w !== nextRawSetWidth) {
        widthStreakRef.current = { w: nextRawSetWidth, n: 1 };
      } else {
        widthStreakRef.current.n += 1;
      }
      const streakOk = widthStreakRef.current.n >= SET_WIDTH_STREAK_MIN;
      const imagesOk =
        firstSetImageUrlCount === 0 ||
        loadedFirstSetImagesRef.current >= firstSetImageUrlCount;
      setContainerWidth(nextContainerWidth);
      const initialPending =
        typeof nextRawSetWidth === 'number' && nextRawSetWidth > 0 && setWidth <= 0;
      const updatePending =
        typeof nextRawSetWidth === 'number' &&
        nextRawSetWidth > 0 &&
        setWidth > 0 &&
        nextRawSetWidth !== setWidth;
      if (initialPending) {
        settleFramesRef.current += 1;
        const canCommit =
          imagesOk &&
          (streakOk || settleFramesRef.current > SET_WIDTH_RAF_FALLBACK);
        if (canCommit) {
          settleFramesRef.current = 0;
          setSetWidth(nextRawSetWidth);
          return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
        return;
      }
      if (updatePending) {
        settleFramesRef.current += 1;
        const canUpdate =
          imagesOk &&
          (streakOk || settleFramesRef.current > SET_WIDTH_RAF_FALLBACK);
        if (canUpdate) {
          settleFramesRef.current = 0;
          setSetWidth(nextRawSetWidth);
          return;
        }
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
        return;
      }
      settleFramesRef.current = 0;
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
  }, [autoplayEnabled, firstSetImageUrlCount, setWidth]);

  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useLayoutEffect(() => {
    if (!autoplayEnabled || !isAnimating) return;
    const track = trackRef.current;
    const set = setRef.current;
    if (!track || !set) return;
    if (setWidth <= 0 || pxPerSec <= 0) return;

    if (loopWidthRef.current <= 0) {
      const rectW = set.getBoundingClientRect().width;
      if (rectW > 0) loopWidthRef.current = rectW;
    }
    const initialW = loopWidthRef.current > 0 ? loopWidthRef.current : setWidth;

    if (direction === 'right' && offsetRef.current >= 0) {
      offsetRef.current = -initialW;
    } else if (direction === 'left' && offsetRef.current > 0) {
      offsetRef.current = 0;
    }

    let raf = 0;
    let lastTime = 0;
    const tick = (now: number) => {
      if (lastTime === 0) lastTime = now;
      const dt = Math.min(100, now - lastTime) / 1000;
      lastTime = now;
      const paused = hoverPauseEnabled && isHoveringRef.current;
      if (!paused) {
        const delta = pxPerSec * dt;
        offsetRef.current += direction === 'left' ? -delta : delta;
        const liveW = loopWidthRef.current > 0 ? loopWidthRef.current : setWidth;
        if (liveW > 0) {
          if (direction === 'left' && offsetRef.current <= -liveW) {
            offsetRef.current += liveW;
          } else if (direction === 'right' && offsetRef.current >= 0) {
            offsetRef.current -= liveW;
          }
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [autoplayEnabled, isAnimating, pxPerSec, direction, setWidth, hoverPauseEnabled]);

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
    return () => {
      ro.disconnect();
    };
  }, [autoplayEnabled, copies, content, isEditor, gap, imageMaxWidth, imageMaxHeight, setWidth]);

  const onTrackEnter = () => {
    if (!hoverPauseEnabled) return;
    setIsHovering(true);
  };
  const onTrackLeave = () => {
    if (!hoverPauseEnabled) return;
    setIsHovering(false);
  };

  const onFirstSetImageDone = () => {
    loadedFirstSetImagesRef.current = Math.min(
      firstSetImageUrlCount,
      loadedFirstSetImagesRef.current + 1,
    );
    scheduleRemeasureRef.current?.();
  };

  const renderCard = (item: MarqueeItem, key: string | number, isFirstSet?: boolean) => {
    const isContain = item?.image?.objectFit === 'contain';
    return (
      <div
        key={key}
        style={{
          ...(isContain ? { maxWidth: scaled(imageMaxWidth) } : { width: scaled(imageMaxWidth) }),
          height: scaled(imageMaxHeight),
        }}
      >
        {item.image?.url && (
          <img
            src={item.image.url}
            alt={item.image?.name ?? ''}
            style={{
              pointerEvents: 'auto',
              height: '100%',
              ...(isContain
                ? { width: 'auto', maxWidth: '100%' }
                : { width: '100%' }),
              objectFit: item.image?.objectFit || 'contain',
            }}
            onLoad={isFirstSet ? onFirstSetImageDone : undefined}
            onError={isFirstSet ? onFirstSetImageDone : undefined}
          />
        )}
      </div>
    );
  };

  const renderCardWrapper = (item: MarqueeItem, key: string | number, isFirstSet?: boolean) => (
    <div
      key={key}
      style={{
        position: 'relative',
        flex: '0 0 auto',
        height: '100%',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    >
      {renderCard(item, `card-${key}`, isFirstSet)}
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

  if (autoplayEnabled && (content?.length ?? 0) > 0) {
    return (
      <div
        ref={wrapperRef}
        className={cn(`${P}-wrapper`, `${P}-marquee-wrapper`)}
        aria-label="Marquee"
        style={{
          overflow: 'hidden',
          width: '100%',
          ...(setWidth > 0 && trackHeight > 0 ? { height: trackHeight } : {}),
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        <div
          ref={trackRef}
          className={`${P}-marquee-track`}
          data-direction={direction}
          onMouseEnter={onTrackEnter}
          onMouseLeave={onTrackLeave}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            width: 'max-content',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            perspective: '1000px',
          }}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <div
              key={`set-${copyIndex}`}
              ref={copyIndex === 0 ? setRef : undefined}
              className={`${P}-marquee-set`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                flex: '0 0 auto',
                gap: scaled(gap),
                paddingRight: scaled(gap),
              }}
              aria-hidden={copyIndex > 0}
            >
              {content?.map((item: MarqueeItem, index: number) =>
                renderCardWrapper(item, `${copyIndex}-${index}`, copyIndex === 0)
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${P}-wrapper`}>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div
        style={{
          gap: scaled(gap),
          justifyContent: 'center',
          overflowX: 'auto',
          display: 'flex',
          flexDirection: 'row',
        }}
        aria-label="Marquee"
      >
        {content?.map((item: MarqueeItem, index: number) =>
          renderCardWrapper(item, index)
        )}
      </div>
    </div>
  );
};

export type MarqueeItem = {
  image?: {
    url?: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
};

export type MarqueeSettings = {
  speed: number;
  direction: 'left' | 'right';
  pauseOnHover: 'on' | 'off';
  gap: number;
  imageMaxWidth: number;
  imageMaxHeight: number;
};
