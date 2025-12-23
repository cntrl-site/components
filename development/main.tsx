import ReactDOM from 'react-dom/client';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

interface ImageRevealSliderProps {
  settings: ImageRevealSliderSettings;
  content: ImageRevealSliderItem[];
  isEditor?: boolean;
}

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
  defaultCursorScale: number;
  defaultCursor: string | null;
  hoverCursorScale: number;
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
}

function isMouseOverImage(mouseX: number, mouseY: number, placedImages: PlacedImage[]): { isOverImage: boolean, hasLink: boolean } {
  for (let i = placedImages.length - 1; i >= 0; i--) {
    const img = placedImages[i];
    const imgEl = new Image();
    imgEl.src = img.url;

    const imgWidth = img.width ? Number.parseFloat(img.width) : imgEl.naturalWidth;
    const imgHeight = imgEl.naturalHeight / imgEl.naturalWidth * imgWidth;

    const halfW = imgWidth / 2;
    const halfH = imgHeight / 2;

    if (
      mouseX >= img.x - halfW &&
      mouseX <= img.x + halfW &&
      mouseY >= img.y - halfH &&
      mouseY <= img.y + halfH
    ) {
      return { isOverImage: true, hasLink: img.link.length > 0 };
    }
  }
  return { isOverImage: false, hasLink: false };
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
  const [isCursorVisible, setIsCursorVisible] = useState(false);

  const { sizeType, imageWidth: customWidth, randomRangeImageWidth: randomRange } = settings.imageSize;
  const { revealPosition, visible, target } = settings.position;
  const { cursorType, defaultCursorScale, defaultCursor, hoverCursorScale, hoverCursor } = settings.cursor;

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorScale, setCursorScale] = useState(defaultCursorScale);

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
    const defaultContentLength = Math.min(content.length, 1);
    return content.filter((_, i) => i < defaultContentLength).map((c) => c.image.url).join('-');
  }, [content]);

  useEffect(() => {
    if (!divRef.current || content.length === 0) return;

    const rect = divRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const defaultPlaced: PlacedImage[] = [];

    const placeImages = async () => {
      for (let i = 0; i < 1 && i < content.length; i++) {
        const imgData = content[i];
        const newImg = await createNewImage(imgData, containerWidth, containerHeight);
        defaultPlaced.push(newImg);
      }

      setPlacedImages(defaultPlaced);
      setCounter(1 % content.length);
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

    const { isOverImage } = isMouseOverImage(clickX, clickY, placedImages)
    if (target === 'image' && !isOverImage) return;

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

  useEffect(() => {
    if (!divRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = divRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const insideContainer = e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

      const { isOverImage } = isMouseOverImage(x, y, placedImages);

      setCursorPos({ x, y });
      setCursorScale(isOverImage ? hoverCursorScale : defaultCursorScale);

      setIsCursorVisible(insideContainer || isOverImage);
    };

    const handleMouseLeave = () => {
      setIsCursorVisible(false);
    };

    const divEl = divRef.current;
    divEl.addEventListener('mousemove', handleMouseMove);
    divEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      divEl.removeEventListener('mousemove', handleMouseMove);
      divEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [placedImages, hoverCursorScale, defaultCursorScale]);

  console.log(cursorPos);

  const { isOverImage, hasLink: overImageHasLink } = isMouseOverImage(cursorPos.x, cursorPos.y, placedImages);

  return (
    <div
      ref={divRef}
      onClick={handleClick}
      style={{
        cursor: !defaultCursor ? 'default' : 'none',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {placedImages.map(img => (
        <div
          key={img.id}
          style={{
            top: `${img.y}px`,
            left: `${img.x}px`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            width: img.width ?? 'auto',
            height: 'auto',
            cursor: !hoverCursor ? 'default' : 'none'
          }}
        >
          {target === 'area' && img.link ? (
            <a href={img.link} target='_blank' style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}>
              <img
                key={img.id}
                src={img.url}
                alt={img.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', userSelect: 'none', pointerEvents: 'none' }}
              // className={styles.image}
              />
            </a>
          ) : (
            <img
              key={img.id}
              src={img.url}
              alt={img.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', userSelect: 'none', pointerEvents: 'none' }}
            // className={styles.image}
            />
          )}
        </div>
      ))
      }

      {cursorType === 'custom' && (defaultCursor || hoverCursor) && isCursorVisible && ( (target === 'area' && !overImageHasLink) || target !== 'area') && (
        <div
          style={{
            position: 'absolute',
            top: cursorPos.y,
            left: cursorPos.x,
            width: '40px',
            height: '40px',
            pointerEvents: 'none',
            backgroundImage: `url(${!isOverImage ? defaultCursor : hoverCursor})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            transform: `translate(-50%, -50%) scale(${cursorScale})`,
            transition: 'transform 0.1s ease-out',
            zIndex: 1000,
          }}
        />
      )}
    </div >
  );
}

const sett: ImageRevealSliderSettings = {
  imageSize: {
    sizeType: 'custom',
    imageWidth: 500,
    randomRangeImageWidth: {
      min: 100,
      max: 1000
    }
  },
  cursor: {
    cursorType: 'custom',
    defaultCursor: null, // "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KD5Q3TMHEWAWR2FY29EW8TPD.svg",
    defaultCursorScale: 1,
    hoverCursor: null, // "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KD5R8Z4M6SYP9EV83EES4STC.svg",
    hoverCursorScale: 1
  },
  position: {
    revealPosition: 'random',
    visible: 'all',
    target: 'area',
  }
}

const cont: ImageRevealSliderItem[] =
  [
    {
      image: {
        // objectFit: "cover",
        url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png",
        name: "Slider-1.png"
      },
      link: "",
    },
    {
      image: {
        // objectFit: "cover",
        url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png",
        name: "Slider-2.png"
      },
      link: "http://localhost:5173/",
    },
    {
      image: {
        // objectFit: "cover",
        url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQNEVRXPSRX5K1YTMJQY9.png",
        name: "Slider-3.png"
      },
      link: "",
    },
    {
      image: {
        // objectFit: "cover",
        url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQP84JKRDT7WNWDQZR4Y9.png",
        name: "Slider-4.png"
      },
      link: "",
    }
  ]


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ImageRevealSlider settings={sett} content={cont} />
  </React.StrictMode>
);
