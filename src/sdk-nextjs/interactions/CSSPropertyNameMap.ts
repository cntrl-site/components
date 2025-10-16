import { ArticleItemType } from "../../sdk/types/article/ArticleItemType";
import { ItemState } from "../../sdk/types/article/ItemState";

export const CSSPropertyNameMap: Record<keyof ItemState<ArticleItemType>, string> = {
  width: 'width',
  height: 'height',
  top: 'top',
  left: 'left',
  scale: 'transform',
  angle: 'transform',
  opacity: 'opacity',
  radius: 'border-radius',
  strokeWidth: 'border-width',
  strokeFill: 'border-color',
  fill: 'background',
  blur: 'filter',
  backdropBlur: 'backdrop-filter',
  letterSpacing: 'letter-spacing',
  wordSpacing: 'word-spacing',
  color: 'color'
};

const PropertyNameCSSMap: Record<string, string[]> = {
  'transform': ['angle', 'scale'],
  'border-radius': ['radius'],
  'border-width': ['strokeWidth'],
  'border-color': ['strokeFill'],
  'background': ['fill'],
  'filter': ['blur'],
  'backdrop-filter': ['backdrop-blur'],
  'letter-spacing': ['letterSpacing'],
  'word-spacing': ['wordSpacing'],
};

export function getStyleKeysFromCSSProperty(cssProp: string): string[] {
  const key = PropertyNameCSSMap[cssProp] ?? [cssProp];
  return key;
}
