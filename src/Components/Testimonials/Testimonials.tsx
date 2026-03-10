import { Splide, SplideSlide } from "@splidejs/react-splide";
import '@splidejs/react-splide/css/core';
import classes from './Testimonials.module.scss';
import { FC, useRef, useEffect } from "react";
import cn from 'classnames';
import { SvgImage } from "../helpers/SvgImage/SvgImage";
import { scalingValue } from "../utils/scalingValue";
import { RichTextRenderer } from "../helpers/RichTextRenderer/RichTextRenderer";
import { getAlignPosition } from "./getAlignPosition";

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
  const { general, card } = settings;
  const { width } = card.dimensions;
  const isAutoplay = general.autoplay === 'on';
  const inView = !isAutoplay ? (general.inView ?? content.length) : 1;
  const perMove = general.move === 'one' ? 1 : inView;
  const marqueePerMove = isAutoplay ? 1 : perMove;
  const speedMs = isAutoplay ? (settings.general.speed ? parseSpeedToMs(settings.general.speed) : 0) : 5000;
  
  const shadowHorizontalExtent = settings.card.dropShadow.active === 'on'
    ? 2 * (settings.card.dropShadow.blur + settings.card.dropShadow.spread) + settings.card.dropShadow.right
    : 0;

  const wrapperWidth = !isAutoplay 
    ? scalingValue(
        (width * inView) +
          (settings.card.gap * (inView - 1)) +
          (card.borders.width * 2 * inView) +
          shadowHorizontalExtent,
        isEditor ?? false
      )
    : undefined;
  const splideKey = `${general.autoplay}-${inView}`;
  const hasDropShadow = settings.card.dropShadow.active === 'on';
  const shadowPadding = hasDropShadow
    ? scalingValue(
        Math.max(
          settings.card.dropShadow.blur + settings.card.dropShadow.spread,
          settings.card.dropShadow.right,
          settings.card.dropShadow.down
        ),
        isEditor ?? false
      )
    : 0;
  const cardHeight = scalingValue(card.dimensions.height, isEditor ?? false);

  useEffect(() => {
    if (sliderRef.current?.splide) {
      const splide = sliderRef.current.splide;
      splide.options = {
        ...splide.options,
        autoplay: isAutoplay,
        perMove: marqueePerMove,
        interval: isAutoplay ? (speedMs || 5000) : 0,
        rewind: !isAutoplay,
        inView: !isAutoplay ? content.length : undefined,
      };
      splide.refresh();
    }
  }, [general.autoplay, isAutoplay, marqueePerMove, speedMs]);

  return (
    <>
      <div className={cn(classes.container, settings.card.hasGradientCorners === 'gradient' && classes.gradientCorners)} style={{ justifyContent: 'center' }}>
        <div 
          className={cn(classes.wrapper, !isAutoplay && classes.wrapperAutoplayOff, hasDropShadow && classes.wrapperDropShadow)}
          style={{
            ...(wrapperWidth ? { width: wrapperWidth } : {}),
            // ...(hasDropShadow && shadowPadding ? { ['--shadow-padding' as string]: typeof shadowPadding === 'number' ? `${shadowPadding}px` : shadowPadding } : {}),
          }}
        >
          <Splide 
            key={splideKey}
            ref={sliderRef}
            options={{
              type: 'loop',
              fixedWidth: scalingValue(width + card.borders.width * 2, isEditor ?? false),
              height: '100%',
              ...(settings.general.autoplay === 'off' && { 
                // width: wrapperWidth,
                height: '100%'
              }),
              arrows: false,
              perMove: isAutoplay ? marqueePerMove : perMove,
              gap: scalingValue(settings.card.gap, isEditor ?? false),
              padding: 0,
              drag: false,
              autoplay: isAutoplay,
              speed: speedMs,
              interval: speedMs,
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
                  style={{
                    padding: `${scalingValue(settings.card.padding.top, isEditor ?? false)} ${scalingValue(settings.card.padding.right, isEditor ?? false)} ${scalingValue(settings.card.padding.bottom, isEditor ?? false)} ${scalingValue(settings.card.padding.left, isEditor ?? false)}`,
                    width: scalingValue(width + card.borders.width * 2, isEditor ?? false),
                    minHeight: cardHeight,
                    height: cardHeight,
                    borderRadius: scalingValue(settings.card.corner, isEditor ?? false),
                    border: `${scalingValue(settings.card.borders.width, isEditor ?? false)} solid ${settings.card.borders.color}`,
                    boxSizing: 'border-box',
                    position: 'relative',
                    boxShadow: settings.card.dropShadow.active === 'on' ? `${scalingValue(settings.card.dropShadow.right, isEditor ?? false)} ${scalingValue(settings.card.dropShadow.down, isEditor ?? false)} ${scalingValue(settings.card.dropShadow.blur, isEditor ?? false)} ${scalingValue(settings.card.dropShadow.spread, isEditor ?? false)} ${settings.card.dropShadow.color}` : 'none',
                    ...(settings.card.dropShadow.active === 'on' && {
                      marginTop: scalingValue(settings.card.dropShadow.blur + settings.card.dropShadow.spread, isEditor ?? false),
                      marginBottom: scalingValue(settings.card.dropShadow.down + settings.card.dropShadow.blur + settings.card.dropShadow.spread, isEditor ?? false),
                      marginLeft: scalingValue(settings.card.dropShadow.blur + settings.card.dropShadow.spread, isEditor ?? false),
                      marginRight: scalingValue(settings.card.dropShadow.right + settings.card.dropShadow.blur + settings.card.dropShadow.spread, isEditor ?? false),
                    }),
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
                      height: cardHeight,
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
                            <img
                              key="icon"
                              data-controls="elements.icon.margin.top"
                              src={item.icon?.url}
                              alt={item.icon?.name}
                              className={classes.icon}
                              style={{
                                marginTop: scalingValue(settings.elements.icon.margin.top, isEditor ?? false),
                                transform: `scale(${settings.elements.icon.scale / 100})`,
                                order: orderIndex,
                                zIndex: orderIndex,
                                pointerEvents: 'auto'
                              }}
                            />
                          );
                        }
                        if (key === 'text' && styles.imageCaption) {
                          const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = styles.imageCaption;
                          return (
                            <div
                              key="text"
                              data-styles="imageCaption"
                              data-controls="elements.text.margin.top"
                              className={classes.caption}
                              style={{
                                marginTop: scalingValue(settings.elements.text.margin.top, isEditor ?? false),
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
                                order: orderIndex,
                                zIndex: orderIndex,
                                pointerEvents: 'auto'
                              }}
                            >
                              <RichTextRenderer content={item.imageCaption} />
                            </div>
                          );
                        }
                        if (key === 'caption' && styles.caption) {
                          const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = styles.caption;
                          return (
                            <div
                              key="caption"
                              data-styles="caption"
                              data-controls="elements.caption.margin.top"
                              className={classes.caption}
                              style={{
                                marginTop: scalingValue(settings.elements.caption.margin.top, isEditor ?? false),
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
                                order: orderIndex,
                                zIndex: orderIndex,
                                pointerEvents: 'auto'
                              }}
                            >
                              <RichTextRenderer content={item.caption} />
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
      </div>
      {settings.general.controls?.isActive && (
        <>
          <div 
            className={classes.arrow}
            style={{color: settings.general.controls?.color,['--arrow-hover-color' as string]: settings.general.controls?.hover}}
          >
            <button
              className={classes.arrowInner}
              style={{transform: `translate(${scalingValue(settings.general.controls?.offset.x, isEditor ?? false)}, ${scalingValue(settings.general.controls?.offset.y, isEditor ?? false)}) scale(${settings.general.controls?.scale / 100})`}}
              onClick={() => sliderRef.current?.go(isAutoplay ? '+1' : `+${perMove}`)}
              aria-label='Previous'
              >
                {settings.general.controls?.arrowsImgUrl && (
                  <SvgImage
                    url={settings.general.controls?.arrowsImgUrl}
                    fill={settings.general.controls?.color}
                    hoverFill={settings.general.controls?.hover}
                    className={cn(classes.arrowImg, classes.mirror)}
                  />
                )}
                {!settings.general.controls?.arrowsImgUrl && (
                  <ArrowIcon color={settings.general.controls?.color} className={cn(classes.arrowIcon, classes.arrowImg, classes.mirror)} />
                )}
              </button>
          </div>
          <div
            className={cn(classes.arrow, classes.nextArrow)}
            style={{color: settings.general.controls?.color,['--arrow-hover-color' as string]: settings.general.controls?.hover}}
          >              
            <button
              className={classes.arrowInner}
              style={{ transform: `translate(${scalingValue(settings.general.controls?.offset.x * -1, isEditor ?? false)}, ${scalingValue(settings.general.controls?.offset.y, isEditor ?? false)}) scale(${settings.general.controls?.scale / 100})`}}
              onClick={() => sliderRef.current?.go(isAutoplay ? '-1' : `-${perMove}`)}
              aria-label='Next'
            >
              {settings.general.controls?.arrowsImgUrl && (
                <SvgImage
                  url={settings.general.controls?.arrowsImgUrl}
                  fill={settings.general.controls?.color}
                  hoverFill={settings.general.controls?.hover}
                  className={classes.arrowImg}
                />
              )}
              {!settings.general.controls?.arrowsImgUrl && (
                <ArrowIcon color={settings.general.controls?.color} className={cn(classes.arrowIcon, classes.arrowImg)} />
              )}
            </button>
          </div>
        </>
      )}
    </>
  );
};

function ArrowIcon({ color, className }: { color: string, className: string }) {
  return (
    <svg viewBox="0 0 10 18" className={className}>
      <g id="Symbols" stroke="none" strokeWidth="1" fillRule="evenodd">
          <path d="M-3.70710678,4.29289322 C-3.34662282,3.93240926 -2.77939176,3.90467972 -2.38710056,4.20970461 L-2.29289322,4.29289322 L5,11.585 L12.2928932,4.29289322 C12.6533772,3.93240926 13.2206082,3.90467972 13.6128994,4.20970461 L13.7071068,4.29289322 C14.0675907,4.65337718 14.0953203,5.22060824 13.7902954,5.61289944 L13.7071068,5.70710678 L5.70710678,13.7071068 C5.34662282,14.0675907 4.77939176,14.0953203 4.38710056,13.7902954 L4.29289322,13.7071068 L-3.70710678,5.70710678 C-4.09763107,5.31658249 -4.09763107,4.68341751 -3.70710678,4.29289322 Z" id="Shape-Copy" fill={color} transform="translate(5, 9) rotate(-90) translate(-5, -9)"></path>
      </g>
    </svg>
  );
}

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
  inView?: number;
  alignment?: 'left' | 'center' | 'right';
  move: 'one' | 'view';
  speed: string;
  direction: 'left' | 'right';
  pause: 'hover' | 'click' | 'off';
  controls?: TestimonialsControls;
};

type TestimonialsControls = {
  arrowsImgUrl: string | null;
  isActive: boolean;
  color: string;
  hover: string;
  offset: Offset;
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
  hasGradientCorners: 'gradient' | 'none';
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
