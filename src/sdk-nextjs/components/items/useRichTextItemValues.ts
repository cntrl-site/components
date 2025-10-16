import { RichTextItem } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../common/useKeyframeValue';
import { useLayoutContext } from '../useLayoutContext';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 1)';

export const useRichTextItemValues = (item: RichTextItem, sectionId: string) => {
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

  const letterSpacing = useKeyframeValue(
    item,
    KeyframeType.LetterSpacing,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'letterSpacing' in layoutParams ? layoutParams.letterSpacing : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getLetterSpacing({ letterSpacing: value }, scroll).letterSpacing : undefined,
    sectionId,
    [layoutId]
  );

  const wordSpacing = useKeyframeValue(
    item,
    KeyframeType.WordSpacing,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'wordSpacing' in layoutParams ? layoutParams.wordSpacing : 0;
    },
    (animator, scroll, value) => value !== undefined ? animator.getWordSpacing({ wordSpacing: value }, scroll).wordSpacing : undefined,
    sectionId,
    [layoutId]
  );

  const color = useKeyframeValue(
    item,
    KeyframeType.TextColor,
    (item, layoutId) => {
      if (!layoutId) return;
      const layoutParams = item.layoutParams[layoutId];
      return 'color' in layoutParams ? layoutParams.color : DEFAULT_COLOR;
    },
    (animator, scroll, value) => value ? animator.getTextColor({ color: value }, scroll).color : undefined,
    sectionId,
    [layoutId]
  );

  const fontSize = layoutId ? item.layoutParams[layoutId].fontSize : undefined;
  const lineHeight = layoutId ? item.layoutParams[layoutId].lineHeight : undefined;

  return { blur, letterSpacing, wordSpacing, color, fontSize, lineHeight };
};
