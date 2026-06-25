import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ComponentPropsWithoutRef } from 'react';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils/index';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';

type FAQContentItem = {
  question?: string;
  answer?: any[];
};

type FAQSettings = {
  wrapperWidth?: number;
  cellMinHeight?: number;
  dividerWidth?: number;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  entryHoverEffect?: 'none' | 'default' | 'blinds' | 'reveal';
  autoclose?: 'on' | 'off';
  icon?: string | null;
  iconMaxWidth?: number;
  iconPaddingRight?: number;
  iconAnimation?: 'rotate 180' | 'rotate 90' | 'rotate 45';
  questionColor?: string;
  answerColor?: string;
  dividerColor?: string;
  iconColor?: string;
  questionHoverColor?: string;
  iconHoverColor?: string;
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
  questionPaddingLeft?: number;
  questionPaddingTop?: number;
  questionPaddingBottom?: number;
  answerPaddingLeft?: number;
  answerPaddingTop?: number;
  answerPaddingBottom?: number;
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
const PADDING_HANDLE_SIZE = 0.004;
const PADDING_CONTROL_HIT_SIZE = 12;

type FAQPaddingControlHitPlacement = 'left-y' | 'center-x' | 'center';

function getFAQPaddingControlHitStyle(
  placement: FAQPaddingControlHitPlacement,
): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    width: PADDING_CONTROL_HIT_SIZE,
    height: PADDING_CONTROL_HIT_SIZE,
    pointerEvents: 'auto',
  };

  if (placement === 'left-y') {
    return { ...base, left: 20, top: '50%', transform: 'translateY(-50%)' };
  }

  if (placement === 'center-x') {
    return { ...base, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }

  return { ...base, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
}

type FAQPaddingControlProps = {
  className: string;
  areaStyle: CSSProperties;
  hitPlacement: FAQPaddingControlHitPlacement;
} & ComponentPropsWithoutRef<'div'>;

function FAQPaddingControl({
  className,
  areaStyle,
  hitPlacement,
  ...rest
}: FAQPaddingControlProps) {
  return (
    <div
      className={className}
      style={{ ...areaStyle, pointerEvents: 'none' }}
      data-controls-center-only-drag=""
      {...rest}
    >
      <div style={getFAQPaddingControlHitStyle(hitPlacement)} />
    </div>
  );
}

type ColorKeys =
  | 'questionColor'
  | 'answerColor'
  | 'dividerColor'
  | 'iconColor'
  | 'questionHoverColor'
  | 'iconHoverColor'
  | 'dividerHoverColor'
  | 'backgroundHoverColor';

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  questionColor: 'question-color',
  answerColor: 'answer-color',
  dividerColor: 'divider-color',
  iconColor: 'icon-color',
  questionHoverColor: 'question-hover-color',
  iconHoverColor: 'icon-hover-color',
  dividerHoverColor: 'divider-hover-color',
  backgroundHoverColor: 'background-hover-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function setRevealOpenDirectionFromMouseEnter(event: React.MouseEvent<HTMLElement>, prefix: string): void {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const fromBottom = event.clientY - rect.top > rect.height / 2;
  el.classList.toggle(`${prefix}-reveal-from-bottom`, fromBottom);
}

function setRevealCloseDirectionFromMouseLeave(event: React.MouseEvent<HTMLElement>, prefix: string): void {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const exitToTop = event.clientY < rect.top + rect.height / 2;
  el.classList.toggle(`${prefix}-reveal-from-bottom`, exitToTop);
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
  prefix: string,
  isEditor?: boolean,
): React.CSSProperties {
  const resolvedFontSize = fontSize ?? 0.01;

  if (lineHeight === undefined || lineHeight >= resolvedFontSize) {
    return {};
  }

  return {
    [`--${prefix}-text-leading-gap`]: scalingValue((resolvedFontSize - lineHeight) / 2, isEditor),
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
  position: relative;
  border-bottom-width: var(--${P}-divider-width);
  border-bottom-style: var(--${P}-divider-style);
  border-bottom-color: var(--${P}-divider-color);
}
.${P}-item:first-child {
  border-top-width: var(--${P}-divider-width);
  border-top-style: var(--${P}-divider-style);
  border-top-color: var(--${P}-divider-color);
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item {
  transition: background-color 250ms, border-color 250ms;
}
.${P}-wrapper.${P}-entry-hover-default .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-question-button {
  transition: color 250ms;
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open) {
  background-color: var(--${P}-background-hover-color);
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover,
.${P}-wrapper.${P}-entry-hover-default .${P}-item:has(+ .${P}-item:not(.${P}-item-open):hover),
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open) {
  border-bottom-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover:first-child,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open):first-child {
  border-top-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item:not(.${P}-item-open):hover,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item:has(+ .${P}-item:not(.${P}-item-open):hover),
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-item:not(.${P}-item-open),
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item:not(.${P}-item-open):hover,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item:has(+ .${P}-item:not(.${P}-item-open):hover),
.${P}-wrapper.${P}-entry-hover-reveal.${P}-state-hover .${P}-item:not(.${P}-item-open) {
  border-bottom-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item:not(.${P}-item-open):hover:first-child,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-item:not(.${P}-item-open):first-child,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item:not(.${P}-item-open):hover:first-child,
.${P}-wrapper.${P}-entry-hover-reveal.${P}-state-hover .${P}-item:not(.${P}-item-open):first-child {
  border-top-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item:not(.${P}-item-open):hover .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item:not(.${P}-item-open):hover .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-reveal.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-question-button {
  color: var(--${P}-question-hover-color, var(--${P}-question-color));
}
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item::before,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--${P}-background-hover-color);
  transform: scaleY(0);
  z-index: 0;
  pointer-events: none;
}
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item::before {
  transform-origin: center center;
  opacity: 0;
  transition: opacity 150ms, transform 0s 250ms;
}
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item:not(.${P}-item-open):hover::before,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-item:not(.${P}-item-open)::before {
  transform: scaleY(1);
  opacity: 1;
  transition: transform 250ms, opacity 250ms;
}
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item::before {
  transform-origin: bottom center;
  transition: transform 120ms;
}
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item:not(.${P}-item-open):hover::before,
.${P}-wrapper.${P}-entry-hover-reveal.${P}-state-hover .${P}-item:not(.${P}-item-open)::before {
  transform: scaleY(1);
  transform-origin: top center;
}
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item.${P}-reveal-from-bottom::before {
  transform-origin: top center;
}
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item.${P}-reveal-from-bottom:not(.${P}-item-open):hover::before,
.${P}-wrapper.${P}-entry-hover-reveal.${P}-state-hover .${P}-item.${P}-reveal-from-bottom:not(.${P}-item-open)::before {
  transform-origin: bottom center;
}
.${P}-wrapper.${P}-entry-hover-blinds .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-panel,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-panel {
  position: relative;
  z-index: 1;
}
.${P}-question-button {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: var(--${P}-question-color);
  font: inherit;
  padding-left: 0;
}
.${P}-question-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${sv(12)};
  width: 100%;
  min-width: 0;
  min-height: var(--${P}-question-min-height, unset);
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
  padding-top: var(--${P}-text-leading-gap, 0);
  padding-bottom: var(--${P}-text-leading-gap, 0);
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
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover .${P}-icon-image,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-icon-image,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-item:not(.${P}-item-open):hover .${P}-icon-image,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-icon-image,
.${P}-wrapper.${P}-entry-hover-reveal .${P}-item:not(.${P}-item-open):hover .${P}-icon-image,
.${P}-wrapper.${P}-entry-hover-reveal.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-icon-image {
  --fill: var(--${P}-icon-hover-color, var(--${P}-icon-color)) !important;
  --hover-fill: var(--${P}-icon-hover-color, var(--${P}-icon-color)) !important;
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
.${P}-answer-text a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.1em;
}
.${P}-padding-handle {
  width: 100%;
  flex-shrink: 0;
  background: transparent;
}
.${P}-question-controls,
.${P}-answer-controls {
  position: relative;
}
.${P}-padding-control-handle {
  background: transparent;
}
.${P}-padding-control-handle[data-controls-axis="x"][data-controls-variant="column-padding"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 12px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  pointer-events: none;
}
.${P}-padding-control-handle[data-controls-axis="y"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 4px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  pointer-events: none;
}
.${P}-padding-control-handle[data-controls-variant="row-padding"][data-controls-axis="y"]::after {
  left: 20px;
  transform: translateY(-50%);
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

export function FAQ({ settings, content, isEditor, isPreviewMode, isEditMode, activeEvent }: FAQProps) {
  const { prefix: P } = useScopedStyles();
  const showControls = isEditMode ?? false;
  const {
    wrapperWidth = 1,
    cellMinHeight = 0,
    dividerWidth = 0.000694,
    dividerStyle = 'solid',
    entryHoverEffect = 'default',
    autoclose = 'off',
    icon,
    iconMaxWidth = 0.00833,
    iconPaddingRight = 0,
    iconAnimation = 'rotate 45',
    questionColor = '#000000',
    answerColor = '#000000',
    dividerColor = '#0000001F',
    iconColor = '#000000',
    questionHoverColor = '#666666',
    iconHoverColor = '#666666',
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
    questionPaddingLeft = 0,
    questionPaddingTop = 0,
    questionPaddingBottom = 0,
    answerPaddingLeft = 0,
    answerPaddingTop = 0,
    answerPaddingBottom = 0,
  } = settings;
  const items = content ?? [];
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set());
  const isInteractive = !isEditor || isPreviewMode;

  useEffect(() => {
    if (!isPreviewMode) {
      setOpenIndices(new Set());
    }
  }, [isPreviewMode]);
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const questionPaddingLeftWidth = Math.max(questionPaddingLeft, PADDING_HANDLE_SIZE);
  const questionPaddingTopHeight = Math.max(questionPaddingTop, PADDING_HANDLE_SIZE);
  const questionPaddingBottomHeight = Math.max(questionPaddingBottom, PADDING_HANDLE_SIZE);
  const answerPaddingLeftWidth = Math.max(answerPaddingLeft, PADDING_HANDLE_SIZE);
  const answerPaddingTopHeight = Math.max(answerPaddingTop, PADDING_HANDLE_SIZE);
  const answerPaddingBottomHeight = Math.max(answerPaddingBottom, PADDING_HANDLE_SIZE);
  const questionPaddingLeftMaxFraction = Math.max(0, (wrapperWidth ?? 1) - iconPaddingRight - iconMaxWidth);
  const answerPaddingLeftMaxFraction = Math.max(0, (wrapperWidth ?? 1));
  const iconPaddingRightWidth = Math.max(iconPaddingRight, PADDING_HANDLE_SIZE);
  const iconPaddingRightMaxFraction = Math.max(0, (wrapperWidth ?? 1) - questionPaddingLeft - iconMaxWidth);

  const isItemOpen = useCallback((index: number) => {
    if (showControls) {
      return true;
    }

    return openIndices.has(index);
  }, [openIndices, showControls]);
  const entryHoverClass = isInteractive
    ? entryHoverEffect === 'default'
      ? `${P}-entry-hover-default`
      : entryHoverEffect === 'blinds'
        ? `${P}-entry-hover-blinds`
        : entryHoverEffect === 'reveal'
          ? `${P}-entry-hover-reveal`
          : ''
    : '';
  const revealHoverActive = entryHoverEffect === 'reveal' && isInteractive;
  const iconSrc = icon ?? '';
  const useCustomIcon = iconSrc !== '';
  const iconAnimSuffix = iconAnimation.replace(/^rotate /, '');
  const iconAnimClass = `${P}-icon-anim-${iconAnimSuffix}`;

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
  const questionTextLeadingVars = getTextLeadingVars(questionFontSize, questionLineHeight, P, isEditor);
  const answerTextLeadingVars = getTextLeadingVars(answerFontSize, answerLineHeight, P, isEditor);

  const colorVars = buildColorVars(P, {
    questionColor,
    answerColor,
    dividerColor,
    iconColor,
    questionHoverColor,
    iconHoverColor,
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
          className={`${P}-wrapper${isEditor && !isPreviewMode ? ` ${P}-editor` : ''} ${entryHoverClass} ${stateClass}`.trim()}
          style={{
            width: scalingValue(wrapperWidth, isEditor ?? false),
            maxWidth: '100%',
            ...wrapperStyleVars,
          }}
        >
          {items.map((item, index) => {
            const isOpen = isItemOpen(index);
            const question = item.question?.trim() ?? '';
            const answer = item.answer;
            const hasAnswer = (answer?.length ?? 0) > 0;
            const isFirstItem = index === 0;

            return (
              <div
                key={index}
                className={`${P}-item${isOpen ? ` ${P}-item-open` : ''}`.trim()}
                data-faq-item=""
                onMouseEnter={revealHoverActive && !isOpen ? (event) => setRevealOpenDirectionFromMouseEnter(event, P) : undefined}
                onMouseLeave={revealHoverActive && !isOpen ? (event) => setRevealCloseDirectionFromMouseLeave(event, P) : undefined}
              >
                <div className={`${P}-question-controls`}>
                  {showControls && isFirstItem && (
                    <>
                      <FAQPaddingControl
                        data-controls="questionPaddingTop"
                        data-controls-static-handle=""
                        data-controls-handle-left="20"
                        data-controls-axis="y"
                        data-controls-variant="row-padding"
                        data-controls-min="0"
                        className={`${P}-padding-control-handle`}
                        hitPlacement="left-y"
                        areaStyle={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: scaled(questionPaddingTopHeight),
                          zIndex: 2,
                        }}
                      />
                      <FAQPaddingControl
                        data-controls="questionPaddingLeft"
                        data-controls-static-handle=""
                        data-controls-axis="x"
                        data-controls-variant="column-padding"
                        data-controls-min="0"
                        data-controls-max-fraction={String(questionPaddingLeftMaxFraction)}
                        className={`${P}-padding-control-handle`}
                        hitPlacement="center-x"
                        areaStyle={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: scaled(questionPaddingLeftWidth),
                          height: '100%',
                          zIndex: 2,
                        }}
                      />
                      <FAQPaddingControl
                        data-controls="iconPaddingRight"
                        data-controls-static-handle=""
                        data-controls-axis="x"
                        data-controls-variant="column-padding"
                        data-controls-reverse=""
                        data-controls-min="0"
                        data-controls-max-fraction={String(iconPaddingRightMaxFraction)}
                        className={`${P}-padding-control-handle`}
                        hitPlacement="center-x"
                        areaStyle={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: scaled(iconPaddingRightWidth),
                          height: '100%',
                          zIndex: 2,
                        }}
                      />
                    </>
                  )}
                  <button
                    type="button"
                    className={`${P}-question-button`}
                    aria-expanded={isOpen}
                    style={{
                      ...questionTypographyCss,
                      ...questionTextLeadingVars,
                      paddingLeft: scaled(questionPaddingLeft),
                      paddingRight: scaled(iconPaddingRight),
                    }}
                    onClick={() => toggleItem(index)}
                  >
                    {questionPaddingTop > 0 && (
                      <span
                        className={`${P}-padding-handle`}
                        style={{ height: scaled(questionPaddingTop) }}
                        aria-hidden="true"
                      />
                    )}
                    <span className={`${P}-question-row`}>
                      <span className={questionTextClassName}>{question}</span>
                      {hasAnswer && (
                        useCustomIcon ? (
                          <span className={`${P}-icon ${P}-icon-custom ${iconAnimClass}`} aria-hidden="true">
                            <SvgImage
                              url={iconSrc}
                              fill={iconColor}
                              hoverFill={iconHoverColor}
                              className={`${P}-icon-image`}
                            />
                          </span>
                        ) : (
                          <span className={`${P}-icon ${P}-icon-default ${iconAnimClass}`} aria-hidden="true" />
                        )
                      )}
                    </span>
                    {questionPaddingBottom > 0 && (
                      <span
                        className={`${P}-padding-handle`}
                        style={{ height: scaled(questionPaddingBottom) }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  {showControls && isFirstItem && (
                    <FAQPaddingControl
                      data-controls="questionPaddingBottom"
                      data-controls-static-handle=""
                      data-controls-handle-left="20"
                      data-controls-axis="y"
                      data-controls-variant="row-padding"
                      data-controls-min="0"
                      className={`${P}-padding-control-handle`}
                      hitPlacement="left-y"
                      areaStyle={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: scaled(questionPaddingBottomHeight),
                        zIndex: 2,
                      }}
                    />
                  )}
                </div>
                {hasAnswer && answer && (
                  <div className={`${P}-panel`} aria-hidden={!isOpen}>
                    <div className={`${P}-panel-inner`}>
                      <div className={`${P}-answer-controls`}>
                        {showControls && isFirstItem && (
                          <>
                            <FAQPaddingControl
                              data-controls="answerPaddingTop"
                              data-controls-static-handle=""
                              data-controls-handle-left="20"
                              data-controls-axis="y"
                              data-controls-variant="row-padding"
                              data-controls-min="0"
                              className={`${P}-padding-control-handle`}
                              hitPlacement="left-y"
                              areaStyle={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: scaled(answerPaddingTopHeight),
                                zIndex: 2,
                              }}
                            />
                            <FAQPaddingControl
                              data-controls="answerPaddingLeft"
                              data-controls-static-handle=""
                              data-controls-axis="x"
                              data-controls-variant="column-padding"
                              data-controls-min="0"
                              data-controls-max-fraction={String(answerPaddingLeftMaxFraction)}
                              className={`${P}-padding-control-handle`}
                              hitPlacement="center-x"
                              areaStyle={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: scaled(answerPaddingLeftWidth),
                                height: '100%',
                                zIndex: 2,
                              }}
                            />
                          </>
                        )}
                        {answerPaddingTop > 0 && (
                          <div
                            className={`${P}-padding-handle`}
                            style={{ height: scaled(answerPaddingTop) }}
                          />
                        )}
                        <div
                          className={`${P}-answer`}
                          style={{
                            ...answerTypographyCss,
                            ...answerTextLeadingVars,
                            paddingLeft: scaled(answerPaddingLeft),
                          }}
                        >
                          <div className={answerTextClassName}>
                            <RichTextRenderer content={answer} />
                          </div>
                        </div>
                        {answerPaddingBottom > 0 && (
                          <div
                            className={`${P}-padding-handle`}
                            style={{ height: scaled(answerPaddingBottom) }}
                          />
                        )}
                        {showControls && isFirstItem && (
                          <FAQPaddingControl
                            data-controls="answerPaddingBottom"
                            data-controls-static-handle=""
                            data-controls-handle-left="20"
                            data-controls-axis="y"
                            data-controls-variant="row-padding"
                            data-controls-min="0"
                            className={`${P}-padding-control-handle`}
                            hitPlacement="left-y"
                            areaStyle={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              width: '100%',
                              height: scaled(answerPaddingBottomHeight),
                              zIndex: 2,
                            }}
                          />
                        )}
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
