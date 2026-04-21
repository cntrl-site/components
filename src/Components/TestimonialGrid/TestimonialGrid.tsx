import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
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
  const { autoplay, speed, direction, pause, gap, cardWidth, cardHeight, corners, stroke, strokeColor, bgColor, padding, iconMarginTop } = settings;
  const isAutoplay = autoplay === 'on';
  const speedMs = speed ? parseSpeedToMs(speed) : 0;
  const resolveCaptionTextStyles = (caption: CaptionStyles): TextStyles => ({
    fontSettings: {
      fontFamily: caption.fontSettings.fontFamily,
      fontWeight: caption.fontSettings.fontWeight,
      fontStyle: caption.fontSettings.fontStyle,
    },
    letterSpacing: caption.letterSpacing,
    wordSpacing: caption.wordSpacing,
    fontSize: caption.fontSizeLineHeight.fontSize,
    lineHeight: caption.fontSizeLineHeight.lineHeight,
    textAppearance: caption.textAppearance,
    color: caption.color,
  });

  const wrapperWidth = scalingValue(
      (cardWidth * items.length) + 
      (settings.gap * (items.length)) +
      (stroke * 2 * items.length),
      isEditor ?? false);
  const splideKey = `${autoplay}-${items.length}`;
  const scaledCardHeight = scalingValue(cardHeight, isEditor ?? false);

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
  }, [settings.gap, isEditor]);
  
  return (
    <>
      <div style={{ height: '100%'}}></div>
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
            ...(wrapperWidth ? { width: wrapperWidth } : {}), 
            ['--card-gap' as string]: isAutoplay ? 0 : `${scalingValue(settings.gap, isEditor ?? false)}`,
          }}
          ref={wrapperRef}
        >
          <Splide 
            key={splideKey}
            ref={sliderRef}
            options={{
              type: isAutoplay ? 'loop' : 'slide',
              fixedWidth: scalingValue(cardWidth + stroke * 2, isEditor ?? false),
              height: 'auto',
              arrows: false,
              perMove: 1,
              perPage: visibleSlides,
              gap: isAutoplay ? scalingValue(settings.gap, isEditor ?? false) : 0,
              padding: 0,
              drag: false,
              autoplay: isAutoplay,
              speed: speedMs,
              interval: speedMs || 5000,
              rewind: !isAutoplay,
              easing: 'linear',
              direction: direction === 'left' ? 'ltr' : 'rtl',
              pagination: false,
              pauseOnHover: pause === 'hover',
            }}>
            {items.map((item, index) => {
              return (
              <SplideSlide key={index}>
                <div
                  ref={slideRef}
                  style={{
                    padding: `${scalingValue(padding.top, isEditor ?? false)} ${scalingValue(padding.right, isEditor ?? false)} ${scalingValue(padding.bottom, isEditor ?? false)} ${scalingValue(padding.left, isEditor ?? false)}`,
                    width: scalingValue(cardWidth + stroke * 2, isEditor ?? false),
                    minHeight: scaledCardHeight,
                    height: '100%',
                    borderRadius: scalingValue(corners, isEditor ?? false),
                    border: `${scalingValue(stroke, isEditor ?? false)} solid ${strokeColor}`,
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
                        borderRadius: `${scalingValue(corners, isEditor ?? false)}`,
                        height: scaledCardHeight,
                      }}
                    />
                  )}
                  <div
                    className={classes.cover}
                    style={{
                      background: bgColor,
                      borderRadius: `${scalingValue(corners, isEditor ?? false)}`,
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
                    <>
                      <div key="icon">
                        <div
                          data-controls="elements.icon.margin.top"
                          className={classes.control}
                          style={{ height: scalingValue(iconMarginTop, isEditor ?? false)}}
                        />
                        <div style={{ width: '100%'}}>
                          <img
                            src={item.icon?.url}
                            alt={item.icon?.name}
                            className={classes.icon}
                            style={{
                              // transform: `scale(${settings.elements.icon.scale / 100})`,
                              pointerEvents: 'auto'
                            }}
                          />
                        </div>
                      </div>
                      {(() => {
                        const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                          settings.styles.imageCaption;
                        const imageCaptionTypographyCss = textStylesToCss(
                          resolveCaptionTextStyles(settings.styles.imageCaption),
                          isEditor
                        );
                        return (
                          <div key="text">
                            <div
                              data-controls="elements.text.margin.top"
                              className={classes.control}
                              // style={{ height: scalingValue(settings.elements.text.margin.top, isEditor ?? false)}}
                            />
                            <div
                              data-styles="imageCaption"
                              className={classes.caption}
                              style={{
                                ...imageCaptionTypographyCss,
                                textAlign,
                                pointerEvents: 'auto'
                              }}
                            >
                              <RichTextRenderer content={item.imageCaption} />
                            </div>
                          </div>
                        );
                      })()}
                      {(() => {
                              const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                            settings.styles.caption;
                          const captionTypographyCss = textStylesToCss(
                            resolveCaptionTextStyles(settings.styles.caption),
                            isEditor
                          );
                          return (
                            <div key="caption">
                              <div
                              data-controls="elements.caption.margin.top" className={classes.control}
                              // style={{ height: scalingValue(settings.elements.caption.margin.top, isEditor ?? false)}}
                              />
                              <div
                                data-styles="caption"
                                className={classes.caption}
                                style={{
                                  ...captionTypographyCss,
                                  textAlign,
                                  pointerEvents: 'auto'
                                }}
                              >
                                <RichTextRenderer content={item.caption} />
                              </div>
                            </div>
                          );
                        })()}
                      </>
                  </div>
                </div>
              </SplideSlide>
              );
            })} 
          </Splide>
        </div>
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

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type TestimonialsSettings = {
  autoplay: 'on' | 'off';
  speed: string;
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
  iconHeight: number;
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
  imageCaption: CaptionStyles;
  caption: CaptionStyles;
};
