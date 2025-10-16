import { CSSProperties, FC, useEffect, useId, useRef, useState } from 'react';

export type TSectionVideo = {
  url: string;
  size: string;
  type: 'video';
  play: 'on-click' | 'auto';
  position: string;
  coverUrl: string | null;
  offsetX: number | null;
};

interface Props {
  container: HTMLDivElement;
  sectionId: string;
  media: TSectionVideo;
}

export const SectionVideo: FC<Props> = ({ container, sectionId, media }) => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [videoWrapper, setVideoWrapper] = useState<HTMLDivElement | null>(null);
  const [isVideoWidthOverflow, setIsVideoWidthOverflow] = useState(false);
  const { url, size, position, offsetX, coverUrl, play } = media;
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isClickedOnCover, setIsClickedOnCover] = useState(false);

  const handleCoverClick = () => {
    if (!video || play !== 'on-click') return;
    setIsClickedOnCover(true);
    if (isPlaying) {
      video.pause();
      setUserPaused(true);
    } else {
      video.play();
      setUserPaused(false);
    }
  };

  useEffect(() => {
    if (!video || play !== 'on-click') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (userPaused || !isClickedOnCover) return;
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, play, userPaused, isClickedOnCover]);

  useEffect(() => {
    if (!video || !videoWrapper) return;
    video.addEventListener('loadedmetadata', () => {
      const h = video.videoHeight;
      const w = video.videoWidth;
      const width = (videoWrapper.clientHeight / h) * w;
      if (width > videoWrapper.clientWidth) {
        setIsVideoWidthOverflow(true);
      } else {
        setIsVideoWidthOverflow(false);
      }
    });
  }, [video, videoWrapper]);

  const isContainHeight = size === 'contain-height';
  const hasOffsetX = offsetX !== null && size === 'contain';

  return (
    <>
      <div
        ref={setVideoWrapper}
        className={`section-video-wrapper-${sectionId}`}
        style={{
          position: position === 'fixed' ? 'sticky' : 'relative',
          height: position === 'fixed' ? '100vh' : '100%',
          top: position === 'fixed' ? '100vh' : '0',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <video
          ref={setVideo}
          autoPlay={play === 'auto'}
          loop
          style={{
            opacity: !isClickedOnCover && play === 'on-click' && coverUrl ? 0 : 1,
            objectFit: isContainHeight ? 'cover' : (size ?? 'cover') as CSSProperties['objectFit'],
            width: isContainHeight && !isVideoWidthOverflow ? 'auto' : '100%',
            transform: isContainHeight ? 'translateX(-50%)' : 'none',
            left: isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0'),
            height: '100%',
            position: 'relative'
          }}
          controls={play === 'on-click'}
          muted={play === 'auto'}
          playsInline
          preload="auto"
          className={`video-background-${sectionId}`}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={`${url}`} />
        </video>
        {play === 'on-click' && !isClickedOnCover && (
          <div
            className={`video-background-${sectionId}-cover-container`}
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              height: '100%',
              top: 0
            }}
            onClick={handleCoverClick}
          >
            {coverUrl && play === 'on-click' && (
              <img
                src={coverUrl}
                alt="Video cover"
                className={`video-background-${sectionId}-cover`}
                style={{
                  opacity: isPlaying ? 0 : 1,
                  left: isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0'),
                  width: isContainHeight ? 'auto' : '100%',
                  objectFit: isContainHeight ? 'unset' : (size ?? 'cover') as CSSProperties['objectFit'],
                  transform: isContainHeight ? 'translateX(-50%)' : 'none',
                  position: 'relative',
                  height: '100%',
                  transition: 'opacity 0.1s ease-in-out'
                }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};
