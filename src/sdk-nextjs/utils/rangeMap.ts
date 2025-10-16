export function rangeMap(
  n: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
  withinBounds: boolean = false
): number {
  const mapped = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if (withinBounds && n < start1) return start2;
  if (withinBounds && n > stop1) return stop2;
  return mapped;
}
