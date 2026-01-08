import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
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
    target: 'image',
    defaultCursor: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KD5R8Z4M6SYP9EV83EES4STC.svg",
    defaultCursorScale: 2,
    hoverCursor: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KD5Q3TMHEWAWR2FY29EW8TPD.svg",
    hoverCursorScale: 1
  },
  position: {
    revealPosition: 'random',
    visible: 'all',
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
  target: 'area' | 'image';
  defaultCursorScale: number;
  defaultCursor: string | null;
  hoverCursorScale: number;
  hoverCursor: string | null;
};

type ImageRevealSliderPosition = {
  revealPosition: 'random' | 'same' | 'on Click';
  visible: 'all' | 'last One';
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

  const defaultScale = 32;

  const [cursorCenter, setCursorCenter] = useState({ x: 0, y: 0 });
  const [cursorScale, setCursorScale] = useState(1);
  const [customCursorImg, setCustomCursorImg] = useState("none");
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);

  const { sizeType, imageWidth: customWidth, randomRangeImageWidth: randomRange } = settings.imageSize;
  const { revealPosition, visible } = settings.position;
  const { cursorType, target, defaultCursorScale, defaultCursor, hoverCursorScale, hoverCursor } = settings.cursor;

  useEffect(() => {
    if (!divRef) return;

    const updateCursorPosition = (clientX: number, clientY: number) => {
      const rect = divRef.getBoundingClientRect();

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      setCursorCenter({ x, y });

      if (cursorType === "system") {
        setCustomCursorImg("none");
        setCursorScale(1);
        return;
      }

      const cx = x;
      const cy = y;

      const el = document.elementFromPoint(rect.left + cx, rect.top + cy);

      if (el && el.closest("a")) {
        setCustomCursorImg("none");
        setCursorScale(1);
        return;
      }

      const next =
        isMouseOverImage(cx, cy, placedImages) || target === "area"
          ? { img: hoverCursor ?? "none", scale: hoverCursorScale }
          : { img: defaultCursor ?? "none", scale: defaultCursorScale };

      setCustomCursorImg(next.img);
      setCursorScale(next.scale);
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
    };
  }, [
    divRef,
    isInside,
    cursorCenter,
    cursorType,
    target,
    hoverCursor,
    defaultCursor,
    hoverCursorScale,
    defaultCursorScale,
    placedImages,
    window.scrollY
  ]);

  useEffect(() => {
    if (!isInside) {
      setCustomCursorImg("none");
      setCursorScale(0);
    }
  }, [isInside]);

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

  useEffect(() => {
    if (!divRef || content.length === 0) return;

    const rect = divRef.getBoundingClientRect();
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
  }, [sizeType, customWidth, randomRange, revealPosition, divRef]);

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
      {isInside &&
        <div
          className="cursor"
          style={{
            left: `${cursorCenter.x}px`,
            top: `${cursorCenter.y}px`,
            transform: `translate(-50%, -50%) scale(${cursorScale})`,
            backgroundImage: `url('${customCursorImg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            pointerEvents: "none",
          }}
        />
      }
    </div>
  );
}
