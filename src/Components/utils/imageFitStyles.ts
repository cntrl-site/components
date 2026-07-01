export type ImageRatioFit = {
  display: 'fit' | 'cover';
  ratioValue: '1:1' | '2:3' | '3:4' | '4:5' | '16:9';
  reversed: boolean;
};

export const isImageRatioCover = (fit: ImageRatioFit): boolean => fit.display === 'cover';

export const getAspectRatio = (fit: ImageRatioFit): string => {
  const ratioValue = fit.ratioValue ?? '1:1';
  const ratioReversed = fit.reversed ?? false;
  const [rW, rH] = ratioValue.split(':').map(Number);
  const effW = ratioReversed ? rH : rW;
  const effH = ratioReversed ? rW : rH;
  return `${effW} / ${effH}`;
};
