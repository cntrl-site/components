import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from 'react';
import { InteractionsRegistry } from '../interactions/InteractionsRegistry';
import { Article } from '../../sdk/types/article/Article';
import { useCurrentLayout } from '../common/useCurrentLayout';
import { ArticleRectContext } from './ArticleRectContext';

export const InteractionsContext = createContext<InteractionsRegistry | undefined>(undefined);

interface Props {
  article: Article;
}

export const InteractionsProvider: FC<PropsWithChildren<Props>> = ({ article, children }) => {
  const { layoutId } = useCurrentLayout();
  const articleRectObserver = useContext(ArticleRectContext);
  const registry = useMemo(() => {
    if (!layoutId) return;
    return new InteractionsRegistry(article, layoutId);
  }, [layoutId]);

  useEffect(() => {
    if (!registry || !articleRectObserver) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      registry.notifyScroll(scrollY);
    };
    return articleRectObserver.on('scroll', handleScroll);
  }, [registry, articleRectObserver]);

  const notifyLoad = useCallback(() => {
    if (!registry) return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        registry.notifyLoad();
      }, 0);
    });
  }, [registry]);

  useEffect(() => {
    if (document.readyState === 'complete') {
      notifyLoad();
    } else {
      window.addEventListener('load', notifyLoad);
    }

    return () => window.removeEventListener('load', notifyLoad);
  }, [notifyLoad]);

  return (
    <InteractionsContext.Provider value={registry}>
      {children}
    </InteractionsContext.Provider>
  );
};

export function useInteractionsRegistry(): InteractionsRegistry | undefined {
  const registry = useContext(InteractionsContext);
  return registry;
}
