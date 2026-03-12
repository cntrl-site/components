import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import classes from './Testimonials.module.scss';
import { FC, useRef, useEffect, useState } from "react";
import cn from 'classnames';
import { scalingValue } from "../utils/scalingValue";
import { RichTextRenderer } from "../helpers/RichTextRenderer/RichTextRenderer";
import { Arrows } from "./Arrows";

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content: TestimonialsImage[];
  styles: TestimonialsStyles;
  isEditor?: boolean;
};

const parseSpeedToMs = (speed: string): number => {
  if (!speed) return 0;
  const match = speed.match(/^(\d+)s$/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 1000;
};

export const Testimonials: FC<TestimonialsProps> = ({ settings, content, styles, isEditor }) => {
  const sliderRef = useRef<Splide | null>(null);
  const [visibleSlides, setVisibleSlides] = useState(1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const { general, card } = settings;
  const { width } = card.dimensions;
  const isAutoplay = general.autoplay === 'on';
  const speedMs = settings.general.speed ? parseSpeedToMs(settings.general.speed) : 0;
  
  const shadowHorizontalExtent = settings.card.dropShadow.active === 'on'
  ? settings.card.dropShadow.blur + settings.card.dropShadow.spread + Math.abs(settings.card.dropShadow.right)
  : 0;

  const wrapperWidth = scalingValue(
      (width * content.length) + 
      (settings.card.gap * (content.length)) +
      (card.borders.width * 2 * content.length) +
      shadowHorizontalExtent,
      isEditor ?? false);
  const splideKey = `${general.autoplay}-${content.length}`;
  const hasDropShadow = settings.card.dropShadow.active === 'on';
  const cardHeight = scalingValue(card.dimensions.height, isEditor ?? false);
  const isRtl = settings.general.direction === 'right';
  const step = general.move === 'one' ? 1 : visibleSlides;

  useEffect(() => {
    if (sliderRef.current?.splide) {
      const splide = sliderRef.current.splide;
      splide.options = {
        ...splide.options,
        autoplay: isAutoplay,
        perMove: 1,
        perPage: isAutoplay ? (content.length || 3) : visibleSlides,
        interval: isAutoplay ? (speedMs || 5000) : 0,
        rewind: !isAutoplay,
      };
      splide.refresh();
    }
  }, [general.autoplay, speedMs, content.length]);
  
  useEffect(() => {
    const updateVisibleSlides = () => {
      if (!wrapperRef.current) return;
      const trackWidth = wrapperRef.current.clientWidth;
      const slideWidth = slideRef.current?.clientWidth;
  
      if (!slideWidth || !trackWidth) {
        setVisibleSlides(1);
        return;
      }
      const perView = Math.max(1, Math.floor(trackWidth / slideWidth));
      setVisibleSlides(perView);
    };
    updateVisibleSlides();
  }, [settings.card.gap, isEditor, settings.general.move]);
  
  return (
    <>
      <div
        style={{ 
          height: `calc(100% + ${scalingValue(Math.abs(card.dropShadow.down) + card.dropShadow.blur + card.dropShadow.spread, isEditor ?? false)} )`,
          transform: card.dropShadow.down > 0 ? `translateY(-${scalingValue(card.dropShadow.down, isEditor ?? false)})`
            : `translateY(${scalingValue(card.dropShadow.down, isEditor ?? false)})`,
            ['--gradient-color' as string]: settings.general.gradientCorners.color,
        }}
        className={settings.general.gradientCorners.active === 'gradient' ? classes.gradientCorners : undefined}
        ></div>
      <div
        className={classes.container}
        style={{
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          className={cn(classes.wrapper, !isAutoplay && classes.wrapperAutoplayOff, hasDropShadow && classes.wrapperDropShadow)}
          style={{
            ...(wrapperWidth ? { width: wrapperWidth } : {}), 
            ['--card-gap' as string]: isAutoplay ? 0 : `${scalingValue(settings.card.gap, isEditor ?? false)}`,
          }}
          ref={wrapperRef}
        >
          <Splide 
            key={splideKey}
            ref={sliderRef}
            options={{
              type: isAutoplay || general.controls?.isActive === 'visible' ? 'loop' : 'slide',
              fixedWidth: scalingValue(width + card.borders.width * 2, isEditor ?? false),
              height: 'auto',
              arrows: false,
              perMove: 1,
              perPage: visibleSlides,
              gap: isAutoplay ? scalingValue(settings.card.gap, isEditor ?? false) : 0,
              padding: 0,
              drag: false,
              autoplay: isAutoplay,
              speed: speedMs,
              interval: speedMs || 5000,
              rewind: !isAutoplay,
              easing: 'linear',
              direction: settings.general.direction === 'left' ? 'ltr' : 'rtl',
              pagination: false,
              pauseOnHover: settings.general.pause === 'hover',
              pauseOnFocus: settings.general.pause === 'click',
            }}>
            {content.map((item, index) => {
              return (
              <SplideSlide key={index}>
                <div
                  ref={slideRef}
                  style={{
                    padding: `${scalingValue(settings.card.padding.top, isEditor ?? false)} ${scalingValue(settings.card.padding.right, isEditor ?? false)} ${scalingValue(settings.card.padding.bottom, isEditor ?? false)} ${scalingValue(settings.card.padding.left, isEditor ?? false)}`,
                    width: scalingValue(width + card.borders.width * 2, isEditor ?? false),
                    minHeight: cardHeight,
                    height: '100%',
                    borderRadius: scalingValue(settings.card.corner, isEditor ?? false),
                    border: `${scalingValue(settings.card.borders.width, isEditor ?? false)} solid ${settings.card.borders.color}`,
                    boxSizing: 'border-box',
                    position: 'relative',
                    boxShadow: settings.card.dropShadow.active === 'on' ? `${scalingValue(settings.card.dropShadow.right, isEditor ?? false)} ${scalingValue(settings.card.dropShadow.down, isEditor ?? false)} ${scalingValue(settings.card.dropShadow.blur, isEditor ?? false)} ${scalingValue(settings.card.dropShadow.spread, isEditor ?? false)} ${settings.card.dropShadow.color}` : 'none',
                    }}
                  >
                  {item.image?.url && (
                    <img
                      className={classes.image}
                      src={item.image?.url}
                      alt={item.image?.name}
                      style={{
                        objectFit: item.image?.objectFit || 'cover',
                        borderRadius: `${scalingValue(settings.card.corner, isEditor ?? false)}`,
                        height: cardHeight,
                      }}
                    />
                  )}
                  <div
                    className={classes.cover}
                    style={{
                      background: settings.card.bgColor,
                      borderRadius: `${scalingValue(settings.card.corner, isEditor ?? false)}`,
                      height: '100%',
                    }}
                  />
                  <div
                    className={classes.elementsOverlay}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      inset: 0,
                      pointerEvents: 'none'
                    }}
                  >
                    {(() => {
                      const order = settings.elements.elements.order ??
                        (Array.isArray(settings.elements.elements.order)
                          ? settings.elements.elements.order
                          : ['text', 'icon', 'caption']);
                      const elementsWithOrder = order.map((key: ElementOrderKey, index: number) => ({ key, order: index }));
                      return elementsWithOrder.map(({ key, order: orderIndex }: { key: ElementOrderKey, order: number }) => {
                        if (key === 'icon') {
                          return (
                            <div key="icon" style={{ order: orderIndex, zIndex: orderIndex }}>
                              <div data-controls="elements.icon.margin.top" className={classes.control} style={{ height: scalingValue(settings.elements.icon.margin.top, isEditor ?? false)}} />
                              <div
                                style={{
                                  width: '100%',
                                  textAlign: settings.elements.icon.align
                                }}
                              >
                                <img
                                  src={item.icon?.url}
                                  alt={item.icon?.name}
                                  className={classes.icon}
                                  style={{
                                    transform: `scale(${settings.elements.icon.scale / 100})`,
                                    pointerEvents: 'auto'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                        if (key === 'text' && styles.imageCaption) {
                          const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = styles.imageCaption;
                          return (
                            <div key="text" style={{ order: orderIndex, zIndex: orderIndex }}>
                              <div data-controls="elements.text.margin.top" className={classes.control} style={{ height: scalingValue(settings.elements.text.margin.top, isEditor ?? false)}} />
                              <div
                                data-styles="imageCaption"
                                className={classes.caption}
                                style={{
                                  fontFamily: fontSettings.fontFamily,
                                  fontWeight: fontSettings.fontWeight,
                                  fontStyle: fontSettings.fontStyle,
                                  minHeight: scalingValue(settings.elements.text.minHeight, isEditor ?? false),
                                  letterSpacing: scalingValue(letterSpacing, isEditor),
                                  wordSpacing: scalingValue(wordSpacing, isEditor),
                                  textAlign,
                                  fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
                                  lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
                                  textTransform: textAppearance.textTransform ?? 'none',
                                  textDecoration: textAppearance.textDecoration ?? 'none',
                                  fontVariant: textAppearance.fontVariant ?? 'normal',
                                  color,
                                  pointerEvents: 'auto'
                                }}
                              >
                                <RichTextRenderer content={item.imageCaption} />
                              </div>
                            </div>
                          );
                        }
                        if (key === 'caption' && styles.caption) {
                          const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = styles.caption;
                          return (
                            <div key="caption" style={{ order: orderIndex, zIndex: orderIndex }}>
                              <div data-controls="elements.caption.margin.top" className={classes.control} style={{ height: scalingValue(settings.elements.caption.margin.top, isEditor ?? false)}}/>
                              <div
                                data-styles="caption"
                                className={classes.caption}
                                style={{
                                  fontFamily: fontSettings.fontFamily,
                                  fontWeight: fontSettings.fontWeight,
                                  fontStyle: fontSettings.fontStyle,
                                  minHeight: scalingValue(settings.elements.caption.minHeight, isEditor ?? false),
                                  letterSpacing: scalingValue(letterSpacing, isEditor),
                                  wordSpacing: scalingValue(wordSpacing, isEditor),
                                  textAlign,
                                  fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
                                  lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
                                  textTransform: textAppearance.textTransform ?? 'none',
                                  textDecoration: textAppearance.textDecoration ?? 'none',
                                  fontVariant: textAppearance.fontVariant ?? 'normal',
                                  color,
                                  pointerEvents: 'auto'
                                }}
                              >
                                <RichTextRenderer content={item.caption} />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      });
                    })()}
                  </div>
                </div>
              </SplideSlide>
              );
            })} 
          </Splide>
        </div>
        {settings.general.controls?.isActive === 'visible' && general.autoplay === 'off' && (
          <Arrows
            isRtl={isRtl}
            step={step}
            controls={settings.general.controls}
            isEditor={isEditor ?? false}
            sliderRef={sliderRef}
          />
        )}
      </div>
    </>
  );
};

type TestimonialsImage = {
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
  imageCaption: any[];
  caption: any[];
};

export type Alignment = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type Offset = {
  x: number;
  y: number;
};

type TestimonialsGeneral = {
  autoplay: 'on' | 'off';
  move: 'one' | 'view';
  speed: string;
  direction: 'left' | 'right';
  pause: 'hover' | 'click' | 'off';
  controls?: TestimonialsControls;
  gradientCorners: {
    active: 'gradient' | 'none';
    color: string;
  };
};

export type TestimonialsControls = {
  arrowsImgUrl: string | null;
  isActive: 'visible' | 'hidden';
  color: string;
  hover: string;
  align: Alignment;
  gap: number;
  // offset: Offset;
  scale: number;
};

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type TestimonialsCard = {
  dimensions: {
    width: number;
    height: number;
  };
  gap: number;
  corner: number;
  borders: {
    width: number;
    color: string;
  };
  bgColor: string;
  padding: Padding;
  dropShadow: {
    active: 'on' | 'off';
    right: number;
    down: number;
    spread: number;
    blur: number;
    color: string;
  },
};

type ElementOrderKey = 'text' | 'icon' | 'caption';

type TestimonialsElements = {
  elements: {
    order: ElementOrderKey[];
    active: ElementOrderKey;
  };
  text: {
    margin: {
      top: number;
    };
    minHeight: number;
  };
  icon: {
    margin: {
      top: number;
    };
    align: 'left' | 'center' | 'right';
    scale: number;
  };
  caption: {
    margin: {
      top: number;
    };
    minHeight: number;
  };
};

type TestimonialsSettings = {
  general: TestimonialsGeneral;
  card: TestimonialsCard;
  elements: TestimonialsElements;
};

type TestimonialsStyles = {
  imageCaption: CaptionStyles;
  caption: CaptionStyles;
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
