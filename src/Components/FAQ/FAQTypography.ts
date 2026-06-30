import type { CSSProperties } from 'react';
import { TextStyles } from '../utils/textStylesToCss';
import { scalingValue } from '../utils/index';
import type { FAQSettings } from './FAQTypes';

export function getTextClassName(
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

export function getTextLeadingVars(
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

export function resolveTextStyle(
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
