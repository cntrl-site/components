import { AnchorSide } from '../../sdk/types/article/ItemArea';

export function getAnchoredItemTop(top: number, sectionHeight: string, anchorSide?: AnchorSide) {
  const styleTop = `${top * 100}vw`;
  switch (anchorSide) {
    case AnchorSide.Center: return `calc(${styleTop} + ${sectionHeight} / 2)`;
    case AnchorSide.Bottom: return `calc(${styleTop} + ${sectionHeight})`;
    case AnchorSide.Top:
    default:
      return styleTop;
  }
}
