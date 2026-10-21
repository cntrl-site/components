import { useEffect } from 'react';

export const NEAR_VIEWPORT_MARGIN = '100% 0px';

type VideoPreload = 'none' | 'metadata' | 'auto';
type IntersectionListener = (isIntersecting: boolean) => void;

type SharedObserver = {
  observer: IntersectionObserver;
  listeners: Map<Element, Set<IntersectionListener>>;
  states: Map<Element, boolean>;
};

const sharedObservers = new Map<string, SharedObserver>();

function getSharedObserver(rootMargin: string): SharedObserver {
  const existing = sharedObservers.get(rootMargin);
  if (existing) return existing;
  const listeners = new Map<Element, Set<IntersectionListener>>();
  const states = new Map<Element, boolean>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      states.set(entry.target, entry.isIntersecting);
      listeners.get(entry.target)?.forEach((listener) => listener(entry.isIntersecting));
    }
  }, { rootMargin });
  const shared = { observer, listeners, states };
  sharedObservers.set(rootMargin, shared);
  return shared;
}

export function observeIntersection(element: Element, rootMargin: string, listener: IntersectionListener): () => void {
  const { observer, listeners, states } = getSharedObserver(rootMargin);
  const elementListeners = listeners.get(element) ?? new Set<IntersectionListener>();
  if (elementListeners.size === 0) {
    listeners.set(element, elementListeners);
    observer.observe(element);
  }
  elementListeners.add(listener);
  const knownState = states.get(element);
  if (knownState !== undefined) listener(knownState);
  return () => {
    elementListeners.delete(listener);
    if (elementListeners.size > 0) return;
    listeners.delete(element);
    states.delete(element);
    observer.unobserve(element);
  };
}

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
};

function isVideoElement(element: Element): element is HTMLVideoElement {
  return element.localName === 'video';
}

export function useLazyVideos(element: Element | null, { autoPlay = false, preload = 'auto', selector = 'video' }: LazyVideosOptions = {}) {
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
        if (isVisible) {
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
    mutationObserver?.observe(element, { childList: true, subtree: true });
    return () => {
      stopNear();
      stopVisible?.();
      mutationObserver?.disconnect();
    };
  }, [element, autoPlay, preload, selector]);
}
