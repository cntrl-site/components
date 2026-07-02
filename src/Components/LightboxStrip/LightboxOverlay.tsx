import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { getAspectRatio, isImageRatioCover } from '../utils/imageFitStyles';
import { useLightboxSwipeDismiss } from '../utils/useLightboxSwipeDismiss';
import { useLightboxScrollLock } from '../utils/useLightboxScrollLock';
import { animateStripScroll, getDistanceScaledDuration } from '../utils/animateStripScroll';
import type { LightboxStripItem, LightboxStripSettings } from './LightboxStrip';
import {
  buildStripTitleSlots,
  CONTROLS_IDLE_MS,
  DRAG_SNAP_RATIO,
  getEffectiveStripTitleWidths,
  getGapControlSize,
  getRowScopedStripTitleWidths,
  getStripTitleMaxWidth,
  getStripTitleOffsetBeforeSlot,
  LIGHTBOX_ANIM_MS,
  MOUSE_DRAG_THRESHOLD_PX,
  resolveSharedStripTitles,
  resolveStripTextFields,
  resolveStripTitleWidths,
  SNAP_SCROLL_EASING,
  SNAP_SCROLL_MAX_MS,
  SNAP_SCROLL_MIN_MS,
  stripTextFieldsToCss,
  THUMB_MAX_SIZE_PX,
  TITLE_RESIZE_HANDLE_WIDTH,
  WHEEL_LERP,
  WHEEL_LINE_HEIGHT_PX,
  WHEEL_SPEED,
  type StripTitleSlot,
} from './utils';

type LightboxOverlayProps = {
  prefix: string;
  images: LightboxStripItem[];
  settings: LightboxStripSettings;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  onClose: () => void;
};

export const LightboxOverlay = ({
  prefix: P,
  images,
  settings,
  isEditor,
  isEditMode,
  isPreviewMode,
  onClose,
}: LightboxOverlayProps) => {
  const {
    backgroundColor,
    thumbnailGap: thumbnailGapSetting,
    thumbnailMarginBottom: thumbnailMarginBottomSetting,
    imageGap: imageGapSetting,
    closeIcon,
    closeIconMaxWidth,
    closeIconColor,
    closeIconHoverColor,
    thumbnailTrigger,
    thumbnailVisibility,
    thumbnailObjectFit,
    thumbnailActive,
    thumbnailActiveColor,
    title1Width,
    title2Width,
    title3Width,
    title1MarginLeft = 0,
    title2MarginLeft = 0,
    title3MarginLeft = 0,
    titleRowMarginBottom = 0,
    titleHeaderLayout = 'desktop',
    contentMarginTop: contentMarginTopSetting,
    iconMarginLeft: iconMarginLeftSetting,
  } = settings;

  const scaled = (value: number) => scalingValue(value, isEditor ?? false);
  const thumbnailGap = scaled(thumbnailGapSetting);
  const thumbnailMarginBottom = scaled(thumbnailMarginBottomSetting ?? 0.02);
  const imageGap = scaled(imageGapSetting ?? 0);
  const contentMarginTop = scaled(contentMarginTopSetting ?? 0);
  const iconMarginLeft = scaled(iconMarginLeftSetting ?? 0);
  const { title1, title2, title3 } = resolveSharedStripTitles(images);
  const title1Style = stripTextFieldsToCss('title1', resolveStripTextFields(settings, 'title1'), isEditor);
  const title2Style = stripTextFieldsToCss('title2', resolveStripTextFields(settings, 'title2'), isEditor);
  const title3Style = stripTextFieldsToCss('title3', resolveStripTextFields(settings, 'title3'), isEditor);
  const useTwoRowHeader = titleHeaderLayout === 'mobile';
  const allowImageScroll = !isEditMode && (!isEditor || isPreviewMode);
  const hideOverlayContentOnIdle = allowImageScroll;
  const allowMouseDrag = allowImageScroll;
  const allowThumbnailHover = allowImageScroll;
  const isThumbCover = isImageRatioCover(thumbnailObjectFit);
  const thumbAspectRatioStyle = isThumbCover
    ? ({ '--image-aspect-ratio': getAspectRatio(thumbnailObjectFit) } as CSSProperties)
    : undefined;
  const hasTitles = Boolean(title1 || title2 || title3);
  const titleSlots = useMemo(
    () => buildStripTitleSlots(P, title1, title2, title3, title1Style, title2Style, title3Style),
    [P, title1, title2, title3, title1Style, title2Style, title3Style],
  );
  const titleWidthByKey = useMemo(() => ({title1Width, title2Width, title3Width}),[title1Width, title2Width, title3Width]);
  const storedTitleWidths = useMemo(() => titleSlots.map((slot) => titleWidthByKey[slot.widthKey]), [titleSlots, titleWidthByKey]);
  const resolvedTitleWidths = useMemo(() => resolveStripTitleWidths(titleSlots.length, storedTitleWidths), [titleSlots.length, storedTitleWidths]);
  const effectiveTitleWidths = useMemo(() => getEffectiveStripTitleWidths(titleSlots.length, storedTitleWidths), [titleSlots.length, storedTitleWidths]);
  const topRowTitleSlots = useMemo(() => titleSlots.filter((slot) => slot.prefix === 'title1'), [titleSlots]);
  const bottomRowTitleSlots = useMemo(() => titleSlots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3'), [titleSlots]);
  const topRowTitleWidths = useMemo(() => getRowScopedStripTitleWidths(topRowTitleSlots, titleWidthByKey), [topRowTitleSlots, titleWidthByKey]);
  const bottomRowTitleWidths = useMemo(() => getRowScopedStripTitleWidths(bottomRowTitleSlots, titleWidthByKey), [bottomRowTitleSlots, titleWidthByKey]);
  const getSlotTitleWidthContext = useCallback((
    slot: StripTitleSlot,
    rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom',
  ) => {
    const fullIndex = titleSlots.indexOf(slot);
    if (!useTwoRowHeader || rowLayout === 'single-row') {
      return {
        effectiveWidth: effectiveTitleWidths[fullIndex] ?? 0,
        resolvedWidth: resolvedTitleWidths[fullIndex] ?? 0,
        maxWidth: getStripTitleMaxWidth(fullIndex, resolvedTitleWidths),
      };
    }
    if (rowLayout === 'two-row-top') {
      const topIndex = topRowTitleSlots.indexOf(slot);
      return {
        effectiveWidth: topRowTitleWidths.effective[topIndex] ?? 0,
        resolvedWidth: topRowTitleWidths.resolved[topIndex] ?? 0,
        maxWidth: getStripTitleMaxWidth(topIndex, topRowTitleWidths.resolved),
      };
    }
    const bottomIndex = bottomRowTitleSlots.indexOf(slot);
    return {
      effectiveWidth: bottomRowTitleWidths.effective[bottomIndex] ?? 0,
      resolvedWidth: bottomRowTitleWidths.resolved[bottomIndex] ?? 0,
      maxWidth: getStripTitleMaxWidth(bottomIndex, bottomRowTitleWidths.resolved),
    };
  }, [
    bottomRowTitleSlots,
    bottomRowTitleWidths,
    effectiveTitleWidths,
    resolvedTitleWidths,
    titleSlots,
    topRowTitleSlots,
    topRowTitleWidths,
    useTwoRowHeader,
  ]);
  const scaledTitleWidth = useCallback(
    (value: number) => scalingValue(value, isEditor ?? false),
    [isEditor],
  );
  const titleRowMarginBottomScaled = scaledTitleWidth(titleRowMarginBottom ?? 0);
  const titleMarginLeftByKey = useMemo(
    () => ({
      title1MarginLeft,
      title2MarginLeft,
      title3MarginLeft,
    }),
    [title1MarginLeft, title2MarginLeft, title3MarginLeft],
  );
  const getTitleBoundaryOffset = useCallback(
    (upToIndex: number) => titleSlots.slice(0, upToIndex + 1).reduce(
      (offset, slot, index) => offset
        + (slot?.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0)
        + (resolvedTitleWidths[index] ?? 0),
      0,
    ) + (!useTwoRowHeader ? title1MarginLeft ?? 0 : 0),
    [titleSlots, titleMarginLeftByKey, resolvedTitleWidths, useTwoRowHeader, title1MarginLeft],
  );
  const getSingleRowMarginColumnOffset = useCallback(
    () => (!useTwoRowHeader ? title1MarginLeft ?? 0 : 0),
    [useTwoRowHeader, title1MarginLeft],
  );

  const getBottomRowOffsetBeforeSlot = useCallback(
    (upToBottomIndex: number) => bottomRowTitleSlots.slice(0, upToBottomIndex).reduce(
      (offset, slot, index) => offset
        + (slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0)
        + (bottomRowTitleWidths.resolved[index] ?? 0),
      0,
    ),
    [bottomRowTitleSlots, bottomRowTitleWidths.resolved, titleMarginLeftByKey],
  );

  const getBottomRowBoundaryOffset = useCallback(
    (bottomIndex: number) => {
      const slot = bottomRowTitleSlots[bottomIndex];
      return getBottomRowOffsetBeforeSlot(bottomIndex)
        + (slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0)
        + (bottomRowTitleWidths.resolved[bottomIndex] ?? 0);
    },
    [bottomRowTitleSlots, bottomRowTitleWidths.resolved, getBottomRowOffsetBeforeSlot, titleMarginLeftByKey],
  );

  const renderTitleCell = (slot: StripTitleSlot, rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom') => {
    const marginLeft = slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0: 0;
    const { effectiveWidth, resolvedWidth, maxWidth: maxTitleWidth } = getSlotTitleWidthContext(slot, rowLayout);
    const showCellControls = isEditMode && rowLayout === 'two-row-top';

    return (
      <div
        key={slot.className}
        className={`${P}-title-cell`}
        data-title={slot.prefix}
        style={{
          ...(rowLayout === 'single-row' ? { gridArea: slot.prefix } : {}),
          width: scaledTitleWidth(effectiveWidth),
          ...(marginLeft > 0 ? { marginLeft: scaledTitleWidth(marginLeft) } : {}),
        }}
      >
        <p className={slot.className} style={slot.style}>{slot.text}</p>
        {showCellControls && slot.marginLeftKey && (
          <div
            data-controls={slot.marginLeftKey}
            data-controls-axis="x"
            data-controls-min="0"
            data-controls-max-fraction={String(resolvedWidth)}
            style={{
              position: 'absolute',
              top: 0,
              left: scaledTitleWidth(-marginLeft),
              width: `max(${scaledTitleWidth(marginLeft)}, 10px)`,
              height: '100%',
              pointerEvents: 'auto',
            }}
          />
        )}
        {showCellControls && (
          <div
            data-controls={slot.widthKey}
            data-controls-axis="x"
            data-controls-max-fraction={String(maxTitleWidth)}
            data-controls-variant="column-width"
            className={`${P}-title-resize-handle`}
            style={{
              position: 'absolute',
              top: 0,
              right: scaledTitleWidth(-TITLE_RESIZE_HANDLE_WIDTH / 2),
              width: scaledTitleWidth(TITLE_RESIZE_HANDLE_WIDTH),
              height: '100%',
              pointerEvents: 'auto',
            }}
          />
        )}
      </div>
    );
  };

  const renderTitleMarginControls = () => {
    const singleRowTitle1Index = !useTwoRowHeader ? titleSlots.findIndex((slot) => slot.prefix === 'title1') : -1;
    const singleRowTitle1Control = !useTwoRowHeader && (isEditMode || (title1MarginLeft ?? 0) > 0) ? (() => {
      const marginLeft = title1MarginLeft ?? 0;
      const title1MaxFraction = singleRowTitle1Index >= 0 ? resolvedTitleWidths[singleRowTitle1Index] : title1Width ?? 0;

      return (
        <div
          key="title1MarginLeft"
          data-controls="title1MarginLeft"
          data-controls-axis="x"
          data-controls-min="0"
          data-controls-max-fraction={String(title1MaxFraction)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `max(${scaledTitleWidth(marginLeft)}, 10px)`,
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      );
    })() : null;

    const slotMarginControls = titleSlots.flatMap((slot, colIndex) => {
      if (!slot.marginLeftKey) return [];
      const marginLeft = titleMarginLeftByKey[slot.marginLeftKey] ?? 0;
      const offsetBeforeMargin = getStripTitleOffsetBeforeSlot(
        titleSlots,
        resolvedTitleWidths,
        titleMarginLeftByKey,
        colIndex,
      ) + getSingleRowMarginColumnOffset();

      return (
        <div
          key={slot.marginLeftKey}
          data-controls={slot.marginLeftKey}
          data-controls-axis="x"
          data-controls-min="0"
          data-controls-max-fraction={String(resolvedTitleWidths[colIndex])}
          style={{
            position: 'absolute',
            top: 0,
            left: scaledTitleWidth(offsetBeforeMargin),
            width: `max(${scaledTitleWidth(marginLeft)}, 10px)`,
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      );
    });

    return singleRowTitle1Control ? [singleRowTitle1Control, ...slotMarginControls] : slotMarginControls;
  };

  const renderTitleWidthControls = () => titleSlots.map((slot, colIndex) => {
    const maxTitleWidth = getStripTitleMaxWidth(
      colIndex,
      resolvedTitleWidths,
    );
    const boundaryOffset = getTitleBoundaryOffset(colIndex);
    const titleWidthHandleOffset = boundaryOffset - TITLE_RESIZE_HANDLE_WIDTH / 2;

    return (
      <div key={`${slot.widthKey}-junction`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          data-controls={slot.widthKey}
          data-controls-axis="x"
          data-controls-max-fraction={String(maxTitleWidth)}
          data-controls-variant="column-width"
          className={`${P}-title-resize-handle`}
          style={{
            position: 'absolute',
            top: 0,
            left: scaledTitleWidth(titleWidthHandleOffset),
            width: scaledTitleWidth(TITLE_RESIZE_HANDLE_WIDTH),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      </div>
    );
  });

  const renderTwoRowBottomMarginControls = () => bottomRowTitleSlots.flatMap((slot, bottomIndex) => {
    if (!slot.marginLeftKey) return [];
    const marginLeft = titleMarginLeftByKey[slot.marginLeftKey] ?? 0;
    const offsetBeforeMargin = getBottomRowOffsetBeforeSlot(bottomIndex);
    const { resolvedWidth } = getSlotTitleWidthContext(slot, 'two-row-bottom');

    return (
      <div
        key={slot.marginLeftKey}
        data-controls={slot.marginLeftKey}
        data-controls-axis="x"
        data-controls-min="0"
        data-controls-max-fraction={String(resolvedWidth)}
        style={{
          position: 'absolute',
          top: 0,
          left: scaledTitleWidth(offsetBeforeMargin),
          width: `max(${scaledTitleWidth(marginLeft)}, 10px)`,
          height: '100%',
          pointerEvents: 'auto',
        }}
      />
    );
  });

  const renderTwoRowBottomWidthControls = () => bottomRowTitleSlots.map((slot, bottomIndex) => {
    const { maxWidth: maxTitleWidth } = getSlotTitleWidthContext(slot, 'two-row-bottom');
    const boundaryOffset = getBottomRowBoundaryOffset(bottomIndex);
    const titleWidthHandleOffset = boundaryOffset - TITLE_RESIZE_HANDLE_WIDTH / 2;

    return (
      <div key={`${slot.widthKey}-junction`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          data-controls={slot.widthKey}
          data-controls-axis="x"
          data-controls-max-fraction={String(maxTitleWidth)}
          data-controls-variant="column-width"
          className={`${P}-title-resize-handle`}
          style={{
            position: 'absolute',
            top: 0,
            left: scaledTitleWidth(titleWidthHandleOffset),
            width: scaledTitleWidth(TITLE_RESIZE_HANDLE_WIDTH),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      </div>
    );
  });

  const dismissAreaRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setWidthRef = useRef(0);
  const mouseDragRef = useRef({
    isActive: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
  });
  const windowDragEndRef = useRef<((event: globalThis.PointerEvent) => void) | null>(null);
  const scrollAnimRef = useRef<(() => void) | null>(null);
  const lastScrollLeftRef = useRef(0);
  const scrollDirRef = useRef<'forward' | 'backward'>('forward');
  const wheelTargetRef = useRef(0);
  const wheelRafRef = useRef<number | null>(null);
  const isWheelingRef = useRef(false);
  const debugDragStartIndexRef = useRef<number | null>(null);
  const isLoopEnabled = images.length > 1 && (!isEditMode || !!isPreviewMode);
  const loopCopies = isLoopEnabled ? 3 : 1;
  const flatItems = useMemo(
    () => Array.from({ length: loopCopies }, () => images).flat(),
    [images, loopCopies],
  );
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [overlayContentVisible, setOverlayContentVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const lockedActiveIndexRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayContentIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOverlayContentHidden = hideOverlayContentOnIdle && !overlayContentVisible;

  const resetOverlayContentIdleTimer = useCallback(() => {
    if (!hideOverlayContentOnIdle) return;
    setOverlayContentVisible(true);
    if (overlayContentIdleTimerRef.current) {
      clearTimeout(overlayContentIdleTimerRef.current);
    }
    overlayContentIdleTimerRef.current = setTimeout(() => {
      if (mouseDragRef.current.isActive) return;
      setOverlayContentVisible(false);
    }, CONTROLS_IDLE_MS);
  }, [hideOverlayContentOnIdle]);

  const handleClose = useCallback(() => {
    if (isEditMode || isClosingRef.current) return;
    isClosingRef.current = true;
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, LIGHTBOX_ANIM_MS);
  }, [isEditMode, onClose]);

  const renderCloseIcon = () => (
    <div
      className={`${P}-close-icon`}
      data-overlay-content-hidden={isOverlayContentHidden ? 'true' : 'false'}
      style={{
        width: scalingValue(closeIconMaxWidth ?? 0, isEditor),
        height: scalingValue(closeIconMaxWidth ?? 0, isEditor),
        marginRight: iconMarginLeft,
        ['--close-icon-hover-color' as string]: closeIconHoverColor,
      }}
    >
      <button
        type="button"
        className={`${P}-close-icon-inner`}
        onClick={handleClose}
        aria-label="Close"
      >
        <SvgImage
          url={closeIcon!}
          fill={closeIconColor}
          hoverFill={isEditor && !isPreviewMode ? closeIconColor : closeIconHoverColor}
          className={`${P}-close-icon-img`}
        />
      </button>
      {isEditMode && (
        <div
          data-controls="iconMarginLeft"
          data-controls-axis="x"
          data-controls-reverse=""
          className={`${P}-control`}
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            width: iconMarginLeft,
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      )}
    </div>
  );

  const renderTitle1MarginLeftSpacer = (placement: 'single-row' | 'two-row' = 'two-row') => (
    <div
      {...(placement === 'two-row' && isEditMode ? {
        'data-controls': 'title1MarginLeft',
        'data-controls-axis': 'x',
      } : {})}
      style={{
        width: scaledTitleWidth(title1MarginLeft ?? 0),
        flexShrink: 0,
        ...(placement === 'single-row'
          ? { gridArea: 'margin' }
          : { alignSelf: 'stretch' }),
        ...(placement === 'two-row' && isEditMode ? { pointerEvents: 'auto' as const } : {}),
      }}
    />
  );

  const renderTwoRowHeader = () => {
    const title1Slot = titleSlots.find((slot) => slot.prefix === 'title1');
    const bottomSlots = titleSlots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3');
    const showBottomWrap = bottomSlots.length > 0 || isEditMode || (titleRowMarginBottom ?? 0) > 0;

    return (
      <>
        <div className={`${P}-header-row-top`}>
          {(title1MarginLeft ?? 0) > 0 || isEditMode ? renderTitle1MarginLeftSpacer() : null}
          {title1Slot && renderTitleCell(title1Slot, 'two-row-top')}
          {closeIcon && renderCloseIcon()}
        </div>
        {showBottomWrap ? (
          <div className={`${P}-header-row-bottom-wrap`}>
            {bottomSlots.length > 0 ? (
              <div className={`${P}-header-row-bottom`}>
                {bottomSlots.map((slot) => renderTitleCell(slot, 'two-row-bottom'))}
                {isEditMode && (
                  <>
                    {renderTwoRowBottomMarginControls()}
                    {renderTwoRowBottomWidthControls()}
                  </>
                )}
              </div>
            ) : null}
            <div
              data-controls={isEditMode ? 'titleRowMarginBottom' : undefined}
              data-controls-axis={isEditMode ? 'y' : undefined}
              data-controls-reverse={isEditMode ? '' : undefined}
              className={isEditMode ? `${P}-control` : undefined}
              style={{
                height: titleRowMarginBottomScaled,
                width: '100%',
                flexShrink: 0,
                pointerEvents: isEditMode ? 'auto' : 'none',
              }}
            />
          </div>
        ) : null}
      </>
    );
  };

  const renderSingleRowHeader = () => (
    <>
      {(title1MarginLeft ?? 0) > 0 || isEditMode ? renderTitle1MarginLeftSpacer('single-row') : null}
      {titleSlots.map((slot) => renderTitleCell(slot, 'single-row'))}
      {isEditMode ? (
        <>
          {renderTitleMarginControls()}
          {renderTitleWidthControls()}
        </>
      ) : null}
      {closeIcon ? renderCloseIcon() : null}
    </>
  );

  const isDragBlockedTarget = useCallback((target: HTMLElement) => Boolean(
    target.closest('[data-controls]')
    || target.closest(`.${P}-thumbnails`)
    || target.closest(`.${P}-close-icon`)
  ), [P]);

  const {
    isSwipeDragging,
    backdropStyle: swipeBackdropStyle,
    mediaAreaStyle,
    overlayContentStyle: swipeOverlayContentStyle,
    swipeHandlers,
    dismissAreaStyle,
  } = useLightboxSwipeDismiss({
    enabled: allowImageScroll ?? false,
    onClose: handleClose,
    animMs: LIGHTBOX_ANIM_MS,
    isBlockedTarget: isDragBlockedTarget,
  });

  const measureSetWidth = () => {
    if (!isLoopEnabled || images.length === 0) {
      setWidthRef.current = 0;
      return 0;
    }
    const firstItem = itemRefs.current[0];
    const firstMiddleSetItem = itemRefs.current[images.length];
    if (!firstItem || !firstMiddleSetItem) return setWidthRef.current;
    const nextSetWidth = firstMiddleSetItem.offsetLeft - firstItem.offsetLeft;
    if (nextSetWidth > 0) {
      setWidthRef.current = nextSetWidth;
    }
    return setWidthRef.current;
  };

  const normalizeInfiniteScroll = (adjustMouseDragAnchor = false) => {
    if (!isLoopEnabled) return;
    const strip = stripRef.current;
    const setWidth = measureSetWidth();
    if (!strip || setWidth <= 0) return;
    if (strip.scrollLeft <= 0) {
      strip.scrollLeft += setWidth;
      if (adjustMouseDragAnchor) {
        mouseDragRef.current.scrollLeft += setWidth;
      }
      if (isWheelingRef.current) {
        wheelTargetRef.current += setWidth;
      }
    } else if (strip.scrollLeft >= setWidth * 2) {
      strip.scrollLeft -= setWidth;
      if (adjustMouseDragAnchor) {
        mouseDragRef.current.scrollLeft -= setWidth;
      }
      if (isWheelingRef.current) {
        wheelTargetRef.current -= setWidth;
      }
    }
  };

  const getNearestFlatIndex = (scrollLeft = stripRef.current?.scrollLeft ?? 0) => {
    const viewport = stripRef.current?.clientWidth ?? 0;
    const viewportCenter = scrollLeft + viewport / 2;
    let containingIndex = -1;
    let nearest = { flatIndex: 0, distance: Infinity };
    itemRefs.current.forEach((item, flatIndex) => {
      if (!item) return;
      const left = item.offsetLeft;
      const right = left + item.offsetWidth;
      if (containingIndex === -1 && viewportCenter >= left && viewportCenter < right) {
        containingIndex = flatIndex;
      }
      const distance = Math.abs(left - scrollLeft);
      if (distance < nearest.distance) {
        nearest = { flatIndex, distance };
      }
    });
    return containingIndex !== -1 ? containingIndex : nearest.flatIndex;
  };

  const isOversizedItem = (item: HTMLDivElement | null) => {
    const strip = stripRef.current;
    if (!item || !strip) return false;
    return item.offsetWidth > strip.clientWidth + 1;
  };

  const updateOversizedSnapAlign = (direction: 'forward' | 'backward') => {
    if (!stripRef.current) return;
    itemRefs.current.forEach((item) => {
      if (!item) return;
      item.style.scrollSnapAlign = isOversizedItem(item) && direction === 'backward' ? 'end' : 'start';
    });
  };

  const isViewportWithinOversizedItem = (item: HTMLDivElement | null) => {
    const strip = stripRef.current;
    if (!item || !strip || !isOversizedItem(item)) return false;
    const left = item.offsetLeft;
    const right = left + item.offsetWidth;
    return strip.scrollLeft >= left - 1 && strip.scrollLeft + strip.clientWidth <= right + 1;
  };

  const updateActiveIndex = () => {
    if (!stripRef.current || images.length === 0) return;
    if (lockedActiveIndexRef.current !== null) return;
    setActiveIndex(getNearestFlatIndex() % images.length);
  };

  const releaseActiveIndexLock = () => {
    lockedActiveIndexRef.current = null;
    // #region agent log
    const strip = stripRef.current;
    if (strip) {
      fetch('http://127.0.0.1:7916/ingest/05b80f60-0d98-4176-9acb-551465211f52',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8d1a00'},body:JSON.stringify({sessionId:'8d1a00',runId:'pre-fix-2',hypothesisId:'L',location:'LightboxOverlay.tsx:releaseActiveIndexLock',message:'index lock released',data:{scrollLeft:strip.scrollLeft,nearestIndex:getNearestFlatIndex()%images.length,activeIndex:activeIndexRef.current},timestamp:Date.now()})}).catch(()=>{});
    }
    // #endregion
  };

  const setStripSnapEnabled = (enabled: boolean) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.style.scrollSnapType = enabled ? '' : 'none';
  };

  const cancelScrollAnimation = () => {
    scrollAnimRef.current?.();
    scrollAnimRef.current = null;
  };

  const stopWheelAnimation = () => {
    if (wheelRafRef.current !== null) {
      cancelAnimationFrame(wheelRafRef.current);
      wheelRafRef.current = null;
    }
    isWheelingRef.current = false;
  };

  const stepWheelAnimation = () => {
    const strip = stripRef.current;
    if (!strip) {
      wheelRafRef.current = null;
      isWheelingRef.current = false;
      return;
    }
    const distance = wheelTargetRef.current - strip.scrollLeft;
    if (Math.abs(distance) < 0.5) {
      strip.scrollLeft = wheelTargetRef.current;
      normalizeInfiniteScroll();
      updateActiveIndex();
      wheelRafRef.current = null;
      isWheelingRef.current = false;
      return;
    }
    strip.scrollLeft += distance * WHEEL_LERP;
    normalizeInfiniteScroll();
    updateActiveIndex();
    resetOverlayContentIdleTimer();
    wheelRafRef.current = requestAnimationFrame(stepWheelAnimation);
  };

  const clearStripTrackTransform = () => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = '';
    track.style.transform = '';
    track.style.willChange = '';
  };

  const finishStripScroll = (strip: HTMLDivElement, targetLeft: number, activeIndex?: number, onComplete?: () => void) => {
    clearStripTrackTransform();
    strip.scrollLeft = targetLeft;
    lastScrollLeftRef.current = strip.scrollLeft;
    normalizeInfiniteScroll();
    if (activeIndex !== undefined) {
      setActiveIndex(activeIndex);
    } else {
      updateActiveIndex();
    }
    // #region agent log
    const intendedIndex = activeIndex ?? getNearestFlatIndex() % images.length;
    const actualIndex = getNearestFlatIndex() % images.length;
    fetch('http://127.0.0.1:7916/ingest/05b80f60-0d98-4176-9acb-551465211f52',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8d1a00'},body:JSON.stringify({sessionId:'8d1a00',runId:'pre-fix-2',hypothesisId:'K',location:'LightboxOverlay.tsx:finishStripScroll',message:'scroll settled',data:{targetLeft,scrollLeft:strip.scrollLeft,intendedIndex,actualIndex,indexMismatch:intendedIndex!==actualIndex},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setStripSnapEnabled(true);
    onComplete?.();
  };

  const scrollStripTo = (targetLeft: number, { behavior = 'smooth', activeIndex,onComplete }: { behavior?: ScrollBehavior; activeIndex?: number; onComplete?: () => void } = {}) => {
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!strip || !track) return;
    stopWheelAnimation();
    cancelScrollAnimation();
    setStripSnapEnabled(false);
    if (behavior === 'auto') {
      finishStripScroll(strip, targetLeft, activeIndex, onComplete);
      return;
    }
    const distance = Math.abs(targetLeft - strip.scrollLeft);
    const duration = getDistanceScaledDuration(
      distance,
      SNAP_SCROLL_MIN_MS,
      SNAP_SCROLL_MAX_MS,
      strip.clientWidth * 0.55,
    );
    scrollAnimRef.current = animateStripScroll(strip, track, targetLeft, {
      duration,
      easing: SNAP_SCROLL_EASING,
      onComplete: () => {
        scrollAnimRef.current = null;
        finishStripScroll(strip, targetLeft, activeIndex, onComplete);
      },
    });
  };

  const snapToNearestItem = (behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    if (!strip || images.length === 0) return;
    const flatIndex = getNearestFlatIndex();
    const item = itemRefs.current[flatIndex];
    if (!item) return;
    scrollStripTo(item.offsetLeft, { behavior, activeIndex: flatIndex % images.length });
  };

  const snapAfterDrag = (startScrollLeft: number, behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    if (!strip || images.length === 0) return;
    const scrollDelta = strip.scrollLeft - startScrollLeft;
    const startFlatIndex = getNearestFlatIndex(startScrollLeft);
    const startItem = itemRefs.current[startFlatIndex];
    if (isViewportWithinOversizedItem(startItem)) {
      setStripSnapEnabled(true);
      updateActiveIndex();
      return;
    }
    const nextItem = itemRefs.current[startFlatIndex + 1];
    const span = startItem ? (nextItem ? nextItem.offsetLeft - startItem.offsetLeft : startItem.offsetWidth) : 0;
    const scrollAdjustment = span > 0 ? (scrollDelta > span * DRAG_SNAP_RATIO ? 1 : scrollDelta < -span * DRAG_SNAP_RATIO ? -1: 0) : 0;
    const targetFlatIndex = isLoopEnabled
      ? startFlatIndex + scrollAdjustment
      : Math.max(0, Math.min(flatItems.length - 1, startFlatIndex + scrollAdjustment));
    const targetItem = itemRefs.current[targetFlatIndex];
    if (!targetItem) {
      snapToNearestItem(behavior);
      return;
    }
    const movingBackward = scrollDelta < 0;
    const targetLeft = movingBackward && isOversizedItem(targetItem)
      ? targetItem.offsetLeft + targetItem.offsetWidth - strip.clientWidth
      : targetItem.offsetLeft;
    const snapTargetIndex = targetFlatIndex % images.length;
    const endFlatIndex = getNearestFlatIndex(strip.scrollLeft);
    // #region agent log
    fetch('http://127.0.0.1:7916/ingest/05b80f60-0d98-4176-9acb-551465211f52',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8d1a00'},body:JSON.stringify({sessionId:'8d1a00',runId:'pre-fix-2',hypothesisId:'B_J',location:'LightboxOverlay.tsx:snapAfterDrag',message:'drag snap decision',data:{startScrollLeft,scrollLeft:strip.scrollLeft,scrollDelta,startFlatIndex,endFlatIndex,scrollAdjustment,targetFlatIndex,startIndex:startFlatIndex%images.length,endIndex:endFlatIndex%images.length,targetIndex:snapTargetIndex,indexDelta:snapTargetIndex-(startFlatIndex%images.length),endMinusStart:endFlatIndex-startFlatIndex},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (behavior === 'smooth') lockedActiveIndexRef.current = snapTargetIndex;
    setActiveIndex(snapTargetIndex);
    scrollStripTo(targetLeft, {
      behavior,
      activeIndex: snapTargetIndex,
      onComplete: behavior === 'smooth' ? releaseActiveIndexLock : undefined,
    });
  };

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const strip = stripRef.current;
    const flatIndex = isLoopEnabled ? images.length + index : index;
    const item = itemRefs.current[flatIndex];
    if (!strip || !item) return;
    if (behavior === 'smooth') {
      lockedActiveIndexRef.current = index;
    } else {
      lockedActiveIndexRef.current = null;
    }
    setActiveIndex(index);
    scrollStripTo(item.offsetLeft, {
      behavior,
      activeIndex: index,
      onComplete: behavior === 'smooth' ? releaseActiveIndexLock : undefined,
    });
  };

  const removeWindowDragListeners = () => {
    if (!windowDragEndRef.current) return;
    window.removeEventListener('pointerup', windowDragEndRef.current);
    window.removeEventListener('pointercancel', windowDragEndRef.current);
    windowDragEndRef.current = null;
  };

  const finishStripMouseDrag = (pointerId?: number) => {
    if (!mouseDragRef.current.isActive) return;
    removeWindowDragListeners();
    const strip = stripRef.current;
    if (!strip) return;
    const hadMoved = mouseDragRef.current.hasMoved;
    const startScrollLeft = mouseDragRef.current.scrollLeft;
    normalizeInfiniteScroll(true);
    mouseDragRef.current = {
      isActive: false,
      startX: 0,
      scrollLeft: 0,
      hasMoved: false,
    };
    setIsMouseDragging(false);
    if (pointerId !== undefined && strip.hasPointerCapture(pointerId)) {
      strip.releasePointerCapture(pointerId);
    }
    if (hadMoved) {
      snapAfterDrag(startScrollLeft);
    } else {
      setStripSnapEnabled(true);
      updateActiveIndex();
    }
    resetOverlayContentIdleTimer();
  };

  const onStripPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType === 'touch') {
      // Free wheel scrolling leaves native snap disabled; restore it so the
      // touch swipe keeps its snapping behaviour.
      stopWheelAnimation();
      setStripSnapEnabled(true);
      return;
    }
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (isDragBlockedTarget(event.target as HTMLElement)) return;
    const strip = stripRef.current;
    if (!strip) return;
    stopWheelAnimation();
    cancelScrollAnimation();
    clearStripTrackTransform();
    lockedActiveIndexRef.current = null;
    mouseDragRef.current = {
      isActive: true,
      startX: event.clientX,
      scrollLeft: strip.scrollLeft,
      hasMoved: false,
    };
    debugDragStartIndexRef.current = getNearestFlatIndex(strip.scrollLeft) % images.length;
    setStripSnapEnabled(false);
    resetOverlayContentIdleTimer();
    strip.setPointerCapture(event.pointerId);
    removeWindowDragListeners();
    const onWindowEnd = (windowEvent: globalThis.PointerEvent) => {
      if (windowEvent.pointerType !== 'mouse') return;
      finishStripMouseDrag(windowEvent.pointerId);
    };
    windowDragEndRef.current = onWindowEnd;
    window.addEventListener('pointerup', onWindowEnd);
    window.addEventListener('pointercancel', onWindowEnd);
  };

  const onStripPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    const strip = stripRef.current;
    if (!strip || !mouseDragRef.current.isActive) return;
    if (event.buttons === 0) {
      finishStripMouseDrag(event.pointerId);
      return;
    }
    const deltaX = event.clientX - mouseDragRef.current.startX;
    if (Math.abs(deltaX) > MOUSE_DRAG_THRESHOLD_PX) {
      mouseDragRef.current.hasMoved = true;
      setIsMouseDragging(true);
    }
    if (mouseDragRef.current.hasMoved) {
      event.preventDefault();
      strip.scrollLeft = mouseDragRef.current.scrollLeft - deltaX;
      normalizeInfiniteScroll(true);
      updateActiveIndex();
      // #region agent log
      if (debugDragStartIndexRef.current !== null) {
        const dragIndex = getNearestFlatIndex() % images.length;
        const dragIndexDelta = Math.abs(dragIndex - debugDragStartIndexRef.current);
        if (dragIndexDelta >= 2) {
          fetch('http://127.0.0.1:7916/ingest/05b80f60-0d98-4176-9acb-551465211f52',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8d1a00'},body:JSON.stringify({sessionId:'8d1a00',runId:'pre-fix-2',hypothesisId:'J',location:'LightboxOverlay.tsx:onStripPointerMove',message:'during drag multi-index',data:{startIndex:debugDragStartIndexRef.current,dragIndex,dragIndexDelta,scrollLeft:strip.scrollLeft,deltaX},timestamp:Date.now()})}).catch(()=>{});
        }
      }
      // #endregion
      resetOverlayContentIdleTimer();
    }
  };

  const endStripMouseDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag) return;
    if (event.pointerType !== 'mouse') return;
    finishStripMouseDrag(event.pointerId);
  };

  const onStripLostPointerCapture = (event: PointerEvent<HTMLDivElement>) => {
    if (!allowMouseDrag || event.pointerType !== 'mouse') return;
    finishStripMouseDrag(event.pointerId);
  };

  useLightboxScrollLock();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      cancelScrollAnimation();
      removeWindowDragListeners();
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (overlayContentIdleTimerRef.current) {
        clearTimeout(overlayContentIdleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hideOverlayContentOnIdle) {
      setOverlayContentVisible(true);
      return;
    }
    resetOverlayContentIdleTimer();
    const dismissArea = dismissAreaRef.current;
    if (!dismissArea) return;
    const onPointerActivity = () => resetOverlayContentIdleTimer();
    dismissArea.addEventListener('pointermove', onPointerActivity);
    dismissArea.addEventListener('pointerdown', onPointerActivity);
    return () => {
      dismissArea.removeEventListener('pointermove', onPointerActivity);
      dismissArea.removeEventListener('pointerdown', onPointerActivity);
      if (overlayContentIdleTimerRef.current) {
        clearTimeout(overlayContentIdleTimerRef.current);
      }
    };
  }, [hideOverlayContentOnIdle, resetOverlayContentIdleTimer]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  useLayoutEffect(() => {
    measureSetWidth();
  }, [imageGap, images.length, isLoopEnabled]);

  useLayoutEffect(() => {
    if (!isEditMode) {
      scrollToIndex(activeIndexRef.current, 'auto');
    }
  }, [imageGap, isEditMode]);

  useLayoutEffect(() => {
    scrollToIndex(0, 'auto');
  }, [images.length, isLoopEnabled]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || isEditMode) return;

    if (!allowImageScroll) return;

    const onWheel = (event: WheelEvent) => {
      // Vertical wheel (top/bottom) drives the horizontal slide; horizontal
      // wheel/scroll is intentionally ignored so left/right scroll never navigates.
      event.preventDefault();
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const unit = event.deltaMode === 1
        ? WHEEL_LINE_HEIGHT_PX
        : event.deltaMode === 2
          ? strip.clientHeight
          : 1;
      const delta = event.deltaY * unit * WHEEL_SPEED;
      if (delta === 0) return;
      cancelScrollAnimation();
      if (!isWheelingRef.current) {
        // Start a new wheel session: anchor the target to the current position
        // so accumulated deltas interpolate smoothly from where we are.
        isWheelingRef.current = true;
        wheelTargetRef.current = strip.scrollLeft;
        lockedActiveIndexRef.current = null;
        setStripSnapEnabled(false);
      }
      wheelTargetRef.current += delta;
      if (!isLoopEnabled) {
        const maxScrollLeft = strip.scrollWidth - strip.clientWidth;
        wheelTargetRef.current = Math.max(0, Math.min(maxScrollLeft, wheelTargetRef.current));
      }
      resetOverlayContentIdleTimer();
      // No snap on wheel: the lerp eases toward the accumulated target and the
      // strip rests wherever it lands. Native snapping is restored on touch.
      if (wheelRafRef.current === null) {
        wheelRafRef.current = requestAnimationFrame(stepWheelAnimation);
      }
    };

    strip.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      strip.removeEventListener('wheel', onWheel);
      stopWheelAnimation();
    };
  }, [isEditMode, allowImageScroll, isLoopEnabled]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onScroll = () => {
      normalizeInfiniteScroll(mouseDragRef.current.isActive);
      const current = strip.scrollLeft;
      const delta = current - lastScrollLeftRef.current;
      lastScrollLeftRef.current = current;
      const loopJump = setWidthRef.current > 0 ? setWidthRef.current * 0.5 : Infinity;
      if (delta !== 0 && Math.abs(delta) < loopJump) {
        const direction = delta > 0 ? 'forward' : 'backward';
        if (direction !== scrollDirRef.current) {
          scrollDirRef.current = direction;
          updateOversizedSnapAlign(direction);
        }
      }
      updateActiveIndex();
    };
    strip.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(() => {
      measureSetWidth();
      normalizeInfiniteScroll(mouseDragRef.current.isActive);
      updateOversizedSnapAlign(scrollDirRef.current);
      updateActiveIndex();
    });
    observer.observe(strip);
    return () => {
      cancelScrollAnimation();
      strip.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [images.length, isLoopEnabled]);

  return (
    <div
      data-selection="none"
      className={`${P}-lightbox${isEditor ? ` ${P}-lightbox-editor` : ''}${isEditMode ? ` ${P}-lightbox-edit-mode` : ''}`}
      onClick={() => {
        if (isSwipeDragging) return;
        handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${LIGHTBOX_ANIM_MS}ms ease`,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className={`${P}-lightbox-backdrop`} style={{ backgroundColor, ...swipeBackdropStyle }} />
      <div
        ref={dismissAreaRef}
        className={`${P}-lightbox-dismiss-area`}
        style={dismissAreaStyle}
        {...swipeHandlers}
      >
        <div className={`${P}-lightbox-content`} style={mediaAreaStyle} onClick={(event) => event.stopPropagation()}>
        <div
          ref={stripRef}
          className={`${P}-lightbox-strip`}
          data-lightbox-scrollable=""
          data-mouse-draggable={allowMouseDrag && images.length > 0 ? 'true' : 'false'}
          data-mouse-dragging={isMouseDragging ? 'true' : 'false'}
          onPointerDown={onStripPointerDown}
          onPointerMove={onStripPointerMove}
          onPointerUp={endStripMouseDrag}
          onPointerCancel={endStripMouseDrag}
          onLostPointerCapture={onStripLostPointerCapture}
        >
          <div ref={trackRef} className={`${P}-lightbox-strip-track`} style={{ gap: imageGap }}>
          {flatItems.map((item, flatIndex) => {
            const itemObjectFit = item.image.objectFit ?? 'contain';
            const sourceIndex = flatIndex % images.length;
            const copyIndex = Math.floor(flatIndex / images.length);
            const imageGapControlSize = getGapControlSize(imageGap);
            const imageGapControlRight = `calc(-0.5 * (${imageGapControlSize} + ${imageGap}))`;
            return (
              <div
                key={`${copyIndex}-${item.image.url}-${sourceIndex}`}
                ref={(element) => itemRefs.current[flatIndex] = element}
                className={`${P}-strip-item`}
                style={{ height: titleHeaderLayout === 'mobile' ? '75vh' : '100%'}}
              >
                <img
                  src={item.image.url}
                  draggable={false}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: '100%',
                    objectFit: itemObjectFit,
                  }}
                />
                {isEditMode && sourceIndex < images.length - 1 && copyIndex === 0 && (
                  <div
                    data-controls="imageGap"
                    data-controls-axis="x"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: imageGapControlRight,
                      width: imageGapControlSize,
                      height: '100%',
                      pointerEvents: 'auto',
                      zIndex: 3,
                    }}
                  />
                )}
              </div>
            );
          })}
          </div>
        </div>
        </div>
        <div
          className={`${P}-lightbox-content-inner`}
          data-overlay-content-hidden={isOverlayContentHidden ? 'true' : 'false'}
          style={swipeOverlayContentStyle}
        >
          <div
            data-controls={isEditMode ? 'contentMarginTop' : undefined}
            data-controls-axis={isEditMode ? 'y' : undefined}
            data-controls-handle-left-fraction={isEditMode ? '0.05' : undefined}
            className={isEditMode ? `${P}-control` : undefined}
            style={{ height: contentMarginTop, width: '100%', pointerEvents: isEditMode ? 'auto' : 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', flex: 1, minHeight: 0, pointerEvents: 'none' }}>
            <div className={`${P}-lightbox-content-area${useTwoRowHeader ? ` ${P}-lightbox-content-area-stacked` : ''}`}>
              {(hasTitles || closeIcon) && (
                <div className={`${P}-header ${useTwoRowHeader ? `${P}-header-two-row` : `${P}-header-single-row`}`}>
                  {useTwoRowHeader
                    ? renderTwoRowHeader()
                    : (hasTitles || closeIcon ? renderSingleRowHeader() : null)}
                </div>
              )}
            </div>
          </div>
        </div>
        {images.length > 1 && thumbnailVisibility === 'on' && (() => {
          const thumbnailMarginBottomControlSize = getGapControlSize(thumbnailMarginBottom);
          const thumbnailMarginBottomControlBottom = `calc(-0.5 * (${thumbnailMarginBottom} + ${thumbnailMarginBottomControlSize}))`;
          return (
            <div
              className={`${P}-thumbnails`}
              data-lightbox-scrollable=""
              data-thumbnail-active={thumbnailActive}
              data-overlay-content-hidden={isOverlayContentHidden ? 'true' : 'false'}
              onClick={(event) => event.stopPropagation()}
              style={{
                gap: thumbnailGap,
                bottom: thumbnailMarginBottom,
                '--thumbnail-active-color': thumbnailActiveColor,
                ...swipeOverlayContentStyle,
              } as CSSProperties}
            >
              {images.map((item, index) => {
                const thumbnailGapControlSize = getGapControlSize(thumbnailGap);
                const thumbnailGapControlRight = `calc(-0.5 * (${thumbnailGapControlSize} + ${thumbnailGap}))`;
                return (
                <div key={`thumb-${item.image.url}-${index}`} style={{ position: 'relative', flex: '0 0 auto' }}>
                  <button
                    type="button"
                    className={`${P}-thumb`}
                    data-active={activeIndex === index ? 'true' : 'false'}
                    onClick={() => allowImageScroll && thumbnailTrigger === 'click' && scrollToIndex(index)}
                    onMouseEnter={() => allowThumbnailHover && thumbnailTrigger === 'hover' && scrollToIndex(index)}
                    aria-label={item.image.name ? `View ${item.image.name}` : `View image ${index + 1}`}
                    aria-current={activeIndex === index ? 'true' : undefined}
                  >
                    <img
                      className={`${P}-thumb-image${isThumbCover ? ` ${P}-thumb-image-cover` : ''}`}
                      src={item.image.url}
                      alt=""
                      draggable={false}
                      style={
                        {...thumbAspectRatioStyle,
                        ...(thumbnailObjectFit.display === 'cover' ? { width: THUMB_MAX_SIZE_PX } : { width: '100%' }),}
                      }
                    />
                  </button>
                  {isEditMode && index < images.length - 1 && (
                    <div
                      data-controls="thumbnailGap"
                      data-controls-axis="x"
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: thumbnailGapControlRight,
                        width: thumbnailGapControlSize,
                        height: '100%',
                        pointerEvents: 'auto',
                        zIndex: 3,
                      }}
                    />
                  )}
                </div>
              );
              })}
              {isEditMode && (
                <div
                  data-controls="thumbnailMarginBottom"
                  data-controls-axis="y"
                  data-controls-reverse={isEditMode ? '' : undefined}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: thumbnailMarginBottomControlBottom,
                    height: thumbnailMarginBottomControlSize,
                    pointerEvents: 'auto',
                    zIndex: 3,
                  }}
                />
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
