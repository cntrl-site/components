import cn from 'classnames';
import { useMemo } from 'react';
import classes from './Testimonials.module.scss';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: { items: TestimonialsItem[] };
  isEditor?: boolean;
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

export const TestimonialSingle = ({ settings, content, isEditor }: TestimonialsProps) => {
  const items = content?.items ?? [];
  const { autoplay, speed } = settings;
  const isAutoplay = autoplay === 'on';

  const cardWidth = settings.width ?? 0;
  const iconMarginTop = settings.iconMarginTop ?? 0;
  const iconAlign = settings.iconAlign ?? 'left';
  const iconScale = settings.iconScale ?? 100;
  const textMarginTop = settings.textMarginTop ?? 0;
  const textMinHeight = settings.textMinHeight ?? 0;
  const captionMarginTop = settings.captionMarginTop ?? 0;

  const item = items[0];

  const resolveCaptionStyle = (
    kind: 'imageCaption' | 'caption'
  ): CaptionStyles | undefined => {
    const fromNested = (settings as any)?.styles?.[kind] as CaptionStyles | undefined;
    if (fromNested) return fromNested;

    const prefix = kind === 'imageCaption' ? 'imageCaption' : 'caption';
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

  const imageCaptionStyle = resolveCaptionStyle('imageCaption');
  const captionStyle = resolveCaptionStyle('caption');
  const elementOrder = useMemo(() => {
    const order: ElementOrderKey[] = ['text', 'icon', 'caption'];
    return order.map((key, index: number) => ({ key, order: index }));
  }, []);

  if (!item) return <></>;
  
  return (
    <>
      <div
        className={classes.container}
        style={{
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          className={cn(classes.wrapper, !isAutoplay && classes.wrapperAutoplayOff)}
          style={{
            width: scalingValue(cardWidth, isEditor ?? false),
          }}
        >
          <div
            style={{
              padding: `${scalingValue(settings.padding.top, isEditor ?? false)} ${scalingValue(settings.padding.right, isEditor ?? false)} ${scalingValue(settings.padding.bottom, isEditor ?? false)} ${scalingValue(settings.padding.left, isEditor ?? false)}`,
              width: scalingValue(cardWidth, isEditor ?? false),
              height: '100%',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {item.image?.url && (
              <img
                className={classes.image}
                src={item.image?.url}
                alt={item.image?.name}
                style={{objectFit: item.image?.objectFit || 'cover'}}
              />
            )}
            <div className={classes.cover} />
            <div
              className={classes.elementsOverlay}
              style={{
                display: 'flex',
                flexDirection: 'column',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              {elementOrder.map(({ key, order: orderIndex }: { key: ElementOrderKey, order: number }) => {
                if (key === 'icon') {
                  return (
                    <div key="icon" style={{ order: orderIndex, zIndex: orderIndex }}>
                      <div
                        data-controls="iconMarginTop"
                        className={classes.control}
                        style={{ height: scalingValue(iconMarginTop, isEditor ?? false) }}
                      />
                      <div
                        style={{
                          width: '100%',
                          textAlign: iconAlign
                        }}
                      >
                        <img
                          src={item.icon?.url}
                          alt={item.icon?.name}
                          className={classes.icon}
                          style={{
                            transform: `scale(${iconScale / 100})`,
                            pointerEvents: 'auto'
                          }}
                        />
                      </div>
                    </div>
                  );
                }
                if (key === 'text' && imageCaptionStyle) {
                  const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                    imageCaptionStyle;
                  return (
                    <div key="text" style={{ order: orderIndex, zIndex: orderIndex }}>
                      <div
                        data-controls="textMarginTop"
                        className={classes.control}
                        style={{ height: scalingValue(textMarginTop, isEditor ?? false) }}
                      />
                      <div
                        data-styles="imageCaption"
                        className={classes.caption}
                        style={{
                          fontFamily: fontSettings.fontFamily,
                          fontWeight: fontSettings.fontWeight,
                          fontStyle: fontSettings.fontStyle,
                          minHeight: scalingValue(textMinHeight, isEditor ?? false),
                          letterSpacing: scalingValue(letterSpacing, isEditor),
                          wordSpacing: scalingValue(wordSpacing, isEditor),
                          textAlign,
                          fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
                          lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
                          textTransform: textAppearance.textTransform ?? 'none',
                          textDecoration: textAppearance.textDecoration ?? 'none',
                          fontVariant: textAppearance.fontVariant ?? 'normal',
                          color,
                          pointerEvents: 'auto'
                        }}
                      >
                        <RichTextRenderer content={item.imageCaption ?? item.text ?? []} />
                      </div>
                    </div>
                  );
                }
                if (key === 'caption' && captionStyle) {
                  const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                    captionStyle;
                  return (
                    <div key="caption" style={{ order: orderIndex, zIndex: orderIndex }}>
                      <div
                        data-controls="captionMarginTop"
                        className={classes.control}
                        style={{ height: scalingValue(captionMarginTop, isEditor ?? false) }}
                      />
                      <div
                        data-styles="caption"
                        className={classes.caption}
                        style={{
                          fontFamily: fontSettings.fontFamily,
                          fontWeight: fontSettings.fontWeight,
                          fontStyle: fontSettings.fontStyle,
                          minHeight: 0,
                          letterSpacing: scalingValue(letterSpacing, isEditor),
                          wordSpacing: scalingValue(wordSpacing, isEditor),
                          textAlign,
                          fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
                          lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
                          textTransform: textAppearance.textTransform ?? 'none',
                          textDecoration: textAppearance.textDecoration ?? 'none',
                          fontVariant: textAppearance.fontVariant ?? 'normal',
                          color,
                          pointerEvents: 'auto'
                        }}
                      >
                        <RichTextRenderer content={item.caption} />
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
        {settings.controls?.isActive === 'visible' && settings.autoplay === 'off' && (
          // TODO: Add controls
          <div>Controls</div>
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
  icon?: {
    url?: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  text: any[];
  imageCaption?: any[];
  caption: any[];
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
  width: number;
  iconMarginTop?: number;
  iconAlign?: 'left' | 'center' | 'right';
  iconScale?: number;
  textMarginTop?: number;
  textMinHeight?: number;
  captionMarginTop?: number;
  padding: Padding;
  styles: TestimonialsStyles;
  controls: {
    isActive: 'visible' | 'hidden';
    arrowsImgUrl: string | null;
    align: 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right' | 'center-center' | 'center-left' | 'center-right';
    gap: number;
    scale: number;
    color: string;
    hover: string;
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
  imageCaption?: CaptionStyles;
  text: CaptionStyles;
  caption: CaptionStyles;
};

type ElementOrderKey = 'text' | 'icon' | 'caption';
