import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classes from './Testimonials.module.scss';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';

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

export const TestimonialSingle = ({ settings, content, isEditor }: TestimonialsProps) => {
  const items = content || [];
  const { autoplay, speed, align, imageWidth, imageHeight, controlsWidth, controlsColor, controlsHoverColor, textMinHeight, captionMinHeight } = settings;
  const isAutoplay = (() => {
    const v = autoplay as unknown;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      return s === 'on' || s === 'true';
    }
    return false;
  })();

  const cardWidth = settings.width ?? 0;
  const imageMarginTop = settings.imageMarginTop ?? 0;
  const captionMarginTop = settings.captionMarginTop ?? 0;
  const textMarginTop = settings.textMarginTop ?? 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);
  const fadeTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    setActiveIndex(0);
    setPrevIndex(null);
    setIsFading(false);
  }, [items.length]);

  const currentItem = items[activeIndex];
  const previousItem = prevIndex === null ? null : items[prevIndex];

  const resolveCaptionStyle = (
    kind: 'text' | 'caption'
  ): CaptionStyles | undefined => {
    const fromNested = (settings as any)?.styles?.[kind] as CaptionStyles | undefined;
    if (fromNested) return fromNested;

    const prefix = kind === 'text' ? 'text' : 'caption';
    const fontFamily = (settings as any)?.[`${prefix}FontFamily`];
    const fontSettings = (settings as any)?.[`${prefix}FontSettings`];
    const letterSpacing = (settings as any)?.[`${prefix}LetterSpacing`];
    const wordSpacing = (settings as any)?.[`${prefix}WordSpacing`];
    const textAlign = (settings as any)?.[`${prefix}TextAlign`];
    const textAppearance = (settings as any)?.[`${prefix}TextAppearance`];
    const color = (settings as any)?.[`${prefix}Color`];
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

  if (!currentItem) return <></>;

  const scaled = (v: number) => scalingValue(v, isEditor ?? false);

  const canSwitch = items.length > 1;
  const commitTransition = useCallback((currentIndex: number, nextIndex: number) => {
    if (!canSwitch) return currentIndex;
    if (nextIndex === currentIndex) return currentIndex;
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    setPrevIndex(currentIndex);
    setIsFading(true);
    fadeTimerRef.current = window.setTimeout(() => {
      setPrevIndex(null);
      setIsFading(false);
      fadeTimerRef.current = null;
    }, 300);
    return nextIndex;
  }, [canSwitch]);

  const transitionToIndex = useCallback((nextIndex: number) => {
    setActiveIndex((currentIndex) => commitTransition(currentIndex, nextIndex));
  }, [commitTransition]);

  const goPrev = useCallback(() => {
    if (!canSwitch) return;
    setActiveIndex((currentIndex) => commitTransition(currentIndex, (currentIndex - 1 + items.length) % items.length));
  }, [canSwitch, commitTransition, items.length]);

  const goNext = useCallback(() => {
    if (!canSwitch) return;
    setActiveIndex((currentIndex) => commitTransition(currentIndex, (currentIndex + 1) % items.length));
  }, [canSwitch, commitTransition, items.length]);

  useEffect(() => {
    if (!isAutoplay || !canSwitch) return;
    const speedSeconds = typeof speed === 'number' && Number.isFinite(speed) ? speed : 0;
    const intervalMs = Math.max(0.1, speedSeconds) * 1000;
    const id = window.setInterval(() => {
      setActiveIndex((currentIndex) => commitTransition(currentIndex, (currentIndex + 1) % items.length));
    }, intervalMs);
    return () => {
      window.clearInterval(id);
    };
  }, [isAutoplay, canSwitch, commitTransition, items.length, speed]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const controls: TestimonialsSettings['controls'] = settings.controls ?? {
    isActive: 'visible',
    arrowsImgUrl: null,
    align: 'bottom-center',
    gap: 0.01,
    scale: 100,
    color: '#FFFFFF',
    hover: '#EABC01',
  };

  const controlsMode = (controls as unknown as { mode?: string }).mode;
  const isControlsVisible =
    controls.isActive === 'visible' ||
    controlsMode === 'On';
  const showControls = isControlsVisible && canSwitch;
  const controlsInsetX = useMemo(() => scaled(0.01), [isEditor]);
  const controlsIconSize = useMemo(
    () => scalingValue(controlsWidth ?? 0.02, isEditor ?? false),
    [controlsWidth, isEditor]
  );

  const renderItemContent = useCallback((item: TestimonialsItem) => {
    return (
      <>
        {['text', 'image', 'caption'].map((key: string) => {
          if (key === 'image') {
            return (
              <div
                key="image"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: overlayAlignItems,
                  width: '100%',
                }}
              >
                <div
                  data-controls="imageMarginTop"
                  className={classes.control}
                  style={{ height: scalingValue(imageMarginTop, isEditor ?? false), width: '100%' }}
                />
                <img
                  src={item.image?.url}
                  alt={item.image?.name}
                  className={classes.icon}
                  style={{
                    pointerEvents: 'auto',
                    objectFit: item.image?.objectFit || 'cover',
                    width: scalingValue(imageWidth ?? 0, isEditor ?? false),
                    height: scalingValue(imageHeight ?? 0, isEditor ?? false),
                  }}
                />
              </div>
            );
          }
          if (key === 'text' && textStyle) {
            const { fontSettings, letterSpacing, wordSpacing, fontSizeLineHeight, textAppearance, color } = textStyle;
            return (
              <div
                key="text"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: overlayAlignItems,
                  width: '100%',
                }}
              >
                <div
                  data-controls="textMarginTop"
                  className={classes.control}
                  style={{ height: scalingValue(textMarginTop, isEditor ?? false), width: '100%' }}
                />
                <div
                  style={{
                    fontFamily: fontSettings.fontFamily,
                    fontWeight: fontSettings.fontWeight,
                    fontStyle: fontSettings.fontStyle,
                    minHeight: scalingValue(textMinHeight ?? 0, isEditor ?? false),
                    letterSpacing: scalingValue(letterSpacing, isEditor),
                    wordSpacing: scalingValue(wordSpacing, isEditor),
                    textAlign: overlayTextAlign,
                    fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
                    lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
                    textTransform: textAppearance.textTransform ?? 'none',
                    textDecoration: textAppearance.textDecoration ?? 'none',
                    fontVariant: textAppearance.fontVariant ?? 'normal',
                    color,
                    pointerEvents: 'auto',
                  }}
                >
                  <RichTextRenderer content={item.text ?? []} />
                </div>
              </div>
            );
          }
          if (key === 'caption' && captionStyle) {
            const { fontSettings, letterSpacing, wordSpacing, fontSizeLineHeight, textAppearance, color } = captionStyle;
            return (
              <div
                key="caption"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: overlayAlignItems,
                  width: '100%',
                }}
              >
                <div
                  data-controls="captionMarginTop"
                  className={classes.control}
                  style={{ height: scalingValue(captionMarginTop, isEditor ?? false), width: '100%' }}
                />
                <div
                  style={{
                    fontFamily: fontSettings.fontFamily,
                    fontWeight: fontSettings.fontWeight,
                    fontStyle: fontSettings.fontStyle,
                    minHeight: scalingValue(captionMinHeight ?? 0, isEditor ?? false),
                    letterSpacing: scalingValue(letterSpacing, isEditor),
                    wordSpacing: scalingValue(wordSpacing, isEditor),
                    textAlign: overlayTextAlign,
                    fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
                    lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
                    textTransform: textAppearance.textTransform ?? 'none',
                    textDecoration: textAppearance.textDecoration ?? 'none',
                    fontVariant: textAppearance.fontVariant ?? 'normal',
                    color,
                    pointerEvents: 'auto',
                  }}
                >
                  <RichTextRenderer content={item.caption} />
                </div>
              </div>
            );
          }
          return null;
        })}
      </>
    );
  }, [
    captionMarginTop,
    captionStyle,
    imageMarginTop,
    imageWidth,
    imageHeight,
    isEditor,
    overlayAlignItems,
    overlayTextAlign,
    textMinHeight,
    textStyle,
  ]);
  
  return (
    <>
      <div
        className={classes.container}
        style={{
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          className={cn(classes.elementsOverlay, classes.wrapper, !isAutoplay && classes.wrapperAutoplayOff)}
          style={{
            width: scalingValue(cardWidth, isEditor ?? false),
            display: 'flex',
            flexDirection: 'column',
            alignItems: overlayAlignItems,
            inset: 0,
            pointerEvents: 'none',
            height: '100%',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          <div className={classes.fadeStack}>
            {previousItem && isFading && (
              <div className={cn(classes.fadeItemPrev, classes.fadeOut)}>
                {renderItemContent(previousItem)}
              </div>
            )}
            <div className={cn(classes.fadeItemCurrent, isFading ? classes.fadeIn : undefined)}>
              {renderItemContent(currentItem)}
            </div>
          </div>
        </div>
        {showControls && (
          <div
            className={classes.controls}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: controlsInsetX,
              paddingRight: controlsInsetX,
            }}
          >
            <div
              className={classes.arrow}
              style={{
                pointerEvents: 'auto',
                width: controlsIconSize,
                height: controlsIconSize,
                ['--arrow-hover-color' as string]: controlsHoverColor,
              }}
            >
              <button
                type="button"
                className={classes.arrowInner}
                onClick={goPrev}
                aria-label="Previous testimonial"
                style={{ pointerEvents: 'auto' }}
              >
                {controls.arrowsImgUrl ? (
                  <SvgImage
                    url={controls.arrowsImgUrl}
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={cn(classes.arrowImg, classes.mirror)}
                  />
                ) : (
                  <ArrowIcon color={controlsColor} className={cn(classes.arrowIcon, classes.arrowImg, classes.mirror)} />
                )}
              </button>
            </div>
            <div
              className={cn(classes.arrow, classes.nextArrow)}
              style={{
                pointerEvents: 'auto',
                width: controlsIconSize,
                height: controlsIconSize,
                ['--arrow-hover-color' as string]: controlsHoverColor,
              }}
            >
              <button
                type="button"
                className={classes.arrowInner}
                onClick={goNext}
                aria-label="Next testimonial"
                style={{ pointerEvents: 'auto' }}
              >
                {controls.arrowsImgUrl ? (
                  <SvgImage
                    url={controls.arrowsImgUrl}
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={classes.arrowImg}
                  />
                ) : (
                  <ArrowIcon color={controlsColor} className={cn(classes.arrowIcon, classes.arrowImg)} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const ArrowIcon = ({ color, className }: { color: string; className: string }) => {
  return (
    <svg viewBox="0 0 10 18" className={className}>
      <g stroke="none" strokeWidth="1" fillRule="evenodd">
        <path
          d="M-3.70710678,4.29289322 C-3.34662282,3.93240926 -2.77939176,3.90467972 -2.38710056,4.20970461 L-2.29289322,4.29289322 L5,11.585 L12.2928932,4.29289322 C12.6533772,3.93240926 13.2206082,3.90467972 13.6128994,4.20970461 L13.7071068,4.29289322 C14.0675907,4.65337718 14.0953203,5.22060824 13.7902954,5.61289944 L13.7071068,5.70710678 L5.70710678,13.7071068 C5.34662282,14.0675907 4.77939176,14.0953203 4.38710056,13.7902954 L4.29289322,13.7071068 L-3.70710678,5.70710678 C-4.09763107,5.31658249 -4.09763107,4.68341751 -3.70710678,4.29289322 Z"
          fill={color}
          transform="translate(5, 9) rotate(-90) translate(-5, -9)"
        />
      </g>
    </svg>
  );
};

export type TestimonialsItem = {
  image?: {
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
  delay: number;
  align: 'start' | 'center' | 'end';
  width: number;
  imageMarginTop?: number;
  imageWidth?: number;
  imageHeight?: number;
  textMinHeight?: number;
  textMarginTop?: number;
  captionMinHeight?: number;
  captionMarginTop?: number;
  styles: TestimonialsStyles;
  controlsColor: string;
  controlsHoverColor: string;
  controlsWidth?: number;
  controls: {
    isActive: 'visible' | 'hidden';
    arrowsImgUrl: string | null;

  };
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

type ElementOrderKey = 'text' | 'image' | 'caption';
