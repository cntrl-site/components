import { useEffect, useState } from 'react';
import { YT } from './YoutubeIframeApi';
import { YouTubeIframeApiLoader } from './YouTubeIframeApiLoader';

export function useYouTubeIframeApi(): YT | undefined {
  const [YT, setYT] = useState<YT | undefined>(undefined);
  useEffect(() => {
    const loader = YouTubeIframeApiLoader.create();
    loader.getApi().then((YT) => setYT(YT));
  }, []);
  return YT;
}
