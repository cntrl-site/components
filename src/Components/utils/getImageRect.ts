function getPaddingValues(img: HTMLImageElement) {
  const style = window.getComputedStyle(img);
  return {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  };
}

function parseObjectPositionRatio(value: string): { x: number; y: number } {
  const parts = value.trim().split(/\s+/);

  const parsePart = (part: string): number => {
    if (part.endsWith('%')) {
      return parseFloat(part) / 100;
    }

    switch (part) {
      case 'left':
      case 'top':
        return 0;
      case 'right':
      case 'bottom':
        return 1;
      case 'center':
        return 0.5;
      default:
        return 0.5;
    }
  };

  if (parts.length === 1) {
    const part = parts[0];
    if (part === 'center') return { x: 0.5, y: 0.5 };
    if (part === 'top' || part === 'bottom') return { x: 0.5, y: parsePart(part) };
    if (part === 'left' || part === 'right') return { x: parsePart(part), y: 0.5 };
    return { x: parsePart(part), y: 0.5 };
  }

  return {
    x: parsePart(parts[0]),
    y: parsePart(parts[1]),
  };
}

function getRenderedContainSize(
  containerW: number,
  containerH: number,
  mediaW: number,
  mediaH: number,
) {
  if (!mediaW || !mediaH || !containerW || !containerH) {
    return { renderedW: containerW, renderedH: containerH };
  }

  const containerRatio = containerW / containerH;
  const mediaRatio = mediaW / mediaH;

  if (mediaRatio > containerRatio) {
    const renderedW = containerW;
    return { renderedW, renderedH: renderedW / mediaRatio };
  }

  const renderedH = containerH;
  return { renderedW: renderedH * mediaRatio, renderedH };
}

function getRenderedCoverSize(
  containerW: number,
  containerH: number,
  mediaW: number,
  mediaH: number,
) {
  if (!mediaW || !mediaH || !containerW || !containerH) {
    return { renderedW: containerW, renderedH: containerH };
  }

  const containerRatio = containerW / containerH;
  const mediaRatio = mediaW / mediaH;

  if (mediaRatio > containerRatio) {
    const renderedH = containerH;
    return { renderedW: renderedH * mediaRatio, renderedH };
  }

  const renderedW = containerW;
  return { renderedW, renderedH: renderedW / mediaRatio };
}

function getContainOffsets(
  containerW: number,
  containerH: number,
  renderedW: number,
  renderedH: number,
  objectPosition: string,
) {
  const { x: posX, y: posY } = parseObjectPositionRatio(objectPosition);

  return {
    offsetX: posX * (containerW - renderedW),
    offsetY: posY * (containerH - renderedH),
  };
}

function getMediaScaleTransformOrigin(
  media: HTMLImageElement | HTMLVideoElement,
): string {
  const container = media.getBoundingClientRect();
  const containerW = container.width;
  const containerH = container.height;

  if (!containerW || !containerH) {
    return 'center center';
  }

  const mediaW = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
  const mediaH = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
  const { objectFit, objectPosition } = window.getComputedStyle(media);
  const getRenderedSize = objectFit === 'cover'
    ? getRenderedCoverSize
    : getRenderedContainSize;
  const { renderedW, renderedH } = getRenderedSize(containerW, containerH, mediaW, mediaH);
  const { offsetX, offsetY } = getContainOffsets(
    containerW,
    containerH,
    renderedW,
    renderedH,
    objectPosition,
  );

  const originX = ((offsetX + renderedW / 2) / containerW) * 100;
  const originY = ((offsetY + renderedH / 2) / containerH) * 100;

  return `${originX}% ${originY}%`;
}

export function getContainedMediaTransformOrigin(
  media: HTMLImageElement | HTMLVideoElement,
): string {
  return getMediaScaleTransformOrigin(media);
}

export function getDisplayedImageRect(img: HTMLImageElement) {
  const container = img.getBoundingClientRect();
  const padding = getPaddingValues(img);

  const containerW = Math.max(0, container.width - padding.left - padding.right);
  const containerH = Math.max(0, container.height - padding.top - padding.bottom);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const { renderedW, renderedH } = getRenderedContainSize(containerW, containerH, imgW, imgH);
  const objectPosition = window.getComputedStyle(img).objectPosition;
  const { offsetX, offsetY } = getContainOffsets(
    containerW,
    containerH,
    renderedW,
    renderedH,
    objectPosition,
  );

  const contentLeft = container.left + padding.left;
  const contentTop = container.top + padding.top;

  return {
    x: offsetX + contentLeft,
    y: offsetY + contentTop,
    width: renderedW,
    height: renderedH,
  };
}

export function getPaddedContainerBounds(img: HTMLImageElement) {
  const container = img.getBoundingClientRect();
  const padding = getPaddingValues(img);

  return {
    left: container.left + padding.left,
    right: container.right - padding.right,
    top: container.top + padding.top,
    bottom: container.bottom - padding.bottom,
  };
}
