import { FillLayer, RectangleItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { useLayoutContext } from '../../useLayoutContext';

const defaultFill = [
  {
    id: 'default',
    type: 'solid' as const,
    value: 'rgba(0, 0, 0, 1)',
    blendMode: 'normal'
  }
];

export function useRectangleItem(item: RectangleItem, sectionId: string) {
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
  const fill = useKeyframeValue<FillLayer[] | undefined>(
    item,
    KeyframeType.Fill,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'fill' in layoutParams ? layoutParams.fill : defaultFill;
    },
    (animator, scroll, value) => value ? animator.getFill(value, scroll) : undefined,
    sectionId,
    [layoutId]
  );
  const strokeFill = useKeyframeValue(
    item,
    KeyframeType.BorderFill,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'strokeFill' in layoutParams ? layoutParams.strokeFill : defaultFill;
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
  const backdropBlur = useKeyframeValue(
    item,
    KeyframeType.BackdropBlur,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'backdropBlur' in layoutParams ? layoutParams.backdropBlur : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getBackdropBlur({ backdropBlur: value }, scroll).backdropBlur : undefined,
    sectionId,
    [layoutId]
  );
  return { fill, strokeWidth, radius, strokeFill, blur, backdropBlur };
}
