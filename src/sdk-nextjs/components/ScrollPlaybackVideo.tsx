import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { rangeMap } from '../utils/rangeMap';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { ScrollPlaybackVideoManager } from '../../sdk/ScrollPlaybackVideoManager/ScrollPlaybackVideoManager';

type PlaybackParams = { from: number, to: number };

interface Props {
  sectionId: string;
  src: string;
  playbackParams: PlaybackParams | null;
  style?: React.CSSProperties;
  className: string;
}

export const ScrollPlaybackVideo: FC<Props> = ({ sectionId, src, playbackParams, style, className}) => {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [time, setTime] = useState(0);
  const articleRectObserver = useContext(ArticleRectContext);

  useEffect(() => {
    if (!playbackParams || !articleRectObserver) return;
    return articleRectObserver.on('scroll', () => {
      const scrollPos = articleRectObserver.getSectionScroll(sectionId);
      const time = rangeMap(scrollPos, playbackParams.from, playbackParams.to, 0, 1, true);
      setTime(toFixed(time));
    });
  }, [playbackParams?.from, playbackParams?.to, time]);

  const scrollVideoManager = useMemo<ScrollPlaybackVideoManager | null>(() => {
    if (!containerElement) return null;
    const manager = new ScrollPlaybackVideoManager({
      src,
      videoContainer: containerElement
    });
    return manager;
  }, [containerElement, src]);

  useEffect(() => {
    return () => {
      scrollVideoManager?.destroy();
    };
  }, [scrollVideoManager]);

  useEffect(() => {
    if (scrollVideoManager && time >= 0 && time <= 1) {
      scrollVideoManager.setTargetTimePercent(time);
    }
  }, [time, scrollVideoManager]);

  return <div className={className} style={style} ref={setContainerElement} />;
};

function toFixed(num: number) {
  return Number(num.toFixed(3));
}
