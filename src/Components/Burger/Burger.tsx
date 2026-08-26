import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils';
import { omitTextColors, textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

const MENU_ANIM_MS = 300;
const PADDING_HANDLE_SIZE = 0.004;
const MIN_TEXT_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_TEXT_WIDTH = MIN_TEXT_WIDTH_PX / ARTICLE_DESIGN_WIDTH;

type BurgerDirection = 'left' | 'top' | 'right' | 'bottom';
type BurgerEffect = 'fade' | 'left' | 'top' | 'right' | 'bottom';
type BurgerType = 'a' | 'b' | 'c';

type BurgerTextOrientation = 'vertical' | 'horizontal';

type BurgerSettings = {
  type?: BurgerType;
  direction?: BurgerDirection;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  textOrientation?: BurgerTextOrientation;
  iconColor?: string;
  iconSize?: number;
  iconAnimation?: 'a';
  linkColor?: string;
  menuBackgroundColor?: string;
  overlayColor?: string;
  closeButtonColor?: string;
  effect?: BurgerEffect;
  menuWidth?: number;
  textWidth?: number;
  gap?: number;
  textPaddingLeft?: number;
  textPaddingRight?: number;
  textPaddingTop?: number;
  textPaddingBottom?: number;
  fontFamily?: string;
  fontSettings?: {
    fontWeight?: number;
    fontStyle?: string;
  };
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  textAlign?: TextStyles['textAlign'];
  textAppearance?: TextStyles['textAppearance'];
  stateOverrides?: Record<string, Partial<Record<'iconColor' | 'closeButtonColor' | 'linkColor' | 'menuBackgroundColor' | 'overlayColor', string>>>;
};

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
): CSSProperties {
  const resolvedFontSize = fontSize ?? 0.01;

  if (lineHeight === undefined || lineHeight >= resolvedFontSize) {
    return {};
  }

  return {
    [`--${prefix}-text-leading-gap`]: scalingValue((resolvedFontSize - lineHeight) / 2, isEditor),
  } as CSSProperties;
}

function renderMultilineText(text: string) {
  const lines = text.split(/\r?\n/);

  if (lines.length === 1) {
    return text;
  }

  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function scalePaddingsToFit(
  paddingStart: number,
  paddingEnd: number,
  panelSize: number,
  minContentSize: number,
) {
  const maxPaddingSum = Math.max(0, panelSize - minContentSize);
  const paddingSum = paddingStart + paddingEnd;

  if (paddingSum <= maxPaddingSum || paddingSum <= 0) {
    return { start: paddingStart, end: paddingEnd };
  }

  const scale = maxPaddingSum / paddingSum;
  return {
    start: paddingStart * scale,
    end: paddingEnd * scale,
  };
}

type EffectiveBurgerLayout = {
  effectivePaddingLeft: number;
  effectivePaddingRight: number;
  effectivePaddingTop: number;
  effectivePaddingBottom: number;
  panelSize: number;
};

function getEffectiveBurgerLayout(
  direction: BurgerDirection,
  options: {
    type: BurgerType;
    menuWidth: number;
    textPaddingLeft: number;
    textPaddingRight: number;
    textPaddingTop: number;
    textPaddingBottom: number;
    verticalAlign?: VerticalAlign;
    horizontalAlign?: HorizontalAlign;
    fontSize?: number;
  },
): EffectiveBurgerLayout {
  const panelSize = options.type === 'a' ? 1 : options.menuWidth;
  const isVerticalPanel = options.type === 'b';
  const verticalAlign = options.verticalAlign ?? 'top';
  const horizontalAlign = options.horizontalAlign ?? 'left';
  const verticalPanelHeight = 1;
  const horizontalPanelWidth = 1;
  const minContentHeight = Math.max(MIN_TEXT_WIDTH, options.fontSize ?? MIN_TEXT_WIDTH);

  if (isVerticalPanel) {
    const { start, end } = scalePaddingsToFit(
      options.textPaddingLeft,
      options.textPaddingRight,
      panelSize,
      MIN_TEXT_WIDTH,
    );

    let effectivePaddingTop = options.textPaddingTop;
    let effectivePaddingBottom = options.textPaddingBottom;

    if (verticalAlign === 'top') {
      effectivePaddingTop = scalePaddingsToFit(
        options.textPaddingTop,
        0,
        verticalPanelHeight,
        minContentHeight,
      ).start;
    } else if (verticalAlign === 'bottom') {
      effectivePaddingBottom = scalePaddingsToFit(
        0,
        options.textPaddingBottom,
        verticalPanelHeight,
        minContentHeight,
      ).end;
    }

    return {
      effectivePaddingLeft: start,
      effectivePaddingRight: end,
      effectivePaddingTop,
      effectivePaddingBottom,
      panelSize,
    };
  }

  const { start, end } = scalePaddingsToFit(
    options.textPaddingTop,
    options.textPaddingBottom,
    panelSize,
    minContentHeight,
  );

  let effectivePaddingLeft = options.textPaddingLeft;
  let effectivePaddingRight = options.textPaddingRight;

  if (horizontalAlign === 'left') {
    effectivePaddingLeft = scalePaddingsToFit(
      options.textPaddingLeft,
      0,
      horizontalPanelWidth,
      MIN_TEXT_WIDTH,
    ).start;
  } else if (horizontalAlign === 'right') {
    effectivePaddingRight = scalePaddingsToFit(
      0,
      options.textPaddingRight,
      horizontalPanelWidth,
      MIN_TEXT_WIDTH,
    ).end;
  }

  return {
    effectivePaddingLeft,
    effectivePaddingRight,
    effectivePaddingTop: start,
    effectivePaddingBottom: end,
    panelSize,
  };
}

function getDefaultDirection(type: BurgerType): BurgerDirection {
  if (type === 'c') return 'top';
  return 'left';
}

function normalizeDirection(type: BurgerType, direction: BurgerDirection): BurgerDirection {
  if (type === 'b') {
    return direction === 'right' ? 'right' : 'left';
  }
  if (type === 'c') {
    return direction === 'bottom' ? 'bottom' : 'top';
  }
  return direction;
}

function getBurgerPanelSize(settings: BurgerSettings): number {
  const type = settings.type ?? 'b';
  const menuWidth = settings.menuWidth ?? 320 / 1440;
  return type === 'a' ? 1 : menuWidth;
}

function hasBurgerPaddingChanges(left: BurgerSettings, right: BurgerSettings): boolean {
  return left.textPaddingLeft !== right.textPaddingLeft
    || left.textPaddingRight !== right.textPaddingRight
    || left.textPaddingTop !== right.textPaddingTop
    || left.textPaddingBottom !== right.textPaddingBottom;
}

export function applyBurgerSettingsChange(
  nextSettings: BurgerSettings,
  prevSettings: BurgerSettings,
): BurgerSettings {
  const type = nextSettings.type ?? prevSettings.type ?? 'b';
  const normalizedDirection = normalizeDirection(
    type,
    nextSettings.direction ?? prevSettings.direction ?? getDefaultDirection(type),
  );
  const verticalAlign = nextSettings.verticalAlign ?? prevSettings.verticalAlign ?? 'top';
  const horizontalAlign = nextSettings.horizontalAlign ?? prevSettings.horizontalAlign ?? 'left';
  const layout = getEffectiveBurgerLayout(normalizedDirection, {
    type,
    menuWidth: nextSettings.menuWidth ?? prevSettings.menuWidth ?? 320 / 1440,
    textPaddingLeft: nextSettings.textPaddingLeft ?? 0,
    textPaddingRight: nextSettings.textPaddingRight ?? 0,
    textPaddingTop: nextSettings.textPaddingTop ?? 0,
    textPaddingBottom: nextSettings.textPaddingBottom ?? 0,
    verticalAlign,
    horizontalAlign,
    fontSize: nextSettings.fontSize ?? prevSettings.fontSize,
  });

  const nextPanelSize = getBurgerPanelSize(nextSettings);
  const prevPanelSize = getBurgerPanelSize(prevSettings);
  const isVerticalPanel = type === 'b';
  const updates: Partial<BurgerSettings> = {};

  if ((nextSettings.direction ?? getDefaultDirection(type)) !== normalizedDirection) {
    updates.direction = normalizedDirection;
  }

  if (isVerticalPanel) {
    if ((nextSettings.textPaddingLeft ?? 0) !== layout.effectivePaddingLeft) {
      updates.textPaddingLeft = layout.effectivePaddingLeft;
    }
    if ((nextSettings.textPaddingRight ?? 0) !== layout.effectivePaddingRight) {
      updates.textPaddingRight = layout.effectivePaddingRight;
    }
    if (verticalAlign === 'top' && (nextSettings.textPaddingTop ?? 0) !== layout.effectivePaddingTop) {
      updates.textPaddingTop = layout.effectivePaddingTop;
    }
    if (verticalAlign === 'bottom' && (nextSettings.textPaddingBottom ?? 0) !== layout.effectivePaddingBottom) {
      updates.textPaddingBottom = layout.effectivePaddingBottom;
    }
  } else {
    if ((nextSettings.textPaddingTop ?? 0) !== layout.effectivePaddingTop) {
      updates.textPaddingTop = layout.effectivePaddingTop;
    }
    if ((nextSettings.textPaddingBottom ?? 0) !== layout.effectivePaddingBottom) {
      updates.textPaddingBottom = layout.effectivePaddingBottom;
    }
    if (horizontalAlign === 'left' && (nextSettings.textPaddingLeft ?? 0) !== layout.effectivePaddingLeft) {
      updates.textPaddingLeft = layout.effectivePaddingLeft;
    }
    if (horizontalAlign === 'right' && (nextSettings.textPaddingRight ?? 0) !== layout.effectivePaddingRight) {
      updates.textPaddingRight = layout.effectivePaddingRight;
    }
  }

  if (Object.keys(updates).length === 0 && nextPanelSize >= prevPanelSize) {
    return nextSettings;
  }

  if (Object.keys(updates).length === 0) {
    return nextSettings;
  }

  return { ...nextSettings, ...updates };
}

function getPanelPaddingStyle(
  direction: BurgerDirection,
  verticalAlign: VerticalAlign,
  horizontalAlign: HorizontalAlign,
  layout: EffectiveBurgerLayout,
  isEditor?: boolean,
): CSSProperties {
  const isVerticalPanel = direction === 'left' || direction === 'right';

  if (isVerticalPanel) {
    return {
      paddingLeft: scalingValue(layout.effectivePaddingLeft, isEditor),
      paddingRight: scalingValue(layout.effectivePaddingRight, isEditor),
      ...(verticalAlign === 'top'
        ? { paddingTop: scalingValue(layout.effectivePaddingTop, isEditor) }
        : {}),
      ...(verticalAlign === 'bottom'
        ? { paddingBottom: scalingValue(layout.effectivePaddingBottom, isEditor) }
        : {}),
    };
  }

  return {
    paddingTop: scalingValue(layout.effectivePaddingTop, isEditor),
    paddingBottom: scalingValue(layout.effectivePaddingBottom, isEditor),
    ...(horizontalAlign === 'left'
      ? { paddingLeft: scalingValue(layout.effectivePaddingLeft, isEditor) }
      : {}),
    ...(horizontalAlign === 'right'
      ? { paddingRight: scalingValue(layout.effectivePaddingRight, isEditor) }
      : {}),
  };
}

function renderTextPaddingControls(
  P: string,
  direction: BurgerDirection,
  verticalAlign: VerticalAlign,
  horizontalAlign: HorizontalAlign,
  layout: EffectiveBurgerLayout,
  fontSize: number | undefined,
  scaled: (value: number) => string,
) {
  const isVerticalPanel = direction === 'left' || direction === 'right';
  const minContentSize = isVerticalPanel
    ? MIN_TEXT_WIDTH
    : Math.max(MIN_TEXT_WIDTH, fontSize ?? MIN_TEXT_WIDTH);
  const verticalPanelSize = 1;

  if (isVerticalPanel) {
    const leftHandleSize = Math.max(layout.effectivePaddingLeft, PADDING_HANDLE_SIZE);
    const rightHandleSize = Math.max(layout.effectivePaddingRight, PADDING_HANDLE_SIZE);
    const leftMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingRight - minContentSize);
    const rightMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingLeft - minContentSize);
    const topHandleSize = Math.max(layout.effectivePaddingTop, PADDING_HANDLE_SIZE);
    const bottomHandleSize = Math.max(layout.effectivePaddingBottom, PADDING_HANDLE_SIZE);
    const topMaxFraction = Math.max(0, verticalPanelSize - layout.effectivePaddingBottom - minContentSize);
    const bottomMaxFraction = Math.max(0, verticalPanelSize - layout.effectivePaddingTop - minContentSize);

    return (
      <>
        <div
          data-controls="textPaddingLeft"
          data-controls-axis="x"
          data-controls-variant="column-padding"
          data-controls-min="0"
          data-controls-max-fraction={String(leftMaxFraction)}
          className={`${P}-control-anchor`}
          style={{ top: 0, left: 0, width: scaled(leftHandleSize), height: '100%' }}
        />
        <div
          data-controls="textPaddingRight"
          data-controls-axis="x"
          data-controls-variant="column-padding"
          data-controls-reverse=""
          data-controls-min="0"
          data-controls-max-fraction={String(rightMaxFraction)}
          className={`${P}-control-anchor`}
          style={{ top: 0, right: 0, width: scaled(rightHandleSize), height: '100%' }}
        />
        {verticalAlign === 'top' && (
          <div
            data-controls="textPaddingTop"
            data-controls-axis="y"
            data-controls-variant="row-padding"
            data-controls-min="0"
            data-controls-max-fraction={String(topMaxFraction)}
            className={`${P}-control-anchor`}
            style={{ top: 0, left: 0, width: '100%', height: scaled(topHandleSize) }}
          />
        )}
        {verticalAlign === 'bottom' && (
          <div
            data-controls="textPaddingBottom"
            data-controls-axis="y"
            data-controls-variant="row-padding"
            data-controls-reverse=""
            data-controls-min="0"
            data-controls-max-fraction={String(bottomMaxFraction)}
            className={`${P}-control-anchor`}
            style={{ bottom: 0, left: 0, width: '100%', height: scaled(bottomHandleSize) }}
          />
        )}
      </>
    );
  }

  const topHandleSize = Math.max(layout.effectivePaddingTop, PADDING_HANDLE_SIZE);
  const bottomHandleSize = Math.max(layout.effectivePaddingBottom, PADDING_HANDLE_SIZE);
  const topMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingBottom - minContentSize);
  const bottomMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingTop - minContentSize);
  const horizontalPanelWidth = 1;
  const leftHandleSize = Math.max(layout.effectivePaddingLeft, PADDING_HANDLE_SIZE);
  const rightHandleSize = Math.max(layout.effectivePaddingRight, PADDING_HANDLE_SIZE);
  const leftMaxFraction = Math.max(0, horizontalPanelWidth - layout.effectivePaddingRight - MIN_TEXT_WIDTH);
  const rightMaxFraction = Math.max(0, horizontalPanelWidth - layout.effectivePaddingLeft - MIN_TEXT_WIDTH);

  return (
    <>
      <div
        data-controls="textPaddingTop"
        data-controls-axis="y"
        data-controls-variant="row-padding"
        data-controls-min="0"
        data-controls-max-fraction={String(topMaxFraction)}
        className={`${P}-control-anchor`}
        style={{ top: 0, left: 0, width: '100%', height: scaled(topHandleSize) }}
      />
      <div
        data-controls="textPaddingBottom"
        data-controls-axis="y"
        data-controls-variant="row-padding"
        data-controls-reverse=""
        data-controls-min="0"
        data-controls-max-fraction={String(bottomMaxFraction)}
        className={`${P}-control-anchor`}
        style={{ bottom: 0, left: 0, width: '100%', height: scaled(bottomHandleSize) }}
      />
      {horizontalAlign === 'left' && (
        <div
          data-controls="textPaddingLeft"
          data-controls-axis="x"
          data-controls-variant="column-padding"
          data-controls-min="0"
          data-controls-max-fraction={String(leftMaxFraction)}
          className={`${P}-control-anchor`}
          style={{ top: 0, left: 0, width: scaled(leftHandleSize), height: '100%' }}
        />
      )}
      {horizontalAlign === 'right' && (
        <div
          data-controls="textPaddingRight"
          data-controls-axis="x"
          data-controls-variant="column-padding"
          data-controls-reverse=""
          data-controls-min="0"
          data-controls-max-fraction={String(rightMaxFraction)}
          className={`${P}-control-anchor`}
          style={{ top: 0, right: 0, width: scaled(rightHandleSize), height: '100%' }}
        />
      )}
    </>
  );
}

type BurgerContentItem = {
  label?: string;
  link?: string;
};

type HorizontalAlign = 'left' | 'center' | 'right';
type VerticalAlign = 'top' | 'center' | 'bottom';

type ColorKeys = 'iconColor' | 'closeButtonColor' | 'linkColor' | 'menuBackgroundColor' | 'overlayColor';

type BurgerProps = {
  settings: BurgerSettings;
  content?: BurgerContentItem[];
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  activeEvent?: string;
  portalId?: string;
  layoutId?: string;
  onUpdateSettings?: (settings: BurgerSettings) => void;
} & CommonComponentProps;

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  iconColor: 'icon-color',
  closeButtonColor: 'close-button-color',
  linkColor: 'link-color',
  menuBackgroundColor: 'menu-background-color',
  overlayColor: 'overlay-color',
};

const STATE_KEYS = ['hover'] as const;

const VERTICAL_ALIGN_MAP: Record<VerticalAlign, CSSProperties['justifyContent']> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

const HORIZONTAL_ALIGN_MAP: Record<HorizontalAlign, CSSProperties['alignItems']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

function getCSS(P: string): string {
  return `
.${P}-root {
  position: relative;
  display: block;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
  line-height: 0;
  font-size: 0;
}
.${P}-toggle {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  color: var(--${P}-icon-color);
  transition: color ${MENU_ANIM_MS}ms ease;
  line-height: 0;
  font-size: 0;
  -webkit-appearance: none;
  appearance: none;
}
.${P}-toggle:focus,
.${P}-toggle:focus-visible {
  outline: none;
}
.${P}-icon {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.${P}-icon-line {
  position: absolute;
  left: 0;
  right: 0;
  height: var(--${P}-icon-line-height, 2px);
  border-radius: 1px;
  background-color: currentColor;
  transition: transform ${MENU_ANIM_MS}ms ease, opacity ${MENU_ANIM_MS}ms ease, top ${MENU_ANIM_MS}ms ease;
}
.${P}-icon-line:nth-child(1) {
  top: 0;
}
.${P}-icon-line:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}
.${P}-icon-line:nth-child(3) {
  bottom: 0;
}
.${P}-root.${P}-open .${P}-icon-line:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}
.${P}-root.${P}-open .${P}-icon-line:nth-child(2) {
  opacity: 0;
}
.${P}-root.${P}-open .${P}-icon-line:nth-child(3) {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}
.${P}-root.${P}-open .${P}-toggle {
  color: var(--${P}-close-button-color);
}
.${P}-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9997;
  pointer-events: none;
  overscroll-behavior: none;
  overflow: hidden;
}
.${P}-lightbox-editor {
  inset: auto;
  top: var(--cntrl-article-top, 0);
  left: var(--cntrl-article-left, 0);
  width: var(--cntrl-article-width, 100vw) !important;
  height: var(--cntrl-viewport-height, 100vh) !important;
}
.${P}-lightbox-edit-mode {
  z-index: 1;
}
.${P}-lightbox.${P}-lightbox-active {
  pointer-events: auto;
}
.${P}-backdrop {
  position: absolute;
  inset: 0;
  border: none;
  padding: 0;
  margin: 0;
  background-color: var(--${P}-overlay-color);
  opacity: 0;
  cursor: pointer;
  transition: opacity ${MENU_ANIM_MS}ms ease;
}
.${P}-lightbox.${P}-lightbox-active .${P}-backdrop {
  opacity: 1;
}
.${P}-panel {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: var(--${P}-menu-background-color);
  transition: transform ${MENU_ANIM_MS}ms ease, opacity ${MENU_ANIM_MS}ms ease;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.12);
}
.${P}-full-lightbox .${P}-panel {
  pointer-events: none;
  box-shadow: none;
}
.${P}-full-lightbox .${P}-link,
.${P}-full-lightbox .${P}-gap-control {
  pointer-events: auto;
}
.${P}-effect-fade .${P}-panel,
.${P}-effect-left .${P}-panel,
.${P}-effect-top .${P}-panel,
.${P}-effect-right .${P}-panel,
.${P}-effect-bottom .${P}-panel {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
.${P}-effect-fade .${P}-panel {
  opacity: 0;
  transform: none;
}
.${P}-effect-fade.${P}-lightbox-active .${P}-panel {
  opacity: 1;
}
.${P}-effect-left .${P}-panel {
  transform: translateX(-100%);
}
.${P}-effect-left.${P}-lightbox-active .${P}-panel {
  transform: translateX(0);
}
.${P}-effect-right .${P}-panel {
  transform: translateX(100%);
}
.${P}-effect-right.${P}-lightbox-active .${P}-panel {
  transform: translateX(0);
}
.${P}-effect-top .${P}-panel {
  transform: translateY(-100%);
}
.${P}-effect-top.${P}-lightbox-active .${P}-panel {
  transform: translateY(0);
}
.${P}-effect-bottom .${P}-panel {
  transform: translateY(100%);
}
.${P}-effect-bottom.${P}-lightbox-active .${P}-panel {
  transform: translateY(0);
}
.${P}-effect-fade .${P}-link,
.${P}-effect-left .${P}-link,
.${P}-effect-top .${P}-link,
.${P}-effect-right .${P}-link,
.${P}-effect-bottom .${P}-link {
  width: auto;
  text-align: center;
}
.${P}-control-anchor {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}
.${P}-gap-control {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  z-index: 2;
}
.${P}-gap-control::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 20px;
  pointer-events: auto;
  z-index: 10;
}
.${P}-direction-left .${P}-panel {
  top: 0;
  left: 0;
  height: 100%;
  width: var(--${P}-menu-width);
  max-width: 100%;
  transform: translateX(-100%);
}
.${P}-direction-left.${P}-lightbox-active .${P}-panel {
  transform: translateX(0);
}
.${P}-direction-right .${P}-panel {
  top: 0;
  right: 0;
  height: 100%;
  width: var(--${P}-menu-width);
  max-width: 100%;
  transform: translateX(100%);
}
.${P}-direction-right.${P}-lightbox-active .${P}-panel {
  transform: translateX(0);
}
.${P}-direction-top .${P}-panel {
  top: 0;
  left: 0;
  width: 100%;
  height: var(--${P}-menu-width);
  max-height: 100%;
  transform: translateY(-100%);
}
.${P}-direction-top.${P}-lightbox-active .${P}-panel {
  transform: translateY(0);
}
.${P}-direction-bottom .${P}-panel {
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--${P}-menu-width);
  max-height: 100%;
  transform: translateY(100%);
}
.${P}-direction-bottom.${P}-lightbox-active .${P}-panel {
  transform: translateY(0);
}
.${P}-direction-top .${P}-link,
.${P}-direction-bottom .${P}-link {
  width: fit-content;
  max-width: 100%;
}
.${P}-type-c-text-horizontal .${P}-panel {
  flex-direction: row;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
}
.${P}-type-c-text-horizontal .${P}-link {
  width: auto;
  flex-shrink: 0;
}
.${P}-type-c-text-horizontal .${P}-gap-control {
  width: auto;
  height: 100%;
  min-height: 20px;
  flex-shrink: 0;
}
.${P}-type-c-text-horizontal .${P}-gap-control::before {
  width: 100%;
  height: 100%;
  min-width: 20px;
  min-height: 20px;
}
.${P}-link {
  display: block;
  width: 100%;
  color: var(--${P}-link-color);
  text-decoration: none;
  transition: color 200ms ease;
}
.${P}-link-text-box {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-width: 0;
  box-sizing: border-box;
}
.${P}-link-text-inner {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-sizing: border-box;
  outline: 1px solid #FF5C02;
}
.${P}-link-text-inner-hidden {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-sizing: border-box;
}
.${P}-link-text {
  display: block;
  width: 100%;
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
.${P}-link:hover,
.${P}-link:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-link {
  color: var(--${P}-hover-link-color, var(--${P}-link-color));
  outline: none;
}
.${P}-link:hover .${P}-link-text,
.${P}-link:focus-visible .${P}-link-text,
.${P}-lightbox.${P}-state-hover .${P}-link-text {
  color: inherit;
}
.${P}-editor .${P}-toggle {
  cursor: default;
}
`;
}

function handleLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  onClose: () => void,
  isEditor?: boolean,
  isPreviewMode?: boolean,
) {
  if (isEditor && !isPreviewMode) {
    event.preventDefault();
    return;
  }

  onClose();
}

const LIGHTBOX_CSS_VARS = [
  '--cntrl-article-width',
  '--cntrl-article-top',
  '--cntrl-article-left',
  '--cntrl-viewport-height',
] as const;

function findLayoutContainer(element: HTMLElement | null): HTMLElement | null {
  let el = element;
  while (el) {
    if (getComputedStyle(el).getPropertyValue('--cntrl-article-width').trim()) {
      return el;
    }
    el = el.parentElement;
  }

  return element;
}

function getLightboxPortalStyle(container: HTMLElement | null): CSSProperties {
  const style: Record<string, string> = {};
  const layoutContainer = findLayoutContainer(container);
  if (!layoutContainer) return style;

  const computed = getComputedStyle(layoutContainer);
  for (const varName of LIGHTBOX_CSS_VARS) {
    const value = computed.getPropertyValue(varName).trim();
    if (value) {
      style[varName] = value;
    }
  }

  return style;
}

export function Burger({
  settings,
  content,
  isEditor,
  isEditMode,
  isPreviewMode,
  activeEvent,
  portalId,
  layoutId,
  onUpdateSettings,
}: BurgerProps) {
  const { prefix: P } = useScopedStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const openAnimationRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const prevLayoutIdForOverlayRef = useRef(layoutId);
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOverlayMounted, setIsOverlayMounted] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  const {
    type = 'b',
    direction = 'left',
    horizontalAlign = 'left',
    verticalAlign = 'top',
    textOrientation = 'vertical',
    iconColor = '#000000',
    iconSize = 24 / 1440,
    iconAnimation = 'a',
    linkColor = '#000000',
    menuBackgroundColor = '#ffffff',
    overlayColor = 'rgba(0, 0, 0, 0.45)',
    closeButtonColor = '#000000',
    effect = 'fade',
    menuWidth = 320 / 1440,
    textWidth = 280 / 1440,
    gap = 0,
    textPaddingLeft = 10 / 1440,
    textPaddingRight = 10 / 1440,
    textPaddingTop = 10 / 1440,
    textPaddingBottom = 10 / 1440,
    fontFamily,
    fontSettings,
    fontSize,
    lineHeight,
    letterSpacing = 0,
    wordSpacing = 0,
    textAlign = 'left',
    textAppearance,
    stateOverrides,
  } = settings;

  const colorVars = buildColorVars(P, {
    iconColor,
    closeButtonColor,
    linkColor,
    menuBackgroundColor,
    overlayColor,
  }, COLOR_VAR_MAP, STATE_KEYS, stateOverrides);

  const resolvedTextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: fontSettings?.fontWeight ?? 400,
      fontStyle: fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fontSize ?? 0.01,
    lineHeight,
    letterSpacing,
    wordSpacing,
    textAlign,
    textAppearance,
    color: linkColor,
  };

  const linkTypographyCss = omitTextColors(textStylesToCss(resolvedTextStyle, isEditor));
  const linkTextClassName = getTextClassName(
    fontSize,
    lineHeight,
    `${P}-link-text`,
    `${P}-text-tight-leading`,
  );
  const isFullLightbox = type === 'a';
  const isVerticalPanel = type === 'b';
  const isHorizontalPanel = type === 'c';
  const isHorizontalText = isHorizontalPanel && textOrientation === 'horizontal';
  const linkTextStyle: CSSProperties = {
    ...linkTypographyCss,
    ...getTextLeadingVars(fontSize, lineHeight, P, isEditor),
    whiteSpace: 'pre-wrap',
    ...(isFullLightbox ? { textAlign: 'center' } : {}),
  };
  const scaled = (value: number) => scalingValue(value, isEditor);
  const showControls = isEditMode ?? false;
  const showTextBoxOutline = showControls && isHorizontalPanel;

  const effectiveDirection = normalizeDirection(type, direction);

  const effectiveLayout = useMemo(
    () => getEffectiveBurgerLayout(effectiveDirection, {
      type,
      menuWidth,
      textPaddingLeft,
      textPaddingRight,
      textPaddingTop,
      textPaddingBottom,
      verticalAlign,
      horizontalAlign,
      fontSize,
    }),
    [
      effectiveDirection,
      type,
      menuWidth,
      textPaddingLeft,
      textPaddingRight,
      textPaddingTop,
      textPaddingBottom,
      verticalAlign,
      horizontalAlign,
      fontSize,
    ],
  );

  const renderLinkLabel = (label: string) => {
    const textContent = (
      <span className={linkTextClassName} style={linkTextStyle}>
        {renderMultilineText(label)}
      </span>
    );

    if (!isHorizontalPanel || isFullLightbox) {
      return textContent;
    }

    return (
      <span
        className={`${P}-link-text-box`}
        style={{ width: scaled(textWidth), maxWidth: '100%' }}
      >
        <span
          className={showTextBoxOutline ? `${P}-link-text-inner` : `${P}-link-text-inner-hidden`}
          style={{ width: '100%' }}
        >
          {textContent}
        </span>
      </span>
    );
  };

  const useLayoutBoundLightbox = isEditor || isFullLightbox;

  const panelStyle = isFullLightbox
    ? {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }
    : {
      ...getPanelPaddingStyle(effectiveDirection, verticalAlign, horizontalAlign, effectiveLayout, isEditor),
      [`--${P}-menu-width`]: scaled(menuWidth),
      ...(isHorizontalText
        ? {
          flexDirection: 'row' as const,
          justifyContent: HORIZONTAL_ALIGN_MAP[horizontalAlign],
          alignItems: 'center' as const,
        }
        : {
          alignItems: isVerticalPanel ? undefined : HORIZONTAL_ALIGN_MAP[horizontalAlign],
          justifyContent: isVerticalPanel ? VERTICAL_ALIGN_MAP[verticalAlign] : undefined,
        }),
    };

  const prevSettingsRef = useRef(settings);
  const prevLayoutIdRef = useRef(layoutId);

  useEffect(() => {
    if (!onUpdateSettings || !isEditor) {
      prevSettingsRef.current = settings;
      prevLayoutIdRef.current = layoutId;
      return;
    }

    if (prevLayoutIdRef.current !== layoutId) {
      prevSettingsRef.current = settings;
      prevLayoutIdRef.current = layoutId;
      return;
    }

    const prevSettings = prevSettingsRef.current;
    if (prevSettings === settings) {
      return;
    }

    const updatedSettings = applyBurgerSettingsChange(settings, prevSettings);
    prevSettingsRef.current = settings;

    if (!hasBurgerPaddingChanges(settings, updatedSettings)) {
      return;
    }

    onUpdateSettings(updatedSettings);
  }, [settings, onUpdateSettings, isEditor, layoutId]);

  const resolvedIconSize = scalingValue(iconSize, isEditor);
  const rootStyle: CSSProperties = {
    ...colorVars,
    width: resolvedIconSize,
    height: resolvedIconSize,
    minWidth: resolvedIconSize,
    minHeight: resolvedIconSize,
    maxWidth: resolvedIconSize,
    maxHeight: resolvedIconSize,
    [`--${P}-icon-line-height`]: scalingValue(iconSize * 0.1, isEditor),
  };

  const items = content ?? [];
  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const editorClass = isEditor && !isPreviewMode ? `${P}-editor` : '';
  const openClass = isOpen ? `${P}-open` : '';

  const lightboxPortalStyle = useMemo(
    () => getLightboxPortalStyle(containerRef.current),
    [isOverlayMounted, isOpen, layoutId],
  );

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((open) => !open);
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      clearCloseTimer();
      setIsOverlayMounted(true);
      return;
    }

    openAnimationRef.current += 1;
    setIsOverlayActive(false);
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsOverlayMounted(false);
    }, MENU_ANIM_MS);

    return clearCloseTimer;
  }, [isOpen]);

  useLayoutEffect(() => {
    if (prevLayoutIdForOverlayRef.current === layoutId) {
      return;
    }

    prevLayoutIdForOverlayRef.current = layoutId;
    openAnimationRef.current += 1;
    clearCloseTimer();
    setIsOpen(false);
    setIsOverlayActive(false);
    setIsOverlayMounted(false);
  }, [layoutId]);

  useLayoutEffect(() => {
    if (!isOverlayMounted || !isOpen) {
      return;
    }

    const openGeneration = openAnimationRef.current + 1;
    openAnimationRef.current = openGeneration;

    setIsOverlayActive(false);
    void overlayRef.current?.offsetHeight;

    const frameId = requestAnimationFrame(() => {
      if (openAnimationRef.current !== openGeneration) {
        return;
      }
      setIsOverlayActive(true);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOverlayMounted, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isEditor || isEditMode || isPreviewMode) return;
    setIsOpen(false);
  }, [isEditor, isEditMode, isPreviewMode]);

  const overlay = isOverlayMounted && typeof document !== 'undefined'
    ? createPortal(
      <div style={lightboxPortalStyle} data-selection="none">
        <div
          ref={overlayRef}
          className={[
            `${P}-lightbox`,
            isFullLightbox ? `${P}-full-lightbox ${P}-effect-${effect}` : `${P}-direction-${effectiveDirection}`,
            isHorizontalPanel ? `${P}-type-c-text-${textOrientation}` : '',
            isOverlayActive ? `${P}-lightbox-active` : '',
            useLayoutBoundLightbox ? `${P}-lightbox-editor` : '',
            isEditMode ? `${P}-lightbox-edit-mode` : '',
            stateClass,
          ].filter(Boolean).join(' ')}
          style={colorVars}
          aria-hidden={!isOverlayActive}
        >
          <button
            type="button"
            className={`${P}-backdrop`}
            onClick={closeMenu}
            aria-label="Close menu"
          />
          <nav className={`${P}-panel`} style={panelStyle} aria-label="Menu">
            {showControls && !isFullLightbox && renderTextPaddingControls(P, effectiveDirection, verticalAlign, horizontalAlign, effectiveLayout, fontSize, scaled)}
            {items.map((item, index) => {
              const label = item.label ?? 'Link';
              const linkNode = item.link ? (
                <a
                  href={item.link}
                  className={`${P}-link`}
                  onClick={(event) => handleLinkClick(event, closeMenu, isEditor, isPreviewMode)}
                >
                  {renderLinkLabel(label)}
                </a>
              ) : (
                <span className={`${P}-link`}>
                  {renderLinkLabel(label)}
                </span>
              );

              return (
                <Fragment key={index}>
                  {index > 0 && (
                    <div
                      data-controls={showControls ? 'gap' : undefined}
                      data-controls-axis={isHorizontalText ? 'x' : 'y'}
                      className={showControls ? `${P}-gap-control` : undefined}
                      style={isHorizontalText
                        ? { width: scaled(gap), flexShrink: 0 }
                        : { height: scaled(gap) }}
                    />
                  )}
                  {linkNode}
                </Fragment>
              );
            })}
          </nav>
        </div>
      </div>,
      (portalId ? document.getElementById(portalId) : null) ?? document.body,
    )
    : null;

  return (
    <>
      <div
        ref={containerRef}
        className={`${P}-root ${openClass} ${stateClass} ${editorClass} ${P}-icon-animation-${iconAnimation}`.trim()}
        style={rootStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        <button
          type="button"
          className={`${P}-toggle`}
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`${P}-icon`} aria-hidden="true">
            <span className={`${P}-icon-line`} />
            <span className={`${P}-icon-line`} />
            <span className={`${P}-icon-line`} />
          </span>
        </button>
      </div>
      {overlay}
    </>
  );
}
