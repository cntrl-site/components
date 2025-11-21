import React, { FC, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Lightbox.module.scss';
import { scalingValue } from '../utils/scalingValue';
import { getPositionStyles, type Alignment, type Offset } from '../utils/getPositionStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import cn from 'classnames';
import '@splidejs/react-splide/css';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { getDisplayedImageRect } from '../utils/getImageRect';

type LightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  content: LightboxImage[];
  settings: LightboxSettings;
  styles: LightboxStyles;
  portalId: string;
  isEditor?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
};

type LightboxGalleryProps = {
  settings: LightboxSettings;
  content: LightboxImage[];
  styles: LightboxStyles;
  portalId: string;
  activeEvent: 'close' | 'open';
  isEditor?: boolean;
};

export function LightboxGallery({ settings, content, styles, portalId, activeEvent, isEditor }: LightboxGalleryProps) {
  const [open, setOpen] = React.useState(false);
  const { url } = settings.thumbnailBlock.cover;

  useEffect(() => {
    if (activeEvent === 'close') {
      setOpen(false);
    }
    if (activeEvent === 'open') {
      setOpen(true);
    }
  }, [activeEvent]);

  return (
    <>
      <img
        src={url}
        alt='Cover'
        style={{ width: '100%', height: '100%', cursor: 'pointer', objectFit: 'cover' }}
        onClick={() => setOpen(true)}
      />
      <Lightbox isOpen={open} onClose={() => setOpen(false)} content={content} settings={settings} styles={styles} portalId={portalId} isEditor={isEditor} />
    </>
  );
};

const Lightbox: FC<LightboxProps> = ({ isOpen, onClose, content, styles: lightboxStyles, settings,closeOnBackdropClick = true, closeOnEsc = true, portalId, isEditor }) => {
  const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = lightboxStyles.caption;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [splideKey, setSplideKey] = React.useState(0);
  const [isClosing, setIsClosing] = React.useState(false);
  const lightboxRef = useRef<Splide | null>(null);
  const prevSliderTypeRef = useRef<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isClosingRef = useRef<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const animationEndHandlerRef = useRef<((e: AnimationEvent) => void) | null>(null);
  const { appear, triggers, slider, thumbnail, controls, area, caption, layout } = settings.lightboxBlock;
  const appearDurationMs = appear.duration ? parseInt(appear.duration) : 300;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    isClosingRef.current = true;
    
    const handleAnimationEnd = (e: AnimationEvent) => {
      if (e.target === contentRef.current && e.animationName) {
        if (contentRef.current && animationEndHandlerRef.current) {
          contentRef.current.removeEventListener('animationend', animationEndHandlerRef.current);
        }
        animationEndHandlerRef.current = null;
        onClose();
        setIsClosing(false);
      }
    };
    
    if (contentRef.current) {
      animationEndHandlerRef.current = handleAnimationEnd;
      contentRef.current.addEventListener('animationend', handleAnimationEnd);
    }
  }, [onClose, appearDurationMs]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleImageWrapperClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    if (target === currentTarget) {
      handleClose();
      return;
    }
    const isImg = target.tagName === 'IMG' || target.closest('img');
    const isButton = target.tagName === 'BUTTON' || target.closest('button');
    const isSplide = target.closest('.splide') || target.closest('[class*="splide"]');
    const isCaption = target.closest(`.${styles.caption}`);
    const isThumbnail = target.closest(`.${styles.thumbsContainer}`);
    if (!isImg && !isButton && !isSplide && !isCaption && !isThumbnail) {
      handleClose();
    }
  };
  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (triggers.type === 'click' && triggers.switch === 'image') {
      // If on last image and repeat is 'close', close the lightbox
      if (triggers.repeat === 'close' && currentIndex === content.length - 1) {
        handleClose();
      } else {
        lightboxRef.current?.go('+1');
      }
    }
    if (triggers.type === 'click' && triggers.switch === '50/50') {      
      const img = e.currentTarget;
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const imgWidth = rect.width;
      const imgHeight = rect.height;
      let dir: '+1' | '-1';
      if (slider.direction === 'horiz') {
        dir = clickX < imgWidth / 2 ? '-1' : '+1';
      } else {
        dir = clickY < imgHeight / 2 ? '-1' : '+1';
      }
      lightboxRef.current?.go(dir);
    }
  };

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }
      if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % Math.max(content.length, 1));
        return;
      }
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + Math.max(content.length, 1)) % Math.max(content.length, 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeOnEsc, handleClose, content.length]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      isClosingRef.current = false;
      setIsClosing(false);
    }
    
    return () => {
      // Cleanup animationend listener on unmount
      if (contentRef.current && animationEndHandlerRef.current) {
        contentRef.current.removeEventListener('animationend', animationEndHandlerRef.current);
        animationEndHandlerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (prevSliderTypeRef.current !== null && prevSliderTypeRef.current !== slider.type) {
      setSplideKey(prev => prev + 1);
    }
    prevSliderTypeRef.current = slider.type;
  }, [slider.type]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile && !isEditor) {
      document.body.style.backgroundColor = area.color;
    }
    const preventScroll = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
  
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("touchmove", preventScroll);
      if (isMobile && !isEditor) {
        document.body.style.backgroundColor = '';
      }
    };
  }, [isOpen]);
  
  const handleArrowClick = (dir: '+1' | '-1') => {
    lightboxRef.current?.go(dir);
  };

  const backdropDurationMs = (appear.type === 'fade in' || appear.type === 'mix') 
    ? Math.floor(appearDurationMs * 0.7) 
    : appearDurationMs;
  const appearClass = (() => {
    if (appear.type === 'fade in') return styles.fadeIn;
    if (appear.type === 'slide in' || appear.type === 'mix') {
      switch (appear.direction) {
        case 'left':
          return styles.slideInLeft;
        case 'right':
          return styles.slideInRight;
        case 'top':
          return styles.slideInTop;
        case 'bottom':
          return styles.slideInBottom;
        default:
          return styles.slideInRight;
      }
    }
    return styles.fadeIn;
  })();

  const backdropAppearClass = (() => {
    if (appear.type === 'fade in' || appear.type === 'mix') return styles.fadeIn;
    if (appear.type === 'slide in') {
      switch (appear.direction) {
        case 'left':
          return styles.slideInLeft;
        case 'right':
          return styles.slideInRight;
        case 'top':
          return styles.slideInTop;
        case 'bottom':
          return styles.slideInBottom;
        default:
          return styles.slideInRight;
      }
    }
    return styles.fadeIn;
  })();

  const backdropDisappearClass = (() => {
    if (appear.type === 'fade in' || appear.type === 'mix') return styles.fadeOut;
    if (appear.type === 'slide in') {
      switch (appear.direction) {
        case 'left':
          return styles.slideOutLeft;
        case 'right':
          return styles.slideOutRight;
        case 'top':
          return styles.slideOutTop;
        case 'bottom':
          return styles.slideOutBottom;
        default:
          return styles.slideOutRight;
      }
    }
    return styles.fadeOut;
  })();

  const disappearClass = (() => {
    if (appear.type === 'fade in') return styles.fadeOut;
    if (appear.type === 'slide in' || appear.type === 'mix') {
      switch (appear.direction) {
        case 'left':
          return styles.slideOutLeft;
        case 'right':
          return styles.slideOutRight;
        case 'top':
          return styles.slideOutTop;
        case 'bottom':
          return styles.slideOutBottom;
        default:
          return styles.slideOutRight;
      }
    }
    return styles.fadeOut;
  })();

  useEffect(() => {
    if (!isOpen || !closeOnBackdropClick) return;
    const handleTouchEnd = (e: TouchEvent) => {
      if (isClosingRef.current) {
        e.stopPropagation();
        return;
      }
      if (e.touches.length === 0 && e.changedTouches.length > 0) {
        const rect = imageRef.current ? getDisplayedImageRect(imageRef.current) : null;
        if (!rect) return;
        const touch = e.changedTouches[0];
        const inside =
          touch.clientX >= rect.x &&
          touch.clientX <= rect.x + rect.width &&
          touch.clientY >= rect.y &&
          touch.clientY <= rect.y + rect.height;
  
        if (!inside) {
          e.stopPropagation();
          isClosingRef.current = true;
          const blockNextClick = (clickEvent: MouseEvent) => {
            clickEvent.stopPropagation();
            clickEvent.preventDefault();
            document.removeEventListener("click", blockNextClick, true);
          };
          document.addEventListener("click", blockNextClick, true);
          handleClose();
        }
      }
    };
  
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
  
    return () => {
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, closeOnBackdropClick, handleClose, currentIndex]);
  
  if (!isOpen && !isClosing) return null;

  return createPortal(
    <>
      <div
        className={cn(styles.background, isClosing ? backdropDisappearClass : backdropAppearClass)} 
        style={{
          ...(isEditor && { display: 'none' }),
          backgroundColor: area.color,
          backdropFilter: `blur(${area.blur}px)`,
          animationDuration: `${appearDurationMs}ms`,
          animationTimingFunction: 'ease',
          animationFillMode: 'both' as unknown as undefined
        }}
      />
      <div 
        className={cn(styles.backdropStyle, { [styles.editor]: isEditor, [isClosing ? backdropDisappearClass : backdropAppearClass]: isEditor })} 
        style={{...(isEditor && {
          backgroundColor: area.color,
          backdropFilter: `blur(${area.blur}px)`,
          animationDuration: `${appearDurationMs}ms`,
          animationTimingFunction: 'ease',
          animationFillMode: 'both' as unknown as undefined
        })}}
        onClick={handleBackdropClick}
        onTouchEnd={handleBackdropClick}
        onTouchStart={handleBackdropClick}
        >
        <div
          ref={contentRef}
          className={cn(styles.contentStyle, isClosing ? disappearClass : appearClass)}
          onClick={handleContentClick}
          style={{
            animationDuration: `${appearDurationMs}ms`,
            animationTimingFunction: 'ease',
            animationFillMode: 'both',
            ...(appear.type === 'mix' && !isClosing && { animationDelay: `${backdropDurationMs/2}ms` }),
            ...(appear.type === 'mix' && isClosing && { animationDelay: '0ms' }),
            '--splide-speed': slider.duration || '500ms'
          } as React.CSSProperties}
        >
          <Splide
            key={splideKey}
            onMove={(splide) => { setCurrentIndex(splide.index); }}
            ref={lightboxRef}
            className={styles.lightboxSplide}
            options={{
              arrows: false,
              speed: slider.duration ? parseInt(slider.duration) : 500,
              direction: slider.direction === 'horiz' || slider.type === 'fade' || slider.type === 'scale' ? 'ltr' : 'ttb',
              pagination: false,
              drag: triggers.type === 'drag',
              perPage: 1,
              width: '100%',
              height: '100%',
              type: slider.type === 'fade' || slider.type === 'scale' ? 'fade' : 'loop',
              padding: 0,
              rewind: (slider.type === 'scale' || slider.type === 'fade') && triggers.repeat === 'loop'
            }}
            style={{'--splide-speed': slider.duration || '500ms'} as React.CSSProperties}
          >
            {content.map((item, index) => {
              const positionStyles = getPositionStyles(layout.position, layout.offset, isEditor);
              const imageStyle: React.CSSProperties = slider.type === 'scale' 
                ? (() => {
                    const { transform, ...restStyles } = positionStyles;
                    return {
                      ...restStyles,
                      '--position-transform': (transform as string) || 'none'
                    } as React.CSSProperties;
                  })()
                : positionStyles;

              return (
                <SplideSlide key={index}>
                  <div 
                    className={styles.imgWrapper} 
                    onClick={handleImageWrapperClick}
                    style={{ padding: scalingValue(layout.padding.top, isEditor) + ' ' + scalingValue(layout.padding.right, isEditor) + ' ' + scalingValue(layout.padding.bottom, isEditor) + ' ' + scalingValue(layout.padding.left, isEditor)}}
                  >
                    <img
                      ref={imageRef}
                      className={cn(styles.imageStyle, {
                        [styles.contain]: item.image.objectFit === 'contain',
                        [styles.cover]: item.image.objectFit === 'cover',
                        [styles.scaleSlide]: slider.type === 'scale'
                      })}
                      src={item.image.url}
                      alt={item.image.name ?? ''}
                      onClick={onImageClick}
                      style={imageStyle}
                    />
                  </div>
              </SplideSlide>
              );
            })}
          </Splide>
          {/* Controls */}
          {controls.isActive && controls.arrowsImgUrl && (
            <>
              <div 
                className={cn(styles.arrow, {[styles.arrowVertical]: slider.direction === 'vert' })}
                style={{color: controls.color,['--arrow-hover-color' as string]: controls.hover}}
              >
                <button
                    className={styles.arrowInner}
                    style={{
                      transform: `translate(${scalingValue(controls.offset.x, isEditor)}, ${scalingValue(controls.offset.y * (slider.direction === 'horiz' ? 1 : -1), isEditor)}) scale(${controls.scale}) rotate(${slider.direction === 'horiz' ? '0deg' : '90deg'})`,
                    }}
                  onClick={(e) => { handleArrowClick('-1'); }}
                  >
                    {controls.arrowsImgUrl && (
                      <SvgImage
                        url={controls.arrowsImgUrl}
                        fill={controls.color}
                        hoverFill={controls.hover}
                        className={cn(styles.arrowImg, styles.mirror)}
                      />
                    )}
                  </button>
              </div>
              <div
                className={cn(styles.arrow, styles.nextArrow, {[styles.arrowVertical]: slider.direction === 'vert'})}
                style={{color: controls.color,['--arrow-hover-color' as string]: controls.hover}}
              >              
                <button
                  className={styles.arrowInner}
                  style={{
                    transform: `translate(${scalingValue(controls.offset.x * (slider.direction === 'horiz' ? -1 : 1), isEditor)}, ${scalingValue(controls.offset.y, isEditor)}) scale(${controls.scale}) rotate(${slider.direction === 'horiz' ? '0deg' : '90deg'})`,
                  }}
                  onClick={(e) => { handleArrowClick('+1');}}
                  aria-label='Next'
                >
                  {controls.arrowsImgUrl && (
                    <SvgImage
                      url={controls.arrowsImgUrl}
                      fill={controls.color}
                      hoverFill={controls.hover}
                      className={styles.arrowImg}
                    />
                  )}
                </button>
              </div>
            </>
          )}
          {/* Close button */}
          {area.closeIconUrl && (() => {
            const positionStyles = getPositionStyles(area.closeIconAlign, area.closeIconOffset, isEditor);
            const scaleTransform = `scale(${area.closeIconScale})`;
            const combinedTransform = positionStyles.transform
              ? `${positionStyles.transform} ${scaleTransform}`
              : scaleTransform;
            
            return (
              <button
                className={styles.closeButton}
                style={{
                  ...positionStyles,
                  transform: combinedTransform
                }}
                onClick={handleClose}
              >
                <SvgImage url={area.closeIconUrl} />
              </button>
            );
          })()}
          {/* Caption */}
          {caption.isActive && (
            <div 
              className={styles.caption} 
              style={{
                ...getPositionStyles(caption.alignment, caption.offset, isEditor),
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
                transitionDuration: slider.duration ? `${Math.round(parseInt(slider.duration) / 2)}ms` : '500ms',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                data-styles="caption"
                className={styles.captionTextInner}
                style={{
                  position: 'relative',
                }}
              >
                <RichTextRenderer content={content[currentIndex].imageCaption} />
              </div>
            </div>
          )}
          {/* Thumbnails */}
          {thumbnail.isActive && (
            <div
              className={cn(
                styles.thumbsContainer, 
                {
                  [styles.thumbsContainerVertical]: slider.direction === 'vert',
                  [styles.thumbsAlignStart]: thumbnail.align === 'start',
                  [styles.thumbsAlignCenter]: thumbnail.align === 'center',
                  [styles.thumbsAlignEnd]: thumbnail.align === 'end',
                }
              )}
              style={{
                gap: `${scalingValue(thumbnail.grid.gap, isEditor)}`,
                ...getPositionStyles(thumbnail.position, thumbnail.offset, isEditor),
              }}
            >
              {content.map((item, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={`${item.image.url}-${index}`}
                    className={styles.thumbItem}
                    style={{
                      ...(slider.direction === 'horiz' ? { height: isActive ? `${scalingValue(thumbnail.grid.height * (isActive ? thumbnail.activeState.scale : 1), isEditor)}` : `${scalingValue(thumbnail.grid.height, isEditor)}` } : {}),
                      ...(slider.direction === 'vert' ? { width: isActive ? `${scalingValue(thumbnail.grid.width * (isActive ? thumbnail.activeState.scale : 1), isEditor)}` : `${scalingValue(thumbnail.grid.width, isEditor)}` } : {}), 
                      ...(thumbnail.fit === 'cover' && slider.direction === 'horiz' ? { width: isActive ? `${scalingValue(thumbnail.grid.width * (isActive ? thumbnail.activeState.scale : 1), isEditor)}` : `${scalingValue(thumbnail.grid.width, isEditor)}` } : {}),
                      ...(thumbnail.fit === 'cover' && slider.direction === 'vert' ? { height: isActive ? `${scalingValue(thumbnail.grid.height * (isActive ? thumbnail.activeState.scale : 1), isEditor)}` : `${scalingValue(thumbnail.grid.height, isEditor)}` } : {}),
                      transition: isActive ? 'all 0.2s ease' : 'none',
                      opacity: isActive ? thumbnail.activeState.opacity / 100 : thumbnail.opacity / 100,
                      ['--thumb-hover' as string]: thumbnail.activeState.opacity / 100,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                      lightboxRef.current?.go(index);
                    }}
                    onMouseEnter={() => {
                      if (thumbnail.triggers === 'hov') {
                        lightboxRef.current?.go(index);
                      }
                    }}
                  >
                    <img
                      src={item.image.url}
                      alt={item.image.name ?? ''}
                      style={{
                        objectFit: thumbnail.fit === 'cover' ? 'cover' : 'contain',
                        ...(thumbnail.fit === 'fit' ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' } : {}),
                        ...(thumbnail.fit === 'cover' && slider.direction === 'horiz' ? { width: '100%', height: '100%' } : {}),
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>,
    document.getElementById(portalId)!
  );
};

type LightboxImage = {
  image: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  imageCaption: any[];
};

type LightboxControls = {
  arrowsImgUrl: string | null;
  isActive: boolean;
  color: string;
  hover: string;
  offset: Offset;
  scale: number;
};

type Caption = {
  isActive: boolean;
  alignment: Alignment;
  offset: Offset;
  hover: string;
};

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type Triggers = {
  type: 'click' | 'drag';
  switch: 'image' | '50/50';
  repeat: 'close' | 'loop';
};

type LightboxSettings = {
  thumbnailBlock: {
    cover: {
      url: string;
    }
  },
  lightboxBlock: {
    appear: {
      type: 'slide in' | 'fade in' | 'mix';
      duration: string;
      direction: 'top' | 'bottom' | 'left' | 'right';
    };
    triggers: Triggers;
    slider: {
      type: 'slide' | 'fade' | 'scale';
      direction: 'horiz' | 'vert';
      duration: string;
    };
    thumbnail: {
      isActive: boolean;
      position: Alignment;
      fit: 'cover' | 'fit';
      align: 'start' | 'center' | 'end';
      triggers: 'clk' | 'hov';
      grid: {
        height: number;
        width: number;
        gap: number;
      };
      offset: Offset;
      opacity: number;
      activeState: {
        scale: number;
        opacity: number;
      }
    }
    layout: {
      position: Alignment;
      offset: Offset;
      padding: Padding;
    }
    controls: LightboxControls;
    area: {
      padding: Padding;
      color: string;
      blur: number;
      closeIconUrl: string | null;
      closeIconAlign: Alignment;
      closeIconOffset: Offset;
      closeIconScale: number;
    },
    caption: Caption;
  }
};

type LightboxStyles = {
  caption: CaptionStyles;
}

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