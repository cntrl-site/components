import React, { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Lightbox.module.scss';

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

export const LightboxGallery: React.FC<LightboxGalleryProps> = ({
  settings,
  content,
  styles,
  portalId
}) => {
  const [open, setOpen] = React.useState(false);
  const { url: coverUrl } = settings.cover;

  if (!coverUrl) return null;

  return (
    <div style={{ padding: 20 }}>
      <img
        src={coverUrl}
        alt='Cover'
        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      />
      <Lightbox isOpen={open} onClose={() => setOpen(false)} content={content} settings={settings} portalId={portalId} />
    </div>
  );
};

const Lightbox: FC<LightboxProps> = ({ isOpen, onClose, content, settings,closeOnBackdropClick = true, closeOnEsc = true, portalId }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!closeOnBackdropClick) return;
    if (e.target === e.currentTarget) {
      onClose();
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

  if (!isOpen) return null;

  return createPortal(
    <div 
    className={styles.backdropStyle} 
    style={{ backgroundColor: settings.area.color, backdropFilter: `blur(${settings.area.blur}px)` }}
    onClick={handleBackdropClick} 
    >
      <div className={styles.contentStyle}>
        <div className={styles.stageStyle}>
          {content[currentIndex] && (
            <img
              src={content[currentIndex].image.url}
              alt={content[currentIndex].image.name ?? ''}
              className={styles.imageStyle}
              onClick={() => setCurrentIndex((currentIndex + 1) % Math.max(content.length, 1))}
            />
          )}
          {content.length > 1 && (
            <>
              <div
                className={styles.controlBase}
                style={{ left: 12 }}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + content.length) % content.length); }}
                aria-label='Previous'>
                ‹
              </div>
              <div
                className={styles.controlBase}
                style={{ right: 12 }}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % content.length); }}
                aria-label='Next'>
                ›
              </div>
            </>
          )}
        </div>
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
  alignment: Alignment;
  color: string;
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
  transition: {
    type: 'slide' | 'fade in';
    duration: string;
    direction: 'top' | 'bottom' | 'left' | 'right';
    repeat: 'close' | 'loop';
  };
  triggers: Triggers;
  direction: 'horiz' | 'vert';
  thumbnail: {
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
    activeScale: number;
    activeOpacity: number;
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
