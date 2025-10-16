import { FC, useEffect, useId, useMemo, useState } from 'react';
import { CntrlColor } from '@cntrl-site/color';
import { RichTextItem as TRichTextItem } from '../../../../sdk/types/article/Item';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useRichTextItemValues } from '../useRichTextItemValues';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getFontFamilyValue } from '../../../utils/getFontFamilyValue';
import { useExemplary } from '../../../common/useExemplary';
import { useItemAngle } from '../useItemAngle';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useCurrentLayout } from '../../../common/useCurrentLayout';
import { getLayoutStyles } from '../../../../utils';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { layouts } = useCntrlContext();
  const itemAngle = useItemAngle(item, sectionId);
  const {
    blur: itemBlur,
    wordSpacing: itemWordSpacing,
    letterSpacing: itemLetterSpacing,
    color: itemColor,
    fontSize,
    lineHeight
  } = useRichTextItemValues(item, sectionId);
  const layoutValues: Record<string, any>[] = [item.area, item.layoutParams];
  const exemplary = useExemplary();
  const { layoutId } = useCurrentLayout();
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState<number | string>(['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color']);
  const stateStyles = stateParams?.styles ?? {};
  const transition = stateParams?.transition ?? 'none';
  const textColor = useMemo(() => {
    const color = getStyleFromItemStateAndParams(stateParams?.styles?.color as string, itemColor);
    return color ? CntrlColor.parse(color) : undefined;
  }, [itemColor, stateStyles.color]);
  const angle = getStyleFromItemStateAndParams(stateStyles.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(stateStyles.blur, itemBlur);
  const letterSpacing = getStyleFromItemStateAndParams(stateStyles.letterSpacing, itemLetterSpacing);
  const wordSpacing = getStyleFromItemStateAndParams(stateStyles.wordSpacing, itemWordSpacing);
  const colorAlpha = textColor?.getAlpha();
  const rangeStyles = layoutId ? item.layoutParams[layoutId]?.rangeStyles ?? [] : [];
  const rangeColors = rangeStyles.filter((style) => style.style === 'COLOR');
  const hasVisibleRangeColors = rangeColors.some((color) => {
    const alpha = CntrlColor.parse(color.value!).getAlpha();
    return alpha > 0;
  });
  const isInteractive = colorAlpha !== 0 || hasVisibleRangeColors;
  const [content, styles] = useRichTextItem(item);
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  return (
    <>
      <div
        ref={setRef}
        className={`rich-text-wrapper-${item.id}`}
        style={{
          ...(blur !== undefined ? { filter: `blur(${blur as number * 100}vw)` } : {}),
          ...(textColor ? { color: `${textColor.fmt('rgba')}` } : {}),
          ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
          ...(letterSpacing !== undefined ? { letterSpacing: `${letterSpacing as number * exemplary}px` } : {}),
          ...(wordSpacing !== undefined ? { wordSpacing: `${wordSpacing as number * exemplary}px` } : {}),
          ...(fontSize !== undefined ? { fontSize: `${Math.round(fontSize * exemplary)}px` } : {}),
          ...(lineHeight !== undefined ? { lineHeight: `${lineHeight * exemplary}px` } : {}),
          willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
          transition
        }}
      >
        {content}
      </div>
      <JSXStyle id={id}>
        {styles}
        {`${getLayoutStyles(layouts, layoutValues, ([area, layoutParams]) => {
          const color = CntrlColor.parse(layoutParams.color);
          return (`
            .rich-text-wrapper-${item.id} {
              font-size: ${layoutParams.fontSize * 100}vw;
              line-height: ${layoutParams.lineHeight * 100}vw;
              letter-spacing: ${layoutParams.letterSpacing * 100}vw;
              word-spacing: ${layoutParams.wordSpacing * 100}vw;
              font-family: ${getFontFamilyValue(layoutParams.typeFace)};
              font-weight: ${layoutParams.fontWeight};
              font-style: ${layoutParams.fontStyle ? layoutParams.fontStyle : 'normal'};
              vertical-align: ${layoutParams.verticalAlign};
              font-variant: ${layoutParams.fontVariant};
              color: ${color.fmt('rgba')};
              transform: rotate(${area.angle}deg);
              filter: ${layoutParams.blur !== 0 ? `blur(${layoutParams.blur * 100}vw)` : 'unset'};
              text-transform: ${layoutParams.textTransform};
              ${layoutParams.blur !== 0 ? 'will-change: transform;' : ''}
            }
            @supports not (color: oklch(42% 0.3 90 / 1)) {
              .rich-text-wrapper-${item.id} {
                color: ${color.fmt('rgba')};
              }
            }
          `);
        })}`}
      </JSXStyle>
    </>
  );
};
