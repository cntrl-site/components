import { useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export function useRegisterResize(ref: HTMLElement | null, onResize?: (height: number) => void) {
  useEffect(() => {
    if (!ref || !onResize) return;
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      onResize(entry.target.clientHeight / window.innerWidth);
    });
    observer.observe(ref);
    return () => {
      observer.unobserve(ref);
    };
  }, [ref, onResize]);
}
