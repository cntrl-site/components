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
  hyphenWidth?: number;
  shapeMargin?: number;
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

const MIN_HYPHEN_PREFIX = 2;
const MIN_HYPHEN_SUFFIX = 2;

type QueueItem = {
  token: Token;
  originalIndex: number;
  width: number;
  kind: 'whole' | 'fragment' | 'remainder';
};

function tryHyphenate(
  item: QueueItem,
  charWidths: (number[] | undefined)[],
  budget: number,
  scale: number,
  hyphenWidth: number,
): { fragmentText: string; remainderText: string; fragmentWidth: number; remainderWidth: number } | null {
  if (item.kind !== 'whole') return null;
  const cw = charWidths[item.originalIndex];
  const text = item.token.text;
  if (!cw || text.length < MIN_HYPHEN_PREFIX + MIN_HYPHEN_SUFFIX) return null;

  const maxK = Math.min(cw.length - MIN_HYPHEN_SUFFIX, text.length - MIN_HYPHEN_SUFFIX);
  let bestK = -1;
  for (let k = maxK; k >= MIN_HYPHEN_PREFIX; k -= 1) {
    const w = cw[k - 1] * scale + hyphenWidth * scale;
    if (w <= budget) {
      bestK = k;
      break;
    }
  }
  if (bestK < MIN_HYPHEN_PREFIX) return null;

  return {
    fragmentText: `${text.slice(0, bestK)}-`,
    remainderText: text.slice(bestK),
    fragmentWidth: cw[bestK - 1] + hyphenWidth,
    remainderWidth: Math.max(0, item.width - cw[bestK - 1]),
  };
}

export function layoutText(params: LayoutParams): LayoutResult {
  const {
    tokens, widths, rings, mode, align, scale,
    width, height, allowOverflow, capInset, capLines,
  } = params;
  const hyphenate = Boolean(params.hyphenate);
  const charWidths = params.charWidths ?? [];
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
  }));

  if (!queue.length || width <= 0 || lineHeight <= 0) {
    return { segments, placed: 0, height: 0, capLeft: 0, capTop: 0, renderTokens: tokens };
  }

  const minSegment = Math.max(1, spaceWidth * 0.5);
  const slack = lineHeight * BAND_SLACK;
  const marginRings = offsetRingsForMargin(rings, shapeMargin, width, height, mode);
  let index = 0;
  let y = 0;
  let line = 0;
  let previousPara = queue[0].token.para;
  let capLeft = 0;
  let capTop = 0;
  let capFirstLine: number | null = null;

  while (index < queue.length && line < MAX_LINES) {
    const beyondShape = y + lineHeight > height;
    if (beyondShape && !allowOverflow) break;

    const para = queue[index].token.para;
    if (para > previousPara + 1) {
      y += lineHeight * (para - previousPara - 1);
      previousPara = para - 1;
      line += 1;
      continue;
    }

    let spans: Span[] = beyondShape
      ? [{ x0: 0, x1: width }]
      : spansForBand(marginRings, (y + slack) / height, (y + lineHeight - slack) / height, mode)
        .map(span => ({ x0: span.x0 * width, x1: span.x1 * width }));

    if (capInset > 0 && capLines > 0 && !beyondShape && spans.length) {
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

        const unbreakable = isFirst && available >= widest - 0.5 && tokenWidth > width - 0.5;
        if (unbreakable) {
          used += advance;
          index += 1;
          continue;
        }

        if (hyphenate) {
          const budget = available - used - (isFirst ? 0 : spaceWidth);
          const split = tryHyphenate(item, charWidths, budget, scale, hyphenWidth);
          if (split) {
            const fragment: QueueItem = {
              token: { ...item.token, text: split.fragmentText },
              originalIndex: item.originalIndex,
              width: split.fragmentWidth,
              kind: 'fragment',
            };
            const remainder: QueueItem = {
              token: { ...item.token, text: split.remainderText },
              originalIndex: item.originalIndex,
              width: split.remainderWidth,
              kind: 'remainder',
            };
            queue.splice(index, 1, fragment, remainder);
            used += (isFirst ? 0 : spaceWidth) + split.fragmentWidth * scale;
            index += 1;
          }
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

  let placed = 0;
  if (index > 0) {
    const last = queue[index - 1];
    placed = last.kind === 'fragment' ? last.originalIndex : last.originalIndex + 1;
  }

  return {
    segments,
    placed,
    height: segments.length ? y : 0,
    capLeft,
    capTop,
    renderTokens: queue.map(item => item.token),
  };
}
