import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import { CommonComponentProps } from '../props';
import { buildColorVars, getFormFieldValidationError, scalingValue, useScopedStyles } from '../utils/index';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function hasText(value: string | undefined): boolean {
  return (value?.trim().length ?? 0) > 0;
}

function getGridTextClassName(
  fontSize: number | undefined,
  lineHeight: number | undefined,
  baseClassName: string,
  tightLeadingClassName: string,
): string {
  const resolvedFontSize = fontSize ?? 0.01;
  const needsTightLeading = lineHeight !== undefined && lineHeight < resolvedFontSize;

  return needsTightLeading
    ? `${baseClassName} ${tightLeadingClassName}`
    : baseClassName;
}

function getGridTextLeadingVars(
  fontSize: number | undefined,
  lineHeight: number | undefined,
  varPrefix: string,
  isEditor?: boolean,
): React.CSSProperties {
  const resolvedFontSize = fontSize ?? 0.01;

  if (lineHeight === undefined || lineHeight >= resolvedFontSize) {
    return {};
  }

  return {
    [`--${varPrefix}-title-leading-gap`]: scalingValue((resolvedFontSize - lineHeight) / 2, isEditor),
  } as React.CSSProperties;
}

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  display: grid;
  align-items: start;
  min-height: ${sv(48)};
}
.${P}-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.${P}-item-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: 1px solid #ccc;
}
.${P}-item-inner-hidden {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.${P}-item-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.${P}-item-image-wrapper-fit-slider {
  display: grid;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer,
.${P}-item-image-wrapper-fit-slider > .${P}-item-slider {
  grid-area: 1 / 1;
  width: 100%;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer {
  display: grid;
  visibility: hidden;
  pointer-events: none;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer img {
  grid-area: 1 / 1;
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-image-wrapper-sizer video {
  grid-area: 1 / 1;
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}
.${P}-item-image-wrapper-fit-slider > .${P}-item-slider {
  align-self: stretch;
  min-height: 0;
}
.${P}-item-image-link {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.${P}-item-image {
  width: 100%;
  height: 100%;
  display: block;
  max-width: 100%;
}
.${P}-item-video {
  width: 100%;
  height: 100%;
  display: block;
  max-width: 100%;
}
.${P}-item-slider,
.${P}-item-slider .splide__track,
.${P}-item-slider .splide__list,
.${P}-item-slider .splide__slide {
  width: 100%;
  height: 100%;
}
.${P}-item-slider .splide__slide {
  display: flex;
  justify-content: center;
  align-items: center;
}
.${P}-item-title {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  text-align: center;
  margin-bottom: 0px;
  margin-top: 0px;
  color: var(--${P}-title-color);
}
.${P}-item-subtitle {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  text-align: center;
  margin-bottom: 0px;
  margin-top: 0px;
  color: var(--${P}-subtitle-color);
}
.${P}-text-tight-leading {
  display: block;
  flex-shrink: 0;
  padding-top: var(--${P}-title-leading-gap, 0);
  padding-bottom: var(--${P}-title-leading-gap, 0);
}
.${P}-show-text-hover .${P}-item-title,
.${P}-show-text-hover .${P}-item-subtitle {
  opacity: 0;
  transition: opacity 250ms;
}
.${P}-show-text-hover .${P}-item-inner:hover .${P}-item-title,
.${P}-show-text-hover .${P}-item-inner:hover .${P}-item-subtitle,
.${P}-show-text-hover .${P}-item-inner-hidden:hover .${P}-item-title,
.${P}-show-text-hover .${P}-item-inner-hidden:hover .${P}-item-subtitle {
  opacity: 1;
}
.${P}-type-B .${P}-item-inner,
.${P}-type-B .${P}-item-inner-hidden,
.${P}-type-C .${P}-item-inner,
.${P}-type-C .${P}-item-inner-hidden {
  align-items: flex-start;
}
.${P}-type-B .${P}-item-image-link,
.${P}-type-C .${P}-item-image-link {
  align-items: flex-start;
}
.${P}-type-B .${P}-item-title,
.${P}-type-B .${P}-item-subtitle,
.${P}-type-C .${P}-item-title,
.${P}-type-C .${P}-item-subtitle {
  text-align: left;
}
.${P}-item-text-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  flex-shrink: 0;
}
.${P}-lightbox-counter {
  margin: 0;
  color: var(--${P}-lightbox-counter-color);
}

.${P}-control {
  position: relative;
  z-index: 2;
  width: 100%;
}

.${P}-control::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 20px;
  pointer-events: auto;
  z-index: 10;
}
`;
}

type GridProps = {
  layoutId?: string;
  settings: GridSettings;
  content?: any;
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: GridSettings) => void;
} & CommonComponentProps;

type AnimRect = { top: number; left: number; width: number; height: number };

type LightboxProps = {
  images: string[];
  index: number;
  imageDisplay: 'Fit' | 'Cover';
  originRect: AnimRect | null;
  reverseClose: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  counterClassName: string;
  counterStyle: React.CSSProperties;
};

const LIGHTBOX_ANIM_MS = 500;
const SLIDER_TRANSITION_MS = 750;
const LIGHTBOX_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

type GridMedia = {
  url: string;
  name?: string;
  type?: 'image' | 'video';
};

function isVideoMedia(media: GridMedia): boolean {
  if (media.type === 'video') return true;
  if (media.type === 'image') return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(media.url);
}

function GridMediaItem({
  media,
  className,
  style,
  onImageClick,
}: {
  media: GridMedia;
  className: string;
  style: React.CSSProperties;
  onImageClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}) {
  if (isVideoMedia(media)) {
    return (
      <video
        src={media.url}
        className={className}
        style={style}
        muted
        loop
        autoPlay
        playsInline
      />
    );
  }

  return (
    <img
      src={media.url}
      alt={media.name}
      className={className}
      style={style}
      onClick={onImageClick}
    />
  );
}

function Lightbox({ images, index, imageDisplay, originRect, reverseClose, onClose, onPrev, onNext, counterClassName, counterStyle }: LightboxProps) {
  const isCover = imageDisplay === 'Cover';
  const ghostRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [finalRect, setFinalRect] = useState<AnimRect | null>(null);
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>(originRect ? 'opening' : 'open');
  const [transitionsEnabled, setTransitionsEnabled] = useState(true);
  const prevIndexRef = useRef(index);

  const computeFinalRect = useCallback(() => {
    const ghost = ghostRef.current;
    const img = imgRef.current;
    if (!ghost || !img) return;
    const cb = ghost.getBoundingClientRect();
    const cw = cb.width;
    const ch = cb.height;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!cw || !ch || !nw || !nh) return;
    if (imageDisplay === 'Cover') {
      setFinalRect({ width: cw, height: ch, left: cb.left, top: cb.top });
      return;
    }
    const ir = nw / nh;
    const cr = cw / ch;
    if (ir > cr) {
      const dh = cw / ir;
      setFinalRect({ width: cw, height: dh, left: cb.left, top: cb.top + (ch - dh) / 2 });
    } else {
      const dw = ch * ir;
      setFinalRect({ width: dw, height: ch, left: cb.left + (cw - dw) / 2, top: cb.top });
    }
  }, [imageDisplay]);

  useEffect(() => {
    computeFinalRect();
    const c = ghostRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => computeFinalRect());
    ro.observe(c);
    return () => ro.disconnect();
  }, [computeFinalRect, index]);

  useEffect(() => {
    if (phase !== 'opening' || !finalRect) return;
    const handle = { id: 0 };
    handle.id = requestAnimationFrame(() => {
      handle.id = requestAnimationFrame(() => setPhase('open'));
    });
    return () => cancelAnimationFrame(handle.id);
  }, [phase, finalRect]);

  useEffect(() => {
    if (phase !== 'closing') return;
    const t = setTimeout(() => onClose(), LIGHTBOX_ANIM_MS);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  useEffect(() => {
    if (prevIndexRef.current !== index) {
      setTransitionsEnabled(false);
    }
    prevIndexRef.current = index;
  }, [index]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      if (phase === 'closing') return;
      setPhase('closing');
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [phase]);

  const handleClose = () => {
    if (phase === 'closing') return;
    setPhase('closing');
  };

  const isOpen = phase === 'open';
  const isClosing = phase === 'closing';
  const reverseAnimateClose = isClosing && reverseClose && !!originRect;
  const animatedRect = phase === 'opening'
    ? (originRect ?? finalRect)
    : reverseAnimateClose
      ? originRect
      : finalRect;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9997,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(28,31,34,0.9)',
          opacity: isOpen ? 1 : 0,
          transition: `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCover ? (
          <>
            <div ref={ghostRef} style={{ position: 'absolute', inset: 0 }} />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '10%',
                opacity: isOpen ? 1 : 0,
                transition: `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            >
              {images.length > 1 &&
                <p className={counterClassName} style={counterStyle}>
                  {index + 1} / {images.length}
                </p>
              }
            </div>
          </>
        ) : (
          <>
            <div style={{ height: '10%' }}></div>
            <div
              style={{
                width: '70%',
                height: '80%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <div ref={ghostRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: '10%',
                opacity: isOpen ? 1 : 0,
                transition: `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
              }}
            >
              {images.length > 1 &&
                <p className={counterClassName} style={counterStyle}>
                  {index + 1} / {images.length}
                </p>
              }
            </div>
          </>
        )}
      </div>

      {animatedRect && (
        <img
          ref={imgRef}
          src={images[index]}
          onLoad={computeFinalRect}
          style={{
            position: 'fixed',
            top: animatedRect.top,
            left: animatedRect.left,
            width: animatedRect.width,
            height: animatedRect.height,
            objectFit: imageDisplay === 'Cover' ? 'cover' : 'contain',
            opacity: isClosing && !reverseAnimateClose ? 0 : 1,
            transition: isClosing && !reverseAnimateClose
              ? `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
              : (reverseAnimateClose || transitionsEnabled)
                ? `top ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, left ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, width ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}, height ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
                : 'none',
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      )}

      {isOpen && finalRect && (
        <>
          <div
            style={{
              position: 'fixed',
              top: finalRect.top,
              left: finalRect.left,
              width: finalRect.width / 2,
              height: finalRect.height,
              cursor: 'w-resize',
              zIndex: 9999,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: finalRect.top,
              left: finalRect.left + finalRect.width / 2,
              width: finalRect.width / 2,
              height: finalRect.height,
              cursor: 'e-resize',
              zIndex: 9999,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          />
        </>
      )}
    </div>
  );
}

function resolveLightboxImageDisplay(
  value: GridSettings['lightboxImageDisplay'],
): 'Fit' | 'Cover' {
  if (typeof value === 'string') {
    return value === 'Cover' ? 'Cover' : 'Fit';
  }
  return value?.display === 'Cover' ? 'Cover' : 'Fit';
}

export function Grid({ settings, content, isEditor, isPreviewMode, isEditMode, metadata, activeEvent, layoutId }: GridProps) {
  const { prefix: P } = useScopedStyles();
  const {
    type = 'A',
    gridLayout,
    textBoxWidth,
    verticalGap,
    entriesCount,
    lightbox,
    imageDisplay,
    lightboxImageDisplay,
    slider,
    sliderTiming,
    direction,
    transition,
    titleMarginTop,
    subtitleMarginTop,
    titleColor,
    subtitleColor,
    lightboxCounterColor,
    titleFontFamily,
    titleFontSettings,
    titleFontSize,
    titleLineHeight,
    titleLetterSpacing,
    titleWordSpacing,
    titleTextAppearance,
    subtitleFontFamily,
    subtitleFontSettings,
    subtitleFontSize,
    subtitleLineHeight,
    subtitleLetterSpacing,
    subtitleWordSpacing,
    subtitleTextAppearance,
    lightboxCounterFontFamily,
    lightboxCounterFontSettings,
    lightboxCounterFontSize,
    lightboxCounterLineHeight,
    lightboxCounterLetterSpacing,
    lightboxCounterWordSpacing,
    lightboxCounterTextAppearance,
    showText = 'Always',
    alignEntries = 'Off',
  } = settings;

  const resolvedTitleTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: titleFontFamily,
      fontWeight: titleFontSettings?.fontWeight ?? 400,
      fontStyle: titleFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: titleFontSize ?? 0.01,
    lineHeight: titleLineHeight,
    letterSpacing: titleLetterSpacing ?? 0,
    wordSpacing: titleWordSpacing ?? 0,
    textAppearance: titleTextAppearance,
    color: titleColor,
  };
  const titleTypographyCss = omitTextColors(textStylesToCss(resolvedTitleTextStyle, isEditor));
  const titleFieldCss = {
    ...titleTypographyCss,
  } as React.CSSProperties;

  const resolvedSubtitleTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: subtitleFontFamily,
      fontWeight: subtitleFontSettings?.fontWeight ?? 400,
      fontStyle: subtitleFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: subtitleFontSize ?? 0.01,
    lineHeight: subtitleLineHeight,
    letterSpacing: subtitleLetterSpacing ?? 0,
    wordSpacing: subtitleWordSpacing ?? 0,
    textAppearance: subtitleTextAppearance,
    color: subtitleColor,
  };
  const subtitleTypographyCss = omitTextColors(textStylesToCss(resolvedSubtitleTextStyle, isEditor));
  const subtitleFieldCss = {
    ...subtitleTypographyCss,
  } as React.CSSProperties;

  const resolvedLightboxCounterTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: lightboxCounterFontFamily,
      fontWeight: lightboxCounterFontSettings?.fontWeight ?? 400,
      fontStyle: lightboxCounterFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: lightboxCounterFontSize ?? 0.01,
    lineHeight: lightboxCounterLineHeight,
    letterSpacing: lightboxCounterLetterSpacing ?? 0,
    wordSpacing: lightboxCounterWordSpacing ?? 0,
    textAppearance: lightboxCounterTextAppearance,
    color: lightboxCounterColor,
  };
  const lightboxCounterTypographyCss = omitTextColors(textStylesToCss(resolvedLightboxCounterTextStyle, isEditor));
  const lightboxCounterFieldCss = {
    ...lightboxCounterTypographyCss,
    ...getGridTextLeadingVars(lightboxCounterFontSize, lightboxCounterLineHeight, P, isEditor),
  } as React.CSSProperties;

  const titleTextClassName = getGridTextClassName(
    titleFontSize,
    titleLineHeight,
    `${P}-item-title`,
    `${P}-text-tight-leading`,
  );
  const subtitleTextClassName = getGridTextClassName(
    subtitleFontSize,
    subtitleLineHeight,
    `${P}-item-subtitle`,
    `${P}-text-tight-leading`,
  );
  const titleTextLeadingVars = getGridTextLeadingVars(titleFontSize, titleLineHeight, P, isEditor);
  const subtitleTextLeadingVars = getGridTextLeadingVars(subtitleFontSize, subtitleLineHeight, P, isEditor);
  const lightboxCounterClassName = getGridTextClassName(
    lightboxCounterFontSize,
    lightboxCounterLineHeight,
    `${P}-lightbox-counter`,
    `${P}-text-tight-leading`,
  );

  const colorVars = buildColorVars(P, {
    titleColor,
    subtitleColor,
    lightboxCounterColor,
  }, COLOR_VAR_MAP, STATE_KEYS);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const showTextOnHover = showText === 'On hover' && Boolean(isPreviewMode);
  const wrapperStateClasses = `${stateClass}${showTextOnHover ? ` ${P}-show-text-hover` : ''}`.trim();

  const resEntriesCount = entriesCount === 0 ? Infinity : entriesCount;

  const cropContent = (content ?? []).slice(0, resEntriesCount);

  const size = gridLayout.entryWidth ?? 0.2;

  const isCover = imageDisplay?.display === 'Cover';
  const ratioValue = imageDisplay?.ratioValue ?? '1:1';
  const ratioReversed = imageDisplay?.reversed ?? false;
  const [rW, rH] = ratioValue.split(':').map(Number);
  const effW = ratioReversed ? rH : rW;
  const effH = ratioReversed ? rW : rH;
  const aspectRatio = `${effW} / ${effH}`;

  const imageWrapperWidth = scalingValue(size ?? 0, isEditor);
  const isFitSlider = !isCover && slider !== 'Off';

  const imageWrapperStyle: React.CSSProperties = {
    width: imageWrapperWidth,
    ...(isCover
      ? { aspectRatio, height: 'auto', overflow: 'hidden' }
      : { height: 'auto' }),
  };

  const imageWrapperClassName = `${P}-item-image-wrapper${isFitSlider ? ` ${P}-item-image-wrapper-fit-slider` : ''}`.trim();
  const isTypeC = type === 'C';
  const shouldAlignEntries = isTypeC && alignEntries === 'On';
  const textBoxWidthStyle = `calc(${scalingValue(size ?? 0, isEditor)} * (${textBoxWidth} / 100))`;
  const controlWidthStyle = scalingValue(size * textBoxWidth / 100, isEditor);

  const imageStyle: React.CSSProperties = isCover
    ? {
        objectFit: 'cover',
        pointerEvents: 'auto',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
      }
    : {
        objectFit: 'contain',
        pointerEvents: 'auto',
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
      };

  const [dir, setDir] = useState('ltr');
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(Math.round(entries[0].contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clearAlignedHeights = () => {
      container.querySelectorAll<HTMLElement>('[data-grid-text-block]').forEach((el) => {
        el.style.minHeight = '';
      });
    };

    if (!shouldAlignEntries) {
      clearAlignedHeights();
      return;
    }

    const columnsCount = gridLayout.columnsCount;
    const applyAlignedHeights = () => {
      clearAlignedHeights();
      const itemEls = Array.from(container.querySelectorAll<HTMLElement>(`.${P}-item`));
      for (let rowStart = 0; rowStart < itemEls.length; rowStart += columnsCount) {
        const rowItems = itemEls.slice(rowStart, rowStart + columnsCount);
        const textBlocks = rowItems
          .map((itemEl) => itemEl.querySelector<HTMLElement>('[data-grid-text-block]'))
          .filter((el): el is HTMLElement => el !== null);
        if (textBlocks.length === 0) continue;

        const maxTextHeight = Math.max(...textBlocks.map((el) => el.offsetHeight));
        textBlocks.forEach((el) => {
          el.style.minHeight = `${maxTextHeight}px`;
        });
      }
    };

    applyAlignedHeights();

    const observer = new ResizeObserver(() => applyAlignedHeights());
    observer.observe(container);

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) applyAlignedHeights();
      });
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      clearAlignedHeights();
    };
  }, [
    P,
    shouldAlignEntries,
    cropContent,
    gridLayout.columnsCount,
    titleMarginTop,
    subtitleMarginTop,
    containerWidth,
  ]);

  const lightboxPortalStyle = (() => {
    const style: Record<string, string> = { ...(colorVars as Record<string, string>) };
    const articleWidth = containerRef.current
      ? getComputedStyle(containerRef.current).getPropertyValue('--cntrl-article-width').trim()
      : '';
    if (articleWidth) {
      style['--cntrl-article-width'] = articleWidth;
    }
    return style as React.CSSProperties;
  })();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOriginRect, setLightboxOriginRect] = useState<AnimRect | null>(null);

  const openLightbox = (e: React.MouseEvent<HTMLImageElement>, urls: string[], idx: number) => {
    if (isEditor && !isPreviewMode) return;
    if (lightbox === 'Off') return;
    const r = e.currentTarget.getBoundingClientRect();
    setLightboxOriginRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    setLightboxImages(urls);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  useEffect(() => {
    if (!lightboxOpen || lightbox !== 'On') return;
    if (typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, lightbox]);

  useEffect(() => {
    if (!isEditor || isPreviewMode) return;
    setLightboxOpen(false);
    setLightboxOriginRect(null);
  }, [isEditor, isPreviewMode]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div style={colorVars}>
        <div
          ref={containerRef}
          className={`${P}-wrapper ${P}-type-${type}${shouldAlignEntries ? ` ${P}-align-entries` : ''} ${wrapperStateClasses}`.trim()}
          style={{
            gridTemplateColumns: `repeat(${gridLayout.columnsCount}, minmax(0, 1fr))`,
            rowGap: scalingValue(verticalGap ?? 0, isEditor),
            columnGap: scalingValue(gridLayout.horizontalGap ?? 0, isEditor),
            width: scalingValue(gridLayout.wrapperWidth ?? 0, isEditor)
          }}>
          {cropContent.map((item: any, index: number) => {
            const hasTitle = hasText(item.title);
            const hasSubtitle = hasText(item.subtitle);

            return (
            <div
              key={index}
              className={`${P}-item`.trim()}
            >
              <div
                className={isEditMode ? `${P}-item-inner` : `${P}-item-inner-hidden`}
                style={{ width: (textBoxWidth ?? 0) > 100 ? `calc(${scalingValue(size ?? 0, isEditor)} * (${textBoxWidth} / 100))` : scalingValue(size ?? 0, isEditor) }}
              >
                <a href={(item.link?.length ?? 0) > 0 && lightbox === 'Off' ? item.link : undefined} target='_blank' className={`${P}-item-image-link`}>
                  {isTypeC && (
                    <div className={`${P}-item-text-block`} data-grid-text-block>
                      {hasTitle && (
                        <p className={titleTextClassName} style={{ width: textBoxWidthStyle, ...titleFieldCss, ...titleTextLeadingVars }}>
                          {item.title}
                        </p>
                      )}
                      {hasTitle && (
                        <div
                          data-controls={isEditMode ? 'titleMarginTop' : undefined}
                          className={isEditMode ? `${P}-control` : undefined}
                          style={{
                            height: scalingValue(titleMarginTop ?? 0, isEditor),
                            width: controlWidthStyle,
                          }}
                        />
                      )}
                      {hasSubtitle && (
                        <p className={subtitleTextClassName} style={{ width: textBoxWidthStyle, ...subtitleFieldCss, ...subtitleTextLeadingVars }}>
                          {item.subtitle}
                        </p>
                      )}
                      {hasSubtitle && (
                        <div
                          data-controls={isEditMode ? 'subtitleMarginTop' : undefined}
                          className={isEditMode ? `${P}-control` : undefined}
                          style={{
                            height: scalingValue(subtitleMarginTop ?? 0, isEditor),
                            width: controlWidthStyle,
                          }}
                        />
                      )}
                    </div>
                  )}
                  <div className={imageWrapperClassName} style={imageWrapperStyle}>
                    {(item.image?.length ?? 0) === 0
                      ? null
                      : slider === 'Off'
                        ?
                        (() => {
                          const media = item.image[0] as GridMedia;
                          const imageOnly = item.image.filter((entry: GridMedia) => !isVideoMedia(entry));
                          const imageUrls = imageOnly.map((entry: GridMedia) => entry.url);
                          return (
                            <GridMediaItem
                              media={media}
                              className={`${P}-item-${isVideoMedia(media) ? 'video' : 'image'}`.trim()}
                              style={imageStyle}
                              onImageClick={isVideoMedia(media) ? undefined : (e) => openLightbox(e, imageUrls, 0)}
                            />
                          );
                        })()
                        :
                        <>
                        {isFitSlider && (
                          <div className={`${P}-item-image-wrapper-sizer`} aria-hidden="true">
                            {item.image.map((media: GridMedia) => (
                              isVideoMedia(media) ? (
                                <video key={`sizer-${media.url}`} src={media.url} muted playsInline />
                              ) : (
                                <img key={`sizer-${media.url}`} src={media.url} alt="" />
                              )
                            ))}
                          </div>
                        )}
                        <Splide
                          key={`${transition}-${size}-${direction}-${sliderTiming}-${containerWidth}-${layoutId}`}
                          className={`${P}-item-slider`}
                          options={{
                            arrows: false,
                            pagination: false,
                            drag: false,
                            perPage: 1,
                            autoplay: true,
                            interval: sliderTiming * 1000,
                            width: '100%',
                            height: '100%',
                            speed: SLIDER_TRANSITION_MS,
                            type: transition === 'Fade' ? 'fade' : 'loop',
                            rewind: transition === 'Fade',
                            pauseOnHover: false,
                            pauseOnFocus: false,
                            direction: transition === 'Fade' ? 'ltr' : direction !== 'Random'
                              ? direction === 'Horizontal'
                                ? 'ltr'
                                : 'ttb'
                              : dir as 'ltr' | 'ttb' | 'rtl',
                          }}
                          onMoved={(splide) => {
                            if (direction !== 'Random' || transition === 'Fade') return;
                            const next = Math.random() > 0.5 ? Math.random() > 0.5 ? 'rtl' : 'ltr' : Math.random() > 0.5 ? 'btt' : 'ttb';
                            setDir(next);

                            setTimeout(() => {
                              splide.refresh();
                            }, 0);
                          }}
                        >
                          {item.image.map((media: GridMedia, imgIndex: number) => {
                            const imageOnly = item.image.filter((entry: GridMedia) => !isVideoMedia(entry));
                            const imageUrls = imageOnly.map((entry: GridMedia) => entry.url);
                            const imageIndex = imageOnly.findIndex((entry: GridMedia) => entry.url === media.url);
                            return (
                              <SplideSlide key={imgIndex}>
                                <GridMediaItem
                                  media={media}
                                  className={`${P}-item-${isVideoMedia(media) ? 'video' : 'image'}`.trim()}
                                  style={imageStyle}
                                  onImageClick={isVideoMedia(media) ? undefined : (e) => openLightbox(e, imageUrls, imageIndex)}
                                />
                              </SplideSlide>
                            );
                          })}
                        </Splide>
                        </>
                    }
                  </div>
                  {!isTypeC && (
                    <>
                      <div
                        data-controls={isEditMode && hasTitle ? 'titleMarginTop' : undefined}
                        className={isEditMode && hasTitle ? `${P}-control` : undefined}
                        style={{
                          height: hasTitle ? scalingValue(titleMarginTop ?? 0, isEditor) : 0,
                          width: controlWidthStyle,
                        }}
                      />
                      <p
                        className={titleTextClassName}
                        style={{ width: textBoxWidthStyle, ...titleFieldCss, ...titleTextLeadingVars }}
                      >
                        {item.title}
                      </p>
                      <div
                        data-controls={isEditMode && hasSubtitle ? 'subtitleMarginTop' : undefined}
                        className={isEditMode && hasSubtitle ? `${P}-control` : undefined}
                        style={{
                          height: hasSubtitle ? scalingValue(subtitleMarginTop ?? 0, isEditor) : 0,
                          width: controlWidthStyle,
                        }}
                      />
                      <p
                        className={subtitleTextClassName}
                        style={{ width: textBoxWidthStyle, ...subtitleFieldCss, ...subtitleTextLeadingVars }}
                      >
                        {item.subtitle}
                      </p>
                    </>
                  )}
                </a>
              </div>
            </div>
          );
          })}
        </div>
      </div>
      {(!isEditor || isPreviewMode) && lightboxOpen && typeof document !== 'undefined' && lightbox === 'On' &&
        createPortal(
          <div style={lightboxPortalStyle} data-selection="none">
            <Lightbox
              images={lightboxImages}
              index={lightboxIndex}
              imageDisplay={resolveLightboxImageDisplay(lightboxImageDisplay)}
              originRect={lightboxOriginRect}
              reverseClose={slider === 'Off'}
              onClose={() => setLightboxOpen(false)}
              onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)}
              onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)}
              counterClassName={lightboxCounterClassName}
              counterStyle={lightboxCounterFieldCss}
            />
          </div>,
          document.body
        )}
    </>
  );
}

type GridLayoutConfig = {
  entryWidth: number;
  horizontalGap: number;
  wrapperWidth: number;
  columnsCount: number;
  lockedParam?: 'wrapperWidth' | 'entryWidth' | 'horizontalGap' | null;
};

type GridSettings = {
  type: 'A' | 'B' | 'C';
  gridLayout: GridLayoutConfig;
  textBoxWidth: number;
  verticalGap: number;
  entriesCount: number;
  lightbox: 'On' | 'Off';
  imageDisplay: {
    display: 'Fit' | 'Cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
  lightboxImageDisplay?: 'Fit' | 'Cover' | { display?: 'Fit' | 'Cover' };
  slider: 'On' | 'Off';
  sliderTiming: number;
  direction: 'Horizontal' | 'Vertical' | 'Random',
  transition: 'Fade' | 'Slide',
  showText: 'Always' | 'On hover';
  alignEntries: 'On' | 'Off';
  titleMarginTop: number;
  subtitleMarginTop: number;
  titleColor: string;
  subtitleColor: string;
  lightboxCounterColor: string;
  titleFontFamily: string;
  titleFontSettings?: { fontWeight: number; fontStyle: string };
  titleFontSize?: number;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleWordSpacing?: number;
  titleTextAppearance?: TextStyles['textAppearance'];
  subtitleFontFamily: string;
  subtitleFontSettings?: { fontWeight: number; fontStyle: string };
  subtitleFontSize?: number;
  subtitleLineHeight?: number;
  subtitleLetterSpacing?: number;
  subtitleWordSpacing?: number;
  subtitleTextAppearance?: TextStyles['textAppearance'];
  lightboxCounterFontFamily: string;
  lightboxCounterFontSettings?: { fontWeight: number; fontStyle: string };
  lightboxCounterFontSize?: number;
  lightboxCounterLineHeight?: number;
  lightboxCounterLetterSpacing?: number;
  lightboxCounterWordSpacing?: number;
  lightboxCounterTextAppearance?: TextStyles['textAppearance'];
};

type ColorKeys =
  | 'titleColor'
  | 'subtitleColor'
  | 'lightboxCounterColor'

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  titleColor: 'title-color',
  subtitleColor: 'subtitle-color',
  lightboxCounterColor: 'lightbox-counter-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;
