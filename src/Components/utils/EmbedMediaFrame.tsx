import React, { CSSProperties, FC, HTMLAttributes, MouseEvent, useEffect, useRef, useState } from 'react';
import {
  EmbedCommand,
  EmbedMediaLike,
  getEmbedAspect,
  getEmbedPlayback,
  getEmbedPlayerSrc,
  getEmbedProvider,
  postEmbedCommand,
} from './embedMedia';

export interface EmbedMediaFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  media: EmbedMediaLike;
  /** How the video fills the box, the way an image's object-fit would. */
  fit: 'cover' | 'contain';
  /** Framed only while near the viewport, so a track of copies holds one player per visible card. */
  lazy?: boolean;
  /**
   * Played at once whatever starts it elsewhere: opening a lightbox, or pointing at what a preview shows for,
   * is already the gesture, and the click is left to the box around it.
   */
  startsAtOnce?: boolean;
  /**
   * Played as a silent loop whatever the media says, the click left to the box: a cell that opens a lightbox
   * shows the video there as it was set to play.
   */
  silentLoop?: boolean;
}

const SILENT_LOOP = { play: 'auto', controls: false, loop: true, muted: true } as const;

type Size = { width: number; height: number };
type Rect = Size & { left: number; top: number };

/** Where the player goes to fill or fit a box, as a replaced element with the video's aspect would. */
function fitPlayer(box: Size, aspect: number, fit: 'cover' | 'contain'): Rect {
  const boxAspect = box.width / box.height;
  const isWidthBound = fit === 'cover' ? aspect <= boxAspect : aspect >= boxAspect;
  const width = isWidthBound ? box.width : box.height * aspect;
  const height = isWidthBound ? box.width / aspect : box.height;
  return { width, height, left: (box.width - width) / 2, top: (box.height - height) / 2 };
}

/**
 * A Vimeo or YouTube video in the room of an image or a video: a box the caller sizes and places,
 * showing the stored thumbnail until the player is framed over it, and playing as the media says.
 * A video that waits for a hover or a click is framed only then, and paused and played again after.
 * Its controls, or a click that plays it, take the click, which then opens nothing around it; any
 * other video is clicked like a picture. A box with no height of its own takes the video's aspect.
 */
export const EmbedMediaFrame: FC<EmbedMediaFrameProps> = ({
  media: storedMedia,
  fit,
  lazy = true,
  startsAtOnce = false,
  silentLoop = false,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState<Size | null>(null);
  const [isNear, setIsNear] = useState(!lazy);
  const [isStarted, setIsStarted] = useState(false);
  const wantsPlayRef = useRef(false);
  const isLoadedRef = useRef(false);
  const media = silentLoop ? { ...storedMedia, ...SILENT_LOOP } : storedMedia;
  const aspect = getEmbedAspect(media);
  const provider = getEmbedProvider(media);
  const playback = getEmbedPlayback(media);
  const trigger = startsAtOnce ? 'auto' : playback.play;
  const ownsClick = !startsAtOnce && (playback.controls || playback.play === 'on-click');

  useEffect(() => {
    const element = boxRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      setBox(previous => (previous && previous.width === width && previous.height === height ? previous : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = boxRef.current;
    if (!lazy || !element || typeof IntersectionObserver === 'undefined') {
      setIsNear(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setIsNear(entry.isIntersecting), { rootMargin: '200px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [lazy]);

  // a player framed on demand goes with the box out of view, to wait for the next hover or click
  useEffect(() => {
    if (isNear) return;
    setIsStarted(false);
    wantsPlayRef.current = false;
  }, [isNear]);

  const player = box && box.width > 0 && box.height > 0 ? fitPlayer(box, aspect, fit) : null;
  const isFramed = isNear && player !== null && (trigger === 'auto' || isStarted);

  useEffect(() => {
    if (!isFramed) isLoadedRef.current = false;
  }, [isFramed]);

  const command = (name: EmbedCommand) => {
    if (iframeRef.current && provider) postEmbedCommand(iframeRef.current, provider, name);
  };
  const start = () => {
    wantsPlayRef.current = true;
    if (isStarted) command('play');
    else setIsStarted(true);
  };
  const stop = () => {
    wantsPlayRef.current = false;
    // a player still loading would start once loaded, so it is taken away instead
    if (isLoadedRef.current) command('pause');
    else setIsStarted(false);
  };
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!ownsClick) {
      onClick?.(e);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // a video with controls of its own is played and paused by them
    if (trigger !== 'on-click') return;
    if (wantsPlayRef.current) stop();
    else start();
  };
  // a video drawn as an image is as wide as it may be, so an unsized or auto width fills the room
  const { width, ...restStyle } = style ?? {};
  const boxStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: `${aspect}`,
    width: width === undefined || width === 'auto' ? '100%' : width,
    ...restStyle,
    ...(ownsClick && { cursor: 'pointer' }),
  };
  const thumbnailStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: fit,
    pointerEvents: 'none',
  };

  return (
    <div
      ref={boxRef}
      data-embed-frame=""
      style={boxStyle}
      {...rest}
      onClick={handleClick}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        if (trigger === 'on-hover') start();
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        if (trigger === 'on-hover') stop();
      }}
    >
      {media.thumbnail && <img src={media.thumbnail} alt={media.name ?? ''} draggable={false} style={thumbnailStyle} />}
      {isFramed && player && (
        <iframe
          ref={iframeRef}
          src={getEmbedPlayerSrc(media)}
          title={media.name || 'Embedded video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            left: player.left,
            top: player.top,
            width: player.width,
            height: player.height,
            border: 0,
            pointerEvents: playback.controls ? 'auto' : 'none',
          }}
          onLoad={() => {
            isLoadedRef.current = true;
            command('listen');
          }}
        />
      )}
    </div>
  );
};
