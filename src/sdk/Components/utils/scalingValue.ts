export function scalingValue(value: number, isEditor: boolean = false) {
  return isEditor ? `calc(var(--cntrl-article-width) * ${value})` : `${value * 100}vw`;
}
