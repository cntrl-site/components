import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import styles from './ImageRevealSlider.module.scss';

interface ImageRevealSliderProps {
  settings: ImageRevealSliderSettings;
  content: ImageRevealSliderItem[];
  isEditor?: boolean;
};

type RandomRange = {
  min: number;
  max: number;
};

type ImageRevealSliderImageSize = {
  sizeType: 'as Is' | 'custom' | 'random';
  imageWidth: number;
  randomRangeImageWidth: RandomRange;
};

type ImageRevealSliderCursor = {
  cursorType: 'system' | 'custom';
  defaultCursor: string | null;
  hoverCursor: string | null;
};

type ImageRevealSliderPosition = {
  revealPosition: 'random' | 'same' | 'on Click';
  visible: 'all' | 'last One';
  target: 'area' | 'image';
};

type ImageRevealSliderSettings = {
  imageSize: ImageRevealSliderImageSize;
  cursor: ImageRevealSliderCursor;
  position: ImageRevealSliderPosition;
};

type ImageRevealSliderItem = {
  image: {
    url: string;
    name: string;
  };
  link: string;
};

interface PlacedImage {
  id: number;
  url: string;
  link: string;
  name: string;
  x: number;
  y: number;
  width?: string;
};

function isMouseOverImage(mouseX: number, mouseY: number, placedImages: PlacedImage[]) {
  for (const img of placedImages) {
    const imgEl = new Image();
    imgEl.src = img.url;

    const imgWidth = img.width ? Number.parseFloat(img.width) : imgEl.naturalWidth;
    const imgHeight = imgEl.naturalHeight / imgEl.naturalWidth * imgWidth;

    const halfW = imgWidth / 2;
    const halfH = imgHeight / 2;

    if (
      mouseX >= img.x - halfW
      && mouseX <= img.x + halfW
      && mouseY >= img.y - halfH
      && mouseY <= img.y + halfH
    ) {
      return true;
    }
  }
  return false;
}

function getImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
  });
}

async function calculateImageWidthHeight(
  imgUrl: string,
  sizeType: 'as Is' | 'custom' | 'random',
  customWidth: number,
  randomRange: RandomRange
): Promise<{ width: number; height: number; finalWidth: string }> {
  let width: number;
  let height: number;

  if (sizeType === 'custom') {
    width = customWidth;
    const size = await getImageSize(imgUrl);
    height = (size.height / size.width) * width;
  } else if (sizeType === 'random') {
    width = Math.random() * (randomRange.max - randomRange.min) + randomRange.min;
    const size = await getImageSize(imgUrl);
    height = (size.height / size.width) * width;
  } else {
    const size = await getImageSize(imgUrl);
    width = size.width;
    height = size.height;
  }

  return { width, height, finalWidth: `${width}px` };
}

export function ImageRevealSlider({ settings, content, isEditor }: ImageRevealSliderProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const [counter, setCounter] = useState(0);
  const imageIdCounter = useRef(0);
  const defaultImageCount = 1;

  const { sizeType, imageWidth: customWidth, randomRangeImageWidth: randomRange } = settings.imageSize;
  const { revealPosition, visible, target } = settings.position;
  const { cursorType, defaultCursor, hoverCursor } = settings.cursor;

  const createNewImage = async (
    imgData: ImageRevealSliderItem,
    containerWidth: number,
    containerHeight: number,
    position: { x?: number; y?: number } = {}
  ): Promise<PlacedImage> => {
    const { width, height, finalWidth } = await calculateImageWidthHeight(
      imgData.image.url,
      sizeType,
      customWidth,
      randomRange
    );

    let x = 0, y = 0;
    if (revealPosition === 'same') {
      x = containerWidth / 2;
      y = containerHeight / 2;
    } else {
      x = position.x ?? Math.random() * containerWidth;
      y = position.y ?? Math.random() * containerHeight;
    }

    const adjustedX = Math.min(Math.max(x, width / 2), containerWidth - width / 2);
    const adjustedY = Math.min(Math.max(y, height / 2), containerHeight - height / 2);

    return {
      id: imageIdCounter.current++,
      url: imgData.image.url,
      link: imgData.link,
      name: imgData.image.name,
      x: adjustedX,
      y: adjustedY,
      width: finalWidth,
    };
  };

  const defaultContentUrls = useMemo(() => {
    const defaultContentLength = Math.min(content.length, defaultImageCount);
    return content.filter((_, i) => i < defaultContentLength).map((c) => c.image.url).join('-');
  }, [content])


  useEffect(() => {
    if (!divRef.current || content.length === 0) return;

    const rect = divRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const defaultPlaced: PlacedImage[] = [];

    const placeImages = async () => {
      for (let i = 0; i < defaultImageCount && i < content.length; i++) {
        const imgData = content[i];
        const newImg = await createNewImage(imgData, containerWidth, containerHeight);
        defaultPlaced.push(newImg);
      }

      setPlacedImages(defaultPlaced);
      setCounter(defaultImageCount % content.length);
    };

    placeImages();
  }, [defaultContentUrls, sizeType, customWidth, randomRange, revealPosition]);

  useEffect(() => {
    if (visible === 'last One') {
      setPlacedImages(prev => prev.length > 0 ? [prev[prev.length - 1]] : []);
    }
  }, [visible]);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (target === 'image' && !isMouseOverImage(clickX, clickY, placedImages)) return;

    let x = 0, y = 0;
    if (revealPosition === 'on Click') {
      x = clickX;
      y = clickY;
    } else if (revealPosition === 'same') {
      x = rect.width / 2;
      y = rect.height / 2;
    } else {
      x = Math.random() * rect.width;
      y = Math.random() * rect.height;
    }

    const imgData = content[counter];
    const newImage = await createNewImage(imgData, rect.width, rect.height, { x, y });

    setPlacedImages(prev => (visible === 'all' ? [...prev, newImage] : [newImage]));
    setCounter(prev => (prev >= content.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      ref={divRef}
      onClick={handleClick}
      className={styles.imageRevealSlider}
      style={{ cursor: cursorType !== 'system' && defaultCursor ? `url(${ target === 'area' ? hoverCursor : defaultCursor}), auto` : 'default' }}
    >
      {placedImages.map(img => (
        <div className={styles.wrapper}
          key={img.id}
          style={{
            top: `${img.y}px`,
            left: `${img.x}px`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            width: img.width ?? 'auto',
            height: 'auto',
            cursor: cursorType !== 'system' && hoverCursor ? `url(${hoverCursor}), auto` : 'default'
          }}
        >
          {target === 'area' && img.link ? (
            <a href={img.link} target='_blank' className={styles.link}>
              <img
                key={img.id}
                src={img.url}
                alt={img.name}
                className={styles.image}
              />
            </a>
          ) : (
            <img
              key={img.id}
              src={img.url}
              alt={img.name}
              className={styles.image}
            />
          )}
        </div>
      ))}
    </div>
  );
}
