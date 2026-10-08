const svgMaskUrlCache = new Map<string, Promise<string>>();

export function isInlineMaskUrl(url: string): boolean {
  return url.startsWith('data:') || url.startsWith('blob:');
}

export function loadSvgMaskUrl(url: string): Promise<string> {
  if (isInlineMaskUrl(url)) return Promise.resolve(url);
  const cached = svgMaskUrlCache.get(url);
  if (cached) return cached;
  const pending = fetch(url, { mode: 'cors', cache: 'reload' })
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.blob();
    })
    .then((blob) => URL.createObjectURL(blob))
    .catch((error) => {
      svgMaskUrlCache.delete(url);
      throw error;
    });
  svgMaskUrlCache.set(url, pending);
  return pending;
}
