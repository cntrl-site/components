export function getDisplayedImageRect(img: HTMLImageElement) {
  const container = img.getBoundingClientRect();
  const style = window.getComputedStyle(img);
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const paddingLeft = parseFloat(style.paddingLeft) || 0;

  const containerW = Math.max(0, container.width - paddingLeft - paddingRight);
  const containerH = Math.max(0, container.height - paddingTop - paddingBottom);
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

  const contentLeft = container.left + paddingLeft;
  const contentTop = container.top + paddingTop;
  const offsetX = (containerW - renderedW) / 2 + contentLeft;
  const offsetY = (containerH - renderedH) / 2 + contentTop;

  return {
    x: offsetX,
    y: offsetY,
    width: renderedW,
    height: renderedH
  };
}
