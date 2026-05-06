import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { useScopedStyles } from '../utils/useScopedStyles';
import { readTestimonialTextMeasure } from '../utils/readTestimonialTextMeasure';

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
  display: flex;
  flex-direction: column;
  pointer-events: none;
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

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: TestimonialsItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

const PX_PER_SEC_PER_SPEED_UNIT = 30;

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

export const TestimonialGrid = ({ settings, content, isEditor, isPreviewMode }: TestimonialsProps) => {
  const { prefix: P } = useScopedStyles();
  const { autoplay, align, speed, direction, pauseOnHover, gap, cardWidth, corners, stroke, strokeColor, bgColor, padding, logoMarginTop, logoWidth, logoHeight, captionMarginTop } = settings;
  const isAnimating = autoplay === 'on' && !isPreviewMode;
  const pxPerSec = Math.max(0, speed) * PX_PER_SEC_PER_SPEED_UNIT;
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
  const lastDirectionRef = useRef<'left' | 'right'>(direction);

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
      letterSpacing: (settings as any)?.[`${kind}LetterSpacing`] ?? 0,
      wordSpacing: (settings as any)?.[`${kind}WordSpacing`] ?? 0,
      fontSize: (settings as any)?.[`${kind}FontSize`] ?? 0.01,
      lineHeight: (settings as any)?.[`${kind}LineHeight`] ?? 0.01,
      color: (settings as any)?.[`${kind}Color`] ?? '#000000',
    };
    return styles;
  };

  const textStyle = resolveTextStyle('text');
  const captionStyle = resolveTextStyle('caption');

  const shouldMeasureTextExtents = useMemo(() =>
      (content?.length ?? 0) > 1 &&
      (content ?? []).some((item) => (item.text?.length ?? 0) > 0 || (item.caption?.length ?? 0) > 0),
    [content]
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
      const nextContainerWidth = wrapper.getBoundingClientRect().width;
      const nextSetWidth = set.getBoundingClientRect().width;
      setContainerWidth(nextContainerWidth);
      setSetWidth(nextSetWidth);
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
    if (lastDirectionRef.current !== direction) {
      progressRef.current = 1 - progressRef.current;
      lastDirectionRef.current = direction;
    }
    const duration = (setWidth / pxPerSec) * 1000;
    const from = direction === 'left' ? -setWidth : 0;
    const to = direction === 'left' ? 0 : -setWidth;
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
  }, [autoplay, isAnimating, setWidth, pxPerSec, direction]);

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
    (style: TextStyles, richContent: any[], key: string, options?: RenderTextOpts) => (
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
          style={{ height: scaled(options?.marginTop ?? 0) }}
        />
        <div
          {...(options?.dataMeasureKind ? { 'data-testimonial-measure': options.dataMeasureKind } : {})}
          style={{
            ...textStylesToCss(style, isEditor),
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
        <div className={`${P}-cover`} style={{ background: bgColor }} />
        <div
          className={`${P}-elements-overlay`}
          style={{ alignItems: overlayAlignItems, textAlign: overlayTextAlign }}
        >
          {textStyle && item.text && renderText(
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
              style={{ height: scaled(logoMarginTop) }}
            />
            <div style={{ width: scaled(logoWidth), height: scaled(logoHeight) }}>
              {item.logo?.url && (
                <img
                  src={item.logo.url}
                  alt={item.logo?.name ?? ''}
                  style={{ pointerEvents: 'auto', width: '100%', height: '100%', objectFit: item.logo?.objectFit || 'contain' }}
                />
              )}
            </div>
          </div>
          {captionStyle && item.caption &&
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
  }, [shouldMeasureTextExtents, onMeasuredExtents, content, renderCard]);

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

  const renderCardWrapper = (item: TestimonialsItem, key: string | number) => (
    <div key={key} style={{ position: 'relative', flex: '0 0 auto', height: '100%' }}>
      {renderCard(item, `card-${key}`, visibleCardOpts)}
      {isEditor && (
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
                renderCardWrapper(item, `${copyIndex}-${index}`)
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
          gap: scaled(gap),
          justifyContent: 'center',
          overflowX: 'auto',
          display: 'flex',
          flexDirection: 'row',
        }}
        aria-label="Testimonials"
      >
        {content?.map((item: TestimonialsItem, index: number) =>
          renderCardWrapper(item, index)
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
};
