import { useEffect, useState } from 'react';
import { ArticleRectObserver } from './ArticleRectObserver';

export const useArticleRectObserver = (el?: HTMLElement | null) => {
  const [articleRectObserver, setArticleRectObserver] = useState<ArticleRectObserver | null>(null);

  useEffect(() => {
    setArticleRectObserver(new ArticleRectObserver());
  }, []);

  useEffect(() => {
    if (!el || !articleRectObserver) return;
    return articleRectObserver.init(el);
  }, [el, articleRectObserver]);

  return articleRectObserver;
};
