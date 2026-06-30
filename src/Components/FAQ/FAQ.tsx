import { useCallback, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils/index';
import { omitTextColors, textStylesToCss } from '../utils/textStylesToCss';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { PaddingControl } from '../helpers/PaddingControl/PaddingControl';
import { COLOR_VAR_MAP, PADDING_HANDLE_SIZE, STATE_KEYS } from './FAQConstants';
import { getCSS } from './FAQStyles';
import { getTextClassName, getTextLeadingVars, resolveTextStyle } from './FAQTypography';
import type { FAQProps } from './FAQTypes';

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
    iconActiveColor = '#000000',
    dividerHoverColor = '#000000',
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
    answerPaddingRight = 0,
    answerPaddingTop = 0,
    answerPaddingBottom = 0,
  } = settings;
  const items = content ?? [];
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set());
  const isInteractive = !isEditor || isPreviewMode;

  useEffect(() => {
    setOpenIndices(new Set());
  }, [autoclose]);

  useEffect(() => {
    if (isEditor && !isEditMode && !isPreviewMode) {
      setOpenIndices(new Set());
    }
  }, [isEditor, isEditMode, isPreviewMode]);
  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const questionPaddingLeftWidth = Math.max(questionPaddingLeft, PADDING_HANDLE_SIZE);
  const questionPaddingTopHeight = Math.max(questionPaddingTop, PADDING_HANDLE_SIZE);
  const questionPaddingBottomHeight = Math.max(questionPaddingBottom, PADDING_HANDLE_SIZE);
  const answerPaddingLeftWidth = Math.max(answerPaddingLeft, PADDING_HANDLE_SIZE);
  const answerPaddingRightWidth = Math.max(answerPaddingRight, PADDING_HANDLE_SIZE);
  const answerPaddingTopHeight = Math.max(answerPaddingTop, PADDING_HANDLE_SIZE);
  const answerPaddingBottomHeight = Math.max(answerPaddingBottom, PADDING_HANDLE_SIZE);
  const questionPaddingLeftMaxFraction = Math.max(0, (wrapperWidth ?? 1) - iconPaddingRight - iconMaxWidth);
  const answerPaddingLeftMaxFraction = Math.max(0, (wrapperWidth ?? 1) - answerPaddingRight);
  const answerPaddingRightMaxFraction = Math.max(0, (wrapperWidth ?? 1) - answerPaddingLeft);
  const iconPaddingRightWidth = Math.max(iconPaddingRight, PADDING_HANDLE_SIZE);
  const iconPaddingRightMaxFraction = Math.max(0, (wrapperWidth ?? 1) - questionPaddingLeft - iconMaxWidth);

  const controlsTargetIndex = useMemo(() => {
    if (openIndices.size === 0) {
      return 0;
    }

    return Math.min(...openIndices);
  }, [openIndices]);

  const isItemOpen = useCallback((index: number) => openIndices.has(index), [openIndices]);
  const entryHoverClass = isInteractive && entryHoverEffect === 'default'
    ? `${P}-entry-hover-default`
    : '';
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
    iconActiveColor,
    dividerHoverColor,
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
          className={cn(
            `${P}-wrapper`,
            isEditor && !isPreviewMode && `${P}-editor`,
            entryHoverClass,
            stateClass,
          )}
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
            const showPaddingControls = showControls && index === controlsTargetIndex;
            const showAnswerPaddingControls = showPaddingControls && isOpen;

            return (
              <div
                key={index}
                className={cn(`${P}-item`, isOpen && `${P}-item-open`)}
                data-faq-item=""
              >
                <div className={`${P}-question-controls`}>
                  {showPaddingControls && (
                    <>
                      <PaddingControl
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
                      <PaddingControl
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
                      <PaddingControl
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
                  {showPaddingControls && (
                    <PaddingControl
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
                        {showAnswerPaddingControls && (
                          <>
                            <PaddingControl
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
                            <PaddingControl
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
                            <PaddingControl
                              data-controls="answerPaddingRight"
                              data-controls-static-handle=""
                              data-controls-axis="x"
                              data-controls-variant="column-padding"
                              data-controls-reverse=""
                              data-controls-min="0"
                              data-controls-max-fraction={String(answerPaddingRightMaxFraction)}
                              className={`${P}-padding-control-handle`}
                              hitPlacement="center-x"
                              areaStyle={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: scaled(answerPaddingRightWidth),
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
                            paddingRight: scaled(answerPaddingRight),
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
                        {showAnswerPaddingControls && (
                          <PaddingControl
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
