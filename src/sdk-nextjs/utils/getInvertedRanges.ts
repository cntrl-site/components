interface Range {
  start: number;
  end: number;
}

/**
 * @param length
 * @param ranges - SORTED array of ranges [start, end)
 */

export function getInvertedRanges(length: number, ranges: Range[]): Range[] {
  if (ranges.length === 0) {
    return [{
      start: 0,
      end: length
    }];
  }
  const inverted: Range[] = [];
  if (ranges[0].start > 0) {
    inverted.push({
      start: 0,
      end: ranges[0].start
    });
  }
  for (let i = 0; i < ranges.length - 1; i += 1) {
    const left = ranges[i];
    const right = ranges[i + 1];
    if (right.start - left.end > 0) {
      inverted.push({
        start: left.end,
        end: right.start
      });
    }
  }
  const lastRange = ranges[ranges.length - 1];
  if (lastRange.end < length) {
    inverted.push({
      start: lastRange.end,
      end: length
    });
  }
  return inverted;
}
