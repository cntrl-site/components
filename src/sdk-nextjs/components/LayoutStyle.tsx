import React, { FC } from 'react';
import JSXStyle from 'styled-jsx/style';
import { Layout } from '../../sdk/types/project/Layout';
import { getLayoutMediaQuery } from '../../utils';

export interface LayoutStyleProps {
  id: string;
  layouts: Layout[];
  layoutId: string;
  children?: (layout: Layout) => string;
}

export const LayoutStyle: FC<LayoutStyleProps> = ({ id, layouts, layoutId, children }) => {
  const layout = layouts.find(l => l.id === layoutId)!;
  return (
    <JSXStyle id={id}>{`
      ${getLayoutMediaQuery(layoutId, layouts)} {
        ${children?.(layout)}
      }
    `}</JSXStyle>
  );
};
