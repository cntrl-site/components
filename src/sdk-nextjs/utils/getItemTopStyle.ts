import { AnchorSide } from '../../sdk/types/article/ItemArea';

export function getItemTopStyle(top: number, anchorSide?: AnchorSide) {
  const defaultValue = `${top * 100}vw`;
  if (!anchorSide) return defaultValue;
  switch (anchorSide) {
    case AnchorSide.Top:
      return defaultValue;
    case AnchorSide.Center:
      return `calc(50% + ${top * 100}vw)`;
    case AnchorSide.Bottom:
      return `calc(100% + ${top * 100}vw)`;
  }
}
