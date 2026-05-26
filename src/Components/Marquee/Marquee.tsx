import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

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
  flex-wrap: nowrap;
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
const SET_WIDTH_STREAK_MIN = 12;
const SET_WIDTH_RAF_FALLBACK = 180;

type MarqueeItemCardProps = {
  item: MarqueeItem;
  prefix: string;
  imageFit: 'cover' | 'contain';
  imageMaxWidth: number;
  imageMaxHeight: number;
  textMarginTop?: number;
  textStyle: TextStyles;
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
  textMarginTop,
  textStyle,
  imageHoverClass,
  isEditor,
  isFirstSet,
  scaled,
  onFirstSetImageDone,
}: MarqueeItemCardProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const hasText = (item.text ?? []).some((block) =>
    (block.children ?? []).some(
      (child: { text?: string }) => typeof child.text === 'string' && child.text.trim().length > 0,
    ),
  );
  const shouldMatchTextToImage = imageFit === 'contain' && Boolean(item.image?.url) && hasText;

  const measureImage = useCallback(() => {
    if (!shouldMatchTextToImage) {
      setImageWidth(null);
      return;
    }
    const el = imageRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) setImageWidth(w);
  }, [shouldMatchTextToImage]);

  useLayoutEffect(() => {
    measureImage();
  }, [ measureImage, item.image?.url, imageFit, imageMaxWidth, imageMaxHeight, isEditor ]);

  useLayoutEffect(() => {
    if (!shouldMatchTextToImage) return;
    const el = imageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureImage);
    ro.observe(el);
    return () => ro.disconnect();
  }, [shouldMatchTextToImage, measureImage, item.image?.url]);

  const handleImageDone = () => {
    measureImage();
    if (isFirstSet) onFirstSetImageDone?.();
  };

  const imageNode =
    item.image?.url &&
    (
      <img
        ref={imageRef}
        src={item.image.url}
        alt={item.image?.name ?? ''}
        style={{
          pointerEvents: 'auto',
          objectFit: imageFit,
          objectPosition: 'top',
          ...(imageFit === 'contain'
            ? { width: 'auto', maxWidth: '100%', maxHeight: '100%', height: 'auto' }
            : { width: '100%', height: '100%' }),
        }}
        onLoad={isFirstSet ? handleImageDone : measureImage}
        onError={isFirstSet ? handleImageDone : measureImage}
      />
    );

  const textNode = hasText && (
    <>
      <div
        {...(isEditor
          ? { 'data-controls': 'textMarginTop', 'data-controls-axis': 'y' as const }
          : {})}
        className={isEditor ? `${P}-control` : undefined}
        style={{
          width: '100%',
          height: scaled(textMarginTop ?? 0),
          flexShrink: 0,
        }}
      />
      <div
        style={{
          ...textStylesToCss(textStyle, isEditor),
          width: imageWidth != null ? `${imageWidth}px` : '100%',
          flexShrink: 0,
          pointerEvents: 'auto',
        }}
      >
        <RichTextRenderer content={item.text!} />
      </div>
    </>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        ...(imageFit === 'contain' ? { maxWidth: scaled(imageMaxWidth) } : { width: scaled(imageMaxWidth) }),
      }}
    >
      <div
        className={imageHoverClass}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
          height: scaled(imageMaxHeight),
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {imageNode &&
          (item.link ? (
            <a
              href={item.link}
              target='_blank'
              rel='noopener noreferrer'
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'flex-start',
                ...(imageFit === 'cover'
                  ? { width: '100%', height: '100%' }
                  : { height: 'auto', width: 'auto', maxWidth: '100%', maxHeight: '100%' }),
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {imageNode}
            </a>
          ) : (
            imageNode
          ))}
      </div>
      {textNode}
    </div>
  );
};

const resolveTextStyle = (settings: MarqueeSettings): TextStyles => ({
  fontSettings: {
    fontFamily: settings.textFontFamily ?? 'Arial',
    fontWeight: settings.textFontSettings?.fontWeight ?? 400,
    fontStyle: settings.textFontSettings?.fontStyle ?? 'normal',
  },
  textAppearance: {
    textTransform: settings.textTextAppearance?.textTransform ?? 'none',
    textDecoration: settings.textTextAppearance?.textDecoration ?? 'none',
    fontVariant: settings.textTextAppearance?.fontVariant ?? 'normal',
  },
  fontSize: settings.textFontSize ?? 0.01,
  lineHeight: settings.textLineHeight ?? 0.01,
  letterSpacing: settings.textLetterSpacing ?? 0,
  wordSpacing: settings.textWordSpacing ?? 0,
  color: settings.textColor ?? '#000000',
});

export const Marquee = ({ settings, content, isEditor, isPreviewMode }: MarqueeProps) => {
  const { prefix: P } = useScopedStyles();
  const { speed, direction, pauseOnHover, gap, imageMaxWidth, imageMaxHeight, textMarginTop, imageFit } = settings;
  const imageHoverClass = settings.hoverEffect === 'off' ? undefined : `${P}-image-hover-${settings.hoverEffect}`;
  const textStyle = useMemo(() => resolveTextStyle(settings), [settings]);
  const autoplayEnabled = !isPreviewMode;
  const pxPerSec = Math.max(0, speed) * PX_PER_SEC_PER_SPEED_UNIT;
  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [setWidth, setSetWidth] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);
  const hoverPauseEnabled = autoplayEnabled && pauseOnHover === 'on';
  const [isHovering, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const widthStreakRef = useRef<{ w: number; n: number }>({ w: -1, n: 0 });
  const settleFramesRef = useRef(0);
  const loadedFirstSetImagesRef = useRef(0);
  const scheduleRemeasureRef = useRef<(() => void) | null>(null);
  const contentImageUrlsKey = useMemo(() => (content ?? []).map((i) => i.image?.url ?? '').join('\0'),[content]);
  const firstSetImageUrlCount = useMemo(() => (content ?? []).filter((i) => Boolean(i.image?.url)).length, [content]);
  const copies = useMemo(() => {
    if (!autoplayEnabled || content?.length === 0) return 1;
    if (setWidth <= 0 || containerWidth <= 0) return 2;
    return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
  }, [autoplayEnabled, content?.length, setWidth, containerWidth, imageFit]);

  useLayoutEffect(() => {
    loadedFirstSetImagesRef.current = 0;
  }, [contentImageUrlsKey]);

  useLayoutEffect(() => {
    if (!autoplayEnabled) return;
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    const rafState = { id: 0 };
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
      const needsWidthCommit =
        nextRawSetWidth > 0 && (setWidth <= 0 || nextRawSetWidth !== setWidth);
      if (needsWidthCommit) {
        settleFramesRef.current += 1;
        const canCommit =
          imagesOk &&
          (streakOk || settleFramesRef.current > SET_WIDTH_RAF_FALLBACK);
        if (canCommit) {
          settleFramesRef.current = 0;
          setSetWidth(nextRawSetWidth);
          return;
        }
        cancelAnimationFrame(rafState.id);
        rafState.id = requestAnimationFrame(measure);
        return;
      }
      settleFramesRef.current = 0;
    };
    const schedule = () => {
      cancelAnimationFrame(rafState.id);
      rafState.id = requestAnimationFrame(measure);
    };
    scheduleRemeasureRef.current = schedule;
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      scheduleRemeasureRef.current = null;
      cancelAnimationFrame(rafState.id);
      ro.disconnect();
    };
  }, [autoplayEnabled, firstSetImageUrlCount, setWidth, imageFit]);

  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useLayoutEffect(() => {
    if (!autoplayEnabled) return;
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

    const animState = { raf: 0, lastTime: 0 };
    const tick = (now: number) => {
      if (animState.lastTime === 0) animState.lastTime = now;
      const dt = Math.min(100, now - animState.lastTime) / 1000;
      animState.lastTime = now;
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
      animState.raf = requestAnimationFrame(tick);
    };

    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    animState.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animState.raf);
      track.style.transform = '';
    };
  }, [autoplayEnabled, pxPerSec, direction, setWidth, hoverPauseEnabled]);

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
  }, [autoplayEnabled, copies, content, isEditor, gap, imageMaxWidth, imageMaxHeight, setWidth, imageFit, textStyle, textMarginTop]);

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

  const renderCardWrapper = (item: MarqueeItem, key: string | number, isFirstSet?: boolean) => (
    <div key={key} className={`${P}-marquee-card`}>
      <MarqueeItemCard
        item={item}
        prefix={P}
        imageFit={imageFit}
        imageMaxWidth={imageMaxWidth}
        imageMaxHeight={imageMaxHeight}
        textMarginTop={textMarginTop}
        textStyle={textStyle}
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
        key="marquee-static"
        className={cn(`${P}-marquee-row`, `${P}-marquee-static`)}
        style={{ gap: scaled(gap), transform: 'none' }}
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
  };
  text?: any[];
  link?: string;
};

export type MarqueeSettings = {
  speed: number;
  direction: 'left' | 'right';
  pauseOnHover: 'on' | 'off';
  hoverEffect: 'off' | 'brightness' | 'grayscale' | 'saturate';
  gap: number;
  imageMaxWidth: number;
  imageMaxHeight: number;
  imageFit: 'cover' | 'contain';
  textFontFamily?: string;
  textFontSettings?: { fontWeight?: number; fontStyle?: string };
  textFontSize?: number;
  textLineHeight?: number;
  textLetterSpacing?: number;
  textWordSpacing?: number;
  textTextAppearance?: {
    textTransform?: string;
    textDecoration?: string;
    fontVariant?: string;
  };
  textColor?: string;
  textMarginTop?: number;
};

type MarqueeProps = {
  settings: MarqueeSettings;
  content?: MarqueeItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;
