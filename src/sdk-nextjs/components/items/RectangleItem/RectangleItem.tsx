import { FC, useEffect, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { getFill } from '../../../utils/getFill';
import { areFillsVisible } from '../../../utils/areFillsVisible/areFillsVisible';
import { RectangleItem as TRectangleItem } from '../../../../sdk/types/article/Item';
import { getLayoutStyles } from '../../../../utils';
import { FillLayer } from '../../../../sdk/types/article/Item';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { layouts } = useCntrlContext();
  const {
    fill: itemFill,
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    strokeFill: itemStrokeFill,
    blur: itemBlur,
    backdropBlur: itemBackdropBlur
  } = useRectangleItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const stateParams = interactionCtrl?.getState<number>(['angle', 'strokeWidth', 'radius', 'blur', 'backdropBlur']);
  const stateFillParams = interactionCtrl?.getState<FillLayer[]>(['fill']);
  const stateFillLayers = stateFillParams?.styles?.fill;
  const solidTransition = stateFillParams?.transition ?? 'none';
  const stateStrokeFillParams = interactionCtrl?.getState<FillLayer[]>(['strokeFill']);
  const stateStrokeFillLayers = stateStrokeFillParams?.styles?.strokeFill;
  const strokeSolidTransition = stateStrokeFillParams?.transition ?? 'none';
  const styles = stateParams?.styles ?? {};
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const backdropBlur = getStyleFromItemStateAndParams(styles?.backdropBlur, itemBackdropBlur);
  const radius = getStyleFromItemStateAndParams(styles?.radius, itemRadius);
  const strokeWidth = getStyleFromItemStateAndParams(styles?.strokeWidth, itemStrokeWidth);
  const angle = getStyleFromItemStateAndParams(styles?.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(styles?.blur, itemBlur);
  const backdropFilterValue = backdropBlur ? `blur(${backdropBlur * 100}vw)` : undefined;
  const isInteractive = areFillsVisible(stateFillLayers ?? itemFill ?? []) || (strokeWidth !== 0 && areFillsVisible(stateStrokeFillLayers ?? itemStrokeFill ?? []));
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  const strokeValue = stateStrokeFillLayers
    ? getStyleFromItemStateAndParams<FillLayer>(stateStrokeFillLayers[0], itemStrokeFill?.[0])
    : itemStrokeFill?.[0];
  const stroke = strokeValue
    ? getFill(strokeValue) ?? 'transparent'
    : 'transparent';

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`rectangle-${item.id}`}
          ref={setRef}
          style={{
            ...(strokeValue ? {
              '--stroke-background': stroke,
              ...(strokeValue.type === 'image' ? {
                backgroundPosition: 'center',
                backgroundSize: strokeValue.behavior === 'repeat' ? `${strokeValue.backgroundSize}%` : strokeValue.behavior,
                backgroundRepeat: strokeValue.behavior === 'repeat' ? 'repeat' : 'no-repeat'
              } : {})
            } : {}),
            ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
            ...(backdropFilterValue !== undefined
              ? { backdropFilter: backdropFilterValue, WebkitBackdropFilter: backdropFilterValue }
              : {}
            ),
            transition: stateParams?.transition ?? 'none'
          }}
        >
          <div
            className={`rectangle-border-${item.id}`}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 2,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              ...(strokeWidth !== 0 && strokeValue ? {
                ...(strokeWidth ? { padding: `${strokeWidth * 100}vw` } : {}),
                ...(strokeValue.type === 'solid' ? { transition: strokeSolidTransition, background: stroke } : {}),
                ...(strokeValue.type === 'image' ? {
                  backgroundPosition: 'center',
                  backgroundSize: strokeValue.behavior === 'repeat' ? `${strokeValue.backgroundSize}%` : strokeValue.behavior,
                  backgroundRepeat: strokeValue.behavior === 'repeat' ? 'repeat' : 'no-repeat'
                } : {
                  background: stroke,
                }
                )
              } : { background: stroke }),
            }}
          />
          {itemFill && itemFill.map((fill) => {
            const stateFillLayer = stateFillLayers?.find((layer) => layer.id === fill.id);
            const value = stateFillLayer
              ? (getStyleFromItemStateAndParams<FillLayer>(stateFillLayer, fill) ?? fill)
              : fill;
            const background = value
              ? getFill(value) ?? 'transparent'
              : 'transparent';

            return (
              <Fill fill={value} itemId={item.id} background={background} solidTransition={solidTransition} />
            );
          })}
        </div>
        <JSXStyle id={id}>{`
        .rectangle-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        },
        .image-fill-${item.id} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: center center;
          z-index: 1;
          background-position: center;
        },
        ${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
      return (`
            .rectangle-${item.id} {
              border-radius: ${layoutParams.radius * 100}vw
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              ${layoutParams.blur !== 0 ? 'will-change: transform;' : ''}
              backdrop-filter: ${layoutParams.backdropBlur !== 0 ? `blur(${layoutParams.backdropBlur * 100}vw)` : 'unset'};
              -webkit-backdrop-filter: ${layoutParams.backdropBlur !== 0 ? `blur(${layoutParams.backdropBlur * 100}vw)` : 'unset'};
            },
            .rectangle-border-${item.id} {
              position: absolute;
              inset: 0;
              border-radius: inherit;
              pointer-events: none;
              z-index: 2;
              -webkit-mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
            }
          `);
    })}
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};

function Fill({ fill, itemId, background, solidTransition }: { fill: FillLayer; itemId: string; background: string; solidTransition: string; }) {
  const isRotatedImage = fill.type === 'image' && fill.rotation && fill.rotation !== 0;

  return (
    <div
      key={fill.id}
      className={fill.type === 'image' ? `image-fill-${itemId}` : `fill-${itemId}`}
      style={{
        ...(fill.type === 'solid' ? { background, transition: solidTransition } : {}),
        ...(fill.type === 'image'
          ? {
              transform: `rotate(${fill.rotation}deg)`,
              backgroundImage: `url(${fill.src})`,
              backgroundSize: fill.behavior === 'repeat' ? `${fill.backgroundSize}%` : fill.behavior,
              backgroundRepeat: fill.behavior === 'repeat' ? 'repeat' : 'no-repeat',
              opacity: fill.opacity
            }
          : { background }),
        position: 'absolute',
        borderRadius: 'inherit',
        mixBlendMode: fill.blendMode as any,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...(isRotatedImage ? { overflow: 'hidden' } : {})
      }}
    >
    </div>
  );
};
