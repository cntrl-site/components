import type { ComponentType } from 'react';

export type ComponentElement = ComponentType<any>;

const loaders: Record<string, () => Promise<ComponentElement>> = {
  'basic-burger': () => import('./Components/Burger/Burger').then(m => m.Burger),
  'click-gallerie': () => import('./Components/ClickGallerie/ClickGallerie').then(m => m.ClickGallerie),
  'control-slider': () => import('./Components/ControlSlider/ControlSlider').then(m => m.ControlSlider),
  'faq': () => import('./Components/FAQ/FAQ').then(m => m.FAQ),
  'form': () => import('./Components/Form/Form').then(m => m.Form),
  'grid': () => import('./Components/Grid/Grid').then(m => m.Grid),
  'helix': () => import('./Components/Helix/Helix').then(m => m.Helix),
  'hive': () => import('./Components/Hive/Hive').then(m => m.Hive),
  'control-image-reveal': () => import('./Components/ImageRevealSlider/ImageRevealSlider').then(m => m.ImageRevealSlider),
  'lightbox': () => import('./Components/Lightbox/Lightbox').then(m => m.LightboxGallery),
  'lightbox-journal': () => import('./Components/LightboxJournal/LightboxJournal').then(m => m.LightboxJournal),
  'lightbox-strip': () => import('./Components/LightboxStrip/LightboxStrip').then(m => m.LightboxStrip),
  'list': () => import('./Components/List/List').then(m => m.List),
  'marquee': () => import('./Components/Marquee/Marquee').then(m => m.Marquee),
  'marquee-text': () => import('./Components/MarqueeText/MarqueeText').then(m => m.MarqueeText),
  'mercury': () => import('./Components/Mercury/Mercury').then(m => m.Mercury),
  'oneliner-form': () => import('./Components/OnelinerForm/OnelinerForm').then(m => m.OnelinerForm),
  'pretext': () => import('./Components/Pretext/Pretext').then(m => m.Pretext),
  'scale': () => import('./Components/Scale/Scale').then(m => m.Scale),
  'simple-button': () => import('./Components/SimpleButton/SimpleButton').then(m => m.SimpleButton),
  'slider-2-0': () => import('./Components/Slider20/Slider20').then(m => m.Slider20),
  'testimonials': () => import('./Components/TestimonialGrid/TestimonialGrid').then(m => m.TestimonialGrid),
  'testimonial-single': () => import('./Components/TestimonialSingle/TestimonialSingle').then(m => m.TestimonialSingle),
  'waterfall': () => import('./Components/Waterfall/Waterfall').then(m => m.Waterfall),
};

export const componentElementIds = Object.keys(loaders);

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

type LoadState = {
  request: Promise<ComponentElement | undefined>;
  loading: boolean;
  failures: number;
  retryAt: number;
};

const loaded = new Map<string, ComponentElement>();
const states = new Map<string, LoadState>();

export function hasComponentElement(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(loaders, id);
}

export function getComponentElement(id: string): ComponentElement | undefined {
  return loaded.get(id);
}

export function hasComponentElementFailed(id: string): boolean {
  return (states.get(id)?.failures ?? 0) > 0;
}

const canRetry = (state: LoadState): boolean =>
  !state.loading && state.failures > 0 && state.failures < MAX_ATTEMPTS && Date.now() >= state.retryAt;

export function loadComponentElement(id: string): Promise<ComponentElement | undefined> {
  if (!hasComponentElement(id)) return Promise.resolve(undefined);
  const previous = states.get(id);
  if (previous && !canRetry(previous)) return previous.request;

  const state: LoadState = {
    loading: true,
    failures: previous?.failures ?? 0,
    retryAt: 0,
    request: loaders[id]()
      .then(
        (element) => {
          loaded.set(id, element);
          state.failures = 0;
          return element;
        },
        (error) => {
          state.failures += 1;
          state.retryAt = Date.now() + RETRY_DELAY_MS * 2 ** (state.failures - 1);
          throw error;
        },
      )
      .finally(() => {
        state.loading = false;
      }),
  };
  states.set(id, state);
  return state.request;
}
