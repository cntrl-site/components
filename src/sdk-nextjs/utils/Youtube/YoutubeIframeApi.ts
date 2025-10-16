export interface YT {
  Player: YTPlayerConstructor;
}

export interface YTPlayerConstructor {
  new(container: string | Element, params: YTPlayerParams): YTPlayer;
}

export interface YTEvent<Data> {
  target: YTPlayer;
  data: Data;
}

type YTBool = 0 | 1 | '0' | '1';

export interface YTPlayerParams {
  width?: string | number;
  height?: string | number;
  videoId?: string;
  playerVars?: Partial<{
    autoplay: YTBool;
    cc_lang_pref: string;
    cc_load_policy: YTBool;
    color: string;
    controls: YTBool;
    disablekb: YTBool;
    enablejsapi: YTBool;
    end: number | string;
    fs: YTBool;
    hl: string;
    iv_load_policy: 1 | 3 | '1' | '3';
    list: string;
    listType: 'playlist' | 'user_uploads';
    loop: YTBool;
    origin: string;
    playlist: string;
    playsinline: YTBool;
    rel: YTBool;
    start: number | string;
    widget_referrer: string;
  }>;
  events?: Partial<{
    onReady: (event: YTEvent<void>) => void;
    onStateChange: (event: YTEvent<YTPlayerState>) => void;
  }>
}

export enum YTPlayerState {
  Unstarted = -1,
  Ended = 0,
  Playing = 1,
  Paused = 2,
  Buffering = 3,
  VideoCued = 5
}

export interface YTPlayer {
  loadVideoById(videoId: string, startSeconds?: number): void;
  loadVideoById(params: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }): void;

  loadVideoByUrl(mediaContentUrl: string, startSeconds?: number): void;
  loadVideoByUrl(params: {
    mediaContentUrl: string;
    startSeconds?: number;
    endSeconds?: number;
  }): void;

  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;

  mute(): void;
  unMute(): void;
  isMuted(): void;
  setVolume(volume: number): void;
  getVolume(): void;
  setSize(width: number, height: number): void;
  setLoop(loopPlaylists: boolean): void;

  getVideoLoadedFraction(): number;
  getPlayerState(): YTPlayerState;

  getDuration(): number; // in seconds
  getVideoUrl(): string;
  getVideoEmbedCode(): string;

  getIframe(): HTMLIFrameElement | undefined;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}
