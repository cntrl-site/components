import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarqueeText, type MarqueeTextSettings } from './MarqueeText';

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

const WRAPPER_WIDTH = 400;
const ITEM_WIDTH = 50;

const settings = (overrides: Partial<MarqueeTextSettings> = {}): MarqueeTextSettings => ({
  speed: 1,
  direction: 'left',
  pauseOnHover: 'off',
  gap: 0,
  layoutType: 'curve',
  curveAmplitude: 12,
  curveFrequency: 18,
  textFontFamily: 'serif',
  textFontSettings: { fontWeight: 400, fontStyle: 'normal' },
  textFontSize: 0.05,
  textLetterSpacing: 0,
  textWordSpacing: 0,
  textTextAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
  textColor: '#000',
  backgroundColor: '#fff',
  ...overrides,
});
const content = [{ text: 'Wave' }];

const frames = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;
let container: HTMLDivElement;
let root: Root;

function runFrames(count = 1) {
  for (let i = 0; i < count; i++) {
    const callbacks = [...frames.values()];
    frames.clear();
    act(() => callbacks.forEach((callback) => callback(performance.now())));
  }
}

function render(props: Partial<Parameters<typeof MarqueeText>[0]> = {}) {
  act(() => root.render(<MarqueeText settings={settings()} content={content} {...props} />));
  runFrames(5);
  return container.querySelector('[aria-label="Marquee text"]') as HTMLElement;
}

function visibleObserver() {
  const observer = FakeIntersectionObserver.instances.find((instance) => instance.options.rootMargin === '0px');
  if (!observer) throw new Error('no on-screen observer');
  return observer;
}

function setOnScreen(wrapper: HTMLElement, isOnScreen: boolean) {
  act(() => visibleObserver().emit(wrapper, isOnScreen));
}

function glyphTransforms() {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-marquee-wave-node] > span'), (glyph) => glyph.style.transform);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextFrameId++;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function offsetWidth(this: HTMLElement) {
    if (this.parentElement?.hasAttribute('data-direction')) return this.children.length * ITEM_WIDTH;
    return WRAPPER_WIDTH;
  });
  frames.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('MarqueeText curve wave', () => {
  it('does not run the wave loop before it is known to be on screen', () => {
    render();
    expect(glyphTransforms().some(Boolean)).toBe(true);
    expect(frames.size).toBe(0);
  });

  it('ticks every frame while on screen and stops when it leaves', () => {
    const wrapper = render();
    setOnScreen(wrapper, true);
    expect(frames.size).toBe(1);
    runFrames(3);
    expect(frames.size).toBe(1);

    setOnScreen(wrapper, false);
    expect(frames.size).toBe(0);
    runFrames(3);
    expect(frames.size).toBe(0);
  });

  it('skips wave updates off screen and applies them as soon as it comes back', () => {
    const wrapper = render();
    setOnScreen(wrapper, true);
    const before = glyphTransforms();
    setOnScreen(wrapper, false);

    act(() => root.render(<MarqueeText settings={settings({ curveAmplitude: 6 })} content={content} />));
    runFrames(5);
    expect(glyphTransforms()).toEqual(before);
    expect(frames.size).toBe(0);

    setOnScreen(wrapper, true);
    const after = glyphTransforms();
    expect(after).toHaveLength(before.length);
    expect(after.every((transform, index) => transform !== '' && transform !== before[index])).toBe(true);
    expect(frames.size).toBe(1);
  });

  it('keeps a paused editor wave in sync while on screen without looping', () => {
    const wrapper = render({ isEditor: true });
    setOnScreen(wrapper, true);
    runFrames(2);
    expect(frames.size).toBe(0);

    const before = glyphTransforms();
    act(() => root.render(<MarqueeText settings={settings({ curveAmplitude: 6 })} content={content} isEditor />));
    const after = glyphTransforms();
    expect(after).toHaveLength(before.length);
    expect(after.every((transform, index) => transform !== '' && transform !== before[index])).toBe(true);
    runFrames(2);
    expect(frames.size).toBe(0);
  });

  it('stops observing on unmount', () => {
    const wrapper = render();
    act(() => root.render(null));
    expect(visibleObserver().targets.has(wrapper)).toBe(false);
  });

  it('keeps ticking where IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render();
    expect(frames.size).toBe(1);
    runFrames(3);
    expect(frames.size).toBe(1);
  });
});
