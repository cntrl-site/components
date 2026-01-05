import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, useMotionValue, useSpring, Variants } from "framer-motion";
import "./main.css"

const content = [
  {
    image: {
      objectFit: "cover",
      url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png",
      name: "Slider-1.png"
    },
    link: "",
  },
  {
    image: {
      objectFit: "cover",
      url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png",
      name: "Slider-2.png"
    },
    link: "http://localhost:5173/",
  },
  {
    image: {
      objectFit: "cover",
      url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQNEVRXPSRX5K1YTMJQY9.png",
      name: "Slider-3.png"
    },
    link: "",
  },
  {
    image: {
      objectFit: "cover",
      url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQP84JKRDT7WNWDQZR4Y9.png",
      name: "Slider-4.png"
    },
    link: "",
  }
]

const settings: ImageRevealSliderSettings = {
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
    defaultCursor: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KD5R8Z4M6SYP9EV83EES4STC.svg",
    defaultCursorScale: 2,
    hoverCursor: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KD5Q3TMHEWAWR2FY29EW8TPD.svg",
    hoverCursorScale: 1
  },
  position: {
    revealPosition: 'random',
    visible: 'all',
    target: 'image',
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ImageRevealSlider content={content} settings={settings} />
);


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
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const [counter, setCounter] = useState(0);
  const imageIdCounter = useRef(0);
  const defaultImageCount = 1;
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const defaultScale = 32;
  const cursorW = useMotionValue(32);
  const cursorH = useMotionValue(32);
  const [customCursorImg, setCustomCursorImg] = useState('none');

  useEffect(() => {
    if (!divRef) return;

    const updateCursorPosition = (clientX: number, clientY: number) => {
      const divRect = divRef.getBoundingClientRect();
      const newX = clientX - cursorW.get() / 2 - divRect.left;
      const newY = clientY - cursorH.get() / 2 - divRect.top;

      cursorX.jump(newX);
      cursorY.jump(newY);
    };

    const mouseMove = (e: MouseEvent) => {
      e.stopPropagation();
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      updateCursorPosition(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      if (!isInside) return;
      updateCursorPosition(lastMousePos.current.x, lastMousePos.current.y);
    };

    divRef.addEventListener("mousemove", mouseMove);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      divRef.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("scroll", handleScroll, true);
    }
  }, [cursorX, cursorY, cursorW, cursorH, divRef, isInside]);

  useEffect(() => {
    if (!isInside) {
      setCustomCursorImg("none");
      cursorW.set(0);
      cursorH.set(0);
    }
  }, [isInside]);

  const { sizeType, imageWidth: customWidth, randomRangeImageWidth: randomRange } = settings.imageSize;
  const { revealPosition, visible, target } = settings.position;
  const { cursorType, defaultCursorScale, defaultCursor, hoverCursorScale, hoverCursor } = settings.cursor;

  useEffect(() => {
    const updateCursor = () => {
      if (cursorType === 'system') {
        setCustomCursorImg('none');
        cursorW.set(defaultScale);
        cursorH.set(defaultScale);
        return;
      }

      const elUnderCursor = document.elementFromPoint(cursorX.get() + cursorW.get() / 2, cursorY.get() + cursorH.get() / 2);
      if (elUnderCursor && elUnderCursor.closest('a.link')) {
        setCustomCursorImg('none');
        cursorW.set(defaultScale);
        cursorH.set(defaultScale);
        return;
      }

      if (target === 'area') {
        setCustomCursorImg(hoverCursor || 'none');
        cursorW.set(defaultScale * hoverCursorScale || 1);
        cursorH.set(defaultScale * hoverCursorScale || 1);
      }
      else if (isMouseOverImage(cursorX.get() + cursorW.get() / 2, cursorY.get() + cursorH.get() / 2, placedImages)) {
        setCustomCursorImg(hoverCursor || 'none');
        cursorW.set(defaultScale * hoverCursorScale || 1);
        cursorH.set(defaultScale * hoverCursorScale || 1);
      }
      else {
        setCustomCursorImg(defaultCursor || 'none');
        cursorW.set(defaultScale * defaultCursorScale || 1);
        cursorH.set(defaultScale * defaultCursorScale || 1);
      }
    };

    const unsubscribeX = cursorX.onChange(updateCursor);
    const unsubscribeY = cursorY.onChange(updateCursor);

    updateCursor();

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [
    cursorType,
    target,
    hoverCursor,
    defaultCursor,
    hoverCursorScale,
    defaultCursorScale,
    cursorX,
    cursorY,
    cursorW,
    cursorH,
    placedImages
  ]);


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
    if (!divRef || content.length === 0) return;

    const rect = divRef.getBoundingClientRect();
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
  }, [defaultContentUrls, sizeType, customWidth, randomRange, revealPosition, divRef]);

  useEffect(() => {
    if (visible === 'last One') {
      setPlacedImages(prev => prev.length > 0 ? [prev[prev.length - 1]] : []);
    }
  }, [visible]);

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef) return;
    const rect = divRef.getBoundingClientRect();
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
      ref={setDivRef}
      onClick={handleClick}
      onMouseEnter={() => setIsInside(true)}
      onMouseLeave={() => setIsInside(false)}
      className="imageRevealSlider"
      style={{ cursor: customCursorImg === 'none' ? 'default' : 'none', top: '200px', left: '200px' }}
    >
      {placedImages.map(img => (
        <div className="wrapper"
          key={img.id}
          style={{
            top: `${img.y}px`,
            left: `${img.x}px`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            width: img.width ?? 'auto',
            height: 'auto',
            cursor: customCursorImg === 'none' ? 'default' : 'none'
          }}
        >
          {target === 'area' && img.link ? (
            <a href={img.link} target='_blank' className="link">
              <img
                key={img.id}
                src={img.url}
                alt={img.name}
                className="image"
              />
            </a>
          ) : (
            <img
              key={img.id}
              src={img.url}
              alt={img.name}
              className="image"
            />
          )}
        </div>
      ))}
      <motion.div
        className="cursor"
        style={{
          x: cursorX,
          y: cursorY,
          width: cursorW.get(),
          height: cursorH.get(),
          backgroundImage: `url('${customCursorImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
    </div>
  );
}
