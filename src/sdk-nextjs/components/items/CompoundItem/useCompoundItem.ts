import { useLayoutContext } from '../../useLayoutContext';
import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { CompoundItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';

export function useCompoundItem(item: CompoundItem, sectionId: string) {
  const layoutId = useLayoutContext();
  const opacity = useKeyframeValue(
    item,
    KeyframeType.Opacity,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'opacity' in layoutParams ? layoutParams.opacity : 1;
    },
    (animator, scroll, value) => value !== undefined ? animator.getOpacity({ opacity: value }, scroll).opacity : undefined,
    sectionId,
    [layoutId]
  );

  return { opacity };
}
