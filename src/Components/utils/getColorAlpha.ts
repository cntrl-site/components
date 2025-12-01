export function getColorAlpha(color: string): number {
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
  if (rgbaMatch) {
    const values = rgbaMatch[1].split(',').map(v => parseFloat(v.trim()));
    if (values.length === 4) {
      return values[3];
    }
    return 1;
  }
  
  const hexMatch = color.match(/^#([0-9a-fA-F]{8})$/);
  if (hexMatch) {
    const alphaHex = hexMatch[1].substring(6, 8);
    return parseInt(alphaHex, 16) / 255;
  }
  if (color.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
    return 1;
  }
  
  return 1;
};
