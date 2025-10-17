import React, { useState, useEffect, useRef } from 'react';
import styles from './ControlSlider.module.scss';
import { Splide, SplideSlide, SplideProps } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import cn from 'classnames';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';

interface SliderProps {
  settings: SliderSettings;
  content: SliderItem[];
  styles: SliderStyles;
  isEditor?: boolean;
}

const alignmentClassName: Record<Alignment, string> = {
  'top-left': styles.topLeftAlignment,
  'top-center': styles.topCenterAlignment,
  'top-right': styles.topRightAlignment,
  'middle-left': styles.middleLeftAlignment,
  'middle-center': styles.middleCenterAlignment,
  'middle-right': styles.middleRightAlignment,
  'bottom-left': styles.bottomLeftAlignment,
  'bottom-center': styles.bottomCenterAlignment,
  'bottom-right': styles.bottomRightAlignment,
};

export function ControlSlider({ settings, content, styles: sliderStyles, isEditor }: SliderProps) {
  // @ts-ignore
  const [sliderRef, setSliderRef] = useState<Splide | null>(null);
  const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = sliderStyles.caption;
  const [sliderDimensions, setSliderDimensions] = useState<Dimensions | undefined>(undefined);
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [key, setKey] = useState(0);
  const { direction, transition, controls, pagination, caption, triggers } = settings;
  const prevSliderTypeRef = useRef<string | null>(transition.type);
  const { x: controlsOffsetX, y: controlsOffsetY } = settings.controls.offset;
  const handleArrowClick = (dir: '+1' | '-1') => {
    if (sliderRef) {
      sliderRef.go(dir);
    }
  };
  useEffect(() => {
    if (!wrapperRef) return;
    const observer = new ResizeObserver((entries) => {
      if (!sliderRef) return;
      const [wrapper] = entries;
      setSliderDimensions({
        width: Math.round(wrapper.contentRect.width),
        height: Math.round(wrapper.contentRect.height)
      });
    });
    observer.observe(wrapperRef);
    return () => observer.unobserve(wrapperRef);
  }, [wrapperRef]);

  useEffect(() => {
    if (!sliderRef || prevSliderTypeRef.current === transition.type) return;
    setKey(prev => prev + 1);
    prevSliderTypeRef.current = transition.type;
  }, [transition.type]);

  return (
    <div className={cn(styles.wrapper, { [styles.editor]: isEditor })} ref={setWrapperRef}>
      <div
       className={styles.sliderInner}
       style={{
          width: sliderDimensions ? sliderDimensions.width : '100%',
          height: sliderDimensions ? sliderDimensions.height : '100%',
          backgroundColor: transition.backgroundColor && transition.type === 'fade in' ? transition.backgroundColor : 'transparent'
        }}
      >
      {settings.caption.isActive && (
        <div
          className={cn(styles.captionBlock)}
        >
          <div
            className={styles.captionTextWrapper}
          >
            {content.map((item, index) => (
              <div
                key={index}
                className={cn(styles.captionText, alignmentClassName[caption.alignment], { 
                  [styles.withPointerEvents]: index === currentSlideIndex && isEditor,
                  [styles.active]: index === currentSlideIndex,
                })}
                style={{
                  fontFamily: fontSettings.fontFamily,
                  fontWeight: fontSettings.fontWeight,
                  fontStyle: fontSettings.fontStyle,
                  width: widthSettings.sizing === 'auto' ? 'max-content' : scalingValue(widthSettings.width, isEditor),
                  letterSpacing: scalingValue(letterSpacing, isEditor),
                  wordSpacing: scalingValue(wordSpacing, isEditor),
                  textAlign,
                  fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
                  lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
                  textTransform: textAppearance.textTransform ?? 'none',
                  textDecoration: textAppearance.textDecoration ?? 'none',
                  fontVariant: textAppearance.fontVariant ?? 'normal',
                  color,
                  transitionDuration: transition.duration ? `${Math.round(parseInt(transition.duration) / 2)}ms` : '500ms',
                }}
              >
                <div
                  data-styles="caption"
                  className={styles.captionTextInner}
                  style={{
                    '--link-hover-color': caption.hover,
                    position: 'relative',
                    top: scalingValue(caption.offset.y, isEditor),
                    left: scalingValue(caption.offset.x, isEditor)
                  } as React.CSSProperties}
                >
                  <RichTextRenderer content={item.imageCaption} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Splide
        onMove={(e) => {
          setCurrentSlideIndex(e.index);
        }}
        key={key}
        ref={setSliderRef}
        options={{
          arrows: false,
          speed: transition.duration ? parseInt(transition.duration) : 500,
          autoplay: isEditor ? false : triggers.autoPlay !== null,
          ...(triggers.autoPlay !== null && {
            interval: parseInt(triggers.autoPlay) * 1000,
          }),
          direction: direction === 'horiz' || transition.type === 'fade in' ? 'ltr' : 'ttb',
          pagination: false,
          drag: triggers.triggersList.drag,
          perPage: 1,
          width: sliderDimensions ? sliderDimensions.width : '100%',
          height: sliderDimensions ? sliderDimensions.height : '100%',
          type: transition.type === 'fade in' ? 'fade' : 'loop',
          rewind: true
        }}
      >
        {content.map((item, index) => (
          <SplideSlide key={index}>
            <div
              className={styles.sliderItem}
            >
              <div
                className={styles.imgWrapper}
              >
                <img
                  className={cn(styles.sliderImage, {
                    [styles.contain]: item.image.objectFit === 'contain',
                    [styles.cover]: item.image.objectFit === 'cover'
                  })}
                  src={item.image.url} alt={item.image.name ?? ''}
                />
              </div>
            </div>
          </SplideSlide>
        ))}
      </Splide>
      {controls.isActive && (
        <>
          <div
            className={cn(styles.arrow, {
              [styles.arrowVertical]: direction === 'vert'
            })}
            style={{
              color: controls.color,
              ['--arrow-hover-color' as string]: controls.hover
            }}
          >
            <button
              onClick={() => {
                handleArrowClick('-1');
              }}
              className={styles.arrowInner}
              style={{
                transform: `translate(${scalingValue(controlsOffsetX, isEditor)}, ${scalingValue(controlsOffsetY * (direction === 'horiz' ? 1 : -1), isEditor)}) scale(${settings.controls.scale / 100}) rotate(${direction === 'horiz' ? '0deg' : '90deg'})`,
              }}
            >
              {controls.arrowsImgUrl && (
                <SvgImage
                  url={controls.arrowsImgUrl}
                  fill={controls.color}
                  hoverFill={controls.hover}
                  className={cn(styles.arrowImg, styles.mirror)}
                />
              )}
              {!controls.arrowsImgUrl && (
                <ArrowIcon color={controls.color} className={cn(styles.arrowIcon, styles.arrowImg, styles.mirror)} />
              )}
            </button>
          </div>
          <div
            className={cn(styles.arrow, styles.nextArrow, {
              [styles.arrowVertical]: direction === 'vert'
            })}
            style={{
              color: controls.color,
              ['--arrow-hover-color' as string]: controls.hover
            }}
          >
            <button
              className={styles.arrowInner}
              onClick={() => handleArrowClick('+1')}
              style={{
                transform: `translate(${scalingValue(controlsOffsetX * (direction === 'horiz' ? -1 : 1), isEditor)}, ${scalingValue(controlsOffsetY, isEditor)}) scale(${settings.controls.scale / 100}) rotate(${direction === 'horiz' ? '0deg' : '90deg'})`,
              }}
            >
              {controls.arrowsImgUrl && (
                <SvgImage
                  url={controls.arrowsImgUrl}
                  fill={controls.color}
                  hoverFill={controls.hover}
                  className={styles.arrowImg}
                />
              )}
              {!controls.arrowsImgUrl && (
                <ArrowIcon color={controls.color} className={cn(styles.arrowIcon, styles.arrowImg)} />
              )}
            </button>
          </div>
        </>
      )}
      {triggers.triggersList.click && (
        <div
          className={styles.clickOverlay}
          onClick={() => {
            if (sliderRef) {
              sliderRef.go('+1');
            }
          }}
        />
      )}
      {pagination.isActive && (
        <div
          className={cn(styles.pagination, {
            [styles.paginationInsideBottom]: pagination.position === 'inside-1' && direction === 'horiz',
            [styles.paginationInsideTop]: pagination.position === 'inside-2' && direction === 'horiz',
            [styles.paginationOutsideBottom]: pagination.position === 'outside-1' && direction === 'horiz',
            [styles.paginationOutsideTop]: pagination.position === 'outside-2' && direction === 'horiz',
            [styles.paginationInsideLeft]: pagination.position === 'inside-1' && direction === 'vert',
            [styles.paginationInsideRight]: pagination.position === 'inside-2' && direction === 'vert',
            [styles.paginationOutsideLeft]: pagination.position === 'outside-1' && direction === 'vert',
            [styles.paginationOutsideRight]: pagination.position === 'outside-2' && direction === 'vert',
            [styles.paginationVertical]: direction === 'vert',
          })}
        >
          <div
            className={styles.paginationInner}
            style={{
              backgroundColor: pagination.colors[2],
              transform: `scale(${pagination.scale / 100}) translate(${scalingValue(pagination.offset.x, isEditor)}, ${scalingValue(pagination.offset.y, isEditor)}) rotate(${direction === 'horiz' ? '0deg' : '90deg'})`,
            }}
          >
            {content.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (sliderRef) {
                    sliderRef.go(index);
                  }
                }}
                className={cn(styles.paginationItem)}
              >
                <div
                  className={cn(styles.dot, {
                    [styles.activeDot]: index === currentSlideIndex
                  })}
                  style={{
                    backgroundColor: index === currentSlideIndex ? pagination.colors[0] : pagination.colors[1],
                    ['--pagination-hover-color' as string]: pagination.hover
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function ArrowIcon({ color, className }: { color: string, className: string }) {
  return (
    <svg viewBox="0 0 10 18" className={className}>
      <g id="Symbols" stroke="none" strokeWidth="1" fillRule="evenodd">
          <path d="M-3.70710678,4.29289322 C-3.34662282,3.93240926 -2.77939176,3.90467972 -2.38710056,4.20970461 L-2.29289322,4.29289322 L5,11.585 L12.2928932,4.29289322 C12.6533772,3.93240926 13.2206082,3.90467972 13.6128994,4.20970461 L13.7071068,4.29289322 C14.0675907,4.65337718 14.0953203,5.22060824 13.7902954,5.61289944 L13.7071068,5.70710678 L5.70710678,13.7071068 C5.34662282,14.0675907 4.77939176,14.0953203 4.38710056,13.7902954 L4.29289322,13.7071068 L-3.70710678,5.70710678 C-4.09763107,5.31658249 -4.09763107,4.68341751 -3.70710678,4.29289322 Z" id="Shape-Copy" fill={color} transform="translate(5, 9) rotate(-90) translate(-5, -9)"></path>
      </g>
    </svg>
  );
}

type SliderItem = {
  image: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  imageCaption: any[];
};

type Offset = {
  x: number;
  y: number;
}

type SliderControls = {
  arrowsImgUrl: string | null;
  isActive: boolean;
  color: string;
  hover: string;
  offset: Offset;
  scale: number;
};

type SliderPagination = {
  position: 'outside-1' | 'outside-2' | 'inside-1' | 'inside-2';
  isActive: boolean;
  scale: number;
  offset: Offset;
  colors: string[];
  hover: string;
};

type Alignment = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

type SliderCaption = {
  alignment: Alignment;
  isActive: boolean;
  color: string;
  offset: Offset;
  hover: string;
};

type Triggers = {
  triggersList: {
    click: boolean;
    drag: boolean;
  };
  autoPlay: string | null;
};

type SliderSettings = {
  controls: SliderControls;
  pagination: SliderPagination;
  direction: 'horiz' | 'vert';
  transition: {
    type: 'slide' | 'fade in';
    duration: string;
    backgroundColor: string | null;
  };
  caption: SliderCaption;
  triggers: Triggers;
};

type CaptionStyles = {
  fontSettings: {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
  },
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

type SliderStyles = {
  caption: CaptionStyles;
}

type Dimensions = {
  width: number;
  height: number;
}
