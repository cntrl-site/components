import React, { FC, useEffect, useId, useState } from 'react';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { LinkWrapper } from '../LinkWrapper';
import { ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { CompoundChild } from './CompoundChild';
import { useCompoundItem } from './useCompoundItem';
import { CompoundItem as TCompoundItem } from '../../../../sdk/types/article/Item';
import { getLayoutStyles } from '../../../../utils';

export const CompoundItem: FC<ItemProps<TCompoundItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { items } = item;
  const itemAngle = useItemAngle(item, sectionId);
  const { layouts } = useCntrlContext();
  const { opacity: itemOpacity } = useCompoundItem(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState<number>(['opacity', 'angle']);
  const angle = getStyleFromItemStateAndParams(stateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(stateParams?.styles?.opacity, itemOpacity);
  const isInteractive = opacity !== 0 && opacity !== undefined;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`compound-${item.id}`}
          ref={setRef}
          style={{
            ...(opacity !== undefined ? { opacity } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            transition: stateParams?.transition ?? 'none'
          }}
        >
          {items && items.map(item => (
            <CompoundChild
              item={item}
              key={item.id}
              sectionId={sectionId}
              isParentVisible={isInteractive}
            />
          ))}
        </div>
        <JSXStyle id={id}>{`
        .compound-${item.id} {
          overflow: ${item.commonParams.overflow};
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
          return (`
            .compound-${item.id} {
              opacity: ${layoutParams.opacity};
              transform: rotate(${area.angle}deg);
            }
          `);
        })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
