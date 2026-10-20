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

const loaded = new Map<string, ComponentElement>();
const pending = new Map<string, Promise<ComponentElement | undefined>>();

export function hasComponentElement(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(loaders, id);
}

export function getComponentElement(id: string): ComponentElement | undefined {
  return loaded.get(id);
}

export function loadComponentElement(id: string): Promise<ComponentElement | undefined> {
  let promise = pending.get(id);
  if (!promise) {
    promise = hasComponentElement(id)
      ? loaders[id]()
        .then((element) => {
          loaded.set(id, element);
          return element;
        })
        .catch((error) => {
          pending.delete(id);
          throw error;
        })
      : Promise.resolve(undefined);
    pending.set(id, promise);
  }
  return promise;
}
