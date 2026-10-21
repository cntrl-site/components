import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyVideo } from '../helpers/LazyVideo/LazyVideo';
import { Marquee, type MarqueeSettings } from '../Marquee/Marquee';
import { useLazyVideos } from './useLazyVideos';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly targets = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback, readonly options: IntersectionObserverInit = {}) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  takeRecords() {
    return [];
  }

  emit(target: Element, isIntersecting: boolean) {
    this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

const NEAR = '100% 0px';
const VISIBLE = '0px';

function observerFor(rootMargin: string) {
  const observer = FakeIntersectionObserver.instances.find((instance) => instance.options.rootMargin === rootMargin);
  if (!observer) throw new Error(`no observer for ${rootMargin}`);
  return observer;
}

function emit(rootMargin: string, target: Element, isIntersecting: boolean) {
  act(() => observerFor(rootMargin).emit(target, isIntersecting));
}

const playSpy = vi.fn();
const pauseSpy = vi.fn();
const pausedVideos = new WeakMap<HTMLMediaElement, boolean>();

let container: HTMLDivElement;
let root: Root;

function render(node: ReactNode) {
  act(() => root.render(node));
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  playSpy.mockReset();
  pauseSpy.mockReset();
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get() { return pausedVideos.get(this) ?? true; },
  });
  HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement) {
    playSpy(this);
    pausedVideos.set(this, false);
    return Promise.resolve();
  };
  HTMLMediaElement.prototype.pause = function pause(this: HTMLMediaElement) {
    pauseSpy(this);
    pausedVideos.set(this, true);
  };
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('LazyVideo', () => {
  it('server-renders without autoplay and with preload none', () => {
    const html = renderToString(<LazyVideo src="a.mp4" muted loop playsInline autoPlay />);
    expect(html).toContain('preload="none"');
    expect(html).not.toContain('autoplay');
  });

  it('loads nothing until the video nears the viewport', () => {
    render(<LazyVideo src="a.mp4" muted loop playsInline autoPlay />);
    const video = container.querySelector('video')!;
    expect(video.preload).toBe('none');
    expect(video.hasAttribute('autoplay')).toBe(false);

    emit(NEAR, video, false);
    emit(VISIBLE, video, false);
    expect(video.preload).toBe('none');
    expect(playSpy).not.toHaveBeenCalled();

    emit(NEAR, video, true);
    expect(video.preload).toBe('auto');
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('plays while visible and pauses when it leaves', () => {
    render(<LazyVideo src="a.mp4" muted loop playsInline autoPlay />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, true);
    emit(VISIBLE, video, true);
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(video.muted).toBe(true);

    emit(VISIBLE, video, false);
    expect(pauseSpy).toHaveBeenCalledTimes(1);

    emit(VISIBLE, video, true);
    expect(playSpy).toHaveBeenCalledTimes(2);
  });

  it('never plays a video without autoPlay', () => {
    render(<LazyVideo src="a.mp4" muted loop playsInline />);
    const video = container.querySelector('video')!;
    emit(NEAR, video, true);
    expect(video.preload).toBe('auto');
    expect(FakeIntersectionObserver.instances.some((observer) => observer.options.rootMargin === VISIBLE && observer.targets.has(video))).toBe(false);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('forwards callback refs', () => {
    const ref = vi.fn();
    render(<LazyVideo ref={ref} src="a.mp4" />);
    expect(ref).toHaveBeenCalledWith(container.querySelector('video'));
  });

  it('stops observing after unmount', () => {
    render(<LazyVideo src="a.mp4" autoPlay />);
    const video = container.querySelector('video')!;
    render(null);
    expect(observerFor(NEAR).targets.has(video)).toBe(false);
    expect(observerFor(VISIBLE).targets.has(video)).toBe(false);
  });

  it('shares one observer per margin and replays the known state to late subscribers', () => {
    render(
      <>
        <LazyVideo src="a.mp4" autoPlay />
        <LazyVideo src="b.mp4" autoPlay />
      </>,
    );
    const [first, second] = Array.from(container.querySelectorAll('video'));
    const margins = FakeIntersectionObserver.instances.map((observer) => observer.options.rootMargin);
    expect(new Set(margins).size).toBe(margins.length);
    expect(observerFor(NEAR).targets).toEqual(new Set([first, second]));

    emit(NEAR, first, true);
    expect(first.preload).toBe('auto');
    expect(second.preload).toBe('none');
  });

  it('falls back to preload and autoplay where IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<LazyVideo src="a.mp4" autoPlay />);
    const video = container.querySelector('video')!;
    expect(video.preload).toBe('auto');
    expect(video.autoplay).toBe(true);
    expect(playSpy).not.toHaveBeenCalled();
  });
});

function VideoGroup({ children, autoPlay, preload, selector }: {
  children: ReactNode;
  autoPlay?: boolean;
  preload?: 'auto' | 'metadata';
  selector?: string;
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useLazyVideos(element, { autoPlay, preload, selector });
  return <div ref={setElement}>{children}</div>;
}


describe('useLazyVideos on a container', () => {
  it('drives every matching video, including ones added later', () => {
    render(
      <VideoGroup autoPlay selector=".slide video">
        <div className="slide"><video preload="none" /></div>
        <div className="sizer"><video preload="none" /></div>
      </VideoGroup>,
    );
    const group = container.firstElementChild!;
    const [slide, sizer] = Array.from(group.querySelectorAll('video'));
    emit(NEAR, group, true);
    emit(VISIBLE, group, true);
    expect(slide.preload).toBe('auto');
    expect(playSpy).toHaveBeenCalledWith(slide);
    expect(sizer.preload).toBe('none');

    const clone = document.createElement('div');
    clone.className = 'slide';
    const cloneVideo = document.createElement('video');
    cloneVideo.preload = 'none';
    clone.appendChild(cloneVideo);
    return new Promise<void>((resolve) => {
      group.appendChild(clone);
      setTimeout(() => {
        expect(cloneVideo.preload).toBe('auto');
        expect(cloneVideo.muted).toBe(true);
        expect(playSpy).toHaveBeenCalledWith(cloneVideo);
        resolve();
      });
    });
  });

  it('only fetches metadata for a preload pool', () => {
    render(
      <VideoGroup preload="metadata">
        <video preload="none" />
      </VideoGroup>,
    );
    const group = container.firstElementChild!;
    const video = group.querySelector('video')!;
    emit(NEAR, group, true);
    expect(video.preload).toBe('metadata');
    expect(playSpy).not.toHaveBeenCalled();
  });
});

describe('Marquee videos', () => {
  const settings = (display: 'fit' | 'cover'): MarqueeSettings => ({
    speed: 1,
    direction: 'left',
    pauseOnHover: 'off',
    hoverEffect: 'off',
    gap: 0,
    imageMaxWidth: 0.1,
    imageMaxHeight: 0.1,
    imageFit: { display, ratioValue: '1:1', reversed: false },
  });
  const content = [
    { image: { assetId: 'https://cdn/a.mp4', type: 'video' as const } },
    { image: { assetId: 'https://cdn/b.mp4', type: 'video' as const } },
  ];
  const WRAPPER_WIDTH = 300;
  const CARD_WIDTH = 100;
  let trackOffset = 0;

  function rect(left: number, width: number, top = 0, height = 100) {
    return { left, right: left + width, top, bottom: top + height, width, height, x: left, y: top, toJSON() {} } as DOMRect;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    trackOffset = 0;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getRect(this: HTMLElement) {
      if (this.getAttribute('aria-label') === 'Marquee') return rect(0, WRAPPER_WIDTH);
      if (this.localName === 'video') {
        const index = Array.from(document.querySelectorAll('video')).indexOf(this as HTMLVideoElement);
        return rect(index * CARD_WIDTH + trackOffset, CARD_WIDTH);
      }
      return rect(0, 0);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderMarquee(display: 'fit' | 'cover') {
    render(<Marquee settings={settings(display)} content={content} />);
    const wrapper = container.querySelector('[aria-label="Marquee"]') as HTMLElement;
    return { wrapper, videos: Array.from(container.querySelectorAll('video')) };
  }

  it('server-renders every clone without autoplay and with preload none', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const html = renderToString(<Marquee settings={settings('cover')} content={content} />);
    expect(html.match(/<video/g)?.length).toBe(18);
    expect(html).not.toContain('autoplay');
    expect(html.match(/preload="none"/g)?.length).toBe(18);
  });

  it('leaves every clone idle while the marquee is far from the viewport', () => {
    const { wrapper, videos } = renderMarquee('fit');
    emit(NEAR, wrapper, false);
    emit(VISIBLE, wrapper, false);
    act(() => vi.advanceTimersByTime(1000));
    expect(videos.every((video) => video.preload === 'none')).toBe(true);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('loads clones near the visible strip and plays only the visible ones', () => {
    const { wrapper, videos } = renderMarquee('cover');
    emit(NEAR, wrapper, true);
    emit(VISIBLE, wrapper, true);
    expect(videos.map((video) => video.preload)).toEqual([
      'auto', 'auto', 'auto', 'auto', 'auto',
      ...Array(videos.length - 5).fill('none'),
    ]);
    expect(playSpy.mock.calls.map(([video]) => videos.indexOf(video))).toEqual([0, 1, 2]);

    trackOffset = -2 * CARD_WIDTH;
    act(() => vi.advanceTimersByTime(250));
    expect(videos[6].preload).toBe('auto');
    expect(videos[7].preload).toBe('none');
    expect(videos.filter((video) => !video.paused).map((video) => videos.indexOf(video))).toEqual([2, 3, 4]);
  });

  it('gives every clone of a fit marquee its metadata for layout', () => {
    const { wrapper, videos } = renderMarquee('fit');
    emit(NEAR, wrapper, true);
    emit(VISIBLE, wrapper, false);
    expect(videos.slice(5).every((video) => video.preload === 'metadata')).toBe(true);
    expect(playSpy).not.toHaveBeenCalled();
  });

  it('pauses everything and stops polling when the marquee leaves', () => {
    const { wrapper, videos } = renderMarquee('cover');
    emit(NEAR, wrapper, true);
    emit(VISIBLE, wrapper, true);
    emit(VISIBLE, wrapper, false);
    expect(videos.every((video) => video.paused)).toBe(true);
    emit(NEAR, wrapper, false);
    playSpy.mockReset();
    act(() => vi.advanceTimersByTime(1000));
    expect(playSpy).not.toHaveBeenCalled();
  });
});
