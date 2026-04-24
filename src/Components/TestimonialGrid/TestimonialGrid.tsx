import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import classes from './Testimonials.module.scss';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: { items: TestimonialsItem[] };
  isEditor?: boolean;
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

export const Testimonials = ({ settings, content, isEditor }: TestimonialsProps) => {
  const items = content?.items ?? [];
  const { autoplay, speed, direction, pause, gap, cardWidth, cardHeight, corners, stroke, strokeColor, bgColor, padding, iconMarginTop, iconWidth, textMarginTop, textMinHeight, captionMarginTop } = settings;
  const isAutoplay = autoplay === 'on';
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
  const hoverPauseEnabled = isAutoplay && pause === 'hover';

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
      typeof fontFamily === "string" ||
      !!fontSettings ||
      typeof letterSpacing === "number" ||
      typeof wordSpacing === "number" ||
      typeof textAlign === "string" ||
      !!textAppearance ||
      typeof color === "string" ||
      typeof fontSize === "number" ||
      typeof lineHeight === "number";
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
    if (!isAutoplay || items.length === 0) return 1;
    if (setWidth <= 0 || containerWidth <= 0) return 2;
    return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
  }, [isAutoplay, items.length, setWidth, containerWidth]);

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
  }, [isAutoplay, items.length]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!isAutoplay || !track) return;
    if (setWidth <= 0 || pxPerSec <= 0) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return;
    }
    if (lastDirectionRef.current !== direction) {
      progressRef.current = 1 - progressRef.current;
      lastDirectionRef.current = direction;
    }
    const duration = (setWidth / pxPerSec) * 1000;
    const from = direction === 'right' ? -setWidth : 0;
    const to = direction === 'right' ? 0 : -setWidth;
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
  }, [isAutoplay, setWidth, pxPerSec, direction]);

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

  const renderText = (
    style: CaptionStyles,
    content: any[],
    dataStyles: string,
    dataControls: string,
    key: string,
    marginTop: number,
    minHeight?: number
  ) => (
    <div key={key}>
      <div data-controls={dataControls} className={classes.control} />
      <div
        data-styles={dataStyles}
        className={classes.caption}
        style={{
          ...textStylesToCss(resolveCaptionTextStyles(style), isEditor),
          textAlign: style.textAlign,
          pointerEvents: 'auto',
          marginTop: scaled(marginTop),
          ...(minHeight ? { minHeight: scaled(minHeight) } : {}),
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
        flex: '0 0 auto',
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
        style={{
          background: bgColor,
          borderRadius: scaled(corners),
          height: '100%',
        }}
      />
      <div
        className={classes.elementsOverlay}
        style={{ display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}
      >
        <div key="icon">
          <div
            data-controls="elements.icon.margin.top"
            className={classes.control}
            style={{ marginTop: scaled(iconMarginTop), width: scaled(iconWidth) }}
          >
            <img
              src={item.icon?.url}
              alt={item.icon?.name}
              style={{ pointerEvents: 'auto',width: '100%', height: '100%', objectFit: item.icon?.objectFit || 'cover' }}
            />
          </div>
        </div>
        {textStyle && renderText(textStyle, item.text, 'text', 'elements.text.margin.top', 'text', textMarginTop, textMinHeight)}
        {captionStyle && renderText(captionStyle, item.caption, 'caption', 'elements.caption.margin.top', 'caption', captionMarginTop)}
      </div>
    </div>
  );

  if (isAutoplay && items.length > 0) {
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
              {items.map((item, index) => renderCard(item, `${copyIndex}-${index}`))}
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
        {items.map((item, index) => renderCard(item, index))}
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
  icon?: {
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
  autoplay: 'on' | 'off';
  speed: number;
  direction: 'left' | 'right';
  pause: 'hover' | 'off';
  gap: number;
  cardWidth: number;
  cardHeight: number;
  corners: number;
  stroke: number;
  strokeColor: string;
  bgColor: string;
  padding: Padding;
  iconMarginTop: number;
  iconWidth: number;
  textMarginTop: number;
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
