export const NEAR_VIEWPORT_MARGIN = '100% 0px';

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
