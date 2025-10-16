import { CSSPropertyNameMap } from './CSSPropertyNameMap';

export function getTransition(
  state: Record<string, StateInfo>,
  keys: string[]
): string {
  if (Object.keys(state).length === 0) return 'none';
  const transitions = [];
  for (const [key, params] of Object.entries(state)) {
    if (!keys.includes(key) || !params.transition) continue;
    const { transition: { duration, delay, timing } } = params;
    const cssKey = CSSPropertyNameMap[key]!;
    const nonZeroDuration = Math.max(duration, 0.01);
    transitions.push(`${cssKey} ${nonZeroDuration}ms ${timing} ${delay}ms`);
  }
  return transitions.length > 0
    ? transitions.join(', ')
    : 'none';
}

type StateInfo = {
  transition?: {
    duration: number;
    delay: number;
    timing: string;
  };
};
