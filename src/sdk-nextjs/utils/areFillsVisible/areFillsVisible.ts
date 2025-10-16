import { CntrlColor } from '@cntrl-site/color';

export function areFillsVisible(fills: FillLayer[]) {
  return fills.some(fill => {
    switch (fill.type) {
      case 'solid':
        return CntrlColor.parse(fill.value).getAlpha() !== 0;
      case 'linear-gradient':
        return fill.colors.some(color => CntrlColor.parse(color.value).getAlpha() !== 0);
      case 'radial-gradient':
        return fill.colors.some(color => CntrlColor.parse(color.value).getAlpha() !== 0);
      case 'conic-gradient':
        return fill.colors.some(color => CntrlColor.parse(color.value).getAlpha() !== 0);
      case 'image':
        return fill.opacity !== 0;
      default:
        return true;
    }
  });
}

export type FillLayer = {
  type: 'solid';
  value: string;
} | {
  type: 'linear-gradient';
  colors: { value: string; }[];
} | {
  type: 'radial-gradient';
  colors: { value: string; }[];
} | {
  type: 'conic-gradient';
  colors: { value: string; }[];
} | {
  type: 'image';
  opacity: number;
}
