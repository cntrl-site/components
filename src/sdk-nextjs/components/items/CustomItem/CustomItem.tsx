import { FC, useState } from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { useItemAngle } from '../useItemAngle';
import { CustomItem as TCustomItem } from '../../../../sdk/types/article/Item';
import { getLayoutStyles } from '../../../../utils';

export const CustomItem: FC<ItemProps<TCustomItem>> = ({ item, onResize, sectionId, interactionCtrl }) => {
  const sdk = useCntrlContext();
  const { layouts } = useCntrlContext();
  const itemAngle = useItemAngle(item, sectionId);
  const component = sdk.customItems.get(item.commonParams.name);
  const layoutValues: Record<string, any>[] = [item.area];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState<number>(['angle']);
  const angle = stateParams?.styles?.angle ?? itemAngle;
  if (!component) return null;
  return (
    <>
      <div
        className={`custom-component-${item.id}`}
        ref={setRef}
        style={{
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          transition: stateParams?.transition ?? 'none'
        }}
      >
        {component({})}
      </div>
      <JSXStyle id={item.id}>
        {`${getLayoutStyles(layouts, layoutValues, ([area]) => {
          return (`
            .custom-component-${item.id} {
              transform: rotate(${area.angle}deg);
              height: 100%;
              width: 100%;
              position: absolute;
              left: 0;
              top: 0;
            }
          `);
        })}`}
      </JSXStyle>
    </>
  );
};
