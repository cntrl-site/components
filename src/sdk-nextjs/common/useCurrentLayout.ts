import { useCntrlContext } from '../provider/useCntrlContext';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArticleRectContext } from '../provider/ArticleRectContext';

interface LayoutData {
  layoutId: string;
  exemplary: number;
  start: number;
  end: number;
}

type UseCurrentLayoutReturn = {
  layoutId: string | undefined;
  layoutDeviation: number;
};

export function useCurrentLayout(): UseCurrentLayoutReturn {
  const { layouts } = useCntrlContext();
  const articleRectObserver = useContext(ArticleRectContext);
  const layoutRanges = useMemo(() => {
    const sorted = layouts.slice().sort((la, lb) => la.startsWith - lb.startsWith);
    return sorted.reduce<LayoutData[]>((acc, layout, i, layouts) => {
      const next = layouts[i + 1];
      return [
        ...acc,
        {
          layoutId: layout.id,
          exemplary: layout.exemplary,
          start: layout.startsWith,
          end: next ? next.startsWith : Number.MAX_SAFE_INTEGER
        }
      ];
    }, []);
  }, [layouts]);
  const getCurrentLayout = useCallback((articleWidth: number) => {
    const range = layoutRanges.find(l => articleWidth >= l.start && articleWidth < l.end);
    return range;
  }, [layoutRanges]);
  const [layoutId, setLayoutId] = useState<string | undefined>(undefined);
  const [deviation, setDeviation] = useState(1);
  useEffect(() => {
    if (!articleRectObserver) return;
    return articleRectObserver.on('resize', () => {
      const articleWidth = articleRectObserver.width;
      const { layoutId, exemplary } = getCurrentLayout(articleWidth)!;
      setLayoutId(layoutId);
      setDeviation(articleWidth / exemplary);
    });
  }, [articleRectObserver, getCurrentLayout]);

  return { layoutId, layoutDeviation: deviation };
}
