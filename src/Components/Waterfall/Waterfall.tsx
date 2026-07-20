import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { scalingValue, useScopedStyles } from '../utils/index';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import {
  Lightbox,
  PreloadedMediaPool,
  buildLightboxEntries,
  collectAllWaterfallMedia,
  getLightboxCSS,
  getItemSourceRect,
  getMediaClickSourceRect,
  type AnimRect,
  type WaterfallLightboxSettings,
  type WaterfallMedia,
} from './WaterfallLightbox';

export type WaterfallContentItem = {
  title?: string;
  subtitle?: string;
  caption?: string;
  image?: WaterfallMedia;
};

export type WaterfallSettings = {
  wrapperWidth?: number;
  imageDisplay?: {
    display: 'fit' | 'cover';
    ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
    reversed: boolean;
  };
  titleColor?: string;
  titleFontFamily?: string;
  titleFontSettings?: { fontWeight: number; fontStyle: string };
  titleFontSize?: number;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleWordSpacing?: number;
  titleTextAppearance?: TextStyles['textAppearance'];
  horizontalGap?: number;
  imageHoverEffect?: 'none' | 'scale-in' | 'saturate';
} & WaterfallLightboxSettings;

type WaterfallProps = {
  settings?: WaterfallSettings;
  content?: WaterfallContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  layoutId?: string;
  portalId?: string;
} & CommonComponentProps;

const GAP_CONTROL_MIN_PX = 20;
const IMAGE_INLINE_GAP_RATIO = 0.18;

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  box-sizing: border-box;
  max-width: 100%;
  overflow: visible;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.${P}-item {
  display: inline;
  white-space: normal;
  max-width: 100%;
}
.${P}-item-title {
  display: inline;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.${P}-item-image {
  display: inline-block;
  vertical-align: baseline;
  position: relative;
  z-index: 1;
  height: var(--${P}-cap-height);
  margin-top: calc(var(--${P}-line-height) - var(--${P}-cap-height));
  margin-bottom: 0;
  margin-left: var(--${P}-image-inline-gap);
  margin-right: var(--${P}-image-inline-gap);
}
.${P}-item-image img,
.${P}-item-image video {
  display: block;
  height: 100%;
}
.${P}-item-image-hover-scale-in img,
.${P}-item-image-hover-scale-in video {
  transition: transform 0.3s ease;
}
.${P}-item-image-hover-scale-in:hover img,
.${P}-item-image-hover-scale-in:hover video {
  transform: scale(1.15);
}
.${P}-item-image-hover-saturate img,
.${P}-item-image-hover-saturate video {
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}
.${P}-item-image-hover-saturate:hover img,
.${P}-item-image-hover-saturate:hover video {
  filter: grayscale(0%);
}
.${P}-item-gap-host {
  display: inline-block;
  vertical-align: baseline;
  height: var(--${P}-line-height);
  position: relative;
  flex-shrink: 0;
}
.${P}-item-gap-control {
  position: absolute;
  top: 0;
  z-index: 2;
  pointer-events: auto;
}
${getLightboxCSS(P)}
`;
}

function getWaterfallTextMetricsVars(
  settings: WaterfallSettings | undefined,
  varPrefix: string,
  isEditor?: boolean,
): React.CSSProperties {
  const fontSize = settings?.titleFontSize ?? 0.07;
  const lineHeight = settings?.titleLineHeight ?? fontSize;

  return {
    [`--${varPrefix}-line-height`]: scalingValue(lineHeight, isEditor ?? false),
    [`--${varPrefix}-cap-height`]: scalingValue(fontSize, isEditor ?? false),
    [`--${varPrefix}-image-inline-gap`]: scalingValue(fontSize * IMAGE_INLINE_GAP_RATIO, isEditor ?? false),
  } as React.CSSProperties;
}

function resolveInlineTitleStyle(settings: WaterfallSettings | undefined, isEditor?: boolean): React.CSSProperties {
  const textStyles: TextStyles = {
    fontSettings: {
      fontFamily: settings?.titleFontFamily ?? 'Arial',
      fontWeight: settings?.titleFontSettings?.fontWeight ?? 400,
      fontStyle: settings?.titleFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: settings?.titleFontSize ?? 0.07,
    lineHeight: settings?.titleLineHeight,
    letterSpacing: settings?.titleLetterSpacing ?? 0,
    wordSpacing: settings?.titleWordSpacing ?? 0,
    textAppearance: settings?.titleTextAppearance,
    color: settings?.titleColor ?? '#000000',
  };
  return textStylesToCss(textStyles, isEditor);
}

function resolveImageDisplay(settings: WaterfallSettings | undefined) {
  const { imageDisplay } = settings ?? {};
  const isCover = imageDisplay?.display === 'cover';
  const ratioValue = imageDisplay?.ratioValue ?? '1:1';
  const ratioReversed = imageDisplay?.reversed ?? false;
  const [rW, rH] = ratioValue.split(':').map(Number);
  const effW = ratioReversed ? rH : rW;
  const effH = ratioReversed ? rW : rH;
  const aspectRatio = `${effW} / ${effH}`;

  const imageWrapperStyle: React.CSSProperties | undefined = isCover
    ? { aspectRatio, overflow: 'hidden' }
    : undefined;

  const imageStyle: React.CSSProperties = isCover
    ? {
        objectFit: 'cover',
        pointerEvents: 'auto',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        cursor: 'pointer',
      }
    : {
        objectFit: 'contain',
        pointerEvents: 'auto',
        width: 'auto',
        height: '100%',
        maxWidth: '100%',
        cursor: 'pointer',
      };

  return {
    isCover,
    aspectRatio,
    objectFitMode: isCover ? 'cover' as const : 'contain' as const,
    imageWrapperStyle,
    imageStyle,
  };
}

function createWaterfallItemOpenHandler(
  canOpenLightbox: boolean,
  hasLightbox: boolean,
  index: number,
  prefix: string,
  objectFitMode: 'cover' | 'contain',
  openLightbox: (gridIndex: number, sourceRect?: AnimRect) => void,
): React.MouseEventHandler<HTMLElement> | undefined {
  if (!canOpenLightbox || !hasLightbox) return undefined;

  return (e) => {
    const mediaEl = (e.currentTarget.closest(`.${prefix}-item`)?.querySelector(
      `[data-waterfall-index="${index}"]`,
    ) as HTMLElement | null)
      ?? (e.currentTarget instanceof HTMLImageElement || e.currentTarget instanceof HTMLVideoElement
        ? e.currentTarget
        : null);
    openLightbox(
      index,
      mediaEl
        ? getMediaClickSourceRect(mediaEl, objectFitMode)
        : undefined,
    );
  };
}

export function Waterfall({
  settings,
  content,
  isEditor,
  isPreviewMode,
  isEditMode,
  layoutId,
  portalId,
}: WaterfallProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const items = content ?? [];
  const wrapperWidth = typeof settings?.wrapperWidth === 'number' ? settings.wrapperWidth : 1;
  const horizontalGap = typeof settings?.horizontalGap === 'number' ? settings.horizontalGap : 0;
  const horizontalGapScaled = scalingValue(horizontalGap, isEditor ?? false);
  const gapControlWidth = `max(${horizontalGapScaled}, ${GAP_CONTROL_MIN_PX}px)`;
  const { objectFitMode, isCover, imageWrapperStyle, imageStyle } = resolveImageDisplay(settings);
  const inlineTitleStyle = resolveInlineTitleStyle(settings, isEditor);
  const wrapperStyle = {
    width: scalingValue(wrapperWidth, isEditor ?? false),
    ...inlineTitleStyle,
    ...getWaterfallTextMetricsVars(settings, P, isEditor),
  } as React.CSSProperties;

  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<WaterfallMedia[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxEntryIdx, setLightboxEntryIdx] = useState(0);
  const [lightboxSourceRect, setLightboxSourceRect] = useState<AnimRect | null>(null);
  const [lightboxEntry, setLightboxEntry] = useState({ title1: '', title2: '', title3: '' });

  const showImageHoverEffects = (!isEditor || isPreviewMode) && !lightboxOpen;
  const imageHoverEffect = settings?.imageHoverEffect ?? 'none';
  const imageHoverClass = showImageHoverEffects && imageHoverEffect !== 'none'
    ? `${P}-item-image-hover-${imageHoverEffect}`
    : undefined;

  const lightboxPortalStyle = (() => {
    const style: Record<string, string> = {};
    const articleWidth = containerRef.current
      ? getComputedStyle(containerRef.current).getPropertyValue('--cntrl-article-width').trim()
      : '';
    if (articleWidth) {
      style['--cntrl-article-width'] = articleWidth;
    }
    return style as React.CSSProperties;
  })();

  const canOpenLightbox = !isEditor || isPreviewMode || isEditMode;
  const allLightboxEntries = useMemo(() => buildLightboxEntries(items), [items]);
  const allMedia = useMemo(() => collectAllWaterfallMedia(items), [items]);

  const openLightbox = (gridIndex: number, sourceRect?: AnimRect) => {
    if (isEditor && !isEditMode && !isPreviewMode) return;
    const entryIdx = allLightboxEntries.findIndex((entry) => entry.gridIndex === gridIndex);
    if (entryIdx < 0) return;

    const data = allLightboxEntries[entryIdx];
    setLightboxEntryIdx(entryIdx);
    setLightboxItems(data.items);
    setLightboxIndex(0);
    setLightboxEntry(data.entry);
    setLightboxSourceRect(sourceRect ?? null);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setLightboxSourceRect(null);
  }, []);

  const resolveCloseSourceRect = useCallback((): AnimRect | null => {
    const entry = allLightboxEntries[lightboxEntryIdx];
    if (!entry || !containerRef.current) return lightboxSourceRect;
    return getItemSourceRect(containerRef.current, entry.gridIndex, objectFitMode) ?? lightboxSourceRect;
  }, [allLightboxEntries, lightboxEntryIdx, lightboxSourceRect, objectFitMode]);

  const navigateLightbox = useCallback((direction: -1 | 1) => {
    if (allLightboxEntries.length > 1) {
      const len = allLightboxEntries.length;
      const newEntryIdx = (lightboxEntryIdx + direction + len) % len;
      const newData = allLightboxEntries[newEntryIdx];
      setLightboxEntryIdx(newEntryIdx);
      setLightboxItems(newData.items);
      setLightboxIndex(0);
      setLightboxEntry(newData.entry);
      return;
    }
    setLightboxIndex((prev) => (prev + direction + lightboxItems.length) % lightboxItems.length);
  }, [allLightboxEntries, lightboxEntryIdx, lightboxItems.length]);

  const canNavigateLightbox = allLightboxEntries.length > 1 || lightboxItems.length > 1;

  useEffect(() => {
    if (!lightboxOpen) return;
    if (typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!isEditor || isEditMode || isPreviewMode) return;
    setLightboxOpen(false);
  }, [isEditor, isEditMode, isPreviewMode]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <PreloadedMediaPool mediaList={allMedia} />
      <div ref={containerRef} className={`${P}-wrapper`} style={wrapperStyle}>
        {items.map((item, index) => {
          const hasLightbox = Boolean(item.image?.url);
          const handleOpen = createWaterfallItemOpenHandler(
            Boolean(canOpenLightbox),
            hasLightbox,
            index,
            P,
            objectFitMode,
            openLightbox,
          );

          return (
            <div key={index} className={`${P}-item`}>
              {item.title ? (
                <span
                  className={`${P}-item-title`}
                  onClick={handleOpen}
                  style={handleOpen ? { cursor: 'pointer' } : undefined}
                >
                  {item.title}
                </span>
              ) : null}
              {item.image?.url ? (
                <span
                  className={[
                    `${P}-item-image`,
                    imageHoverClass,
                  ].filter(Boolean).join(' ')}
                  style={isCover ? imageWrapperStyle : undefined}
                >
                  {item.image.type === 'video' ? (
                    <video
                      src={item.image.url}
                      data-waterfall-index={index}
                      style={imageStyle}
                      playsInline
                      muted
                      loop
                      autoPlay
                      onClick={handleOpen}
                    />
                  ) : (
                    <img
                      src={item.image.url}
                      alt={item.image.name ?? ''}
                      data-waterfall-index={index}
                      style={imageStyle}
                      onClick={handleOpen}
                    />
                  )}
                </span>
              ) : null}
              {index < items.length - 1 && (
                <div
                  className={`${P}-item-gap-host`}
                  style={{ width: horizontalGapScaled }}
                >
                  {isEditMode && !lightboxOpen && (
                    <div
                      data-controls="horizontalGap"
                      data-controls-axis="x"
                      data-controls-min="0"
                      className={`${P}-item-gap-control`}
                      style={{
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: gapControlWidth,
                        height: '100%',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {lightboxOpen && typeof document !== 'undefined' && settings && (() => {
        const portalTarget = (portalId ? document.getElementById(portalId) : null) ?? document.body;
        return createPortal(
          <div style={lightboxPortalStyle} data-selection="none">
            <Lightbox
              prefix={P}
              items={lightboxItems}
              index={lightboxIndex}
              entry={lightboxEntry}
              settings={settings}
              isEditor={isEditor}
              isEditMode={isEditMode}
              isPreviewMode={isPreviewMode}
              canNavigate={canNavigateLightbox}
              lightboxEntries={allLightboxEntries}
              entryIdx={lightboxEntryIdx}
              layoutId={layoutId}
              sourceRect={lightboxSourceRect}
              resolveCloseSourceRect={resolveCloseSourceRect}
              onClose={closeLightbox}
              onPrev={() => navigateLightbox(-1)}
              onNext={() => navigateLightbox(1)}
            />
          </div>,
          portalTarget,
        );
      })()}
    </>
  );
}
