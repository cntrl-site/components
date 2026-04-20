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
  color: string;
};

export function omitTextColors(styles: React.CSSProperties): React.CSSProperties {
  const { color, ...rest } = styles;
  return rest;
}

export function textStylesToCss(textStyles: TextStyles, isEditor?: boolean): React.CSSProperties {
  return {
    fontFamily: textStyles.fontSettings.fontFamily,
    fontWeight: textStyles.fontSettings.fontWeight,
    fontStyle: textStyles.fontSettings.fontStyle,
    letterSpacing: scalingValue(textStyles.letterSpacing, isEditor),
    wordSpacing: scalingValue(textStyles.wordSpacing, isEditor),
    fontSize: scalingValue(textStyles.fontSize, isEditor),
    lineHeight: textStyles.lineHeight !== undefined ? scalingValue(textStyles.lineHeight, isEditor) : undefined,
    textTransform: textStyles.textAppearance?.textTransform,
    textDecoration: textStyles.textAppearance?.textDecoration,
    fontVariant: textStyles.textAppearance?.fontVariant,
    color: textStyles.color,
  };
}
