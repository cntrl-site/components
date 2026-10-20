export type EmbedProvider = 'vimeo' | 'youtube';

export type EmbedPlayMode = 'auto' | 'on-hover' | 'on-click';

/**
 * What a media value holds of a Vimeo or YouTube video: its player url, the picture and size the player has
 * none of, and how it plays, as the editor's embed form set it.
 */
export type EmbedMediaLike = {
  assetId?: string;
  type?: string;
  name?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  play?: EmbedPlayMode;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
};

export type EmbedPlayback = {
  play: EmbedPlayMode;
  controls: boolean;
  loop: boolean;
  muted: boolean;
};

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
 * How the video plays: a media that does not say plays as an uploaded video does, on its own, muted and
 * looping, with no controls. Only a click lets sound play, and YouTube's player, with no loop or sound to
 * set, loops and is muted until clicked.
 */
export function getEmbedPlayback(media: EmbedMediaLike): EmbedPlayback {
  const play = media.play ?? 'auto';
  const controls = media.controls ?? false;
  const isClicked = play === 'on-click';
  if (getEmbedProvider(media) === 'youtube') return { play, controls, loop: true, muted: !isClicked };
  return { play, controls, loop: media.loop ?? true, muted: !isClicked || (media.muted ?? true) };
}

/** The player url set to play at once the way the media says; a player waiting for a hover or a click is framed only then. */
export function getEmbedPlayerSrc(media: EmbedMediaLike): string {
  const provider = getEmbedProvider(media);
  if (!provider || !media.assetId) return media.assetId ?? '';
  const { play, controls, loop, muted } = getEmbedPlayback(media);
  const url = new URL(media.assetId);
  const params = url.searchParams;
  const flag = (value: boolean) => (value ? '1' : '0');
  if (provider === 'vimeo') {
    // background mode is a paid Vimeo feature; on a free owner's video the other settings keep it as close as the player allows
    if (play === 'auto' && !controls && loop && muted) params.set('background', '1');
    params.set('autoplay', '1');
    params.set('muted', flag(muted));
    params.set('loop', flag(loop));
    params.set('controls', flag(controls));
    params.set('title', '0');
    params.set('byline', '0');
    params.set('portrait', '0');
    // several players share a page, and by default one starting pauses the others
    params.set('autopause', '0');
  } else {
    params.set('autoplay', '1');
    params.set('mute', flag(muted));
    params.set('loop', '1');
    // a looping youtube player needs the video named again as its playlist
    params.set('playlist', url.pathname.slice('/embed/'.length));
    params.set('controls', flag(controls));
    params.set('disablekb', flag(!controls));
    // the player is paused and played again by messages, which it takes only with its api on
    params.set('enablejsapi', '1');
    params.set('iv_load_policy', '3');
    params.set('playsinline', '1');
    params.set('rel', '0');
    params.set('modestbranding', '1');
  }
  return url.toString();
}

export type EmbedCommand = 'listen' | 'play' | 'pause';

/** The message a provider's player takes for a command; a youtube player takes commands once a page says it listens. */
function getEmbedMessage(provider: EmbedProvider, command: EmbedCommand): object | null {
  if (provider === 'vimeo') return command === 'listen' ? null : { method: command };
  if (command === 'listen') return { event: 'listening', id: 1, channel: 'widget' };
  return { event: 'command', func: command === 'play' ? 'playVideo' : 'pauseVideo', args: [] };
}

/** Plays or pauses a framed player through the messages its provider's player listens to. */
export function postEmbedCommand(iframe: HTMLIFrameElement, provider: EmbedProvider, command: EmbedCommand): void {
  const message = getEmbedMessage(provider, command);
  const target = iframe.contentWindow;
  if (!message || !target) return;
  try {
    target.postMessage(JSON.stringify(message), new URL(iframe.src).origin);
  } catch {
    // a frame with no player url of its own takes no commands
  }
}
