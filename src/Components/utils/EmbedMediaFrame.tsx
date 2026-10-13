import React, { CSSProperties, FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { EmbedMediaLike, EmbedPlayerMode, getEmbedAspect, getEmbedPlayerSrc } from './embedMedia';

export interface EmbedMediaFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  media: EmbedMediaLike;
  mode: EmbedPlayerMode;
  /** How the video fills the box, the way an image's object-fit would. */
  fit: 'cover' | 'contain';
  /** Whether the player takes the pointer; a background one leaves it to the box around it. */
  interactive?: boolean;
  /** Framed only while near the viewport, so a track of copies holds one player per visible card. */
  lazy?: boolean;
}

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
 * showing the stored thumbnail until the player is framed over it. A box with no height of its own
 * takes the video's aspect.
 */
export const EmbedMediaFrame: FC<EmbedMediaFrameProps> = ({
  media,
  mode,
  fit,
  interactive = mode === 'player',
  lazy = true,
  style,
  ...rest
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Size | null>(null);
  const [isNear, setIsNear] = useState(!lazy);
  const aspect = getEmbedAspect(media);

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

  const player = box && box.width > 0 && box.height > 0 ? fitPlayer(box, aspect, fit) : null;
  // a video drawn as an image is as wide as it may be, so an unsized or auto width fills the room
  const { width, ...restStyle } = style ?? {};
  const boxStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: `${aspect}`,
    width: width === undefined || width === 'auto' ? '100%' : width,
    ...restStyle,
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
    <div ref={boxRef} data-embed-frame="" style={boxStyle} {...rest}>
      {media.thumbnail && <img src={media.thumbnail} alt={media.name ?? ''} draggable={false} style={thumbnailStyle} />}
      {isNear && player && (
        <iframe
          src={getEmbedPlayerSrc(media, mode)}
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
            pointerEvents: interactive ? 'auto' : 'none',
          }}
        />
      )}
    </div>
  );
};
