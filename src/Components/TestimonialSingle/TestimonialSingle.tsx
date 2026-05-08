import cn from 'classnames';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { useScopedStyles } from '../utils/useScopedStyles';
import { readTestimonialTextMeasure } from '../utils/readTestimonialTextMeasure';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

function getCSS(P: string): string {
  return `
.${P}-container {
  position: relative;
  overflow-x: clip;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
}

.${P}-wrapper {
  position: relative;
  width: 100%;
  order: 1;
  display: flex;
  flex-direction: column;
  inset: 0;
  pointer-events: none;
  box-sizing: border-box;
  height: auto;
}

.${P}-fade-stack {
  position: relative;
  width: 100%;
}

.${P}-fade-item-prev {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.${P}-fade-item-current {
  position: relative;
  width: 100%;
}

@keyframes ${P}-testimonial-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ${P}-testimonial-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.${P}-fade-in {
  animation: ${P}-testimonial-fade-in 300ms ease-in forwards;
}

.${P}-fade-out {
  animation: ${P}-testimonial-fade-out 300ms ease-in forwards;
}

.${P}-controls {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.${P}-arrow {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  z-index: 1;
  padding: 0;
}

.${P}-next-arrow {
  left: unset;
}

.${P}-arrow-inner {
  all: unset;
  cursor: pointer;
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.${P}-arrow-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.${P}-mirror {
  transform: translate(-50%, -50%) scaleX(-1) !important;
}

.${P}-control {
  position: relative;
  z-index: 2;
  pointer-events: auto;
  width: 100%;
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
.${P}-icon {
  pointer-events: auto;
  width: 100%;
  height: 100%;
}
`;
}

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: TestimonialsItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

type RenderItemContentOpts = {
  textMinHeightPx?: number;
  captionMinHeightPx?: number;
  dataMeasureAttrs?: boolean;
};

export const TestimonialSingle = ({ settings, content, isEditor, isPreviewMode }: TestimonialsProps) => {
  const { prefix: P } = useScopedStyles();
  const items = content || [];
  const { autoplay, delay, align, width, imageMarginTop, textMarginTop, captionMarginTop, imageWidth, imageHeight, controlsWidth, controlsColor, controlsHoverColor } = settings;
  const isAnimating = autoplay === 'on' && !isPreviewMode;
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);
  const fadeTimerRef = useRef<number | null>(null);

  const overlayAlignItems = useMemo(() => {
    switch (align) {
      case 'center':
        return 'center' as const;
      case 'end':
        return 'flex-end' as const;
      case 'start':
      default:
        return 'flex-start' as const;
    }
  }, [align]);

  const overlayTextAlign = useMemo(() => {
    switch (align) {
      case 'center':
        return 'center' as const;
      case 'end':
        return 'right' as const;
      case 'start':
      default:
        return 'left' as const;
    }
  }, [align]);

  useEffect(() => {
    setActiveIndex(0);
    setPrevIndex(null);
    setIsFading(false);
  }, [items.length]);

  const currentItem = items[activeIndex];
  const previousItem = prevIndex === null ? null : items[prevIndex];

  const resolveTextStyle = (kind: 'text' | 'caption'): TextStyles => {
    const styles: TextStyles = {
      fontSettings: {
        fontFamily: (settings as any)?.[`${kind}FontFamily`] ?? 'Arial',
        fontWeight: (settings as any)?.[`${kind}FontSettings`]?.fontWeight ?? 400,
        fontStyle: (settings as any)?.[`${kind}FontSettings`]?.fontStyle ?? 'normal',
      },
      textAppearance: {
        textTransform: (settings as any)?.[`${kind}TextAppearance`]?.textTransform ?? 'none',
        textDecoration: (settings as any)?.[`${kind}TextAppearance`]?.textDecoration ?? 'none',
        fontVariant: (settings as any)?.[`${kind}TextAppearance`]?.fontVariant ?? 'normal',
      },
      fontSize: (settings as any)?.[`${kind}FontSize`] ?? 0.01,
      lineHeight: (settings as any)?.[`${kind}LineHeight`] ?? 0.01,
      letterSpacing: (settings as any)?.[`${kind}LetterSpacing`] ?? 0,
      wordSpacing: (settings as any)?.[`${kind}WordSpacing`] ?? 0,
      color: (settings as any)?.[`${kind}Color`] ?? '#000000',
    };
    return styles;
  };

  const textStyle = resolveTextStyle('text');
  const captionStyle = resolveTextStyle('caption');
  const shouldMeasureTextExtents =
    items.length > 1 && items.some((item) => (item.text?.length ?? 0) > 0 || (item.caption?.length ?? 0) > 0);
  const measureLayerRef = useRef<HTMLDivElement>(null);
  const [measuredTextMinPx, setMeasuredTextMinPx] = useState(0);
  const [measuredCaptionMinPx, setMeasuredCaptionMinPx] = useState(0);
  const controls: TestimonialsSettings['controls'] = settings.controls ?? { mode: 'Off', icon: null };
  const canSwitch = items.length > 1;

  const commitTransition = useCallback((currentIndex: number, nextIndex: number) => {
    if (!canSwitch) return currentIndex;
    if (nextIndex === currentIndex) return currentIndex;
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    setPrevIndex(currentIndex);
    setIsFading(true);
    fadeTimerRef.current = window.setTimeout(() => {
      setPrevIndex(null);
      setIsFading(false);
      fadeTimerRef.current = null;
    }, 300);
    return nextIndex;
  }, [canSwitch]);

  const goPrev = useCallback(() => {
    if (!canSwitch) return;
    setActiveIndex((currentIndex) => commitTransition(currentIndex, (currentIndex - 1 + items.length) % items.length));
  }, [canSwitch, commitTransition, items.length]);

  const goNext = useCallback(() => {
    if (!canSwitch) return;
    setActiveIndex((currentIndex) => commitTransition(currentIndex, (currentIndex + 1) % items.length));
  }, [canSwitch, commitTransition, items.length]);

  useEffect(() => {
    if (!isAnimating || !canSwitch) return;
    const safeDelayMs = Math.max(300, Number.isFinite(delay * 1000) ? delay * 1000 : 0);
    const id = window.setInterval(() => {
      setActiveIndex((currentIndex) => commitTransition(currentIndex, (currentIndex + 1) % items.length));
    }, safeDelayMs);
    return () => {
      window.clearInterval(id);
    };
  }, [isAnimating, canSwitch, commitTransition, items.length, delay]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const renderItemContent = (item: TestimonialsItem, opts?: RenderItemContentOpts) => {
    const textMinHeightPx = opts?.textMinHeightPx;
    const captionMinHeightPx = opts?.captionMinHeightPx;
    const dataMeasureAttrs = opts?.dataMeasureAttrs;

    return (
      <>
        {item.text && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: overlayAlignItems, width: '100%' }}>
            <div
              data-controls="textMarginTop"
              className={`${P}-control`}
              style={{ height: scalingValue(textMarginTop ?? 0, isEditor ?? false) }}
            />
            <div
              {...(dataMeasureAttrs && { 'data-testimonial-measure': 'text' as const })}
              style={{
                ...textStylesToCss(textStyle, isEditor),
                ...(textMinHeightPx && textMinHeightPx > 0 ? { minHeight: textMinHeightPx } : {}),
                textAlign: overlayTextAlign,
                pointerEvents: 'auto',
              }}
            >
              <RichTextRenderer content={item.text} />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: overlayAlignItems, width: '100%' }}>
          <div
            data-controls="imageMarginTop"
            className={`${P}-control`}
            style={{ height: scalingValue(imageMarginTop ?? 0, isEditor ?? false) }}
          />
          <div style={{ width: scalingValue(imageWidth ?? 0, isEditor ?? false), height: scalingValue(imageHeight ?? 0, isEditor ?? false)}}>
            {item.image?.url && 
              <img
                src={item.image?.url}
                alt={item.image?.name ?? ''}
                className={`${P}-icon`}
                style={{ objectFit: item.image?.objectFit || 'contain' }}
              />
            }
          </div>
        </div>
        {item.caption && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: overlayAlignItems, width: '100%' }}>
            <div
              data-controls="captionMarginTop"
              className={`${P}-control`}
              style={{ height: scalingValue(captionMarginTop ?? 0, isEditor ?? false) }}
            />
            <div
              {...(dataMeasureAttrs ? { 'data-testimonial-measure': 'caption' as const } : {})}
              style={{
                ...textStylesToCss(captionStyle, isEditor),
                ...(captionMinHeightPx && captionMinHeightPx > 0 ? { minHeight: captionMinHeightPx } : {}),
                textAlign: overlayTextAlign,
                pointerEvents: 'auto',
              }}
            >
              <RichTextRenderer content={item.caption} />
            </div>
          </div>
        )}
      </>
    );
  };

  const onMeasuredExtents = useCallback((extents: { maxTextPx: number; maxCaptionPx: number }) => {
    setMeasuredTextMinPx(extents.maxTextPx);
    setMeasuredCaptionMinPx(extents.maxCaptionPx);
  }, []);

  useLayoutEffect(() => {
    if (!shouldMeasureTextExtents) {
      onMeasuredExtents({ maxTextPx: 0, maxCaptionPx: 0 });
      return;
    }
    const root = measureLayerRef.current;
    if (!root) return;
    const readExtents = () => {
      readTestimonialTextMeasure(root, onMeasuredExtents);
    };
    readExtents();
    const ro = new ResizeObserver(readExtents);
    ro.observe(root);
    return () => {
      ro.disconnect();
    };
  }, [shouldMeasureTextExtents, onMeasuredExtents, content]);

  if (!currentItem) return <></>;

  const visibleContentOpts: RenderItemContentOpts | undefined = shouldMeasureTextExtents
    ? { textMinHeightPx: measuredTextMinPx, captionMinHeightPx: measuredCaptionMinPx }
    : undefined;

  return (
    <>
      <div className={`${P}-container`}>
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        <div
          className={`${P}-wrapper`}
          style={{ width: scalingValue(width ?? 0, isEditor ?? false), alignItems: overlayAlignItems }}
        >
          {shouldMeasureTextExtents && (
            <div
              ref={measureLayerRef}
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                visibility: 'hidden',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            >
              {items.map((item, index) => (
                <div key={index} style={{ width: '100%' }}>
                  {renderItemContent(item, { dataMeasureAttrs: true })}
                </div>
              ))}
            </div>
          )}
          <div className={`${P}-fade-stack`}>
            {previousItem && isFading && (
              <div className={cn(`${P}-fade-item-prev`, `${P}-fade-out`)}>
                {renderItemContent(previousItem, visibleContentOpts)}
              </div>
            )}
            <div className={cn(`${P}-fade-item-current`, isFading ? `${P}-fade-in` : undefined)}>
              {renderItemContent(currentItem, visibleContentOpts)}
            </div>
          </div>
        </div>
        {controls.mode === 'On' && (
          <div className={`${P}-controls`}>
            <div
              className={`${P}-arrow`}
              style={{
                width: scalingValue(controlsWidth ?? 0.02, isEditor ?? false),
                height: scalingValue(controlsWidth ?? 0.02, isEditor ?? false),
                ['--arrow-hover-color' as string]: controlsHoverColor,
              }}
            >
              <button
                type="button"
                className={`${P}-arrow-inner`}
                onClick={goPrev}
                disabled={!canSwitch}
                aria-label="Previous testimonial"
              >
                {controls.icon  && (
                  <SvgImage
                    url={controls.icon }
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={cn(`${P}-arrow-img`, `${P}-mirror`)}
                  />
                )}
              </button>
            </div>
            <div
              className={cn(`${P}-arrow`, `${P}-next-arrow`)}
              style={{
                width: scalingValue(controlsWidth ?? 0.02, isEditor ?? false),
                height: scalingValue(controlsWidth ?? 0.02, isEditor ?? false),
                ['--arrow-hover-color' as string]: controlsHoverColor,
              }}
            >
              <button
                type="button"
                className={`${P}-arrow-inner`}
                onClick={goNext}
                disabled={!canSwitch}
                aria-label="Next testimonial"
              >
                {controls.icon && (
                  <SvgImage
                    url={controls.icon }
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={`${P}-arrow-img`}
                  />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};


export type TestimonialsItem = {
  image?: {
    url?: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  text?: any[];
  caption?: any[];
};

type TestimonialsSettings = {
  autoplay: 'on' | 'off';
  delay: number;
  align: 'start' | 'center' | 'end';
  width: number;
  imageMarginTop?: number;
  imageWidth?: number;
  imageHeight?: number;
  textMarginTop?: number;
  captionMarginTop?: number;
  controlsColor: string;
  controlsHoverColor: string;
  controlsWidth?: number;
  controls: {
    mode?: 'On' | 'Off';
    icon?: string | null;
  };
};
