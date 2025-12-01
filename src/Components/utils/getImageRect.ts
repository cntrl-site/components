export function getDisplayedImageRect(img: HTMLImageElement) {
  const container = img.getBoundingClientRect();
  const containerW = container.width;
  const containerH = container.height;
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

  const offsetX = (containerW - renderedW) / 2 + container.left;
  const offsetY = (containerH - renderedH) / 2 + container.top;

  return {
    x: offsetX,
    y: offsetY,
    width: renderedW,
    height: renderedH
  };
}
