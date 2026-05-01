import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import { CommonComponentProps } from '../props';
import { buildColorVars, getFormFieldValidationError, scalingValue, useScopedStyles } from '../utils/index';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  display: grid;
  align-items: start;
  width: 100%;
  column-gap: 10%;
  min-height: ${sv(48)};
}
.${P}-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.${P}-item-image {
  width: 100%;
  height: 100%;
  display: block;
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
`;
}

type GridProps = {
  settings: GridSettings;
  content?: any;
  isEditor?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: GridSettings) => void;
} & CommonComponentProps;

type AnimRect = { top: number; left: number; width: number; height: number };

type LightboxProps = {
  images: string[];
  index: number;
  imageDisplay: 'Fit' | 'Cover';
  originRect: AnimRect | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const LIGHTBOX_ANIM_MS = 500;
const LIGHTBOX_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

function Lightbox({ images, index, imageDisplay, originRect, onClose, onPrev, onNext }: LightboxProps) {
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

  // Once the user starts switching images, drop the size/position transition so that
  // finalRect updates (driven by each image's aspect ratio) apply instantly instead of animating.
  useEffect(() => {
    if (prevIndexRef.current !== index) {
      setTransitionsEnabled(false);
    }
    prevIndexRef.current = index;
  }, [index]);

  const handleClose = () => {
    if (phase === 'closing') return;
    setPhase('closing');
  };

  const animatedRect = phase === 'opening' ? (originRect ?? finalRect) : finalRect;
  const isOpen = phase === 'open';
  const isClosing = phase === 'closing';

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
            color: '#E6E6E6',
            letterSpacing: '-0.6px',
            lineHeight: '16px',
            opacity: isOpen ? 1 : 0,
            transition: `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`,
          }}
        >
          <p>{index + 1}</p>
          <p>/</p>
          <p>{images.length}</p>
        </div>
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
            opacity: isClosing ? 0 : 1,
            transition: isClosing
              ? `opacity ${LIGHTBOX_ANIM_MS}ms ${LIGHTBOX_EASING}`
              : transitionsEnabled
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

export function Grid({ settings, content, isEditor, metadata, activeEvent }: GridProps) {
  const { prefix: P } = useScopedStyles();
  const {
    type = 'A',
    fieldsToShow = 2,
    textBoxWidth,
    verticalGap,
    entriesCount,
    lightbox,
    imageSize,
    imageDisplay,
    slider,
    sliderTiming,
    direction,
    transition,
    titleColor,
    subtitleColor,
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

  const colorVars = buildColorVars(P, {
    titleColor,
    subtitleColor,
  }, COLOR_VAR_MAP, STATE_KEYS);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const wrapperStateClasses = `${stateClass}`.trim();

  const resEntriesCount = entriesCount === 0 ? Infinity : entriesCount;

  const cropContent = (content ?? []).slice(0, resEntriesCount);

  const imageSizeMap = {
    Small: 0.1,
    Medium: 0.2,
    Big: 0.3,
  } as const;

  const size = imageSizeMap[imageSize] ?? 0.2;

  const [dir, setDir] = useState('ltr');

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOriginRect, setLightboxOriginRect] = useState<AnimRect | null>(null);

  const openLightbox = (e: React.MouseEvent<HTMLImageElement>, urls: string[], idx: number) => {
    if (lightbox === 'Off') return;
    const r = e.currentTarget.getBoundingClientRect();
    setLightboxOriginRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    setLightboxImages(urls);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div style={colorVars}>
        <div
          className={`${P}-wrapper ${P}-type-${type} ${wrapperStateClasses}`.trim()}
          style={{
            gridTemplateColumns: `repeat(${fieldsToShow}, 1fr)`,
            rowGap: scalingValue(verticalGap ?? 0, isEditor),
          }}>
          {cropContent.map((item, index) => (
            <div
              key={index}
              className={`${P}-item`.trim()}
            >
              <div className={`${P}-item-image-wrapper`} style={{ width: scalingValue(size ?? 0, isEditor), height: scalingValue(size ?? 0, isEditor) }}>
                {slider === 'Off'
                  ?
                  <img
                    src={item.image[0].url}
                    alt={item.image[0].name}
                    className={`${P}-item-image`.trim()}
                    style={{
                      objectFit: imageDisplay === 'Cover' ? 'cover' : 'contain'
                    }}
                    onClick={(e) => openLightbox(e, item.image.map((i: any) => i.url), 0)}
                  />
                  :
                  <Splide
                    key={`${transition}-${imageSize}-${direction}-${sliderTiming}`}
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
                      speed: 500,
                      type: transition === 'Fade' ? 'fade' : 'loop',
                      rewind: transition === 'Fade',
                      pauseOnHover: false,
                      pauseOnFocus: false,
                      direction: transition === 'Fade' ? 'ltr' : direction !== 'Random'
                        ? direction === 'Horizontal'
                          ? 'ltr'
                          : 'ttb'
                        : dir,
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
                    {item.image.map((img: { url: string; name?: string }, imgIndex: number) => (
                      <SplideSlide key={imgIndex}>
                        <img
                          src={img.url}
                          alt={img.name}
                          className={`${P}-item-image`.trim()}
                          style={{
                            objectFit: imageDisplay === 'Cover' ? 'cover' : 'contain'
                          }}
                          onClick={(e) => openLightbox(e, item.image.map((i: any) => i.url), imgIndex)}
                        />
                      </SplideSlide>
                    ))}
                  </Splide>
                }
              </div>
              <p className={`${P}-item-title`.trim()} style={{ width: `calc(${scalingValue(size ?? 0, isEditor)} * (${textBoxWidth} / 100))`, ...titleFieldCss }}>
                {item.title}
              </p>
              {type === 'B' && <p className={`${P}-item-subtitle`.trim()} style={{ width: `calc(${scalingValue(size ?? 0, isEditor)} * (${textBoxWidth} / 100))`, ...subtitleFieldCss }}>
                {item.subtitle}
              </p>}
            </div>
          ))}
        </div>
      </div>
      {lightboxOpen && typeof document && document.getElementById("grid-component-lightbox-portal") && lightbox === 'On' &&
        createPortal(
          <div data-selection="none">
            <Lightbox
              images={lightboxImages}
              index={lightboxIndex}
              imageDisplay={imageDisplay}
              originRect={lightboxOriginRect}
              onClose={() => setLightboxOpen(false)}
              onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)}
              onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)}
            />
          </div>,
          document.body
        )}
    </>
  );
}

type GridSettings = {
  type: 'A' | 'B';
  fieldsToShow: number;
  textBoxWidth: number;
  verticalGap: number;
  entriesCount: number;
  lightbox: 'On' | 'Off';
  imageSize: 'Small' | 'Medium' | 'Big';
  imageDisplay: 'Fit' | 'Cover';
  slider: 'On' | 'Off';
  sliderTiming: number;
  direction: 'Horizontal' | 'Vertical' | 'Random',
  transition: 'Fade' | 'Slide',
  titleColor: string;
  subtitleColor: string;
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
};

type ColorKeys =
  | 'titleColor'
  | 'subtitleColor'

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  titleColor: 'title-color',
  subtitleColor: 'subtitle-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;
