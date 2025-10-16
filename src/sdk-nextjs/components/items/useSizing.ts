import { ArticleItemType } from '../../../sdk/types/article/ArticleItemType';
import { ItemAny } from '../../../sdk/types/article/Item';
import { isItemType } from '../../utils/isItemType';
import { useLayoutContext } from '../useLayoutContext';

export function useSizing(item: ItemAny) {
  const layout = useLayoutContext();
  const sizing = layout && isItemType(item, ArticleItemType.RichText)
    ? item.layoutParams[layout].sizing
    : undefined;
  const sizingAxis = parseSizing(sizing);
  return sizingAxis;
}

export function parseSizing(sizing: string = 'manual'): Axis {
  const axisSizing = sizing.split(' ');
  return {
    y: axisSizing[0],
    x: axisSizing[1] ? axisSizing[1] : axisSizing[0]
  } as Axis;
}

interface Axis {
  x: 'manual' | 'auto';
  y: 'manual' | 'auto';
}
