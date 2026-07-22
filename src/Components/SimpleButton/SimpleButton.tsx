import { useMemo, type CSSProperties, type ReactNode } from 'react';
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

type HoverEffect = 'none' | 'scale-up' | 'lift';

type SimpleButtonSettings = {
  type?: 'a' | 'b' | 'c';
  text?: string;
  icon?: string | null;
  alignment?: 'left' | 'center' | 'right';
  order?: 'text-icon' | 'icon-text';
  gap?: number;
  iconScale?: number;
  iconSize?: number;
  dimensions?: boolean;
  padding?: Padding;
  cornerRadius?: CornerRadius;
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

type ColorKeys = 'backgroundColor' | 'textColor' | 'borderColor';

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
};

const STATE_KEYS = ['hover', 'active'] as const;

const ALIGNMENT_MAP = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

function getCSS(P: string): string {
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
  transition: color 250ms, background-color 250ms, border-color 250ms, transform 250ms, box-shadow 250ms;
}
.${P}-hover-effect-scale-up:hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-scale-up {
  transform: scale(1.05);
}
.${P}-hover-effect-lift:hover,
.${P}-wrapper.${P}-state-hover .${P}-hover-effect-lift {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.${P}-button:hover {
  background-color: var(--${P}-hover-background-color, var(--${P}-background-color));
  color: var(--${P}-hover-text-color, var(--${P}-text-color));
  border-color: var(--${P}-hover-border-color, var(--${P}-border-color));
}
.${P}-wrapper.${P}-state-hover .${P}-button {
  background-color: var(--${P}-hover-background-color, var(--${P}-background-color));
  color: var(--${P}-hover-text-color, var(--${P}-text-color));
  border-color: var(--${P}-hover-border-color, var(--${P}-border-color));
}
.${P}-button:active {
  background-color: var(--${P}-active-background-color, var(--${P}-background-color));
  color: var(--${P}-active-text-color, var(--${P}-text-color));
  border-color: var(--${P}-active-border-color, var(--${P}-border-color));
}
.${P}-wrapper.${P}-state-active .${P}-button {
  background-color: var(--${P}-active-background-color, var(--${P}-background-color));
  color: var(--${P}-active-text-color, var(--${P}-text-color));
  border-color: var(--${P}-active-border-color, var(--${P}-border-color));
}
.${P}-text {
  display: block;
  flex: 1;
  min-width: 0;
}
.${P}-icon {
  display: block;
  flex-shrink: 0;
  object-fit: contain;
}
.${P}-icon-fill {
  max-width: 100%;
  height: auto;
}
.${P}-icon-inline {
  height: calc(1em * var(--${P}-icon-scale, 1));
  width: calc(1em * var(--${P}-icon-scale, 1));
}
`;
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

  let className = `${P}-icon`;
  let style: CSSProperties | undefined;

  if (variant === 'inline') {
    className = `${P}-icon ${P}-icon-inline`;
    style = { [`--${P}-icon-scale`]: iconScale / 100 };
  } else if (variant === 'fixed' && iconSize > 0) {
    const size = scalingValue(iconSize, isEditor);
    style = { width: size, height: size };
  } else {
    className = `${P}-icon ${P}-icon-fill`;
  }

  return (
    <img
      className={className}
      src={icon}
      alt=""
      style={style}
    />
  );
}

export function SimpleButton({ settings, isEditor, isPreviewMode, activeEvent }: SimpleButtonProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);

  const {
    type = 'a',
    text = 'Button',
    icon,
    alignment = 'center',
    order = 'text-icon',
    gap = 0,
    iconScale = 100,
    iconSize = 0,
    dimensions = false,
    padding = { top: 0, right: 0, bottom: 0, left: 0 },
    cornerRadius = { top: 0, right: 0, bottom: 0, left: 0 },
    stroke = 0,
    backgroundColor = '#000000',
    textColor = '#ffffff',
    borderColor = '#ffffff',
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
  }, COLOR_VAR_MAP, STATE_KEYS, stateOverrides);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const hoverEffectClass = hoverEffect !== 'none' && (!isEditor || isPreviewMode || activeEvent === 'hover')
    ? `${P}-hover-effect-${hoverEffect}`
    : '';

  const isAutoDimensions = dimensions === true;
  const effectiveAlignment = isAutoDimensions ? 'center' : alignment;

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
    ...(isIconTextType ? { gap: scalingValue(gap, isEditor) } : {}),
    ...(isAutoDimensions
      ? { width: 'auto', height: 'auto' }
      : {
          minWidth: scalingValue(minWidth, isEditor),
          minHeight: scalingValue(minHeight, isEditor),
          ...(isIconTextType ? { width: '100%' } : {}),
        }),
  };

  let buttonContent: ReactNode;

  if (type === 'b') {
    buttonContent = renderIcon(P, icon, iconSize > 0 ? 'fixed' : 'fill', 100, iconSize, isEditor);
  } else if (type === 'c') {
    const textNode = (
      <span
        className={`${P}-text`}
        style={{ textAlign: effectiveAlignment }}
      >
        {text}
      </span>
    );
    const iconNode = renderIcon(P, icon, 'inline', iconScale);

    buttonContent = order === 'icon-text'
      ? <>{iconNode}{textNode}</>
      : <>{textNode}{iconNode}</>;
  } else {
    buttonContent = text;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div className={`${P}-wrapper ${stateClass}`.trim()} style={colorVars}>
        <button type="button" className={`${P}-button ${hoverEffectClass}`.trim()} style={buttonStyle}>
          {buttonContent}
        </button>
      </div>
    </>
  );
}
