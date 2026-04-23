import cn from 'classnames';
import classes from './Testimonials.module.scss';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

type TestimonialsProps = {
  settings: TestimonialsSettings;
  content?: { items: TestimonialsItem[] };
  isEditor?: boolean;
} & CommonComponentProps;

const parseSpeedToMs = (speed: string): number => {
  if (!speed) return 0;
  const match = speed.match(/^(\d+)s$/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 1000;
};

export const Testimonials = ({ settings, content, isEditor }: TestimonialsProps) => {
  const items = content?.items ?? [];
  const { autoplay, speed, direction, pause, gap, cardWidth, cardHeight, corners, stroke, strokeColor, bgColor, padding, iconMarginTop } = settings;
  const isAutoplay = autoplay === 'on';
  const speedMs = speed ? parseSpeedToMs(speed) : 0;
  const resolveCaptionTextStyles = (caption: CaptionStyles): TextStyles => ({
    fontSettings: {
      fontFamily: caption.fontSettings.fontFamily,
      fontWeight: caption.fontSettings.fontWeight,
      fontStyle: caption.fontSettings.fontStyle,
    },
    letterSpacing: caption.letterSpacing,
    wordSpacing: caption.wordSpacing,
    fontSize: caption.fontSizeLineHeight.fontSize,
    lineHeight: caption.fontSizeLineHeight.lineHeight,
    textAppearance: caption.textAppearance,
    color: caption.color,
  });

  const wrapperWidth = scalingValue(
      (cardWidth * items.length) + 
      (settings.gap * (items.length)) +
      (stroke * 2 * items.length),
      isEditor ?? false);
  const scaledCardHeight = scalingValue(cardHeight, isEditor ?? false);
  
  return (
    <>
      <div className={classes.wrapper}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: scalingValue(settings.gap, isEditor ?? false),
            justifyContent: 'center',
            overflowX: 'auto',
          }}
          aria-label="Testimonials"
        >
          {items.map((item, index) => (
            <div
              key={index}
                style={{
                  padding: `${scalingValue(padding.top, isEditor ?? false)} ${scalingValue(padding.right, isEditor ?? false)} ${scalingValue(padding.bottom, isEditor ?? false)} ${scalingValue(padding.left, isEditor ?? false)}`,
                  width: scalingValue(cardWidth + stroke * 2, isEditor ?? false),
                  minHeight: scaledCardHeight,
                  height: '100%',
                  borderRadius: scalingValue(corners, isEditor ?? false),
                  border: `${scalingValue(stroke, isEditor ?? false)} solid ${strokeColor}`,
                  boxSizing: 'border-box',
                  position: 'relative',
                  }}
                >
                {item.image?.url && (
                  <img
                    className={classes.image}
                    src={item.image?.url}
                    alt={item.image?.name}
                    style={{
                      objectFit: item.image?.objectFit || 'cover',
                      borderRadius: `${scalingValue(corners, isEditor ?? false)}`,
                      height: scaledCardHeight,
                    }}
                  />
                )}
                <div
                  className={classes.cover}
                  style={{
                    background: bgColor,
                    borderRadius: `${scalingValue(corners, isEditor ?? false)}`,
                    height: '100%',
                  }}
                />
                <div
                  className={classes.elementsOverlay}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    inset: 0,
                    pointerEvents: 'none'
                  }}
                >
                  <>
                    <div key="icon">
                      <div
                        data-controls="elements.icon.margin.top"
                        className={classes.control}
                        style={{ height: scalingValue(iconMarginTop, isEditor ?? false)}}
                      />
                      <div style={{ width: '100%'}}>
                        <img
                          src={item.icon?.url}
                          alt={item.icon?.name}
                          className={classes.icon}
                          style={{
                            // transform: `scale(${settings.elements.icon.scale / 100})`,
                            pointerEvents: 'auto'
                          }}
                        />
                      </div>
                    </div>
                    {(() => {
                      const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                        settings.styles.imageCaption;
                      const imageCaptionTypographyCss = textStylesToCss(
                        resolveCaptionTextStyles(settings.styles.imageCaption),
                        isEditor
                      );
                      return (
                        <div key="text">
                          <div
                            data-controls="elements.text.margin.top"
                            className={classes.control}
                            // style={{ height: scalingValue(settings.elements.text.margin.top, isEditor ?? false)}}
                          />
                          <div
                            data-styles="imageCaption"
                            className={classes.caption}
                            style={{
                              ...imageCaptionTypographyCss,
                              textAlign,
                              pointerEvents: 'auto'
                            }}
                          >
                            <RichTextRenderer content={item.imageCaption} />
                          </div>
                        </div>
                      );
                    })()}
                    {(() => {
                            const { widthSettings, fontSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } =
                          settings.styles.caption;
                        const captionTypographyCss = textStylesToCss(
                          resolveCaptionTextStyles(settings.styles.caption),
                          isEditor
                        );
                        return (
                          <div key="caption">
                            <div
                            data-controls="elements.caption.margin.top" className={classes.control}
                            // style={{ height: scalingValue(settings.elements.caption.margin.top, isEditor ?? false)}}
                            />
                            <div
                              data-styles="caption"
                              className={classes.caption}
                              style={{
                                ...captionTypographyCss,
                                textAlign,
                                pointerEvents: 'auto'
                              }}
                            >
                              <RichTextRenderer content={item.caption} />
                            </div>
                          </div>
                        );
                      })()}
                    </>
                </div>
              </div>
          ))}
        </div>
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
  imageCaption: any[];
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
  speed: string;
  direction: 'left' | 'right';
  pause: 'hover' | 'off';
  gap: number;
  cardWidth: number;
  cardHeight: number;
  corners: number;
  stroke: number;
  strokeColor: string;
  bgColor: string;
  padding: Padding;
  iconMarginTop: number;
  iconWidth: number;
  iconHeight: number;
  textMarginTop: number;
  textMinHeight: number;
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
  imageCaption: CaptionStyles;
  caption: CaptionStyles;
};
