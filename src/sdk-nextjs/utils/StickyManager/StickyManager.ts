export type TSticky = { from: number; to?: number; } | null;

export class StickyManager {
  constructor(
    private sticky: TSticky
  ) {}

  getIsSticky(scroll: number): boolean {
    if (!this.sticky) return false;
    return (this.sticky.from <= scroll) && (!this.sticky.to || this.sticky.to >= scroll);
  }

  getPosition(scroll: number, top: number): number {
    if (!this.sticky) return top;
    if (this.getIsSticky(scroll)) {
      return top - this.sticky.from;
    }
    if (this.sticky.to !== undefined && this.sticky.to <= scroll) {
      return top + this.sticky.to - this.sticky.from;
    }
    return top;
  }
}
