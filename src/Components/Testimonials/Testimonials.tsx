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
  const match = speed.match(/^(\d+)(ms|s)$/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  return unit === 's' ? value * 1000 : value;
};

export const Testimonials: FC<TestimonialsProps> = ({ settings, content, styles, isEditor }) => {
  const sliderRef = useRef<Splide | null>(null);
  const { general, card, controls } = settings;
  const { width, height } = card.dimensions;
  const perMove = settings.general.move === 'one' ? 1 : (settings.general.inView || 1);
  const perPage = settings.general.inView || 3;
  const isAutoplay = settings.general.autoplay === 'on';
  const marqueePerMove = isAutoplay ? 1 : perMove;
  const speedMs = isAutoplay ? (settings.general.speed ? parseSpeedToMs(settings.general.speed) : 0) : 500;
  
  const wrapperWidth = !isAutoplay 
    ? scalingValue((width * perPage) + (settings.card.gap * (perPage - 1)) + (card.borders.width * 2 * perPage), isEditor ?? false)
    : undefined;
  const splideKey = `${general.autoplay}-${general.inView}`;

  useEffect(() => {
    if (sliderRef.current?.splide) {
      const splide = sliderRef.current.splide;
      splide.options = {
        ...splide.options,
        autoplay: isAutoplay,
        perPage: perPage,
        perMove: marqueePerMove,
        interval: isAutoplay ? (speedMs || 500) : 0,
        rewind: !isAutoplay,
      };
      splide.refresh();
    }
  }, [general.autoplay, general.inView, isAutoplay, perPage, marqueePerMove, speedMs]);

  return (
    <>
      <div className={classes.container} style={{ justifyContent: settings.general.alignment }}>
        <div 
          className={`${classes.wrapper}`}
          style={wrapperWidth ? { width: wrapperWidth } : undefined}
        >
          <Splide 
            key={splideKey}
            ref={sliderRef}
            options={{
              type: 'loop',
              fixedWidth: scalingValue(width + card.borders.width * 2, isEditor ?? false),
              ...(settings.general.autoplay === 'off' && { 
                perPage,
                width: wrapperWidth 
              }),
              arrows: false,
              perMove: isAutoplay ? marqueePerMove : perMove,
              gap: scalingValue(settings.card.gap, isEditor ?? false),
              padding: 0,
              autoplay: isAutoplay,
              speed: speedMs, // Transition duration (default to 500ms if not set)
              interval: speedMs, // Match speed for continuous marquee flow
              rewind: !isAutoplay, // Disable rewind for smooth marquee, enable for manual mode
              easing: 'linear',
              direction: settings.general.direction === 'left' ? 'ltr' : 'rtl',
              pagination: false,
              pauseOnHover: settings.general.pause === 'hover',
              pauseOnFocus: settings.general.pause === 'click',
            }}>
            {content.map((item, index) => (
              <SplideSlide key={index}>
                <div
                  style={{
                    width: scalingValue(width, isEditor ?? false),
                    height: scalingValue(height, isEditor ?? false),
                    borderRadius: scalingValue(settings.card.corner, isEditor ?? false),
                    border: `${scalingValue(settings.card.borders.width, isEditor ?? false)} solid ${settings.card.borders.color}`,
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                    }}
                  >
                  <img
                    className={classes.image}
                    src={item.image?.url}
                    alt={item.image?.name}
                    style={{ objectFit: item.image?.objectFit || 'cover' }}
                  />
                  <div
                    className={classes.cover}
                    style={{ background: settings.card.bgColor, borderRadius: `${scalingValue(settings.card.corner, isEditor ?? false)}`}}
                  />
                  <div>
                    <img
                      src={item.icon?.url}
                      alt={item.icon?.name}
                      className={classes.icon}
                      style={{...getAlignPosition(settings.elements.icon.alignment, settings.elements.icon.offset, isEditor), transform: `scale(${settings.elements.icon.scale / 100})`}}
                    />
                    <div
                      className={classes.caption}
                      style={getAlignPosition(settings.elements.text.alignment, settings.elements.text.offset, isEditor)}
                    >
                      <RichTextRenderer content={item.imageCaption} />
                    </div>
                    <div
                      className={classes.creds}
                      style={getAlignPosition(settings.elements.creds.alignment, settings.elements.creds.offset, isEditor)}
                    >
                      <RichTextRenderer content={item.creds} />
                    </div>
                  </div>
                </div>
              </SplideSlide>
            ))} 
          </Splide>
        </div>
      </div>
      {controls.isActive && (
        <>
          <div 
            className={classes.arrow}
            style={{color: controls.color,['--arrow-hover-color' as string]: controls.hover}}
          >
            <button
              className={classes.arrowInner}
              style={{transform: `translate(${scalingValue(controls.offset.x, isEditor ?? false)}, ${scalingValue(controls.offset.y, isEditor ?? false)}) scale(${controls.scale / 100})`}}
              onClick={() => sliderRef.current?.go('-1')}
              aria-label='Previous'
              >
                {controls.arrowsImgUrl && (
                  <SvgImage
                    url={controls.arrowsImgUrl}
                    fill={controls.color}
                    hoverFill={controls.hover}
                    className={cn(classes.arrowImg, classes.mirror)}
                  />
                )}
                {!controls.arrowsImgUrl && (
                  <ArrowIcon color={controls.color} className={cn(classes.arrowIcon, classes.arrowImg, classes.mirror)} />
                )}
              </button>
          </div>
          <div
            className={cn(classes.arrow, classes.nextArrow)}
            style={{color: controls.color,['--arrow-hover-color' as string]: controls.hover}}
          >              
            <button
              className={classes.arrowInner}
              style={{ transform: `translate(${scalingValue(controls.offset.x * -1, isEditor ?? false)}, ${scalingValue(controls.offset.y, isEditor ?? false)}) scale(${controls.scale / 100})`}}
              onClick={() => sliderRef.current?.go('+1')}
              aria-label='Next'
            >
              {controls.arrowsImgUrl && (
                <SvgImage
                  url={controls.arrowsImgUrl}
                  fill={controls.color}
                  hoverFill={controls.hover}
                  className={classes.arrowImg}
                />
              )}
              {!controls.arrowsImgUrl && (
                <ArrowIcon color={controls.color} className={cn(classes.arrowIcon, classes.arrowImg)} />
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
  creds: any[];
};

export type Alignment = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type Offset = {
  x: number;
  y: number;
};

type TestimonialsGeneral = {
  autoplay: 'on' | 'off';
  inView?: number;
  alignment: 'left' | 'center' | 'right';
  move: 'one' | 'view';
  speed: string;
  direction: 'left' | 'right';
  pause: 'hover' | 'click' | 'off';
};

type TestimonialsControls = {
  arrowsImgUrl: string | null;
  isActive: boolean;
  color: string;
  hover: string;
  offset: Offset;
  scale: number;
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
};

type TestimonialsElements = {
  text: {
    alignment: Alignment;
    offset: Offset;
  };
  icon: {
    alignment: Alignment;
    offset: Offset;
    scale: number;
  };
  creds: {
    alignment: Alignment;
    offset: Offset;
  };
  // cover: {
  //   gradient: string
  // };
};

type TestimonialsSettings = {
  general: TestimonialsGeneral;
  card: TestimonialsCard;
  elements: TestimonialsElements;
  controls: TestimonialsControls;
};

type TestimonialsStyles = {
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
