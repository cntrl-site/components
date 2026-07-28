import React, { useState, useEffect, useRef } from 'react';
import styles from './Slider20.module.scss';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import cn from 'classnames';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { CommonComponentProps } from '../props';
import { normalizeFontFamilyCssValue } from '../utils/textStylesToCss';
import { TextElementStyles } from '../../types/TextElementStyles';

type Slider20Item = {
  image: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  imageCaption: any[];
};

type Slider20Trigger = 'click' | 'drag' | 'auto';
type Slider20Direction = 'horizontal' | 'vertical';
type Slider20Transition = 'slide' | 'fade in' | 'reveal';
type Slider20Nav = 'type' | 'classic' | 'no';
type Slider20ControlsShow = 'always' | 'on click' | 'never';
type Slider20ControlsPosition = 'inside' | 'outside';

type Slider20Settings = {
  trigger?: Slider20Trigger;
  direction?: Slider20Direction;
  transition?: Slider20Transition;
  nav?: Slider20Nav;
  controls?: string | null;
  controlsMaxWidth?: number;
  show?: Slider20ControlsShow;
  position?: Slider20ControlsPosition;
};

type Slider20Props = {
  settings?: Slider20Settings;
  content: Slider20Item[];
  isEditor?: boolean;
} & CommonComponentProps;

type Offset = { x: number; y: number };

type Alignment =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

type Dimensions = { width: number; height: number };

const TRANSITION_DURATION = '500ms';
const TRANSITION_BACKGROUND_COLOR: string | null = null;

const CONTROLS = {
  offset: { x: 0, y: 0 } as Offset,
  scale: 100,
  color: '#000000',
  hover: '#cccccc',
};

const PAGINATION = {
  scale: 50,
  position: 'inside-1' as 'outside-1' | 'outside-2' | 'inside-1' | 'inside-2',
  offset: { x: 0, y: 0 } as Offset,
  colors: ['#cccccc', '#cccccc', '#000000'],
  hover: '#cccccc',
};

const IMAGE_CAPTION = {
  offset: { x: 0, y: 0 } as Offset,
  isActive: true,
  alignment: 'middle-center' as Alignment,
  linkColor: '#cccccc',
  linkHoverColor: '#cccccc',
};

const AUTO_PLAY_INTERVAL_S = 3;

const IMAGE_CAPTION_STYLE: TextElementStyles = {
  widthSettings: { width: 0.13, sizing: 'auto' },
  fontSettings: { fontFamily: 'Arial', fontWeight: 400, fontStyle: 'normal' },
  fontSizeLineHeight: { fontSize: 0.02, lineHeight: 0.02 },
  letterSpacing: 0,
  wordSpacing: 0,
  textAlign: 'left',
  textAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
  color: '#000000',
};

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

export function Slider20({ settings, content, isEditor }: Slider20Props) {
  const [sliderRef, setSliderRef] = useState<InstanceType<typeof Splide> | null>(null);
  const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = IMAGE_CAPTION_STYLE;
  const [sliderDimensions, setSliderDimensions] = useState<Dimensions | undefined>(undefined);
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [controlsRevealed, setControlsRevealed] = useState(false);
  const items = content ?? [];
  const trigger: Slider20Trigger = settings?.trigger ?? 'drag';
  const direction: Slider20Direction = settings?.direction ?? 'horizontal';
  const transition: Slider20Transition = settings?.transition ?? 'slide';
  const nav: Slider20Nav = settings?.nav ?? 'classic';
  const controlsShow: Slider20ControlsShow = settings?.show ?? 'always';
  const controlsPosition: Slider20ControlsPosition = settings?.position ?? 'outside';
  const controlsImgUrl = settings?.controls ?? null;
  const controlsMaxWidth = typeof settings?.controlsMaxWidth === 'number' ? settings.controlsMaxWidth : 65 / 1440;
  const isHorizontal = direction === 'horizontal';
  const isClickTrigger = trigger === 'click';
  const isDragTrigger = trigger === 'drag';
  const isAutoTrigger = trigger === 'auto';
  const isFadeTransition = transition === 'fade in' || transition === 'reveal';
  const showClassicNav = nav === 'classic';
  const showTypeNav = nav === 'type';
  const showControls = controlsShow !== 'never';
  const controlsVisible = controlsShow === 'always' || (controlsShow === 'on click' && controlsRevealed);
  const isControlsInside = controlsPosition === 'inside';
  const prevTransitionRef = useRef<Slider20Transition>(transition);
  const prevTriggerRef = useRef<Slider20Trigger>(trigger);
  const prevDirectionRef = useRef<Slider20Direction>(direction);
  const prevNavRef = useRef<Slider20Nav>(nav);
  const { x: controlsOffsetX, y: controlsOffsetY } = CONTROLS.offset;
  const controlsMaxWidthScaled = scalingValue(controlsMaxWidth, isEditor);
  const controlsSizeStyle = {
    width: controlsMaxWidthScaled,
    height: controlsMaxWidthScaled,
    maxWidth: controlsMaxWidthScaled,
  } as React.CSSProperties;
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
    if (prevTransitionRef.current === transition) return;
    setKey(prev => prev + 1);
    prevTransitionRef.current = transition;
  }, [transition]);

  useEffect(() => {
    if (prevTriggerRef.current === trigger) return;
    setKey(prev => prev + 1);
    prevTriggerRef.current = trigger;
  }, [trigger]);

  useEffect(() => {
    if (prevDirectionRef.current === direction) return;
    setKey(prev => prev + 1);
    prevDirectionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (prevNavRef.current === nav) return;
    setKey(prev => prev + 1);
    prevNavRef.current = nav;
  }, [nav]);

  useEffect(() => {
    setControlsRevealed(false);
  }, [controlsShow]);

  return (
    <div
      className={cn(styles.wrapper, {
        [styles.editor]: isEditor,
        [styles.transitionReveal]: transition === 'reveal',
        [styles.transitionRevealVertical]: transition === 'reveal' && !isHorizontal,
      })}
      ref={setWrapperRef}
      onClick={controlsShow === 'on click' ? () => setControlsRevealed(true) : undefined}
    >
      <div
       className={styles.sliderInner}
       style={{
          width: sliderDimensions ? sliderDimensions.width : '100%',
          height: sliderDimensions ? sliderDimensions.height : '100%',
          backgroundColor: TRANSITION_BACKGROUND_COLOR && transition === 'fade in' ? TRANSITION_BACKGROUND_COLOR : 'transparent'
        }}
      >
      {IMAGE_CAPTION.isActive && (
        <div
          className={cn(styles.captionBlock)}
        >
          <div
            className={styles.captionTextWrapper}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(styles.captionText, alignmentClassName[IMAGE_CAPTION.alignment], {
                  [styles.withPointerEvents]: index === currentSlideIndex && isEditor,
                  [styles.active]: index === currentSlideIndex,
                })}
                style={{
                  fontFamily: normalizeFontFamilyCssValue(fontSettings.fontFamily),
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
                  transitionDuration: `${Math.round(parseInt(TRANSITION_DURATION) / 2)}ms`,
                }}
              >
                <div
                  data-styles="imageCaption"
                  className={styles.captionTextInner}
                  style={{
                    '--link-hover-color': IMAGE_CAPTION.linkHoverColor,
                    '--link-color': IMAGE_CAPTION.linkColor,
                    position: 'relative',
                    top: scalingValue(IMAGE_CAPTION.offset.y, isEditor),
                    left: scalingValue(IMAGE_CAPTION.offset.x, isEditor)
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
          speed: parseInt(TRANSITION_DURATION),
          autoplay: isAutoTrigger,
          ...(isAutoTrigger && {
            interval: AUTO_PLAY_INTERVAL_S * 1000,
          }),
          direction: isHorizontal || isFadeTransition ? 'ltr' : 'ttb',
          pagination: false,
          drag: isDragTrigger,
          perPage: 1,
          width: sliderDimensions ? sliderDimensions.width : '100%',
          height: sliderDimensions ? sliderDimensions.height : '100%',
          type: isFadeTransition ? 'fade' : 'loop',
          rewind: true
        }}
      >
        {items.map((item, index) => (
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
      {showControls && (
        <>
          <div
            className={cn(styles.arrow, {
              [styles.arrowOutsidePrev]: !isControlsInside && isHorizontal,
              [styles.arrowOutsidePrevVertical]: !isControlsInside && !isHorizontal,
              [styles.arrowInsidePrev]: isControlsInside && isHorizontal,
              [styles.arrowInsidePrevVertical]: isControlsInside && !isHorizontal,
              [styles.arrowHidden]: !controlsVisible,
            })}
            style={{
              color: CONTROLS.color,
              ['--arrow-hover-color' as string]: CONTROLS.hover,
              ...controlsSizeStyle,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleArrowClick('-1');
              }}
              className={styles.arrowInner}
              style={{
                transform: `translate(${scalingValue(controlsOffsetX, isEditor)}, ${scalingValue(controlsOffsetY * (isHorizontal ? 1 : -1), isEditor)}) scale(${CONTROLS.scale / 100}) rotate(${isHorizontal ? '0deg' : '90deg'})`,
              }}
            >
              {controlsImgUrl && (
                <SvgImage
                  url={controlsImgUrl}
                  fill={CONTROLS.color}
                  hoverFill={CONTROLS.hover}
                  className={cn(styles.arrowImg, isHorizontal ? styles.mirror : styles.mirrorVertical)}
                  style={controlsSizeStyle}
                />
              )}
              {!controlsImgUrl && (
                <ArrowIcon
                  color={CONTROLS.color}
                  className={cn(styles.arrowIcon, styles.arrowImg, isHorizontal ? styles.mirror : styles.mirrorVertical)}
                />
              )}
            </button>
          </div>
          <div
            className={cn(styles.arrow, {
              [styles.arrowOutsideNext]: !isControlsInside && isHorizontal,
              [styles.arrowOutsideNextVertical]: !isControlsInside && !isHorizontal,
              [styles.arrowInsideNext]: isControlsInside && isHorizontal,
              [styles.arrowInsideNextVertical]: isControlsInside && !isHorizontal,
              [styles.arrowHidden]: !controlsVisible,
            })}
            style={{
              color: CONTROLS.color,
              ['--arrow-hover-color' as string]: CONTROLS.hover,
              ...controlsSizeStyle,
            }}
          >
            <button
              className={styles.arrowInner}
              onClick={(e) => {
                e.stopPropagation();
                handleArrowClick('+1');
              }}
              style={{
                transform: `translate(${scalingValue(controlsOffsetX * (isHorizontal ? -1 : 1), isEditor)}, ${scalingValue(controlsOffsetY, isEditor)}) scale(${CONTROLS.scale / 100}) rotate(${isHorizontal ? '0deg' : '90deg'})`,
              }}
            >
              {controlsImgUrl && (
                <SvgImage
                  url={controlsImgUrl}
                  fill={CONTROLS.color}
                  hoverFill={CONTROLS.hover}
                  className={styles.arrowImg}
                  style={controlsSizeStyle}
                />
              )}
              {!controlsImgUrl && (
                <ArrowIcon color={CONTROLS.color} className={cn(styles.arrowIcon, styles.arrowImg)} />
              )}
            </button>
          </div>
        </>
      )}
      {isClickTrigger && (
        <div
          className={styles.clickOverlay}
          onClick={() => {
            if (sliderRef) {
              sliderRef.go('+1');
            }
          }}
        />
      )}
      {showClassicNav && (
        <div
          className={cn(styles.pagination, {
            [styles.paginationInsideBottom]: PAGINATION.position === 'inside-1' && isHorizontal,
            [styles.paginationInsideTop]: PAGINATION.position === 'inside-2' && isHorizontal,
            [styles.paginationOutsideBottom]: PAGINATION.position === 'outside-1' && isHorizontal,
            [styles.paginationOutsideTop]: PAGINATION.position === 'outside-2' && isHorizontal,
            [styles.paginationInsideLeft]: PAGINATION.position === 'inside-1' && !isHorizontal,
            [styles.paginationInsideRight]: PAGINATION.position === 'inside-2' && !isHorizontal,
            [styles.paginationOutsideLeft]: PAGINATION.position === 'outside-1' && !isHorizontal,
            [styles.paginationOutsideRight]: PAGINATION.position === 'outside-2' && !isHorizontal,
            [styles.paginationVertical]: !isHorizontal,
          })}
        >
          <div
            className={styles.paginationInner}
            style={{
              backgroundColor: PAGINATION.colors[2],
              transform: `scale(${PAGINATION.scale / 100}) translate(${scalingValue(PAGINATION.offset.x, isEditor)}, ${scalingValue(PAGINATION.offset.y, isEditor)}) rotate(${isHorizontal ? '0deg' : '90deg'})`,
            }}
          >
            {items.map((_, index) => (
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
                    backgroundColor: index === currentSlideIndex ? PAGINATION.colors[0] : PAGINATION.colors[1],
                    ['--pagination-hover-color' as string]: PAGINATION.hover
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      {showTypeNav && items.length > 0 && (
        <div
          className={cn(styles.typeNav, {
            [styles.typeNavVertical]: !isHorizontal,
          })}
        >
          <span className={styles.typeNavCurrent}>
            {String(currentSlideIndex + 1).padStart(2, '0')}
          </span>
          <span className={styles.typeNavSeparator}>/</span>
          <span className={styles.typeNavTotal}>
            {String(items.length).padStart(2, '0')}
          </span>
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
