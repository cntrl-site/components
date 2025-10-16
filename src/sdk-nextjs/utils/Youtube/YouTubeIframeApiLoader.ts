import { YT } from './YoutubeIframeApi';

const YT_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';

export class YouTubeIframeApiLoader {
  private static instance: YouTubeIframeApiLoader | undefined;

  public static create(): YouTubeIframeApiLoader {
    if (!YouTubeIframeApiLoader.instance) {
      YouTubeIframeApiLoader.instance = new YouTubeIframeApiLoader();
    }
    return YouTubeIframeApiLoader.instance;
  }

  private loadingPromise: Promise<void>;

  private constructor() {
    this.loadingPromise = this.loadApi();
  }

  async getApi(): Promise<YT> {
    await this.loadingPromise;
    if (!window.YT) {
      throw new Error('YouTube IFrame API is not loaded');
    }
    return window.YT;
  }

  private loadApi(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = YT_IFRAME_API_URL;
      const loadError = new Error('YouTube IFrame API loading failed');
      captureStackTrace(loadError);
      script.addEventListener('abort', () => {
        reject(loadError);
      });
      script.addEventListener('error', () => {
        reject(loadError);
      });
      window.onYouTubeIframeAPIReady = () => {
        window.onYouTubeIframeAPIReady = undefined;
        resolve();
      };
      document.head.appendChild(script);
    });
  }
}

export function captureStackTrace(error: Error): void {
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(error);
    return;
  }
  try {
    throw error;
  } catch (errWithStack) {}
}
