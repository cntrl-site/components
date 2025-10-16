import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { useLayoutContext } from '../../useLayoutContext';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { VimeoEmbedItem, YoutubeEmbedItem } from '../../../../sdk/types/article/Item';

export const useEmbedVideoItem = (item: VimeoEmbedItem | YoutubeEmbedItem, sectionId: string) => {
  const layoutId = useLayoutContext();
  const radius = useKeyframeValue(
    item,
    KeyframeType.BorderRadius,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return  'radius' in layoutParams ? layoutParams.radius : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getRadius({ radius: value }, scroll).radius : undefined,
    sectionId,
    [layoutId]
  );
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

  return { radius, blur, opacity };
};
