import { ItemAny } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useLayoutContext } from '../useLayoutContext';

  export function useStickyItemTop(item: ItemAny, sectionId: string, stateTop?: number) {
  const layoutId = useLayoutContext();
  const data = useKeyframeValue<{ top: number; left: number } | undefined>(
    item,
    KeyframeType.Position,
    (item, layoutId) => {
      if (!layoutId) return;
      return item.area[layoutId];
    },
    (animator, scroll, value) => value ? animator.getPositions(value, scroll) : undefined,
    sectionId,
    [layoutId]
  );
  const top = data ? data.top : layoutId ? item.area[layoutId].top : 0;
  const sticky = layoutId ? item.sticky[layoutId] : undefined;
  return sticky ? (stateTop ?? top) - sticky.from : 0;
}
