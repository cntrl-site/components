import { useLayoutContext } from '../useLayoutContext';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { ItemAny } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';

export function useItemArea(
  item: ItemAny,
  sectionId: string,
  stateValues: { top?: number; left?: number; width?: number; height?: number }
) {
  const layoutId = useLayoutContext();
  const position = useKeyframeValue<{ top: number; left: number } | undefined>(
    item,
    KeyframeType.Position,
    (item, layoutId) => {
      if (!layoutId) return;
      return item.area[layoutId]
    },
    (animator, scroll, value) => value ? animator.getPositions(value, scroll) : undefined,
    sectionId,
    [layoutId]
  );
  const dimensions = useKeyframeValue<{ width: number; height: number } | undefined>(
    item,
    KeyframeType.Dimensions,
    (item, layoutId) => layoutId ? item.area[layoutId] : undefined,
    (animator, scroll, value) => value ? animator.getDimensions(value, scroll) : undefined,
    sectionId,
    [layoutId]
  );
  const width = (stateValues.width ?? dimensions?.width) as number | undefined;
  const height = (stateValues.height ?? dimensions?.height) as number | undefined;
  const top = (stateValues.top ?? position?.top) as number | undefined;
  const left = (stateValues.left ?? position?.left) as number | undefined;
  return { width, height, top, left };
}
