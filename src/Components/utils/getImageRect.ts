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
    // Image is wider → width fits, height is reduced
    renderedW = containerW;
    renderedH = containerW / imgRatio;
  } else {
    // Image is taller → height fits, width is reduced
    renderedH = containerH;
    renderedW = containerH * imgRatio;
  }

  // Centered inside container
  const offsetX = (containerW - renderedW) / 2 + container.left;
  const offsetY = (containerH - renderedH) / 2 + container.top;

  return {
    x: offsetX,
    y: offsetY,
    width: renderedW,
    height: renderedH
  };
}
