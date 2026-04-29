import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import classes from './Testimonials.module.scss';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: TestimonialsItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

type CaptionStyleFromFlatSettings = {
  fontSettings: {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
  };
  widthSettings: {
    width: number;
    sizing: 'auto' | 'manual';
  };
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right';
  wordSpacing: number;
  fontSizeLineHeight: {
    fontSize: number;
    lineHeight: number;
  };
  textAppearance: {
    textTransform: 'none' | 'uppercase' | 'lowercase';
    textDecoration: 'none' | 'underline';
    fontVariant: 'normal' | 'small-caps';
  };
  color: string;
};

const PX_PER_SEC_PER_SPEED_UNIT = 30;

const parseSpeed = (speed: unknown): number => {
  if (typeof speed === 'number') return speed;
  const n = parseFloat(String(speed ?? ''));
  return Number.isFinite(n) ? n : 0;
};

const resolveCaptionTextStyles = (caption: CaptionStyles): TextStyles => ({
  fontSettings: { ...caption.fontSettings },
  letterSpacing: caption.letterSpacing,
  wordSpacing: caption.wordSpacing,
  fontSize: caption.fontSizeLineHeight.fontSize,
  lineHeight: caption.fontSizeLineHeight.lineHeight,
  textAppearance: caption.textAppearance,
  color: caption.color,
});

export const Testimonials = ({ settings, content, isEditor, isPreviewMode }: TestimonialsProps) => {
  const { autoplay, align, speed, direction, pauseOnHover, gap, cardWidth, cardHeight, corners, stroke, strokeColor, bgColor, padding, logoMarginTop, logoWidth, textMinHeight, captionMarginTop } = settings;
  const isAutoplay = autoplay === 'on';
  const isAnimating = isAutoplay && !isPreviewMode;
  const pxPerSec = Math.max(0, parseSpeed(speed)) * PX_PER_SEC_PER_SPEED_UNIT;
  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [setWidth, setSetWidth] = useState(0);
  const progressRef = useRef(0);
  const hoveringRef = useRef(false);
  const animRef = useRef<Animation | null>(null);
  const lastDirectionRef = useRef(direction);
  const hoverPauseEnabled = isAnimating && pauseOnHover === 'on';

  const normalizedDirection = useMemo<'left' | 'right'>(() => {
    if (typeof direction === 'boolean') return direction ? 'right' : 'left';
    const d = String(direction ?? '').trim().toLowerCase();
    return d === 'right' ? 'right' : 'left';
  }, [direction]);

  const resolveCaptionStyle = (kind: 'text' | 'caption'): CaptionStyles | undefined => {
    const fromNested = (settings as any)?.styles?.[kind] as CaptionStyles | undefined;
    if (fromNested) return fromNested;

    const prefix = kind === 'text' ? 'text' : 'caption';
    const fontFamily = (settings as any)?.[`${prefix}FontFamily`];
    const fontSettings = (settings as any)?.[`${prefix}FontSettings`];
    const letterSpacing = (settings as any)?.[`${prefix}LetterSpacing`];
    const wordSpacing = (settings as any)?.[`${prefix}WordSpacing`];
    const textAlign = (settings as any)?.[`${prefix}TextAlign`];
    const textAppearance = (settings as any)?.[`${prefix}TextAppearance`];
    const color =
      (settings as any)?.[`${prefix}Color`] ??
      (kind === 'text' ? (settings as any)?.imageCaptionColor : undefined);
    const fontSize = (settings as any)?.[`${prefix}FontSize`];
    const lineHeight = (settings as any)?.[`${prefix}LineHeight`];

    const hasAnyFlat =
      typeof fontFamily === 'string' ||
      !!fontSettings ||
      typeof letterSpacing === 'number' ||
      typeof wordSpacing === 'number' ||
      typeof textAlign === 'string' ||
      !!textAppearance ||
      typeof color === 'string' ||
      typeof fontSize === 'number' ||
      typeof lineHeight === 'number';
    if (!hasAnyFlat) return undefined;

    const flat: CaptionStyleFromFlatSettings = {
      widthSettings: { width: 0.13, sizing: 'manual' },
      fontSettings: {
        fontFamily: typeof fontFamily === 'string' ? fontFamily : 'Arial',
        fontWeight: typeof fontSettings?.fontWeight === 'number' ? fontSettings.fontWeight : 400,
        fontStyle: typeof fontSettings?.fontStyle === 'string' ? fontSettings.fontStyle : 'normal',
      },
      letterSpacing: typeof letterSpacing === 'number' ? letterSpacing : 0,
      wordSpacing: typeof wordSpacing === 'number' ? wordSpacing : 0,
      textAlign: (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') ? textAlign : 'left',
      fontSizeLineHeight: {
        fontSize: typeof fontSize === 'number' ? fontSize : 0.01,
        lineHeight: typeof lineHeight === 'number' ? lineHeight : 0.01,
      },
      textAppearance: {
        textTransform: textAppearance?.textTransform ?? 'none',
        textDecoration: textAppearance?.textDecoration ?? 'none',
        fontVariant: textAppearance?.fontVariant ?? 'normal',
      },
      color: typeof color === 'string' ? color : '#000000',
    };

    return flat as CaptionStyles;
  };

  const textStyle = resolveCaptionStyle('text');
  const captionStyle = resolveCaptionStyle('caption');

  const copies = useMemo(() => {
    if (!isAutoplay || content?.length === 0) return 1;
    if (setWidth <= 0 || containerWidth <= 0) return 2;
    return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
  }, [isAutoplay, content?.length, setWidth, containerWidth]);

  useLayoutEffect(() => {
    if (!isAutoplay) return;
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    let raf = 0;
    const measure = () => {
      setContainerWidth(wrapper.getBoundingClientRect().width);
      setSetWidth(set.getBoundingClientRect().width);
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
  }, [isAutoplay, content?.length]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!isAutoplay || !track || !isAnimating) return;
    if (setWidth <= 0 || pxPerSec <= 0) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return;
    }
    if (lastDirectionRef.current !== direction) {
      progressRef.current = 1 - progressRef.current;
      lastDirectionRef.current = direction;
    }
    const duration = (setWidth / pxPerSec) * 1000;
    const from = normalizedDirection === 'left' ? -setWidth : 0;
    const to = normalizedDirection === 'left' ? 0 : -setWidth;
    const anim = track.animate(
      [{ transform: `translate3d(${from}px, 0, 0)` }, { transform: `translate3d(${to}px, 0, 0)` }],
      { duration, iterations: Infinity, easing: 'linear' }
    );
    anim.currentTime = progressRef.current * duration;
    if (hoveringRef.current) anim.pause();
    animRef.current = anim;

    return () => {
      const ct = typeof anim.currentTime === 'number' ? anim.currentTime : 0;
      progressRef.current = duration > 0 ? (ct / duration) % 1 : 0;
      anim.cancel();
      if (animRef.current === anim) animRef.current = null;
    };
  }, [isAutoplay, isAnimating, setWidth, pxPerSec, direction]);

  const onTrackEnter = () => {
    if (!hoverPauseEnabled) return;
    hoveringRef.current = true;
    animRef.current?.pause();
  };
  const onTrackLeave = () => {
    if (!hoverPauseEnabled) return;
    hoveringRef.current = false;
    animRef.current?.play();
  };

  const overlayAlignItems = useMemo(() => {
    switch (align) {
      case 'center':
        return 'center' as const;
      case 'end':
        return 'flex-end' as const;
      case 'start':
      default:
        return 'flex-start' as const;
    }
  }, [align]);

  const overlayTextAlign = useMemo(() => {
    switch (align) {
      case 'center':
        return 'center' as const;
      case 'end':
        return 'right' as const;
      case 'start':
      default:
        return 'left' as const;
    }
  }, [align]);

  const renderText = (
    style: CaptionStyles,
    content: any[],
    key: string,
    options?: {
      controlsName?: string;
      marginTop?: number;
      minHeight?: number;
    }
  ) => (
    <div
      key={key}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: overlayAlignItems,
        width: '100%',
      }}
    >
      {options?.marginTop ? (
        <div
          data-controls={options.controlsName}
          className={classes.control}
          style={{ width: '100%', height: scaled(options.marginTop) }}
        />
      ) : null}
      <div
        className={classes.caption}
        style={{
          ...textStylesToCss(resolveCaptionTextStyles(style), isEditor),
          textAlign: overlayTextAlign,
          pointerEvents: 'auto',
          ...(options?.minHeight ? { minHeight: scaled(options.minHeight) } : {}),
        }}
      >
        <RichTextRenderer content={content} />
      </div>
    </div>
  );

  const renderCard = (item: TestimonialsItem, key: string | number) => (
    <div
      key={key}
      style={{
        padding: `${scaled(padding.top)} ${scaled(padding.right)} ${scaled(padding.bottom)} ${scaled(padding.left)}`,
        width: scaled(cardWidth + stroke * 2),
        minHeight: scaled(cardHeight),
        height: '100%',
        borderRadius: scaled(corners),
        border: `${scaled(stroke)} solid ${strokeColor}`,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {item.image?.url && (
        <img
          className={classes.image}
          src={item.image.url}
          alt={item.image.name}
          style={{
            objectFit: item.image.objectFit || 'cover',
            borderRadius: scaled(corners),
            height: scaled(cardHeight),
          }}
        />
      )}
      <div
        className={classes.cover}
        style={{background: bgColor,height: '100%'}}
      />
      <div
        className={classes.elementsOverlay}
        style={{
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
          alignItems: overlayAlignItems,
          textAlign: overlayTextAlign,
        }}
      >
        {textStyle && renderText(textStyle, item.text, 'text', { minHeight: textMinHeight })}
        <div
          key="logo"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: overlayAlignItems,
            width: '100%',
          }}
        >
          <div
            data-controls="logoMarginTop"
            className={classes.control}
            style={{ width: '100%', height: scaled(logoMarginTop) }}
          />
          <div style={{ width: scaled(logoWidth) }}>
            <img
              src={item.logo?.url}
              alt={item.logo?.name}
              style={{ pointerEvents: 'auto', width: '100%', height: '100%', objectFit: item.logo?.objectFit || 'cover' }}
            />
          </div>
        </div>
        {captionStyle &&
          renderText(captionStyle, item.caption, 'caption', {
            controlsName: 'captionMarginTop',
            marginTop: captionMarginTop,
          })}
      </div>
    </div>
  );

  const renderCardWrapper = (item: TestimonialsItem, key: string | number, isLast: boolean) => (
    <div
      key={key}
      style={{
        position: 'relative',
        flex: '0 0 auto',
        height: '100%',
      }}
    >
      {renderCard(item, `card-${key}`)}
      {isEditor && !isLast && (
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

  if (isAutoplay && content?.length && content.length > 0) {
    return (
      <div ref={wrapperRef} className={cn(classes.wrapper, classes.marqueeWrapper)} aria-label="Testimonials">
        <div
          ref={trackRef}
          className={classes.marqueeTrack}
          onMouseEnter={onTrackEnter}
          onMouseLeave={onTrackLeave}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <div
              key={`set-${copyIndex}`}
              ref={copyIndex === 0 ? setRef : undefined}
              className={classes.marqueeSet}
              style={{ gap: scaled(gap), paddingRight: scaled(gap) }}
              aria-hidden={copyIndex > 0}
            >
              {content?.map((item: TestimonialsItem, index: number) =>
                renderCardWrapper(item, `${copyIndex}-${index}`, index === (content?.length ?? 0) - 1)
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: scaled(gap),
          justifyContent: 'center',
          overflowX: 'auto',
        }}
        aria-label="Testimonials"
      >
        {content?.map((item: TestimonialsItem, index: number) =>
          renderCardWrapper(item, index, index === (content?.length ?? 0) - 1)
        )}
      </div>
    </div>
  );
};

export type TestimonialsItem = {
  image?: {
    url?: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  logo?: {
    url?: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  text: any[];
  caption: any[];
};

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type TestimonialsSettings = {
  type: 'A' | 'B';
  autoplay: 'on' | 'off';
  speed: number;
  align: 'start' | 'center' | 'end';
  direction: 'left' | 'right';
  pauseOnHover: 'on' | 'off';
  gap: number;
  cardWidth: number;
  cardHeight: number;
  corners: number;
  stroke: number;
  strokeColor: string;
  bgColor: string;
  padding: Padding;
  logoMarginTop: number;
  logoWidth: number;
  textMinHeight: number;
  captionMarginTop: number;
  styles: TestimonialsStyles;
};

type CaptionStyles = {
  fontSettings: {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
  };
  widthSettings: {
    width: number;
    sizing: 'auto' | 'manual';
  };
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right';
  wordSpacing: number;
  fontSizeLineHeight: {
    fontSize: number;
    lineHeight: number;
  };
  textAppearance: {
    textTransform: 'none' | 'uppercase' | 'lowercase';
    textDecoration: 'none' | 'underline';
    fontVariant: 'normal' | 'small-caps';
  };
  color: string;
};

type TestimonialsStyles = {
  text: CaptionStyles;
  caption: CaptionStyles;
};
