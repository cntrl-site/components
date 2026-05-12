import { useLayoutEffect, useMemo, useRef, useState } from 'react';
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

.${P}-marquee-set {
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  align-items: center;
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

export const Marquee = ({ settings, content, isEditor, isPreviewMode }: MarqueeProps) => {
  const { prefix: P } = useScopedStyles();
  const { autoplay, speed, direction, pauseOnHover, gap, imageMaxWidth, imageMaxHeight } = settings;
  const autoplayEnabled = autoplay === 'on' && !isPreviewMode;
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
  const stableCandidateRef = useRef<number | null>(null);
  const setWidthRef = useRef(0);

  useLayoutEffect(() => {
    setWidthRef.current = setWidth;
  }, [setWidth]);

  const copies = useMemo(() => {
    if (!autoplayEnabled || content?.length === 0) return 1;
    if (setWidth <= 0 || containerWidth <= 0) return 2;
    return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
  }, [autoplayEnabled, content?.length, setWidth, containerWidth]);

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
      const isStableNow = typeof prevCandidate === 'number' && Math.abs(prevCandidate - nextRawSetWidth) <= 0.25;
      stableCandidateRef.current = nextRawSetWidth;
      const sw = setWidthRef.current;
      setContainerWidth((prev) =>
        prev > 0 && Math.abs(prev - nextContainerWidth) < 0.5 ? prev : nextContainerWidth
      );
      if (typeof nextRawSetWidth === 'number' && nextRawSetWidth > 0 && sw <= 0) {
        setSetWidth(nextRawSetWidth);
        return;
      }
      if (isStableNow && Math.abs(nextRawSetWidth - sw) > 0.5) {
        setSetWidth(nextRawSetWidth);
      } else if (!isStableNow && sw <= 0) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [autoplayEnabled]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!autoplayEnabled || !track || !isAnimating) return;
    const safeSetWidth = setWidth > 0 ? setWidth : 0;
    const durationMs = safeSetWidth > 0 && pxPerSec > 0 ? (safeSetWidth / pxPerSec) * 1000 : 0;
    const durationS = `${Math.max(0, durationMs) / 1000}s`;
    track.style.setProperty('--marquee-distance', `${safeSetWidth}px`);
    track.style.setProperty('--marquee-duration', durationS);
  }, [autoplayEnabled, isAnimating, pxPerSec, setWidth]);

  useLayoutEffect(() => {
    if (!autoplayEnabled) {
      setTrackHeight(0);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const next = track.getBoundingClientRect().height;
      const useH = next > 0 ? next : 0;
      setTrackHeight((prev) => (prev > 0 && Math.abs(prev - useH) < 0.5 ? prev : useH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => {
      ro.disconnect();
    };
  }, [autoplayEnabled, copies, content, isEditor, gap, imageMaxWidth, imageMaxHeight]);

  const onTrackEnter = () => {
    if (!hoverPauseEnabled) return;
    setIsHovering(true);
  };
  const onTrackLeave = () => {
    if (!hoverPauseEnabled) return;
    setIsHovering(false);
  };

  const renderCard = (item: MarqueeItem, key: string | number) => {
    const maxW = scaled(imageMaxWidth);
    const maxH = scaled(imageMaxHeight);
    const objectFit = item.image?.objectFit || 'contain';

    if (!item.image?.url) {
      return <div key={key} style={{ width: maxW, height: maxH, flexShrink: 0 }} />;
    }

    if (objectFit === 'cover') {
      return (
        <div key={key} style={{ width: maxW, height: maxH, flexShrink: 0, lineHeight: 0 }}>
          <img
            src={item.image.url}
            alt={item.image?.name ?? ''}
            style={{
              display: 'block',
              pointerEvents: 'auto',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      );
    }

    return (
      <div
        key={key}
        style={{
          display: 'flex',
          maxWidth: maxW,
          maxHeight: maxH,
          lineHeight: 0,
          flexShrink: 0,
        }}
      >
        <img
          src={item.image.url}
          alt={item.image?.name ?? ''}
          style={{
            display: 'block',
            pointerEvents: 'auto',
            maxWidth: maxW,
            maxHeight: maxH,
            width: 'auto',
            height: 'auto',
          }}
        />
      </div>
    );
  };

  const renderCardWrapper = (item: MarqueeItem, key: string | number) => (
    <div
      key={key}
      style={{
        position: 'relative',
        flex: '0 0 auto',
      }}
    >
      {renderCard(item, `card-${key}`)}
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
          ...(trackHeight > 0 ? { height: trackHeight } : {}),
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
            ...(hoverPauseEnabled
              ? ({ '--marquee-play-state': isHovering ? 'paused' : 'running' } as React.CSSProperties)
              : ({ '--marquee-play-state': 'running' } as React.CSSProperties)),
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
                renderCardWrapper(item, `${copyIndex}-${index}`)
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
          alignItems: 'center',
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
  autoplay: 'on' | 'off';
  speed: number;
  direction: 'left' | 'right';
  pauseOnHover: 'on' | 'off';
  gap: number;
  imageMaxWidth: number;
  imageMaxHeight: number;
};
