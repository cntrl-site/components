type CompareFn<L, R> = (lhs: L, rhs: R) => number;
type InsertStrategy<T> = (list: T[], item: T, compare: CompareFn<T, T>) => number;

export function binSearchInsertAt<T, K>(list: T[], item: K, compare: CompareFn<K, T>): number {
  switch (list.length) {
    case 0: return 0;
    case 1: return compare(item, list[0]) < 0 ? 0 : 1;
  }
  let start = 0;
  let end = list.length;
  let pivot: number;
  let cmpResult: number;
  while (start < end) {
    pivot = start + Math.floor((end - start) / 2);
    cmpResult = compare(item, list[pivot]);
    if (cmpResult === 0) return pivot + 1;
    if (cmpResult < 0) {
      end = pivot;
    }
    if (cmpResult > 0) {
      start = pivot + 1;
    }
  }
  if (start >= list.length) return list.length;
  return compare(item, list[start]) < 0 ? start : start + 1;
}

export function createInsert<T>(start: InsertStrategy<T>, compare: CompareFn<T, T>): (list: T[], item: T) => void {
  return (list: T[], item: T): void => {
    const pos = start(list, item, compare);
    list.splice(pos, 0, item);
  };
}
