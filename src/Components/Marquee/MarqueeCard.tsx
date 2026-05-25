import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import type { MarqueeItem } from './Marquee';

type MarqueeCardProps = {
  item: MarqueeItem;
  prefix: string;
  imageFit: 'cover' | 'contain';
  imageMaxWidth: number;
  imageMaxHeight: number;
  textMarginTop?: number;
  textStyle: TextStyles;
  imageHoverClass?: string;
  isEditor?: boolean;
  isFirstSet?: boolean;
  scaled: (value: number) => string;
  onFirstSetImageDone?: () => void;
};

export const MarqueeCard = ({
  item,
  prefix: P,
  imageFit,
  imageMaxWidth,
  imageMaxHeight,
  textMarginTop,
  textStyle,
  imageHoverClass,
  isEditor,
  isFirstSet,
  scaled,
  onFirstSetImageDone,
}: MarqueeCardProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const linkHref = item.link?.trim();
  const hasText = (item.text?.length ?? 0) > 0;
  const shouldMatchTextToImage = imageFit === 'contain' && Boolean(item.image?.url) && hasText;

  const measureImage = useCallback(() => {
    if (!shouldMatchTextToImage) {
      setImageWidth(null);
      return;
    }
    const el = imageRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) setImageWidth(w);
  }, [shouldMatchTextToImage]);

  useLayoutEffect(() => {
    measureImage();
  }, [
    measureImage,
    item.image?.url,
    imageFit,
    imageMaxWidth,
    imageMaxHeight,
    isEditor,
  ]);

  useLayoutEffect(() => {
    if (!shouldMatchTextToImage) return;
    const el = imageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureImage);
    ro.observe(el);
    return () => ro.disconnect();
  }, [shouldMatchTextToImage, measureImage, item.image?.url]);

  const handleImageDone = () => {
    measureImage();
    if (isFirstSet) onFirstSetImageDone?.();
  };

  const imageNode =
    item.image?.url &&
    (
      <img
        ref={imageRef}
        src={item.image.url}
        alt={item.image?.name ?? ''}
        style={{
          pointerEvents: 'auto',
          objectFit: imageFit,
          objectPosition: 'top',
          ...(imageFit === 'contain'
            ? { width: 'auto', maxWidth: '100%', maxHeight: '100%', height: 'auto' }
            : { width: '100%', height: '100%' }),
        }}
        onLoad={isFirstSet ? handleImageDone : measureImage}
        onError={isFirstSet ? handleImageDone : measureImage}
      />
    );

  const textNode = hasText && (
    <>
      <div
        {...(isEditor
          ? { 'data-controls': 'textMarginTop', 'data-controls-axis': 'y' as const }
          : {})}
        className={isEditor ? `${P}-control` : undefined}
        style={{
          width: '100%',
          height: scaled(textMarginTop ?? 0),
          flexShrink: 0,
        }}
      />
      <div
        style={{
          ...textStylesToCss(textStyle, isEditor),
          width: imageWidth != null ? `${imageWidth}px` : '100%',
          flexShrink: 0,
          pointerEvents: 'auto',
        }}
      >
        <RichTextRenderer content={item.text!} />
      </div>
    </>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        ...(imageFit === 'contain' ? { maxWidth: scaled(imageMaxWidth) } : { width: scaled(imageMaxWidth) }),
      }}
    >
      <div
        className={imageHoverClass}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
          height: scaled(imageMaxHeight),
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {imageNode &&
          (linkHref ? (
            <a
              href={linkHref}
              target='_blank'
              rel='noopener noreferrer'
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'flex-start',
                ...(imageFit === 'cover'
                  ? { width: '100%', height: '100%' }
                  : { height: 'auto', width: 'auto', maxWidth: '100%', maxHeight: '100%' }),
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {imageNode}
            </a>
          ) : (
            imageNode
          ))}
      </div>
      {textNode}
    </div>
  );
};
