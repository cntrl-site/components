import type { HiveLightboxTextEntry } from '../Hive/HiveLightboxTitles';
import { getDisplayedImageRect } from '../utils/getImageRect';
import {
  type AnimRect,
  type CloseTargetTracker,
  type LightboxEntryData,
  type WaterfallMedia,
} from '../Waterfall/WaterfallLightbox';

export type HelixMedia = WaterfallMedia;

export type HelixMediaPair = {
  media: HelixMedia[];
};

export type HelixLightboxContentItem = {
  title1?: string;
  title2?: string;
  title3?: string;
  /** @deprecated use `gallery` */
  image?: HelixMedia;
  gallery?: HelixMediaPair[] | HelixMedia[];
};

const EMPTY_MEDIA: HelixMedia = { url: '', name: '', objectFit: 'cover' };

type DisplayItem = {
  displayMedia: HelixMedia;
  lightboxMedia: HelixMedia | null;
};

function isVideoMedia(media: HelixMedia): boolean {
  if (media.type === 'video') return true;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(media.url);
}

function isMediaPairGallery(gallery: unknown): gallery is HelixMediaPair[] {
  if (!Array.isArray(gallery) || gallery.length === 0) return false;
  const first = gallery[0];
  return first !== null && typeof first === 'object' && 'media' in first && Array.isArray(first.media);
}

function normalizeLegacyImage(item: HelixLightboxContentItem): HelixMediaPair[] | undefined {
  const legacy = item.image;
  if (!legacy?.url) return undefined;
  return [{
    media: [
      { ...legacy, url: legacy.url },
      { ...legacy, url: legacy.url },
    ],
  }];
}

export function normalizeHelixGallery(item: HelixLightboxContentItem): HelixMediaPair[] | undefined {
  const gallery = item.gallery ?? normalizeLegacyImage(item);
  if (!gallery) return undefined;
  if (isMediaPairGallery(gallery)) return gallery;
  if (!Array.isArray(gallery)) return undefined;

  const [gridImage, lightboxImage] = gallery as HelixMedia[];
  const grid = gridImage?.url ? gridImage : undefined;
  const lightbox = lightboxImage?.url ? lightboxImage : undefined;
  if (!grid && !lightbox) return undefined;

  return [{
    media: [
      lightbox ?? grid ?? EMPTY_MEDIA,
      grid ?? lightbox ?? EMPTY_MEDIA,
    ],
  }];
}

function getDisplayMediaForPair(pair: HelixMediaPair): HelixMedia | null {
  const [, second] = pair.media;
  if (second?.url) return second;
  const [first] = pair.media;
  if (first?.url) return first;
  return null;
}

function getLightboxMediaForPair(pair: HelixMediaPair): HelixMedia | null {
  const [first] = pair.media;
  if (first?.url) return first;
  return null;
}

export function getHelixDisplayItems(gallery: HelixMediaPair[] | HelixMedia[] | undefined): DisplayItem[] {
  if (!Array.isArray(gallery) || gallery.length === 0) return [];

  if (isMediaPairGallery(gallery)) {
    const result: DisplayItem[] = [];
    for (const pair of gallery) {
      const displayMedia = getDisplayMediaForPair(pair);
      if (!displayMedia) continue;

      const lightboxMedia = getLightboxMediaForPair(pair);
      result.push({
        displayMedia,
        lightboxMedia: lightboxMedia?.url ? lightboxMedia : null,
      });
    }
    return result;
  }

  return (gallery as HelixMedia[])
    .filter((media) => media?.url)
    .map((media) => ({
      displayMedia: media,
      lightboxMedia: media,
    }));
}

export function getHelixContentItems(content: HelixLightboxContentItem[] | undefined): HelixLightboxContentItem[] {
  return (content ?? []).filter((item) => {
    const gallery = normalizeHelixGallery(item);
    return getHelixDisplayItems(gallery).length > 0;
  });
}

export function buildHelixLightboxEntries(content: HelixLightboxContentItem[]): LightboxEntryData[] {
  return content.reduce<LightboxEntryData[]>((acc, item, gridIndex) => {
    const gallery = normalizeHelixGallery(item);
    const displayItems = getHelixDisplayItems(gallery);
    const lightboxItems = displayItems
      .filter((entry) => entry.lightboxMedia)
      .map((entry) => entry.lightboxMedia!);
    if (lightboxItems.length === 0) return acc;

    acc.push({
      gridIndex,
      items: lightboxItems,
      entry: {
        title1: item.title1 ?? '',
        title2: item.title2 ?? '',
        title3: item.title3 ?? '',
      } satisfies HiveLightboxTextEntry,
    });
    return acc;
  }, []);
}

export function collectAllHelixMedia(content: HelixLightboxContentItem[]): HelixMedia[] {
  const seen = new Set<string>();
  const result: HelixMedia[] = [];

  for (const item of content) {
    const gallery = normalizeHelixGallery(item);
    const displayItems = getHelixDisplayItems(gallery);
    for (const entry of displayItems) {
      for (const media of [entry.displayMedia, entry.lightboxMedia]) {
        if (media?.url && !seen.has(media.url)) {
          seen.add(media.url);
          result.push(media);
        }
      }
    }
  }

  return result;
}

export function getHelixMediaClickSourceRect(
  target: HTMLElement,
  objectFit: 'cover' | 'contain',
): AnimRect {
  if (objectFit === 'contain' && target instanceof HTMLImageElement) {
    const rect = getDisplayedImageRect(target);
    return { left: rect.x, top: rect.y, width: rect.width, height: rect.height };
  }

  const cb = target.getBoundingClientRect();
  return { left: cb.left, top: cb.top, width: cb.width, height: cb.height };
}

function getVisibleAreaCenter(container: HTMLElement): { x: number; y: number } {
  const view = container.ownerDocument.defaultView ?? window;
  const containerRect = container.getBoundingClientRect();
  const visibleLeft = Math.max(containerRect.left, 0);
  const visibleRight = Math.min(containerRect.right, view.innerWidth);
  const visibleTop = Math.max(containerRect.top, 0);
  const visibleBottom = Math.min(containerRect.bottom, view.innerHeight);

  return {
    x: (visibleLeft + visibleRight) / 2,
    y: (visibleTop + visibleBottom) / 2,
  };
}

function isRectIntersectingViewport(rect: AnimRect, view: Window): boolean {
  return rect.left + rect.width > 0
    && rect.left < view.innerWidth
    && rect.top + rect.height > 0
    && rect.top < view.innerHeight;
}

type HelixCloseTarget = {
  mediaEl: HTMLElement;
  itemEl: HTMLElement;
  rect: AnimRect;
  opacity: number;
};

const VISIBILITY_SAMPLES: Array<[number, number]> = [
  [0.5, 0.5],
  [0.25, 0.25],
  [0.75, 0.25],
  [0.25, 0.75],
  [0.75, 0.75],
];

function getUnoccludedRatio(
  container: HTMLElement,
  itemEl: HTMLElement,
  rect: AnimRect,
): number {
  const doc = container.ownerDocument;
  if (typeof doc.elementsFromPoint !== 'function') return 1;

  let hits = 0;
  for (const [fx, fy] of VISIBILITY_SAMPLES) {
    const x = rect.left + rect.width * fx;
    const y = rect.top + rect.height * fy;
    // The lightbox overlay sits above everything, so take the topmost element inside the helix.
    const topInHelix = doc.elementsFromPoint(x, y).find((el) => container.contains(el));
    if (topInHelix && itemEl.contains(topInHelix)) hits += 1;
  }
  return hits / VISIBILITY_SAMPLES.length;
}

function pickHelixCloseTarget(
  container: HTMLElement,
  contentIndex: number,
  objectFit: 'cover' | 'contain',
): HelixCloseTarget | null {
  const nodes = container.querySelectorAll(`[data-helix-index="${contentIndex}"]`);
  const view = container.ownerDocument.defaultView ?? window;
  const targetCenter = getVisibleAreaCenter(container);

  let bestTarget: HelixCloseTarget | null = null;
  let bestScore = Infinity;

  nodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const item = node.parentElement?.closest('[class*="-item"]');
    if (!(item instanceof HTMLElement)) return;

    const itemOpacity = Number.parseFloat(window.getComputedStyle(item).opacity);
    const rect = getHelixMediaClickSourceRect(node, objectFit);
    if (!rect.width || !rect.height) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = centerX - targetCenter.x;
    const dy = centerY - targetCenter.y;
    // Prefer the turn closest to the vertical center, then horizontal orbit position.
    let score = dy * dy * 4 + dx * dx;
    // Off-screen, faded or covered copies are only used when nothing better exists.
    if (!isRectIntersectingViewport(rect, view)) {
      score += 1e12;
    } else {
      score += (1 - getUnoccludedRatio(container, item, rect)) * 1e10;
    }
    if (itemOpacity < 0.25) score += 1e11;

    if (score < bestScore) {
      bestScore = score;
      bestTarget = {
        mediaEl: node,
        itemEl: item,
        rect,
        opacity: Number.isFinite(itemOpacity) ? itemOpacity : 1,
      };
    }
  });

  return bestTarget;
}

export function getHelixItemSourceRect(
  container: HTMLElement,
  contentIndex: number,
  objectFit: 'cover' | 'contain',
): AnimRect | null {
  return pickHelixCloseTarget(container, contentIndex, objectFit)?.rect ?? null;
}

export function createHelixCloseTracker(
  container: HTMLElement,
  contentIndex: number,
  objectFit: 'cover' | 'contain',
): CloseTargetTracker | null {
  const target = pickHelixCloseTarget(container, contentIndex, objectFit);
  if (!target) return null;

  const { mediaEl, itemEl } = target;
  return () => {
    if (!mediaEl.isConnected) return null;
    const inlineOpacity = Number.parseFloat(itemEl.style.opacity);
    const opacity = Number.isFinite(inlineOpacity)
      ? inlineOpacity
      : Number.parseFloat(window.getComputedStyle(itemEl).opacity) || 1;
    return {
      rect: getHelixMediaClickSourceRect(mediaEl, objectFit),
      opacity,
    };
  };
}

export { isVideoMedia as isHelixVideoMedia };
