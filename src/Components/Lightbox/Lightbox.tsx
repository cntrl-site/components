import React, { FC, useEffect, useRef, useCallback, useState, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import styles from './Lightbox.module.scss';
import { scalingValue } from '../utils/scalingValue';
import { getPositionStyles, type Alignment, type Offset } from '../utils/getPositionStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import cn from 'classnames';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { getDisplayedImageRect } from '../utils/getImageRect';
import { getColorAlpha } from '../utils/getColorAlpha';
import { getAnimationClasses } from './getAnimationClasses';

type LightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  content: LightboxImage[];
  settings: LightboxSettings;
  lightboxStyles: LightboxStyles;
  portalId: string;
  isEditor?: boolean;
};

type LightboxGalleryProps = {
  settings: LightboxSettings;
  content: LightboxImage[];
  styles: LightboxStyles;
  portalId: string;
  activeEvent: 'close' | 'open';
  isEditor?: boolean;
};

export const LightboxGallery = ({ settings, content, styles, portalId, activeEvent, isEditor }: LightboxGalleryProps) => {
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
      <Lightbox
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
        settings={settings}
        lightboxStyles={styles}
        portalId={portalId}
        isEditor={isEditor}
      />
    </>
  );
};

const Lightbox: FC<LightboxProps> = ({ isOpen, onClose, content, lightboxStyles, settings, portalId, isEditor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [splideKey, setSplideKey] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const lightboxRef = useRef<Splide | null>(null);
  const prevSliderTypeRef = useRef<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isClosingRef = useRef<boolean>(false);
  const animationTargetRef = useRef<HTMLDivElement | null>(null);
  const animationEndHandlerRef = useRef<((e: AnimationEvent) => void) | null>(null);
  const appearAnimationEndHandlerRef = useRef<((e: AnimationEvent) => void) | null>(null);
  const { appear, triggers, slider, thumbnail, controls, area, caption, layout } = settings.lightboxBlock;
  const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = lightboxStyles.caption;
  const { appearClass, backdropAppearClass, backdropDisappearClass, disappearClass } = getAnimationClasses(appear.type, appear.direction);

  useEffect(() => {
    const handleLayoutChange = () => {
      setTimeout(() => {
        lightboxRef.current?.splide?.refresh();
      }, 16);
    };
    window.addEventListener('ArticleEditor.Layout:change', handleLayoutChange);
    return () => {
      window.removeEventListener('ArticleEditor.Layout:change', handleLayoutChange);
    };
  }, []);

  const handleClose = useCallback(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const colorAlpha = getColorAlpha(area.color);
    if (isMobile && !isEditor && colorAlpha > 0.9) {
      document.body.style.backgroundColor = '';
    }
    setIsClosing(true);
    isClosingRef.current = true; 
    const handleAnimationEnd = (e: AnimationEvent) => {
      if (e.target === animationTargetRef.current && e.animationName) {
        if (animationTargetRef.current && animationEndHandlerRef.current) {
          animationTargetRef.current.removeEventListener('animationend', animationEndHandlerRef.current);
        }
        animationEndHandlerRef.current = null;
        onClose();
        setIsClosing(false);
      }
    };
    if (animationTargetRef.current) {
      animationEndHandlerRef.current = handleAnimationEnd;
      animationTargetRef.current.addEventListener('animationend', handleAnimationEnd);
    }
  }, [onClose, area.color, isEditor]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  const handleTriggerClick = (img: HTMLImageElement | null, clientX: number, clientY: number) => {
    if (!img) return;
    if (triggers.type === 'click' && triggers.switch === 'image') {
      if (triggers.repeat === 'close' && currentIndex === content.length - 1) {
        handleClose();
      } else {
        lightboxRef.current?.go('+1');
      }
    } else if (triggers.type === 'click' && triggers.switch === '50/50') {
      const rect = img.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;
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

  const handleImageWrapperClick = (e: MouseEvent | TouchEvent) => {
    const currentImage = content[currentIndex];
    const isCover = currentImage?.image.objectFit === 'cover';
    let clientX: number;
    let clientY: number;
    
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }
    let inside: boolean;
    if (isCover && imageRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      inside = clientX >= imgRect.left && clientX <= imgRect.right && clientY >= imgRect.top && clientY <= imgRect.bottom;
    } else {
      const rect = imageRef.current ? getDisplayedImageRect(imageRef.current) : null;
      if (!rect ) {
        if (e.target === e.currentTarget) handleClose();
        return;
      }
      inside = clientX >= rect.x && clientX <= rect.x + rect.width && clientY >= rect.y && clientY <= rect.y + rect.height;
    }
    if (inside) {
      handleTriggerClick(imageRef.current, clientX, clientY);
    } else {
      handleClose();
    }
  };

  const onImageClick = (e: MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    handleTriggerClick(e.currentTarget, e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }
      if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % Math.max(content.length, 1));
        lightboxRef.current?.go('+1');
        return;
      }
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + Math.max(content.length, 1)) % Math.max(content.length, 1));
        lightboxRef.current?.go('-1');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, handleClose, content.length]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      isClosingRef.current = false;
      setIsClosing(false);
    }
    return () => {
      if (animationTargetRef.current && animationEndHandlerRef.current) {
        animationTargetRef.current.removeEventListener('animationend', animationEndHandlerRef.current);
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
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const colorAlpha = getColorAlpha(area.color);
    document.body.style.overflow = "hidden";
    
    const handleAppearAnimationEnd = (e: AnimationEvent) => {
      if (e.target === animationTargetRef.current && !isClosingRef.current && e.animationName) {
        if (isMobile && !isEditor && colorAlpha > 0.9) {
          document.body.style.backgroundColor = area.color;
        }
        if (animationTargetRef.current && appearAnimationEndHandlerRef.current) {
          animationTargetRef.current.removeEventListener('animationend', appearAnimationEndHandlerRef.current);
        }
        appearAnimationEndHandlerRef.current = null;
      }
    };
    if (animationTargetRef.current && isMobile && !isEditor && colorAlpha > 0.9) {
      appearAnimationEndHandlerRef.current = handleAppearAnimationEnd;
      animationTargetRef.current.addEventListener('animationend', handleAppearAnimationEnd);
    }
    const preventScroll = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("touchmove", preventScroll);
      if (animationTargetRef.current && appearAnimationEndHandlerRef.current) {
        animationTargetRef.current.removeEventListener('animationend', appearAnimationEndHandlerRef.current);
        appearAnimationEndHandlerRef.current = null;
      }
    };
  }, [isOpen, isEditor]);

  useEffect(() => {
    if (!isOpen) return;
    const handleTouchEnd = (e: TouchEvent) => {
      if (isClosingRef.current) {
        e.stopPropagation();
        return;
      }
      if (e.touches.length === 0 && e.changedTouches.length > 0) {
        const currentImage = content[currentIndex];
        const isCover = currentImage?.image.objectFit === 'cover';
        const touch = e.changedTouches[0];
        let inside: boolean;
        if (isCover && imageRef.current) {
          const imgRect = imageRef.current.getBoundingClientRect();
          inside = touch.clientX >= imgRect.left && touch.clientX <= imgRect.right && touch.clientY >= imgRect.top && touch.clientY <= imgRect.bottom;
        } else {
          const rect = imageRef.current ? getDisplayedImageRect(imageRef.current) : null;
          if (!rect) return;
          inside = touch.clientX >= rect.x && touch.clientX <= rect.x + rect.width && touch.clientY >= rect.y && touch.clientY <= rect.y + rect.height;
        }
        if (!inside) {
          e.stopPropagation();
          isClosingRef.current = true;
          const blockNextClick = (clickEvent: PointerEvent) => {
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
  }, [isOpen, handleClose, currentIndex, content]);

  const backdropStyles = {
    backgroundColor: area.color,
    backdropFilter: `blur(${area.blur}px)`,
    animationDuration: `${parseInt(appear.duration)}ms`,
    animationTimingFunction: 'ease',
    animationFillMode: 'both'
  };
  
  if (!isOpen && !isClosing) return null;

  return createPortal(
    <>
      <div
        ref={!isEditor ? animationTargetRef : null}
        className={cn(styles.background, isClosing ? backdropDisappearClass : backdropAppearClass)} 
        style={isEditor ? { display: 'none' } : backdropStyles}
      />
      <div 
        ref={isEditor ? animationTargetRef : null}
        className={cn(styles.backdropStyle, {
          [styles.editor]: isEditor,
          [isClosing ? backdropDisappearClass : backdropAppearClass]: isEditor 
        })} 
        style={isEditor ? backdropStyles : { display: 'none' }}
        onClick={handleBackdropClick}
      />
        <div
          className={cn(styles.contentStyle, !isClosing ? appearClass : disappearClass, { [styles.editor]: isEditor })}
          style={{
            animationDuration: `${parseInt(appear.duration)}ms`,
            animationTimingFunction: 'ease',
            animationFillMode: 'both'
          }}
        >
          <Splide
            key={splideKey}
            onMove={(splide) => setCurrentIndex(splide.index)}
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
            style={{'--splide-speed': slider.duration} as React.CSSProperties}
          >
            {content.map((item, index) => {
              const positionStyles = getPositionStyles(layout.position, layout.offset, isEditor);
              const imageStyle = slider.type === 'scale' 
                ? (() => {
                    const { transform, ...restStyles } = positionStyles;
                    return {
                      ...restStyles,
                      '--position-transform': (transform as string) || 'none'
                    };
                  })()
                : positionStyles;

              return (
                <SplideSlide key={index}>
                  <div 
                    className={styles.imgWrapper} 
                    onClick={handleImageWrapperClick}
                    style={{padding: scalingValue(layout.padding.top, isEditor) + ' ' + scalingValue(layout.padding.right, isEditor) + ' ' + scalingValue(layout.padding.bottom, isEditor) + ' ' + scalingValue(layout.padding.left, isEditor)}}
                  >
                    <img
                      ref={index === currentIndex ? imageRef : null}
                      className={cn(styles.imageStyle, {
                        [styles.contain]: item.image.objectFit === 'contain',
                        [styles.cover]: item.image.objectFit === 'cover',
                        [styles.scaleSlide]: slider.type === 'scale'
                      })}
                      onClick={item.image.objectFit !== 'contain' ? onImageClick : undefined}
                      src={item.image.url}
                      alt={item.image.name ?? ''}
                      style={{
                        ...imageStyle,
                        ...(item.image.objectFit === 'contain' ? {
                          pointerEvents: 'none'
                        } : {})
                      }}
                    />
                  </div>
              </SplideSlide>
              );
            })}
          </Splide>
          {controls.isActive && controls.arrowsImgUrl && (
            <>
              <div 
                className={cn(styles.arrow, {[styles.arrowVertical]: slider.direction === 'vert' })}
                style={{color: controls.color,['--arrow-hover-color' as string]: controls.hover}}
              >
                <button
                  className={styles.arrowInner}
                  style={{ transform: `translate(${scalingValue(controls.offset.x, isEditor)}, ${scalingValue(controls.offset.y * (slider.direction === 'horiz' ? 1 : -1), isEditor)}) scale(${controls.scale}) rotate(${slider.direction === 'horiz' ? '0deg' : '90deg'})`}}
                  onClick={() => lightboxRef.current?.go('-1')}
                  aria-label='Previous'
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
                  style={{ transform: `translate(${scalingValue(controls.offset.x * (slider.direction === 'horiz' ? -1 : 1), isEditor)}, ${scalingValue(controls.offset.y, isEditor)}) scale(${controls.scale}) rotate(${slider.direction === 'horiz' ? '0deg' : '90deg'})`}}
                  onClick={() => lightboxRef.current?.go('+1')}
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
          {area.closeIconUrl && (() => {
            const positionStyles = getPositionStyles(area.closeIconAlign, area.closeIconOffset, isEditor);
            const scaleTransform = `scale(${area.closeIconScale})`;
            const combinedTransform = positionStyles.transform
              ? `${positionStyles.transform} ${scaleTransform}`
              : scaleTransform;
            return (
              <button
                className={styles.closeButton}
                style={{ ...positionStyles, transform: combinedTransform }}
                onClick={handleClose}
                aria-label='Close lightbox'
              >
                <SvgImage url={area.closeIconUrl} />
              </button>
            );
          })()}
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
                transitionDuration: `${Math.round(parseInt(slider.duration) / 2)}ms`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                data-styles="caption"
                className={styles.captionTextInner}
                style={{
                  '--link-hover-color': caption.hover,
                  position: 'relative',
                } as React.CSSProperties}
              >
                <RichTextRenderer content={content[currentIndex].imageCaption} />
              </div>
            </div>
          )}
          {thumbnail.isActive && (
            <div
              className={cn(styles.thumbsContainer, {
                [styles.thumbsContainerVertical]: slider.direction === 'vert',
                [styles.thumbsAlignStart]: thumbnail.align === 'start',
                [styles.thumbsAlignCenter]: thumbnail.align === 'center',
                [styles.thumbsAlignEnd]: thumbnail.align === 'end',
              })}
              style={{ 
                position: isEditor ? 'absolute' : 'fixed',
                gap: scalingValue(thumbnail.grid.gap, isEditor),
                ...getPositionStyles(thumbnail.position, thumbnail.offset, isEditor)
              }}
            >
              {content.map((item, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={`${item.image.name}-${index}`}
                    className={styles.thumbItem}
                    style={{
                      ...(slider.direction === 'horiz' ? { height: isActive ? scalingValue(thumbnail.grid.size * (isActive ? thumbnail.activeState.scale : 1), isEditor) : scalingValue(thumbnail.grid.size, isEditor) } : {}),
                      ...(slider.direction === 'vert' ? { width: isActive ? scalingValue(thumbnail.grid.size * (isActive ? thumbnail.activeState.scale : 1), isEditor) : scalingValue(thumbnail.grid.size, isEditor) } : {}),
                      ...(thumbnail.fit === 'cover' ? {
                        width: isActive ? scalingValue(thumbnail.grid.size * (isActive ? thumbnail.activeState.scale : 1), isEditor) : scalingValue(thumbnail.grid.size, isEditor),
                        height: isActive ? scalingValue(thumbnail.grid.size * (isActive ? thumbnail.activeState.scale : 1), isEditor) : scalingValue(thumbnail.grid.size, isEditor)
                      } : {}),
                      transition: isActive ? 'all 0.2s ease' : 'none',
                      opacity: isActive ? thumbnail.activeState.opacity / 100 : thumbnail.opacity / 100,
                      ['--thumb-hover' as string]: thumbnail.activeState.opacity / 100
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
        size: number;
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
