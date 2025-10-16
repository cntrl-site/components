import React, {
  FC,
  useContext,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import JSXStyle from 'styled-jsx/style';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { useItemScale } from './useItemScale';
import { ScaleAnchorMap } from '../../utils/ScaleAnchorMap';
import { useSectionHeightData } from '../Section/useSectionHeightMap';
import { getItemTopStyle } from '../../utils/getItemTopStyle';
import { useStickyItemTop } from './useStickyItemTop';
import { getAnchoredItemTop } from '../../utils/getAnchoredItemTop';
import { useLayoutContext } from '../useLayoutContext';
import { ArticleRectContext } from '../../provider/ArticleRectContext';
import { useExemplary } from '../../common/useExemplary';
import { KeyframesContext } from '../../provider/KeyframesContext';
import { useItemInteractionCtrl } from '../../interactions/useItemInteractionCtrl';
import { isItemType } from '../../utils/isItemType';
import { RichTextWrapper } from './RichTextWrapper';
import { itemsMap } from './itemsMap';
import { useItemTriggers } from './useItemTriggers';
import { parseSizing, useSizing } from './useSizing';
import { useItemPointerEvents } from './useItemPointerEvents';
import { useItemArea } from './useItemArea';
import { useDraggable } from './useDraggable';
import { ItemAny } from '../../../sdk/types/article/Item';
import { ArticleItemType } from '../../../sdk/types/article/ArticleItemType';
import { AnchorSide, AreaAnchor, PositionType } from '../../../sdk/types/article/ItemArea';
import { getLayoutStyles } from '../../../utils';

export interface ItemProps<I extends ItemAny> {
  item: I;
  sectionId: string;
  articleHeight?: number;
  onResize?: (height: number) => void;
  interactionCtrl?: ReturnType<typeof useItemInteractionCtrl>;
  onVisibilityChange: (isVisible: boolean) => void;
  isInCompound?: boolean;
}

export interface ItemWrapperProps {
  item: ItemAny;
  sectionId: string;
  articleHeight?: number;
  isInGroup?: boolean;
  isParentVisible?: boolean;
}

const stickyFix = `
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
`;

const noop = () => null;

export const Item: FC<ItemWrapperProps> = ({ item, sectionId, articleHeight, isParentVisible = true, isInGroup = false }) => {
  const itemWrapperRef = useRef<HTMLDivElement | null>(null);
  const itemInnerRef = useRef<HTMLDivElement | null>(null);
  const rectObserver = useContext(ArticleRectContext);
  const keyframesRepo = useContext(KeyframesContext);
  const id = useId();
  const keyframes = useMemo(() => keyframesRepo.getItemKeyframes(item.id), [keyframesRepo, item.id]);
  const { layouts } = useCntrlContext();
  const layout = useLayoutContext();
  const exemplary = useExemplary();
  const { handleVisibilityChange, allowPointerEvents } = useItemPointerEvents(
    item.commonParams.pointerEvents ?? 'when_visible',
    isParentVisible
  );
  const [wrapperHeight, setWrapperHeight] = useState<undefined | number>(undefined);
  const [itemHeight, setItemHeight] = useState<undefined | number>(undefined);
  const itemScale = useItemScale(item, sectionId);
  const interactionCtrl = useItemInteractionCtrl(item.id);
  const triggers = useItemTriggers(interactionCtrl);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const wrapperStateProps = interactionCtrl?.getState<number>(['top', 'left']);
  const innerStateProps = interactionCtrl?.getState<number>(['width', 'height', 'scale']);
  const { width, height, top, left } = useItemArea(item, sectionId, {
    top: wrapperStateProps?.styles?.top as number,
    left: wrapperStateProps?.styles?.left as number,
    width: innerStateProps?.styles?.width as number,
    height: innerStateProps?.styles?.height as number
  });
  const sectionHeight = useSectionHeightData(sectionId);
  const stickyTop = useStickyItemTop(item, sectionId, wrapperStateProps?.styles?.top as number);
  const layoutValues: Record<string, any>[] = [item.area, item.hidden];
  layoutValues.push(item.sticky);
  layoutValues.push(sectionHeight);
  if (item.layoutParams) {
    layoutValues.push(item.layoutParams);
  }
  const sizingAxis = useSizing(item);
  const ItemComponent = itemsMap[item.type] || noop;
  const sectionTop = rectObserver ? rectObserver.getSectionTop(sectionId) : 0;
  const layoutParams = layout ? item.layoutParams[layout] : undefined;
  const isDraggable = layoutParams && 'isDraggable' in layoutParams ? layoutParams.isDraggable : undefined;
  useDraggable({ draggableRef: itemInnerRef.current, isEnabled: isDraggable ?? false }, ({ startX, startY, currentX, currentY, lastX, lastY, drag }) => {
    const item = itemInnerRef.current;
    if (!item) return;
    if (drag) {
      setIsDraggingActive(true);
      setPosition({
        x: (currentX - startX) + lastX,
        y: (currentY - startY) + lastY
      });
    } else {
      setIsDraggingActive(false);
    }
  });

  const handleItemResize = (height: number) => {
    if (!layout) return;
    const sticky = item.sticky[layout];
    if (!sticky || stickyTop === undefined || !articleHeight) {
      setWrapperHeight(undefined);
      return;
    }
    const itemArticleOffset = sectionTop / window.innerWidth + stickyTop;
    const maxStickyTo = articleHeight - itemArticleOffset - height;
    const end = sticky.to !== undefined
      ? Math.min(maxStickyTo, sticky.to)
      : articleHeight - itemArticleOffset - height;
    const wrapperHeight = end - sticky.from + height;
    setItemHeight(height);
    setWrapperHeight(wrapperHeight);
  };

  const isRichText = isItemType(item, ArticleItemType.RichText);
  const anchorSide = layout ? item.area[layout].anchorSide : AnchorSide.Top;
  const positionType = layout ? item.area[layout].positionType : PositionType.ScreenBased;
  const isScreenBasedBottom = positionType === PositionType.ScreenBased && anchorSide === AnchorSide.Bottom;
  const scale = innerStateProps?.styles?.scale ?? itemScale;
  const hasClickTriggers = interactionCtrl?.getHasTrigger(item.id, 'click') ?? false;
  return (
    <div
      className={`item-wrapper-${item.id}`}
      ref={itemWrapperRef}
      onTransitionEnd={(e) => {
        e.stopPropagation();
        interactionCtrl?.handleTransitionEnd?.(e.propertyName);
      }}
      style={{
        ...(top !== undefined ? { top: isScreenBasedBottom ? 'unset' : getItemTopStyle(top, anchorSide) } : {}),
        ...(left !== undefined ? { left: `${left * 100}vw` } : {}),
        ...(top !== undefined ? { bottom: isScreenBasedBottom ? `${-top * 100}vw` : 'unset' } : {}),
        ...(wrapperHeight !== undefined ? { height: `${wrapperHeight * 100}vw` } : {}),
        transition: wrapperStateProps?.transition ?? 'none'
      }}
    >
      <div
        suppressHydrationWarning={true}
        className={`item-${item.id}`}
        style={{
          opacity: (keyframes.length !== 0 && !layout) ? 0 : 1,
          top: `${stickyTop * 100}vw`,
          height: isRichText && itemHeight !== undefined ? `${itemHeight * 100}vw` : 'unset',
        }}
      >
        <RichTextWrapper isRichText={isRichText}>
          <div
            className={`item-${item.id}-inner`}
            ref={itemInnerRef}
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
              ...((width !== undefined && height !== undefined)
                ? {
                    width: `${sizingAxis.x === 'manual'
                      ? isRichText
                        ? `${width * exemplary}px`
                        : `${width * 100}vw`
                      : 'max-content'}`,
                    height: `${sizingAxis.y === 'manual' ? `${height * 100}vw` : 'unset'}`
                  }
                : {}),
              ...(scale !== undefined ? { transform: `scale(${scale})`, WebkitTransform: `scale(${scale})` } : {}),
              transition: innerStateProps?.transition ?? 'none',
              cursor: isDraggingActive
                ? 'grabbing'
                : isDraggable
                  ? 'grab'
                  : hasClickTriggers
                    ? 'pointer'
                    : 'unset',
              pointerEvents: allowPointerEvents ? 'auto' : 'none',
              userSelect: isDraggable ? 'none' : 'unset',
              WebkitUserSelect: isDraggable ? 'none' : 'unset',
              MozUserSelect: isDraggable ? 'none' : 'unset',
              msUserSelect: isDraggable ? 'none' : 'unset'
            }}
            {...triggers}
          >
            <ItemComponent
              item={item}
              sectionId={sectionId}
              onResize={handleItemResize}
              articleHeight={articleHeight}
              interactionCtrl={interactionCtrl}
              onVisibilityChange={handleVisibilityChange}
            />
          </div>
        </RichTextWrapper>
      </div>
      <JSXStyle id={id}>{`
        ${getLayoutStyles(layouts, layoutValues, ([area, hidden, sticky, sectionHeight, layoutParams]) => {
      const sizingAxis = parseSizing(layoutParams.sizing);
      const isScreenBasedBottom = area.positionType === PositionType.ScreenBased && area.anchorSide === AnchorSide.Bottom;
      const scaleAnchor = area.scaleAnchor as AreaAnchor;
      return (`
            .item-${item.id} {
              position: ${sticky ? 'sticky' : 'absolute'};
              top: ${sticky ? `${getAnchoredItemTop(area.top - sticky.from, sectionHeight, area.anchorSide)}` : 0};
              transition: opacity 0.2s linear 0.1s;
              pointer-events: none;
              display: ${hidden ? 'none' : 'block'};
              height: fit-content;
            }
            .item-${item.id}-inner {
              width: ${sizingAxis.x === 'manual'
                ? `${area.width * 100}vw`
                : 'max-content'};
              height: ${sizingAxis.y === 'manual' ? `${area.height * 100}vw` : 'unset'};
              transform-origin: ${ScaleAnchorMap[scaleAnchor]};
              transform: scale(${area.scale});
              position: relative;
            }
            .item-wrapper-${item.id} {
              position: ${area.positionType === PositionType.ScreenBased ? 'fixed' : 'absolute'};
              z-index: ${area.zIndex};
              ${!isInGroup && stickyFix}
              pointer-events: none;
              bottom: ${isScreenBasedBottom ? `${-area.top * 100}vw` : 'unset'};
              top: ${isScreenBasedBottom ? 'unset' : getItemTopStyle(area.top, area.anchorSide)};
              left: ${area.left * 100}vw;
            }
          `);
      })}
      `}
      </JSXStyle>
    </div>
  );
};
