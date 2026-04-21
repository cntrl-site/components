import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import classes from './Testimonials.module.scss';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { Arrows } from '../TestimonialGrid/Arrows';

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: { items: TestimonialsItem[] };
  isEditor?: boolean;
} & CommonComponentProps;

const parseSpeedToMs = (speed: string): number => {
  if (!speed) return 0;
  const match = speed.match(/^(\d+)s$/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 1000;
};

export const Testimonials = ({ settings, content, isEditor }: TestimonialsProps) => {
  const items = content?.items ?? [];
  const sliderRef = useRef<Splide | null>(null);
  const [visibleSlides, setVisibleSlides] = useState(1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const { autoplay, speed, direction, pause, cardWidth, cardHeight, corners, stroke, strokeColor, padding, controls } = settings;
  const isAutoplay = autoplay === 'on';
  const speedMs = speed ? parseSpeedToMs(speed) : 0;
  
  const isRtl = settings.direction === 'right';

  useEffect(() => {
    if (sliderRef.current?.splide) {
      const splide = sliderRef.current.splide;
      splide.options = {
        ...splide.options,
        autoplay: isAutoplay,
        perMove: 1,
        perPage: isAutoplay ? (items.length || 3) : visibleSlides,
        interval: isAutoplay ? (speedMs || 5000) : 0,
        rewind: !isAutoplay,
      };
      splide.refresh();
    }
  }, [autoplay, speedMs, items.length]);
  
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
  }, [isEditor]);
  
  return (
    <>
      <div
        style={{ 
          height: '100%',
          transform: stroke > 0 ? `translateY(-${scalingValue(stroke, isEditor ?? false)})`
            : `translateY(${scalingValue(stroke, isEditor ?? false)})`,
        }}
        ></div>
      <div
        className={classes.container}
        style={{
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          className={cn(classes.wrapper, !isAutoplay && classes.wrapperAutoplayOff)}
          style={{
            width: scalingValue(cardWidth + stroke * 2, isEditor ?? false),
          }}
          ref={wrapperRef}
        >
          <Splide 
            ref={sliderRef}
            options={{
              type: isAutoplay || settings.controls?.isActive === 'visible' ? 'loop' : 'slide',
              fixedWidth: scalingValue(cardWidth + settings.stroke * 2, isEditor ?? false),
              height: 'auto',
              arrows: false,
              perMove: 1,
              perPage: visibleSlides,
              padding: 0,
              drag: false,
              autoplay: isAutoplay,
              speed: speedMs,
              interval: speedMs || 5000,
              rewind: !isAutoplay,
              easing: 'linear',
              direction: settings.direction === 'left' ? 'ltr' : 'rtl',
              pagination: false,
              pauseOnHover: settings.pause === 'hover',
            }}>
            {items.map((item, index) => {
              return (
              <SplideSlide key={index}>
                <div
                  ref={slideRef}
                  style={{
                    padding: `${scalingValue(settings.padding.top, isEditor ?? false)} ${scalingValue(settings.padding.right, isEditor ?? false)} ${scalingValue(settings.padding.bottom, isEditor ?? false)} ${scalingValue(settings.padding.left, isEditor ?? false)}`,
                    width: scalingValue(cardWidth + settings.stroke * 2, isEditor ?? false),
                    minHeight: cardHeight,
                    height: '100%',
                    borderRadius: scalingValue(settings.corners, isEditor ?? false),
                    border: `${scalingValue(settings.stroke, isEditor ?? false)} solid ${settings.strokeColor}`,
                    boxSizing: 'border-box',
                    position: 'relative',
                    }}
                  >
                  {item.image?.url && (
                    <img
                      className={classes.image}
                      src={item.image?.url}
                      alt={item.image?.name}
                      style={{
                        objectFit: item.image?.objectFit || 'cover',
                        borderRadius: `${scalingValue(settings.corners, isEditor ?? false)}`,
                        height: cardHeight,
                      }}
                    />
                  )}
                  <div
                    className={classes.cover}
                    style={{
                      borderRadius: `${scalingValue(settings.corners, isEditor ?? false)}`,
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
                        if (key === 'text' && settings.styles.imageCaption) {
                          const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                            settings.styles.imageCaption;
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
                        if (key === 'caption' && settings.styles.caption) {
                          const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                            settings.styles.caption;
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
        {settings.controls?.isActive === 'visible' && settings.autoplay === 'off' && (
          <Arrows
            isRtl={isRtl}
            step={1}
            controls={settings.controls}
            isEditor={isEditor ?? false}
            sliderRef={sliderRef}
          />
        )}
      </div>
    </>
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
  imageCaption: any[];
  caption: any[];
};

export type Alignment = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

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
  cardWidth: number;
  cardHeight: number;
  corners: number;
  stroke: number;
  strokeColor: string;
  padding: Padding;
  elements: TestimonialsElements;
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
  imageCaption: CaptionStyles;
  caption: CaptionStyles;
};
