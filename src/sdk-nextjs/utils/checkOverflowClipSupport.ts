export function isOverflowClipSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof CSS !== 'undefined' && CSS.supports) {
    return CSS.supports('overflow', 'clip');
  }
  try {
    const testElement = document.createElement('div');
    testElement.style.overflow = 'clip';
    return testElement.style.overflow === 'clip';
  } catch {
    return false;
  }
}
