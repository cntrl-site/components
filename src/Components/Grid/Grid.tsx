import { TextElementStyles } from '../../types/TextElementStyles';
import { CommonComponentProps } from '../props';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import classes from './Grid.module.scss';

type GridProps = {
  settings: GridSettings;
  content: GridItem[];
  styles: GridStyles;
  isEditor?: boolean;
} & CommonComponentProps;

export const Grid = ({ settings, content, styles, isEditor }: GridProps) => {
  const gridConfig = settings.grid ?? {};
  const entriesPerRow = Math.max(1, Math.floor(gridConfig.entriesPerRow ?? 3));
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${entriesPerRow}, 1fr)`,
    rowGap: scalingValue(gridConfig.rowGap, isEditor),
    columnGap: scalingValue(gridConfig.columnGap, isEditor),
  };

  return (
    <div className={classes.grid} style={gridStyle}>
      {content.map((item, index) => {
        if (!item) return null;
        return (
          <LinkWrapper
            key={index}
            className={classes.gridItem}
            link={isEditor ? item.link : undefined}
          >
            {item.image?.url && (
              <img
                src={item.image.url}
                alt={item.image.name ?? ''}
                className={classes.gridItemImage}
                style={{
                  objectFit: item.image.objectFit ?? 'cover',
                  maxWidth: settings.media?.widthType === 'fixed' ? scalingValue(settings.media?.maxWidth ?? 0, isEditor) : '100%',
              }}
              />
            )}
            <div className={classes.gridItemContent}>
              {item.title && (
                <div
                  className={classes.gridItemTitle}
                  style={getTextStyle(styles.title, settings.title?.marginTop ?? 0, isEditor)}
                  data-styles="title"
                >
                  <RichTextRenderer content={item.title} />
                </div>
              )}
              {item.subtitle && (
                <div
                  className={classes.gridItemSubtitle}
                  style={getTextStyle(styles.subtitle, settings.subtitle?.marginTop ?? 0, isEditor)}
                  data-styles="subtitle"
                >
                  <RichTextRenderer content={item.subtitle} />
                </div>
              )}
              {item.description && (
                <div
                  className={classes.gridItemDescription}
                  style={getTextStyle(styles.description, settings.description?.marginTop ?? 0, isEditor)}
                  data-styles="description"
                >
                  <RichTextRenderer content={item.description} />
                </div>
              )}
            </div>
          </LinkWrapper>
        );
      })}
    </div>
  );
};

function getTextStyle(s: TextElementStyles, marginTop: number, isEditor?: boolean): React.CSSProperties {
  const { fontSettings, widthSettings, letterSpacing, textAlign, wordSpacing, fontSizeLineHeight, textAppearance, color } = s;
  return {
    fontFamily: fontSettings.fontFamily,
    fontWeight: fontSettings.fontWeight,
    fontStyle: fontSettings.fontStyle,
    width: widthSettings.sizing === 'auto' ? '100%' : scalingValue(widthSettings.width, isEditor),
    minWidth: 0,
    letterSpacing: scalingValue(letterSpacing, isEditor),
    wordSpacing: scalingValue(wordSpacing, isEditor),
    textAlign,
    fontSize: scalingValue(fontSizeLineHeight.fontSize, isEditor),
    lineHeight: scalingValue(fontSizeLineHeight.lineHeight, isEditor),
    textTransform: textAppearance.textTransform ?? 'none',
    textDecoration: textAppearance.textDecoration ?? 'none',
    fontVariant: textAppearance.fontVariant ?? 'normal',
    color,
    marginTop: scalingValue(marginTop, isEditor),
  };
}

function LinkWrapper({ children, link, className }: { children: React.ReactNode; link?: string; className?: string }) {
  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

type GridSettings = {
  grid: {
    entriesPerRow: number;
    rowGap: number;
    columnGap: number;
  };
  media?: {
    widthType: 'auto' | 'fixed';
    maxWidth: number;
  };
  title?: {
    marginTop: number;
  };
  subtitle?: {
    marginTop: number;
  };
  description?: {
    marginTop: number;
  };
};

type GridItem = {
  image?: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  } | null;
  title?: any[];
  subtitle?: any[];
  description?: any[];
  link?: string;
};

type GridStyles = {
  title: TextElementStyles;
  subtitle: TextElementStyles;
  description: TextElementStyles;
};
