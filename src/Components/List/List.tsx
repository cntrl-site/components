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
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  align-items: start;
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
.${P}-padding-control-handle {
  background: transparent;
}

.${P}-row-padding-handle {
  position: relative;
  z-index: 2;
  width: 100%;
  flex-shrink: 0;
  background: var(--${P}-background-color);
}

.${P}-row-padding-handle::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 20px;
  pointer-events: auto;
  z-index: 10;
}

.${P}-col-resize-handle::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: #FF5C02;
  pointer-events: none;
}

.${P}-padding-control-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 12px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  pointer-events: none;
  box-sizing: border-box;
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

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:hover .${P}-row-padding-handle,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item .${P}-row-padding-handle,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover .${P}-row-padding-handle,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:has(+ .${P}-list-item:hover) .${P}-row-padding-handle,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:has(+ .${P}-cut-item:hover) .${P}-row-padding-handle,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item .${P}-row-padding-handle {
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

type ColumnPaddingLeftKey = typeof COLUMN_PADDING_LEFT_KEYS[number];
type ColumnPaddingRightKey = typeof COLUMN_PADDING_RIGHT_KEYS[number];

type ListItemColumn = {
  key: string;
  widthKey: ColumnWidthKey;
  width: number;
  paddingLeftKey: ColumnPaddingLeftKey;
  paddingRightKey: ColumnPaddingRightKey;
  paddingLeft: number;
  paddingRight: number;
};

const COLUMN_CONTENT_KEYS = [
  'AColumn',
  'BColumnWidth',
  'CColumnWidth',
  'DColumnWidth',
  'EColumnWidth',
] as const;

const COLUMN_WIDTH_KEYS = [
  'AColumnWidth',
  'BColumnWidth',
  'CColumnWidth',
  'DColumnWidth',
  'EColumnWidth',
] as const;

const COLUMN_PADDING_LEFT_KEYS = [
  'AColumnPaddingLeft',
  'BColumnPaddingLeft',
  'CColumnPaddingLeft',
  'DColumnPaddingLeft',
  'EColumnPaddingLeft',
] as const;

const COLUMN_PADDING_RIGHT_KEYS = [
  'AColumnPaddingRight',
  'BColumnPaddingRight',
  'CColumnPaddingRight',
  'DColumnPaddingRight',
  'EColumnPaddingRight',
] as const;

type ColumnWidthKey = typeof COLUMN_WIDTH_KEYS[number];

const COL_RESIZE_HANDLE_WIDTH = 0.004;
const COL_PADDING_HANDLE_WIDTH = 0.004;
const MIN_COLUMN_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_COLUMN_WIDTH = MIN_COLUMN_WIDTH_PX / ARTICLE_DESIGN_WIDTH;

const DEFAULT_COLUMN_WIDTHS: Record<ColumnWidthKey, number> = {
  AColumnWidth: 0.02,
  BColumnWidth: 0.02,
  CColumnWidth: 0.02,
  DColumnWidth: 0.02,
  EColumnWidth: 0.02,
};

export function getListEffectiveContentWidth(
  settings: Record<string, unknown>,
): number {
  const wrapperWidth = typeof settings.wrapperWidth === 'number' ? settings.wrapperWidth : 1;

  return Math.max(0, wrapperWidth);
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

function getStoreDColumnWidthWidths(
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

export function resolveListColumnPadding(
  columnWidth: number,
  paddingLeft: number,
  paddingRight: number,
): { paddingLeft: number; paddingRight: number } {
  const maxTotalPadding = columnWidth - MIN_COLUMN_WIDTH;
  const totalPadding = paddingLeft + paddingRight;

  if (totalPadding <= 0 || totalPadding <= maxTotalPadding) {
    return { paddingLeft, paddingRight };
  }

  if (maxTotalPadding <= 0) {
    return { paddingLeft: 0, paddingRight: 0 };
  }

  const scale = maxTotalPadding / totalPadding;

  return {
    paddingLeft: paddingLeft * scale,
    paddingRight: paddingRight * scale,
  };
}

export function getEffectiveListColumnWidths(
  columns: number,
  wrapperWidth: number,
  storedWidths: Record<ColumnWidthKey, number>,
): number[] {
  const resolvedWidths = resolveListColumnWidths(columns, wrapperWidth, storedWidths);

  if (columns <= 0) {
    return [];
  }

  const sumFixed = resolvedWidths.slice(0, columns - 1).reduce((sum, width) => sum + width, 0);

  return [
    ...resolvedWidths.slice(0, columns - 1),
    Math.max(0, wrapperWidth - sumFixed),
  ];
}

function getListColumnPaddingUpdates(
  columns: number,
  effectiveWidths: number[],
  settings: Record<string, unknown>,
): Partial<Record<ColumnPaddingLeftKey | ColumnPaddingRightKey, number>> {
  const updates: Partial<Record<ColumnPaddingLeftKey | ColumnPaddingRightKey, number>> = {};

  for (let index = 0; index < columns; index += 1) {
    const paddingLeftKey = COLUMN_PADDING_LEFT_KEYS[index];
    const paddingRightKey = COLUMN_PADDING_RIGHT_KEYS[index];
    const storedPaddingLeft = typeof settings[paddingLeftKey] === 'number'
      ? settings[paddingLeftKey] as number
      : 0;
    const storedPaddingRight = typeof settings[paddingRightKey] === 'number'
      ? settings[paddingRightKey] as number
      : 0;
    const resolvedPadding = resolveListColumnPadding(
      effectiveWidths[index] ?? 0,
      storedPaddingLeft,
      storedPaddingRight,
    );

    if (resolvedPadding.paddingLeft !== storedPaddingLeft) {
      updates[paddingLeftKey] = resolvedPadding.paddingLeft;
    }

    if (resolvedPadding.paddingRight !== storedPaddingRight) {
      updates[paddingRightKey] = resolvedPadding.paddingRight;
    }
  }

  return updates;
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

function getColumnsOrder(settings: Record<string, unknown>): string[] {
  if (Array.isArray(settings.columnsOrder) && settings.columnsOrder.length > 0) {
    return settings.columnsOrder as string[];
  }

  return [...COLUMN_CONTENT_KEYS];
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function getColumnLayoutUpdatesForOrderChange(
  nextOrder: string[],
  prevOrder: string[],
  prevSettings: Record<string, unknown>,
  columns: number,
): Record<string, number> {
  const count = Math.min(columns, nextOrder.length, COLUMN_WIDTH_KEYS.length);
  const updates: Record<string, number> = {};

  for (let index = 0; index < count; index += 1) {
    const contentKey = nextOrder[index];
    const prevSlotIndex = prevOrder.indexOf(contentKey);

    if (prevSlotIndex === -1) {
      continue;
    }

    const prevWidthKey = COLUMN_WIDTH_KEYS[prevSlotIndex];
    const prevPaddingLeftKey = COLUMN_PADDING_LEFT_KEYS[prevSlotIndex];
    const prevPaddingRightKey = COLUMN_PADDING_RIGHT_KEYS[prevSlotIndex];
    const widthKey = COLUMN_WIDTH_KEYS[index];
    const paddingLeftKey = COLUMN_PADDING_LEFT_KEYS[index];
    const paddingRightKey = COLUMN_PADDING_RIGHT_KEYS[index];

    const prevWidth = prevSettings[prevWidthKey];
    const prevPaddingLeft = prevSettings[prevPaddingLeftKey];
    const prevPaddingRight = prevSettings[prevPaddingRightKey];

    if (typeof prevWidth === 'number') {
      updates[widthKey] = prevWidth;
    }

    if (typeof prevPaddingLeft === 'number') {
      updates[paddingLeftKey] = prevPaddingLeft;
    }

    if (typeof prevPaddingRight === 'number') {
      updates[paddingRightKey] = prevPaddingRight;
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
  const columns =
    typeof nextColumns === 'number'
      ? nextColumns
      : typeof prevColumns === 'number'
        ? prevColumns
        : COLUMN_CONTENT_KEYS.length;

  const withColumnPaddingUpdates = (
    settings: Record<string, unknown>,
  ): Record<string, unknown> => {
    const storedWidths = getStoreDColumnWidthWidths({ ...prevSettings, ...settings });
    const contentWidth = getListEffectiveContentWidth(settings);
    const effectiveWidths = getEffectiveListColumnWidths(columns, contentWidth, storedWidths);
    const paddingUpdates = getListColumnPaddingUpdates(columns, effectiveWidths, {
      ...prevSettings,
      ...settings,
    });

    if (Object.keys(paddingUpdates).length === 0) {
      return settings;
    }

    return {
      ...settings,
      ...paddingUpdates,
    };
  };

  if (typeof nextColumns === 'number' && nextColumns !== prevColumns) {
    return withColumnPaddingUpdates({
      ...nextSettings,
      ...getEqualListColumnWidthUpdates(nextColumns, nextContentWidth),
    });
  }

  const nextOrder = getColumnsOrder(nextSettings);
  const prevOrder = getColumnsOrder(prevSettings);

  if (!areStringArraysEqual(nextOrder, prevOrder)) {
    return withColumnPaddingUpdates({
      ...nextSettings,
      ...getColumnLayoutUpdatesForOrderChange(nextOrder, prevOrder, prevSettings, columns),
    });
  }

  if (nextContentWidth < prevContentWidth) {
    if (typeof columns === 'number') {
      const storedWidths = getStoreDColumnWidthWidths({ ...prevSettings, ...nextSettings });

      return withColumnPaddingUpdates({
        ...nextSettings,
        ...getListColumnWidthUpdatesForWrapperWidth(columns, nextContentWidth, storedWidths),
      });
    }
  }

  const storedWidths = getStoreDColumnWidthWidths({ ...prevSettings, ...nextSettings });
  const prevEffectiveWidths = getEffectiveListColumnWidths(
    columns,
    prevContentWidth,
    getStoreDColumnWidthWidths(prevSettings),
  );
  const nextEffectiveWidths = getEffectiveListColumnWidths(
    columns,
    nextContentWidth,
    storedWidths,
  );
  const columnWidthDecreased = nextEffectiveWidths.some(
    (width, index) => width < (prevEffectiveWidths[index] ?? width),
  );
  const columnWidthSettingChanged = COLUMN_WIDTH_KEYS.some((key) => {
    const nextWidth = nextSettings[key];
    const prevWidth = prevSettings[key];

    return typeof nextWidth === 'number'
      && typeof prevWidth === 'number'
      && nextWidth !== prevWidth;
  });

  if (columnWidthDecreased || columnWidthSettingChanged) {
    return withColumnPaddingUpdates(nextSettings);
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
  BColumnWidth?: string;
  CColumnWidth?: string;
  DColumnWidth?: string;
  EColumnWidth?: string;
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
  const showControls = Boolean(isEditor && isPreviewMode);
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
    AColumnWidth,
    AColumnPaddingLeft,
    AColumnPaddingRight,
    BColumnWidth,
    BColumnPaddingLeft,
    BColumnPaddingRight,
    CColumnWidth,
    CColumnPaddingLeft,
    CColumnPaddingRight,
    DColumnWidth,
    DColumnPaddingLeft,
    DColumnPaddingRight,
    EColumnWidth,
    EColumnPaddingLeft,
    EColumnPaddingRight,
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
    BColumnWidth: BColumnWidth ?? DEFAULT_COLUMN_WIDTHS.BColumnWidth,
    CColumnWidth: CColumnWidth ?? DEFAULT_COLUMN_WIDTHS.CColumnWidth,
    DColumnWidth: DColumnWidth ?? DEFAULT_COLUMN_WIDTHS.DColumnWidth,
    EColumnWidth: EColumnWidth ?? DEFAULT_COLUMN_WIDTHS.EColumnWidth,
  };

  const columnPaddingLeftByKey: Record<ColumnPaddingLeftKey, number> = {
    AColumnPaddingLeft: AColumnPaddingLeft ?? 0,
    BColumnPaddingLeft: BColumnPaddingLeft ?? 0,
    CColumnPaddingLeft: CColumnPaddingLeft ?? 0,
    DColumnPaddingLeft: DColumnPaddingLeft ?? 0,
    EColumnPaddingLeft: EColumnPaddingLeft ?? 0,
  };

  const columnPaddingRightByKey: Record<ColumnPaddingRightKey, number> = {
    AColumnPaddingRight: AColumnPaddingRight ?? 0,
    BColumnPaddingRight: BColumnPaddingRight ?? 0,
    CColumnPaddingRight: CColumnPaddingRight ?? 0,
    DColumnPaddingRight: DColumnPaddingRight ?? 0,
    EColumnPaddingRight: EColumnPaddingRight ?? 0,
  };

  const resolveDColumnWidthsOrder = useMemo(() => {
    if (Array.isArray(columnsOrder) && columnsOrder.length > 0) {
      return columnsOrder as typeof COLUMN_CONTENT_KEYS[number][];
    }
    return [...COLUMN_CONTENT_KEYS];
  }, [columnsOrder]);

  const listColumns: ListItemColumn[] = useMemo(
    () =>
      resolveDColumnWidthsOrder.slice(0, columns).map((key, index) => {
        const paddingLeftKey = COLUMN_PADDING_LEFT_KEYS[index];
        const paddingRightKey = COLUMN_PADDING_RIGHT_KEYS[index];
        return {
          key,
          widthKey: COLUMN_WIDTH_KEYS[index],
          width: columnWidthByKey[COLUMN_WIDTH_KEYS[index]],
          paddingLeftKey,
          paddingRightKey,
          paddingLeft: columnPaddingLeftByKey[paddingLeftKey],
          paddingRight: columnPaddingRightByKey[paddingRightKey],
        };
      }),
    [
      columns,
      resolveDColumnWidthsOrder,
      AColumnWidth,
      BColumnWidth,
      CColumnWidth,
      DColumnWidth,
      EColumnWidth,
      AColumnPaddingLeft,
      AColumnPaddingRight,
      BColumnPaddingLeft,
      BColumnPaddingRight,
      CColumnPaddingLeft,
      CColumnPaddingRight,
      DColumnPaddingLeft,
      DColumnPaddingRight,
      EColumnPaddingLeft,
      EColumnPaddingRight,
    ]
  );

  const resolvedContentWidth = getListEffectiveContentWidth(settings as Record<string, unknown>);
  const storeDColumnWidthWidths = useMemo(
    () => COLUMN_WIDTH_KEYS.slice(0, columns).map((key) => columnWidthByKey[key]),
    [
      columns,
      AColumnWidth,
      BColumnWidth,
      CColumnWidth,
      DColumnWidth,
      EColumnWidth,
    ],
  );
  const resolveDColumnWidthWidths = useMemo(
    () => resolveListColumnWidths(columns, resolvedContentWidth, columnWidthByKey),
    [
      columns,
      resolvedContentWidth,
      AColumnWidth,
      BColumnWidth,
      CColumnWidth,
      DColumnWidth,
      EColumnWidth,
    ],
  );

  const effectiveColumnWidths = useMemo(
    () => getEffectiveListColumnWidths(columns, resolvedContentWidth, columnWidthByKey),
    [
      columns,
      resolvedContentWidth,
      AColumnWidth,
      BColumnWidth,
      CColumnWidth,
      DColumnWidth,
      EColumnWidth,
    ],
  );

  const effectiveColumnPaddings = useMemo(
    () =>
      listColumns.map((col, index) =>
        resolveListColumnPadding(
          effectiveColumnWidths[index] ?? 0,
          col.paddingLeft,
          col.paddingRight,
        )),
    [listColumns, effectiveColumnWidths],
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
  const firstColumn = listColumns[0];
  const lastColumn = listColumns[listColumns.length - 1];
  const firstColumnEffectivePadding = effectiveColumnPaddings[0];
  const lastColumnEffectivePadding = effectiveColumnPaddings[effectiveColumnPaddings.length - 1];
  const firstColumnPaddingLeftWidth = firstColumn && firstColumnEffectivePadding
    ? Math.max(firstColumnEffectivePadding.paddingLeft, COL_PADDING_HANDLE_WIDTH)
    : 0;
  const lastColumnPaddingRightWidth = lastColumn && lastColumnEffectivePadding
    ? Math.max(lastColumnEffectivePadding.paddingRight, COL_PADDING_HANDLE_WIDTH)
    : 0;
  const columnsRightEdge = resolvedContentWidth;

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
          <div style={{ width: '100%' }}>
            {visibleRows.map((row, rowIdx) => {
              const hasLink = (row.link?.length ?? 0) > 0;
              const RowElement = hasLink ? 'a' : 'div';
              const rowStyle = {
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
                {(resolvedRowPaddingTop > 0 || showControls) && (
                  <div
                    {...(showControls ? {
                      'data-controls': 'rowPaddingTop',
                      'data-controls-axis': 'y',
                      'data-controls-min': '0',
                    } : {})}
                    className={`${P}-row-padding-handle`}
                    style={{ height: scaled(resolvedRowPaddingTop) }}
                  />
                )}
                <div className={`${P}-list-cols-row`} style={{ minHeight: scaled(cellMinHeight ?? 0) }}>
                  {listColumns.map((col, colIndex) => {
                    const isLastColumn = colIndex === listColumns.length - 1;
                    const columnWidth = effectiveColumnWidths[colIndex];
                    const effectivePadding = effectiveColumnPaddings[colIndex];
                    return (
                      <div
                        key={col.key}
                        className={`${P}-list-col${isLastColumn ? ` ${P}-list-col-last` : ''}`}
                        style={{
                          paddingLeft: scaled(effectivePadding.paddingLeft),
                          paddingRight: scaled(effectivePadding.paddingRight),
                          ...(isLastColumn ? {} : { width: scaled(columnWidth) }),
                        }}
                        data-test={col.width}
                      >
                        <span
                          className={`${P}-list-col-title`}
                          style={textFieldCss}
                        >
                          {row.cells[col.key] ?? null}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {(resolvedRowPaddingBottom > 0 || showControls) && (
                  <div
                    {...(showControls ? {
                      'data-controls': 'rowPaddingBottom',
                      'data-controls-axis': 'y',
                      'data-controls-min': '0',
                    } : {})}
                    className={`${P}-row-padding-handle`}
                    style={{ height: scaled(resolvedRowPaddingBottom) }}
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
                  style={{ justifyContent: 'center' }}
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
          {showControls && firstColumn && lastColumn && (
            <div key="column-edge-padding-handles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div
                data-controls={firstColumn.paddingLeftKey}
                data-controls-axis="x"
                data-controls-min="0"
                data-controls-max-fraction={String(
                  effectiveColumnWidths[0] - (firstColumnEffectivePadding?.paddingRight ?? 0),
                )}
                data-controls-static-handle=""
                className={`${P}-padding-control-handle`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: scaled(firstColumnPaddingLeftWidth),
                  height: '100%',
                  pointerEvents: 'auto',
                  zIndex: 2,
                }}
              />
              <div
                data-controls={lastColumn.paddingRightKey}
                data-controls-axis="x"
                data-controls-reverse=""
                data-controls-min="0"
                data-controls-max-fraction={String(
                  effectiveColumnWidths[listColumns.length - 1]
                    - (lastColumnEffectivePadding?.paddingLeft ?? 0),
                )}
                data-controls-static-handle=""
                className={`${P}-padding-control-handle`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: scaled(columnsRightEdge - lastColumnPaddingRightWidth),
                  width: scaled(lastColumnPaddingRightWidth),
                  height: '100%',
                  pointerEvents: 'auto',
                  zIndex: 2,
                }}
              />
            </div>
          )}
          {showControls && listColumns.slice(0, -1).map((col, colIndex) => {
            const nextCol = listColumns[colIndex + 1];
            const maxColumnWidth = getColumnMaxWidth(
              colIndex,
              resolveDColumnWidthWidths,
              storeDColumnWidthWidths,
              resolvedContentWidth,
            );
            const boundaryLeft = resolveDColumnWidthWidths.slice(0, colIndex + 1).reduce((sum, width) => sum + width, 0);
            const colEffectivePadding = effectiveColumnPaddings[colIndex];
            const nextColEffectivePadding = effectiveColumnPaddings[colIndex + 1];
            const paddingRightWidth = Math.max(
              colEffectivePadding.paddingRight,
              COL_PADDING_HANDLE_WIDTH,
            );
            const paddingLeftWidth = Math.max(
              nextColEffectivePadding.paddingLeft,
              COL_PADDING_HANDLE_WIDTH,
            );
            const columnWidthHandleLeft = boundaryLeft - COL_RESIZE_HANDLE_WIDTH / 2;

            return (
              <div key={`${col.widthKey}-junction`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div
                  data-controls={col.paddingRightKey}
                  data-controls-axis="x"
                  data-controls-reverse=""
                  data-controls-min="0"
                  data-controls-max-fraction={String(
                    effectiveColumnWidths[colIndex] - colEffectivePadding.paddingLeft,
                  )}
                  data-controls-static-handle=""
                  className={`${P}-padding-control-handle`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: scaled(boundaryLeft - paddingRightWidth),
                    width: scaled(paddingRightWidth),
                    height: '100%',
                    pointerEvents: 'auto',
                    zIndex: 2,
                  }}
                />
                <div
                  data-controls={col.widthKey}
                  data-controls-axis="x"
                  data-controls-min={String(MIN_COLUMN_WIDTH_PX)}
                  data-controls-max-fraction={String(maxColumnWidth)}
                  data-controls-variant="column-width"
                  className={`${P}-col-resize-handle`}
                  style={{
                    position: 'absolute',
                    top: '0px',
                    left: scaled(columnWidthHandleLeft),
                    width: scaled(COL_RESIZE_HANDLE_WIDTH),
                    height: 'calc(100%)',
                    pointerEvents: 'auto',
                    zIndex: 4,
                  }}
                />
                <div
                  data-controls={nextCol.paddingLeftKey}
                  data-controls-axis="x"
                  data-controls-min="0"
                  data-controls-max-fraction={String(
                    effectiveColumnWidths[colIndex + 1] - nextColEffectivePadding.paddingRight,
                  )}
                  data-controls-static-handle=""
                  className={`${P}-padding-control-handle`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: scaled(boundaryLeft),
                    width: scaled(paddingLeftWidth),
                    height: '100%',
                    pointerEvents: 'auto',
                    zIndex: 2,
                  }}
                />
              </div>
            );
          })}
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
  AColumnWidth: number;
  AColumnPaddingLeft: number;
  AColumnPaddingRight: number;
  BColumnWidth: number;
  BColumnPaddingLeft: number;
  BColumnPaddingRight: number;
  CColumnWidth: number;
  CColumnPaddingLeft: number;
  CColumnPaddingRight: number;
  DColumnWidth: number;
  DColumnPaddingLeft: number;
  DColumnPaddingRight: number;
  EColumnWidth: number;
  EColumnPaddingLeft: number;
  EColumnPaddingRight: number;
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
