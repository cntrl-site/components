export function getFontBasedOnSystem(): string {
  return (window.navigator.platform === 'Win32' || window.navigator.platform === 'Win64')
    ? '"InputMono-Regular", monospace' : '"DepartureMono-Regular", monospace';
}
