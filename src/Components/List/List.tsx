import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils/index';
import { useEffect, useMemo, useRef, useState } from 'react';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  display: grid;
  align-items: start;
  min-height: ${sv(48)};
  position: relative;
  overflow: visible;
  box-sizing: border-box;
}

.${P}-hover-image {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none;
  display: block;
  height: auto;
}

.${P}-list-item {
  display: block;
  width: 100%;
  overflow: visible;
  position: relative;
  box-sizing: content-box;
  border-bottom-style: solid;
  border-bottom-color: var(--${P}-divider-color);
  user-select: none;
  background: var(--${P}-background-color);
}

.${P}-list-cols-row {
  display: flex;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

a.${P}-list-item {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.${P}-list-item:first-child {
  border-top-style: solid;
  border-top-color: var(--${P}-divider-color);
}

.${P}-list-col {
  flex-shrink: 0;
  overflow: visible;
  box-sizing: border-box;
  min-width: ${sv(50)};
  position: relative;
  display: flex;
  align-items: center;
}

.${P}-list-col-last {
  flex: 1 1 auto;
  min-width: ${sv(50)};
}

.${P}-list-col-title {
  color: var(--${P}-text-color);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  flex: 1;
  min-width: 0;
  width: 100%;
}

.${P}-col-resize-handle,
.${P}-row-padding-handle,
.${P}-wrapper-padding-handle {
  background: transparent;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item {
  transition: background-color 250ms, border-color 250ms;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-label {
  transition: color 250ms;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:hover,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-item:hover,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-cut-item {
  background: var(--${P}-background-hover-color);
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:hover,
.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:has(+ .${P}-list-item:hover),
.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:has(+ .${P}-cut-item:hover),
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-item:hover,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-cut-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:has(+ .${P}-list-item:hover),
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:has(+ .${P}-cut-item:hover),
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item:hover,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-cut-item {
  border-bottom-color: var(--${P}-divider-hover-color);
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:hover:first-child,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item:first-child,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover:first-child,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item:first-child {
  border-top-color: var(--${P}-divider-hover-color);
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:hover .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-item:hover .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-cut-item .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item:hover .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-cut-item .${P}-cut-label {
  color: var(--${P}-text-hover-color);
}

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item::before,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--${P}-background-hover-color);
  transform: scaleY(0);
  transform-origin: center center;
  transition: transform 250ms;
  z-index: 0;
  pointer-events: none;
}

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-col,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-label {
  position: relative;
  z-index: 1;
}

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover::before,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item::before,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item:hover::before,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-cut-item::before {
  transform: scaleY(1);
}

.${P}-cut-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: visible;
  position: relative;
  box-sizing: border-box;
  border-bottom-style: solid;
  border-bottom-color: var(--${P}-divider-color);
  user-select: none;
  background: var(--${P}-background-color);
}

.${P}-cut-label {
  all: unset;
  cursor: pointer;
  color: var(--${P}-text-color);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
`;
}

type ListItemColumn = {
  key: string;
  widthKey: ColumnWidthKey;
  width: number;
};

const COLUMN_CONTENT_KEYS = [
  'AColumn',
  'BColumn',
  'CColumn',
  'DColumn',
  'EColumn',
] as const;

const COLUMN_WIDTH_KEYS = [
  'AColumnWidth',
  'BColumn',
  'CColumn',
  'DColumn',
  'EColumn',
] as const;

type ColumnWidthKey = typeof COLUMN_WIDTH_KEYS[number];

const COL_RESIZE_HANDLE_WIDTH = 0.004;
const ROW_PADDING_HANDLE_HEIGHT = 0.004;
const WRAPPER_PADDING_HANDLE_WIDTH = 0.004;
const MIN_COLUMN_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_COLUMN_WIDTH = MIN_COLUMN_WIDTH_PX / ARTICLE_DESIGN_WIDTH;

const DEFAULT_COLUMN_WIDTHS: Record<ColumnWidthKey, number> = {
  AColumnWidth: 0.02,
  BColumn: 0.02,
  CColumn: 0.02,
  DColumn: 0.02,
  EColumn: 0.02,
};

export function getListEffectiveContentWidth(
  settings: Record<string, unknown>,
): number {
  const wrapperWidth = typeof settings.wrapperWidth === 'number' ? settings.wrapperWidth : 1;
  const paddingLeft =
    typeof settings.wrapperPaddingLeft === 'number' ? settings.wrapperPaddingLeft : 0;
  const paddingRight =
    typeof settings.wrapperPaddingRight === 'number' ? settings.wrapperPaddingRight : 0;

  return Math.max(0, wrapperWidth - paddingLeft - paddingRight);
}

export function getEqualListColumnWidthUpdates(
  columns: number,
  contentWidth: number = 1,
): Record<ColumnWidthKey, number> {
  const equalColumnWidth = contentWidth / columns;
  return Object.fromEntries(
    COLUMN_WIDTH_KEYS.map((key) => [key, equalColumnWidth]),
  ) as Record<ColumnWidthKey, number>;
}

function getStoredColumnWidths(
  settings: Record<string, unknown>,
): Record<ColumnWidthKey, number> {
  return Object.fromEntries(
    COLUMN_WIDTH_KEYS.map((key) => [
      key,
      typeof settings[key] === 'number'
        ? settings[key] as number
        : DEFAULT_COLUMN_WIDTHS[key],
    ]),
  ) as Record<ColumnWidthKey, number>;
}

export function resolveListColumnWidths(
  columns: number,
  wrapperWidth: number,
  storedWidths: Record<ColumnWidthKey, number>,
): number[] {
  if (columns <= 0) {
    return [];
  }

  const widths = COLUMN_WIDTH_KEYS.slice(0, columns).map(
    (key) => storedWidths[key],
  );

  if (columns === 1) {
    return widths;
  }

  const fixedWidths = widths.slice(0, columns - 1);
  const fixedSum = fixedWidths.reduce((sum, width) => sum + width, 0);
  const minTotalWidth = fixedSum + MIN_COLUMN_WIDTH;

  if (wrapperWidth >= minTotalWidth) {
    return widths;
  }

  const resolvedFixedWidths = [...fixedWidths];
  let overflow = minTotalWidth - wrapperWidth;

  for (let index = resolvedFixedWidths.length - 1; index >= 0 && overflow > 0; index -= 1) {
    const shrinkable = resolvedFixedWidths[index] - MIN_COLUMN_WIDTH;
    if (shrinkable <= 0) {
      continue;
    }

    const shrinkAmount = Math.min(overflow, shrinkable);
    resolvedFixedWidths[index] -= shrinkAmount;
    overflow -= shrinkAmount;
  }

  return [...resolvedFixedWidths, widths[columns - 1]];
}

function getListColumnWidthUpdatesForWrapperWidth(
  columns: number,
  wrapperWidth: number,
  storedWidths: Record<ColumnWidthKey, number>,
): Partial<Record<ColumnWidthKey, number>> {
  if (columns <= 1) {
    return {};
  }

  const resolvedWidths = resolveListColumnWidths(columns, wrapperWidth, storedWidths);
  const updates: Partial<Record<ColumnWidthKey, number>> = {};

  for (let index = 0; index < columns - 1; index += 1) {
    const key = COLUMN_WIDTH_KEYS[index];
    if (resolvedWidths[index] !== storedWidths[key]) {
      updates[key] = resolvedWidths[index];
    }
  }

  return updates;
}

export function applyListSettingsChange(
  nextSettings: Record<string, unknown>,
  prevSettings: Record<string, unknown>,
): Record<string, unknown> {
  const nextColumns = nextSettings.columns;
  const prevColumns = prevSettings.columns;
  const nextContentWidth = getListEffectiveContentWidth(nextSettings);
  const prevContentWidth = getListEffectiveContentWidth(prevSettings);

  if (typeof nextColumns === 'number' && nextColumns !== prevColumns) {
    return {
      ...nextSettings,
      ...getEqualListColumnWidthUpdates(nextColumns, nextContentWidth),
    };
  }

  if (nextContentWidth < prevContentWidth) {
    const columns =
      typeof nextColumns === 'number'
        ? nextColumns
        : typeof prevColumns === 'number'
          ? prevColumns
          : undefined;

    if (typeof columns === 'number') {
      const storedWidths = getStoredColumnWidths({ ...prevSettings, ...nextSettings });

      return {
        ...nextSettings,
        ...getListColumnWidthUpdatesForWrapperWidth(columns, nextContentWidth, storedWidths),
      };
    }
  }

  return nextSettings;
}

function getColumnMaxWidth(
  columnIndex: number,
  resolvedWidths: number[],
  storedWidths: number[],
  wrapperWidth: number,
): number {
  const leftWidth = resolvedWidths
    .slice(0, columnIndex)
    .reduce((sum, width) => sum + width, 0);
  const rightPreferredWidth = storedWidths
    .slice(columnIndex + 1, resolvedWidths.length - 1)
    .reduce((sum, width) => sum + width, 0);

  return Math.max(
    MIN_COLUMN_WIDTH,
    wrapperWidth - leftWidth - rightPreferredWidth - MIN_COLUMN_WIDTH,
  );
}

type ListContentItem = {
  AColumn?: string;
  BColumn?: string;
  CColumn?: string;
  DColumn?: string;
  EColumn?: string;
  image?: {
    objectFit?: 'cover' | 'contain';
    url: string;
    name: string;
  };
  link?: string;
};

type ListItemRow = {
  id: string | number;
  cells: Record<string, React.ReactNode>;
  image?: ListContentItem['image'];
  link?: string;
};

type HoverImageState = {
  rowId: string | number;
  url: string;
  objectFit: 'cover' | 'contain';
  widthPx: number;
};

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

type ListProps = {
  layoutId?: string;
  settings: ListSettings;
  content?: ListContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: ListSettings) => void;
} & CommonComponentProps;

export function List({ settings, content, isEditor, isPreviewMode, metadata, activeEvent, layoutId, onUpdateSettings }: ListProps) {
  const { prefix: P } = useScopedStyles();
  const {
    columns,
    wrapperWidth,
    entriesCount,
    cellMinHeight,
    dividerWidth,
    cut,
    showCut,
    cutCellMinHeight,
    cutLabel,
    imageSize,
    imageOnHover,
    entryHoverEffect,
    rowPaddingTop,
    rowPaddingBottom,
    wrapperPaddingLeft,
    wrapperPaddingRight,
    AColumnWidth,
    BColumn,
    CColumn,
    DColumn,
    EColumn,
    columnsOrder,
    textColor,
    textFontFamily,
    textFontSettings,
    textFontSize,
    textLineHeight,
    textLetterSpacing,
    textWordSpacing,
    textTextAppearance,
    backgroundColor,
    dividerColor,
    textHoverColor,
    backgroundHoverColor,
    dividerHoverColor,
  } = settings;

  const [visibleRowCount, setVisibleRowCount] = useState<number | undefined>(undefined);
  const [hoverImage, setHoverImage] = useState<HoverImageState | null>(null);
  const showHoverImage = imageOnHover === 'On';
  const cutEnabled = (cut ?? 0) > 0;

  useEffect(() => {
    setVisibleRowCount(undefined);
  }, [cut, showCut, content, entriesCount]);

  const resolvedFontSize = textFontSize ?? 0.01;
  const minLineHeight = resolvedFontSize * 1.2;
  const resolvedLineHeight = Math.max(textLineHeight ?? resolvedFontSize, minLineHeight);

  const resolvedTextTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: textFontFamily,
      fontWeight: textFontSettings?.fontWeight ?? 400,
      fontStyle: textFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: resolvedFontSize,
    lineHeight: resolvedLineHeight,
    letterSpacing: textLetterSpacing ?? 0,
    wordSpacing: textWordSpacing ?? 0,
    textAppearance: textTextAppearance,
    color: textColor,
  };
  const textTypographyCss = omitTextColors(textStylesToCss(resolvedTextTextStyle, isEditor));
  const textFieldCss = {
    ...textTypographyCss,
  } as React.CSSProperties;

  const colorVars = buildColorVars(P, {
    textColor,
    backgroundColor,
    dividerColor,
    textHoverColor,
    backgroundHoverColor,
    dividerHoverColor
  }, COLOR_VAR_MAP, STATE_KEYS);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const entryHoverClass =
    entryHoverEffect === 'Default'
      ? `${P}-entry-hover-default`
      : entryHoverEffect === 'Blinds'
        ? `${P}-entry-hover-blinds`
        : '';
  const wrapperStateClasses = `${entryHoverClass} ${stateClass}`.trim();

  const containerRef = useRef<HTMLDivElement>(null);
  const prevSettingsRef = useRef(settings);

  useEffect(() => {
    if (!onUpdateSettings || !isEditor) {
      prevSettingsRef.current = settings;
      return;
    }

    const prevSettings = prevSettingsRef.current;
    const updatedSettings = applyListSettingsChange(
      settings as Record<string, unknown>,
      prevSettings as Record<string, unknown>,
    ) as ListSettings;

    prevSettingsRef.current = settings;

    if (updatedSettings === settings) {
      return;
    }

    onUpdateSettings(updatedSettings);
  }, [settings, onUpdateSettings, isEditor]);

  const columnWidthByKey: Record<ColumnWidthKey, number> = {
    AColumnWidth: AColumnWidth ?? DEFAULT_COLUMN_WIDTHS.AColumnWidth,
    BColumn: BColumn ?? DEFAULT_COLUMN_WIDTHS.BColumn,
    CColumn: CColumn ?? DEFAULT_COLUMN_WIDTHS.CColumn,
    DColumn: DColumn ?? DEFAULT_COLUMN_WIDTHS.DColumn,
    EColumn: EColumn ?? DEFAULT_COLUMN_WIDTHS.EColumn,
  };

  const resolvedColumnsOrder = useMemo(() => {
    if (Array.isArray(columnsOrder) && columnsOrder.length > 0) {
      return columnsOrder as typeof COLUMN_CONTENT_KEYS[number][];
    }
    return [...COLUMN_CONTENT_KEYS];
  }, [columnsOrder]);

  const listColumns: ListItemColumn[] = useMemo(
    () =>
      resolvedColumnsOrder.slice(0, columns).map((key, index) => ({
        key,
        widthKey: COLUMN_WIDTH_KEYS[index],
        width: columnWidthByKey[COLUMN_WIDTH_KEYS[index]],
      })),
    [
      columns,
      resolvedColumnsOrder,
      AColumnWidth,
      BColumn,
      CColumn,
      DColumn,
      EColumn,
    ]
  );

  const resolvedWrapperPaddingLeft = wrapperPaddingLeft ?? 0;
  const resolvedWrapperPaddingRight = wrapperPaddingRight ?? 0;
  const resolvedContentWidth = getListEffectiveContentWidth(settings as Record<string, unknown>);
  const storedColumnWidths = useMemo(
    () => COLUMN_WIDTH_KEYS.slice(0, columns).map((key) => columnWidthByKey[key]),
    [
      columns,
      AColumnWidth,
      BColumn,
      CColumn,
      DColumn,
      EColumn,
    ],
  );
  const resolvedColumnWidths = useMemo(
    () => resolveListColumnWidths(columns, resolvedContentWidth, columnWidthByKey),
    [
      columns,
      resolvedContentWidth,
      AColumnWidth,
      BColumn,
      CColumn,
      DColumn,
      EColumn,
    ],
  );

  const allRows: ListItemRow[] = useMemo(() => {
    const resEntriesCount = entriesCount === 0 ? Infinity : entriesCount;
    const items = (content ?? []).slice(0, resEntriesCount);

    return items.map((item, index) => ({
      id: index,
      cells: Object.fromEntries(
        COLUMN_CONTENT_KEYS.map((key) => [key, item[key] ?? ''])
      ),
      image: item.image,
      link: item.link,
    }));
  }, [content, entriesCount]);

  const effectiveVisibleCount = cutEnabled
    ? (visibleRowCount ?? cut)
    : allRows.length;

  const visibleRows = useMemo(() => {
    if (cutEnabled) {
      return allRows.slice(0, effectiveVisibleCount);
    }
    return allRows;
  }, [allRows, cutEnabled, effectiveVisibleCount]);

  const showCutLabel = cutEnabled && effectiveVisibleCount < allRows.length;

  const handleShowMore = () => {
    const currentVisible = visibleRowCount ?? cut;
    if (!showCut) {
      setVisibleRowCount(allRows.length);
      return;
    }
    setVisibleRowCount(Math.min(currentVisible + showCut, allRows.length));
  };

  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const resolvedRowPaddingTop = rowPaddingTop ?? 0;
  const resolvedRowPaddingBottom = rowPaddingBottom ?? 0;
  const topHandleHeight = Math.max(resolvedRowPaddingTop, ROW_PADDING_HANDLE_HEIGHT);
  const bottomHandleHeight = Math.max(resolvedRowPaddingBottom, ROW_PADDING_HANDLE_HEIGHT);
  const leftHandleWidth = Math.max(resolvedWrapperPaddingLeft, WRAPPER_PADDING_HANDLE_WIDTH);
  const rightHandleWidth = Math.max(resolvedWrapperPaddingRight, WRAPPER_PADDING_HANDLE_WIDTH);
  const columnsRowStyle: React.CSSProperties = {
    paddingLeft: scaled(resolvedWrapperPaddingLeft),
    paddingRight: scaled(resolvedWrapperPaddingRight),
  };

  const handleRowMouseEnter = (row: ListItemRow) => {
    if (!showHoverImage) return;

    const image = row.image;
    if (!image?.url) {
      setHoverImage(null);
      return;
    }

    if (hoverImage?.rowId === row.id) {
      return;
    }

    const minWidth = imageSize?.min ?? 80;
    const maxWidth = imageSize?.max ?? 320;
    setHoverImage({
      rowId: row.id,
      url: image.url,
      objectFit: image.objectFit ?? 'cover',
      widthPx: randomBetween(minWidth, maxWidth),
    });
  };

  const handleWrapperMouseLeave = () => {
    setHoverImage(null);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div style={colorVars}>
        <div
          ref={containerRef}
          className={`${P}-wrapper ${wrapperStateClasses}`.trim()}
          style={{
            width: scalingValue(wrapperWidth ?? 0, isEditor),
          }}
          onMouseLeave={showHoverImage ? handleWrapperMouseLeave : undefined}
        >
          {isEditor && (
            <div
              data-controls="wrapperPaddingLeft"
              data-controls-axis="x"
              data-controls-min="0"
              data-controls-no-highlight=""
              className={`${P}-wrapper-padding-handle`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: scaled(leftHandleWidth),
                height: '100%',
                pointerEvents: 'auto',
                zIndex: 4,
              }}
            />
          )}
          {isEditor && (
            <div
              data-controls="wrapperPaddingRight"
              data-controls-axis="x"
              data-controls-reverse=""
              data-controls-min="0"
              data-controls-no-highlight=""
              className={`${P}-wrapper-padding-handle`}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: scaled(rightHandleWidth),
                height: '100%',
                pointerEvents: 'auto',
                zIndex: 4,
              }}
            />
          )}
          <div style={{ width: '100%' }}>
            {visibleRows.map((row, rowIdx) => {
              const hasLink = (row.link?.length ?? 0) > 0;
              const RowElement = hasLink ? 'a' : 'div';
              const rowStyle = {
                minHeight: scaled(cellMinHeight ?? 0),
                paddingTop: scaled(resolvedRowPaddingTop),
                paddingBottom: scaled(resolvedRowPaddingBottom),
                borderBottomWidth: scalingValue(dividerWidth ?? 0, isEditor),
                ...(rowIdx === 0 ? { borderTopWidth: scalingValue(dividerWidth ?? 0, isEditor) } : {}),
              };

              return (
              <RowElement
                key={row.id}
                className={`${P}-list-item`}
                {...(hasLink ? { href: row.link, target: '_blank' } : {})}
                style={rowStyle}
                onMouseEnter={showHoverImage ? () => handleRowMouseEnter(row) : undefined}
              >
                {isEditor && (
                  <div
                    data-controls="rowPaddingTop"
                    data-controls-axis="y"
                    data-controls-min="0"
                    data-controls-no-highlight=""
                    className={`${P}-row-padding-handle`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: scaled(topHandleHeight),
                      pointerEvents: 'auto',
                      zIndex: 3,
                    }}
                  />
                )}
                <div className={`${P}-list-cols-row`} style={columnsRowStyle}>
                  {listColumns.map((col, colIndex) => {
                    const isLastColumn = colIndex === listColumns.length - 1;
                    const columnWidth = resolvedColumnWidths[colIndex];
                    const maxColumnWidth = getColumnMaxWidth(
                      colIndex,
                      resolvedColumnWidths,
                      storedColumnWidths,
                      resolvedContentWidth,
                    );
                    return (
                      <div
                        key={col.key}
                        className={`${P}-list-col${isLastColumn ? ` ${P}-list-col-last` : ''}`}
                        style={isLastColumn ? undefined : { width: scaled(columnWidth) }}
                        data-test={col.width}
                      >
                        <span
                          className={`${P}-list-col-title`}
                          style={textFieldCss}
                        >
                          {row.cells[col.key] ?? null}
                        </span>
                        {isEditor && !isLastColumn && (
                          <div
                            data-controls={col.widthKey}
                            data-controls-axis="x"
                            data-controls-min={String(MIN_COLUMN_WIDTH_PX)}
                            data-controls-max-fraction={String(maxColumnWidth)}
                            data-controls-no-highlight=""
                            className={`${P}-col-resize-handle`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: `calc(100% - ${scaled(COL_RESIZE_HANDLE_WIDTH / 2)})`,
                              width: scaled(COL_RESIZE_HANDLE_WIDTH),
                              height: '100%',
                              pointerEvents: 'auto',
                              zIndex: 2,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                {isEditor && (
                  <div
                    data-controls="rowPaddingBottom"
                    data-controls-axis="y"
                    data-controls-min="0"
                    data-controls-no-highlight=""
                    className={`${P}-row-padding-handle`}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: scaled(bottomHandleHeight),
                      pointerEvents: 'auto',
                      zIndex: 3,
                    }}
                  />
                )}
              </RowElement>
            );
            })}
            {showCutLabel && (
              <div
                className={`${P}-cut-item`}
                style={{
                  minHeight: scaled(cutCellMinHeight ?? 0),
                  borderBottomWidth: scalingValue(dividerWidth ?? 0, isEditor),
                }}
              >
                <div
                  className={`${P}-list-cols-row`}
                  style={{ ...columnsRowStyle, justifyContent: 'center' }}
                >
                  <button
                    type="button"
                    className={`${P}-cut-label`}
                    style={textFieldCss}
                    onClick={handleShowMore}
                  >
                    {cutLabel}
                  </button>
                </div>
              </div>
            )}
          </div>
          {showHoverImage && hoverImage && (
            <img
              className={`${P}-hover-image`}
              src={hoverImage.url}
              alt=""
              style={{
                width: sv(hoverImage.widthPx),
                objectFit: hoverImage.objectFit,
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

type ListSettings = {
  columns: number;
  wrapperWidth: number;
  entriesCount: number;
  cellMinHeight: number;
  imageOnHover: 'On' | 'Off';
  imageSize?: { min: number; max: number };
  dividerWidth: number;
  cut: number;
  showCut: number;
  cutCellMinHeight: number;
  cutLabel: string;
  entryHoverEffect: 'None' | 'Default' | 'Blinds';
  rowPaddingTop: number;
  rowPaddingBottom: number;
  wrapperPaddingLeft: number;
  wrapperPaddingRight: number;
  AColumnWidth: number;
  BColumn: number;
  CColumn: number;
  DColumn: number;
  EColumn: number;
  columnsOrder?: string[];
  textColor: string;
  textFontFamily: string;
  textFontSettings?: { fontWeight: number; fontStyle: string };
  textFontSize?: number;
  textLineHeight?: number;
  textLetterSpacing?: number;
  textWordSpacing?: number;
  textTextAppearance?: TextStyles['textAppearance'];
  backgroundColor: string;
  dividerColor: string;
  textHoverColor: string;
  backgroundHoverColor: string;
  dividerHoverColor: string;
};

type ColorKeys =
  | 'textColor'
  | 'backgroundColor'
  | 'dividerColor'
  | 'textHoverColor'
  | 'backgroundHoverColor'
  | 'dividerHoverColor'

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  textColor: 'text-color',
  backgroundColor: 'background-color',
  dividerColor: 'divider-color',
  textHoverColor: 'text-hover-color',
  backgroundHoverColor: 'background-hover-color',
  dividerHoverColor: 'divider-hover-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;
