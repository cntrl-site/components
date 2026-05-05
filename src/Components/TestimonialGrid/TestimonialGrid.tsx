import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { useScopedStyles } from '../utils/useScopedStyles';

function getCSS(P: string): string {
  return `
.${P}-marquee-wrapper {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.${P}-marquee-track {
  display: flex;
  flex-direction: row;
  width: max-content;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.${P}-marquee-set {
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
}

.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  order: 1;
}

.${P}-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.${P}-elements-overlay {
  position: relative;
  inset: 0;
}

.${P}-control {
  position: relative;
  z-index: 2;
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

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: TestimonialsItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

type CaptionStyleFromFlatSettings = {
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

const PX_PER_SEC_PER_SPEED_UNIT = 30;

const parseSpeed = (speed: unknown): number => {
  if (typeof speed === 'number') return speed;
  const n = parseFloat(String(speed ?? ''));
  return Number.isFinite(n) ? n : 0;
};

const resolveCaptionTextStyles = (caption: CaptionStyles): TextStyles => ({
  fontSettings: { ...caption.fontSettings },
  letterSpacing: caption.letterSpacing,
  wordSpacing: caption.wordSpacing,
  fontSize: caption.fontSizeLineHeight.fontSize,
  lineHeight: caption.fontSizeLineHeight.lineHeight,
  textAppearance: caption.textAppearance,
  color: caption.color,
});

type RenderCardOpts = {
  textMinHeightPx?: number;
  captionMinHeightPx?: number;
  dataMeasureAttrs?: boolean;
};

type RenderTextOpts = {
  controlsName?: string;
  marginTop?: number;
  minHeightPx?: number;
  dataMeasureKind?: 'text' | 'caption';
};

export const Testimonials = ({ settings, content, isEditor, isPreviewMode }: TestimonialsProps) => {
  const { prefix: P } = useScopedStyles();
  const { autoplay, align, speed, direction, pauseOnHover, gap, cardWidth, corners, stroke, strokeColor, bgColor, padding, logoMarginTop, logoWidth, logoHeight, captionMarginTop } = settings;
  const isAnimating = autoplay === 'on' && !isPreviewMode;
  const pxPerSec = Math.max(0, parseSpeed(speed)) * PX_PER_SEC_PER_SPEED_UNIT;
  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [setWidth, setSetWidth] = useState(0);
  const progressRef = useRef(0);
  const hoveringRef = useRef(false);
  const animRef = useRef<Animation | null>(null);
  const hoverPauseEnabled = isAnimating && pauseOnHover === 'on';
  const measureLayerRef = useRef<HTMLDivElement>(null);
  const [measuredTextMinPx, setMeasuredTextMinPx] = useState(0);
  const [measuredCaptionMinPx, setMeasuredCaptionMinPx] = useState(0);

  const normalizedDirection = useMemo<'left' | 'right'>(() => {
    if (typeof direction === 'boolean') return direction ? 'right' : 'left';
    const d = String(direction ?? '').trim().toLowerCase();
    return d === 'right' ? 'right' : 'left';
  }, [direction]);

  const lastDirectionRef = useRef<'left' | 'right'>(normalizedDirection);

  const resolveCaptionStyle = (kind: 'text' | 'caption'): CaptionStyles | undefined => {
    const fromNested = (settings as any)?.styles?.[kind] as CaptionStyles | undefined;
    if (fromNested) return fromNested;

    const prefix = kind === 'text' ? 'text' : 'caption';
    const fontFamily = (settings as any)?.[`${prefix}FontFamily`];
    const fontSettings = (settings as any)?.[`${prefix}FontSettings`];
    const letterSpacing = (settings as any)?.[`${prefix}LetterSpacing`];
    const wordSpacing = (settings as any)?.[`${prefix}WordSpacing`];
    const textAlign = (settings as any)?.[`${prefix}TextAlign`];
    const textAppearance = (settings as any)?.[`${prefix}TextAppearance`];
    const color =
      (settings as any)?.[`${prefix}Color`] ??
      (kind === 'text' ? (settings as any)?.textColor : undefined) ??
      (kind === 'caption' ? (settings as any)?.captionColor : undefined);
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

    const flat: CaptionStyleFromFlatSettings = {
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

  const shouldMeasureTextExtents = useMemo(
    () => (content?.length ?? 0) > 1 && (!!textStyle || !!captionStyle),
    [content, textStyle, captionStyle]
  );

  const copies = useMemo(() => {
    if (autoplay === 'off' || content?.length === 0) return 1;
    if (setWidth <= 0 || containerWidth <= 0) return 2;
    return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
  }, [autoplay, content?.length, setWidth, containerWidth]);

  useLayoutEffect(() => {
    if (autoplay === 'off') return;
    const wrapper = wrapperRef.current;
    const set = setRef.current;
    if (!wrapper || !set) return;
    let raf = 0;
    const measure = () => {
      setContainerWidth(wrapper.getBoundingClientRect().width);
      setSetWidth(set.getBoundingClientRect().width);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrapper);
    ro.observe(set);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [autoplay, content?.length]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (autoplay === 'off' || !track || !isAnimating) return;
    if (setWidth <= 0 || pxPerSec <= 0) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return;
    }
    if (lastDirectionRef.current !== normalizedDirection) {
      progressRef.current = 1 - progressRef.current;
      lastDirectionRef.current = normalizedDirection;
    }
    const duration = (setWidth / pxPerSec) * 1000;
    const from = normalizedDirection === 'left' ? -setWidth : 0;
    const to = normalizedDirection === 'left' ? 0 : -setWidth;
    const anim = track.animate(
      [{ transform: `translate3d(${from}px, 0, 0)` }, { transform: `translate3d(${to}px, 0, 0)` }],
      { duration, iterations: Infinity, easing: 'linear' }
    );
    anim.currentTime = progressRef.current * duration;
    if (hoveringRef.current) anim.pause();
    animRef.current = anim;

    return () => {
      const ct = typeof anim.currentTime === 'number' ? anim.currentTime : 0;
      progressRef.current = duration > 0 ? (ct / duration) % 1 : 0;
      anim.cancel();
      if (animRef.current === anim) animRef.current = null;
    };
  }, [autoplay, isAnimating, setWidth, pxPerSec, normalizedDirection]);

  const onTrackEnter = () => {
    if (!hoverPauseEnabled) return;
    hoveringRef.current = true;
    animRef.current?.pause();
  };
  const onTrackLeave = () => {
    if (!hoverPauseEnabled) return;
    hoveringRef.current = false;
    animRef.current?.play();
  };

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

  const renderText = useCallback(
    (style: CaptionStyles, richContent: any[], key: string, options?: RenderTextOpts) => (
      <div
        key={key}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: overlayAlignItems,
          width: '100%',
        }}
      >
        <div
          data-controls={options?.controlsName}
          data-controls-axis="y"
          className={`${P}-control`}
          style={{ width: '100%', height: scaled(options?.marginTop ?? 0) }}
        />
        <div
          {...(options?.dataMeasureKind ? { 'data-testimonial-measure': options.dataMeasureKind } : {})}
          style={{
            ...textStylesToCss(resolveCaptionTextStyles(style), isEditor),
            textAlign: overlayTextAlign,
            pointerEvents: 'auto',
            ...(typeof options?.minHeightPx === 'number' && options.minHeightPx > 0
              ? { minHeight: options.minHeightPx }
              : {}),
          }}
        >
          <RichTextRenderer content={richContent} />
        </div>
      </div>
    ),
    [overlayAlignItems, overlayTextAlign, isEditor]
  );

  const renderCard = useCallback(
    (item: TestimonialsItem, key: string | number, opts?: RenderCardOpts) => (
      <div
        key={key}
        style={{
          padding: `${scaled(padding.top)} ${scaled(padding.right)} ${scaled(padding.bottom)} ${scaled(padding.left)}`,
          width: scaled(cardWidth + stroke * 2),
          height: '100%',
          borderRadius: scaled(corners),
          border: `${scaled(stroke)} solid ${strokeColor}`,
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className={`${P}-cover`}
          style={{ background: bgColor, height: '100%' }}
        />
        <div
          className={`${P}-elements-overlay`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'none',
            alignItems: overlayAlignItems,
            textAlign: overlayTextAlign,
          }}
        >
          {textStyle &&
            item.text &&
            renderText(
              textStyle,
              item.text,
              'text',
              opts?.dataMeasureAttrs
                ? { dataMeasureKind: 'text' }
                : typeof opts?.textMinHeightPx === 'number' && opts.textMinHeightPx > 0
                  ? { minHeightPx: opts.textMinHeightPx }
                  : undefined
            )}
          <div
            key="logo"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: overlayAlignItems,
              width: '100%',
            }}
          >
            <div
              data-controls="logoMarginTop"
              className={`${P}-control`}
              style={{ width: '100%', height: scaled(logoMarginTop) }}
            />
            <div style={{ width: scaled(logoWidth), height: scaled(logoHeight) }}>
              <img
                src={item.logo?.url}
                alt={item.logo?.name}
                style={{ pointerEvents: 'auto', width: '100%', height: '100%', objectFit: item.logo?.objectFit || 'cover' }}
              />
            </div>
          </div>
          {captionStyle &&
            item.caption &&
            renderText(captionStyle, item.caption, 'caption', {
              controlsName: 'captionMarginTop',
              marginTop: captionMarginTop,
              ...(opts?.dataMeasureAttrs
                ? { dataMeasureKind: 'caption' as const }
                : typeof opts?.captionMinHeightPx === 'number' && opts.captionMinHeightPx > 0
                  ? { minHeightPx: opts.captionMinHeightPx }
                  : {}),
            })}
        </div>
      </div>
    ),
    [
      bgColor,
      captionMarginTop,
      captionStyle,
      cardWidth,
      corners,
      logoHeight,
      logoMarginTop,
      logoWidth,
      overlayAlignItems,
      overlayTextAlign,
      padding.bottom,
      padding.left,
      padding.right,
      padding.top,
      renderText,
      stroke,
      strokeColor,
      textStyle,
      isEditor,
    ]
  );

  useLayoutEffect(() => {
    if (!shouldMeasureTextExtents) {
      setMeasuredTextMinPx(0);
      setMeasuredCaptionMinPx(0);
      return;
    }

    const root = measureLayerRef.current;
    if (!root) return;

    const readExtents = () => {
      const maxText = Array.from(root.querySelectorAll('[data-testimonial-measure="text"]')).reduce(
        (acc, el) => Math.max(acc, el.getBoundingClientRect().height),
        0
      );
      const maxCaption = Array.from(root.querySelectorAll('[data-testimonial-measure="caption"]')).reduce(
        (acc, el) => Math.max(acc, el.getBoundingClientRect().height),
        0
      );
      setMeasuredTextMinPx(maxText);
      setMeasuredCaptionMinPx(maxCaption);
    };

    readExtents();
    const ro = new ResizeObserver(readExtents);
    ro.observe(root);
    return () => {
      ro.disconnect();
    };
  }, [shouldMeasureTextExtents, content, renderCard]);

  const visibleCardOpts: RenderCardOpts | undefined = shouldMeasureTextExtents
    ? { textMinHeightPx: measuredTextMinPx, captionMinHeightPx: measuredCaptionMinPx }
    : undefined;

  const measureLayerEl = shouldMeasureTextExtents ? (
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
      {(content ?? []).map((item, index) => renderCard(item, `measure-${index}`, { dataMeasureAttrs: true }))}
    </div>
  ) : null;

  const renderCardWrapper = (item: TestimonialsItem, key: string | number, isLast: boolean) => (
    <div
      key={key}
      style={{
        position: 'relative',
        flex: '0 0 auto',
        height: '100%',
      }}
    >
      {renderCard(item, `card-${key}`, visibleCardOpts)}
      {isEditor && !isLast && (
        <div
          data-controls="gap"
          data-controls-axis="x"
          style={{
            position: 'absolute',
            top: 0,
            right: `calc(-1 * ${scaled(gap)})`,
            width: scaled(gap),
            height: '100%',
            pointerEvents: 'auto',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );

  if (autoplay === 'on' && content?.length && content.length > 0) {
    return (
      <div ref={wrapperRef} className={cn(`${P}-wrapper`, `${P}-marquee-wrapper`)} aria-label="Testimonials">
        <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
        {measureLayerEl}
        <div
          ref={trackRef}
          className={`${P}-marquee-track`}
          onMouseEnter={onTrackEnter}
          onMouseLeave={onTrackLeave}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <div
              key={`set-${copyIndex}`}
              ref={copyIndex === 0 ? setRef : undefined}
              className={`${P}-marquee-set`}
              style={{ gap: scaled(gap), paddingRight: scaled(gap) }}
              aria-hidden={copyIndex > 0}
            >
              {content?.map((item: TestimonialsItem, index: number) =>
                renderCardWrapper(item, `${copyIndex}-${index}`, index === (content?.length ?? 0) - 1)
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${P}-wrapper`}>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      {measureLayerEl}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: scaled(gap),
          justifyContent: 'center',
          overflowX: 'auto',
        }}
        aria-label="Testimonials"
      >
        {content?.map((item: TestimonialsItem, index: number) =>
          renderCardWrapper(item, index, index === (content?.length ?? 0) - 1)
        )}
      </div>
    </div>
  );
};

export type TestimonialsItem = {
  logo?: {
    url?: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  text?: any[];
  caption?: any[];
};

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type TestimonialsSettings = {
  autoplay: 'on' | 'off';
  speed: number;
  align: 'start' | 'center' | 'end';
  direction: 'left' | 'right';
  pauseOnHover: 'on' | 'off';
  gap: number;
  cardWidth: number;
  corners: number;
  stroke: number;
  strokeColor: string;
  bgColor: string;
  padding: Padding;
  logoMarginTop: number;
  logoWidth: number;
  logoHeight: number;
  captionMarginTop: number;
  styles: TestimonialsStyles;
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
