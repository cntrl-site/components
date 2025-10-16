import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MediaEffect, ImageTextureManager } from '@cntrl-site/effects';
import { rangeMap } from '../rangeMap';
import { WebglContextManagerContext } from '../../provider/WebGLContextManagerContext';

interface FxParams {
  imageUrl?: string;
  fragmentShader: string | null;
  controlsValues?: Record<string, number | [number, number]>;
}

const PATTERN_URL = 'https://cdn.cntrl.site/client-app-files/texture2.png';
const PATTERN_2_URL = 'https://cdn.cntrl.site/client-app-files/bayer16.png';

export function useImageFx(
  canvas: HTMLCanvasElement | null | undefined,
  enabled: boolean,
  {
    imageUrl,
    fragmentShader,
    controlsValues
  }: FxParams,
  width: number,
  height: number
): boolean {
  const webGLContextManager = useContext(WebglContextManagerContext);
  const [isFXAllowed, setIsFXAllowed] = useState(true);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const isRenderingRef = useRef(false);
  const frameRef = useRef<number>();
  const imageTextureManager = useMemo(() => {
    if (!imageUrl || !enabled) return;
    return new ImageTextureManager(imageUrl);
  }, [imageUrl, enabled]);
  const imageFx = useMemo<MediaEffect | undefined>(() => {
    if (!imageTextureManager) return;
    return new MediaEffect(
      imageTextureManager,
      PATTERN_URL,
      PATTERN_2_URL,
      fragmentShader!,
      {
        time: 0,
        cursor: [0, 0],
        ...controlsValues
      },
      width,
      height
    );
  }, [imageTextureManager, fragmentShader, width, height]);

  useEffect(() => {
    if (!imageFx || !controlsValues) return;
    for (const [key, value] of Object.entries(controlsValues)) {
      imageFx.setParam(key, value);
    }
  }, [imageFx, controlsValues]);

  useEffect(() => {
    if (!canvas || !imageFx) return;
    const handleMouseMove = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = rangeMap(evt.clientX, rect.left, rect.left + rect.width, 0, 1, true);
      const y = rangeMap(evt.clientY, rect.top, rect.top + rect.height, 0, 1, true);
      imageFx.setParam('cursor', [x, y]);
    };
    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvas, imageFx]);

  useEffect(() => {
    if (!enabled || !canvas || !imageFx) return;

    let time = 0;

    const startRendering = () => {
      if (isRenderingRef.current) return;

      const gl = webGLContextManager.getContext(canvas);
      if (!gl) {
        return;
      }

      glRef.current = gl;
      isRenderingRef.current = true;

      imageFx.prepare(gl);

      const renderFrame = () => {
        if (!isRenderingRef.current || !glRef.current) return;

        time += 0.1;

        webGLContextManager.updateContextSize(glRef.current, canvas.width, canvas.height);

        imageFx.setViewport(Math.floor(canvas.width), Math.floor(canvas.height));
        imageFx.setParam('time', time);
        try {
          imageFx.render(glRef.current);
        } catch {
          setIsFXAllowed(false);
        }
        webGLContextManager.renderToCanvas(glRef.current, canvas);

        frameRef.current = requestAnimationFrame(renderFrame);
      };

      frameRef.current = requestAnimationFrame(renderFrame);
    };

    const stopRendering = () => {
      if (!isRenderingRef.current) return;

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }

      if (glRef.current) {
        webGLContextManager.releaseContext(canvas);
        glRef.current = null;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      isRenderingRef.current = false;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startRendering();
        } else {
          stopRendering();
        }
      },
      {
        threshold: 0,
        rootMargin: '75px'
      }
    );

    observer.observe(canvas);

    return () => {
      stopRendering();
      observer.disconnect();
    };
  }, [canvas, imageFx, enabled]);
  return isFXAllowed;
}
