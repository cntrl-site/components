import cn from 'classnames';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { useScopedStyles } from '../utils/useScopedStyles';
import { getTestimonialMeasureExtents } from '../utils/getTestimonialMeasureExtents';

function getCSS(P: string): string {
  return `
.${P}-container {
  overflow-x: clip;
  display: flex;
  height: 100%;
  width: 100%;
  flexDirection: column;
  alignItems: center;
}

.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  order: 1;
  display: flex;
  flexDirection: column;
  inset: 0;
  pointerEvents: none;
  height: 100%;
  boxSizing: border-box;
  position: relative;
}

.${P}-wrapper-autoplay-off {
  overflow-x: hidden;
}

.${P}-elements-overlay {
  position: relative;
  inset: 0;
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
  pointerEvents: auto;
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

type CaptionStyleSettings = {
  fontSettings: {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
  };
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

  const resolveCaptionStyle = (
    kind: 'text' | 'caption'
  ): CaptionStyles | undefined => {
    const fromNested = (settings as any)?.styles?.[kind] as CaptionStyles | undefined;
    if (fromNested) return fromNested;

    const prefix = kind === 'text' ? 'text' : 'caption';
    const fontFamily = (settings as any)?.[`${prefix}FontFamily`];
    const fontSettings = (settings as any)?.[`${prefix}FontSettings`];
    const letterSpacing = (settings as any)?.[`${prefix}LetterSpacing`];
    const wordSpacing = (settings as any)?.[`${prefix}WordSpacing`];
    const textAlign = (settings as any)?.[`${prefix}TextAlign`];
    const textAppearance = (settings as any)?.[`${prefix}TextAppearance`];
    const color = (settings as any)?.[`${prefix}Color`];
    const fontSize = (settings as any)?.[`${prefix}FontSize`];
    const lineHeight = (settings as any)?.[`${prefix}LineHeight`];

    const hasAnyFlat =
      typeof fontFamily === 'string' ||
      !!fontSettings ||
      typeof letterSpacing === 'number' ||
      typeof wordSpacing === 'number' ||
      typeof textAlign === 'string' ||
      !!textAppearance ||
      typeof color === 'string' ||
      typeof fontSize === 'number' ||
      typeof lineHeight === 'number';
    if (!hasAnyFlat) return undefined;

    const flat: CaptionStyleSettings = {
      widthSettings: { width: 0.13, sizing: 'manual' },
      fontSettings: {
        fontFamily: typeof fontFamily === 'string' ? fontFamily : 'Arial',
        fontWeight: typeof fontSettings?.fontWeight === 'number' ? fontSettings.fontWeight : 400,
        fontStyle: typeof fontSettings?.fontStyle === 'string' ? fontSettings.fontStyle : 'normal',
      },
      letterSpacing: typeof letterSpacing === 'number' ? letterSpacing : 0,
      wordSpacing: typeof wordSpacing === 'number' ? wordSpacing : 0,
      textAlign: (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') ? textAlign : 'left',
      fontSizeLineHeight: {
        fontSize: typeof fontSize === 'number' ? fontSize : 0.01,
        lineHeight: typeof lineHeight === 'number' ? lineHeight : 0.01,
      },
      textAppearance: {
        textTransform: textAppearance?.textTransform ?? 'none',
        textDecoration: textAppearance?.textDecoration ?? 'none',
        fontVariant: textAppearance?.fontVariant ?? 'normal',
      },
      color: typeof color === 'string' ? color : '#000000',
    };

    return flat as CaptionStyles;
  };

  const textStyle = resolveCaptionStyle('text');
  const captionStyle = resolveCaptionStyle('caption');
  const scaled = (v: number) => scalingValue(v, isEditor ?? false);

  const shouldMeasureTextExtents = items.length > 1 && (!!textStyle || !!captionStyle);
  const measureLayerRef = useRef<HTMLDivElement>(null);
  const [measuredTextMinPx, setMeasuredTextMinPx] = useState(0);
  const [measuredCaptionMinPx, setMeasuredCaptionMinPx] = useState(0);

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

  const transitionToIndex = useCallback((nextIndex: number) => {
    setActiveIndex((currentIndex) => commitTransition(currentIndex, nextIndex));
  }, [commitTransition]);

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
    const id = window.setInterval(() => {
      setActiveIndex((currentIndex) => commitTransition(currentIndex, (currentIndex + 1) % items.length));
    }, delay);
    return () => {
      window.clearInterval(id);
    };
  }, [isAnimating, canSwitch, commitTransition, items.length, delay]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const controls: TestimonialsSettings['controls'] = settings.controls ?? {
    mode: 'Off',
    icon: null,
  };

  const customArrowsUrl = controls.mode === 'On' ? (controls.icon ?? null) : null;
  const controlsInsetX = useMemo(() => scaled(0.01), [isEditor]);
  const controlsIconSize = useMemo(
    () => scalingValue(controlsWidth ?? 0.02, isEditor ?? false),
    [controlsWidth, isEditor]
  );

  const renderItemContent = useCallback((item: TestimonialsItem, opts?: RenderItemContentOpts) => {
    const textMinHeightPx = opts?.textMinHeightPx;
    const captionMinHeightPx = opts?.captionMinHeightPx;
    const dataMeasureAttrs = opts?.dataMeasureAttrs;
    const textSection = textStyle
      ? (() => {
          const { fontSettings, letterSpacing, wordSpacing, fontSizeLineHeight, textAppearance, color } = textStyle;
          return (
        <div
          key="text"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: overlayAlignItems,
            width: '100%',
          }}
        >
          <div
            data-controls="textMarginTop"
            className={`${P}-control`}
            style={{ height: scalingValue(textMarginTop ?? 0, isEditor ?? false), width: '100%' }}
          />
          <div
            {...(dataMeasureAttrs ? { 'data-testimonial-measure': 'text' as const } : {})}
            style={{
              fontFamily: fontSettings.fontFamily,
              fontWeight: fontSettings.fontWeight,
              fontStyle: fontSettings.fontStyle,
              ...(typeof textMinHeightPx === 'number' && textMinHeightPx > 0 ? { minHeight: textMinHeightPx } : {}),
              letterSpacing: scalingValue(letterSpacing, isEditor),
              wordSpacing: scalingValue(wordSpacing, isEditor),
              textAlign: overlayTextAlign,
              fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
              lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
              textTransform: textAppearance.textTransform ?? 'none',
              textDecoration: textAppearance.textDecoration ?? 'none',
              fontVariant: textAppearance.fontVariant ?? 'normal',
              color,
              pointerEvents: 'auto',
            }}
          >
            <RichTextRenderer content={item.text ?? []} />
          </div>
        </div>
          );
        })()
      : null;

    const captionSection = captionStyle
      ? (() => {
          const { fontSettings, letterSpacing, wordSpacing, fontSizeLineHeight, textAppearance, color } = captionStyle;
          return (
        <div
          key="caption"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: overlayAlignItems,
            width: '100%',
          }}
        >
          <div
            data-controls="captionMarginTop"
            className={`${P}-control`}
            style={{ height: scalingValue(captionMarginTop ?? 0, isEditor ?? false), width: '100%' }}
          />
          <div
            {...(dataMeasureAttrs ? { 'data-testimonial-measure': 'caption' as const } : {})}
            style={{
              fontFamily: fontSettings.fontFamily,
              fontWeight: fontSettings.fontWeight,
              fontStyle: fontSettings.fontStyle,
              ...(typeof captionMinHeightPx === 'number' && captionMinHeightPx > 0 ? { minHeight: captionMinHeightPx } : {}),
              letterSpacing: scalingValue(letterSpacing, isEditor),
              wordSpacing: scalingValue(wordSpacing, isEditor),
              textAlign: overlayTextAlign,
              fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
              lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
              textTransform: textAppearance.textTransform ?? 'none',
              textDecoration: textAppearance.textDecoration ?? 'none',
              fontVariant: textAppearance.fontVariant ?? 'normal',
              color,
              pointerEvents: 'auto',
            }}
          >
            <RichTextRenderer content={item.caption} />
          </div>
        </div>
          );
        })()
      : null;

    return (
      <>
        {textSection}
        <div
          key="image"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: overlayAlignItems,
            width: '100%',
          }}
        >
          
          <div style={{ width: scalingValue(imageWidth ?? 0, isEditor ?? false), height: scalingValue(imageHeight ?? 0, isEditor ?? false)}}>
            {item.image?.url && <div
              data-controls="imageMarginTop"
              className={`${P}-control`}
              style={{ height: scalingValue(imageMarginTop ?? 0, isEditor ?? false), width: '100%' }}
            />}
            {item.image?.url && <img
              src={item.image?.url}
              alt={item.image?.name}
              className={`${P}-icon`}
              style={{ objectFit: item.image?.objectFit || 'cover' }}
            />}
          </div>
        </div>
        {captionSection}
      </>
    );
  }, [
    captionMarginTop,
    captionStyle,
    imageMarginTop,
    imageWidth,
    imageHeight,
    isEditor,
    overlayAlignItems,
    overlayTextAlign,
    textMarginTop,
    textStyle,
  ]);

  useLayoutEffect(() => {
    if (!shouldMeasureTextExtents) {
      setMeasuredTextMinPx(0);
      setMeasuredCaptionMinPx(0);
      return;
    }
    const root = measureLayerRef.current;
    if (!root) return;
    const readExtents = () => {
      const { maxTextPx, maxCaptionPx } = getTestimonialMeasureExtents(root);
      setMeasuredTextMinPx(maxTextPx);
      setMeasuredCaptionMinPx(maxCaptionPx);
    };

    readExtents();
    const ro = new ResizeObserver(readExtents);
    ro.observe(root);
    return () => {
      ro.disconnect();
    };
  }, [shouldMeasureTextExtents, items, renderItemContent]);

  if (!currentItem) return <></>;

  const visibleContentOpts: RenderItemContentOpts | undefined = shouldMeasureTextExtents
    ? { textMinHeightPx: measuredTextMinPx, captionMinHeightPx: measuredCaptionMinPx }
    : undefined;

  return (
    <>
      <div className={`${P}-container`}>
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        <div
          className={cn(`${P}-elements-overlay`, `${P}-wrapper`, autoplay === 'off' && `${P}-wrapper-autoplay-off`)}
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
          <div
            className={`${P}-controls`}
            style={{
              paddingLeft: controlsInsetX,
              paddingRight: controlsInsetX,
            }}
          >
            <div
              className={`${P}-arrow`}
              style={{
                width: controlsIconSize,
                height: controlsIconSize,
                ['--arrow-hover-color' as string]: controlsHoverColor,
              }}
            >
              <button
                type="button"
                className={`${P}-arrow-inner`}
                onClick={goPrev}
                aria-label="Previous testimonial"
              >
                {customArrowsUrl && (
                  <SvgImage
                    url={customArrowsUrl}
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
                width: controlsIconSize,
                height: controlsIconSize,
                ['--arrow-hover-color' as string]: controlsHoverColor,
              }}
            >
              <button
                type="button"
                className={`${P}-arrow-inner`}
                onClick={goNext}
                aria-label="Next testimonial"
              >
                {customArrowsUrl && (
                  <SvgImage
                    url={customArrowsUrl}
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
  text: any[];
  caption: any[];
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
  styles: TestimonialsStyles;
  controlsColor: string;
  controlsHoverColor: string;
  controlsWidth?: number;
  controls: {
    mode?: 'On' | 'Off';
    icon?: string | null;
  };
};

type CaptionStyles = {
  fontSettings: {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
  };
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

type TestimonialsStyles = {
  text: CaptionStyles;
  caption: CaptionStyles;
};