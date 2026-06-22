import { Fragment, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import cn from 'classnames';
import { type CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';
import { normalizeFontFamilyCssValue, textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { useScopedStyles } from '../utils/useScopedStyles';

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: auto;
  overflow: visible;
}

.${P}-flow {
  display: block;
  width: 100%;
}

.${P}-entry {
  display: inline;
}

.${P}-imageSlot {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  overflow: visible;
  transform: translateZ(0);
}

.${P}-imageLink {
  display: inline-flex;
  width: 100%;
  height: 100%;
  line-height: 0;
  color: inherit;
  text-decoration: none;
}

.${P}-imageSlot[data-clickable="true"] {
  cursor: pointer;
}

.${P}-image {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: var(--${P}-image-fit);
  border-radius: var(--${P}-image-radius);
  opacity: var(--${P}-image-opacity);
  transform: scale(1);
  transform-origin: center center;
  transition: transform var(--${P}-image-transition) ease, opacity var(--${P}-image-transition) ease;
  will-change: transform, opacity;
}

.${P}-imageSlot:hover .${P}-image,
.${P}-wrapper.${P}-state-hover .${P}-image {
  opacity: var(--${P}-image-hover-opacity);
  transform: scale(var(--${P}-image-hover-scale));
}

.${P}-richLink {
  color: var(--${P}-link-color);
  pointer-events: auto;
  text-decoration: inherit;
  transition: color 200ms ease;
}

.${P}-richLink:hover,
.${P}-wrapper.${P}-state-hover .${P}-richLink {
  color: var(--${P}-link-hover-color);
}
`;
}

type InlineImageFlowProps = {
  settings: InlineImageFlowSettings;
  content?: InlineImageFlowItem[];
  isEditor?: boolean;
  activeEvent?: string;
} & CommonComponentProps;

export const InlineImageFlow = ({ settings, content = [], isEditor, activeEvent }: InlineImageFlowProps) => {
  const { prefix: P } = useScopedStyles();
  const {
    fontFamily,
    fontSettings,
    fontSize,
    lineHeight,
    letterSpacing,
    wordSpacing,
    textAppearance,
    textColor,
    linkColor,
    linkHoverColor,
    imageWidth,
    imageHeight,
    imageFit,
    imageAlign,
    textImageGap,
    entryGap,
    imageRadius,
    imageOpacity,
    hoverScale,
    hoverOpacity,
    transitionDuration,
    clickAction,
  } = settings;
  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const textStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: fontSettings?.fontWeight ?? 400,
      fontStyle: fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fontSize ?? 0.04,
    lineHeight: lineHeight ?? 0.048,
    letterSpacing: letterSpacing ?? 0,
    wordSpacing: wordSpacing ?? 0,
    textAppearance,
    color: textColor ?? '#000000',
  };

  const wrapperStyle: CSSProperties = {
    ...textStylesToCss(textStyle, isEditor),
    [`--${P}-link-color` as string]: linkColor ?? textColor ?? '#000000',
    [`--${P}-link-hover-color` as string]: linkHoverColor ?? linkColor ?? textColor ?? '#000000',
    [`--${P}-image-fit` as string]: imageFit ?? 'cover',
    [`--${P}-image-radius` as string]: scalingValue(imageRadius ?? 0, isEditor),
    [`--${P}-image-opacity` as string]: String((imageOpacity ?? 100) / 100),
    [`--${P}-image-hover-opacity` as string]: String((hoverOpacity ?? 100) / 100),
    [`--${P}-image-hover-scale` as string]: String((hoverScale ?? 100) / 100),
    [`--${P}-image-transition` as string]: `${transitionDuration ?? 180}ms`,
  };

  const imageSlotStyle: CSSProperties = {
    width: scalingValue(imageWidth ?? 0.035, isEditor),
    height: scalingValue(imageHeight ?? 0.035, isEditor),
    marginLeft: scalingValue(textImageGap ?? 0.006, isEditor),
    marginRight: scalingValue(entryGap ?? 0.014, isEditor),
    verticalAlign: getVerticalAlign(imageAlign),
  };

  const onEditorImageClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isEditor) return;
    event.preventDefault();
  };

  return (
    <div className={cn(`${P}-wrapper`, stateClass)} style={wrapperStyle}>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div className={`${P}-flow`} aria-label="Inline image list">
        {content.map((item, index) => {
          const href = item.link?.trim() ?? '';
          const isClickable = clickAction !== 'none' && href.length > 0;
          const image = item.image?.url ? (
            <img
              className={`${P}-image`}
              src={item.image.url}
              alt={item.image.name ?? ''}
            />
          ) : null;
          const imageNode = isClickable ? (
            <a
              className={`${P}-imageLink`}
              href={href}
              target={clickAction === 'new tab' ? '_blank' : undefined}
              rel={clickAction === 'new tab' ? 'noreferrer' : undefined}
              onClick={onEditorImageClick}
            >
              {image}
            </a>
          ) : image;

          return (
            <span className={`${P}-entry`} key={index}>
              {renderInlineRichText(item.text, P, `${index}`)}
              {imageNode && (
                <span
                  className={`${P}-imageSlot`}
                  data-clickable={isClickable ? 'true' : 'false'}
                  style={imageSlotStyle}
                >
                  {imageNode}
                </span>
              )}
              {item.after ? <span>{item.after}</span> : null}
              {index < content.length - 1 ? ' ' : null}
            </span>
          );
        })}
      </div>
    </div>
  );
};

function renderInlineRichText(content: InlineRichTextBlock[] | undefined, P: string, keyPrefix: string): ReactNode {
  if (!Array.isArray(content) || content.length === 0) return null;

  return content.map((block, blockIndex) => (
    <Fragment key={`${keyPrefix}-${blockIndex}`}>
      {blockIndex > 0 ? ' ' : null}
      {renderInlineChildren(block.children ?? [], P, `${keyPrefix}-${blockIndex}`)}
    </Fragment>
  ));
}

function renderInlineChildren(children: InlineRichTextChild[], P: string, keyPrefix: string): ReactNode {
  return children.map((child, childIndex) => {
    const key = `${keyPrefix}-${childIndex}`;
    if (isRichTextLink(child)) {
      return (
        <a
          className={`${P}-richLink`}
          href={child.value}
          target={child.target}
          key={key}
        >
          {renderInlineChildren(child.children ?? [], P, key)}
        </a>
      );
    }

    return (
      <span style={getLeafCss(child)} key={key}>
        {child.text}
      </span>
    );
  });
}

function isRichTextLink(child: InlineRichTextChild): child is InlineRichTextLink {
  return child.type === 'link';
}

function getLeafCss(leaf: InlineRichTextLeaf): CSSProperties {
  return {
    ...(leaf.fontFamily && { fontFamily: normalizeFontFamilyCssValue(leaf.fontFamily) }),
    ...(leaf.fontWeight && { fontWeight: leaf.fontWeight }),
    ...(leaf.fontStyle && { fontStyle: leaf.fontStyle }),
    ...(leaf.textDecoration && { textDecoration: leaf.textDecoration }),
    ...(leaf.textTransform && { textTransform: leaf.textTransform }),
    ...(leaf.fontVariant && { fontVariant: leaf.fontVariant }),
    ...(leaf.verticalAlign && {
      verticalAlign: leaf.verticalAlign,
      lineHeight: '0px',
    }),
  };
}

function getVerticalAlign(value?: InlineImageFlowSettings['imageAlign']) {
  switch (value) {
    case 'top':
      return 'text-top';
    case 'middle':
      return 'middle';
    case 'bottom':
      return 'text-bottom';
    case 'baseline':
    default:
      return 'baseline';
  }
}

type InlineRichTextLeaf = {
  type?: string;
  text?: string;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  textTransform?: string;
  fontVariant?: string;
  verticalAlign?: string;
};

type InlineRichTextLink = {
  type: 'link';
  value?: string;
  target?: string;
  children?: InlineRichTextChild[];
};

type InlineRichTextChild = InlineRichTextLeaf | InlineRichTextLink;

type InlineRichTextBlock = {
  type?: string;
  children?: InlineRichTextChild[];
};

export type InlineImageFlowItem = {
  text?: InlineRichTextBlock[];
  image?: {
    url?: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  link?: string;
  after?: string;
};

export type InlineImageFlowSettings = {
  fontFamily?: string;
  fontSettings?: {
    fontWeight: number;
    fontStyle: string;
  };
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textAppearance?: TextStyles['textAppearance'];
  textColor: string;
  linkColor: string;
  linkHoverColor: string;
  imageWidth: number;
  imageHeight: number;
  imageFit: 'cover' | 'contain';
  imageAlign: 'baseline' | 'middle' | 'top' | 'bottom';
  textImageGap: number;
  entryGap: number;
  imageRadius: number;
  imageOpacity: number;
  hoverScale: number;
  hoverOpacity: number;
  transitionDuration: number;
  clickAction: 'none' | 'same tab' | 'new tab';
};
