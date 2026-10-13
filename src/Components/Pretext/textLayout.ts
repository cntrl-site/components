import type React from 'react';
import { BAND_SLACK, spansForBand, subtractSpan } from './rings';
import type { Align, Ring, RichBlock, RichLeaf, RichLink, RichNode, Span } from './Pretext';
import { normalizeFontFamilyCssValue } from '../utils/textStylesToCss';

const MAX_LINES = 4000;
const SAFE_HREF_PROTOCOL = /^(?:https?:|mailto:|tel:)/i;

export type Token = {
  text: string;
  leaf: RichLeaf;
  href?: string;
  target?: string;
  para: number;
};

export function isLinkNode(node: RichNode): node is RichLink {
  return !!node && typeof node === 'object' && (node as RichLink).type === 'link';
}

export function sanitizeHref(href?: string): string | undefined {
  if (!href) return undefined;
  const cleaned = href.replace(/\s+/g, '');
  if (/^[a-z][a-z0-9+.-]*:/i.test(cleaned) && !SAFE_HREF_PROTOCOL.test(cleaned)) return undefined;
  return cleaned;
}

export function tokenize(blocks: RichBlock[]): Token[] {
  const tokens: Token[] = [];
  blocks.forEach((block, para) => {
    const walk = (nodes: RichNode[], href?: string, target?: string) => {
      for (const node of nodes) {
        if (isLinkNode(node)) {
          walk(node.children ?? [], sanitizeHref(node.value), node.target);
          continue;
        }
        const leaf = node as RichLeaf;
        const text = leaf?.text ?? '';
        if (!text.trim()) continue;
        for (const word of text.split(/\s+/)) {
          if (!word) continue;
          tokens.push({ text: word, leaf, href, target, para });
        }
      }
    };
    walk(block?.children ?? []);
  });
  return tokens;
}

export function getLeafCss(leaf: RichLeaf): React.CSSProperties {
  return {
    ...(leaf.fontFamily && { fontFamily: normalizeFontFamilyCssValue(leaf.fontFamily) }),
    ...(leaf.fontWeight && { fontWeight: leaf.fontWeight }),
    ...(leaf.fontStyle && { fontStyle: leaf.fontStyle }),
    ...(leaf.textDecoration && { textDecoration: leaf.textDecoration }),
    ...(leaf.textTransform && { textTransform: leaf.textTransform as React.CSSProperties['textTransform'] }),
    ...(leaf.fontVariant && { fontVariant: leaf.fontVariant }),
    ...(leaf.verticalAlign && { verticalAlign: leaf.verticalAlign as React.CSSProperties['verticalAlign'], lineHeight: '0px' }),
  };
}

export function getPlainText(blocks: RichBlock[]): string[] {
  return blocks.map((block) => {
    const parts: string[] = [];
    const walk = (nodes: RichNode[]) => {
      for (const node of nodes) {
        if (isLinkNode(node)) {
          walk(node.children ?? []);
          continue;
        }
        parts.push((node as RichLeaf)?.text ?? '');
      }
    };
    walk(block?.children ?? []);
    return parts.join('');
  });
}

export type Segment = {
  top: number;
  left: number;
  width: number;
  from: number;
  to: number;
  justify: boolean;
};

export type LayoutResult = {
  segments: Segment[];
  placed: number;
  height: number;
  capLeft: number;
  capTop: number;
  renderTokens: Token[];
};

export type LayoutParams = {
  tokens: Token[];
  widths: number[];
  spaceWidth: number;
  lineHeight: number;
  width: number;
  height: number;
  rings: Ring[];
  mode: 'contain' | 'avoid';
  align: Align;
  scale: number;
  allowOverflow: boolean;
  capInset: number;
  capLines: number;
  hyphenate?: boolean;
  charWidths?: (number[] | undefined)[];
  hyphenPoints?: (number[] | undefined)[];
  hyphenWidth?: number;
  shapeMargin?: number;
  columns?: number;
  columnGap?: number;
};

// Offsets the shape's own ring outward (avoid mode) or inward (contain mode) by
// `margin` pixels — a true geometric offset (radiating from each ring's own
// bbox center) rather than a box-edge inset, so the resulting "shape margin" is
// even on every side of the shape itself, whether or not the shape happens to
// touch the box's outer edge. Done once in pixel space (not on the normalized
// 0..1 ring data) so it stays circular/uniform even when width !== height.
function offsetRingsForMargin(
  rings: Ring[],
  margin: number,
  width: number,
  height: number,
  mode: 'contain' | 'avoid',
): Ring[] {
  if (margin <= 0 || !rings.length || width <= 0 || height <= 0) return rings;
  const sign = mode === 'avoid' ? 1 : -1;
  return rings.map((ring) => {
    if (!ring.length) return ring;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of ring) {
      const px = p.x * width;
      const py = p.y * height;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return ring.map((p) => {
      const px = p.x * width;
      const py = p.y * height;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1e-6) return p;
      const nextDist = Math.max(0, dist + sign * margin);
      const scale = nextDist / dist;
      return { x: (cx + dx * scale) / width, y: (cy + dy * scale) / height };
    });
  });
}

// Lines at least this share of a column's widest line may break a word that
// is too wide for the column.
const WIDE_LINE_RATIO = 0.75;

type QueueItem = {
  token: Token;
  originalIndex: number;
  width: number;
  kind: 'whole' | 'fragment' | 'remainder';
  // Chars of the original token already placed on earlier lines.
  offset: number;
};

type Split = {
  chars: number;
  fragmentText: string;
  remainderText: string;
  fragmentWidth: number;
  remainderWidth: number;
};

// Splits the item at the last break that fits `budget`. With `points` (the
// token's dictionary hyphenation points, as offsets into the original word)
// only those are tried and a hyphen is added unless the break follows an
// existing one. Without them it is the break-word fallback: any char, no
// hyphen. A remainder can split again, so a word may run over several lines.
function trySplit(
  item: QueueItem,
  cw: number[] | undefined,
  points: number[] | undefined,
  budget: number,
  scale: number,
  hyphenWidth: number,
): Split | null {
  if (item.kind === 'fragment' || !cw) return null;
  const text = item.token.text;
  const consumed = item.offset > 0 ? cw[item.offset - 1] : 0;
  const candidates = points
    // Points are checked against the whole word; a remainder also keeps at
    // least two of its own chars before a hyphen, so no lone "R-" lines.
    ? points.map(point => point - item.offset).filter(k => k >= (item.offset > 0 ? 2 : 1) && k < text.length)
    : Array.from({ length: text.length - 1 }, (_, index) => index + 1);

  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const k = candidates[index];
    if (item.offset + k > cw.length) continue;
    const hyphen = Boolean(points) && text[k - 1] !== '-';
    const prefixWidth = cw[item.offset + k - 1] - consumed;
    const fragmentWidth = prefixWidth + (hyphen ? hyphenWidth : 0);
    if (fragmentWidth * scale > budget) continue;
    return {
      chars: k,
      fragmentText: hyphen ? `${text.slice(0, k)}-` : text.slice(0, k),
      remainderText: text.slice(k),
      fragmentWidth,
      remainderWidth: Math.max(0, item.width - prefixWidth),
    };
  }
  return null;
}

export function layoutText(params: LayoutParams): LayoutResult {
  const {
    tokens, widths, rings, mode, align, scale,
    width, height, allowOverflow, capInset, capLines,
  } = params;
  const hyphenate = Boolean(params.hyphenate);
  const charWidths = params.charWidths ?? [];
  const hyphenPoints = params.hyphenPoints ?? [];
  const hyphenWidth = params.hyphenWidth ?? 0;
  const lineHeight = params.lineHeight * scale;
  const spaceWidth = params.spaceWidth * scale;
  const shapeMargin = Math.max(0, params.shapeMargin ?? 0);
  const segments: Segment[] = [];

  const queue: QueueItem[] = tokens.map((token, originalIndex) => ({
    token,
    originalIndex,
    width: widths[originalIndex],
    kind: 'whole' as const,
    offset: 0,
  }));

  if (!queue.length || width <= 0 || lineHeight <= 0) {
    return { segments, placed: 0, height: 0, capLeft: 0, capTop: 0, renderTokens: tokens };
  }

  const minSegment = Math.max(1, spaceWidth * 0.5);
  const slack = lineHeight * BAND_SLACK;
  const marginRings = offsetRingsForMargin(rings, shapeMargin, width, height, mode);
  const columnCount = Math.max(1, Math.floor(params.columns ?? 1));
  const columnGap = columnCount > 1 ? Math.max(0, params.columnGap ?? 0) : 0;
  const columnWidth = (width - columnGap * (columnCount - 1)) / columnCount;
  let index = 0;
  let maxY = 0;
  let line = 0;
  let capLeft = 0;
  let capTop = 0;
  let capFirstLine: number | null = null;

  const bandSpans = (top: number, left: number, right: number): Span[] => (
    spansForBand(marginRings, (top + slack) / height, (top + lineHeight - slack) / height, mode)
      .map(span => ({ x0: Math.max(left, span.x0 * width), x1: Math.min(right, span.x1 * width) }))
      .filter(span => span.x1 > span.x0)
  );

  // Columns are vertical strips of the box: the shape is shared, each strip
  // takes the part of every band that falls inside it, and text fills the
  // strips left to right. Only the last strip may run past the box bottom.
  for (let column = 0; column < columnCount && index < queue.length && columnWidth > 0; column += 1) {
    const columnLeft = column * (columnWidth + columnGap);
    const columnRight = columnLeft + columnWidth;
    const columnOverflows = allowOverflow && column === columnCount - 1;
    // The widest line the shape leaves inside this column. A word too wide
    // for any column breaks only on lines near that width, never in a sliver
    // at the shape's edge.
    let columnWidest = 0;
    for (let bandTop = 0; bandTop + lineHeight <= height; bandTop += lineHeight) {
      for (const span of bandSpans(bandTop, columnLeft, columnRight)) {
        columnWidest = Math.max(columnWidest, span.x1 - span.x0);
      }
    }
    let previousPara = queue[index].token.para;
    let y = 0;

    while (index < queue.length && line < MAX_LINES) {
      const beyondShape = y + lineHeight > height;
      if (beyondShape && !columnOverflows) break;

      const para = queue[index].token.para;
      if (para > previousPara + 1) {
        y += lineHeight * (para - previousPara - 1);
        previousPara = para - 1;
        line += 1;
        continue;
      }

      let spans: Span[] = beyondShape
        ? [{ x0: columnLeft, x1: columnRight }]
        : bandSpans(y, columnLeft, columnRight);

      if (capInset > 0 && capLines > 0 && column === 0 && !beyondShape && spans.length) {
        if (capFirstLine === null) {
          capFirstLine = line;
          capLeft = spans[0].x0;
          capTop = y;
        }
        if (line - capFirstLine < capLines) {
          spans = subtractSpan(spans, { x0: capLeft, x1: capLeft + capInset });
        }
      }

      const widest = spans.reduce((max, span) => Math.max(max, span.x1 - span.x0), 0);

      for (const span of spans) {
        const available = span.x1 - span.x0;
        if (available < minSegment) continue;
        if (index >= queue.length || queue[index].token.para !== para) break;

        const start = index;
        let used = 0;
        while (index < queue.length && queue[index].token.para === para) {
          const item = queue[index];
          const isFirst = index === start;
          const tokenWidth = item.width * scale;
          const advance = isFirst ? tokenWidth : spaceWidth + tokenWidth;

          if (used + advance <= available) {
            used += advance;
            index += 1;
            continue;
          }

          const budget = available - used - (isFirst ? 0 : spaceWidth);
          // Wider than a whole column: no line anywhere can hold it, so it must
          // break. Narrower words just move on to a wider line or column.
          const tooWide = isFirst && tokenWidth > columnWidth - 0.5;
          const wideLine = available >= widest - 0.5 && available >= columnWidest * WIDE_LINE_RATIO;
          const cw = charWidths[item.originalIndex];
          const points = hyphenPoints[item.originalIndex];
          // Dictionary break first; a word too wide for any column then falls
          // back to breaking at any char, so it never spills into the next one.
          const split = (hyphenate && points ? trySplit(item, cw, points, budget, scale, hyphenWidth) : null)
            ?? (tooWide && wideLine ? trySplit(item, cw, undefined, budget, scale, hyphenWidth) : null);
          if (split) {
            const fragment: QueueItem = {
              token: { ...item.token, text: split.fragmentText },
              originalIndex: item.originalIndex,
              width: split.fragmentWidth,
              kind: 'fragment',
              offset: item.offset,
            };
            const remainder: QueueItem = {
              token: { ...item.token, text: split.remainderText },
              originalIndex: item.originalIndex,
              width: split.remainderWidth,
              kind: 'remainder',
              offset: item.offset + split.chars,
            };
            queue.splice(index, 1, fragment, remainder);
            used += (isFirst ? 0 : spaceWidth) + split.fragmentWidth * scale;
            index += 1;
            break;
          }

          // Not even one char fits. With a single column the box clips it, so
          // place it whole rather than drop the rest of the text; with several
          // it would run over the next column, so skip the line instead.
          if (tooWide && columnCount === 1 && available >= columnWidest - 0.5) {
            used += advance;
            index += 1;
            continue;
          }
          break;
        }

        if (index > start) {
          const paragraphEnded = index >= queue.length || queue[index].token.para !== para;
          segments.push({
            top: y,
            left: span.x0,
            width: available,
            from: start,
            to: index,
            justify: align === 'justify' && !paragraphEnded,
          });
        }

        if (index >= queue.length || queue[index].token.para !== para) break;
      }

      previousPara = para;
      y += lineHeight;
      line += 1;
    }

    maxY = Math.max(maxY, y);
  }

  let placed = 0;
  if (index > 0) {
    const last = queue[index - 1];
    placed = last.kind === 'fragment' ? last.originalIndex : last.originalIndex + 1;
  }

  return {
    segments,
    placed,
    height: segments.length ? maxY : 0,
    capLeft,
    capTop,
    renderTokens: queue.map(item => item.token),
  };
}
