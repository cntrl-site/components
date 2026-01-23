function getPaddingValues(img: HTMLImageElement) {
  const style = window.getComputedStyle(img);
  return {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0
  };
}

export function getDisplayedImageRect(img: HTMLImageElement) {
  const container = img.getBoundingClientRect();
  const padding = getPaddingValues(img);

  const containerW = Math.max(0, container.width - padding.left - padding.right);
  const containerH = Math.max(0, container.height - padding.top - padding.bottom);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const containerRatio = containerW / containerH;
  const imgRatio = imgW / imgH;

  let renderedW, renderedH;

  if (imgRatio > containerRatio) {
    renderedW = containerW;
    renderedH = containerW / imgRatio;
  } else {
    renderedH = containerH;
    renderedW = containerH * imgRatio;
  }

  const contentLeft = container.left + padding.left;
  const contentTop = container.top + padding.top;
  const offsetX = (containerW - renderedW) / 2 + contentLeft;
  const offsetY = (containerH - renderedH) / 2 + contentTop;

  return {
    x: offsetX,
    y: offsetY,
    width: renderedW,
    height: renderedH
  };
}

export function getPaddedContainerBounds(img: HTMLImageElement) {
  const container = img.getBoundingClientRect();
  const padding = getPaddingValues(img);

  return {
    left: container.left + padding.left,
    right: container.right - padding.right,
    top: container.top + padding.top,
    bottom: container.bottom - padding.bottom
  };
}
