import { forwardRef, useCallback, useState, type VideoHTMLAttributes } from 'react';
import { useLazyVideos } from '../../utils/useLazyVideos';

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'preload'> & {
  nearPreload?: 'auto' | 'metadata';
};

export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(({ autoPlay = false, nearPreload = 'auto', ...props }, ref) => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  useLazyVideos(video, { autoPlay, preload: nearPreload });
  const setRefs = useCallback((element: HTMLVideoElement | null) => {
    setVideo(element);
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  }, [ref]);

  return <video {...props} ref={setRefs} preload="none" />;
});

LazyVideo.displayName = 'LazyVideo';
