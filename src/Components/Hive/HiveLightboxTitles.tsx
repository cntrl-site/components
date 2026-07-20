import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import {
  buildJournalTitleSlots,
  DEFAULT_JOURNAL_TITLE_WIDTHS,
  getEffectiveJournalTitleWidths,
  getJournalTitleBoundaryOffset,
  getJournalTitleMaxWidth,
  getJournalTitleOffsetBeforeSlot,
  getRowScopedJournalTitleWidths,
  journalTextFieldsToCss,
  resolveJournalTextFields,
  resolveJournalTitleWidths,
  TITLE_PADDING_HANDLE_WIDTH,
  TITLE_RESIZE_HANDLE_WIDTH,
  type JournalTitleSlot,
} from '../LightboxJournal/utils';

export type HiveLightboxTextEntry = {
  title1: string;
  title2: string;
  title3: string;
};

export type HiveLightboxTitleSettings = {
  title1Width?: number;
  title2Width?: number;
  title3Width?: number;
  title1MarginLeft?: number;
  title2MarginLeft?: number;
  title3MarginLeft?: number;
  titleRowMarginBottom?: number;
  titleHeaderLayout?: 'desktop' | 'mobile';
  contentMarginTop?: number;
  iconMarginRight?: number;
  closeIcon?: string | null;
  closeIconMaxWidth?: number;
  closeIconColor?: string;
  closeIconHoverColor?: string;
  backgroundColor?: string;
  title1Color: string;
  title2Color: string;
  title3Color: string;
} & Record<string, unknown>;

type HiveLightboxTitlesProps = {
  prefix: string;
  entry: HiveLightboxTextEntry;
  settings: HiveLightboxTitleSettings;
  isEditor?: boolean;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  onClose?: () => void;
};

export function HiveLightboxTitles({
  prefix: P,
  entry,
  settings,
  isEditor,
  isEditMode,
  isPreviewMode,
  onClose,
}: HiveLightboxTitlesProps) {
  const {
    title1Width,
    title2Width,
    title3Width,
    title1MarginLeft = 0,
    title2MarginLeft = 0,
    title3MarginLeft = 0,
    titleRowMarginBottom = 0,
    titleHeaderLayout = 'desktop',
    contentMarginTop: contentMarginTopSetting = 0,
    iconMarginRight: iconMarginRightSetting = 0,
    closeIcon = null,
    closeIconMaxWidth = 0,
    closeIconColor = '#000000',
    closeIconHoverColor = '#cccccc',
  } = settings;

  const contentMarginTop = scalingValue(contentMarginTopSetting, isEditor);
  const iconMarginRight = scalingValue(iconMarginRightSetting, isEditor);
  const titleRowMarginBottomScaled = scalingValue(titleRowMarginBottom, isEditor);
  const useTwoRowHeader = titleHeaderLayout === 'mobile';

  const title1Style = journalTextFieldsToCss('title1', resolveJournalTextFields(settings as Parameters<typeof resolveJournalTextFields>[0], 'title1'), isEditor);
  const title2Style = journalTextFieldsToCss('title2', resolveJournalTextFields(settings as Parameters<typeof resolveJournalTextFields>[0], 'title2'), isEditor);
  const title3Style = journalTextFieldsToCss('title3', resolveJournalTextFields(settings as Parameters<typeof resolveJournalTextFields>[0], 'title3'), isEditor);

  const titleWidthByKey = useMemo(
    () => ({
      title1Width: title1Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title1Width,
      title2Width: title2Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title2Width,
      title3Width: title3Width ?? DEFAULT_JOURNAL_TITLE_WIDTHS.title3Width,
    }),
    [title1Width, title2Width, title3Width],
  );
  const titleMarginLeftByKey = useMemo(() => ({
    title2MarginLeft,
    title3MarginLeft,
  }), [title2MarginLeft, title3MarginLeft]);

  const activeTitleSlots = useMemo(
    () => buildJournalTitleSlots(P, entry, title1Style, title2Style, title3Style),
    [P, entry, title1Style, title2Style, title3Style],
  );
  const storedTitleWidths = useMemo(
    () => activeTitleSlots.map((slot) => titleWidthByKey[slot.widthKey]),
    [activeTitleSlots, titleWidthByKey],
  );
  const resolvedTitleWidths = useMemo(
    () => resolveJournalTitleWidths(activeTitleSlots.length, storedTitleWidths),
    [activeTitleSlots.length, storedTitleWidths],
  );
  const effectiveTitleWidths = useMemo(
    () => getEffectiveJournalTitleWidths(activeTitleSlots.length, storedTitleWidths),
    [activeTitleSlots.length, storedTitleWidths],
  );
  const topRowTitleSlots = useMemo(
    () => activeTitleSlots.filter((slot) => slot.prefix === 'title1'),
    [activeTitleSlots],
  );
  const bottomRowTitleSlots = useMemo(
    () => activeTitleSlots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3'),
    [activeTitleSlots],
  );
  const topRowTitleWidths = useMemo(
    () => getRowScopedJournalTitleWidths(topRowTitleSlots, titleWidthByKey),
    [topRowTitleSlots, titleWidthByKey],
  );
  const bottomRowTitleWidths = useMemo(
    () => getRowScopedJournalTitleWidths(bottomRowTitleSlots, titleWidthByKey),
    [bottomRowTitleSlots, titleWidthByKey],
  );

  const hasTitles = Boolean(entry.title1 || entry.title2 || entry.title3);
  const hasCloseIcon = closeIcon !== null;
  const hasHeaderContent = hasTitles || hasCloseIcon;
  if (!hasHeaderContent) return null;

  const showTitle1MarginLeftSpacer = (title1MarginLeft ?? 0) > 0 || isEditMode;

  const getSlotTitleWidthContext = (
    slot: JournalTitleSlot,
    rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom',
  ) => {
    const fullIndex = activeTitleSlots.findIndex((s) => s.prefix === slot.prefix);
    if (!useTwoRowHeader || rowLayout === 'single-row') {
      return {
        effectiveWidth: effectiveTitleWidths[fullIndex] ?? 0,
        resolvedWidth: resolvedTitleWidths[fullIndex] ?? 0,
        maxWidth: getJournalTitleMaxWidth(fullIndex, resolvedTitleWidths),
      };
    }
    if (rowLayout === 'two-row-top') {
      const topIndex = topRowTitleSlots.findIndex((s) => s.prefix === slot.prefix);
      return {
        effectiveWidth: topRowTitleWidths.effective[topIndex] ?? 0,
        resolvedWidth: topRowTitleWidths.resolved[topIndex] ?? 0,
        maxWidth: getJournalTitleMaxWidth(topIndex, topRowTitleWidths.resolved),
      };
    }
    const bottomIndex = bottomRowTitleSlots.findIndex((s) => s.prefix === slot.prefix);
    return {
      effectiveWidth: bottomRowTitleWidths.effective[bottomIndex] ?? 0,
      resolvedWidth: bottomRowTitleWidths.resolved[bottomIndex] ?? 0,
      maxWidth: getJournalTitleMaxWidth(bottomIndex, bottomRowTitleWidths.resolved),
    };
  };

  const getEntryTitleCellWidthContext = (
    slots: JournalTitleSlot[],
    slot: JournalTitleSlot,
    rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom',
  ) => {
    if (!useTwoRowHeader || rowLayout === 'single-row') {
      const index = slots.findIndex((s) => s.prefix === slot.prefix);
      const stored = slots.map((s) => titleWidthByKey[s.widthKey]);
      const resolved = resolveJournalTitleWidths(slots.length, stored);
      const effective = getEffectiveJournalTitleWidths(slots.length, stored);
      return {
        effectiveWidth: effective[index] ?? 0,
        resolvedWidth: resolved[index] ?? 0,
        maxWidth: getJournalTitleMaxWidth(index, resolved),
      };
    }
    if (rowLayout === 'two-row-top') {
      const topSlots = slots.filter((s) => s.prefix === 'title1');
      const topIndex = topSlots.findIndex((s) => s.prefix === slot.prefix);
      const { resolved, effective } = getRowScopedJournalTitleWidths(topSlots, titleWidthByKey);
      return {
        effectiveWidth: effective[topIndex] ?? 0,
        resolvedWidth: resolved[topIndex] ?? 0,
        maxWidth: getJournalTitleMaxWidth(topIndex, resolved),
      };
    }
    const bottomSlots = slots.filter((s) => s.prefix === 'title2' || s.prefix === 'title3');
    const bottomIndex = bottomSlots.findIndex((s) => s.prefix === slot.prefix);
    const { resolved, effective } = getRowScopedJournalTitleWidths(bottomSlots, titleWidthByKey);
    return {
      effectiveWidth: effective[bottomIndex] ?? 0,
      resolvedWidth: resolved[bottomIndex] ?? 0,
      maxWidth: getJournalTitleMaxWidth(bottomIndex, resolved),
    };
  };

  const getTitleBoundaryOffset = (upToIndex: number) => getJournalTitleBoundaryOffset(
    activeTitleSlots,
    resolvedTitleWidths,
    titleMarginLeftByKey,
    upToIndex,
  ) + (!useTwoRowHeader ? title1MarginLeft ?? 0 : 0);

  const getSingleRowMarginColumnOffset = () => (!useTwoRowHeader ? title1MarginLeft ?? 0 : 0);

  const getBottomRowOffsetBeforeSlot = (upToBottomIndex: number) => bottomRowTitleSlots.slice(0, upToBottomIndex).reduce(
    (offset, slot, index) => offset
      + (slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0)
      + (bottomRowTitleWidths.resolved[index] ?? 0),
    0,
  );

  const getBottomRowBoundaryOffset = (bottomIndex: number) => {
    const slot = bottomRowTitleSlots[bottomIndex];
    return getBottomRowOffsetBeforeSlot(bottomIndex)
      + (slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0)
      + (bottomRowTitleWidths.resolved[bottomIndex] ?? 0);
  };

  const renderTitleCell = (
    slot: JournalTitleSlot,
    rowLayout: 'single-row' | 'two-row-top' | 'two-row-bottom',
    widthContext?: {
      effectiveWidth: number;
      resolvedWidth: number;
      maxWidth: number;
    },
  ) => {
    const marginLeft = slot.marginLeftKey ? titleMarginLeftByKey[slot.marginLeftKey] ?? 0 : 0;
    const {
      effectiveWidth,
      resolvedWidth,
      maxWidth: maxTitleWidth,
    } = widthContext ?? getSlotTitleWidthContext(slot, rowLayout);
    const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);
    const showCellControls = isEditMode && rowLayout === 'two-row-top';

    return (
      <div
        key={slot.className}
        className={`${P}-title-cell`}
        data-title={slot.prefix}
        style={{
          width: scalingValue(effectiveWidth, isEditor),
          ...(marginLeft > 0 ? { marginLeft: scalingValue(marginLeft, isEditor) } : {}),
        }}
      >
        <p className={slot.className} style={slot.style}>{slot.text}</p>
        {showCellControls && slot.marginLeftKey ? (
          <div
            data-controls={slot.marginLeftKey}
            data-controls-axis="x"
            data-controls-min="0"
            data-controls-max-fraction={String(resolvedWidth)}
            style={{
              position: 'absolute',
              top: 0,
              left: scalingValue(-marginLeft, isEditor),
              width: scalingValue(marginHandleWidth, isEditor),
              height: '100%',
              pointerEvents: 'auto',
            }}
          />
        ) : null}
        {showCellControls ? (
          <div
            data-controls={slot.widthKey}
            data-controls-axis="x"
            data-controls-max-fraction={String(maxTitleWidth)}
            data-controls-variant="column-width"
            className={`${P}-title-resize-handle`}
            style={{
              position: 'absolute',
              top: 0,
              right: scalingValue(-TITLE_RESIZE_HANDLE_WIDTH / 2, isEditor),
              width: scalingValue(TITLE_RESIZE_HANDLE_WIDTH, isEditor),
              height: '100%',
              pointerEvents: 'auto',
            }}
          />
        ) : null}
      </div>
    );
  };

  const renderTitle1MarginLeftSpacer = (placement: 'single-row' | 'two-row' = 'two-row') => {
    const title1SlotIndex = activeTitleSlots.findIndex((slot) => slot.prefix === 'title1');
    const title1MaxFraction = title1SlotIndex >= 0
      ? resolvedTitleWidths[title1SlotIndex]
      : titleWidthByKey.title1Width;
    const hasMarginControlOnSpacer = placement === 'two-row' && isEditMode;
    return (
      <div
        {...(hasMarginControlOnSpacer ? {
          'data-controls': 'title1MarginLeft',
          'data-controls-axis': 'x',
          'data-controls-min': '0',
          'data-controls-max-fraction': String(title1MaxFraction),
        } : {})}
        style={{
          width: scalingValue(title1MarginLeft ?? 0, isEditor),
          flexShrink: 0,
          alignSelf: 'stretch',
          ...(hasMarginControlOnSpacer ? { pointerEvents: 'auto' as const } : {}),
        }}
      />
    );
  };

  const renderTitleBaselineStrut = () => (
    <span
      className={`${P}-titles-baseline-strut`}
      style={title1Style}
      aria-hidden="true"
    >
      {'\u00a0'}
    </span>
  );

  const renderSingleRowTitles = (textEntry: HiveLightboxTextEntry) => {
    const slots = buildJournalTitleSlots(P, textEntry, title1Style, title2Style, title3Style);
    return (
      <>
        {slots.map((slot) => renderTitleCell(
          slot,
          'single-row',
          getEntryTitleCellWidthContext(slots, slot, 'single-row'),
        ))}
      </>
    );
  };

  const renderTwoRowTopTitle = (textEntry: HiveLightboxTextEntry) => {
    const slots = buildJournalTitleSlots(P, textEntry, title1Style, title2Style, title3Style);
    const title1Slot = slots.find((slot) => slot.prefix === 'title1');
    if (!title1Slot) return null;
    return renderTitleCell(
      title1Slot,
      'two-row-top',
      getEntryTitleCellWidthContext(slots, title1Slot, 'two-row-top'),
    );
  };

  const renderTwoRowBottomTitles = (textEntry: HiveLightboxTextEntry, includeControls = false) => {
    const slots = buildJournalTitleSlots(P, textEntry, title1Style, title2Style, title3Style);
    const bottomSlots = slots.filter((slot) => slot.prefix === 'title2' || slot.prefix === 'title3');
    const showMarginBottomControl = isEditMode && includeControls;
    const showBottomWrap = bottomSlots.length > 0
      || showMarginBottomControl
      || (titleRowMarginBottom ?? 0) > 0;
    if (!showBottomWrap) return null;

    return (
      <div className={`${P}-titles-row-bottom-wrap`}>
        {bottomSlots.length > 0 ? (
          <div className={`${P}-titles-row-bottom`}>
            <div className={`${P}-titles-stack`}>
              {bottomSlots.map((slot) => renderTitleCell(
                slot,
                'two-row-bottom',
                getEntryTitleCellWidthContext(slots, slot, 'two-row-bottom'),
              ))}
            </div>
            {includeControls && isEditMode ? (
              <>
                {renderTwoRowBottomMarginControls()}
                {renderTwoRowBottomWidthControls()}
              </>
            ) : null}
          </div>
        ) : null}
        {(titleRowMarginBottom ?? 0) > 0 || showMarginBottomControl ? (
          <div
            data-controls={showMarginBottomControl ? 'titleRowMarginBottom' : undefined}
            data-controls-axis={showMarginBottomControl ? 'y' : undefined}
            data-controls-reverse={showMarginBottomControl ? '' : undefined}
            className={showMarginBottomControl ? `${P}-control` : undefined}
            style={{
              height: titleRowMarginBottomScaled,
              width: '100%',
              flexShrink: 0,
              pointerEvents: showMarginBottomControl ? 'auto' : 'none',
            }}
          />
        ) : null}
      </div>
    );
  };

  const renderCloseIcon = () => (
    <div
      className={`${P}-close-icon`}
      style={{
        width: scalingValue(closeIconMaxWidth ?? 0, isEditor),
        height: scalingValue(closeIconMaxWidth ?? 0, isEditor),
        marginRight: iconMarginRight,
        ['--close-icon-hover-color' as string]: closeIconHoverColor,
      }}
    >
      <button
        type="button"
        className={`${P}-close-icon-inner`}
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        aria-label="Close"
      >
        <SvgImage
          url={closeIcon ?? ''}
          fill={closeIconColor}
          hoverFill={isEditor && !isPreviewMode ? closeIconColor : closeIconHoverColor}
          className={`${P}-close-icon-img`}
        />
      </button>
      {isEditMode && (
        <div
          data-controls="iconMarginRight"
          data-controls-axis="x"
          data-controls-reverse=""
          className={`${P}-control`}
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            width: iconMarginRight,
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      )}
    </div>
  );

  const renderHeaderTrailingControls = () => {
    if (!hasCloseIcon) return null;
    return (
      <div className={`${P}-titles-row-header-controls`}>
        {renderCloseIcon()}
      </div>
    );
  };

  const renderTitlesStack = (titleContent: ReactNode) => (
    <div className={`${P}-titles-row-titles`}>
      <div className={`${P}-titles-stack`}>
        {titleContent}
      </div>
    </div>
  );

  const renderTwoRowTopRow = (titleContent: ReactNode) => (
    <div className={`${P}-titles-row-top`}>
      {(hasCloseIcon || hasTitles) ? renderTitleBaselineStrut() : null}
      {showTitle1MarginLeftSpacer ? renderTitle1MarginLeftSpacer('two-row') : null}
      {renderTitlesStack(titleContent)}
      {renderHeaderTrailingControls()}
    </div>
  );

  const renderTwoRowTitles = (textEntry: HiveLightboxTextEntry, includeControls = false) => (
    <>
      {renderTwoRowTopRow(renderTwoRowTopTitle(textEntry))}
      {renderTwoRowBottomTitles(textEntry, includeControls)}
    </>
  );

  const renderTitleMarginControls = () => {
    const singleRowTitle1Index = !useTwoRowHeader ? activeTitleSlots.findIndex((slot) => slot.prefix === 'title1') : -1;
    const singleRowTitle1Control = !useTwoRowHeader && (isEditMode || (title1MarginLeft ?? 0) > 0) ? (() => {
      const marginLeft = title1MarginLeft ?? 0;
      const title1MaxFraction = singleRowTitle1Index >= 0
        ? resolvedTitleWidths[singleRowTitle1Index]
        : titleWidthByKey.title1Width;
      const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);

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
            width: scalingValue(marginHandleWidth, isEditor),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      );
    })() : null;

    const slotMarginControls = activeTitleSlots.flatMap((slot, colIndex) => {
      if (!slot.marginLeftKey) return [];
      const marginLeft = titleMarginLeftByKey[slot.marginLeftKey] ?? 0;
      const offsetBeforeMargin = getJournalTitleOffsetBeforeSlot(
        activeTitleSlots,
        resolvedTitleWidths,
        titleMarginLeftByKey,
        colIndex,
      ) + getSingleRowMarginColumnOffset();
      const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);

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
            left: scalingValue(offsetBeforeMargin, isEditor),
            width: scalingValue(marginHandleWidth, isEditor),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      );
    });

    return singleRowTitle1Control ? [singleRowTitle1Control, ...slotMarginControls] : slotMarginControls;
  };

  const renderTitleWidthControls = () => activeTitleSlots.map((slot, colIndex) => {
    const maxTitleWidth = getJournalTitleMaxWidth(colIndex, resolvedTitleWidths);
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
            left: scalingValue(titleWidthHandleOffset, isEditor),
            width: scalingValue(TITLE_RESIZE_HANDLE_WIDTH, isEditor),
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
    const marginHandleWidth = Math.max(marginLeft, TITLE_PADDING_HANDLE_WIDTH);
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
          left: scalingValue(offsetBeforeMargin, isEditor),
          width: scalingValue(marginHandleWidth, isEditor),
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
            left: scalingValue(titleWidthHandleOffset, isEditor),
            width: scalingValue(TITLE_RESIZE_HANDLE_WIDTH, isEditor),
            height: '100%',
            pointerEvents: 'auto',
          }}
        />
      </div>
    );
  });

  const renderTitleControls = () => {
    if (!isEditMode || useTwoRowHeader) return null;
    return (
      <>
        {renderTitleMarginControls()}
        {renderTitleWidthControls()}
      </>
    );
  };

  const hasTwoRowBottomArea = Boolean(
    entry.title2 || entry.title3
    || (titleRowMarginBottom ?? 0) > 0
    || isEditMode,
  );

  const renderSingleRowHeader = () => (
    <div
      className={`${P}-titles-row ${P}-titles-row-header`}
      style={{ width: '100%', position: 'relative' }}
    >
      {(hasCloseIcon || hasTitles) ? renderTitleBaselineStrut() : null}
      {showTitle1MarginLeftSpacer ? renderTitle1MarginLeftSpacer('single-row') : null}
      {hasTitles ? renderTitlesStack(renderSingleRowTitles(entry)) : <div className={`${P}-titles-row-titles`} aria-hidden="true" />}
      {renderHeaderTrailingControls()}
      {renderTitleControls()}
    </div>
  );

  const renderTwoRowHeader = () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        ...(hasTwoRowBottomArea ? { flex: 1, height: '100%' } : {}),
      }}
    >
      <div
        className={`${P}-titles-row-two-row`}
        style={hasTwoRowBottomArea ? undefined : { flex: '0 0 auto', height: 'auto' }}
      >
        {renderTwoRowTitles(entry, true)}
      </div>
      {renderTitleControls()}
    </div>
  );

  return (
    <div className={`${P}-lightbox-overlay-content`}>
      <div
        data-controls={isEditMode ? 'contentMarginTop' : undefined}
        className={isEditMode ? `${P}-control` : undefined}
        style={{ height: contentMarginTop, width: '100%' }}
      />
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        ...(useTwoRowHeader ? { flex: 1, minHeight: 0 } : {}),
      } as CSSProperties}>
        <div className={`${P}-lightbox-content-area${useTwoRowHeader ? ` ${P}-lightbox-content-area-stacked` : ''}`}>
          <div
            className={`${P}-text-bar-cell${useTwoRowHeader ? ` ${P}-text-bar-cell-stacked` : ''}`}
            style={!useTwoRowHeader ? { flex: 1, minWidth: 0, width: '100%' } : undefined}
          >
            {useTwoRowHeader ? renderTwoRowHeader() : renderSingleRowHeader()}
          </div>
        </div>
      </div>
    </div>
  );
}
