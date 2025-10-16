import { useLayoutContext } from '../../useLayoutContext';
import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { CodeEmbedItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { AreaAnchor } from '../../../../sdk/types/article/ItemArea';

export function useCodeEmbedItem(item: CodeEmbedItem, sectionId: string) {
  const layoutId = useLayoutContext();

  const blur = useKeyframeValue(
    item,
    KeyframeType.Blur,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'blur' in layoutParams ? layoutParams.blur : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getBlur({ blur: value }, scroll).blur : undefined,
    sectionId,
    [layoutId]
  );

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

  const anchor = layoutId && 'areaAnchor' in item.layoutParams[layoutId] ? item.layoutParams[layoutId].areaAnchor : AreaAnchor.TopLeft;
  return { anchor, blur, opacity };
}
