import React, { CSSProperties, FC, PropsWithChildren } from 'react';
import { useCurrentLayout } from '../common/useCurrentLayout';
import { LayoutContext } from '../provider/LayoutContext';

export const ArticleWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { layoutId, layoutDeviation } = useCurrentLayout();
  const layoutDeviationStyle = { '--layout-deviation': layoutDeviation } as CSSProperties;

  return (
    <LayoutContext.Provider value={layoutId}>
      <div
        className="article-wrapper"
        style={{
          ...layoutDeviationStyle
        }}
      >
        {children}
      </div>
    </LayoutContext.Provider>
  );
};
