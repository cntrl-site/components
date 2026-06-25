import { useCallback, useMemo, useState } from 'react';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils/index';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';

type FAQContentItem = {
  title?: string;
  content?: string;
};

type FAQSettings = {
  wrapperWidth?: number;
  cellMinHeight?: number;
  hover?: 'off' | 'color';
  autoclose?: 'on' | 'off';
  titleColor?: string;
  titleHoverColor?: string;
  contentColor?: string;
  contentHoverColor?: string;
  titleFontFamily?: string;
  titleFontSettings?: { fontWeight: number; fontStyle: string };
  titleFontSize?: number;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleWordSpacing?: number;
  titleTextAppearance?: TextStyles['textAppearance'];
  contentFontFamily?: string;
  contentFontSettings?: { fontWeight: number; fontStyle: string };
  contentFontSize?: number;
  contentLineHeight?: number;
  contentLetterSpacing?: number;
  contentWordSpacing?: number;
  contentTextAppearance?: TextStyles['textAppearance'];
};

type FAQProps = {
  settings: FAQSettings;
  content?: FAQContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: FAQSettings) => void;
} & CommonComponentProps;

const PANEL_ANIM_MS = 300;

type ColorKeys =
  | 'titleColor'
  | 'titleHoverColor'
  | 'contentColor'
  | 'contentHoverColor';

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  titleColor: 'title-color',
  titleHoverColor: 'title-hover-color',
  contentColor: 'content-color',
  contentHoverColor: 'content-hover-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function getTextClassName(
  fontSize: number | undefined,
  lineHeight: number | undefined,
  baseClassName: string,
  tightLeadingClassName: string,
): string {
  const resolvedFontSize = fontSize ?? 0.01;
  const needsTightLeading = lineHeight !== undefined && lineHeight < resolvedFontSize;

  return needsTightLeading
    ? `${baseClassName} ${tightLeadingClassName}`
    : baseClassName;
}

function getTextLeadingVars(
  fontSize: number | undefined,
  lineHeight: number | undefined,
  varPrefix: string,
  isEditor?: boolean,
): React.CSSProperties {
  const resolvedFontSize = fontSize ?? 0.01;

  if (lineHeight === undefined || lineHeight >= resolvedFontSize) {
    return {};
  }

  return {
    [`--${varPrefix}-leading-gap`]: scalingValue((resolvedFontSize - lineHeight) / 2, isEditor),
  } as React.CSSProperties;
}

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.${P}-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.${P}-item:first-child {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
.${P}-title-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--${P}-title-min-height, unset);
  gap: ${sv(12)};
  width: 100%;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: var(--${P}-title-color);
  font: inherit;
  transition: color 250ms;
  padding-left: 0;
}
.${P}-hover-enabled .${P}-item:hover .${P}-title-button,
.${P}-hover-enabled .${P}-title-button:hover,
.${P}-wrapper.${P}-state-hover .${P}-title-button {
  color: var(--${P}-title-hover-color, var(--${P}-title-color));
}
.${P}-editor .${P}-title-button {
  cursor: default;
}
.${P}-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  color: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.${P}-text-tight-leading {
  display: block;
  flex-shrink: 0;
  padding-top: var(--${P}-title-leading-gap, 0);
  padding-bottom: var(--${P}-title-leading-gap, 0);
}
.${P}-icon {
  flex-shrink: 0;
  width: ${sv(12)};
  height: ${sv(12)};
  position: relative;
  transition: transform ${PANEL_ANIM_MS}ms ease;
}
.${P}-icon::before,
.${P}-icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: translate(-50%, -50%);
}
.${P}-icon::after {
  transform: translate(-50%, -50%) rotate(90deg);
}
.${P}-item-open .${P}-icon {
  transform: rotate(45deg);
}
.${P}-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows ${PANEL_ANIM_MS}ms ease;
}
.${P}-item-open .${P}-panel {
  grid-template-rows: 1fr;
}
.${P}-panel-inner {
  overflow: hidden;
  min-height: 0;
}
.${P}-content {
  color: var(--${P}-content-color);
  transition: color 250ms;
}
.${P}-content-text {
  margin: 0;
  color: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.${P}-hover-enabled .${P}-panel-inner:hover .${P}-content,
.${P}-hover-enabled .${P}-content:hover,
.${P}-wrapper.${P}-state-hover .${P}-content {
  color: var(--${P}-content-hover-color, var(--${P}-content-color));
}
`;
}

function resolveTextStyle(
  fontFamily: string | undefined,
  fontSettings: FAQSettings['titleFontSettings'],
  fontSize: number | undefined,
  lineHeight: number | undefined,
  letterSpacing: number | undefined,
  wordSpacing: number | undefined,
  textAppearance: TextStyles['textAppearance'],
  color: string | undefined,
): TextStyles {
  return {
    fontSettings: {
      fontFamily,
      fontWeight: fontSettings?.fontWeight ?? 400,
      fontStyle: fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fontSize ?? 0.01,
    lineHeight,
    letterSpacing: letterSpacing ?? 0,
    wordSpacing: wordSpacing ?? 0,
    textAppearance,
    color: color ?? '#000000',
  };
}

export function FAQ({ settings, content, isEditor, isPreviewMode, activeEvent }: FAQProps) {
  const { prefix: P } = useScopedStyles();
  const {
    wrapperWidth = 1,
    cellMinHeight = 0,
    hover = 'color',
    autoclose = 'off',
    titleColor = '#000000',
    titleHoverColor = '#666666',
    contentColor = '#000000',
    contentHoverColor = '#666666',
    titleFontFamily,
    titleFontSettings,
    titleFontSize,
    titleLineHeight,
    titleLetterSpacing,
    titleWordSpacing,
    titleTextAppearance,
    contentFontFamily,
    contentFontSettings,
    contentFontSize,
    contentLineHeight,
    contentLetterSpacing,
    contentWordSpacing,
    contentTextAppearance,
  } = settings;
  const items = content ?? [];
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set());
  const isInteractive = !isEditor || isPreviewMode;
  const hoverEnabledClass = isInteractive && hover === 'color' ? `${P}-hover-enabled` : '';

  const titleTypographyCss = omitTextColors(textStylesToCss(
    resolveTextStyle(
      titleFontFamily,
      titleFontSettings,
      titleFontSize,
      titleLineHeight,
      titleLetterSpacing,
      titleWordSpacing,
      titleTextAppearance,
      titleColor,
    ),
    isEditor,
  ));
  const contentTypographyCss = omitTextColors(textStylesToCss(
    resolveTextStyle(
      contentFontFamily,
      contentFontSettings,
      contentFontSize,
      contentLineHeight,
      contentLetterSpacing,
      contentWordSpacing,
      contentTextAppearance,
      contentColor,
    ),
    isEditor,
  ));

  const titleTextClassName = getTextClassName(
    titleFontSize,
    titleLineHeight,
    `${P}-title`,
    `${P}-text-tight-leading`,
  );
  const contentTextClassName = getTextClassName(
    contentFontSize,
    contentLineHeight,
    `${P}-content-text`,
    `${P}-text-tight-leading`,
  );
  const titleTextLeadingVars = getTextLeadingVars(titleFontSize, titleLineHeight, `${P}-title`, isEditor);
  const contentTextLeadingVars = getTextLeadingVars(contentFontSize, contentLineHeight, `${P}-title`, isEditor);

  const colorVars = buildColorVars(P, {
    titleColor,
    titleHoverColor,
    contentColor,
    contentHoverColor,
  }, COLOR_VAR_MAP, STATE_KEYS);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';

  const toggleItem = useCallback((index: number) => {
    if (!isInteractive) return;

    setOpenIndices((prev) => {
      if (prev.has(index)) {
        const next = new Set(prev);
        next.delete(index);
        return next;
      }

      if (autoclose === 'on') {
        return new Set([index]);
      }

      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, [isInteractive, autoclose]);

  const scopedCss = useMemo(() => getCSS(P), [P]);
  const titleMinHeightVar = cellMinHeight > 0
    ? { [`--${P}-title-min-height`]: scalingValue(cellMinHeight, isEditor ?? false) } as React.CSSProperties
    : undefined;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div style={colorVars}>
        <div
          className={`${P}-wrapper${isEditor && !isPreviewMode ? ` ${P}-editor` : ''} ${hoverEnabledClass} ${stateClass}`.trim()}
          style={{
            width: scalingValue(wrapperWidth, isEditor ?? false),
            maxWidth: '100%',
            ...titleMinHeightVar,
          }}
        >
          {items.map((item, index) => {
            const isOpen = openIndices.has(index);
            const title = item.title?.trim() ?? '';
            const body = item.content?.trim() ?? '';

            return (
              <div
                key={index}
                className={`${P}-item${isOpen ? ` ${P}-item-open` : ''}`.trim()}
              >
                <button
                  type="button"
                  className={`${P}-title-button`}
                  aria-expanded={isOpen}
                  style={{ ...titleTypographyCss, ...titleTextLeadingVars }}
                  onClick={() => toggleItem(index)}
                >
                  <span className={titleTextClassName}>{title}</span>
                  {body && <span className={`${P}-icon`} aria-hidden="true" />}
                </button>
                {body && (
                  <div className={`${P}-panel`} aria-hidden={!isOpen}>
                    <div className={`${P}-panel-inner`}>
                      <div
                        className={`${P}-content`}
                        style={{ ...contentTypographyCss, ...contentTextLeadingVars }}
                      >
                        <span className={contentTextClassName}>{body}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
