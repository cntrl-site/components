import { useEffect } from 'react';
import { observeIntersection } from './observeIntersection';

export const NEAR_VIEWPORT_MARGIN = '100% 0px';

type VideoPreload = 'none' | 'metadata' | 'auto';

const PRELOAD_ORDER: VideoPreload[] = ['none', 'metadata', 'auto'];

export function raisePreload(video: HTMLVideoElement, preload: VideoPreload) {
  if (PRELOAD_ORDER.indexOf(video.preload as VideoPreload) < PRELOAD_ORDER.indexOf(preload)) {
    video.preload = preload;
  }
}

export function playVideo(video: HTMLVideoElement) {
  const playPromise = video.play();
  if (playPromise) playPromise.catch(() => {});
}

export function pauseVideo(video: HTMLVideoElement) {
  if (!video.paused) video.pause();
}

type LazyVideosOptions = {
  autoPlay?: boolean;
  preload?: Exclude<VideoPreload, 'none'>;
  selector?: string;
  shouldPlay?: (video: HTMLVideoElement) => boolean;
};

function isVideoElement(element: Element): element is HTMLVideoElement {
  return element.localName === 'video';
}

export function useLazyVideos(element: Element | null, { autoPlay = false, preload = 'auto', selector = 'video', shouldPlay }: LazyVideosOptions = {}) {
  useEffect(() => {
    if (!element) return;
    const isSingleVideo = isVideoElement(element);
    const getVideos = (): HTMLVideoElement[] => (
      isSingleVideo
        ? [element]
        : Array.from(element.querySelectorAll<HTMLVideoElement>(selector))
    );
    if (typeof IntersectionObserver === 'undefined') {
      getVideos().forEach((video) => {
        raisePreload(video, preload);
        video.autoplay = autoPlay;
      });
      return;
    }
    let isNear = false;
    let isVisible = false;
    const apply = () => {
      getVideos().forEach((video) => {
        if (isNear) raisePreload(video, preload);
        if (!autoPlay) return;
        if (isVisible && (!shouldPlay || shouldPlay(video))) {
          video.muted = true;
          if (video.paused) playVideo(video);
        } else {
          pauseVideo(video);
        }
      });
    };
    const stopNear = observeIntersection(element, NEAR_VIEWPORT_MARGIN, (intersecting) => {
      isNear = intersecting;
      apply();
    });
    const stopVisible = autoPlay
      ? observeIntersection(element, '0px', (intersecting) => {
        isVisible = intersecting;
        apply();
      })
      : null;
    const mutationObserver = isSingleVideo ? null : new MutationObserver(apply);
    mutationObserver?.observe(element, {
      childList: true,
      subtree: true,
      ...(shouldPlay ? { attributes: true, attributeFilter: ['class'] } : {}),
    });
    return () => {
      stopNear();
      stopVisible?.();
      mutationObserver?.disconnect();
    };
  }, [element, autoPlay, preload, selector, shouldPlay]);
}
