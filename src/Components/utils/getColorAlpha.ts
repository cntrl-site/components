function parseAlphaToken(token: string): number {
  const trimmed = token.trim();
  if (!trimmed || trimmed === 'none') return 1;
  if (trimmed.endsWith('%')) {
    const value = parseFloat(trimmed);
    return Number.isFinite(value) ? value / 100 : 1;
  }
  const value = parseFloat(trimmed);
  return Number.isFinite(value) ? value : 1;
}

function parseSlashAlpha(inner: string): number | undefined {
  const slashIndex = inner.lastIndexOf('/');
  if (slashIndex === -1) return undefined;
  return parseAlphaToken(inner.slice(slashIndex + 1));
}

export function getColorAlpha(color: string): number {
  const value = color.trim().toLowerCase();
  if (!value || value === 'transparent') return 0;

  const functionalMatch = value.match(/^(?:oklch|oklab|rgba?|hsla?|hwb|lab|lch|color)\((.+)\)$/);
  if (functionalMatch) {
    const inner = functionalMatch[1];
    const slashAlpha = parseSlashAlpha(inner);
    if (slashAlpha !== undefined) return slashAlpha;
    if (/^(?:rgba|hsla)$/.test(value.slice(0, 4))) {
      const values = inner.split(',').map(part => parseFloat(part.trim()));
      if (values.length === 4 && Number.isFinite(values[3])) {
        return values[3];
      }
    }
    return 1;
  }

  const hexMatch = value.match(/^#([0-9a-f]{4}|[0-9a-f]{8})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const alphaHex = hex.length === 4 ? hex[3] + hex[3] : hex.slice(6, 8);
    return parseInt(alphaHex, 16) / 255;
  }

  return 1;
}
