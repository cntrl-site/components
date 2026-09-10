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
};

export function layoutText(params: LayoutParams): LayoutResult {
  const {
    tokens, widths, rings, mode, align, scale,
    width, height, allowOverflow, capInset, capLines,
  } = params;
  const lineHeight = params.lineHeight * scale;
  const spaceWidth = params.spaceWidth * scale;
  const segments: Segment[] = [];

  if (!tokens.length || width <= 0 || lineHeight <= 0) {
    return { segments, placed: 0, height: 0, capLeft: 0, capTop: 0 };
  }

  const minSegment = Math.max(1, spaceWidth * 0.5);
  const slack = lineHeight * BAND_SLACK;
  let index = 0;
  let y = 0;
  let line = 0;
  let previousPara = tokens[0].para;
  let capLeft = 0;
  let capTop = 0;
  let capFirstLine: number | null = null;

  while (index < tokens.length && line < MAX_LINES) {
    const beyondShape = y + lineHeight > height;
    if (beyondShape && !allowOverflow) break;

    const para = tokens[index].para;
    if (para > previousPara + 1) {
      y += lineHeight * (para - previousPara - 1);
      previousPara = para - 1;
      line += 1;
      continue;
    }

    let spans: Span[] = beyondShape
      ? [{ x0: 0, x1: width }]
      : spansForBand(rings, (y + slack) / height, (y + lineHeight - slack) / height, mode)
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
      if (index >= tokens.length || tokens[index].para !== para) break;

      const start = index;
      let used = 0;
      while (index < tokens.length && tokens[index].para === para) {
        const tokenWidth = widths[index] * scale;
        const advance = index === start ? tokenWidth : spaceWidth + tokenWidth;
        if (used + advance > available) {
          const unbreakable = index === start && available >= widest - 0.5 && tokenWidth > width - 0.5;
          if (!unbreakable) break;
        }
        used += advance;
        index += 1;
      }

      if (index > start) {
        const paragraphEnded = index >= tokens.length || tokens[index].para !== para;
        segments.push({
          top: y,
          left: span.x0,
          width: available,
          from: start,
          to: index,
          justify: align === 'justify' && !paragraphEnded,
        });
      }

      if (index >= tokens.length || tokens[index].para !== para) break;
    }

    previousPara = para;
    y += lineHeight;
    line += 1;
  }

  return { segments, placed: index, height: segments.length ? y : 0, capLeft, capTop };
}
