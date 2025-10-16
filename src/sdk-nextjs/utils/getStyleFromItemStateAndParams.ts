export function getStyleFromItemStateAndParams<T>(
  stateValue: T | undefined,
  paramsValue: T | undefined
): T | undefined {
  return (stateValue as T) !== undefined
    ? stateValue as T
    : paramsValue;
}
