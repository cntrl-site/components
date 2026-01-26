import React, { FC, useEffect, useRef, useCallback, useState, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import classes from './Lightbox.module.scss';
import { scalingValue } from '../utils/scalingValue';
import { getPositionStyles, type Alignment, type Offset } from '../utils/getPositionStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import cn from 'classnames';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { getDisplayedImageRect, getPaddedContainerBounds } from '../utils/getImageRect';
import { getColorAlpha } from '../utils/getColorAlpha';
import { getAnimationClasses } from './getAnimationClasses';
import { CommonComponentProps } from '../props';

type LightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  content: LightboxImage[];
  settings: LightboxSettings;
  lightboxStyles: LightboxStyles;
  portalId: string;
  isEditor?: boolean;
} & CommonComponentProps;

type LightboxGalleryProps = {
  settings: LightboxSettings;
  content: LightboxImage[];
  styles: LightboxStyles;
  portalId: string;
  activeEvent: 'close' | 'open';
  isEditor?: boolean;
};

export const LightboxGallery = ({ settings, content, styles, portalId, activeEvent, isEditor }: LightboxGalleryProps) => {
  const [open, setOpen] = useState(false);
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
        className={classes.heroImage}
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

const Lightbox: FC<LightboxProps> = ({ isOpen, onClose, content, lightboxStyles, settings, portalId, isEditor, metadata }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [splideKey, setSplideKey] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [thumbnailDimensions, setThumbnailDimensions] = useState<Record<number, { width: number; height: number }>>({});
  const lightboxRef = useRef<Splide | null>(null);
  const prevSliderTypeRef = useRef<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isClosingRef = useRef<boolean>(false);
  const animationTargetRef = useRef<HTMLDivElement | null>(null);
  const animationEndHandlerRef = useRef<((e: AnimationEvent) => void) | null>(null);
  const appearAnimationEndHandlerRef = useRef<((e: AnimationEvent) => void) | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef<boolean>(false);
  const { appear, triggers, slider, thumbnail, controls, area, imageCaption, layout } = settings.lightboxBlock;
  const { appearClass, backdropAppearClass, backdropDisappearClass, disappearClass } = getAnimationClasses(appear.type, appear.direction);
  const itemId = metadata?.itemId ?? null;

  useEffect(() => {
    const handleLayoutChange = () => {
      setTimeout(() => {
        lightboxRef.current?.splide?.refresh();
      }, 16);
    };
    const handleComponentContentChange = () => {
      setSplideKey(prev => prev + 1);
    };
    window.addEventListener('ArticleEditor.Layout:change', handleLayoutChange);
    window.addEventListener('ArticleEditor.ComponentContent:change', handleComponentContentChange);
    return () => {
      window.removeEventListener('ArticleEditor.Layout:change', handleLayoutChange);
      window.removeEventListener('ArticleEditor.ComponentContent:change', handleComponentContentChange);
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
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
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
      const bounds = getPaddedContainerBounds(imageRef.current);
      inside = clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom;
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

  const handleThumbWrapperClick = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains(classes.thumbsWrapper) || target.classList.contains(classes.thumbsContainer)) {
      handleImageWrapperClick(e as MouseEvent);
    }
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
      setSplideKey(prev => prev + 1);
      isClosingRef.current = false;
      setIsClosing(false);
      setAnimationFinished(false);
      setThumbnailDimensions({});
      if (!itemId) return;
      const event = new CustomEvent('page-overlay', { detail: { itemId } });
      window.dispatchEvent(event);
    }
    return () => {
      if (animationTargetRef.current && animationEndHandlerRef.current) {
        animationTargetRef.current.removeEventListener('animationend', animationEndHandlerRef.current);
        animationEndHandlerRef.current = null;
      }
      setAnimationFinished(false);
    };
  }, [isOpen, itemId]);

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
    setAnimationFinished(false);
    
    const handleAppearAnimationEnd = (e: AnimationEvent) => {
      if (e.target === animationTargetRef.current && !isClosingRef.current && e.animationName) {
        if (isMobile && !isEditor && colorAlpha > 0.9) {
          document.body.style.backgroundColor = area.color;
        }
        setAnimationFinished(true);
        if (animationTargetRef.current && appearAnimationEndHandlerRef.current) {
          animationTargetRef.current.removeEventListener('animationend', appearAnimationEndHandlerRef.current);
        }
        appearAnimationEndHandlerRef.current = null;
      }
    };
    if (animationTargetRef.current) {
      appearAnimationEndHandlerRef.current = handleAppearAnimationEnd;
      animationTargetRef.current.addEventListener('animationend', handleAppearAnimationEnd);
    }
    const preventScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.closest(`.${classes.thumbsWrapper}`) || target.closest(`.${classes.thumbsContainer}`))) {
        return;
      }
      // Don't prevent default when slider type is slide - let Splide handle drag natively
      // Splide supports vertical looping with drag when direction is 'ttb' and type is 'loop'
      if (slider.type === 'slide') {
        return;
      }
      e.preventDefault();
    };
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("touchmove", preventScroll);
      if (animationTargetRef.current && appearAnimationEndHandlerRef.current) {
        animationTargetRef.current.removeEventListener('animationend', appearAnimationEndHandlerRef.current);
        appearAnimationEndHandlerRef.current = null;
      }
      setAnimationFinished(false);
    };
  }, [isOpen, isEditor, area.color, slider.type]);

  useEffect(() => {
    if (!isOpen) return;
    const handleTouchEnd = (e: TouchEvent) => {
      if (isClosingRef.current) {
        e.stopPropagation();
        return;
      }
      if (hasDraggedRef.current) {
        hasDraggedRef.current = false;
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && (target.closest(`.${classes.thumbsContainer}`) || target.closest(`.${classes.thumbItem}`))) {
        return;
      }
      // Don't close if touch is within Splide container when slide type with drag is enabled
      // Splide handles drag natively, so we shouldn't interfere
      if (slider.type === 'slide' && triggers.type === 'drag' && lightboxRef.current?.splide?.root) {
        const splideContainer = lightboxRef.current.splide.root as HTMLElement;
        if (target && (splideContainer.contains(target) || splideContainer === target)) {
          return;
        }
      }
      if (e.touches.length === 0 && e.changedTouches.length > 0) {
        const currentImage = content[currentIndex];
        const isCover = currentImage?.image.objectFit === 'cover';
        const touch = e.changedTouches[0];
        let inside: boolean;
        if (isCover && imageRef.current) {
          const bounds = getPaddedContainerBounds(imageRef.current);
          inside = touch.clientX >= bounds.left && touch.clientX <= bounds.right && touch.clientY >= bounds.top && touch.clientY <= bounds.bottom;
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

  // Custom vertical drag handling for (scale || fade) + vert + drag configuration
  // Splide's fade type doesn't support vertical direction, so we need custom drag handling
  // open issue: https://github.com/Splidejs/splide/issues/1095
  const needsCustomVerticalDrag = (slider.type === 'scale' || slider.type === 'fade') && slider.direction === 'vert' && triggers.type === 'drag';
  
  useEffect(() => {
    if (!isOpen || !needsCustomVerticalDrag || !lightboxRef.current?.splide?.root) return;
    const container = lightboxRef.current.splide.root as HTMLDivElement;
    const DRAG_THRESHOLD = 30;
    
    const handleMove = (clientX: number, clientY: number) => {
      if (dragStartRef.current) {
        const deltaX = Math.abs(clientX - dragStartRef.current.x);
        const deltaY = Math.abs(clientY - dragStartRef.current.y);
        if (deltaX > 0 || deltaY > 0) {
          hasDraggedRef.current = true;
        }
      }
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (dragStartRef.current) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (dragStartRef.current && e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleUp = (clientX: number, clientY: number) => {
      if (!dragStartRef.current || !lightboxRef.current) {
        dragStartRef.current = null;
        return;
      }
      const deltaX = Math.abs(clientX - dragStartRef.current.x);
      const deltaY = Math.abs(clientY - dragStartRef.current.y);
      if (deltaY > DRAG_THRESHOLD && deltaY > deltaX) {
        lightboxRef.current.go(clientY < dragStartRef.current.y ? '+1' : '-1');
      }
      dragStartRef.current = null;
    };
    
    const handlePointerUp = (e: PointerEvent) => {
      if (dragStartRef.current) {
        handleUp(e.clientX, e.clientY);
      }
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!dragStartRef.current) {
        return;
      }
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        handleUp(touch.clientX, touch.clientY);
      }
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
    
    const handlePointerDown = (e: PointerEvent) => {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      hasDraggedRef.current = false;
      document.addEventListener('pointermove', handlePointerMove, { passive: false });
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        hasDraggedRef.current = false;
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);
      }
    };
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('touchstart', handleTouchStart);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      dragStartRef.current = null;
      hasDraggedRef.current = false;
    };
  }, [isOpen, needsCustomVerticalDrag, splideKey]);

  const backdropStyles = {
    backgroundColor: area.color,
    backdropFilter: `blur(${area.blur}px)`,
    animationDuration: `${parseInt(appear.duration)}ms`,
    animationTimingFunction: 'ease',
    animationFillMode: 'both'
  };
  
  if (!document.getElementById(portalId)) return null;

  return createPortal(
    <>
      <div
        ref={!isEditor ? animationTargetRef : null}
        className={cn(classes.background, isClosing ? backdropDisappearClass : backdropAppearClass, { [classes.editor]: isEditor }, { [classes.hidden]: !isOpen })} 
        style={{
          ...backdropStyles,
          ...(animationFinished && !isEditor && !isClosing ? { position: 'absolute' } : {})
        }}
      />
      <div
        ref={isEditor ? animationTargetRef : null}
        className={cn(classes.contentStyle, !isClosing ? appearClass : disappearClass, { [classes.editor]: isEditor }, { [classes.hidden]: !isOpen })}
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
          className={classes.lightboxSplide}
          options={{
            arrows: false,
            speed: slider.duration ? parseInt(slider.duration) : 500,
            direction: (() => {
              const isHoriz = slider.direction === 'horiz';
              // Scale and fade types always use 'ltr' because Splide doesn't support vertical direction for fade and scale types
              return isHoriz || slider.type === 'fade' || slider.type === 'scale' ? 'ltr' : 'ttb';
            })(),
            pagination: false,
            // Disable Splide's drag when we need custom vertical drag handling
            drag: triggers.type === 'drag' && !needsCustomVerticalDrag,
            perPage: 1,
            width: '100%',
            height: '100%',
            type: slider.type === 'fade' || slider.type === 'scale' ? 'fade' : 'loop',
            padding: 0,
            rewind: triggers.repeat !== 'close',
            start: 0
          }}
          style={{'--splide-speed': slider.duration} as React.CSSProperties}
        >
          {content.map((item, index) => {
            const positionStyles = getPositionStyles(layout.position, layout.offset, isEditor);
            const padding = `${scalingValue(layout.padding.top, isEditor)} ${scalingValue(layout.padding.right, isEditor)} ${scalingValue(layout.padding.bottom, isEditor)} ${scalingValue(layout.padding.left, isEditor)}`;
            const imageStyle = slider.type === 'scale' 
              ? (() => {
                  const { transform, ...restStyles } = positionStyles;
                  return {
                    ...restStyles,
                    position: 'absolute',
                    padding,
                    boxSizing: 'border-box',
                    '--position-transform': (transform as string) || 'none'
                  };
                })()
              : { ...positionStyles, position: 'absolute', padding, boxSizing: 'border-box' };
            return (
              <SplideSlide key={index}>
                <div className={classes.imgWrapper} onClick={handleImageWrapperClick}>
                  <img
                    ref={index === currentIndex ? imageRef : null}
                    className={cn(classes.imageStyle, {
                      [classes.contain]: item.image.objectFit === 'contain',
                      [classes.cover]: item.image.objectFit === 'cover',
                      [classes.scaleSlide]: slider.type === 'scale'
                    })}
                    src={item.image.url}
                    alt={item.image.name ?? ''}
                    style={{...imageStyle, pointerEvents: item.image.objectFit === 'contain' ? 'none' : 'auto' } as React.CSSProperties}
                  />
                </div>
            </SplideSlide>
            );
          })}
        </Splide>
        {controls.isActive && (
          <>
            <div 
              className={cn(classes.arrow, {[classes.arrowVertical]: slider.direction === 'vert' })}
              style={{color: controls.color,['--arrow-hover-color' as string]: controls.hover}}
            >
              <button
                className={classes.arrowInner}
                style={{ transform: `translate(${scalingValue(controls.offset.x, isEditor)}, ${scalingValue(controls.offset.y * (slider.direction === 'horiz' ? 1 : -1), isEditor)}) scale(${controls.scale}) rotate(${slider.direction === 'horiz' ? '0deg' : '90deg'})`}}
                onClick={() => lightboxRef.current?.go('-1')}
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
              className={cn(classes.arrow, classes.nextArrow, {[classes.arrowVertical]: slider.direction === 'vert'})}
              style={{color: controls.color,['--arrow-hover-color' as string]: controls.hover}}
            >              
              <button
                className={classes.arrowInner}
                style={{ transform: `translate(${scalingValue(controls.offset.x * (slider.direction === 'horiz' ? -1 : 1), isEditor)}, ${scalingValue(controls.offset.y, isEditor)}) scale(${controls.scale}) rotate(${slider.direction === 'horiz' ? '0deg' : '90deg'})`}}
                onClick={() => lightboxRef.current?.go('+1')}
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
        {area.closeIconUrl && (() => {
          const positionStyles = getPositionStyles(area.closeIconAlign, area.closeIconOffset, isEditor);
          const scaleTransform = `scale(${area.closeIconScale})`;
          const combinedTransform = positionStyles.transform
            ? `${positionStyles.transform} ${scaleTransform}`
            : scaleTransform;
          return (
            <button className={classes.closeButton} style={{ ...positionStyles, transform: combinedTransform }} onClick={handleClose} aria-label='Close lightbox'>
              <SvgImage url={area.closeIconUrl} fill={area.closeIconColor ?? '#000000'} hoverFill={area.closeIconHover ?? '#cccccc'} />
            </button>
          );
        })()}
        {imageCaption && imageCaption.isActive && lightboxStyles.imageCaption && content[currentIndex]?.imageCaption && (() => {
          const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = lightboxStyles.imageCaption;
          return (
            <div 
              className={classes.caption} 
              style={{
                ...getPositionStyles(imageCaption.alignment, imageCaption.offset, isEditor),
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
                color
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                data-styles="caption"
                className={classes.captionTextInner}
                style={{['--link-hover-color' as string]: imageCaption.hover}}
              >
                <RichTextRenderer content={content[currentIndex].imageCaption} />
              </div>
            </div>
          );
        })()}
        {thumbnail.isActive && (() => {
          const [vertical, horizontal] = thumbnail.position.split('-');
          const effectivePosition: Alignment =
            slider.direction === 'horiz'
              ? (`${vertical}-left` as Alignment)
              : thumbnail.position;
          const thumbsPositionStyles = getPositionStyles(effectivePosition, thumbnail.offset, isEditor);
          const getJustifyContent = () => {
            if (slider.direction === 'horiz') {
              if (horizontal === 'left') return 'flex-start';
              if (horizontal === 'center') return 'center';
              if (horizontal === 'right') return 'flex-end';
            } else {
              if (vertical === 'top') return 'flex-start';
              if (vertical === 'middle') return 'center';
              if (vertical === 'bottom') return 'flex-end';
            }
            return 'flex-start';
          };

          return (
            <div
              className={classes.thumbsWrapper}
              onClick={(e) => handleThumbWrapperClick(e)}
              style={{
                position: isEditor ? 'absolute' : 'fixed',
                ...thumbsPositionStyles,
                ...(slider.direction === 'horiz'
                  ? {
                      maxWidth: '100vw',
                      width: '100%',
                      overflowX: 'auto',
                      overflowY: 'hidden'
                    }
                  : {
                      maxHeight: '100vh',
                      overflowY: 'auto',
                      overflowX: 'hidden'
                    })
              }}
            >
            <div
              className={cn(classes.thumbsContainer, {
                [classes.thumbsContainerVertical]: slider.direction === 'vert',
                [classes.thumbsAlignStart]: thumbnail.align === 'start',
                [classes.thumbsAlignCenter]: thumbnail.align === 'center',
                [classes.thumbsAlignEnd]: thumbnail.align === 'end',
              })}
              style={{ 
                gap: scalingValue(thumbnail.grid.gap, isEditor),
                justifyContent: getJustifyContent()
              }}
            >
            {content.map((item, index) => {
              const isActive = index === currentIndex;
              const thumbDims = thumbnailDimensions[index];
              const baseSizeValue = thumbnail.grid.size;
              const activeSizeValue = baseSizeValue * (isActive ? thumbnail.activeState.scale : 1);
              const getFitDimensions = () => {
                if (thumbnail.fit !== 'fit') return {};
                if (!thumbDims) {
                  if (slider.direction === 'horiz') {
                    return { height: scalingValue(activeSizeValue, isEditor) };
                  } else {
                    return { width: scalingValue(activeSizeValue, isEditor) };
                  }
                }
                const aspectRatio = thumbDims.width / thumbDims.height;
                if (slider.direction === 'horiz') {
                  const heightValue = activeSizeValue;
                  const widthValue = heightValue * aspectRatio;
                  return { 
                    width: scalingValue(widthValue, isEditor), 
                    height: scalingValue(heightValue, isEditor) 
                  };
                } else {
                  const widthValue = activeSizeValue;
                  const heightValue = widthValue / aspectRatio;
                  return { 
                    width: scalingValue(widthValue, isEditor), 
                    height: scalingValue(heightValue, isEditor) 
                  };
                }
              };

              return (
                <button
                  key={`${item.image.name}-${index}`}
                  className={classes.thumbItem}
                  style={{
                    ...(slider.direction === 'horiz' && thumbnail.fit !== 'fit' ? { height: scalingValue(activeSizeValue, isEditor) } : {}),
                    ...(slider.direction === 'vert' && thumbnail.fit !== 'fit' ? { width: scalingValue(activeSizeValue, isEditor) } : {}),
                    ...(thumbnail.fit === 'cover' ? {width: scalingValue(activeSizeValue, isEditor),height: scalingValue(activeSizeValue, isEditor)} : {}),
                    ...getFitDimensions(),
                    transition: isActive ? 'all 0.25s ease-out' : 'none',
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
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalWidth && img.naturalHeight) {
                        setThumbnailDimensions(prev => ({...prev,[index]: { width: img.naturalWidth, height: img.naturalHeight }
                        }));
                      }
                    }}
                    style={{
                      objectFit: thumbnail.fit === 'cover' ? 'cover' : 'contain',
                      ...(thumbnail.fit === 'fit' ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' } : {}),
                      ...(thumbnail.fit === 'cover' ? { width: '100%', height: '100%' } : {}),
                    }}
                  />
                </button>
              );
            })}
              </div>
            </div>
          );
        })()}
      </div>
    </>,
    document.getElementById(portalId)!
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
      closeIconColor?: string;
      closeIconHover?: string;
    },
    imageCaption: Caption;
  }
};

type LightboxStyles = {
  imageCaption: CaptionStyles;
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
