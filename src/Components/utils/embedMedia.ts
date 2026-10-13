export type EmbedProvider = 'vimeo' | 'youtube';

/** What a media value holds of a Vimeo or YouTube video: its player url, and the picture and size the player has none of. */
export type EmbedMediaLike = {
  assetId?: string;
  type?: string;
  name?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
};

export type EmbedPlayerMode = 'background' | 'player';

const PLAYER_HOSTS: Record<EmbedProvider, RegExp> = {
  vimeo: /^player\.vimeo\.com$/i,
  youtube: /^(?:www\.)?youtube(?:-nocookie)?\.com$/i,
};

/** The provider whose player a media is framed from, none for a file or a value that only claims to be one. */
export function getEmbedProvider(media: EmbedMediaLike | null | undefined): EmbedProvider | null {
  if (!media?.assetId || (media.type !== 'vimeo' && media.type !== 'youtube')) return null;
  try {
    const url = new URL(media.assetId);
    if (!PLAYER_HOSTS[media.type].test(url.hostname)) return null;
    if (media.type === 'youtube' && !url.pathname.startsWith('/embed/')) return null;
    return media.type;
  } catch {
    return null;
  }
}

export function isEmbedMedia(media: EmbedMediaLike | null | undefined): boolean {
  return getEmbedProvider(media) !== null;
}

/** Width over height of the video, 16:9 when the media does not say. */
export function getEmbedAspect(media: EmbedMediaLike): number {
  const { width, height } = media;
  return width && height && width > 0 && height > 0 ? width / height : 16 / 9;
}

/**
 * The player url with the way it plays: `background` runs it the way a muted looping video does,
 * `player` starts it with the provider's own controls.
 */
export function getEmbedPlayerSrc(media: EmbedMediaLike, mode: EmbedPlayerMode): string {
  const provider = getEmbedProvider(media);
  if (!provider || !media.assetId) return media.assetId ?? '';
  const url = new URL(media.assetId);
  const params = url.searchParams;
  if (provider === 'vimeo') {
    params.set('autoplay', '1');
    if (mode === 'background') {
      params.set('background', '1');
      params.set('muted', '1');
      params.set('loop', '1');
    }
  } else {
    params.set('autoplay', '1');
    params.set('playsinline', '1');
    params.set('rel', '0');
    if (mode === 'background') {
      params.set('mute', '1');
      params.set('loop', '1');
      // a looping youtube player needs the video named again as its playlist
      params.set('playlist', url.pathname.slice('/embed/'.length));
      params.set('controls', '0');
      params.set('modestbranding', '1');
    }
  }
  return url.toString();
}
