import { AreaAnchor, DimensionMode } from '../../sdk/types/article/ItemArea';

const positionMatrix: Record<AreaAnchor, [number, number]> = {
  [AreaAnchor.TopLeft]: [0, 0],
  [AreaAnchor.TopCenter]: [0, 0.5],
  [AreaAnchor.TopRight]: [0, 1],
  [AreaAnchor.MiddleLeft]: [0.5, 0],
  [AreaAnchor.MiddleCenter]: [0.5, 0.5],
  [AreaAnchor.MiddleRight]: [0.5, 1],
  [AreaAnchor.BottomLeft]: [1, 0],
  [AreaAnchor.BottomCenter]: [1, 0.5],
  [AreaAnchor.BottomRight]: [1, 1]
};

export function getCompoundHeight(compoundSettings: CompoundSettings | undefined, height: number | undefined) {
  if (height === undefined || !compoundSettings) return;
  if (compoundSettings.heightMode === 'relative') {
    return `${height * 100}%`;
  }
  return `${height * 100}vw`;
}

export function getCompoundWidth(compoundSettings: CompoundSettings | undefined, width: number | undefined, isRichText: boolean, exemplary?: number) {
  if (width === undefined || !compoundSettings) return;
  if (compoundSettings.widthMode === 'relative') {
    return `${width * 100}%`;
  }
  return isRichText && exemplary ? `${width * exemplary}px` : `${width * 100}vw`;
}

export function getCompoundTop(compoundSettings: CompoundSettings | undefined, top: number | undefined) {
  if (top === undefined || !compoundSettings) return;
  if (compoundSettings.heightMode === 'relative') {
    return `${top * 100}%`;
  }
  const [ky] = positionMatrix[compoundSettings.positionAnchor];
  return `calc(${ky * 100}% + ${top * 100}vw)`;
}

export function getCompoundLeft(compoundSettings: CompoundSettings | undefined, left: number | undefined) {
  if (left === undefined || !compoundSettings) return;
  if (compoundSettings.widthMode === 'relative') {
    return `${left * 100}%`;
  }
  const [_, kx] = positionMatrix[compoundSettings.positionAnchor];
  return `calc(${kx * 100}% + ${left * 100}vw)`;
}

export function getCompoundTransform(compoundSettings: CompoundSettings | undefined) {
  if (!compoundSettings) return 'unset';
  const areaAnchor = compoundSettings.positionAnchor as AreaAnchor;
  const [ky, kx] = positionMatrix[areaAnchor];
  return `translate(${kx * (-100)}%, ${ky * (-100)}%)`;
}

type CompoundSettings = {
  positionAnchor: AreaAnchor;
  widthMode: DimensionMode;
  heightMode: DimensionMode;
};
