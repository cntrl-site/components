import { useCallback, useMemo, useState } from 'react';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils/index';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';
import { SvgImage } from '../helpers/SvgImage/SvgImage';

type FAQContentItem = {
  question?: string;
  answer?: string;
};

type FAQSettings = {
  wrapperWidth?: number;
  cellMinHeight?: number;
  dividerWidth?: number;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  hover?: 'off' | 'color';
  autoclose?: 'on' | 'off';
  icon?: string | null;
  iconMaxWidth?: number;
  iconAnimation?: '180' | '90' | '45';
  questionColor?: string;
  answerColor?: string;
  dividerColor?: string;
  questionHoverColor?: string;
  dividerHoverColor?: string;
  backgroundHoverColor?: string;
  questionFontFamily?: string;
  questionFontSettings?: { fontWeight: number; fontStyle: string };
  questionFontSize?: number;
  questionLineHeight?: number;
  questionLetterSpacing?: number;
  questionWordSpacing?: number;
  questionTextAppearance?: TextStyles['textAppearance'];
  answerFontFamily?: string;
  answerFontSettings?: { fontWeight: number; fontStyle: string };
  answerFontSize?: number;
  answerLineHeight?: number;
  answerLetterSpacing?: number;
  answerWordSpacing?: number;
  answerTextAppearance?: TextStyles['textAppearance'];
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
  | 'questionColor'
  | 'answerColor'
  | 'dividerColor'
  | 'questionHoverColor'
  | 'dividerHoverColor'
  | 'backgroundHoverColor';

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  questionColor: 'question-color',
  answerColor: 'answer-color',
  dividerColor: 'divider-color',
  questionHoverColor: 'question-hover-color',
  dividerHoverColor: 'divider-hover-color',
  backgroundHoverColor: 'background-hover-color',
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
  border-bottom-width: var(--${P}-divider-width);
  border-bottom-style: var(--${P}-divider-style);
  border-bottom-color: var(--${P}-divider-color);
  transition: background-color 250ms, border-color 250ms;
}
.${P}-item:first-child {
  border-top-width: var(--${P}-divider-width);
  border-top-style: var(--${P}-divider-style);
  border-top-color: var(--${P}-divider-color);
}
.${P}-hover-enabled .${P}-item:hover,
.${P}-wrapper.${P}-state-hover .${P}-item {
  background-color: var(--${P}-background-hover-color);
  border-bottom-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-hover-enabled .${P}-item:has(+ .${P}-item:hover) {
  border-bottom-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-hover-enabled .${P}-item:hover:first-child,
.${P}-wrapper.${P}-state-hover .${P}-item:first-child {
  border-top-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-question-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--${P}-question-min-height, unset);
  gap: ${sv(12)};
  width: 100%;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: var(--${P}-question-color);
  font: inherit;
  transition: color 250ms;
  padding-left: 0;
}
.${P}-hover-enabled .${P}-item:hover .${P}-question-button,
.${P}-hover-enabled .${P}-question-button:hover,
.${P}-wrapper.${P}-state-hover .${P}-question-button {
  color: var(--${P}-question-hover-color, var(--${P}-question-color));
}
.${P}-editor .${P}-question-button {
  cursor: default;
}
.${P}-question {
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
  padding-top: var(--${P}-question-leading-gap, 0);
  padding-bottom: var(--${P}-question-leading-gap, 0);
}
.${P}-icon {
  flex-shrink: 0;
  width: var(--${P}-icon-max-width);
  height: var(--${P}-icon-max-width);
  position: relative;
  transition: transform ${PANEL_ANIM_MS}ms ease;
}
.${P}-icon-custom {
  display: flex;
  align-items: center;
  justify-content: center;
}
.${P}-icon-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background-color 250ms;
}
.${P}-hover-enabled .${P}-item:hover .${P}-icon-image,
.${P}-hover-enabled .${P}-question-button:hover .${P}-icon-image,
.${P}-wrapper.${P}-state-hover .${P}-icon-image {
  --fill: var(--${P}-question-hover-color, var(--${P}-question-color)) !important;
  --hover-fill: var(--${P}-question-hover-color, var(--${P}-question-color)) !important;
}
.${P}-item-open .${P}-icon-anim-45 {
  transform: rotate(45deg);
}
.${P}-item-open .${P}-icon-anim-90 {
  transform: rotate(90deg);
}
.${P}-item-open .${P}-icon-anim-180 {
  transform: rotate(180deg);
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
.${P}-answer {
  color: var(--${P}-answer-color);
}
.${P}-answer-text {
  margin: 0;
  color: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
`;
}

function resolveTextStyle(
  fontFamily: string | undefined,
  fontSettings: FAQSettings['questionFontSettings'],
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
    dividerWidth = 0.000694,
    dividerStyle = 'solid',
    hover = 'color',
    autoclose = 'off',
    icon,
    iconMaxWidth = 0.00833,
    iconAnimation = '45',
    questionColor = '#000000',
    answerColor = '#000000',
    dividerColor = '#0000001F',
    questionHoverColor = '#666666',
    dividerHoverColor = '#000000',
    backgroundHoverColor = '#0000000A',
    questionFontFamily,
    questionFontSettings,
    questionFontSize,
    questionLineHeight,
    questionLetterSpacing,
    questionWordSpacing,
    questionTextAppearance,
    answerFontFamily,
    answerFontSettings,
    answerFontSize,
    answerLineHeight,
    answerLetterSpacing,
    answerWordSpacing,
    answerTextAppearance,
  } = settings;
  const items = content ?? [];
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set());
  const isInteractive = !isEditor || isPreviewMode;
  const hoverEnabledClass = isInteractive && hover === 'color' ? `${P}-hover-enabled` : '';
  const iconSrc = icon ?? '';
  const useCustomIcon = Boolean(iconSrc);
  const iconAnimClass = `${P}-icon-anim-${iconAnimation}`;

  const questionTypographyCss = omitTextColors(textStylesToCss(
    resolveTextStyle(
      questionFontFamily,
      questionFontSettings,
      questionFontSize,
      questionLineHeight,
      questionLetterSpacing,
      questionWordSpacing,
      questionTextAppearance,
      questionColor,
    ),
    isEditor,
  ));
  const answerTypographyCss = omitTextColors(textStylesToCss(
    resolveTextStyle(
      answerFontFamily,
      answerFontSettings,
      answerFontSize,
      answerLineHeight,
      answerLetterSpacing,
      answerWordSpacing,
      answerTextAppearance,
      answerColor,
    ),
    isEditor,
  ));

  const questionTextClassName = getTextClassName(
    questionFontSize,
    questionLineHeight,
    `${P}-question`,
    `${P}-text-tight-leading`,
  );
  const answerTextClassName = getTextClassName(
    answerFontSize,
    answerLineHeight,
    `${P}-answer-text`,
    `${P}-text-tight-leading`,
  );
  const questionTextLeadingVars = getTextLeadingVars(questionFontSize, questionLineHeight, `${P}-question`, isEditor);
  const answerTextLeadingVars = getTextLeadingVars(answerFontSize, answerLineHeight, `${P}-question`, isEditor);

  const colorVars = buildColorVars(P, {
    questionColor,
    answerColor,
    dividerColor,
    questionHoverColor,
    dividerHoverColor,
    backgroundHoverColor,
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
  const wrapperStyleVars = {
    [`--${P}-divider-width`]: scalingValue(dividerWidth, isEditor ?? false),
    [`--${P}-divider-style`]: dividerStyle,
    [`--${P}-icon-max-width`]: scalingValue(iconMaxWidth, isEditor ?? false),
    ...(cellMinHeight > 0
      ? { [`--${P}-question-min-height`]: scalingValue(cellMinHeight, isEditor ?? false) }
      : {}),
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div style={colorVars}>
        <div
          className={`${P}-wrapper${isEditor && !isPreviewMode ? ` ${P}-editor` : ''} ${hoverEnabledClass} ${stateClass}`.trim()}
          style={{
            width: scalingValue(wrapperWidth, isEditor ?? false),
            maxWidth: '100%',
            ...wrapperStyleVars,
          }}
        >
          {items.map((item, index) => {
            const isOpen = openIndices.has(index);
            const question = item.question?.trim() ?? '';
            const answer = item.answer?.trim() ?? '';

            return (
              <div
                key={index}
                className={`${P}-item${isOpen ? ` ${P}-item-open` : ''}`.trim()}
              >
                <button
                  type="button"
                  className={`${P}-question-button`}
                  aria-expanded={isOpen}
                  style={{ ...questionTypographyCss, ...questionTextLeadingVars }}
                  onClick={() => toggleItem(index)}
                >
                  <span className={questionTextClassName}>{question}</span>
                  {answer && (
                    useCustomIcon ? (
                      <span className={`${P}-icon ${P}-icon-custom ${iconAnimClass}`} aria-hidden="true">
                        <SvgImage
                          url={iconSrc}
                          fill={questionColor}
                          hoverFill={questionHoverColor}
                          className={`${P}-icon-image`}
                        />
                      </span>
                    ) : (
                      <span className={`${P}-icon ${P}-icon-default ${iconAnimClass}`} aria-hidden="true" />
                    )
                  )}
                </button>
                {answer && (
                  <div className={`${P}-panel`} aria-hidden={!isOpen}>
                    <div className={`${P}-panel-inner`}>
                      <div
                        className={`${P}-answer`}
                        style={{ ...answerTypographyCss, ...answerTextLeadingVars }}
                      >
                        <span className={answerTextClassName}>{answer}</span>
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
