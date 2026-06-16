import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { useScopedStyles } from '../utils/useScopedStyles';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { normalizeFontFamilyCssValue } from '../utils/textStylesToCss';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';

const LIGHTBOX_ANIM_MS = 300;
const THUMB_MAX_SIZE_PX = 40;

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.${P}-cover {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.${P}-cover-image {
  display: block;
  width: 100%;
  height: 100%;
}

.${P}-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9997;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.${P}-lightbox-editor {
  width: var(--cntrl-article-width, 100vw) !important;
  margin-left: auto;
  margin-right: auto;
}

.${P}-lightbox-edit-mode {
  z-index: 1;
}

.${P}-lightbox-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.${P}-lightbox-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.${P}-lightbox-strip {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  max-width: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  box-sizing: border-box;
  touch-action: pan-x;
  scrollbar-width: none;
}

.${P}-lightbox-strip[data-mouse-dragging="true"] {
  cursor: grabbing;
  scroll-snap-type: none;
}

.${P}-lightbox-strip[data-mouse-draggable="true"] {
  cursor: grab;
}

.${P}-lightbox-strip::-webkit-scrollbar {
  display: none;
}

.${P}-strip-item {
  position: relative;
  flex: 0 0 auto;
  height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.${P}-thumbnails {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  max-width: calc(100% - 32px);
  overflow-x: auto;
  scrollbar-width: none;
  pointer-events: auto;
}

.${P}-lightbox-editor .${P}-thumbnails {
  overflow: visible;
}

.${P}-thumbnails::-webkit-scrollbar {
  display: none;
}

.${P}-thumb {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.${P}-thumb[data-active="true"] {
  opacity: 1;
}

.${P}-thumbnails[data-thumbnail-active="invert"] .${P}-thumb[data-active="true"] .${P}-thumb-image {
  filter: invert(1);
}

.${P}-thumbnails[data-thumbnail-active="grayscale"] .${P}-thumb:not([data-active="true"]) .${P}-thumb-image {
  filter: grayscale(1);
}

.${P}-thumbnails[data-thumbnail-active="scale-up"] .${P}-thumb[data-active="true"] {
  transform: scale(1.15);
}

.${P}-thumbnails[data-thumbnail-active="opacity"] .${P}-thumb:not([data-active="true"]) {
  opacity: 0.5;
}

.${P}-thumb-image {
  display: block;
  max-width: ${THUMB_MAX_SIZE_PX}px;
  max-height: ${THUMB_MAX_SIZE_PX}px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: filter 0.2s ease;
}
.${P}-close-icon {
  position: relative;
  flex-shrink: 0;
  margin-left: auto;
  pointer-events: auto;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  padding: 0;
}

.${P}-close-icon-inner {
  all: unset;
  position: relative;
  cursor: pointer;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.${P}-close-icon-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.${P}-text {
  position: relative;
  flex: 0 1 auto;
  z-index: 2;
  box-sizing: border-box;
  pointer-events: none;
  word-break: break-word;
}
.${P}-lightbox-content-inner {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.${P}-lightbox-content-area {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.${P}-control {
  position: relative;
  z-index: 2;
  pointer-events: auto;
  flex-shrink: 0;
}

.${P}-control::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 10;
}
`;
}

const getArticleWidthCSSValue = (start: HTMLElement | null): string | undefined => {
  let el = start;
  while (el) {
    const inline = el.style.getPropertyValue('--cntrl-article-width').trim();
    if (inline) return inline;
    const computed = getComputedStyle(el).getPropertyValue('--cntrl-article-width').trim();
    if (computed) return computed;
    el = el.parentElement;
  }
  return undefined;
};

type LightboxOverlayProps = {
  prefix: string;
  images: LightboxStripItem[];
  backgroundColor: string;
  thumbnailGap: string;
  imageGap: string;
  closeIcon: string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
  thumbnailVisibility: 'on' | 'off';
  thumbnailObjectFit: 'cover' | 'contain';
  thumbnailTrigger: 'click' | 'hover';
  thumbnailActive: 'invert' | 'grayscale' | 'scale-up' | 'opacity';
  text: any[];
  textMaxWidth: string;
  textStyle: React.CSSProperties;
  contentMarginTop: string;
  contentMarginLeft: string;
  contentMarginRight: string;
  articleWidthCss?: string;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  onClose: () => void;
};

const MOUSE_DRAG_THRESHOLD_PX = 3;
const LOOP_COPIES = 3;
const GAP_LABEL_AREA_PX = 20;

const getGapControlSize = (gap: string) => `max(${gap}, ${GAP_LABEL_AREA_PX}px)`;

const LightboxOverlay = ({
  prefix: P,
  images,
  backgroundColor,
  thumbnailGap,
  imageGap,
  isEditor,
  isEditMode,
  isPreviewMode,
  closeIcon,
  closeIconMaxWidth,
  closeIconColor,
  closeIconHoverColor,
  thumbnailTrigger,
  thumbnailVisibility,
  thumbnailObjectFit,
  thumbnailActive,
  articleWidthCss,
  text,
  textMaxWidth,
  textStyle,
  contentMarginTop,
  contentMarginLeft,
  contentMarginRight,
  onClose,
}: LightboxOverlayProps) => {
  const showControls = Boolean(isEditMode);
  const allowMouseDrag = !isEditor || Boolean(isPreviewMode);
  const allowThumbnailHover = !isEditor || Boolean(isPreviewMode);
  const stripRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setWidthRef = useRef(0);
  const mouseDragRef = useRef({
    isActive: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });
  const isLoopEnabled = images.length > 1;
  const loopCopies = isLoopEnabled ? LOOP_COPIES : 1;
  const flatItems = useMemo(
    () => Array.from({ length: loopCopies }, () => images).flat(),
    [images, loopCopies],
  );
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const lockedActiveIndexRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, LIGHTBOX_ANIM_MS);
  }, [onClose]);

  const measureSetWidth = () => {
    if (!isLoopEnabled || images.length === 0) {
      setWidthRef.current = 0;
      return 0;
    }
    const firstItem = itemRefs.current[0];
    const firstMiddleSetItem = itemRefs.current[images.length];
    if (!firstItem || !firstMiddleSetItem) return setWidthRef.current;
    const nextSetWidth = firstMiddleSetItem.offsetLeft - firstItem.offsetLeft;
    if (nextSetWidth > 0) {
      setWidthRef.current = nextSetWidth;
    }
    return setWidthRef.current;
  };

  const normalizeInfiniteScroll = (adjustMouseDragAnchor = false) => {
    if (!isLoopEnabled) return;
    const strip = stripRef.current;
    const setWidth = measureSetWidth();
    if (!strip || setWidth <= 0) return;

    if (strip.scrollLeft <= 0) {
      strip.scrollLeft += setWidth;
      if (adjustMouseDragAnchor) {
        mouseDragRef.current.scrollLeft += setWidth;
      }
    } else if (strip.scrollLeft >= setWidth * 2) {
      strip.scrollLeft -= setWidth;
      if (adjustMouseDragAnchor) {
        mouseDragRef.current.scrollLeft -= setWidth;
      }
    }
  };

  const getNearestFlatIndex = (scrollLeft = stripRef.current?.scrollLeft ?? 0) => {
    let closestFlatIndex = 0;
    let closestDistance = Infinity;
    itemRefs.current.forEach((item, flatIndex) => {
      if (!item) return;
      const distance = Math.abs(item.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFlatIndex = flatIndex;
      }
    });
    return closestFlatIndex;
  };

  const updateActiveIndex = () => {
    if (!stripRef.current || images.length === 0) return;
    if (lockedActiveIndexRef.current !== null) return;
    setActiveIndex(getNearestFlatIndex() % images.length);
  };

  const releaseActiveIndexLock = () => {
    lockedActiveIndexRef.current = null;
    updateActiveIndex();
  };

  const snapToNearestItem = (behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    if (!strip || images.length === 0) return;
    const flatIndex = getNearestFlatIndex();
    const item = itemRefs.current[flatIndex];
    if (!item) return;
    strip.scrollTo({
      left: item.offsetLeft,
      behavior,
    });
    setActiveIndex(flatIndex % images.length);
  };

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    const flatIndex = isLoopEnabled ? images.length + index : index;
    const item = itemRefs.current[flatIndex];
    if (!strip || !item) return;
    if (behavior === 'smooth') {
      lockedActiveIndexRef.current = index;
    } else {
      lockedActiveIndexRef.current = null;
    }
    setActiveIndex(index);
    strip.scrollTo({
      left: item.offsetLeft,
      behavior,
    });
  };

  const onStripPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-controls]')) return;
    const strip = stripRef.current;
    if (!strip) return;
    mouseDragRef.current = {
      isActive: true,
      startX: event.clientX,
      scrollLeft: strip.scrollLeft,
      hasMoved: false,
    };
    strip.setPointerCapture(event.pointerId);
  };

  const onStripPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    const strip = stripRef.current;
    if (!strip || !mouseDragRef.current.isActive) return;
    const deltaX = event.clientX - mouseDragRef.current.startX;
    if (Math.abs(deltaX) > MOUSE_DRAG_THRESHOLD_PX) {
      mouseDragRef.current.hasMoved = true;
      setIsMouseDragging(true);
    }
    if (mouseDragRef.current.hasMoved) {
      event.preventDefault();
      strip.scrollLeft = mouseDragRef.current.scrollLeft - deltaX;
      normalizeInfiniteScroll(true);
      updateActiveIndex();
    }
  };

  const endStripMouseDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    const strip = stripRef.current;
    if (!strip) return;
    const hadMoved = mouseDragRef.current.hasMoved;
    mouseDragRef.current.isActive = false;
    setIsMouseDragging(false);
    if (strip.hasPointerCapture(event.pointerId)) {
      strip.releasePointerCapture(event.pointerId);
    }
    normalizeInfiniteScroll();
    if (hadMoved) {
      snapToNearestItem();
    } else {
      updateActiveIndex();
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useLayoutEffect(() => {
    measureSetWidth();
    scrollToIndex(0, 'auto');
  }, [images.length, isLoopEnabled]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      normalizeInfiniteScroll();
      updateActiveIndex();
      if (lockedActiveIndexRef.current !== null) {
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
          if (lockedActiveIndexRef.current !== null) {
            releaseActiveIndexLock();
          }
        }, 150);
      }
    };
    const onScrollEnd = () => {
      if (lockedActiveIndexRef.current !== null) {
        if (scrollEndTimer) {
          clearTimeout(scrollEndTimer);
          scrollEndTimer = null;
        }
        releaseActiveIndexLock();
      }
    };
    strip.addEventListener('scroll', onScroll, { passive: true });
    strip.addEventListener('scrollend', onScrollEnd);
    const observer = new ResizeObserver(() => {
      measureSetWidth();
      normalizeInfiniteScroll();
      updateActiveIndex();
    });
    observer.observe(strip);
    return () => {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      strip.removeEventListener('scroll', onScroll);
      strip.removeEventListener('scrollend', onScrollEnd);
      observer.disconnect();
    };
  }, [images.length, isLoopEnabled]);

  return (
    <div
      data-selection="none"
      className={`${P}-lightbox${isEditor ? ` ${P}-lightbox-editor` : ''}${isEditMode ? ` ${P}-lightbox-edit-mode` : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${LIGHTBOX_ANIM_MS}ms ease`,
        pointerEvents: isVisible ? 'auto' : 'none',
        ...(articleWidthCss ? { ['--cntrl-article-width' as string]: articleWidthCss } : {}),
      }}
    >
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor }} />
      <div
        className={`${P}-lightbox-content`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          ref={stripRef}
          className={`${P}-lightbox-strip`}
          style={{ gap: imageGap }}
          data-mouse-draggable={allowMouseDrag && images.length > 0 ? 'true' : 'false'}
          data-mouse-dragging={isMouseDragging ? 'true' : 'false'}
          onPointerDown={allowMouseDrag ? onStripPointerDown : undefined}
          onPointerMove={allowMouseDrag ? onStripPointerMove : undefined}
          onPointerUp={allowMouseDrag ? endStripMouseDrag : undefined}
          onPointerCancel={allowMouseDrag ? endStripMouseDrag : undefined}
        >
          {flatItems.map((item, flatIndex) => {
            const itemObjectFit = item.image.objectFit ?? 'contain';
            const sourceIndex = flatIndex % images.length;
            const copyIndex = Math.floor(flatIndex / images.length);
            const isMiddleCopy = copyIndex === 1;

            const imageGapControlSize = getGapControlSize(imageGap);
            const imageGapControlRight = `calc(-0.5 * (${imageGapControlSize} + ${imageGap}))`;

            return (
              <div
                key={`${copyIndex}-${item.image.url}-${sourceIndex}`}
                ref={(element) => {
                  itemRefs.current[flatIndex] = element;
                }}
                className={`${P}-strip-item`}
                style={{
                  height: '100%',
                }}
                aria-hidden={!isMiddleCopy}
              >
                <img
                  src={item.image.url}
                  alt={isMiddleCopy ? (item.image.name ?? '') : ''}
                  draggable={false}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: itemObjectFit,
                  }}
                />
                {showControls && isMiddleCopy && sourceIndex < images.length - 1 && (
                  <div
                    data-controls="imageGap"
                    data-controls-axis="x"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: imageGapControlRight,
                      width: imageGapControlSize,
                      height: '100%',
                      pointerEvents: 'auto',
                      zIndex: 3,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {images.length > 1 && thumbnailVisibility === 'on' && (
          <div
            className={`${P}-thumbnails`}
            data-thumbnail-active={thumbnailActive}
            style={{ gap: thumbnailGap }}
          >
            {images.map((item, index) => {
              const thumbnailGapControlSize = getGapControlSize(thumbnailGap);
              const thumbnailGapControlRight = `calc(-0.5 * (${thumbnailGapControlSize} + ${thumbnailGap}))`;

              return (
              <div
                key={`thumb-${item.image.url}-${index}`}
                style={{ position: 'relative', flex: '0 0 auto' }}
              >
                <button
                  type="button"
                  className={`${P}-thumb`}
                  data-active={activeIndex === index ? 'true' : 'false'}
                  onClick={() => {
                    if (thumbnailTrigger === 'click') {
                      scrollToIndex(index);
                    }
                  }}
                  onMouseEnter={() => {
                    if (allowThumbnailHover && thumbnailTrigger === 'hover') {
                      scrollToIndex(index);
                    }
                  }}
                  aria-label={item.image.name ? `View ${item.image.name}` : `View image ${index + 1}`}
                  aria-current={activeIndex === index ? 'true' : undefined}
                >
                  <img
                    className={`${P}-thumb-image`}
                    src={item.image.url}
                    alt=""
                    draggable={false}
                  />
                </button>
                {showControls && index < images.length - 1 && (
                  <div
                    data-controls="thumbnailGap"
                    data-controls-axis="x"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: thumbnailGapControlRight,
                      width: thumbnailGapControlSize,
                      height: '100%',
                      pointerEvents: 'auto',
                      zIndex: 3,
                    }}
                  />
                )}
              </div>
            );
            })}
          </div>
        )}
        <div className={`${P}-lightbox-content-inner`} style={{ width: '100%', height: '100%' }}>
          <div
            data-controls={showControls ? 'contentMarginTop' : undefined}
            className={showControls ? `${P}-control` : undefined}
            style={{ height: contentMarginTop, width: '100%' }}
          />
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <div
              data-controls={showControls ? 'contentMarginLeft' : undefined}
              data-controls-axis={showControls ? 'x' : undefined}
              className={showControls ? `${P}-control` : undefined}
              style={{ width: contentMarginLeft, flexShrink: 0 }}
            />
            <div className={`${P}-lightbox-content-area`}>
              {text.length > 0 && (
                <div className={`${P}-text`} style={{ ...textStyle, maxWidth: textMaxWidth }}>
                  <RichTextRenderer content={text} />
                </div>
              )}
              {closeIcon && (
                <div
                  className={`${P}-close-icon`}
                  style={{
                    width: scalingValue(closeIconMaxWidth ?? 0, isEditor),
                    height: scalingValue(closeIconMaxWidth ?? 0, isEditor),
                    ['--close-icon-hover-color' as string]: closeIconHoverColor,
                  }}
                >
                  <button
                    type="button"
                    className={`${P}-close-icon-inner`}
                    onClick={handleClose}
                    aria-label="Close"
                  >
                    <SvgImage url={closeIcon} fill={closeIconColor} hoverFill={closeIconHoverColor} className={`${P}-close-icon-img`}/>
                  </button>
                </div>
              )}
            </div>
            <div
              data-controls={showControls ? 'contentMarginRight' : undefined}
              data-controls-axis={showControls ? 'x' : undefined}
              className={showControls ? `${P}-control` : undefined}
              style={{ width: contentMarginRight, flexShrink: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type LightboxStripProps = {
  settings: LightboxStripSettings;
  content?: LightboxStripItem[];
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  portalId?: string;
} & CommonComponentProps;

export const LightboxStrip = ({ settings, content, isEditor, isEditMode, isPreviewMode, portalId }: LightboxStripProps) => {
  const { prefix: P } = useScopedStyles();
  const { 
    cover,
    backgroundColor,
    thumbnailVisibility,
    thumbnailObjectFit,
    thumbnailTrigger,
    thumbnailActive,
    thumbnailGap,
    imageGap,
    textMaxWidth,
    textColor,
    textFontSize,
    textFontWeight,
    textFontFamily, 
    textLineHeight,
    textLetterSpacing, 
    closeIcon,
    closeIconMaxWidth,
    closeIconColor,
    closeIconHoverColor, 
    contentMarginTop, 
    contentMarginLeft, 
    contentMarginRight
  } = settings;

  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const textStyle: React.CSSProperties = {
    color: textColor,
    fontFamily: normalizeFontFamilyCssValue(textFontFamily),
    fontSize: scaled(textFontSize),
    fontWeight: textFontWeight,
    lineHeight: textLineHeight,
    letterSpacing: scaled(textLetterSpacing),
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [articleWidthCss, setArticleWidthCss] = useState<string | undefined>();
  const items = content ?? [];

  const openLightbox = () => {
    if (items.length === 0) return;
    if (isEditor && wrapperRef.current) {
      setArticleWidthCss(getArticleWidthCSSValue(wrapperRef.current));
    }
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <>
      <div ref={wrapperRef} className={`${P}-wrapper`}>
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        {cover ? (
          <button
            type="button"
            className={`${P}-cover`}
            onClick={openLightbox}
            style={{
              display: 'block',
              padding: 0,
              border: 'none',
              background: 'transparent',
            }}
            aria-label='Open image gallery'
          >
            <img
              className={`${P}-cover-image`}
              src={cover}
              alt='cover'
              style={{ objectFit: 'cover' }}
            />
          </button>
        ) : null}
      </div>

      {lightboxOpen && typeof document !== 'undefined' && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <LightboxOverlay
            prefix={P}
            images={items}
            backgroundColor={backgroundColor}
            thumbnailGap={scaled(thumbnailGap)}
            imageGap={scaled(imageGap ?? 0)}
            thumbnailVisibility={thumbnailVisibility}
            thumbnailObjectFit={thumbnailObjectFit}
            thumbnailTrigger={thumbnailTrigger}
            thumbnailActive={thumbnailActive}
            text={items.find((item) => Array.isArray(item.text) && item.text.length > 0)?.text ?? []}
            textMaxWidth={scaled(textMaxWidth)}
            textStyle={textStyle}
            contentMarginTop={scaled(contentMarginTop ?? 0)}
            contentMarginLeft={scaled(contentMarginLeft ?? 0)}
            contentMarginRight={scaled(contentMarginRight ?? 0)}
            closeIcon={closeIcon}
            closeIconMaxWidth={closeIconMaxWidth}
            closeIconColor={closeIconColor}
            closeIconHoverColor={closeIconHoverColor}
            articleWidthCss={articleWidthCss}
            isEditor={isEditor}
            isEditMode={isEditMode}
            isPreviewMode={isPreviewMode}
            onClose={closeLightbox}
          />,
          portalTarget,
        );
      })()}
    </>
  );
};

export type LightboxStripItem = {
  image: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  text?: any[];
};

export type LightboxStripSettings = {
  cover: string | null;
  backgroundColor: string;
  thumbnailVisibility: 'on' | 'off';
  thumbnailObjectFit: 'cover' | 'contain';
  thumbnailTrigger: 'click' | 'hover';
  thumbnailActive: 'invert' | 'grayscale' | 'scale-up' | 'opacity';
  thumbnailGap: number;
  imageGap?: number;
  textMaxWidth: number;
  textColor: string;
  textFontSize: number;
  textFontWeight: number;
  textFontFamily: string;
  textLineHeight: number;
  textLetterSpacing: number;
  contentMarginTop: number;
  contentMarginLeft: number;
  contentMarginRight: number;
  closeIcon:  string | null;
  closeIconMaxWidth: number;
  closeIconColor: string;
  closeIconHoverColor: string;
};
