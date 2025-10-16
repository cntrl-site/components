import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MediaEffect, VideoTextureManager } from '@cntrl-site/effects';
import { rangeMap } from '../rangeMap';
import { WebglContextManagerContext } from '../../provider/WebGLContextManagerContext';

interface FxParams {
  videoUrl?: string;
  fragmentShader: string | null;
  controls?: Record<string, number | [number, number]>;
}

const PATTERN_URL = 'https://cdn.cntrl.site/client-app-files/texture2.png';
const PATTERN_2_URL = 'https://cdn.cntrl.site/client-app-files/bayer16.png';

export function useVideoFx(
  canvas: HTMLCanvasElement | null | undefined,
  enabled: boolean,
  {
    videoUrl,
    fragmentShader,
    controls
  }: FxParams,
  width: number,
  height: number
): boolean {
  const [isFXAllowed, setIsFXAllowed] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const active = enabled && isReady;
  const webGLContextManager = useContext(WebglContextManagerContext);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const isRenderingRef = useRef(false);
  const frameRef = useRef<number>();
  const videoTextureManager = useMemo(() => {
    if (!videoUrl || !enabled) return;
    const handlePlayError = () => {
      setIsFXAllowed(false);
    };
    return new VideoTextureManager(videoUrl, handlePlayError);
  }, [videoUrl, enabled]);
  const videoFx = useMemo<MediaEffect | undefined>(() => {
    if (!videoTextureManager) return;
    return new MediaEffect(
      videoTextureManager,
      PATTERN_URL,
      PATTERN_2_URL,
      fragmentShader!,
      {
        time: 0,
        cursor: [0, 0],
        ...controls
      },
      width,
      height
    );
  }, [videoTextureManager, fragmentShader, width, height]);

  useEffect(() => {
    if (!videoTextureManager) return;
    videoTextureManager.onReadyStatusChange(setIsReady);
  }, [videoTextureManager]);

  useEffect(() => {
    if (!canvas || !videoFx) return;
    const handleMouseMove = (evt: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = rangeMap(evt.clientX, rect.left, rect.left + rect.width, 0, 1, true);
      const y = rangeMap(evt.clientY, rect.top, rect.top + rect.height, 0, 1, true);
      videoFx.setParam('cursor', [x, y]);
    };
    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvas, videoFx]);

  useEffect(() => {
    if (!active || !canvas || !videoFx) return;
    let time = 0;

    const startRendering = () => {
      if (isRenderingRef.current) return;

      const gl = webGLContextManager.getContext(canvas);
      if (!gl) {
        return;
      }

      glRef.current = gl;
      isRenderingRef.current = true;

      videoFx.prepare(gl);

      const renderFrame = () => {
        if (!isRenderingRef.current || !glRef.current) return;

        time += 0.1;

        webGLContextManager.updateContextSize(glRef.current, canvas.width, canvas.height);

        videoFx.setViewport(Math.floor(canvas.width), Math.floor(canvas.height));
        videoFx.setParam('time', time);
        try {
          videoFx.render(glRef.current);
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
  }, [canvas, videoFx, active]);
  return isFXAllowed;
}
