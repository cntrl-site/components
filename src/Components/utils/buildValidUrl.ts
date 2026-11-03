const URL_PREFIXES = ['http://', 'https://', '/', 'mailto:', 'tel:', 'file:', 'ftp:', 'javascript', '#'];

export function buildValidUrl(url: string): string {
  return URL_PREFIXES.some(prefix => url.startsWith(prefix)) ? url : `//${url}`;
}
