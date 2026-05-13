import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from 'react';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';

const LAYOUT_EPSILON = 0.5;

const getCSS = (P: string): string => `
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

type MarqueeMeasuredImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  index: number;
  onMeasured: (index: number, width: number) => void;
};

const MarqueeMeasuredImg = ({ index, onMeasured, ...imgProps }: MarqueeMeasuredImgProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { src } = imgProps;

  useLayoutEffect(() => {
    const node = imgRef.current;
    if (!node) return;

    const measure = () => {
      const w = node.getBoundingClientRect().width;
      if (w <= 0) return;
      onMeasured(index, w);
    };

    let canceled = false;
    const onLoad = () => {
      if (!canceled) measure();
    };

    if (node.complete) {
      measure();
    } else {
      node.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      canceled = true;
      node.removeEventListener('load', onLoad);
    };
  }, [index, onMeasured, src]);

  return <img ref={imgRef} {...imgProps} />;
};

type MarqueeProps = {
  settings: MarqueeSettings;
  content?: MarqueeItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

const PX_PER_SEC_PER_SPEED_UNIT = 30;

export const Marquee = ({ settings, content, isEditor, isPreviewMode }: MarqueeProps) => {
  const { prefix: P } = useScopedStyles();
  const { speed, direction, pauseOnHover, gap, imageMaxWidth, imageMaxHeight } = settings;
  const isAnimating = !isPreviewMode;
  const pxPerSec = Math.max(0, speed) * PX_PER_SEC_PER_SPEED_UNIT;
  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [setWidth, setSetWidth] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  const [itemWidths, setItemWidths] = useState<Record<number, number>>({});
  const hoverPauseEnabled = isAnimating && pauseOnHover === 'on';
  const [isHovering, setIsHovering] = useState(false);

  const contentMeasureKey = useMemo(
    () => (content ?? []).map((c) => `${c.image?.url ?? ''}|${c.image?.objectFit ?? ''}`).join(';'),
    [content],
  );

  const prevMeasuredLayoutFingerprintRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    const fingerprint = `${contentMeasureKey}|${gap}|${imageMaxWidth}|${imageMaxHeight}|${isEditor}`;
    const prev = prevMeasuredLayoutFingerprintRef.current;
    prevMeasuredLayoutFingerprintRef.current = fingerprint;
    if (prev === null) return;
    if (prev !== fingerprint) {
      setItemWidths({});
      setSetWidth(0);
    }
  }, [contentMeasureKey, gap, imageMaxWidth, imageMaxHeight, isEditor]);

  const onItemMeasured = useCallback((index: number, width: number) => {
    setItemWidths((prev) => {
      if (prev[index] === width) return prev;
      return { ...prev, [index]: width };
    });
  }, []);

  const allItemWidthsKnown = useMemo(() => {
    const len = content?.length ?? 0;
    if (len === 0) return false;
    for (let i = 0; i < len; i++) {
      const w = itemWidths[i];
      if (typeof w !== 'number' || w <= 0) return false;
    }
    return true;
  }, [content?.length, itemWidths]);

  const applySetWidthFromDom = useCallback(() => {
    const set = setRef.current;
    if (!set) return;
    const next = set.getBoundingClientRect().width;
    if (next <= 0) return;
    setSetWidth((prev) => (Math.abs(prev - next) < LAYOUT_EPSILON ? prev : next));
  }, []);

  useLayoutEffect(() => {
    if (!isAnimating || !allItemWidthsKnown) return;
    const set = setRef.current;
    if (!set) return;
    applySetWidthFromDom();
    const ro = new ResizeObserver(() => {
      applySetWidthFromDom();
    });
    ro.observe(set);
    return () => {
      ro.disconnect();
    };
  }, [allItemWidthsKnown, isAnimating, applySetWidthFromDom, gap, imageMaxWidth, imageMaxHeight, isEditor]);

  const copies = useMemo(() => {
    if (content?.length === 0) return 1;
    if (setWidth <= 0 || containerWidth <= 0) return 2;
    return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
  }, [content?.length, setWidth, containerWidth]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const measure = () => {
      const nextContainerWidth = wrapper.getBoundingClientRect().width;
      setContainerWidth((prev) =>
        prev > 0 && Math.abs(prev - nextContainerWidth) < LAYOUT_EPSILON ? prev : nextContainerWidth
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    return () => {
      ro.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || !isAnimating) return;
    const safeSetWidth = setWidth > 0 ? setWidth : 0;
    const durationMs = safeSetWidth > 0 && pxPerSec > 0 ? (safeSetWidth / pxPerSec) * 1000 : 0;
    const durationS = `${Math.max(0, durationMs) / 1000}s`;
    track.style.setProperty('--marquee-distance', `${safeSetWidth}px`);
    track.style.setProperty('--marquee-duration', durationS);
  }, [isAnimating, pxPerSec, setWidth]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const next = track.getBoundingClientRect().height;
      const useH = next > 0 ? next : 0;
      setTrackHeight((prev) => (prev > 0 && Math.abs(prev - useH) < LAYOUT_EPSILON ? prev : useH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => {
      ro.disconnect();
    };
  }, [copies, content, isEditor, gap, imageMaxWidth, imageMaxHeight]);

  const onTrackEnter = useCallback(() => {
    if (!hoverPauseEnabled) return;
    setIsHovering(true);
  }, [hoverPauseEnabled]);

  const onTrackLeave = useCallback(() => {
    if (!hoverPauseEnabled) return;
    setIsHovering(false);
  }, [hoverPauseEnabled]);

  const marqueePlayStateStyle = useMemo((): CSSProperties => {
    if (!hoverPauseEnabled) {
      return { '--marquee-play-state': 'running' } as CSSProperties;
    }
    return {
      '--marquee-play-state': isHovering ? 'paused' : 'running',
    } as CSSProperties;
  }, [hoverPauseEnabled, isHovering]);

  const renderCard = (item: MarqueeItem, key: string | number, index: number) => {
    const maxW = scaled(imageMaxWidth);
    const maxH = scaled(imageMaxHeight);
    const objectFit = item.image?.objectFit || 'contain';

    if (!item.image?.url) {
      return (
        <div
          key={key}
          ref={
            isAnimating
              ? (node) => {
                  if (!node) return;
                  const w = node.getBoundingClientRect().width;
                  if (w > 0) onItemMeasured(index, w);
                }
              : undefined
          }
          style={{ width: maxW, height: maxH, flexShrink: 0 }}
        />
      );
    }

    if (objectFit === 'cover') {
      return (
        <div key={key} style={{ width: maxW, height: maxH, flexShrink: 0, lineHeight: 0 }}>
          {isAnimating ? (
            <MarqueeMeasuredImg
              index={index}
              onMeasured={onItemMeasured}
              src={item.image.url}
              alt={item.image?.name ?? ''}
              width={maxW}
              height={maxH}
              style={{
                display: 'block',
                pointerEvents: 'auto',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ) : (
            <img
              src={item.image.url}
              alt={item.image?.name ?? ''}
              width={maxW}
              height={maxH}
              style={{
                display: 'block',
                pointerEvents: 'auto',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          )}
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
        {isAnimating ? (
          <MarqueeMeasuredImg
            index={index}
            onMeasured={onItemMeasured}
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
        ) : (
          <img src={item.image.url} alt={item.image?.name ?? ''} style={{
            display: 'block',
            pointerEvents: 'auto',
            maxWidth: maxW,
            maxHeight: maxH,
            width: 'auto',
            height: 'auto',
          }} />
        )}
      </div>
    );
  };

  const renderCardWrapper = (item: MarqueeItem, key: string | number, index: number) => (
    <div
      key={key}
      style={{
        position: 'relative',
        flex: '0 0 auto',
      }}
    >
      {renderCard(item, `card-${key}`, index)}
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

  const trackMotionStyle = useMemo(
    (): CSSProperties => ({
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      width: 'max-content',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
      WebkitTransform: 'translateZ(0)',
      ...marqueePlayStateStyle,
    }),
    [marqueePlayStateStyle],
  );

  if (isAnimating && (content?.length ?? 0) > 0) {
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
          style={trackMotionStyle}
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
                renderCardWrapper(item, `${copyIndex}-${index}`, index)
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
        {content?.map((item: MarqueeItem, index: number) => renderCardWrapper(item, index, index))}
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
