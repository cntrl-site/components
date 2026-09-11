import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils';
import { omitTextColors, textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

const MENU_ANIM_MS = 300;
const NAV_STATE_ANIM_MS = 300;
const NAV_SWITCH_ENTER_EXTRA = 8 / 1440;
const PADDING_HANDLE_SIZE = 0.004;
const MIN_TEXT_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_TEXT_WIDTH = MIN_TEXT_WIDTH_PX / ARTICLE_DESIGN_WIDTH;

type BurgerEffect = 'fade' | 'left' | 'top' | 'right' | 'bottom';

type BurgerLogo = {
  mode?: 'On' | 'Off';
  icon?: string | null;
};

type BurgerLogoPosition = 'left' | 'center' | 'right';

type BurgerLink = {
  mode?: 'page' | 'url';
  page?: string;
  url?: string;
  label?: string;
  anchor?: string;
  openIn?: string;
  showIn?: string;
};

type BurgerPosition =
  | 'left-top'
  | 'center-top'
  | 'right-top'
  | 'left-center'
  | 'center'
  | 'center-center'
  | 'right-center'
  | 'left-bottom'
  | 'center-bottom'
  | 'right-bottom';

type BurgerSettings = {
  link?: BurgerLink[];
  logo?: BurgerLogo | null;
  logoMaxWidth?: number;
  logoMaxHeight?: number;
  logoPosition?: BurgerLogoPosition;
  logoColor?: string;
  panelHeight?: number;
  backgroundColor?: string;
  position?: BurgerPosition;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  iconColor?: string;
  showIcon?: 'on' | 'off';
  iconSize?: number;
  linkColor?: string;
  openLinkColor?: string;
  compactIconColor?: string;
  compactCloseButtonColor?: string;
  compactLinkColor?: string;
  compactLogoColor?: string;
  compactBackgroundColor?: string;
  compactLogoMaxWidth?: number;
  compactLogoMaxHeight?: number;
  compactLogoPosition?: BurgerLogoPosition;
  compactPanelHeight?: number;
  compactShowIcon?: 'on' | 'off';
  compactIconSize?: number;
  compactNavTextWidth?: number;
  compactNavGap?: number;
  compactNavPaddingLeft?: number;
  compactNavPaddingRight?: number;
  compactFontFamily?: string;
  compactFontSettings?: {
    fontWeight?: number;
    fontStyle?: string;
  };
  compactFontSize?: number;
  compactLineHeight?: number;
  compactLetterSpacing?: number;
  compactWordSpacing?: number;
  compactTextAlign?: TextStyles['textAlign'];
  compactTextAppearance?: TextStyles['textAppearance'];
  openLogoColor?: string;
  menuBackgroundColor?: string;
  overlayColor?: string;
  closeButtonColor?: string;
  effect?: BurgerEffect;
  textWidth?: number;
  navTextWidth?: number;
  gap?: number;
  navGap?: number;
  navPaddingLeft?: number;
  navPaddingRight?: number;
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
  openFontFamily?: string;
  openFontSettings?: {
    fontWeight?: number;
    fontStyle?: string;
  };
  openFontSize?: number;
  openLineHeight?: number;
  openLetterSpacing?: number;
  openWordSpacing?: number;
  openTextAlign?: TextStyles['textAlign'];
  openTextAppearance?: TextStyles['textAppearance'];
  stateOverrides?: Record<string, Partial<Record<'iconColor' | 'closeButtonColor' | 'linkColor' | 'openLinkColor' | 'compactIconColor' | 'compactCloseButtonColor' | 'compactLinkColor' | 'compactLogoColor' | 'compactBackgroundColor' | 'openLogoColor' | 'menuBackgroundColor' | 'overlayColor' | 'backgroundColor' | 'logoColor', string>>>;
};

type BurgerVisualState = 'default' | 'compact' | 'open';
type BurgerNavigationState = 'default' | 'compact';

function resolveCurrentState(value?: string | null): BurgerVisualState | undefined {
  if (value === 'default' || value === 'compact' || value === 'open') return value;
  if (value === 'onScroll') return 'compact';
  return undefined;
}

type BurgerShowIn = 'always' | 'open only' | 'open and compact' | 'default and open';

function resolveLogoPosition(value?: string): BurgerLogoPosition {
  if (value === 'center' || value === 'right') return value;
  return 'left';
}

function resolveShowIn(value?: string): BurgerShowIn {
  const showIn = (value ?? 'always').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (showIn === 'open only' || showIn === 'openonly') return 'open only';
  if (showIn === 'open and compact' || showIn === 'openandcompact') return 'open and compact';
  if (showIn === 'default and open' || showIn === 'defaultandopen') return 'default and open';
  return 'always';
}

function isVisibleInClosedNav(item: BurgerLink, navigationState: BurgerNavigationState): boolean {
  switch (resolveShowIn(item.showIn)) {
    case 'open only':
      return false;
    case 'open and compact':
      return navigationState === 'compact';
    case 'default and open':
      return navigationState === 'default';
    default:
      return true;
  }
}

type BurgerPageRef = {
  id: string;
  slug: string;
};

function resolvePagePath(page: string, pages?: BurgerPageRef[]): string {
  if (!page) return '';
  const match = pages?.find((item) => item.id === page);
  if (match) {
    return match.slug === '' ? '/' : `/${match.slug}`;
  }
  if (page.startsWith('/') || page.startsWith('#') || /^[a-z][a-z\d+\-.]*:/i.test(page)) {
    return page;
  }
  return pages ? `/${page}` : page;
}

function resolveBurgerLink(item: BurgerLink, pages?: BurgerPageRef[]): {
  label: string;
  href: string;
  target?: '_blank';
} {
  const label = item.label || 'Link';
  const mode = item.mode === 'url' ? 'url' : 'page';
  const openIn = (item.openIn ?? '').toLowerCase();
  const target = openIn.includes('new') || openIn === 'blank' || openIn === '_blank'
    ? '_blank'
    : undefined;

  if (mode === 'url') {
    return { label, href: item.url ?? '', target };
  }

  const page = resolvePagePath(item.page ?? '', pages);
  const anchor = (item.anchor ?? '').replace(/^#/, '');
  const href = anchor ? (page ? `${page}#${anchor}` : `#${anchor}`) : page;
  return { label, href, target };
}

const BURGER_ICON_VIEWBOX = 24;
const BURGER_ICON_LINE_HEIGHT = BURGER_ICON_VIEWBOX * 0.125;
const BURGER_ICON_LINE_GAP = BURGER_ICON_VIEWBOX * 0.125;
const BURGER_ICON_LINE_OFFSET = (
  BURGER_ICON_VIEWBOX - (3 * BURGER_ICON_LINE_HEIGHT + 2 * BURGER_ICON_LINE_GAP)
) / 2;
const BURGER_ICON_LINE_SHIFT = BURGER_ICON_LINE_HEIGHT + BURGER_ICON_LINE_GAP;

function BurgerIcon({ className, lineClassName }: { className: string; lineClassName: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${BURGER_ICON_VIEWBOX} ${BURGER_ICON_VIEWBOX}`}
      aria-hidden="true"
    >
      <rect
        className={`${lineClassName} ${lineClassName}-top`}
        x="0"
        y={BURGER_ICON_LINE_OFFSET}
        width={BURGER_ICON_VIEWBOX}
        height={BURGER_ICON_LINE_HEIGHT}
        rx={BURGER_ICON_LINE_HEIGHT / 2}
      />
      <rect
        className={`${lineClassName} ${lineClassName}-mid`}
        x="0"
        y={BURGER_ICON_LINE_OFFSET + BURGER_ICON_LINE_SHIFT}
        width={BURGER_ICON_VIEWBOX}
        height={BURGER_ICON_LINE_HEIGHT}
        rx={BURGER_ICON_LINE_HEIGHT / 2}
      />
      <rect
        className={`${lineClassName} ${lineClassName}-bot`}
        x="0"
        y={BURGER_ICON_LINE_OFFSET + 2 * BURGER_ICON_LINE_SHIFT}
        width={BURGER_ICON_VIEWBOX}
        height={BURGER_ICON_LINE_HEIGHT}
        rx={BURGER_ICON_LINE_HEIGHT / 2}
      />
    </svg>
  );
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
): CSSProperties {
  const resolvedFontSize = fontSize ?? 0.01;

  if (lineHeight === undefined || lineHeight >= resolvedFontSize) {
    return {};
  }

  return {
    [`--${prefix}-text-leading-gap`]: scalingValue((resolvedFontSize - lineHeight) / 2, isEditor),
  } as CSSProperties;
}

type BurgerTypeStyle = {
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
};

function resolveBurgerTypeStyle(style: BurgerTypeStyle, fallback: BurgerTypeStyle = {}): BurgerTypeStyle {
  return {
    fontFamily: style.fontFamily ?? fallback.fontFamily,
    fontSettings: style.fontSettings ?? fallback.fontSettings,
    fontSize: style.fontSize ?? fallback.fontSize,
    lineHeight: style.lineHeight ?? fallback.lineHeight,
    letterSpacing: style.letterSpacing ?? fallback.letterSpacing ?? 0,
    wordSpacing: style.wordSpacing ?? fallback.wordSpacing ?? 0,
    textAlign: style.textAlign ?? fallback.textAlign ?? 'left',
    textAppearance: style.textAppearance ?? fallback.textAppearance,
  };
}

function burgerTypeStyleToCss(
  P: string,
  style: BurgerTypeStyle,
  isEditor?: boolean,
): { css: CSSProperties; className: string } {
  const textStyle: TextStyles = {
    fontSettings: {
      fontFamily: style.fontFamily,
      fontWeight: style.fontSettings?.fontWeight ?? 400,
      fontStyle: style.fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: style.fontSize ?? 0.01,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing ?? 0,
    wordSpacing: style.wordSpacing ?? 0,
    textAlign: style.textAlign,
    textAppearance: style.textAppearance,
    color: '',
  };

  return {
    css: {
      ...omitTextColors(textStylesToCss(textStyle, isEditor)),
      ...getTextLeadingVars(style.fontSize, style.lineHeight, P, isEditor),
    },
    className: getTextClassName(
      style.fontSize,
      style.lineHeight,
      `${P}-link-text`,
      `${P}-text-tight-leading`,
    ),
  };
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
  options: {
    textPaddingLeft: number;
    textPaddingRight: number;
    textPaddingTop: number;
    textPaddingBottom: number;
    fontSize?: number;
  },
): EffectiveBurgerLayout {
  const panelSize = 1;
  const minContentHeight = Math.max(MIN_TEXT_WIDTH, options.fontSize ?? MIN_TEXT_WIDTH);

  const { start: effectivePaddingTop, end: effectivePaddingBottom } = scalePaddingsToFit(
    options.textPaddingTop,
    options.textPaddingBottom,
    panelSize,
    minContentHeight,
  );
  const { start: effectivePaddingLeft, end: effectivePaddingRight } = scalePaddingsToFit(
    options.textPaddingLeft,
    options.textPaddingRight,
    panelSize,
    MIN_TEXT_WIDTH,
  );

  return {
    effectivePaddingLeft,
    effectivePaddingRight,
    effectivePaddingTop,
    effectivePaddingBottom,
    panelSize,
  };
}

type HorizontalAlign = 'left' | 'center' | 'right';
type VerticalAlign = 'top' | 'center' | 'bottom';

function parseBurgerPosition(position: BurgerPosition): {
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
} {
  if (position === 'center' || position === 'center-center') {
    return { horizontalAlign: 'center', verticalAlign: 'center' };
  }
  const [horizontalAlign, verticalAlign] = position.split('-') as [HorizontalAlign, VerticalAlign];
  return { horizontalAlign, verticalAlign };
}

function resolveBurgerAlignment(settings: Pick<BurgerSettings, 'position' | 'horizontalAlign' | 'verticalAlign'>): {
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
} {
  if (settings.position) {
    return parseBurgerPosition(settings.position);
  }

  return {
    horizontalAlign: settings.horizontalAlign ?? 'left',
    verticalAlign: settings.verticalAlign ?? 'top',
  };
}

function hasBurgerPaddingChanges(left: BurgerSettings, right: BurgerSettings): boolean {
  return left.textPaddingLeft !== right.textPaddingLeft
    || left.textPaddingRight !== right.textPaddingRight
    || left.textPaddingTop !== right.textPaddingTop
    || left.textPaddingBottom !== right.textPaddingBottom;
}

const LEGACY_COMPACT_SETTING_KEYS = [
  ['onScrollIconColor', 'compactIconColor'],
  ['onScrollCloseButtonColor', 'compactCloseButtonColor'],
  ['onScrollLinkColor', 'compactLinkColor'],
  ['onScrollLogoColor', 'compactLogoColor'],
  ['onScrollBackgroundColor', 'compactBackgroundColor'],
  ['onScrollPanelColor', 'compactBackgroundColor'],
  ['onScrollLogoMaxWidth', 'compactLogoMaxWidth'],
  ['onScrollLogoMaxHeight', 'compactLogoMaxHeight'],
  ['onScrollLogoPosition', 'compactLogoPosition'],
  ['onScrollPanelHeight', 'compactPanelHeight'],
  ['onScrollIconSize', 'compactIconSize'],
  ['onScrollNavTextWidth', 'compactNavTextWidth'],
  ['onScrollNavGap', 'compactNavGap'],
  ['onScrollNavPaddingLeft', 'compactNavPaddingLeft'],
  ['onScrollNavPaddingRight', 'compactNavPaddingRight'],
  ['onScrollFontFamily', 'compactFontFamily'],
  ['onScrollFontSettings', 'compactFontSettings'],
  ['onScrollFontSize', 'compactFontSize'],
  ['onScrollLineHeight', 'compactLineHeight'],
  ['onScrollLetterSpacing', 'compactLetterSpacing'],
  ['onScrollWordSpacing', 'compactWordSpacing'],
  ['onScrollTextAlign', 'compactTextAlign'],
  ['onScrollTextAppearance', 'compactTextAppearance'],
] as const;

function migrateLegacyBurgerSettings(settings: BurgerSettings): BurgerSettings {
  const raw = settings as BurgerSettings & Record<string, unknown>;
  const updates: Partial<BurgerSettings> = {};
  for (const [oldKey, newKey] of LEGACY_COMPACT_SETTING_KEYS) {
    if (settings[newKey] !== undefined || raw[oldKey] === undefined) continue;
    (updates as Record<string, unknown>)[newKey] = raw[oldKey];
  }
  const legacyOverrides = raw.stateOverrides as Record<string, unknown> | undefined;
  if (legacyOverrides && (legacyOverrides.onScroll !== undefined || legacyOverrides['onScroll-hover'] !== undefined)) {
    updates.stateOverrides = { ...settings.stateOverrides };
    if (legacyOverrides.onScroll !== undefined && settings.stateOverrides?.compact === undefined) {
      updates.stateOverrides.compact = legacyOverrides.onScroll as NonNullable<BurgerSettings['stateOverrides']>[string];
    }
    if (legacyOverrides['onScroll-hover'] !== undefined && settings.stateOverrides?.['compact-hover'] === undefined) {
      updates.stateOverrides['compact-hover'] = legacyOverrides['onScroll-hover'] as NonNullable<BurgerSettings['stateOverrides']>[string];
    }
  }
  return Object.keys(updates).length === 0 ? settings : { ...settings, ...updates };
}

function applyBurgerOpenTextDefaults(settings: BurgerSettings): BurgerSettings {
  settings = migrateLegacyBurgerSettings(settings);
  const legacy = settings as BurgerSettings & {
    panelColor?: string;
    compactPanelColor?: string;
    onScrollPanelColor?: string;
  };
  const updates: Partial<BurgerSettings> = {};
  if (settings.backgroundColor === undefined && legacy.panelColor !== undefined) {
    updates.backgroundColor = legacy.panelColor;
  }
  if (settings.openFontFamily === undefined && settings.fontFamily !== undefined) {
    updates.openFontFamily = settings.fontFamily;
  }
  if (settings.openFontSettings === undefined && settings.fontSettings !== undefined) {
    updates.openFontSettings = settings.fontSettings;
  }
  if (settings.openFontSize === undefined && settings.fontSize !== undefined) {
    updates.openFontSize = settings.fontSize;
  }
  if (settings.openLineHeight === undefined && settings.lineHeight !== undefined) {
    updates.openLineHeight = settings.lineHeight;
  }
  if (settings.openLetterSpacing === undefined && settings.letterSpacing !== undefined) {
    updates.openLetterSpacing = settings.letterSpacing;
  }
  if (settings.openWordSpacing === undefined && settings.wordSpacing !== undefined) {
    updates.openWordSpacing = settings.wordSpacing;
  }
  if (settings.openTextAlign === undefined && settings.textAlign !== undefined) {
    updates.openTextAlign = settings.textAlign;
  }
  if (settings.openTextAppearance === undefined && settings.textAppearance !== undefined) {
    updates.openTextAppearance = settings.textAppearance;
  }
  if (settings.openLinkColor === undefined) {
    const inheritedOpenLinkColor = settings.stateOverrides?.open?.openLinkColor
      ?? settings.stateOverrides?.open?.linkColor
      ?? settings.linkColor;
    if (inheritedOpenLinkColor !== undefined) {
      updates.openLinkColor = inheritedOpenLinkColor;
    }
  }
  if (settings.compactIconColor === undefined) {
    const inherited = settings.stateOverrides?.compact?.iconColor ?? settings.iconColor;
    if (inherited !== undefined) updates.compactIconColor = inherited;
  }
  if (settings.compactCloseButtonColor === undefined) {
    const inherited = settings.stateOverrides?.compact?.closeButtonColor ?? settings.closeButtonColor;
    if (inherited !== undefined) updates.compactCloseButtonColor = inherited;
  }
  if (settings.compactLinkColor === undefined) {
    const inherited = settings.stateOverrides?.compact?.linkColor ?? settings.linkColor;
    if (inherited !== undefined) updates.compactLinkColor = inherited;
  }
  if (settings.compactLogoColor === undefined) {
    const inherited = settings.stateOverrides?.compact?.logoColor ?? settings.logoColor;
    if (inherited !== undefined) updates.compactLogoColor = inherited;
  }
  if (settings.openLogoColor === undefined) {
    const inherited = settings.stateOverrides?.open?.logoColor ?? settings.logoColor;
    if (inherited !== undefined) updates.openLogoColor = inherited;
  }
  if (settings.compactBackgroundColor === undefined) {
    const inherited = settings.stateOverrides?.compact?.backgroundColor
      ?? (legacy.stateOverrides?.compact as { panelColor?: string } | undefined)?.panelColor
      ?? legacy.compactPanelColor
      ?? legacy.onScrollPanelColor
      ?? settings.backgroundColor
      ?? updates.backgroundColor;
    if (inherited !== undefined) updates.compactBackgroundColor = inherited;
  }
  if (settings.logoMaxHeight === undefined && settings.logoMaxWidth !== undefined) {
    updates.logoMaxHeight = settings.logoMaxWidth;
  }
  if (settings.compactLogoMaxHeight === undefined && settings.compactLogoMaxWidth !== undefined) {
    updates.compactLogoMaxHeight = settings.compactLogoMaxWidth;
  }
  const inheritScrollParam = <K extends keyof BurgerSettings>(
    key: K,
    defaultKey: keyof BurgerSettings,
  ) => {
    if (settings[key] !== undefined) return;
    const inherited = settings[defaultKey];
    if (inherited !== undefined) {
      updates[key] = inherited as BurgerSettings[K];
    }
  };
  inheritScrollParam('compactLogoMaxHeight', 'logoMaxHeight');
  inheritScrollParam('compactLogoPosition', 'logoPosition');
  inheritScrollParam('compactPanelHeight', 'panelHeight');
  inheritScrollParam('compactShowIcon', 'showIcon');
  inheritScrollParam('compactIconSize', 'iconSize');
  inheritScrollParam('compactNavTextWidth', 'navTextWidth');
  inheritScrollParam('compactNavGap', 'navGap');
  inheritScrollParam('compactNavPaddingLeft', 'navPaddingLeft');
  inheritScrollParam('compactNavPaddingRight', 'navPaddingRight');
  inheritScrollParam('compactFontFamily', 'fontFamily');
  inheritScrollParam('compactFontSettings', 'fontSettings');
  inheritScrollParam('compactFontSize', 'fontSize');
  inheritScrollParam('compactLineHeight', 'lineHeight');
  inheritScrollParam('compactLetterSpacing', 'letterSpacing');
  inheritScrollParam('compactWordSpacing', 'wordSpacing');
  inheritScrollParam('compactTextAlign', 'textAlign');
  inheritScrollParam('compactTextAppearance', 'textAppearance');
  return Object.keys(updates).length === 0 ? settings : { ...settings, ...updates };
}

export function applyBurgerSettingsChange(
  nextSettings: BurgerSettings,
  prevSettings: BurgerSettings,
): BurgerSettings {
  const layout = getEffectiveBurgerLayout({
    textPaddingLeft: nextSettings.textPaddingLeft ?? 0,
    textPaddingRight: nextSettings.textPaddingRight ?? 0,
    textPaddingTop: nextSettings.textPaddingTop ?? 0,
    textPaddingBottom: nextSettings.textPaddingBottom ?? 0,
    fontSize: nextSettings.openFontSize ?? nextSettings.fontSize ?? prevSettings.openFontSize ?? prevSettings.fontSize,
  });

  const updates: Partial<BurgerSettings> = {};

  if ((nextSettings.textPaddingLeft ?? 0) !== layout.effectivePaddingLeft) {
    updates.textPaddingLeft = layout.effectivePaddingLeft;
  }
  if ((nextSettings.textPaddingRight ?? 0) !== layout.effectivePaddingRight) {
    updates.textPaddingRight = layout.effectivePaddingRight;
  }
  if ((nextSettings.textPaddingTop ?? 0) !== layout.effectivePaddingTop) {
    updates.textPaddingTop = layout.effectivePaddingTop;
  }
  if ((nextSettings.textPaddingBottom ?? 0) !== layout.effectivePaddingBottom) {
    updates.textPaddingBottom = layout.effectivePaddingBottom;
  }

  if (Object.keys(updates).length === 0) {
    return nextSettings;
  }

  return { ...nextSettings, ...updates };
}

function getPanelPaddingStyle(
  layout: EffectiveBurgerLayout,
  isEditor?: boolean,
): CSSProperties {
  return {
    paddingLeft: scalingValue(layout.effectivePaddingLeft, isEditor),
    paddingRight: scalingValue(layout.effectivePaddingRight, isEditor),
    paddingTop: scalingValue(layout.effectivePaddingTop, isEditor),
    paddingBottom: scalingValue(layout.effectivePaddingBottom, isEditor),
  };
}

function renderTextPaddingControls(
  P: string,
  layout: EffectiveBurgerLayout,
  fontSize: number | undefined,
  scaled: (value: number) => string,
) {
  const minContentSize = Math.max(MIN_TEXT_WIDTH, fontSize ?? MIN_TEXT_WIDTH);

  const topHandleSize = Math.max(layout.effectivePaddingTop, PADDING_HANDLE_SIZE);
  const bottomHandleSize = Math.max(layout.effectivePaddingBottom, PADDING_HANDLE_SIZE);
  const topMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingBottom - minContentSize);
  const bottomMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingTop - minContentSize);
  const leftHandleSize = Math.max(layout.effectivePaddingLeft, PADDING_HANDLE_SIZE);
  const rightHandleSize = Math.max(layout.effectivePaddingRight, PADDING_HANDLE_SIZE);
  const leftMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingRight - MIN_TEXT_WIDTH);
  const rightMaxFraction = Math.max(0, layout.panelSize - layout.effectivePaddingLeft - MIN_TEXT_WIDTH);

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
    </>
  );
}

type ColorKeys = 'iconColor' | 'closeButtonColor' | 'linkColor' | 'openLinkColor' | 'compactIconColor' | 'compactCloseButtonColor' | 'compactLinkColor' | 'compactLogoColor' | 'compactBackgroundColor' | 'openLogoColor' | 'menuBackgroundColor' | 'overlayColor' | 'backgroundColor' | 'logoColor';

export type BurgerLinkNavigateEvent = {
  mode: 'page' | 'url';
  href: string;
  page?: string;
  url?: string;
  anchor?: string;
  target?: '_blank';
};

type BurgerProps = {
  settings: BurgerSettings;
  content?: unknown;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  activeEvent?: string;
  currentState?: string | null;
  isSwitchClone?: boolean;
  portalId?: string;
  layoutId?: string;
  pages?: BurgerPageRef[];
  onLinkNavigate?: (event: BurgerLinkNavigateEvent) => void;
  onUpdateSettings?: (settings: BurgerSettings) => void;
  onOpenChange?: (isOpen: boolean) => void;
} & CommonComponentProps;

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  iconColor: 'icon-color',
  closeButtonColor: 'close-button-color',
  linkColor: 'link-color',
  openLinkColor: 'menu-link-color',
  compactIconColor: 'compact-icon-color',
  compactCloseButtonColor: 'compact-close-button-color',
  compactLinkColor: 'compact-link-color',
  compactLogoColor: 'compact-logo-color',
  compactBackgroundColor: 'compact-background-color',
  openLogoColor: 'open-logo-color',
  menuBackgroundColor: 'menu-background-color',
  overlayColor: 'overlay-color',
  backgroundColor: 'background-color',
  logoColor: 'logo-color',
};

const STATE_KEYS = ['hover', 'open'] as const;

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
.${P}-nav-links-inner {
  display: contents;
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
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.${P}-icon-line {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: center;
  transition: transform ${MENU_ANIM_MS}ms ease, opacity ${MENU_ANIM_MS}ms ease;
}
.${P}-root.${P}-open .${P}-icon-line-top {
  transform: translateY(200%) rotate(45deg);
}
.${P}-root.${P}-open .${P}-icon-line-mid {
  opacity: 0;
}
.${P}-root.${P}-open .${P}-icon-line-bot {
  transform: translateY(-200%) rotate(-45deg);
}
.${P}-root.${P}-open .${P}-toggle {
  color: var(--${P}-close-button-color);
}
.${P}-interactive .${P}-toggle:hover,
.${P}-interactive .${P}-toggle:focus-visible,
.${P}-root.${P}-state-hover .${P}-toggle {
  color: var(--${P}-hover-icon-color, var(--${P}-icon-color));
}
.${P}-interactive .${P}-open .${P}-toggle:hover,
.${P}-interactive .${P}-open .${P}-toggle:focus-visible,
.${P}-root.${P}-state-hover .${P}-open .${P}-toggle {
  color: var(--${P}-hover-close-button-color, var(--${P}-close-button-color));
}
.${P}-lightbox {
  position: fixed;
  inset: 0;
  z-index: 2;
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
  transition: opacity ${MENU_ANIM_MS}ms ease, background-color ${MENU_ANIM_MS}ms ease;
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
  transition: transform ${MENU_ANIM_MS}ms ease, opacity ${MENU_ANIM_MS}ms ease, background-color ${MENU_ANIM_MS}ms ease;
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
  width: fit-content;
  max-width: 100%;
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
.${P}-link {
  display: block;
  width: 100%;
  color: var(--${P}-menu-link-color);
  text-decoration: none;
  cursor: default;
  transition: color 200ms ease;
}
.${P}-link-text-box {
  position: relative;
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
.${P}-interactive .${P}-has-href {
  cursor: pointer;
}
.${P}-interactive .${P}-has-href:hover,
.${P}-interactive .${P}-has-href:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-has-href {
  color: var(--${P}-hover-link-color, var(--${P}-link-color));
  outline: none;
}
.${P}-interactive .${P}-lightbox .${P}-has-href:hover,
.${P}-interactive .${P}-lightbox .${P}-has-href:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-link.${P}-has-href {
  color: var(--${P}-open-hover-menu-link-color, var(--${P}-menu-link-color));
  outline: none;
}
.${P}-interactive .${P}-has-href:hover .${P}-link-text,
.${P}-interactive .${P}-has-href:focus-visible .${P}-link-text,
.${P}-lightbox.${P}-state-hover .${P}-has-href .${P}-link-text {
  color: inherit;
}
.${P}-editor .${P}-toggle {
  cursor: default;
  pointer-events: none;
}
.${P}-nav-bar {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background-color: var(--${P}-background-color);
  padding-left: var(--${P}-nav-padding-x, 0);
  padding-right: var(--${P}-nav-padding-x, 0);
  gap: var(--${P}-nav-inner-gap, 0);
}
.${P}-nav-logo {
  position: absolute;
  top: 0;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 100%;
  min-width: 0;
  pointer-events: auto;
}
.${P}-nav-logo-left {
  left: 0;
  right: auto;
  transform: none;
}
.${P}-nav-logo-center {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
.${P}-nav-logo-right {
  left: auto;
  right: 0;
  transform: none;
}
.${P}-nav-logo-inner {
  position: relative;
  flex-shrink: 0;
  width: auto;
  max-height: 100%;
}
.${P}-nav-logo-img {
  display: block;
  width: auto;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
}
.${P}-nav-logo-tinted .${P}-nav-logo-img {
  opacity: 0;
}
.${P}-nav-logo-tint {
  display: none;
}
.${P}-nav-logo-tinted .${P}-nav-logo-tint {
  display: block;
  position: absolute;
  inset: 0;
  background-color: var(--${P}-logo-color);
  -webkit-mask: var(--${P}-logo-image) no-repeat center / contain;
  mask: var(--${P}-logo-image) no-repeat center / contain;
  -webkit-mask-source-type: alpha;
  mask-mode: alpha;
  pointer-events: none;
  transition: background-color 200ms ease;
}
.${P}-root.${P}-state-compact .${P}-nav-logo-tinted .${P}-nav-logo-tint {
  background-color: var(--${P}-compact-logo-color);
}
.${P}-root.${P}-state-open .${P}-nav-logo-tinted .${P}-nav-logo-tint {
  background-color: var(--${P}-open-logo-color, var(--${P}-logo-color));
}
.${P}-interactive .${P}-nav-logo:hover .${P}-nav-logo-tint,
.${P}-root.${P}-state-hover .${P}-nav-logo-tinted .${P}-nav-logo-tint {
  background-color: var(--${P}-hover-logo-color, var(--${P}-logo-color));
}
.${P}-interactive.${P}-state-compact .${P}-nav-logo:hover .${P}-nav-logo-tint,
.${P}-root.${P}-state-compact.${P}-state-hover .${P}-nav-logo-tinted .${P}-nav-logo-tint {
  background-color: var(--${P}-compact-hover-compact-logo-color, var(--${P}-compact-logo-color));
}
.${P}-interactive.${P}-state-open .${P}-nav-logo:hover .${P}-nav-logo-tint,
.${P}-root.${P}-state-open.${P}-state-hover .${P}-nav-logo-tinted .${P}-nav-logo-tint {
  background-color: var(--${P}-open-hover-open-logo-color, var(--${P}-open-logo-color, var(--${P}-logo-color)));
}
.${P}-nav-links {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  pointer-events: none;
  z-index: 0;
}
.${P}-nav-links .${P}-nav-link,
.${P}-nav-links .${P}-gap-control {
  pointer-events: auto;
}
.${P}-nav-gap-control {
  flex-shrink: 0;
}
.${P}-nav-links .${P}-gap-control {
  position: relative;
  width: auto;
  height: 100%;
  min-height: 20px;
  z-index: 2;
}
.${P}-nav-links .${P}-gap-control::before {
  width: 100%;
  height: 100%;
  min-width: 20px;
  min-height: 20px;
}
.${P}-nav-link {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--${P}-link-color);
  text-decoration: none;
  cursor: default;
  transition: color 200ms ease;
}
.${P}-interactive .${P}-nav-link.${P}-has-href:hover,
.${P}-interactive .${P}-nav-link.${P}-has-href:focus-visible,
.${P}-root.${P}-state-hover .${P}-nav-link.${P}-has-href {
  color: var(--${P}-hover-link-color, var(--${P}-link-color));
  outline: none;
}
.${P}-interactive.${P}-state-compact .${P}-nav-link.${P}-has-href:hover,
.${P}-interactive.${P}-state-compact .${P}-nav-link.${P}-has-href:focus-visible,
.${P}-root.${P}-state-compact.${P}-state-hover .${P}-nav-link.${P}-has-href {
  color: var(--${P}-compact-hover-compact-link-color, var(--${P}-compact-link-color));
}
.${P}-root.${P}-state-compact .${P}-nav-bar {
  background-color: var(--${P}-compact-background-color);
}
.${P}-root.${P}-state-compact .${P}-toggle {
  color: var(--${P}-compact-icon-color);
}
.${P}-root.${P}-state-compact .${P}-open .${P}-toggle {
  color: var(--${P}-compact-close-button-color);
}
.${P}-interactive.${P}-state-compact .${P}-toggle:hover,
.${P}-interactive.${P}-state-compact .${P}-toggle:focus-visible,
.${P}-root.${P}-state-compact.${P}-state-hover .${P}-toggle {
  color: var(--${P}-compact-hover-compact-icon-color, var(--${P}-compact-icon-color));
}
.${P}-interactive.${P}-state-compact .${P}-open .${P}-toggle:hover,
.${P}-interactive.${P}-state-compact .${P}-open .${P}-toggle:focus-visible,
.${P}-root.${P}-state-compact.${P}-state-hover .${P}-open .${P}-toggle {
  color: var(--${P}-compact-hover-compact-close-button-color, var(--${P}-compact-close-button-color));
}
.${P}-root.${P}-state-compact .${P}-nav-link {
  color: var(--${P}-compact-link-color);
}
.${P}-lightbox.${P}-state-compact .${P}-panel {
  background-color: var(--${P}-compact-menu-background-color, var(--${P}-menu-background-color));
}
.${P}-lightbox.${P}-state-compact .${P}-backdrop {
  background-color: var(--${P}-compact-overlay-color, var(--${P}-overlay-color));
}
.${P}-interactive .${P}-has-href:hover,
.${P}-interactive .${P}-has-href:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-has-href,
.${P}-root.${P}-state-hover .${P}-has-href {
  color: var(--${P}-hover-link-color, var(--${P}-link-color));
}
.${P}-root.${P}-state-compact.${P}-state-hover .${P}-has-href {
  color: var(--${P}-compact-hover-compact-link-color, var(--${P}-compact-link-color));
}
.${P}-root.${P}-state-open .${P}-toggle {
  color: var(--${P}-open-close-button-color, var(--${P}-close-button-color));
}
.${P}-interactive.${P}-state-open .${P}-toggle:hover,
.${P}-interactive.${P}-state-open .${P}-toggle:focus-visible,
.${P}-root.${P}-state-open.${P}-state-hover .${P}-toggle {
  color: var(--${P}-open-hover-close-button-color, var(--${P}-open-close-button-color, var(--${P}-close-button-color)));
}
.${P}-lightbox .${P}-link {
  color: var(--${P}-menu-link-color);
}
.${P}-lightbox.${P}-state-open .${P}-panel {
  background-color: var(--${P}-open-menu-background-color, var(--${P}-menu-background-color));
}
.${P}-lightbox.${P}-state-open .${P}-backdrop {
  background-color: var(--${P}-open-overlay-color, var(--${P}-overlay-color));
}
.${P}-lightbox.${P}-state-open.${P}-state-hover .${P}-has-href,
.${P}-root.${P}-state-open.${P}-state-hover .${P}-has-href {
  color: var(--${P}-open-hover-menu-link-color, var(--${P}-menu-link-color));
}
.${P}-nav-toggle-wrap {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  z-index: 3;
  pointer-events: auto;
}
.${P}-nav-toggle-wrap-right {
  right: 0;
  left: auto;
}
.${P}-nav-toggle-wrap-left {
  left: 0;
  right: auto;
}
.${P}-nav-padding-left,
.${P}-nav-padding-right {
  position: relative;
  flex-shrink: 0;
  height: 100%;
}
.${P}-nav-toggle-wrap .${P}-root {
  line-height: 0;
  font-size: 0;
}
.${P}-nav-state-anim {
  transition: margin-top ${NAV_STATE_ANIM_MS}ms ease;
}
.${P}-nav-state-anim .${P}-nav-bar {
  transition:
    background-color ${MENU_ANIM_MS}ms ease,
    height ${NAV_STATE_ANIM_MS}ms ease,
    min-height ${NAV_STATE_ANIM_MS}ms ease,
    padding ${NAV_STATE_ANIM_MS}ms ease,
    gap ${NAV_STATE_ANIM_MS}ms ease;
}
.${P}-nav-state-anim .${P}-nav-logo,
.${P}-nav-state-anim .${P}-nav-toggle-wrap {
  transition:
    left ${NAV_STATE_ANIM_MS}ms ease,
    right ${NAV_STATE_ANIM_MS}ms ease,
    transform ${NAV_STATE_ANIM_MS}ms ease;
}
.${P}-nav-state-anim .${P}-nav-logo-inner,
.${P}-nav-state-anim .${P}-nav-padding-left,
.${P}-nav-state-anim .${P}-nav-padding-right,
.${P}-nav-state-anim .${P}-nav-gap-control,
.${P}-nav-state-anim .${P}-link-text-box {
  transition:
    width ${NAV_STATE_ANIM_MS}ms ease,
    height ${NAV_STATE_ANIM_MS}ms ease;
}
.${P}-nav-state-anim .${P}-nav-logo-tint {
  transition:
    background-color ${NAV_STATE_ANIM_MS}ms ease;
}
.${P}-nav-state-anim .${P}-nav-toggle-wrap .${P}-root {
  transition:
    width ${NAV_STATE_ANIM_MS}ms ease,
    height ${NAV_STATE_ANIM_MS}ms ease,
    min-width ${NAV_STATE_ANIM_MS}ms ease,
    min-height ${NAV_STATE_ANIM_MS}ms ease,
    max-width ${NAV_STATE_ANIM_MS}ms ease,
    max-height ${NAV_STATE_ANIM_MS}ms ease;
}
.${P}-nav-state-anim .${P}-icon-line {
  transition:
    transform ${MENU_ANIM_MS}ms ease,
    opacity ${MENU_ANIM_MS}ms ease;
}
.${P}-nav-state-anim .${P}-nav-link,
.${P}-nav-state-anim .${P}-link,
.${P}-nav-state-anim .${P}-link-text,
.${P}-nav-state-anim .${P}-text-tight-leading {
  transition:
    color 200ms ease,
    font-size ${NAV_STATE_ANIM_MS}ms ease,
    line-height ${NAV_STATE_ANIM_MS}ms ease,
    letter-spacing ${NAV_STATE_ANIM_MS}ms ease,
    word-spacing ${NAV_STATE_ANIM_MS}ms ease,
    padding ${NAV_STATE_ANIM_MS}ms ease;
}
`;
}

function cssMaskImageUrl(href: string): string {
  const escaped = href.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `url("${escaped}")`;
}

function isSvgLogoUrl(url: string): boolean {
  const lower = url.trim().toLowerCase();
  if (lower.startsWith('data:image/svg+xml')) return true;
  if (lower.includes('image/svg+xml')) return true;
  return lower.includes('.svg');
}

function useIsSvgLogo(url: string): boolean {
  const knownSvg = isSvgLogoUrl(url);
  const [blobIsSvg, setBlobIsSvg] = useState(false);

  useEffect(() => {
    if (knownSvg || !url.startsWith('blob:')) {
      setBlobIsSvg(false);
      return;
    }

    let cancelled = false;
    fetch(url)
      .then((response) => response.blob())
      .then(async (blob) => {
        if (cancelled) return;
        if (blob.type.includes('svg')) {
          setBlobIsSvg(true);
          return;
        }
        if (blob.type.startsWith('image/') && !blob.type.includes('svg')) {
          setBlobIsSvg(false);
          return;
        }
        const text = await blob.text();
        if (!cancelled) {
          setBlobIsSvg(/<svg[\s>]/i.test(text.trim()));
        }
      })
      .catch(() => {
        if (!cancelled) setBlobIsSvg(false);
      });

    return () => {
      cancelled = true;
    };
  }, [knownSvg, url]);

  return knownSvg || blobIsSvg;
}

function getLinkHash(href: string): string {
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return '';
  try {
    return decodeURIComponent(href.slice(hashIndex + 1));
  } catch {
    return href.slice(hashIndex + 1);
  }
}

function isSameDocumentHref(href: string): boolean {
  if (!href || href.startsWith('#')) return true;
  try {
    const url = new URL(href, window.location.href);
    return url.pathname === window.location.pathname;
  } catch {
    return false;
  }
}

function scrollToAnchor(hash: string): boolean {
  if (!hash) return false;
  const byId = document.getElementById(hash);
  const bySectionId = document.querySelector(`[data-section-id="${CSS.escape(hash)}"]`);
  const target = byId ?? bySectionId;
  if (!(target instanceof HTMLElement)) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function handleLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  onClose: () => void,
  options: {
    isEditor?: boolean;
    isPreviewMode?: boolean;
    isEditMode?: boolean;
    item?: BurgerLink;
    pages?: BurgerPageRef[];
    onLinkNavigate?: (event: BurgerLinkNavigateEvent) => void;
  } = {},
) {
  const { isEditor, isPreviewMode, item, pages, onLinkNavigate } = options;

  const href = event.currentTarget.getAttribute('href') ?? '';
  const hash = getLinkHash(href);
  const opensInNewTab = event.currentTarget.target === '_blank';

  if (item && onLinkNavigate) {
    event.preventDefault();
    event.stopPropagation();
    const resolved = resolveBurgerLink(item, pages);
    onLinkNavigate({
      mode: item.mode === 'url' ? 'url' : 'page',
      href: resolved.href || href,
      page: item.page,
      url: item.url,
      anchor: (item.anchor ?? '').replace(/^#/, ''),
      target: resolved.target,
    });
    onClose();
    return;
  }

  if (isEditor) {
    event.preventDefault();
    scrollToAnchor(hash);
    onClose();
    return;
  }

  if (!opensInNewTab && hash && isSameDocumentHref(href) && scrollToAnchor(hash)) {
    event.preventDefault();
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

function getLightboxLayoutStyle(container: HTMLElement | null): CSSProperties {
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

function wrapLinkTextWithWidth(
  P: string,
  textContent: ReactNode,
  textWidth: number,
  showOutline: boolean,
  scaled: (value: number) => string,
) {
  return (
    <span
      className={`${P}-link-text-box`}
      style={{ width: scaled(textWidth), maxWidth: '100%' }}
    >
      <span
        className={showOutline ? `${P}-link-text-inner` : `${P}-link-text-inner-hidden`}
        style={{ width: '100%' }}
      >
        {textContent}
      </span>
    </span>
  );
}

export function Burger({
  settings: settingsProp,
  isEditor,
  isEditMode,
  isPreviewMode,
  activeEvent,
  currentState: currentStateProp,
  isSwitchClone = false,
  unavailableStates = [],
  layoutId,
  pages,
  onLinkNavigate,
  onUpdateSettings,
  onOpenChange,
}: BurgerProps) {
  const { prefix: P } = useScopedStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const openAnimationRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const prevLayoutIdForOverlayRef = useRef(layoutId);
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const [isOpenUser, setIsOpen] = useState(false);
  const [isOverlayMounted, setIsOverlayMounted] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  const pinnedState = resolveCurrentState(currentStateProp);
  const unavailableStateSet = useMemo(() => new Set(unavailableStates), [unavailableStates]);
  const isStateUnavailable = (state?: string | null) => Boolean(state && unavailableStateSet.has(state));
  const isOpenPinned = Boolean(isEditor && !isPreviewMode && pinnedState === 'open' && !isStateUnavailable('open'));
  const isOpen = isOpenPinned || (!(isEditor && !isPreviewMode) && isOpenUser);
  const canUseCompact = !isStateUnavailable('compact') && !isStateUnavailable('onScroll');
  const isHoverEnabled = !isEditor || (Boolean(isPreviewMode) && !isEditMode);
  const interactionState = activeEvent && activeEvent !== 'default' ? activeEvent : undefined;
  const navigationState: BurgerNavigationState = canUseCompact && pinnedState === 'compact'
    ? 'compact'
    : 'default';
  const [prevNavigationState, setPrevNavigationState] = useState(navigationState);
  const [isNavStateAnimating, setIsNavStateAnimating] = useState(false);
  const shouldAnimateNavState = !isEditMode;
  if (navigationState !== prevNavigationState) {
    setPrevNavigationState(navigationState);
    if (shouldAnimateNavState) {
      setIsNavStateAnimating(true);
    }
  }
  const settings = migrateLegacyBurgerSettings(settingsProp);

  const {
    logo,
    logoMaxHeight = 120 / 1440,
    logoPosition = 'left',
    panelHeight = 60 / 1440,
    backgroundColor = '#b3b3b3',
    logoColor = '#000000',
    position,
    horizontalAlign: horizontalAlignSetting,
    verticalAlign: verticalAlignSetting,
    iconColor = '#000000',
    showIcon = 'on',
    iconSize = 16 / 1440,
    linkColor = '#000000',
    openLinkColor = '#000000',
    compactIconColor = '#000000',
    compactCloseButtonColor = '#000000',
    compactLinkColor = '#000000',
    compactLogoColor = '#000000',
    compactBackgroundColor = '#ffffff',
    compactLogoMaxHeight = 120 / 1440,
    compactLogoPosition,
    compactPanelHeight = 60 / 1440,
    compactShowIcon = 'on',
    compactIconSize = 16 / 1440,
    compactNavTextWidth,
    compactNavGap,
    compactNavPaddingLeft = 10 / 1440,
    compactNavPaddingRight = 10 / 1440,
    compactFontFamily,
    compactFontSettings,
    compactFontSize,
    compactLineHeight,
    compactLetterSpacing = 0,
    compactWordSpacing = 0,
    compactTextAlign = 'left',
    compactTextAppearance,
    openLogoColor = '#000000',
    menuBackgroundColor = '#ffffff',
    overlayColor = 'rgba(0, 0, 0, 0.45)',
    closeButtonColor = '#000000',
    effect = 'fade',
    textWidth = 280 / 1440,
    navTextWidth,
    gap = 0,
    navGap,
    navPaddingLeft = 10 / 1440,
    navPaddingRight = 10 / 1440,
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
    openFontFamily,
    openFontSettings,
    openFontSize,
    openLineHeight,
    openLetterSpacing,
    openWordSpacing,
    openTextAlign,
    openTextAppearance,
    stateOverrides,
    link: linkItems,
  } = settings;

  const { horizontalAlign, verticalAlign } = resolveBurgerAlignment({
    position,
    horizontalAlign: horizontalAlignSetting,
    verticalAlign: verticalAlignSetting,
  });

  const isCompactNav = navigationState === 'compact';
  const closedLogoMaxHeight = isCompactNav ? compactLogoMaxHeight : logoMaxHeight;
  const closedLogoPosition = resolveLogoPosition(isCompactNav ? compactLogoPosition : logoPosition);
  const closedPanelHeight = isCompactNav ? compactPanelHeight : panelHeight;
  const closedIconSize = isCompactNav ? compactIconSize : iconSize;
  const closedNavTextWidth = isCompactNav ? compactNavTextWidth : navTextWidth;
  const closedNavGap = isCompactNav ? compactNavGap : navGap;
  const closedNavPaddingLeft = isCompactNav ? compactNavPaddingLeft : navPaddingLeft;
  const closedNavPaddingRight = isCompactNav ? compactNavPaddingRight : navPaddingRight;

  const resolvedNavTextWidth = closedNavTextWidth ?? textWidth;
  const showBurgerButton = isOpen || (isCompactNav ? compactShowIcon : showIcon) !== 'off';

  const colorVars = buildColorVars(P, {
    iconColor,
    closeButtonColor,
    linkColor,
    openLinkColor,
    compactIconColor,
    compactCloseButtonColor,
    compactLinkColor,
    compactLogoColor,
    compactBackgroundColor,
    openLogoColor,
    menuBackgroundColor,
    overlayColor,
    backgroundColor,
    logoColor,
  }, COLOR_VAR_MAP, STATE_KEYS, stateOverrides);

  const closedTypeStyle = resolveBurgerTypeStyle(isCompactNav
    ? {
      fontFamily: compactFontFamily,
      fontSettings: compactFontSettings,
      fontSize: compactFontSize,
      lineHeight: compactLineHeight,
      letterSpacing: compactLetterSpacing,
      wordSpacing: compactWordSpacing,
      textAlign: compactTextAlign,
      textAppearance: compactTextAppearance,
    }
    : {
      fontFamily,
      fontSettings,
      fontSize,
      lineHeight,
      letterSpacing,
      wordSpacing,
      textAlign,
      textAppearance,
    });
  const openTypeStyle = resolveBurgerTypeStyle({
    fontFamily: openFontFamily,
    fontSettings: openFontSettings,
    fontSize: openFontSize,
    lineHeight: openLineHeight,
    letterSpacing: openLetterSpacing,
    wordSpacing: openWordSpacing,
    textAlign: openTextAlign,
    textAppearance: openTextAppearance,
  }, closedTypeStyle);
  const closedTextCss = burgerTypeStyleToCss(P, closedTypeStyle, isEditor);
  const openTextCss = burgerTypeStyleToCss(P, openTypeStyle, isEditor);
  const linkTextStyle: CSSProperties = {
    ...openTextCss.css,
    whiteSpace: 'pre-wrap',
  };
  const linkTextClassName = openTextCss.className;
  const scaled = (value: number) => scalingValue(value, isEditor);
  const resolvedNavGap = closedNavGap ?? gap;
  const navPaddingLeftHandleSize = Math.max(closedNavPaddingLeft, PADDING_HANDLE_SIZE);
  const navPaddingRightHandleSize = Math.max(closedNavPaddingRight, PADDING_HANDLE_SIZE);
  const navPaddingLeftMaxFraction = Math.max(0, 1 - closedIconSize);
  const navPaddingRightMaxFraction = Math.max(0, 1 - closedIconSize);
  const showControls = isEditMode ?? false;
  const showClosedMenuControls = showControls && !isOpen;

  const effectiveLayout = useMemo(
    () => getEffectiveBurgerLayout({
      textPaddingLeft,
      textPaddingRight,
      textPaddingTop,
      textPaddingBottom,
      fontSize: openTypeStyle.fontSize,
    }),
    [
      textPaddingLeft,
      textPaddingRight,
      textPaddingTop,
      textPaddingBottom,
      openTypeStyle.fontSize,
    ],
  );

  const renderOpenNavLinkLabel = (label: string) => {
    const textContent = (
      <span className={linkTextClassName} style={linkTextStyle}>
        {renderMultilineText(label)}
      </span>
    );

    return wrapLinkTextWithWidth(
      P,
      textContent,
      textWidth,
      showControls,
      scaled,
    );
  };

  const panelStyle = {
    ...getPanelPaddingStyle(effectiveLayout, isEditor),
    alignItems: HORIZONTAL_ALIGN_MAP[horizontalAlign],
    justifyContent: VERTICAL_ALIGN_MAP[verticalAlign],
  };

  const prevSettingsRef = useRef(settingsProp);
  const prevLayoutIdRef = useRef(layoutId);

  useEffect(() => {
    if (!onUpdateSettings || !isEditor) {
      prevSettingsRef.current = settingsProp;
      prevLayoutIdRef.current = layoutId;
      return;
    }

    if (prevLayoutIdRef.current !== layoutId) {
      prevSettingsRef.current = settingsProp;
      prevLayoutIdRef.current = layoutId;
      const withTextDefaults = applyBurgerOpenTextDefaults(settingsProp);
      if (withTextDefaults !== settingsProp) {
        onUpdateSettings(withTextDefaults);
      }
      return;
    }

    const withTextDefaults = applyBurgerOpenTextDefaults(settingsProp);
    const prevSettings = prevSettingsRef.current;
    const settingsChanged = prevSettings !== settingsProp;
    const updatedSettings = settingsChanged
      ? applyBurgerSettingsChange(withTextDefaults, prevSettings)
      : withTextDefaults;
    prevSettingsRef.current = settingsProp;

    const hasTextDefaults = withTextDefaults !== settingsProp;
    const hasPadding = settingsChanged && hasBurgerPaddingChanges(withTextDefaults, updatedSettings);
    if (!hasTextDefaults && !hasPadding) {
      return;
    }

    onUpdateSettings(updatedSettings);
  }, [settingsProp, onUpdateSettings, isEditor, layoutId]);

  const resolvedIconSize = scalingValue(closedIconSize, isEditor);
  const iconRootStyle: CSSProperties = {
    width: resolvedIconSize,
    height: resolvedIconSize,
    minWidth: resolvedIconSize,
    minHeight: resolvedIconSize,
    maxWidth: resolvedIconSize,
    maxHeight: resolvedIconSize,
  };
  const navLinkTextStyle: CSSProperties = {
    ...closedTextCss.css,
    textDecoration: 'none',
  };
  const navLinkTextClassName = closedTextCss.className;
  const showLogo = logo?.mode !== 'Off';
  const logoSrc = logo?.icon ?? '';
  const isSvgLogo = useIsSvgLogo(logoSrc);
  const logoHeight = scaled(Math.min(closedLogoMaxHeight, closedPanelHeight));
  const isLogoOnRight = Boolean(showLogo && logoSrc && closedLogoPosition === 'right');
  const toggleSide = isLogoOnRight ? 'left' : 'right';

  const items = Array.isArray(linkItems) ? linkItems : [];
  const stateClass = [
    navigationState !== 'default' ? `${P}-state-${navigationState}` : '',
    pinnedState === 'open' ? `${P}-state-open` : '',
    interactionState && interactionState !== navigationState && interactionState !== pinnedState
      ? `${P}-state-${interactionState}`
      : '',
  ].filter(Boolean).join(' ');
  const editorClass = isEditor && !isPreviewMode ? `${P}-editor` : '';
  const interactiveClass = isHoverEnabled ? `${P}-interactive` : '';
  const navStateAnimClass = shouldAnimateNavState && (navigationState !== prevNavigationState || isNavStateAnimating)
    ? `${P}-nav-state-anim`
    : '';
  const openClass = isOpen ? `${P}-open` : '';

  const lightboxLayoutStyle = useMemo(
    () => getLightboxLayoutStyle(containerRef.current),
    [isOverlayMounted, isOpen, layoutId],
  );

  const closeMenu = () => {
    setIsOpen(false);
  };

  const onNavLinkClick = (event: MouseEvent<HTMLAnchorElement>, item?: BurgerLink) => {
    handleLinkClick(event, closeMenu, {
      isEditor,
      isPreviewMode,
      isEditMode,
      item,
      pages,
      onLinkNavigate,
    });
  };

  const handleToggle = () => {
    if (isEditor && !isPreviewMode) return;
    setIsOpen((open) => !open);
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isNavStateAnimating) return;
    const timer = window.setTimeout(() => {
      setIsNavStateAnimating(false);
    }, NAV_STATE_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [isNavStateAnimating, navigationState]);

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
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isEditor && isPreviewMode) return;
      closeMenu();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditor, isPreviewMode]);

  useEffect(() => {
    if (isEditor && !isPreviewMode && pinnedState !== 'open') {
      setIsOpen(false);
    }
  }, [isEditor, isPreviewMode, pinnedState]);

  useEffect(() => {
    if (isPreviewMode) {
      setIsOpen(false);
    }
  }, [isPreviewMode]);

  const showOpenNavControls = showControls && isOpen;

  const renderOpenNavItems = (linkClassName: string) => items.map((item, index) => {
    const { label, href, target } = resolveBurgerLink(item, pages);
    const linkNode = href ? (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`${linkClassName} ${P}-has-href`}
        onClick={(event) => onNavLinkClick(event, item)}
      >
        {renderOpenNavLinkLabel(label)}
      </a>
    ) : (
      <span className={linkClassName}>
        {renderOpenNavLinkLabel(label)}
      </span>
    );

    return (
      <Fragment key={index}>
        {index > 0 && (
          <div
            data-controls={showOpenNavControls ? 'gap' : undefined}
            data-controls-axis="y"
            className={showOpenNavControls ? `${P}-gap-control` : undefined}
            style={{ height: scaled(gap) }}
          />
        )}
        {linkNode}
      </Fragment>
    );
  });

  const overlay = isOverlayMounted ? (
    <div
      ref={overlayRef}
      data-selection="none"
      className={[
        `${P}-lightbox`,
        `${P}-full-lightbox ${P}-effect-${effect}`,
        isOverlayActive ? `${P}-lightbox-active` : '',
        `${P}-lightbox-editor`,
        isEditMode ? `${P}-lightbox-edit-mode` : '',
        interactiveClass,
        stateClass,
      ].filter(Boolean).join(' ')}
      style={{ ...colorVars, ...lightboxLayoutStyle }}
      aria-hidden={!isOverlayActive}
    >
      <button
        type="button"
        className={`${P}-backdrop`}
        onClick={closeMenu}
        aria-label="Close menu"
      />
      <nav className={`${P}-panel`} style={panelStyle} aria-label="Menu">
        {showControls && renderTextPaddingControls(P, effectiveLayout, openTypeStyle.fontSize, scaled)}
        {renderOpenNavItems(`${P}-link`)}
      </nav>
    </div>
  ) : null;

  const renderBurgerToggle = () => (
    <button
      type="button"
      className={`${P}-toggle`}
      onClick={handleToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <BurgerIcon className={`${P}-icon`} lineClassName={`${P}-icon-line`} />
    </button>
  );

  const renderNavEdgePadding = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    const width = isLeft ? closedNavPaddingLeft : closedNavPaddingRight;
    const handleSize = isLeft ? navPaddingLeftHandleSize : navPaddingRightHandleSize;
    const maxFraction = isLeft ? navPaddingLeftMaxFraction : navPaddingRightMaxFraction;
    const control = isCompactNav
      ? (isLeft ? 'compactNavPaddingLeft' : 'compactNavPaddingRight')
      : (isLeft ? 'navPaddingLeft' : 'navPaddingRight');

    return (
      <div
        className={isLeft ? `${P}-nav-padding-left` : `${P}-nav-padding-right`}
        style={{ width: scaled(width), flexShrink: 0 }}
      >
        {showClosedMenuControls ? (
          <div
            data-controls={control}
            data-controls-axis="x"
            data-controls-variant="column-padding"
            {...(isLeft ? {} : { 'data-controls-reverse': '' })}
            data-controls-min="0"
            data-controls-max-fraction={String(maxFraction)}
            className={`${P}-control-anchor`}
            style={{
              top: 0,
              [isLeft ? 'left' : 'right']: 0,
              width: scaled(handleSize),
              height: '100%',
            }}
          />
        ) : null}
      </div>
    );
  };

  const renderNavLink = (item: BurgerLink, index: number) => {
    const { label, href, target } = resolveBurgerLink(item, pages);
    const textContent = (
      <span className={navLinkTextClassName} style={navLinkTextStyle}>
        {renderMultilineText(label)}
      </span>
    );
    const labelNode = wrapLinkTextWithWidth(
      P,
      textContent,
      resolvedNavTextWidth,
      showClosedMenuControls,
      scaled,
    );

    const linkNode = href ? (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`${P}-nav-link ${P}-has-href`}
        onClick={(event) => onNavLinkClick(event, item)}
      >
        {labelNode}
      </a>
    ) : (
      <span className={`${P}-nav-link`}>
        {labelNode}
      </span>
    );

    return (
      <Fragment key={index}>
        {index > 0 && (
          <div
            data-controls={showClosedMenuControls ? (isCompactNav ? 'compactNavGap' : 'navGap') : undefined}
            data-controls-axis="x"
            className={showClosedMenuControls ? `${P}-gap-control ${P}-nav-gap-control` : `${P}-nav-gap-control}`}
            style={{ width: scaled(resolvedNavGap), flexShrink: 0 }}
          />
        )}
        {linkNode}
      </Fragment>
    );
  };

  const navBarStyle: CSSProperties = {
    ...colorVars,
    height: scalingValue(closedPanelHeight, isEditor),
    minHeight: scalingValue(closedPanelHeight, isEditor),
    [`--${P}-panel-height`]: scalingValue(closedPanelHeight, isEditor),
  };
  const switchCloneEnterOffset = isSwitchClone
    && navigationState === 'default'
    && pinnedState !== 'open'
    && !isPreviewMode
    ? scaled(panelHeight + NAV_SWITCH_ENTER_EXTRA)
    : '0px';

  return (
    <div
      ref={containerRef}
      className={`${P}-root ${stateClass} ${editorClass} ${interactiveClass} ${navStateAnimClass}`.trim()}
      style={{
        width: '100%',
        height: '100%',
        lineHeight: 0,
        fontSize: 0,
        marginTop: switchCloneEnterOffset,
        ...colorVars,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div className={`${P}-nav-bar`} style={navBarStyle}>
        {showLogo && logoSrc ? (
          <div className={`${P}-nav-logo ${P}-nav-logo-${closedLogoPosition}`}>
            {closedLogoPosition === 'left' ? renderNavEdgePadding('left') : null}
            <div
              className={`${P}-nav-logo-inner${isSvgLogo ? ` ${P}-nav-logo-tinted` : ''}`}
              style={{
                height: logoHeight,
                ...(isSvgLogo ? { [`--${P}-logo-image`]: cssMaskImageUrl(logoSrc) } : {}),
              } as CSSProperties}
            >
              <img
                src={logoSrc}
                alt=""
                className={`${P}-nav-logo-img`}
              />
              {isSvgLogo ? <span className={`${P}-nav-logo-tint`} aria-hidden="true" /> : null}
            </div>
            {closedLogoPosition === 'right' ? renderNavEdgePadding('right') : null}
          </div>
        ) : null}
        <nav
          className={`${P}-nav-links`}
          aria-label="Navigation"
        >
          <div className={`${P}-nav-links-inner`}>
            {items.filter((item) => isVisibleInClosedNav(item, navigationState)).map((item, index) => renderNavLink(item, index))}
          </div>
        </nav>
      </div>
      {overlay}
      <div className={`${P}-nav-toggle-wrap ${P}-nav-toggle-wrap-${toggleSide}`}>
        {toggleSide === 'left' ? renderNavEdgePadding('left') : null}
        {showBurgerButton ? (
          <div
            className={`${P}-root ${openClass}`.trim()}
            style={iconRootStyle}
          >
            {renderBurgerToggle()}
          </div>
        ) : null}
        {toggleSide === 'right' ? renderNavEdgePadding('right') : null}
      </div>
    </div>
  );
}
