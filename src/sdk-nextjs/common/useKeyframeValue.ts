import isEqual from 'lodash.isequal';
import { DependencyList, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { KeyframesContext } from '../provider/KeyframesContext';
import { AnimationData, Animator } from '../utils/Animator/Animator';
import { useLayoutContext } from '../components/useLayoutContext';
import { ItemAny } from '../../sdk/types/article/Item';
import { KeyframeType } from '../../sdk/types/keyframe/Keyframe';

export type AnimatorGetter<T> = (animator: Animator, scroll: number, value: T) => T;
type ItemParamGetter<T> = (item: ItemAny, layoutId: string | undefined) => T;
const emptyDeps: DependencyList = [];

export function useKeyframeValue<T>(
  item: ItemAny,
  type: KeyframeType,
  itemParamsGetter: ItemParamGetter<T>,
  animatorGetter: AnimatorGetter<T>,
  sectionId: string,
  deps: DependencyList = emptyDeps
): T {
  const animatorGetterRef = useRef(animatorGetter);
  const itemParamsGetterRef = useRef(itemParamsGetter);

  animatorGetterRef.current = animatorGetter;
  itemParamsGetterRef.current = itemParamsGetter;

  const articleRectObserver = useContext(ArticleRectContext);
  const layoutId = useLayoutContext();
  const keyframesRepo = useContext(KeyframesContext);
  const keyframes = useMemo(() => keyframesRepo.getItemKeyframes(item.id).filter(kf => kf.type === type), [item.id, keyframesRepo, type]);
  const paramValue = useMemo<T>(() => {
    return itemParamsGetterRef.current(item, layoutId);
  }, [item, layoutId, ...deps]);

  const [adjustedValue, setAdjustedValue] = useState<T>(paramValue);
  const adjustedValueRef = useRef<T>(adjustedValue);
  adjustedValueRef.current = adjustedValue;

  const animator = useMemo(() => {
    if (!layoutId || !keyframes.length) return;
    const animationData = keyframes
      .filter(k => k.layoutId === layoutId)
      .map<AnimationData<KeyframeType>>(({ position, type, value }) => ({
        position,
        type,
        value
      }));
    return new Animator(animationData);
  }, [keyframes, layoutId]);

  const handleKeyframeValue = useCallback((scroll: number) => {
    if (!animator) return;
    const newValue = animatorGetterRef.current(animator, scroll, paramValue);
    if (!isEqual(newValue, adjustedValueRef.current)) {
      setAdjustedValue(newValue);
    }
  }, [animator, paramValue]);

  useEffect(() => {
    setAdjustedValue(paramValue);
  }, [paramValue]);

  useEffect(() => {
    if (!articleRectObserver || !animator) return;
    const scroll = articleRectObserver.getSectionScroll(sectionId);
    handleKeyframeValue(scroll);
  }, [articleRectObserver, handleKeyframeValue, animator]);

  useEffect(() => {
    if (!articleRectObserver || !animator) return;
    return articleRectObserver.on('resize', () => {
      const scroll = articleRectObserver.getSectionScroll(sectionId);
      handleKeyframeValue(scroll);
    });
  }, [handleKeyframeValue, articleRectObserver, animator]);

  useEffect(() => {
    if (!articleRectObserver || !animator) return;
    return articleRectObserver.on('scroll', () => {
      const scroll = articleRectObserver.getSectionScroll(sectionId);
      handleKeyframeValue(scroll);
    });
  }, [handleKeyframeValue, articleRectObserver, animator]);
  return keyframes.length ? adjustedValue : paramValue;
}
