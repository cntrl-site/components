import { useContext, useEffect } from 'react';
import { ArticleRectContext } from '../../provider/ArticleRectContext';

export const useSectionRegistry = ( sectionId: string, el?: HTMLElement | null) => {
  const articleRectObserver = useContext(ArticleRectContext);

  useEffect(() => {
    if (!el || !articleRectObserver) return;
    return articleRectObserver.register(el, sectionId);
  }, [el, articleRectObserver]);
};
