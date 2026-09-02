import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils';
import { omitTextColors, textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

const MENU_ANIM_MS = 300;
const PADDING_HANDLE_SIZE = 0.004;
const TEXT_WIDTH_HANDLE_SIZE = 0.004;
const MIN_TEXT_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_TEXT_WIDTH = MIN_TEXT_WIDTH_PX / ARTICLE_DESIGN_WIDTH;

type BurgerDirection = 'left' | 'top' | 'right' | 'bottom';
type BurgerEffect = 'fade' | 'left' | 'top' | 'right' | 'bottom';
type BurgerType = 'a' | 'b' | 'c';

type BurgerLogo = {
  mode?: 'On' | 'Off';
  icon?: string | null;
};

type BurgerLink = {
  mode?: 'page' | 'url';
  page?: string;
  url?: string;
  label?: string;
  anchor?: string;
  openIn?: string;
  showIn?: string;
};

type BurgerTextOrientation = 'vertical' | 'horizontal';
type BurgerPosition =
  | 'left-top'
  | 'center-top'
  | 'right-top'
  | 'left-center'
  | 'center-center'
  | 'right-center'
  | 'left-bottom'
  | 'center-bottom'
  | 'right-bottom';

type BurgerSettings = {
  type?: BurgerType;
  link?: BurgerLink[];
  socialLink?: string[];
  logo?: BurgerLogo | null;
  logoMaxWidth?: number;
  panelHeight?: number;
  panelColor?: string;
  position?: BurgerPosition;
  horizontalAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  textOrientation?: BurgerTextOrientation;
  iconColor?: string;
  iconSize?: number;
  iconAnimation?: 'a';
  linkColor?: string;
  socialIconColor?: string;
  menuBackgroundColor?: string;
  overlayColor?: string;
  closeButtonColor?: string;
  effect?: BurgerEffect;
  menuWidth?: number;
  textWidth?: number;
  navTextWidth?: number;
  gap?: number;
  navGap?: number;
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
  stateOverrides?: Record<string, Partial<Record<'iconColor' | 'closeButtonColor' | 'linkColor' | 'socialIconColor' | 'menuBackgroundColor' | 'overlayColor' | 'panelColor', string>>>;
};

function isOpenOnlyLink(item: BurgerLink): boolean {
  const showIn = (item.showIn ?? 'always').trim().toLowerCase();
  return showIn === 'open only' || showIn === 'open-only' || showIn === 'openonly';
}

function resolveBurgerLink(item: BurgerLink): {
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

  const page = item.page ?? '';
  const anchor = (item.anchor ?? '').replace(/^#/, '');
  const href = anchor ? (page ? `${page}#${anchor}` : `#${anchor}`) : page;
  return { label, href, target };
}

const GLOBE_ICON_PATH = 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.93 6h-3.11a15.7 15.7 0 00-1.18-3.22A8.03 8.03 0 0118.93 8zM12 4.06c.84 1.11 1.5 2.46 1.91 3.94h-3.82C10.5 6.52 11.16 5.17 12 4.06zM4.07 14a8.03 8.03 0 010-4h3.11a17.4 17.4 0 00-.13 2c0 .68.04 1.35.13 2H4.07zm1.11 2h3.11c.3 1.15.7 2.23 1.18 3.22A8.03 8.03 0 015.18 16zM8.18 8H5.07A8.03 8.03 0 018.29 4.78 15.7 15.7 0 008.18 8zM12 19.94c-.84-1.11-1.5-2.46-1.91-3.94h3.82c-.41 1.48-1.07 2.83-1.91 3.94zM15.71 16h3.11a8.03 8.03 0 01-3.22 3.22c.48-.99.88-2.07 1.18-3.22zm.16-2H8.13A15.5 15.5 0 018 12c0-.68.04-1.35.13-2h7.74c.09.65.13 1.32.13 2s-.04 1.35-.13 2zm.95-6c.3-1.15.7-2.23 1.18-3.22A8.03 8.03 0 0118.93 8h-3.11z';

function parseSocialLinkHost(url: string): { origin: string; hostname: string; label: string } | null {
  try {
    const href = /^[a-z][a-z\d+\-.]*:/i.test(url) ? url : `https://${url}`;
    const parsed = new URL(href);
    if (!parsed.hostname || parsed.protocol === 'mailto:') {
      return null;
    }
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
    return {
      origin: parsed.origin,
      hostname,
      label: hostname,
    };
  } catch {
    return null;
  }
}

function FallbackSocialIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d={GLOBE_ICON_PATH} />
    </svg>
  );
}

function getSiteFaviconSources(origin: string, hostname: string): string[] {
  return [
    new URL('/favicon.ico', `${origin}/`).href,
    `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
  ];
}

function SiteFavicon({
  origin,
  hostname,
  imageClassName,
  fallbackClassName,
}: {
  origin: string;
  hostname: string;
  imageClassName: string;
  fallbackClassName: string;
}) {
  const sources = useMemo(() => getSiteFaviconSources(origin, hostname), [origin, hostname]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [origin, hostname]);

  if (sourceIndex >= sources.length) {
    return <FallbackSocialIcon className={fallbackClassName} />;
  }

  return (
    <img
      className={imageClassName}
      src={sources[sourceIndex]}
      alt=""
      onError={() => setSourceIndex((index) => index + 1)}
    />
  );
}

function normalizeSocialLinks(value: unknown): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === 'string' && value.trim()) {
      return [value.trim()];
    }
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }
      if (item && typeof item === 'object' && 'url' in item) {
        const url = (item as { url?: unknown }).url;
        return typeof url === 'string' ? url.trim() : '';
      }
      return '';
    })
    .filter(Boolean);
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
    type: BurgerType;
    menuWidth: number;
    textPaddingLeft: number;
    textPaddingRight: number;
    textPaddingTop: number;
    textPaddingBottom: number;
    fontSize?: number;
  },
): EffectiveBurgerLayout {
  const panelSize = options.type === 'a' ? 1 : options.menuWidth;
  const isVerticalPanel = options.type === 'b';
  const verticalPanelHeight = 1;
  const horizontalPanelWidth = 1;
  const minContentHeight = Math.max(MIN_TEXT_WIDTH, options.fontSize ?? MIN_TEXT_WIDTH);

  if (isVerticalPanel) {
    const { start: effectivePaddingLeft, end: effectivePaddingRight } = scalePaddingsToFit(
      options.textPaddingLeft,
      options.textPaddingRight,
      panelSize,
      MIN_TEXT_WIDTH,
    );
    const { start: effectivePaddingTop, end: effectivePaddingBottom } = scalePaddingsToFit(
      options.textPaddingTop,
      options.textPaddingBottom,
      verticalPanelHeight,
      minContentHeight,
    );

    return {
      effectivePaddingLeft,
      effectivePaddingRight,
      effectivePaddingTop,
      effectivePaddingBottom,
      panelSize,
    };
  }

  const { start: effectivePaddingTop, end: effectivePaddingBottom } = scalePaddingsToFit(
    options.textPaddingTop,
    options.textPaddingBottom,
    panelSize,
    minContentHeight,
  );
  const { start: effectivePaddingLeft, end: effectivePaddingRight } = scalePaddingsToFit(
    options.textPaddingLeft,
    options.textPaddingRight,
    horizontalPanelWidth,
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

function getLightboxDirection(type: BurgerType): BurgerDirection {
  if (type === 'c') return 'top';
  if (type === 'b') return 'right';
  return 'left';
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
  const layout = getEffectiveBurgerLayout({
    type,
    menuWidth: nextSettings.menuWidth ?? prevSettings.menuWidth ?? 320 / 1440,
    textPaddingLeft: nextSettings.textPaddingLeft ?? 0,
    textPaddingRight: nextSettings.textPaddingRight ?? 0,
    textPaddingTop: nextSettings.textPaddingTop ?? 0,
    textPaddingBottom: nextSettings.textPaddingBottom ?? 0,
    fontSize: nextSettings.fontSize ?? prevSettings.fontSize,
  });

  const nextPanelSize = getBurgerPanelSize(nextSettings);
  const prevPanelSize = getBurgerPanelSize(prevSettings);
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

  if (Object.keys(updates).length === 0 && nextPanelSize >= prevPanelSize) {
    return nextSettings;
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
  type: BurgerType,
  layout: EffectiveBurgerLayout,
  fontSize: number | undefined,
  scaled: (value: number) => string,
) {
  const isVerticalPanel = type === 'b';
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

type ColorKeys = 'iconColor' | 'closeButtonColor' | 'linkColor' | 'socialIconColor' | 'menuBackgroundColor' | 'overlayColor' | 'panelColor';

type TypeCNavPhase = 'closed' | 'open';

type BurgerProps = {
  settings: BurgerSettings;
  content?: unknown;
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
  socialIconColor: 'social-icon-color',
  menuBackgroundColor: 'menu-background-color',
  overlayColor: 'overlay-color',
  panelColor: 'panel-color',
};

const STATE_KEYS = ['hover', 'onScroll'] as const;

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
.${P}-type-c.${P}-open {
  overflow: visible;
  z-index: 2;
}
.${P}-type-c-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;
  border: none;
  padding: 0;
  margin: 0;
  background-color: var(--${P}-overlay-color);
  opacity: 0;
  cursor: pointer;
  pointer-events: none;
  transition: opacity ${MENU_ANIM_MS}ms ease, background-color ${MENU_ANIM_MS}ms ease;
}
.${P}-type-c-backdrop-editor {
  inset: auto;
  top: var(--cntrl-article-top, 0);
  left: var(--cntrl-article-left, 0);
  width: var(--cntrl-article-width, 100vw) !important;
  height: var(--cntrl-viewport-height, 100vh) !important;
}
.${P}-type-c.${P}-open .${P}-type-c-backdrop {
  opacity: 1;
  pointer-events: auto;
}
.${P}-type-c .${P}-nav-bar {
  position: relative;
  z-index: 2;
  overflow: hidden;
  transition: height ${MENU_ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), min-height ${MENU_ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), background-color ${MENU_ANIM_MS}ms ease;
}
.${P}-type-c.${P}-open .${P}-nav-bar {
  height: var(--${P}-menu-width) !important;
  min-height: var(--${P}-menu-width) !important;
  background-color: var(--${P}-menu-background-color);
}
.${P}-type-c .${P}-nav-logo {
  height: var(--${P}-panel-height);
}
.${P}-type-c .${P}-nav-toggle-wrap {
  height: var(--${P}-panel-height);
}
.${P}-type-c .${P}-nav-links {
  overflow: hidden;
}
.${P}-nav-links-inner {
  display: contents;
}
.${P}-type-c .${P}-nav-links-inner {
  display: flex;
  position: relative;
  box-sizing: border-box;
  width: 100%;
}
.${P}-type-c .${P}-nav-links-inner-closed {
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: var(--${P}-panel-height);
}
.${P}-type-c .${P}-nav-links-inner-open {
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: flex-start;
  justify-content: flex-start;
  height: 100%;
  min-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  pointer-events: auto;
  will-change: transform, opacity;
  animation: ${P}-type-c-nav-enter ${MENU_ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes ${P}-type-c-nav-enter {
  from {
    opacity: 0;
    transform: translate3d(0, calc(-1 * var(--${P}-panel-height)), 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
.${P}-type-c .${P}-nav-links-inner-open .${P}-nav-link {
  display: block;
  width: fit-content;
  max-width: 100%;
  flex-shrink: 0;
}
.${P}-type-c .${P}-nav-links-inner-open .${P}-social-links {
  pointer-events: none;
}
.${P}-type-c .${P}-nav-links-inner-open .${P}-nav-gap-control {
  width: auto;
  height: auto;
  align-self: stretch;
  flex-shrink: 0;
}
.${P}-type-c .${P}-nav-links-inner-open .${P}-nav-gap-control::before {
  width: 100%;
  height: 100%;
  min-width: 20px;
  min-height: 20px;
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
  border-radius: 999px;
  background-color: currentColor;
  transition: transform ${MENU_ANIM_MS}ms ease, opacity ${MENU_ANIM_MS}ms ease, top ${MENU_ANIM_MS}ms ease;
}
.${P}-icon-line:nth-child(1) {
  top: calc((100% - (3 * var(--${P}-icon-line-height, 2px) + 2 * var(--${P}-icon-line-gap, 2px))) / 2);
}
.${P}-icon-line:nth-child(2) {
  top: calc(
    ((100% - (3 * var(--${P}-icon-line-height, 2px) + 2 * var(--${P}-icon-line-gap, 2px))) / 2)
    + var(--${P}-icon-line-height, 2px)
    + var(--${P}-icon-line-gap, 2px)
  );
}
.${P}-icon-line:nth-child(3) {
  top: calc(
    ((100% - (3 * var(--${P}-icon-line-height, 2px) + 2 * var(--${P}-icon-line-gap, 2px))) / 2)
    + 2 * (var(--${P}-icon-line-height, 2px) + var(--${P}-icon-line-gap, 2px))
  );
}
.${P}-root.${P}-open .${P}-icon-line:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}
.${P}-root.${P}-open .${P}-icon-line:nth-child(2) {
  opacity: 0;
}
.${P}-root.${P}-open .${P}-icon-line:nth-child(3) {
  top: 50%;
  transform: translateY(-50%) rotate(-45deg);
}
.${P}-root.${P}-open .${P}-toggle {
  color: var(--${P}-close-button-color);
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
.${P}-full-lightbox .${P}-social-link,
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
.${P}-direction-left .${P}-link,
.${P}-direction-right .${P}-link {
  width: fit-content;
  max-width: 100%;
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
.${P}-interactive .${P}-link:hover,
.${P}-interactive .${P}-link:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-link {
  color: var(--${P}-hover-link-color, var(--${P}-link-color));
  outline: none;
}
.${P}-interactive .${P}-link:hover .${P}-link-text,
.${P}-interactive .${P}-link:focus-visible .${P}-link-text,
.${P}-lightbox.${P}-state-hover .${P}-link-text {
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
  background-color: var(--${P}-panel-color);
  padding-left: var(--${P}-nav-padding-x, 0);
  padding-right: var(--${P}-nav-padding-x, 0);
  gap: var(--${P}-nav-inner-gap, 0);
  transition: background-color ${MENU_ANIM_MS}ms ease;
}
.${P}-nav-logo {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 100%;
  min-width: 0;
  pointer-events: auto;
}
.${P}-nav-logo-inner {
  position: relative;
  flex-shrink: 0;
}
.${P}-nav-logo-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
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
.${P}-nav-links .${P}-social-link,
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
  transition: color 200ms ease;
}
.${P}-interactive .${P}-nav-link:hover,
.${P}-interactive .${P}-nav-link:focus-visible,
.${P}-root.${P}-state-hover .${P}-nav-link {
  color: var(--${P}-hover-link-color, var(--${P}-link-color));
  outline: none;
}
.${P}-social-links {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 2;
  pointer-events: none;
}
.${P}-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  pointer-events: auto;
  color: var(--${P}-social-icon-color);
  text-decoration: none;
  transition: color 200ms ease, opacity 200ms ease;
}
.${P}-social-icon,
.${P}-social-favicon {
  display: block;
  width: 100%;
  height: 100%;
}
.${P}-social-icon {
  fill: currentColor;
}
.${P}-social-favicon {
  object-fit: contain;
}
.${P}-interactive .${P}-social-link:hover,
.${P}-interactive .${P}-social-link:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-social-link,
.${P}-root.${P}-state-hover .${P}-social-link {
  color: var(--${P}-hover-social-icon-color, var(--${P}-social-icon-color));
  outline: none;
}
.${P}-interactive .${P}-social-link:hover .${P}-social-favicon,
.${P}-interactive .${P}-social-link:focus-visible .${P}-social-favicon,
.${P}-lightbox.${P}-state-hover .${P}-social-favicon,
.${P}-root.${P}-state-hover .${P}-social-favicon {
  opacity: 0.7;
}
.${P}-root.${P}-state-onScroll .${P}-nav-bar {
  background-color: var(--${P}-onScroll-panel-color, var(--${P}-panel-color));
}
.${P}-root.${P}-type-c.${P}-open.${P}-state-onScroll .${P}-nav-bar {
  background-color: var(--${P}-onScroll-menu-background-color, var(--${P}-menu-background-color));
}
.${P}-root.${P}-state-onScroll .${P}-toggle {
  color: var(--${P}-onScroll-icon-color, var(--${P}-icon-color));
}
.${P}-root.${P}-state-onScroll .${P}-open .${P}-toggle {
  color: var(--${P}-onScroll-close-button-color, var(--${P}-close-button-color));
}
.${P}-root.${P}-state-onScroll .${P}-nav-link,
.${P}-lightbox.${P}-state-onScroll .${P}-link {
  color: var(--${P}-onScroll-link-color, var(--${P}-link-color));
}
.${P}-root.${P}-state-onScroll .${P}-social-link,
.${P}-lightbox.${P}-state-onScroll .${P}-social-link {
  color: var(--${P}-onScroll-social-icon-color, var(--${P}-social-icon-color));
}
.${P}-lightbox.${P}-state-onScroll .${P}-panel {
  background-color: var(--${P}-onScroll-menu-background-color, var(--${P}-menu-background-color));
}
.${P}-lightbox.${P}-state-onScroll .${P}-backdrop,
.${P}-root.${P}-state-onScroll .${P}-type-c-backdrop {
  background-color: var(--${P}-onScroll-overlay-color, var(--${P}-overlay-color));
}
.${P}-interactive .${P}-link:hover,
.${P}-interactive .${P}-link:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-link,
.${P}-interactive .${P}-nav-link:hover,
.${P}-interactive .${P}-nav-link:focus-visible,
.${P}-root.${P}-state-hover .${P}-nav-link {
  color: var(--${P}-hover-link-color, var(--${P}-link-color));
}
.${P}-interactive .${P}-social-link:hover,
.${P}-interactive .${P}-social-link:focus-visible,
.${P}-lightbox.${P}-state-hover .${P}-social-link,
.${P}-root.${P}-state-hover .${P}-social-link {
  color: var(--${P}-hover-social-icon-color, var(--${P}-social-icon-color));
}
.${P}-nav-toggle-wrap {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  z-index: 3;
  pointer-events: auto;
}
.${P}-nav-padding-right {
  position: relative;
  flex-shrink: 0;
  height: 100%;
}
.${P}-nav-toggle-wrap .${P}-root {
  line-height: 0;
  font-size: 0;
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
  options?: {
    showTextWidthControl?: boolean;
    textWidthMaxFraction?: number;
    controlsKey?: string;
  },
) {
  const textWidthHandleSize = Math.max(TEXT_WIDTH_HANDLE_SIZE, PADDING_HANDLE_SIZE);
  const controlsKey = options?.controlsKey ?? 'textWidth';

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
      {options?.showTextWidthControl ? (
        <div
          data-controls={controlsKey}
          data-controls-axis="x"
          data-controls-variant="column-width"
          data-controls-max-fraction={String(options.textWidthMaxFraction ?? 1)}
          className={`${P}-link-text-width-control`}
          style={{
            position: 'absolute',
            top: 0,
            right: scaled(-textWidthHandleSize / 2),
            width: scaled(textWidthHandleSize),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      ) : null}
    </span>
  );
}

export function Burger({
  settings,
  isEditor,
  isEditMode,
  isPreviewMode,
  activeEvent,
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
  const [typeCNavPhase, setTypeCNavPhase] = useState<TypeCNavPhase>('closed');
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    type = 'b',
    logo,
    logoMaxWidth = 120 / 1440,
    panelHeight = 60 / 1440,
    panelColor = '#b3b3b3',
    position,
    horizontalAlign: horizontalAlignSetting,
    verticalAlign: verticalAlignSetting,
    textOrientation = 'vertical',
    iconColor = '#000000',
    iconSize = 16 / 1440,
    iconAnimation = 'a',
    linkColor = '#000000',
    socialIconColor = '#000000',
    menuBackgroundColor = '#ffffff',
    overlayColor = 'rgba(0, 0, 0, 0.45)',
    closeButtonColor = '#000000',
    effect = 'fade',
    menuWidth = 320 / 1440,
    textWidth = 280 / 1440,
    navTextWidth,
    gap = 0,
    navGap,
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
    stateOverrides,
    link: linkItems,
    socialLink: socialLinkItems,
  } = settings;

  const { horizontalAlign, verticalAlign } = resolveBurgerAlignment({
    position,
    horizontalAlign: horizontalAlignSetting,
    verticalAlign: verticalAlignSetting,
  });

  const resolvedNavTextWidth = navTextWidth ?? textWidth;

  const colorVars = buildColorVars(P, {
    iconColor,
    closeButtonColor,
    linkColor,
    socialIconColor,
    menuBackgroundColor,
    overlayColor,
    panelColor,
  }, COLOR_VAR_MAP, STATE_KEYS, stateOverrides);

  const isFullLightbox = type === 'a';
  const isVerticalPanel = type === 'b';
  const isHorizontalPanel = type === 'c';

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
  const isHorizontalText = isHorizontalPanel && textOrientation === 'horizontal';
  const linkTextStyle: CSSProperties = {
    ...linkTypographyCss,
    ...getTextLeadingVars(fontSize, lineHeight, P, isEditor),
    whiteSpace: 'pre-wrap',
  };
  const scaled = (value: number) => scalingValue(value, isEditor);
  const resolvedNavGap = navGap ?? gap;
  const navPaddingRightHandleSize = Math.max(navPaddingRight, PADDING_HANDLE_SIZE);
  const navPaddingRightMaxFraction = Math.max(0, 1 - iconSize);
  const showControls = isEditMode ?? false;
  const showClosedMenuControls = showControls && !isOpen;
  const usesOverlayLightbox = !isHorizontalPanel;

  const lightboxDirection = getLightboxDirection(type);

  const effectiveLayout = useMemo(
    () => getEffectiveBurgerLayout({
      type,
      menuWidth,
      textPaddingLeft,
      textPaddingRight,
      textPaddingTop,
      textPaddingBottom,
      fontSize,
    }),
    [
      type,
      menuWidth,
      textPaddingLeft,
      textPaddingRight,
      textPaddingTop,
      textPaddingBottom,
      fontSize,
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
      {
        showTextWidthControl: showControls,
        textWidthMaxFraction: isVerticalPanel ? menuWidth : 1,
        controlsKey: 'textWidth',
      },
    );
  };

  const useLayoutBoundLightbox = isEditor || isFullLightbox;

  const panelStyle = isFullLightbox
    ? {
      ...getPanelPaddingStyle(effectiveLayout, isEditor),
      alignItems: HORIZONTAL_ALIGN_MAP[horizontalAlign],
      justifyContent: VERTICAL_ALIGN_MAP[verticalAlign],
    }
    : {
      ...getPanelPaddingStyle(effectiveLayout, isEditor),
      [`--${P}-menu-width`]: scaled(menuWidth),
      ...(isHorizontalText
        ? {
          flexDirection: 'row' as const,
          justifyContent: HORIZONTAL_ALIGN_MAP[horizontalAlign],
          alignItems: 'center' as const,
        }
        : {
          alignItems: HORIZONTAL_ALIGN_MAP[horizontalAlign],
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
  const iconLineHeight = scalingValue(iconSize * 0.125, isEditor);
  const iconLineGap = scalingValue(iconSize * 0.125, isEditor);
  const iconRootStyle: CSSProperties = {
    width: resolvedIconSize,
    height: resolvedIconSize,
    minWidth: resolvedIconSize,
    minHeight: resolvedIconSize,
    maxWidth: resolvedIconSize,
    maxHeight: resolvedIconSize,
    [`--${P}-icon-line-height`]: iconLineHeight,
    [`--${P}-icon-line-gap`]: iconLineGap,
  };
  const navLinkTextStyle: CSSProperties = {
    ...linkTypographyCss,
    ...getTextLeadingVars(fontSize, lineHeight, P, isEditor),
    textDecoration: 'none',
  };
  const showLogo = logo?.mode !== 'Off';
  const logoSrc = logo?.icon ?? '';
  const logoHeight = scalingValue(panelHeight * 0.75, isEditor);
  const logoWidth = scaled(logoMaxWidth);

  const items = Array.isArray(linkItems) ? linkItems : [];
  const socialItems = normalizeSocialLinks(socialLinkItems);
  const previewState = activeEvent && activeEvent !== 'default' ? activeEvent : undefined;
  const liveScrollState = (!isEditor || isPreviewMode) && !previewState && isScrolled ? 'onScroll' : undefined;
  const resolvedState = previewState ?? liveScrollState;
  const stateClass = resolvedState ? `${P}-state-${resolvedState}` : '';
  const editorClass = isEditor && !isPreviewMode ? `${P}-editor` : '';
  const interactiveClass = !isEditor || isPreviewMode ? `${P}-interactive` : '';
  const openClass = isOpen ? `${P}-open` : '';

  const lightboxLayoutStyle = useMemo(
    () => getLightboxLayoutStyle(containerRef.current),
    [isOverlayMounted, isOpen, layoutId, isHorizontalPanel],
  );

  const closeMenu = () => {
    setIsOpen(false);
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
    if (!isHorizontalPanel) return;
    setTypeCNavPhase(isOpen ? 'open' : 'closed');
  }, [isOpen, isHorizontalPanel]);

  useEffect(() => {
    if (!usesOverlayLightbox) return;

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
  }, [isOpen, usesOverlayLightbox]);

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
    setTypeCNavPhase('closed');
  }, [layoutId]);

  useLayoutEffect(() => {
    if (!usesOverlayLightbox || !isOverlayMounted || !isOpen) {
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
  }, [isOverlayMounted, isOpen, usesOverlayLightbox]);

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
    setTypeCNavPhase('closed');
  }, [isEditor, isEditMode, isPreviewMode]);

  useEffect(() => {
    if (isEditor && !isPreviewMode) {
      setIsScrolled(false);
      return;
    }

    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 0);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, [isEditor, isPreviewMode]);

  const showOpenNavControls = showControls && (
    usesOverlayLightbox ? isOpen : (isHorizontalPanel && typeCNavPhase === 'open')
  );

  const renderOpenNavItems = (
    linkClassName: string,
    gapAxis: 'x' | 'y',
    options?: { useContainerGap?: boolean },
  ) => items.map((item, index) => {
    const { label, href, target } = resolveBurgerLink(item);
    const linkNode = href ? (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={linkClassName}
        onClick={(event) => handleLinkClick(event, closeMenu, isEditor, isPreviewMode)}
      >
        {renderOpenNavLinkLabel(label)}
      </a>
    ) : (
      <span className={linkClassName}>
        {renderOpenNavLinkLabel(label)}
      </span>
    );

    const isHorizontalGap = gapAxis === 'x';
    const showGapSpacer = index > 0 && !options?.useContainerGap;

    return (
      <Fragment key={index}>
        {showGapSpacer && (
          <div
            data-controls={showOpenNavControls ? 'gap' : undefined}
            data-controls-axis={gapAxis}
            className={showOpenNavControls
              ? `${P}-gap-control${isHorizontalGap && isHorizontalPanel ? ` ${P}-nav-gap-control` : ''}`.trim()
              : (isHorizontalGap && isHorizontalPanel ? `${P}-nav-gap-control` : undefined)}
            style={isHorizontalGap
              ? { width: scaled(gap), flexShrink: 0 }
              : { height: scaled(gap) }}
          />
        )}
        {linkNode}
      </Fragment>
    );
  });

  const renderSocialLinks = () => {
    if (socialItems.length === 0) {
      return null;
    }

    const socialIconSize = scaled(fontSize ?? 0.01);
    const socialAtTop = verticalAlign === 'bottom';

    return (
      <div
        className={`${P}-social-links`}
        style={{
          gap: scaled(gap),
          left: scaled(effectiveLayout.effectivePaddingLeft),
          right: scaled(effectiveLayout.effectivePaddingRight),
          ...(socialAtTop
            ? { top: scaled(effectiveLayout.effectivePaddingTop) }
            : { bottom: scaled(effectiveLayout.effectivePaddingBottom) }),
        }}
      >
        {socialItems.map((href, index) => {
          const host = parseSocialLinkHost(href);
          return (
            <a
              key={`${href}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${P}-social-link`}
              aria-label={host?.label ?? 'Link'}
              style={{ width: socialIconSize, height: socialIconSize }}
              onClick={(event) => handleLinkClick(event, closeMenu, isEditor, isPreviewMode)}
            >
              {host ? (
                <SiteFavicon
                  origin={host.origin}
                  hostname={host.hostname}
                  imageClassName={`${P}-social-favicon`}
                  fallbackClassName={`${P}-social-icon`}
                />
              ) : (
                <FallbackSocialIcon className={`${P}-social-icon`} />
              )}
            </a>
          );
        })}
      </div>
    );
  };

  const overlay = usesOverlayLightbox && isOverlayMounted ? (
    <div
      ref={overlayRef}
      data-selection="none"
      className={[
        `${P}-lightbox`,
        isFullLightbox ? `${P}-full-lightbox ${P}-effect-${effect}` : `${P}-direction-${lightboxDirection}`,
        isOverlayActive ? `${P}-lightbox-active` : '',
        useLayoutBoundLightbox ? `${P}-lightbox-editor` : '',
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
        {showControls && renderTextPaddingControls(P, type, effectiveLayout, fontSize, scaled)}
        {verticalAlign === 'bottom' ? renderSocialLinks() : null}
        {renderOpenNavItems(`${P}-link`, isHorizontalText ? 'x' : 'y')}
        {verticalAlign !== 'bottom' ? renderSocialLinks() : null}
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
      <span className={`${P}-icon`} aria-hidden="true">
        <span className={`${P}-icon-line`} />
        <span className={`${P}-icon-line`} />
        <span className={`${P}-icon-line`} />
      </span>
    </button>
  );

  const renderNavLink = (item: BurgerLink, index: number) => {
    if (isHorizontalPanel && typeCNavPhase === 'open') {
      return null;
    }

    const { label, href, target } = resolveBurgerLink(item);
    const textContent = (
      <span className={linkTextClassName} style={navLinkTextStyle}>
        {renderMultilineText(label)}
      </span>
    );
    const labelNode = wrapLinkTextWithWidth(
      P,
      textContent,
      resolvedNavTextWidth,
      showClosedMenuControls,
      scaled,
      {
        showTextWidthControl: showClosedMenuControls,
        textWidthMaxFraction: 1,
        controlsKey: 'navTextWidth',
      },
    );

    const linkNode = href ? (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`${P}-nav-link`}
        onClick={(event) => handleLinkClick(event, closeMenu, isEditor, isPreviewMode)}
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
            data-controls={showClosedMenuControls ? 'navGap' : undefined}
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
    height: scalingValue(panelHeight, isEditor),
    minHeight: scalingValue(panelHeight, isEditor),
    [`--${P}-panel-height`]: scalingValue(panelHeight, isEditor),
    [`--${P}-menu-width`]: scaled(menuWidth),
  };

  const typeCClass = isHorizontalPanel ? `${P}-type-c ${P}-type-c-text-${textOrientation}` : '';
  const openRootClass = isHorizontalPanel && isOpen ? `${P}-open` : '';

  const typeCNavInnerClass = typeCNavPhase === 'open'
    ? `${P}-nav-links-inner-open`
    : `${P}-nav-links-inner-closed`;

  const typeCNavInnerStyle: CSSProperties | undefined = isHorizontalPanel && typeCNavPhase === 'open'
    ? {
      ...getPanelPaddingStyle(effectiveLayout, isEditor),
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: HORIZONTAL_ALIGN_MAP[horizontalAlign],
      alignItems: VERTICAL_ALIGN_MAP[verticalAlign],
      alignContent: VERTICAL_ALIGN_MAP[verticalAlign],
      gap: scaled(gap),
    }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`${P}-root ${typeCClass} ${openRootClass} ${stateClass} ${editorClass} ${interactiveClass}`.trim()}
      style={{
        width: '100%',
        height: '100%',
        lineHeight: 0,
        fontSize: 0,
        ...colorVars,
        ...(isHorizontalPanel ? {
          ...lightboxLayoutStyle,
          [`--${P}-panel-height`]: scalingValue(panelHeight, isEditor),
        } : {}),
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      {isHorizontalPanel && isOpen ? (
        <button
          type="button"
          data-selection="none"
          className={[
            `${P}-type-c-backdrop`,
            isEditor ? `${P}-type-c-backdrop-editor` : '',
          ].filter(Boolean).join(' ')}
          onClick={closeMenu}
          aria-label="Close menu"
        />
      ) : null}
      <div className={`${P}-nav-bar`} style={navBarStyle}>
        {showLogo && logoSrc ? (
          <div className={`${P}-nav-logo`}>
            <div
              className={`${P}-nav-logo-inner`}
              style={{
                width: logoWidth,
                height: logoHeight,
              }}
            >
              <img
                src={logoSrc}
                alt=""
                className={`${P}-nav-logo-img`}
              />
            </div>
          </div>
        ) : null}
        <nav
          className={`${P}-nav-links`}
          aria-label={isHorizontalPanel && typeCNavPhase === 'open' ? 'Menu' : 'Navigation'}
        >
          <div className={`${P}-nav-links-inner ${isHorizontalPanel ? typeCNavInnerClass : ''}`.trim()} style={typeCNavInnerStyle}>
            {showControls && isHorizontalPanel && typeCNavPhase === 'open' && renderTextPaddingControls(P, type, effectiveLayout, fontSize, scaled)}
            {isHorizontalPanel && typeCNavPhase === 'open' && verticalAlign === 'bottom' ? renderSocialLinks() : null}
            {isHorizontalPanel && typeCNavPhase === 'open'
              ? renderOpenNavItems(`${P}-nav-link`, 'x', { useContainerGap: true })
              : items.filter((item) => !isOpenOnlyLink(item)).map((item, index) => renderNavLink(item, index))}
            {isHorizontalPanel && typeCNavPhase === 'open' && verticalAlign !== 'bottom' ? renderSocialLinks() : null}
          </div>
        </nav>
      </div>
      {overlay}
      <div className={`${P}-nav-toggle-wrap`}>
        <div
          className={`${P}-root ${openClass} ${P}-icon-animation-${iconAnimation}`.trim()}
          style={iconRootStyle}
        >
          {renderBurgerToggle()}
        </div>
        <div
          className={`${P}-nav-padding-right`}
          style={{ width: scaled(navPaddingRight), flexShrink: 0 }}
        >
          {showClosedMenuControls ? (
            <div
              data-controls="navPaddingRight"
              data-controls-axis="x"
              data-controls-variant="column-padding"
              data-controls-reverse=""
              data-controls-min="0"
              data-controls-max-fraction={String(navPaddingRightMaxFraction)}
              className={`${P}-control-anchor`}
              style={{
                top: 0,
                right: 0,
                width: scaled(navPaddingRightHandleSize),
                height: '100%',
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
