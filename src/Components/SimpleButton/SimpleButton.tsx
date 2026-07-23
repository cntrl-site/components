import { useMemo, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils';
import { omitTextColors, textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type CornerRadius = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type BoxShadow = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type HoverEffect = 'none' | 'scale-up' | 'lift' | 'blinds' | 'reveal' | 'swipe' | 'content-roll';

type SimpleButtonSettings = {
  type?: 'a' | 'b' | 'c';
  label?: string;
  icon?: string | null;
  alignment?: 'left' | 'center' | 'right';
  alignA?: 'left' | 'center' | 'right';
  order?: 'text-icon' | 'icon-text';
  gap?: number;
  iconScale?: number;
  iconSize?: number;
  iconColor?: string;
  dimensions?: boolean;
  padding?: Padding;
  cornerRadius?: CornerRadius;
  boxShadow?: BoxShadow;
  boxShadowColor?: string;
  innerBoxShadow?: BoxShadow;
  innerBoxShadowColor?: string;
  stroke?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverEffect?: HoverEffect;
  fontFamily?: string;
  fontSettings?: {
    fontWeight?: number;
    fontStyle?: string;
  };
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  textAppearance?: {
    textTransform?: string;
    textDecoration?: string;
    fontVariant?: string;
  };
  stateOverrides?: Record<string, Partial<Record<ColorKeys, string>>>;
  minWidth?: number;
  minHeight?: number;
};

type ColorKeys = 'backgroundColor' | 'textColor' | 'borderColor' | 'iconColor' | 'boxShadowColor' | 'innerBoxShadowColor';

type SimpleButtonProps = {
  settings: SimpleButtonSettings;
  isEditor?: boolean;
  isPreviewMode?: boolean;
  activeEvent?: string;
} & CommonComponentProps;

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  backgroundColor: 'background-color',
  textColor: 'text-color',
  borderColor: 'border-color',
  iconColor: 'icon-color',
  boxShadowColor: 'box-shadow-color',
  innerBoxShadowColor: 'inner-box-shadow-color',
};

const STATE_KEYS = ['hover', 'active'] as const;

const ALIGNMENT_MAP = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

function setRevealOpenDirectionFromMouseEnter(event: MouseEvent<HTMLElement>, prefix: string): void {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const fromBottom = event.clientY - rect.top > rect.height / 2;
  el.classList.toggle(`${prefix}-reveal-from-bottom`, fromBottom);
}

function setRevealCloseDirectionFromMouseLeave(event: MouseEvent<HTMLElement>, prefix: string): void {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const exitToTop = event.clientY < rect.top + rect.height / 2;
  el.classList.toggle(`${prefix}-reveal-from-bottom`, exitToTop);
}

function getCSS(P: string): string {
  const outerShadow = `var(--${P}-box-shadow-x, 0) var(--${P}-box-shadow-y, 0) var(--${P}-box-shadow-blur, 0) var(--${P}-box-shadow-spread, 0) var(--${P}-box-shadow-color, transparent)`;
  const innerShadow = `inset var(--${P}-inner-box-shadow-x, 0) var(--${P}-inner-box-shadow-y, 0) var(--${P}-inner-box-shadow-blur, 0) var(--${P}-inner-box-shadow-spread, 0) var(--${P}-inner-box-shadow-color, transparent)`;
  const boxShadow = `${outerShadow}, ${innerShadow}`;
  const hoverOuterShadow = `var(--${P}-box-shadow-x, 0) var(--${P}-box-shadow-y, 0) var(--${P}-box-shadow-blur, 0) var(--${P}-box-shadow-spread, 0) var(--${P}-hover-box-shadow-color, var(--${P}-box-shadow-color, transparent))`;
  const hoverInnerShadow = `inset var(--${P}-inner-box-shadow-x, 0) var(--${P}-inner-box-shadow-y, 0) var(--${P}-inner-box-shadow-blur, 0) var(--${P}-inner-box-shadow-spread, 0) var(--${P}-hover-inner-box-shadow-color, var(--${P}-inner-box-shadow-color, transparent))`;
  const hoverBoxShadow = `${hoverOuterShadow}, ${hoverInnerShadow}`;
  const activeOuterShadow = `var(--${P}-box-shadow-x, 0) var(--${P}-box-shadow-y, 0) var(--${P}-box-shadow-blur, 0) var(--${P}-box-shadow-spread, 0) var(--${P}-active-box-shadow-color, var(--${P}-box-shadow-color, transparent))`;
  const activeInnerShadow = `inset var(--${P}-inner-box-shadow-x, 0) var(--${P}-inner-box-shadow-y, 0) var(--${P}-inner-box-shadow-blur, 0) var(--${P}-inner-box-shadow-spread, 0) var(--${P}-active-inner-box-shadow-color, var(--${P}-inner-box-shadow-color, transparent))`;
  const activeBoxShadow = `${activeOuterShadow}, ${activeInnerShadow}`;
  const liftBoxShadow = `0 4px 12px rgba(0, 0, 0, 0.15), ${innerShadow}`;

  return `
.${P}-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}
.${P}-button {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  border-style: solid;
  border-color: var(--${P}-border-color);
  background-color: var(--${P}-background-color);
  color: var(--${P}-text-color);
  cursor: pointer;
  font: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  user-select: none;
  transition: color 250ms, background-color 250ms, border-color 250ms, transform 250ms, box-shadow 250ms;
  box-shadow: ${boxShadow};
}
.${P}-wrapper.${P}-editing .${P}-button {
  transition: color 250ms, background-color 250ms, border-color 250ms, transform 250ms;
}
.${P}-hover-effect-scale-up:hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-scale-up {
  transform: scale(1.05);
}
.${P}-hover-effect-lift:hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-lift {
  transform: translateY(-2px);
  box-shadow: ${liftBoxShadow};
}
.${P}-hover-effect-blinds,
.${P}-hover-effect-reveal,
.${P}-hover-effect-swipe {
  position: relative;
  overflow: hidden;
}
.${P}-hover-effect-blinds .${P}-button-inner,
.${P}-hover-effect-blinds .${P}-text,
.${P}-hover-effect-blinds .${P}-icon,
.${P}-hover-effect-reveal .${P}-button-inner,
.${P}-hover-effect-reveal .${P}-text,
.${P}-hover-effect-reveal .${P}-icon,
.${P}-hover-effect-swipe .${P}-button-inner,
.${P}-hover-effect-swipe .${P}-text,
.${P}-hover-effect-swipe .${P}-icon {
  position: relative;
  z-index: 1;
}
.${P}-hover-effect-blinds::before,
.${P}-hover-effect-reveal::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--${P}-hover-background-color, var(--${P}-background-color));
  pointer-events: none;
  z-index: 0;
}
.${P}-hover-effect-blinds::before {
  transform: scaleY(0);
  transform-origin: center center;
  opacity: 0;
  transition: opacity 150ms, transform 0s 250ms;
}
.${P}-hover-effect-blinds:hover::before,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-blinds::before {
  transform: scaleY(1);
  opacity: 1;
  transition: transform 250ms, opacity 250ms;
}
.${P}-hover-effect-reveal::before {
  transform: scaleY(0);
  transform-origin: bottom center;
  transition: transform 120ms;
}
.${P}-hover-effect-reveal:hover::before,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-reveal::before {
  transform: scaleY(1);
  transform-origin: top center;
}
.${P}-hover-effect-reveal.${P}-reveal-from-bottom::before {
  transform-origin: top center;
}
.${P}-hover-effect-reveal.${P}-reveal-from-bottom:hover::before,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-reveal.${P}-reveal-from-bottom::before {
  transform-origin: bottom center;
}
.${P}-hover-effect-swipe::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--${P}-hover-background-color, var(--${P}-background-color));
  pointer-events: none;
  z-index: 0;
  transform: translateX(-100%);
  transition: transform 250ms;
}
.${P}-hover-effect-swipe:hover::before,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-swipe::before {
  transform: translateX(0);
}
.${P}-hover-effect-blinds:hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-blinds,
.${P}-hover-effect-reveal:hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-reveal,
.${P}-hover-effect-swipe:hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-swipe {
  background-color: var(--${P}-background-color);
}
.${P}-hover-effect-content-roll {
  position: relative;
  overflow: hidden;
  align-items: stretch;
}
.${P}-content-roll-wrap {
  position: relative;
  align-self: stretch;
  min-width: 0;
}
.${P}-content-roll-wrap.${P}-icon-text-roll {
  flex: 1;
  width: 100%;
}
.${P}-content-roll-wrap.${P}-icon-roll,
.${P}-content-roll-wrap.${P}-label-roll {
  display: inline-block;
  flex: 1;
}
.${P}-content-roll-spacer {
  visibility: hidden;
  pointer-events: none;
}
.${P}-content-roll-viewport {
  position: absolute;
  inset: 0;
}
.${P}-content-roll-layer {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 250ms ease, opacity 250ms ease, top 250ms ease;
  opacity: 1;
}
.${P}-content-roll-layer-hover {
  top: 0;
  transform: translateY(-100%);
  opacity: 0;
}
.${P}-hover-effect-content-roll:hover .${P}-content-roll-layer:not(.${P}-content-roll-layer-hover),
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-content-roll .${P}-content-roll-layer:not(.${P}-content-roll-layer-hover) {
  top: 100%;
  transform: translateY(0);
  opacity: 0;
}
.${P}-hover-effect-content-roll:hover .${P}-content-roll-layer-hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-content-roll .${P}-content-roll-layer-hover {
  top: 50%;
  transform: translateY(-50%);
  opacity: 1;
}
.${P}-button:hover {
  background-color: var(--${P}-hover-background-color, var(--${P}-background-color));
  color: var(--${P}-hover-text-color, var(--${P}-text-color));
  border-color: var(--${P}-hover-border-color, var(--${P}-border-color));
  box-shadow: ${hoverBoxShadow};
}
.${P}-wrapper.${P}-state-hover .${P}-button {
  background-color: var(--${P}-hover-background-color, var(--${P}-background-color));
  color: var(--${P}-hover-text-color, var(--${P}-text-color));
  border-color: var(--${P}-hover-border-color, var(--${P}-border-color));
  box-shadow: ${hoverBoxShadow};
}
.${P}-button:active {
  background-color: var(--${P}-active-background-color, var(--${P}-background-color));
  color: var(--${P}-active-text-color, var(--${P}-text-color));
  border-color: var(--${P}-active-border-color, var(--${P}-border-color));
  box-shadow: ${activeBoxShadow};
}
.${P}-wrapper.${P}-state-active .${P}-button {
  background-color: var(--${P}-active-background-color, var(--${P}-background-color));
  color: var(--${P}-active-text-color, var(--${P}-text-color));
  border-color: var(--${P}-active-border-color, var(--${P}-border-color));
  box-shadow: ${activeBoxShadow};
}
.${P}-text {
  display: block;
  flex: 1;
  min-width: 0;
}
.${P}-icon {
  display: block;
  flex-shrink: 0;
  position: relative;
}
.${P}-icon-image {
  transition: background-color 250ms;
}
.${P}-button:hover .${P}-icon-image,
.${P}-wrapper.${P}-state-hover .${P}-icon-image {
  --fill: var(--${P}-hover-icon-color, var(--${P}-icon-color)) !important;
  --hover-fill: var(--${P}-hover-icon-color, var(--${P}-icon-color)) !important;
}
.${P}-button:active .${P}-icon-image,
.${P}-wrapper.${P}-state-active .${P}-icon-image {
  --fill: var(--${P}-active-icon-color, var(--${P}-icon-color)) !important;
  --hover-fill: var(--${P}-active-icon-color, var(--${P}-icon-color)) !important;
}
.${P}-icon .${P}-icon-image {
  width: 100%;
  height: 100%;
}
.${P}-icon-fill {
  max-width: 100%;
  width: 100%;
  height: auto;
}
.${P}-icon-fill .${P}-icon-image {
  position: relative;
  top: auto;
  left: auto;
  transform: none;
  width: 100%;
  height: auto;
}
.${P}-icon-inline {
  display: inline-block;
  height: calc(1em * var(--${P}-icon-scale, 1));
  width: calc(1em * var(--${P}-icon-scale, 1));
}
`;
}

function renderContentRoll(
  P: string,
  renderContent: () => ReactNode,
  className = '',
  wrapStyle?: CSSProperties,
  layerStyle?: CSSProperties,
) {
  const spacerContent = renderContent();

  return (
    <span className={`${P}-content-roll-wrap ${className}`.trim()} style={wrapStyle}>
      <span className={`${P}-content-roll-spacer`} aria-hidden="true" style={layerStyle}>{spacerContent}</span>
      <span className={`${P}-content-roll-viewport`}>
        <span className={`${P}-content-roll-layer`} style={layerStyle}>{renderContent()}</span>
        <span className={`${P}-content-roll-layer ${P}-content-roll-layer-hover`} aria-hidden="true" style={layerStyle}>{renderContent()}</span>
      </span>
    </span>
  );
}

function renderIcon(
  P: string,
  icon?: string | null,
  variant: 'fill' | 'inline' | 'fixed' = 'fill',
  iconScale = 100,
  iconSize = 0,
  isEditor?: boolean,
) {
  if (!icon) return null;

  const svgImage = (
    <SvgImage
      url={icon}
      fill={`var(--${P}-icon-color)`}
      hoverFill={`var(--${P}-icon-color)`}
      className={`${P}-icon-image`}
    />
  );

  if (variant === 'inline') {
    return (
      <span
        className={`${P}-icon ${P}-icon-inline`}
        style={{ [`--${P}-icon-scale`]: iconScale / 100 }}
        aria-hidden="true"
      >
        {svgImage}
      </span>
    );
  }

  if (variant === 'fixed' && iconSize > 0) {
    const size = scalingValue(iconSize, isEditor);
    return (
      <span className={`${P}-icon`} style={{ width: size, height: size }} aria-hidden="true">
        {svgImage}
      </span>
    );
  }

  return (
    <span className={`${P}-icon ${P}-icon-fill`} aria-hidden="true">
      {svgImage}
    </span>
  );
}

export function SimpleButton({ settings, isEditor, isPreviewMode, activeEvent }: SimpleButtonProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);

  const {
    type = 'a',
    label = 'Button',
    icon,
    alignment = 'center',
    alignA,
    order = 'text-icon',
    gap = 0,
    iconScale = 100,
    iconSize = 0,
    dimensions = false,
    padding = { top: 0, right: 0, bottom: 0, left: 0 },
    cornerRadius = { top: 0, right: 0, bottom: 0, left: 0 },
    boxShadow = { top: 0, left: 0, right: 0, bottom: 0 },
    boxShadowColor = 'rgba(0, 0, 0, 0)',
    innerBoxShadow = { top: 0, left: 0, right: 0, bottom: 0 },
    innerBoxShadowColor = 'rgba(0, 0, 0, 0)',
    stroke = 0,
    backgroundColor = '#000000',
    textColor = '#ffffff',
    borderColor = '#ffffff',
    iconColor = '#ffffff',
    hoverEffect = 'none',
    fontFamily,
    fontSettings,
    fontSize,
    lineHeight,
    letterSpacing = 0,
    wordSpacing = 0,
    textAppearance,
    stateOverrides,
    minWidth = 0,
    minHeight = 0,
  } = settings;

  const colorVars = buildColorVars(P, {
    backgroundColor,
    textColor,
    borderColor,
    iconColor,
    boxShadowColor,
    innerBoxShadowColor,
  }, COLOR_VAR_MAP, STATE_KEYS, stateOverrides);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const editingClass = isEditor && !isPreviewMode ? `${P}-editing` : '';
  const hoverEffectClass = hoverEffect !== 'none' && (!isEditor || isPreviewMode || activeEvent === 'hover')
    ? `${P}-hover-effect-${hoverEffect}`
    : '';
  const useHoverOverlay = hoverEffect === 'blinds' || hoverEffect === 'reveal' || hoverEffect === 'swipe';
  const useContentRoll = hoverEffect === 'content-roll';
  const revealHoverActive = hoverEffect === 'reveal' && (!isEditor || isPreviewMode);

  const isAutoDimensions = dimensions === true;
  const resolvedAlignment = type === 'a' ? (alignA ?? alignment) : alignment;
  const effectiveAlignment = isAutoDimensions ? 'center' : resolvedAlignment;

  const isIconTextType = type === 'c';
  const hasText = type !== 'b';

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
    textAppearance,
    color: textColor,
  };

  const typographyCss = hasText
    ? omitTextColors(textStylesToCss(resolvedTextStyle, isEditor))
    : {};

  const buttonStyle = {
    ...typographyCss,
    [`--${P}-box-shadow-x`]: scalingValue(boxShadow.left, isEditor),
    [`--${P}-box-shadow-y`]: scalingValue(boxShadow.top, isEditor),
    [`--${P}-box-shadow-blur`]: scalingValue(boxShadow.right, isEditor),
    [`--${P}-box-shadow-spread`]: scalingValue(boxShadow.bottom, isEditor),
    [`--${P}-inner-box-shadow-x`]: scalingValue(innerBoxShadow.left, isEditor),
    [`--${P}-inner-box-shadow-y`]: scalingValue(innerBoxShadow.top, isEditor),
    [`--${P}-inner-box-shadow-blur`]: scalingValue(innerBoxShadow.right, isEditor),
    [`--${P}-inner-box-shadow-spread`]: scalingValue(innerBoxShadow.bottom, isEditor),
    paddingTop: scalingValue(padding.top, isEditor),
    paddingRight: scalingValue(padding.right, isEditor),
    paddingBottom: scalingValue(padding.bottom, isEditor),
    paddingLeft: scalingValue(padding.left, isEditor),
    borderTopLeftRadius: scalingValue(cornerRadius.top, isEditor),
    borderTopRightRadius: scalingValue(cornerRadius.right, isEditor),
    borderBottomRightRadius: scalingValue(cornerRadius.bottom, isEditor),
    borderBottomLeftRadius: scalingValue(cornerRadius.left, isEditor),
    borderWidth: scalingValue(stroke, isEditor),
    ...(!isIconTextType ? {
      justifyContent: ALIGNMENT_MAP[effectiveAlignment],
      textAlign: effectiveAlignment,
    } : {}),
    ...(isIconTextType && !useContentRoll ? { gap: scalingValue(gap, isEditor) } : {}),
    ...(isAutoDimensions
      ? { width: 'auto', height: 'auto' }
      : {
          minWidth: scalingValue(minWidth, isEditor),
          minHeight: scalingValue(minHeight, isEditor),
          ...(isIconTextType ? { width: '100%' } : {}),
        }),
  };

  let buttonContent: ReactNode;

  const rollLayerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: isIconTextType
      ? ALIGNMENT_MAP[effectiveAlignment]
      : ALIGNMENT_MAP[type === 'a' ? effectiveAlignment : 'center'],
    gap: isIconTextType ? scalingValue(gap, isEditor) : undefined,
    width: '100%',
    height: '100%',
    ...(type === 'a' ? { textAlign: effectiveAlignment } : {}),
  };

  if (type === 'b') {
    const renderIconContent = () => renderIcon(P, icon, iconSize > 0 ? 'fixed' : 'fill', 100, iconSize, isEditor);
    buttonContent = useContentRoll
      ? renderContentRoll(P, renderIconContent, `${P}-icon-roll`, undefined, rollLayerStyle)
      : renderIconContent();
  } else if (type === 'c') {
    const renderIconTextContent = () => {
      const textNode = (
        <span
          className={`${P}-text`}
          style={{ textAlign: effectiveAlignment }}
        >
          {label}
        </span>
      );
      const iconNode = renderIcon(P, icon, 'inline', iconScale);
      return order === 'icon-text'
        ? <>{iconNode}{textNode}</>
        : <>{textNode}{iconNode}</>;
    };

    buttonContent = useContentRoll
      ? renderContentRoll(P, renderIconTextContent, `${P}-icon-text-roll`, undefined, rollLayerStyle)
      : renderIconTextContent();
  } else {
    const renderLabelContent = () => label;
    buttonContent = useContentRoll
      ? renderContentRoll(P, renderLabelContent, `${P}-label-roll`, undefined, rollLayerStyle)
      : useHoverOverlay
        ? <span className={`${P}-button-inner`}>{label}</span>
        : label;
  }

  const handleRevealMouseEnter = revealHoverActive
    ? (event: MouseEvent<HTMLDivElement>) => setRevealOpenDirectionFromMouseEnter(event, P)
    : undefined;
  const handleRevealMouseLeave = revealHoverActive
    ? (event: MouseEvent<HTMLDivElement>) => setRevealCloseDirectionFromMouseLeave(event, P)
    : undefined;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div className={`${P}-wrapper ${stateClass} ${editingClass}`.trim()} style={colorVars}>
        <div
          className={`${P}-button ${hoverEffectClass}`.trim()}
          style={buttonStyle}
          onMouseEnter={handleRevealMouseEnter}
          onMouseLeave={handleRevealMouseLeave}
          role="button"
        >
          {buttonContent}
        </div>
      </div>
    </>
  );
}
