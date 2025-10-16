import { ImageItem, VideoItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { useLayoutContext } from '../../useLayoutContext';

const DEFAULT_FILL = [
  {
    id: 'default',
    type: 'solid' as const,
    value: 'rgba(0, 0, 0, 1)',
    blendMode: 'normal'
  }
];

export function useFileItem(item: ImageItem | VideoItem, sectionId: string) {
  const layoutId = useLayoutContext();
  const radius = useKeyframeValue(
    item,
    KeyframeType.BorderRadius,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'radius' in layoutParams ? layoutParams.radius : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getRadius({ radius: value }, scroll).radius : undefined,
    sectionId,
    [layoutId]
  );
  const strokeWidth = useKeyframeValue(
    item,
    KeyframeType.BorderWidth,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeWidth' in layoutParams ? layoutParams.strokeWidth : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getBorderWidth({ borderWidth: value }, scroll).borderWidth : undefined,
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

  const strokeFill = useKeyframeValue(
    item,
    KeyframeType.BorderFill,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeFill' in layoutParams ? layoutParams.strokeFill : DEFAULT_FILL;
    },
    (animator, scroll, value) => value ? animator.getBorderFill(value, scroll) : undefined,
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

  return { radius, strokeWidth, opacity, strokeFill, blur };
}
