import type React from 'react';
import { scalingValue } from '.';

export type TextStyles = {
  fontSettings: {
    fontFamily?: string;
    fontWeight: number;
    fontStyle: string;
  };
  letterSpacing: number;
  wordSpacing: number;
  fontSize: number;
  lineHeight?: number;
  textAppearance?: {
    textTransform?: string;
    textDecoration?: string;
    fontVariant?: string;
  };
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color: string;
};

const shouldQuoteFontFamily = (family: string) => {
  const trimmed = family.trim();
  if (!trimmed) return false;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) return false;
  const tokens = trimmed.split(/\s+/g).filter(Boolean);
  return tokens.some((t) => /^\d/.test(t));
};

export const normalizeFontFamilyCssValue = (fontFamily?: string): string | undefined => {
  if (!fontFamily) return fontFamily;

  const parts = fontFamily
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((family) => {
      if (!shouldQuoteFontFamily(family)) return family;
      const escaped = family.replace(/"/g, '\\"');
      return `"${escaped}"`;
    });

  return parts.join(', ');
};

export function omitTextColors(styles: React.CSSProperties): React.CSSProperties {
  const { color, ...rest } = styles;
  return rest;
}

export function textStylesToCss(
  textStyles: TextStyles,
  isEditor?: boolean,
): React.CSSProperties {
  const { fontSize, lineHeight } = textStyles;

  return {
    fontFamily: normalizeFontFamilyCssValue(textStyles.fontSettings.fontFamily),
    fontWeight: textStyles.fontSettings.fontWeight,
    fontStyle: textStyles.fontSettings.fontStyle,
    letterSpacing: scalingValue(textStyles.letterSpacing, isEditor),
    wordSpacing: scalingValue(textStyles.wordSpacing, isEditor),
    fontSize: scalingValue(fontSize, isEditor),
    lineHeight: lineHeight !== undefined ? scalingValue(lineHeight, isEditor) : undefined,
    textTransform: textStyles.textAppearance?.textTransform,
    textDecoration: textStyles.textAppearance?.textDecoration,
    fontVariant: textStyles.textAppearance?.fontVariant,
    textAlign: textStyles.textAlign,
    color: textStyles.color,
  };
}
