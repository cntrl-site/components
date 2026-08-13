import React, { useState, useEffect, useRef } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import cn from 'classnames';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { CommonComponentProps } from '../props';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { useScopedStyles } from '../utils/useScopedStyles';

type Slider20Item = {
  image: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  imageCaption: any[];
};

type Slider20TriggerType = 'click' | 'drag' | 'auto';
type Slider20Trigger = {
  sizeType: Slider20TriggerType;
  value: number;
  min: number;
  max: number;
};
type Slider20Direction = 'horizontal' | 'vertical';
type Slider20Transition = 'slide' | 'fade in' | 'reveal';
type Slider20Nav = 'classic' | 'no';
type Slider20NavSize = 's' | 'm' | 'l';
type Slider20ControlsShow = 'always' | 'on hover' | 'never';

type Slider20Settings = {
  trigger?: Slider20Trigger;
  direction?: Slider20Direction;
  transition?: Slider20Transition;
  nav?: Slider20Nav;
  navSize?: Slider20NavSize;
  navUnit?: number;
  controls?: string | null;
  controlsMaxWidth?: number;
  show?: Slider20ControlsShow;
  paddingX?: number;
  paddingY?: number;
  controlsColor?: string;
  controlsHoverColor?: string;
  navColor?: string;
  navPaginationColor?: string;
  navBackgroundColor?: string;
  linkColor?: string;
  titleColor?: string;
  titleFontFamily?: string;
  titleFontSettings?: {
    fontWeight?: number;
    fontStyle?: string;
  };
  titleFontSize?: number;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleWordSpacing?: number;
  titleTextAppearance?: {
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline';
    fontVariant?: 'normal' | 'small-caps';
  };
  captionMarginTop?: number;
};

type Slider20Props = {
  settings?: Slider20Settings;
  content: Slider20Item[];
  isEditor?: boolean;
  isEditMode?: boolean;
} & CommonComponentProps;

type Offset = { x: number; y: number };

type Dimensions = { width: number; height: number };

const TRANSITION_DURATION = '500ms';
const TRANSITION_BACKGROUND_COLOR: string | null = null;

const CONTROLS = {
  color: '#000000',
  hover: '#cccccc',
};

const PAGINATION = {
  offset: { x: 0, y: 0 } as Offset,
  colors: {
    pagination: '#cccccc',
    inactive: '#cccccc',
    background: '#000000',
  },
};

const NAV_SIZES: Record<Slider20NavSize, {
  paddingY: number;
  paddingActive: number;
  borderRadius: number;
  dot: number;
  activeDot: number;
  gapInactive: number;
  inset: number;
}> = {
  s: {
    paddingY: 5,
    paddingActive: 5,
    borderRadius: 9,
    dot: 4,
    activeDot: 8,
    gapInactive: 9,
    inset: 5,
  },
  m: {
    paddingY: 7,
    paddingActive: 7,
    borderRadius: 17,
    dot: 8,
    activeDot: 20,
    gapInactive: 22,
    inset: 7,
  },
  l: {
    paddingY: 10,
    paddingActive: 10,
    borderRadius: 29,
    dot: 20,
    activeDot: 38,
    gapInactive: 26,
    inset: 10,
  },
};

const IMAGE_CAPTION = {
  offset: { x: 0, y: 0 } as Offset,
  isActive: true,
  linkColor: '#cccccc',
};

const DEFAULT_TRIGGER: Slider20Trigger = {
  sizeType: 'drag',
  value: 3,
  min: 1,
  max: 5,
};

const TITLE_WIDTH_SETTINGS = { width: 0.13, sizing: 'auto' as const };
const TITLE_TEXT_ALIGN = 'left' as const;

function resolveTitleStyle(settings: Slider20Settings | undefined, isEditor?: boolean): React.CSSProperties {
  const textStyles: TextStyles = {
    fontSettings: {
      fontFamily: settings?.titleFontFamily ?? 'Arial',
      fontWeight: settings?.titleFontSettings?.fontWeight ?? 400,
      fontStyle: settings?.titleFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: settings?.titleFontSize ?? 0.02,
    lineHeight: settings?.titleLineHeight ?? 0.02,
    letterSpacing: settings?.titleLetterSpacing ?? 0,
    wordSpacing: settings?.titleWordSpacing ?? 0,
    textAppearance: settings?.titleTextAppearance,
    textAlign: TITLE_TEXT_ALIGN,
    color: settings?.titleColor ?? '#000000',
  };
  return textStylesToCss(textStyles, isEditor);
}

function sizeCss(property: string, value: number, isEditor?: boolean): string {
  return `${property}: ${scalingValue(value / 1440, isEditor)};`;
}

function getCSS(P: string, isEditor?: boolean): string {
  return `
.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.${P}-wrapper:hover .${P}-hover-arrow {
  opacity: 1 !important;
}
.${P}-slider-inner {
  position: relative;
  width: 100%;
  height: 100%;
}
.${P}-slider-item {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}
.${P}-slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.${P}-arrow {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  top: 50%;
  z-index: 1;
  padding: 0;
  ${sizeCss('width', 30, isEditor)}
  ${sizeCss('height', 30, isEditor)}
  transition: opacity 0.15s ease-in-out;
}
.${P}-arrow-prev {
  ${sizeCss('left', -20, isEditor)}
  transform: translate3d(-50%, -50%, 0);
}
.${P}-arrow-next {
  left: unset;
  ${sizeCss('right', -20, isEditor)}
  transform: translate3d(50%, -50%, 0);
}
.${P}-arrow-prev-vertical {
  left: 50%;
  ${sizeCss('top', -20, isEditor)}
  transform: translate3d(-50%, -50%, 0);
}
.${P}-arrow-next-vertical {
  left: 50%;
  right: unset;
  top: unset;
  ${sizeCss('bottom', -20, isEditor)}
  transform: translate3d(-50%, 50%, 0);
}
.${P}-arrow-hidden {
  opacity: 0;
  pointer-events: none;
}
.${P}-hover-arrow {
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}
.${P}-hover-arrow:hover {
  opacity: 1;
}
.${P}-arrow-inner {
  all: unset;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.${P}-arrow-inner:hover .${P}-arrow-icon path {
  fill: var(--arrow-hover-color) !important;
}
.${P}-arrow-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.${P}-arrow-icon {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.${P}-arrow-icon path {
  transition: fill 0.15s ease-in-out;
}
.${P}-mirror {
  transform: translate(-50%, -50%) scaleX(-1) !important;
}
.${P}-pagination {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
}
.${P}-pagination-inner {
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.${P}-pagination-vertical {
  flex-direction: column;
}
.${P}-pagination-item {
  all: unset;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  aspect-ratio: 1;
  height: auto;
}
.${P}-dot {
  border-radius: 50%;
  aspect-ratio: 1;
  height: auto;
  transition: background-color 0.3s ease-in-out;
}
.${P}-animate-dots .${P}-dot {
  transition: background-color 0.3s ease-in-out, width 0.3s ease-in-out;
}
.${P}-pagination-inside-bottom {
  left: 50%;
  transform: translate3d(-50%, 0, 0);
}
.${P}-pagination-inside-left {
  top: 50%;
  transform: translate3d(0, -50%, 0);
}
.${P}-img-wrapper {
  width: 100%;
  height: 100%;
}
.${P}-control {
  position: relative;
  z-index: 2;
  width: 100%;
}
.${P}-caption-block {
  pointer-events: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1;
}
.${P}-caption-text-wrapper {
  position: relative;
  width: 100%;
}
.${P}-caption-text {
  pointer-events: none;
  max-width: 100%;
  transition-property: opacity;
  transition-timing-function: ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  opacity: 0;
}
.${P}-caption-text.${P}-active {
  opacity: 1;
}
.${P}-with-pointer-events {
  pointer-events: auto;
}
.${P}-click-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.${P}-contain {
  object-fit: contain;
}
.${P}-cover {
  object-fit: cover;
}
.${P}-transition-reveal .splide__slide.is-active .${P}-slider-image {
  animation: ${P}-reveal-horizontal 500ms ease;
}
.${P}-transition-reveal-vertical .splide__slide.is-active .${P}-slider-image {
  animation: ${P}-reveal-vertical 500ms ease;
}
@keyframes ${P}-reveal-horizontal {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
@keyframes ${P}-reveal-vertical {
  from { clip-path: inset(100% 0 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
`;
}

export function Slider20({ settings, content, isEditor, isEditMode }: Slider20Props) {
  const { prefix: P } = useScopedStyles();
  const [sliderRef, setSliderRef] = useState<InstanceType<typeof Splide> | null>(null);
  const titleStyle = resolveTitleStyle(settings, isEditor);
  const [sliderDimensions, setSliderDimensions] = useState<Dimensions | undefined>(undefined);
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [animateDots, setAnimateDots] = useState(false);
  const [key, setKey] = useState(0);
  const items = content ?? [];
  const trigger: Slider20Trigger = settings?.trigger ?? DEFAULT_TRIGGER;
  const triggerType: Slider20TriggerType = trigger.sizeType ?? 'drag';
  const autoPlayIntervalS = trigger.value ?? DEFAULT_TRIGGER.value;
  const direction: Slider20Direction = settings?.direction ?? 'horizontal';
  const transition: Slider20Transition = settings?.transition ?? 'slide';
  const nav: Slider20Nav = settings?.nav ?? 'classic';
  const navSize: Slider20NavSize = settings?.navSize ?? 'm';
  const navSizeValues = NAV_SIZES[navSize];
  const navUnit = typeof settings?.navUnit === 'number' ? settings.navUnit : 1 / 1440;
  const scaleNav = (px: number) => scalingValue(px * navUnit, isEditor);
  const controlsShow: Slider20ControlsShow = settings?.show ?? 'always';
  const controlsImgUrl = settings?.controls ?? null;
  const controlsMaxWidth = typeof settings?.controlsMaxWidth === 'number' ? settings.controlsMaxWidth : 65 / 1440;
  const controlsOffsetX = typeof settings?.paddingX === 'number' ? settings.paddingX : 0;
  const controlsOffsetY = typeof settings?.paddingY === 'number' ? settings.paddingY : 0;
  const controlsColor = settings?.controlsColor ?? CONTROLS.color;
  const controlsHoverColor = settings?.controlsHoverColor ?? CONTROLS.hover;
  const navColor = settings?.navColor ?? PAGINATION.colors.inactive;
  const navPaginationColor = settings?.navPaginationColor ?? PAGINATION.colors.pagination;
  const navBackgroundColor = settings?.navBackgroundColor ?? PAGINATION.colors.background;
  const linkColor = settings?.linkColor ?? IMAGE_CAPTION.linkColor;
  const captionMarginTop = typeof settings?.captionMarginTop === 'number' ? settings.captionMarginTop : 0;
  const isHorizontal = direction === 'horizontal';
  const isClickTrigger = triggerType === 'click';
  const isDragTrigger = triggerType === 'drag';
  const isAutoTrigger = triggerType === 'auto';
  const isFadeTransition = transition === 'fade in' || transition === 'reveal';
  const showClassicNav = nav === 'classic';
  const showControls = controlsShow !== 'never';
  const isControlsOnHover = controlsShow === 'on hover';
  const prevTransitionRef = useRef<Slider20Transition>(transition);
  const prevTriggerTypeRef = useRef<Slider20TriggerType>(triggerType);
  const prevAutoPlayIntervalRef = useRef(autoPlayIntervalS);
  const prevDirectionRef = useRef<Slider20Direction>(direction);
  const prevNavRef = useRef<Slider20Nav>(nav);
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
    if (!animateDots) return;
    const timeoutId = window.setTimeout(() => setAnimateDots(false), 300);
    return () => window.clearTimeout(timeoutId);
  }, [animateDots, currentSlideIndex]);

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
    if (prevTriggerTypeRef.current === triggerType) return;
    setKey(prev => prev + 1);
    prevTriggerTypeRef.current = triggerType;
  }, [triggerType]);

  useEffect(() => {
    if (prevAutoPlayIntervalRef.current === autoPlayIntervalS) return;
    setKey(prev => prev + 1);
    prevAutoPlayIntervalRef.current = autoPlayIntervalS;
  }, [autoPlayIntervalS]);

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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P, isEditor) }} />
      <div
        className={cn(`${P}-wrapper`, {
          [`${P}-transition-reveal`]: transition === 'reveal',
          [`${P}-transition-reveal-vertical`]: transition === 'reveal' && !isHorizontal,
        })}
        ref={setWrapperRef}
      >
        <div
          className={`${P}-slider-inner`}
          style={{
            width: sliderDimensions ? sliderDimensions.width : '100%',
            height: sliderDimensions ? sliderDimensions.height : '100%',
            backgroundColor: TRANSITION_BACKGROUND_COLOR && transition === 'fade in' ? TRANSITION_BACKGROUND_COLOR : 'transparent'
          }}
        >
        <Splide
          onMove={(e) => {
            setAnimateDots(true);
            setCurrentSlideIndex(e.index);
          }}
          key={key}
          ref={setSliderRef}
          options={{
            arrows: false,
            speed: parseInt(TRANSITION_DURATION),
            autoplay: isAutoTrigger,
            ...(isAutoTrigger && {
              interval: autoPlayIntervalS * 1000,
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
              <div className={`${P}-slider-item`}>
                <div className={`${P}-img-wrapper`}>
                  <img
                    className={cn(`${P}-slider-image`, {
                      [`${P}-contain`]: item.image.objectFit === 'contain',
                      [`${P}-cover`]: item.image.objectFit === 'cover'
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
              className={cn(`${P}-arrow`, {
                [`${P}-arrow-prev`]: isHorizontal,
                [`${P}-arrow-prev-vertical`]: !isHorizontal,
                [`${P}-hover-arrow`]: isControlsOnHover,
              })}
              style={{
                color: controlsColor,
                ['--arrow-hover-color' as string]: controlsHoverColor,
                ...controlsSizeStyle,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArrowClick('-1');
                }}
                className={`${P}-arrow-inner`}
                style={{
                  transform: `translate(${scalingValue(controlsOffsetX, isEditor)}, ${scalingValue(controlsOffsetY * (isHorizontal ? 1 : -1), isEditor)}) rotate(${isHorizontal ? '0deg' : '90deg'})`,
                }}
              >
                {controlsImgUrl && (
                  <SvgImage
                    url={controlsImgUrl}
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={cn(`${P}-arrow-img`, `${P}-mirror`)}
                    style={controlsSizeStyle}
                  />
                )}
                {!controlsImgUrl && (
                  <ArrowIcon
                    color={controlsColor}
                    className={cn(`${P}-arrow-icon`, `${P}-arrow-img`, `${P}-mirror`)}
                  />
                )}
              </button>
            </div>
            <div
              className={cn(`${P}-arrow`, {
                [`${P}-arrow-next`]: isHorizontal,
                [`${P}-arrow-next-vertical`]: !isHorizontal,
                [`${P}-hover-arrow`]: isControlsOnHover,
              })}
              style={{
                color: controlsColor,
                ['--arrow-hover-color' as string]: controlsHoverColor,
                ...controlsSizeStyle,
              }}
            >
              <button
                className={`${P}-arrow-inner`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleArrowClick('+1');
                }}
                style={{
                  transform: `translate(${scalingValue(controlsOffsetX * (isHorizontal ? -1 : 1), isEditor)}, ${scalingValue(controlsOffsetY, isEditor)}) rotate(${isHorizontal ? '0deg' : '90deg'})`,
                }}
              >
                {controlsImgUrl && (
                  <SvgImage
                    url={controlsImgUrl}
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={`${P}-arrow-img`}
                    style={controlsSizeStyle}
                  />
                )}
                {!controlsImgUrl && (
                  <ArrowIcon color={controlsColor} className={cn(`${P}-arrow-icon`, `${P}-arrow-img`)} />
                )}
              </button>
            </div>
          </>
        )}
        {isClickTrigger && (
          <div
            className={`${P}-click-overlay`}
            onClick={() => {
              if (sliderRef) {
                sliderRef.go('+1');
              }
            }}
          />
        )}
        {showClassicNav && (
          <div
            className={cn(`${P}-pagination`, {
              [`${P}-pagination-inside-bottom`]: isHorizontal,
              [`${P}-pagination-inside-left`]: !isHorizontal,
            })}
            style={isHorizontal
              ? { bottom: scaleNav(navSizeValues.inset) }
              : { left: scaleNav(navSizeValues.inset) }}
          >
            <div
              key={`${navSize}-${direction}`}
              className={cn(`${P}-pagination-inner`, {
                [`${P}-pagination-vertical`]: !isHorizontal,
                [`${P}-animate-dots`]: animateDots,
              })}
              style={{
                backgroundColor: navBackgroundColor,
                gap: scaleNav(navSizeValues.gapInactive - navSizeValues.activeDot + navSizeValues.dot),
                ...(isHorizontal
                  ? {
                      height: scaleNav(navSizeValues.activeDot + navSizeValues.paddingY * 2),
                      paddingTop: scaleNav(navSizeValues.paddingY),
                      paddingBottom: scaleNav(navSizeValues.paddingY),
                      paddingLeft: scaleNav(navSizeValues.paddingActive),
                      paddingRight: scaleNav(navSizeValues.paddingActive),
                    }
                  : {
                      width: scaleNav(navSizeValues.activeDot + navSizeValues.paddingY * 2),
                      paddingLeft: scaleNav(navSizeValues.paddingY),
                      paddingRight: scaleNav(navSizeValues.paddingY),
                      paddingTop: scaleNav(navSizeValues.paddingActive),
                      paddingBottom: scaleNav(navSizeValues.paddingActive),
                    }),
                borderRadius: scaleNav(navSizeValues.borderRadius),
                transform: `translate(${scalingValue(PAGINATION.offset.x, isEditor)}, ${scalingValue(PAGINATION.offset.y, isEditor)})`,
              }}
            >
              {items.map((_, index) => {
                const isActive = index === currentSlideIndex;
                const dotSize = isActive ? navSizeValues.activeDot : navSizeValues.dot;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (sliderRef) {
                        sliderRef.go(index);
                      }
                    }}
                    className={`${P}-pagination-item`}
                    style={{
                      width: scaleNav(navSizeValues.activeDot),
                    }}
                  >
                    <div
                      className={`${P}-dot`}
                      style={{
                        backgroundColor: isActive ? navPaginationColor : navColor,
                        width: scaleNav(dotSize),
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>
        {IMAGE_CAPTION.isActive && (
          <div className={`${P}-caption-block`}>
            <div
              data-controls={isEditMode ? 'captionMarginTop' : undefined}
              className={isEditMode ? `${P}-control` : undefined}
              style={{
                height: scalingValue(captionMarginTop, isEditor),
              }}
            />
            <div className={`${P}-caption-text-wrapper`}>
              {items.map((item, index) => (
                <div
                  key={index}
                  className={cn(`${P}-caption-text`, {
                    [`${P}-with-pointer-events`]: index === currentSlideIndex && isEditor,
                    [`${P}-active`]: index === currentSlideIndex,
                  })}
                  style={{
                    ...titleStyle,
                    width: TITLE_WIDTH_SETTINGS.sizing === 'auto' ? 'max-content' : scalingValue(TITLE_WIDTH_SETTINGS.width, isEditor),
                    transitionDuration: `${Math.round(parseInt(TRANSITION_DURATION) / 2)}ms`,
                  }}
                >
                  <div
                    className={`${P}-caption-text-inner`}
                    style={{
                      '--link-color': linkColor,
                      '--link-hover-color': linkColor,
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
      </div>
    </>
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
