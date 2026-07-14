import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CommonComponentProps } from '../props';
import { useScopedStyles } from '../utils/index';

type ClickGallerieItem = {
  image: {
    url: string;
    name: string;
  };
  link: string;
};

type ImageSizeSettings = {
  sizeType: 'custom' | 'as is' | 'random';
  value: number;
  min: number;
  max: number;
};

type ClickGallerieSettings = {
  imageSize?: ImageSizeSettings;
  cursor?: 'system' | 'custom';
  target?: 'area' | 'image';
  position?: 'random' | 'same' | 'on Click';
  visible?: 'all' | 'last One';
  defaultCursor?: string | null;
  hoverCursor?: string | null;
};

type ClickGallerieProps = {
  settings: ClickGallerieSettings;
  content?: ClickGallerieItem[];
  isEditor?: boolean;
} & CommonComponentProps;

type ImageMeta = {
  aspectRatio: number;
  naturalWidth: number;
};

interface PlacedImage {
  id: number;
  url: string;
  link: string;
  name: string;
  x: number;
  y: number;
  xRatio: number;
  yRatio: number;
  aspectRatio: number;
  widthPx: number;
}

const DEFAULT_IMAGE_SIZE: ImageSizeSettings = {
  sizeType: 'custom',
  value: 700,
  min: 400,
  max: 700,
};

function getImageDimensions(
  widthPx: number,
  aspectRatio: number,
): { widthPx: number; heightPx: number } {
  return {
    widthPx,
    heightPx: widthPx * aspectRatio,
  };
}

function clampPosition(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number,
  widthPx: number,
  heightPx: number,
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(x, widthPx / 2), containerWidth - widthPx / 2),
    y: Math.min(Math.max(y, heightPx / 2), containerHeight - heightPx / 2),
  };
}

function getSamePosition(
  containerWidth: number,
  containerHeight: number,
  widthPx: number,
  aspectRatio: number,
): { x: number; y: number } {
  const { heightPx } = getImageDimensions(widthPx, aspectRatio);

  return clampPosition(
    containerWidth / 2,
    containerHeight / 2,
    containerWidth,
    containerHeight,
    widthPx,
    heightPx,
  );
}

function isMouseOverImage(
  mouseX: number,
  mouseY: number,
  placedImages: PlacedImage[],
) {
  for (const img of placedImages) {
    const { heightPx } = getImageDimensions(img.widthPx, img.aspectRatio);
    const halfW = img.widthPx / 2;
    const halfH = heightPx / 2;

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

function resolveCustomCursorImg(
  x: number,
  y: number,
  placedImages: PlacedImage[],
  divRef: HTMLDivElement,
  cursorMode: 'system' | 'custom',
  target: 'area' | 'image',
  hoverCursor: string | null,
  defaultCursor: string | null,
): string {
  if (cursorMode === 'system') {
    return 'none';
  }

  const rect = divRef.getBoundingClientRect();
  const el = document.elementFromPoint(rect.left + x, rect.top + y);

  if (el && el.closest('a')) {
    return 'none';
  }

  return isMouseOverImage(x, y, placedImages) || target === 'area'
    ? hoverCursor ?? 'none'
    : defaultCursor ?? 'none';
}

function resolveImageWidthPx(
  url: string,
  imageSize: ImageSizeSettings,
  metaByUrl: Map<string, ImageMeta>,
): number {
  const { sizeType, value, min, max } = imageSize;

  if (sizeType === 'custom') {
    return value;
  }

  if (sizeType === 'as is') {
    return metaByUrl.get(url)?.naturalWidth ?? value;
  }

  return Math.round(Math.random() * (max - min) + min);
}

function getCSS(P: string): string {
  return `
.${P}-root {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.${P}-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  height: auto;
}
.${P}-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  position: relative;
  user-select: none;
  pointer-events: none;
}
.${P}-link {
  width: 100%;
  display: block;
}
.${P}-cursor {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 32px;
  height: 32px;
}
`;
}

function preloadImage(url: string): Promise<ImageMeta> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        aspectRatio: img.naturalHeight / img.naturalWidth,
        naturalWidth: img.naturalWidth,
      });
    };
    img.onerror = () => {
      resolve({ aspectRatio: 1, naturalWidth: 700 });
    };
    img.src = url;
  });
}

async function preloadImages(urls: string[]): Promise<Map<string, ImageMeta>> {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => [url, await preloadImage(url)] as const),
  );

  return new Map(entries);
}

export function ClickGallerie({ settings, content = [], isEditor }: ClickGallerieProps) {
  const { prefix: P } = useScopedStyles();
  const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);
  const [counter, setCounter] = useState(0);
  const imageIdCounter = useRef(0);

  const [cursorCenter, setCursorCenter] = useState({ x: 0, y: 0 });
  const [customCursorImg, setCustomCursorImg] = useState('none');
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const imageMetaByUrlRef = useRef<Map<string, ImageMeta>>(new Map());

  const {
    imageSize = DEFAULT_IMAGE_SIZE,
    cursor: cursorMode = 'system',
    target = 'area',
    position = 'random',
    visible = 'all',
    defaultCursor = null,
    hoverCursor = null,
  } = settings;

  const scopedCss = useMemo(() => getCSS(P), [P]);

  const updateCursorFromMousePosition = useCallback((
    clientX: number,
    clientY: number,
    images = placedImages,
  ) => {
    if (!divRef) return;

    const rect = divRef.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setCursorCenter({ x, y });
    setCustomCursorImg(
      resolveCustomCursorImg(x, y, images, divRef, cursorMode, target, hoverCursor, defaultCursor),
    );
  }, [divRef, placedImages, cursorMode, target, hoverCursor, defaultCursor]);

  useEffect(() => {
    const urls = [
      ...content.map((item) => item.image.url),
      defaultCursor,
      hoverCursor,
    ].filter((url): url is string => Boolean(url));

    if (urls.length === 0) {
      imageMetaByUrlRef.current = new Map();
      setImagesReady(true);
      return;
    }

    let cancelled = false;
    setImagesReady(false);

    preloadImages(urls).then((map) => {
      if (cancelled) return;
      imageMetaByUrlRef.current = map;
      setImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [content, defaultCursor, hoverCursor]);

  useEffect(() => {
    if (!divRef) return;

    const mouseMove = (e: MouseEvent) => {
      e.stopPropagation();
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      updateCursorFromMousePosition(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      if (!isInside) return;
      updateCursorFromMousePosition(lastMousePos.current.x, lastMousePos.current.y);
    };

    divRef.addEventListener('mousemove', mouseMove);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      divRef.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [divRef, isInside, updateCursorFromMousePosition]);

  useEffect(() => {
    if (!divRef || !isInside) return;
    updateCursorFromMousePosition(lastMousePos.current.x, lastMousePos.current.y);
  }, [placedImages, divRef, isInside, updateCursorFromMousePosition]);

  useEffect(() => {
    if (!isInside) {
      setCustomCursorImg('none');
    }
  }, [isInside]);

  const createNewImage = (
    imgData: ClickGallerieItem,
    containerWidth: number,
    containerHeight: number,
    clickPosition: { x?: number; y?: number } = {},
  ): PlacedImage => {
    const aspectRatio = imageMetaByUrlRef.current.get(imgData.image.url)?.aspectRatio ?? 1;
    const widthPx = resolveImageWidthPx(imgData.image.url, imageSize, imageMetaByUrlRef.current);
    const { heightPx } = getImageDimensions(widthPx, aspectRatio);

    let x = 0;
    let y = 0;
    if (position === 'same') {
      ({ x, y } = getSamePosition(containerWidth, containerHeight, widthPx, aspectRatio));
    } else {
      x = clickPosition.x ?? Math.random() * containerWidth;
      y = clickPosition.y ?? Math.random() * containerHeight;
      ({ x, y } = clampPosition(x, y, containerWidth, containerHeight, widthPx, heightPx));
    }

    return {
      id: imageIdCounter.current++,
      url: imgData.image.url,
      link: imgData.link,
      name: imgData.image.name,
      x,
      y,
      xRatio: x / containerWidth,
      yRatio: y / containerHeight,
      aspectRatio,
      widthPx,
    };
  };

  const repositionPlacedImages = () => {
    if (!divRef) return;

    const rect = divRef.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    if (containerWidth === 0 || containerHeight === 0) return;

    setPlacedImages((prev) => {
      if (prev.length === 0) return prev;

      return prev.map((img) => {
        const widthPx = imageSize.sizeType === 'random'
          ? img.widthPx
          : resolveImageWidthPx(img.url, imageSize, imageMetaByUrlRef.current);
        const { heightPx } = getImageDimensions(widthPx, img.aspectRatio);

        if (position === 'same') {
          const { x, y } = getSamePosition(containerWidth, containerHeight, widthPx, img.aspectRatio);
          return { ...img, x, y, widthPx };
        }

        const { x, y } = clampPosition(
          img.xRatio * containerWidth,
          img.yRatio * containerHeight,
          containerWidth,
          containerHeight,
          widthPx,
          heightPx,
        );

        return { ...img, x, y, widthPx };
      });
    });
  };

  useEffect(() => {
    if (!divRef || content.length === 0 || !imagesReady) return;

    const rect = divRef.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const newImg = createNewImage(content[0], containerWidth, containerHeight);

    setPlacedImages([newImg]);
    setCounter(1);
  }, [imageSize, position, divRef, content, imagesReady]);

  useEffect(() => {
    if (!divRef) return;

    repositionPlacedImages();

    const ro = new ResizeObserver(repositionPlacedImages);
    ro.observe(divRef);
    window.addEventListener('resize', repositionPlacedImages);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', repositionPlacedImages);
    };
  }, [divRef, position, imageSize, placedImages.length]);

  useEffect(() => {
    if (visible === 'last One') {
      setPlacedImages((prev) => (prev.length > 0 ? [prev[prev.length - 1]] : []));
    }
  }, [visible]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef || content.length === 0 || !imagesReady) return;

    const rect = divRef.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (target === 'image' && !isMouseOverImage(clickX, clickY, placedImages)) return;

    let x = 0;
    let y = 0;
    if (position === 'on Click') {
      x = clickX;
      y = clickY;
    } else if (position === 'same') {
      x = rect.width / 2;
      y = rect.height / 2;
    } else {
      x = Math.random() * rect.width;
      y = Math.random() * rect.height;
    }

    const imgData = content[counter];
    const newImage = createNewImage(imgData, rect.width, rect.height, { x, y });
    const nextPlacedImages = visible === 'all' ? [...placedImages, newImage] : [newImage];

    setPlacedImages(nextPlacedImages);
    setCounter((prev) => (prev >= content.length - 1 ? 0 : prev + 1));
    updateCursorFromMousePosition(e.clientX, e.clientY, nextPlacedImages);
  };

  const useCustomCursor = cursorMode === 'custom' && customCursorImg !== 'none';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        ref={setDivRef}
        onClick={handleClick}
        onMouseEnter={() => setIsInside(true)}
        onMouseLeave={() => setIsInside(false)}
        className={`${P}-root`}
        style={{ cursor: useCustomCursor ? 'none' : 'default' }}
      >
        {placedImages.map((img) => (
          <div
            className={`${P}-wrapper`}
            key={img.id}
            style={{
              top: `${img.y}px`,
              left: `${img.x}px`,
              width: `${img.widthPx}px`,
              cursor: useCustomCursor ? 'none' : 'default',
            }}
          >
            {target === 'area' && img.link ? (
              <a href={img.link} target="_blank" rel="noreferrer" className={`${P}-link`}>
                <img src={img.url} alt={img.name} className={`${P}-image`} />
              </a>
            ) : (
              <img src={img.url} alt={img.name} className={`${P}-image`} />
            )}
          </div>
        ))}
        {isInside && useCustomCursor && (
          <div
            className={`${P}-cursor`}
            style={{
              left: `${cursorCenter.x}px`,
              top: `${cursorCenter.y}px`,
              transform: 'translate(-50%, -50%)',
              backgroundImage: `url('${customCursorImg}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>
    </>
  );
}
