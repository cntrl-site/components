import { useEffect, useState } from 'react';

export function useElementRect(element: HTMLElement | null): DOMRect | undefined {
  const [rect, setRect] = useState<DOMRect | undefined>(() => element?.getBoundingClientRect());

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const el = entries.find(entry => entry.target === element);
      if (!el) {
        throw new Error('Element is not found in observed entries');
      }
      setRect(el.target.getBoundingClientRect());
    });
    observer.observe(element);
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [element]);

  return rect;
}
