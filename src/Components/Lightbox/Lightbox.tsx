import React, { FC, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './LightBox.module.scss';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import cn from 'classnames';
import '@splidejs/react-splide/css';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';

type LightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  content: LightboxImage[];
  settings: LightboxSettings;
  portalId: string;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
};

type LightboxGalleryProps = {
  settings: LightboxSettings;
  content: LightboxImage[];
  styles: LightboxStyles;
  portalId: string;
};

export function LightboxGallery({ settings, content, styles, portalId }: LightboxGalleryProps) {
  const [open, setOpen] = React.useState(false);
  const { url: coverUrl } = settings.cover;

  return (
    <div>
      <img
        src={coverUrl}
        alt='Cover'
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      />
      <Lightbox isOpen={open} onClose={() => setOpen(false)} content={content} settings={settings} portalId={portalId} />
    </div>
  );
};

const Lightbox: FC<LightboxProps> = ({ isOpen, onClose, content, settings,closeOnBackdropClick = true, closeOnEsc = true, portalId }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const lightboxRef = useRef<Splide | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (settings.triggers.type === 'click' && settings.triggers.switch === 'image') {
      e.stopPropagation();
      lightboxRef.current?.go('+1');
    }
    if (settings.triggers.type === 'click' && settings.triggers.switch === '50/50') {
      e.stopPropagation();
      
      const img = e.currentTarget;
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const imgWidth = rect.width;
      const imgHeight = rect.height;
      let dir: '+1' | '-1';
      if (settings.slider.direction === 'horiz') {
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
        onClose();
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
  }, [isOpen, closeOnEsc, onClose, content.length]);

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);
  
  const handleArrowClick = (dir: '+1' | '-1') => {
    lightboxRef.current?.go(dir);
  };

  const appearDurationMs = settings.appear?.duration ? parseInt(settings.appear.duration) : 300;
  const appearClass = (() => {
    if (settings.appear?.type === 'fade in') return styles.fadeIn;
    if (settings.appear?.type === 'slide in') {
      switch (settings.appear.direction) {
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

  if (!isOpen) return null;

  return createPortal(
    <div 
      className={cn(styles.backdropStyle, styles.fadeIn)} 
      style={{ backgroundColor: settings.area.color, backdropFilter: `blur(${settings.area.blur}px)`, animationDuration: `${appearDurationMs}ms`, animationTimingFunction: 'ease', animationFillMode: 'both' as unknown as undefined }}
      onClick={handleBackdropClick} 
      >
      <div
        className={cn(styles.contentStyle, appearClass)}
        style={{
          padding: `${settings.layout.padding.top}px ${settings.layout.padding.right}px ${settings.layout.padding.bottom}px ${settings.layout.padding.left}px`,
          animationDuration: `${appearDurationMs}ms`,
          animationTimingFunction: 'ease',
          animationFillMode: 'both'
        }}
      >
        <Splide
          onMove={(splide) => { setCurrentIndex(splide.index); }}
          ref={lightboxRef}
          options={{
            arrows: false,
            speed: settings.triggers.duration ? parseInt(settings.triggers.duration) : 500,
            direction: settings.slider.direction === 'horiz' || settings.slider.type === 'fade' ? 'ltr' : 'ttb',
            pagination: false,
            drag: settings.triggers.type === 'drag',
            perPage: 1,
            width: '100%',
            height: '100%',
            type: settings.slider.type === 'fade' ? 'fade' : 'loop',
            padding: 0,
            rewind: false
          }}
        >
          {content.map((item, index) => (
            <SplideSlide key={index}>
              <div className={styles.imgWrapper} onClick={handleImageWrapperClick}>
                <img
                  className={cn(styles.imageStyle, {
                    [styles.contain]: item.image.objectFit === 'contain',
                    [styles.cover]: item.image.objectFit === 'cover'
                  })}
                  src={item.image.url} alt={item.image.name ?? ''}
                  onClick={onImageClick}
                />
              </div>
          </SplideSlide>
          ))}
        </Splide>
        {settings.controls.isActive && (
          <>
            <div 
              className={cn(styles.arrow, {[styles.arrowVertical]: settings.slider.direction === 'vert' })}
              style={{color: settings.controls.color,['--arrow-hover-color' as string]: settings.controls.hover}}
            >
              <button
                  className={styles.arrowInner}
                  style={{
                    transform: `translate(${scalingValue(settings.controls.offset.x)}, ${scalingValue(settings.controls.offset.y * (settings.slider.direction === 'horiz' ? 1 : -1))}) scale(${settings.controls.scale / 100}) rotate(${settings.slider.direction === 'horiz' ? '0deg' : '90deg'})`,
                  }}
                onClick={(e) => { handleArrowClick('-1'); }}
                >
                  {settings.controls.arrowsImgUrl && (
                    <SvgImage
                      url={settings.controls.arrowsImgUrl}
                      fill={settings.controls.color}
                      hoverFill={settings.controls.hover}
                      className={cn(styles.arrowImg, styles.mirror)}
                    />
                  )}
                </button>
            </div>
            <div
              className={cn(styles.arrow, styles.nextArrow, {[styles.arrowVertical]: settings.slider.direction === 'vert'})}
              style={{color: settings.controls.color,['--arrow-hover-color' as string]: settings.controls.hover}}
            >              
              <button
                className={styles.arrowInner}
                style={{
                  transform: `translate(${scalingValue(settings.controls.offset.x * (settings.slider.direction === 'horiz' ? -1 : 1))}, ${scalingValue(settings.controls.offset.y)}) scale(${settings.controls.scale / 100}) rotate(${settings.slider.direction === 'horiz' ? '0deg' : '90deg'})`,
                }}
                onClick={(e) => { handleArrowClick('+1');}}
                aria-label='Next'
              >
                {settings.controls.arrowsImgUrl && (
                  <SvgImage
                    url={settings.controls.arrowsImgUrl}
                    fill={settings.controls.color}
                    hoverFill={settings.controls.hover}
                    className={styles.arrowImg}
                  />
                )}
              </button>
            </div>
          </>
        )}
        {/* Close button */}
        {settings.area.closeIconUrl && (
          <button className={styles.closeButton} style={{ top: settings.area.closeIconOffset.y, left: settings.area.closeIconOffset.x }} onClick={onClose}>
            <SvgImage url={settings.area.closeIconUrl} fill={settings.area.color} />
          </button>
        )}
        {/* Caption */}
        {settings.caption.isActive && (
          <div className={styles.caption} style={{ top: settings.caption.offset.y, left: settings.caption.offset.x }}>
            <RichTextRenderer content={content[currentIndex].imageCaption} />
          </div>
        )}
        {settings.thumbnail.isActive && (
          <div
            className={cn(styles.thumbsContainer)}
            style={{
              gap: `${settings.thumbnail.grid.gap}px`,
              height: `${settings.thumbnail.grid.height}px`,
            }}
          >
            {content.map((item, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={`${item.image.url}-${index}`}
                  className={styles.thumbItem}
                  style={{
                    transform: `scale(${isActive ? settings.thumbnail.activeState.scale : 1})`,
                    height: '100%',
                    opacity: isActive ? settings.thumbnail.activeState.opacity : settings.thumbnail.opacity,
                    ['--thumb-hover' as string]: settings.thumbnail.activeState.opacity,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    lightboxRef.current?.go(index);
                  }}
                >
                  <img
                    src={item.image.url}
                    alt={item.image.name ?? ''}
                    className={styles.thumbImage}
                    style={{ objectFit: settings.thumbnail.fit === 'cover' ? 'cover' : 'contain' }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
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

type Offset = {
  x: number;
  y: number;
}

type LightboxControls = {
  arrowsImgUrl: string | null;
  isActive: boolean;
  color: string;
  hover: string;
  offset: Offset;
  scale: number;
};

type Alignment = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

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
  type: 'click' | 'drag' | 'scroll';
  switch: 'image' | '50/50';
  duration: string;
};

type LightboxSettings = {
  cover: {
    url: string;
  },
  appear: {
    type: 'slide in' | 'fade in' | 'mix';
    duration: string;
    direction: 'top' | 'bottom' | 'left' | 'right';
    repeat: 'close' | 'loop';
  };
  triggers: Triggers;
  slider: {
    type: 'slide' | 'fade' | 'scale';
    direction: 'horiz' | 'vert';
  };
  thumbnail: {
    isActive: boolean;
    position: Alignment;
    fit: 'cover' | 'fit';
    align: 'top' | 'center' | 'bottom';
    triggers: 'click' | 'hover';
    grid: {
      height: number;
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
  },
  caption: Caption;
};

type LightboxStyles = {
}
