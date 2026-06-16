import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ComponentPropsWithoutRef } from 'react';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils/index';
import { omitTextColors, TextStyles, textStylesToCss } from '../utils/textStylesToCss';
import type { LayoutItem, LayoutTab } from '../../types/SchemaV1';

type ListFontSettings = { fontWeight: number; fontStyle: string };

type ListColumnPrefix = 'AColumn' | 'BColumn' | 'CColumn' | 'DColumn' | 'EColumn';

type ListColumnTextStyleOverrides = {
  AColumnVerticalAlign?: string;
  AColumnTextFontFamily?: string;
  AColumnTextFontSettings?: ListFontSettings;
  AColumnTextFontSize?: number;
  AColumnTextLineHeight?: number;
  AColumnTextLetterSpacing?: number;
  AColumnTextWordSpacing?: number;
  AColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  AColumnTextTextAppearance?: TextStyles['textAppearance'];
  BColumnVerticalAlign?: string;
  BColumnTextFontFamily?: string;
  BColumnTextFontSettings?: ListFontSettings;
  BColumnTextFontSize?: number;
  BColumnTextLineHeight?: number;
  BColumnTextLetterSpacing?: number;
  BColumnTextWordSpacing?: number;
  BColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  BColumnTextTextAppearance?: TextStyles['textAppearance'];
  CColumnVerticalAlign?: string;
  CColumnTextFontFamily?: string;
  CColumnTextFontSettings?: ListFontSettings;
  CColumnTextFontSize?: number;
  CColumnTextLineHeight?: number;
  CColumnTextLetterSpacing?: number;
  CColumnTextWordSpacing?: number;
  CColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  CColumnTextTextAppearance?: TextStyles['textAppearance'];
  DColumnVerticalAlign?: string;
  DColumnTextFontFamily?: string;
  DColumnTextFontSettings?: ListFontSettings;
  DColumnTextFontSize?: number;
  DColumnTextLineHeight?: number;
  DColumnTextLetterSpacing?: number;
  DColumnTextWordSpacing?: number;
  DColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  DColumnTextTextAppearance?: TextStyles['textAppearance'];
  EColumnVerticalAlign?: string;
  EColumnTextFontFamily?: string;
  EColumnTextFontSettings?: ListFontSettings;
  EColumnTextFontSize?: number;
  EColumnTextLineHeight?: number;
  EColumnTextLetterSpacing?: number;
  EColumnTextWordSpacing?: number;
  EColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  EColumnTextTextAppearance?: TextStyles['textAppearance'];
  cutLabelTextFontFamily?: string;
  cutLabelTextFontSettings?: ListFontSettings;
  cutLabelTextFontSize?: number;
  cutLabelTextLineHeight?: number;
  cutLabelTextLetterSpacing?: number;
  cutLabelTextWordSpacing?: number;
  cutLabelTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  cutLabelTextTextAppearance?: TextStyles['textAppearance'];
  cutLabelVerticalAlign?: string;
};

export type ListColumnVerticalAlignKey = `${ListColumnPrefix}VerticalAlign`;

type ListColumnVerticalAlignUpdates = {
  AColumnVerticalAlign?: string;
  BColumnVerticalAlign?: string;
  CColumnVerticalAlign?: string;
  DColumnVerticalAlign?: string;
  EColumnVerticalAlign?: string;
};

export type ListSettings = {
  columns: number;
  type: 'A' | 'B';
  wrapperWidth: number;
  entriesCount: number;
  cellMinHeight: number;
  imageOnHover: 'On' | 'Off';
  imageSize?: { min: number; max: number };
  dividerWidth: number;
  showVisibility: boolean[];
  cut: number;
  showCut: number;
  cutCellMinHeight: number;
  cutLabel: string;
  entryHoverEffect: 'None' | 'Default' | 'Blinds';
  rowPaddingTop: number;
  rowPaddingBottom: number;
  rowPaddingTopB: number;
  AColumnWidth: number;
  AColumnPaddingLeft: number;
  AColumnPaddingRight: number;
  AColumnPaddingBottom: number;
  BColumnWidth: number;
  BColumnPaddingLeft: number;
  BColumnPaddingRight: number;
  BColumnPaddingBottom: number;
  CColumnWidth: number;
  CColumnPaddingLeft: number;
  CColumnPaddingRight: number;
  CColumnPaddingBottom: number;
  DColumnWidth: number;
  DColumnPaddingLeft: number;
  DColumnPaddingRight: number;
  DColumnPaddingBottom: number;
  EColumnWidth: number;
  EColumnPaddingLeft: number;
  EColumnPaddingRight: number;
  EColumnPaddingBottom: number;
  columnsOrder?: string[];
  textPaddingLR?: number;
  textColor: string;
  backgroundColor: string;
  dividerColor: string;
  textHoverColor: string;
  backgroundHoverColor: string;
  dividerHoverColor: string;
} & ListColumnTextStyleOverrides;

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
  x: number;
  y: number;
};

type ListProps = {
  layoutId?: string;
  settings: ListSettings;
  content?: ListContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: ListSettings) => void;
} & CommonComponentProps;

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function hasListColumnText(value: React.ReactNode): boolean {
  return String(value ?? '').trim().length > 0;
}

function getEntryDividerWidths(
  rowIdx: number,
  rowCount: number,
  showDividerTop: boolean,
  showDividerBottom: boolean,
  hasCutItem: boolean,
  dividerWidth: number,
  isEditor: boolean,
): { borderTopWidth: string; borderBottomWidth: string } {
  const scaledDividerWidth = scalingValue(dividerWidth, isEditor);
  const none = scalingValue(0, isEditor);

  const isFirst = rowIdx === 0;
  const isLastEntry = rowIdx === rowCount - 1 && !hasCutItem;

  const borderTopWidth = isFirst && showDividerTop ? scaledDividerWidth : none;
  const borderBottomWidth = !isLastEntry || showDividerBottom ? scaledDividerWidth : none;

  return { borderTopWidth, borderBottomWidth };
}

function getCutItemDividerWidths(
  showDividerBottom: boolean,
  dividerWidth: number,
  isEditor: boolean,
): { borderTopWidth: string; borderBottomWidth: string } {
  const scaledDividerWidth = scalingValue(dividerWidth, isEditor);
  const none = scalingValue(0, isEditor);

  return {
    borderTopWidth: none,
    borderBottomWidth: showDividerBottom ? scaledDividerWidth : none,
  };
}

const HOVER_IMAGE_CURSOR_OFFSET = 10;

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
  left: 0;
  top: 0;
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
  user-select: none;
  background: var(--${P}-background-color);
}

.${P}-wrapper.${P}-divider-top .${P}-list-item {
  border-top-style: solid;
  border-top-color: var(--${P}-divider-color);
}

.${P}-wrapper.${P}-divider-bottom .${P}-list-item {
  border-bottom-style: solid;
  border-bottom-color: var(--${P}-divider-color);
}

.${P}-list-cols-row {
  display: flex;
  align-items: start;
  width: 100%;
  box-sizing: border-box;
}

.${P}-list-cols-row-h {
  align-items: stretch;
}

.${P}-list-cols-row-h [data-list-col] {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  align-self: stretch;
  min-height: min-content;
}

.${P}-list-cols-row-h .${P}-list-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  min-height: 0;
}

.${P}-list-cols-row-h .${P}-list-col-title {
  display: block;
  flex: 0 0 auto;
  align-self: stretch;
}

.${P}-text-tight-leading {
  display: block;
  flex-shrink: 0;
  padding-top: var(--${P}-title-leading-gap, 0);
  padding-bottom: var(--${P}-title-leading-gap, 0);
}

.${P}-wrapper.${P}-type-b .${P}-list-cols-row {
  flex-direction: column;
  align-items: stretch;
}

.${P}-wrapper.${P}-type-b .${P}-list-col {
  width: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  min-height: min-content;
}

.${P}-wrapper.${P}-type-b .${P}-list-col-title {
  display: block;
  flex: 0 0 auto;
  align-self: stretch;
  text-align: center;
}

.${P}-wrapper.${P}-type-b .${P}-cut-item .${P}-list-cols-row {
  flex-direction: row;
}

.${P}-wrapper.${P}-type-b .${P}-cut-label {
  box-sizing: border-box;
}

.${P}-wrapper.${P}-type-b .${P}-list-col-last {
  flex: 0 0 auto;
  min-width: 0;
}

a.${P}-list-item {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.${P}-list-col {
  flex-shrink: 0;
  overflow: visible;
  box-sizing: border-box;
  min-width: ${sv(50)};
  position: relative;
  display: flex;
  align-items: flex-start;
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
  box-sizing: border-box;
}

.${P}-baseline-probe {
  display: inline-block;
  width: 0;
  height: 0;
  overflow: hidden;
  vertical-align: baseline;
}

.${P}-col-resize-handle,
.${P}-padding-control-handle,
.${P}-text-padding-lr-handle {
  background: transparent;
}

.${P}-padding-control-handle[data-controls-axis="x"][data-controls-variant="column-padding"]::after,
.${P}-text-padding-lr-handle::after {
  content: '';
  position: absolute;
  top: var(--${P}-first-entry-handle-top, 50%);
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 12px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  pointer-events: none;
}

.${P}-text-padding-lr-handle::after {
  top: 50%;
}

.${P}-padding-control-handle[data-controls-axis="y"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 4px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  pointer-events: none;
}

.${P}-padding-control-handle[data-controls-variant="row-padding"][data-controls-axis="y"]::after,
.${P}-padding-control-handle[data-controls-variant="column-padding"][data-controls-axis="y"]::after {
  left: 20px;
  transform: translateY(-50%);
}

.${P}-wrapper.${P}-type-b .${P}-padding-control-handle[data-controls-variant="row-padding"][data-controls-axis="y"]::after,
.${P}-wrapper.${P}-type-b .${P}-padding-control-handle[data-controls-variant="column-padding"][data-controls-axis="y"]::after {
  left: 50%;
  transform: translate(-50%, -50%);
}

.${P}-row-padding-handle {
  width: 100%;
  flex-shrink: 0;
  background: transparent;
}

.${P}-list-col-wrap {
  position: relative;
}

.${P}-list-cols-row-controls {
  position: relative;
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

.${P}-wrapper.${P}-type-b .${P}-col-resize-handle::after {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 2px;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item-has-link,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item-has-link,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item {
  transition: background-color 250ms, border-color 250ms;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item-has-link .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item-has-link .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-label {
  transition: color 250ms;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item-has-link:hover,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item-has-link,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-item:hover,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-cut-item {
  background: var(--${P}-background-hover-color);
}

.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-default .${P}-list-item-has-link:hover,
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-default .${P}-list-item:has(+ .${P}-list-item-has-link:hover),
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-default .${P}-list-item:has(+ .${P}-cut-item:hover),
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-default.${P}-state-hover .${P}-list-item-has-link,
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-default .${P}-cut-item:hover,
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-default.${P}-state-hover .${P}-cut-item,
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-blinds .${P}-list-item-has-link:hover,
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-blinds .${P}-list-item:has(+ .${P}-list-item-has-link:hover),
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-blinds .${P}-list-item:has(+ .${P}-cut-item:hover),
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item-has-link,
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-blinds .${P}-cut-item:hover,
.${P}-wrapper.${P}-divider-bottom.${P}-entry-hover-blinds.${P}-state-hover .${P}-cut-item {
  border-bottom-color: var(--${P}-divider-hover-color);
}

.${P}-wrapper.${P}-divider-top:not(.${P}-divider-bottom).${P}-entry-hover-default .${P}-list-item-has-link:hover:first-child,
.${P}-wrapper.${P}-divider-top:not(.${P}-divider-bottom).${P}-entry-hover-default.${P}-state-hover .${P}-list-item-has-link:first-child,
.${P}-wrapper.${P}-divider-top:not(.${P}-divider-bottom).${P}-entry-hover-blinds .${P}-list-item-has-link:hover:first-child,
.${P}-wrapper.${P}-divider-top:not(.${P}-divider-bottom).${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item-has-link:first-child {
  border-top-color: var(--${P}-divider-hover-color);
}

.${P}-wrapper.${P}-divider-top.${P}-divider-bottom.${P}-entry-hover-default .${P}-list-item-has-link:hover:first-child,
.${P}-wrapper.${P}-divider-top.${P}-divider-bottom.${P}-entry-hover-default.${P}-state-hover .${P}-list-item-has-link:first-child,
.${P}-wrapper.${P}-divider-top.${P}-divider-bottom.${P}-entry-hover-blinds .${P}-list-item-has-link:hover:first-child,
.${P}-wrapper.${P}-divider-top.${P}-divider-bottom.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item-has-link:first-child {
  border-top-color: var(--${P}-divider-hover-color);
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item-has-link:hover .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item-has-link .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-default .${P}-cut-item:hover .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-cut-item .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item-has-link:hover .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item-has-link .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item:hover .${P}-cut-label,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-cut-item .${P}-cut-label {
  color: var(--${P}-text-hover-color);
}

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item-has-link::before,
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

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item-has-link:hover::before,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item-has-link::before,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-cut-item:hover::before,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-cut-item::before {
  transform: scaleY(1);
}

.${P}-cut-item {
  display: flex;
  align-items: stretch;
  width: 100%;
  overflow: visible;
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  user-select: none;
  background: var(--${P}-background-color);
  cursor: pointer;
  padding: 0;
  border: none;
  font: inherit;
  text-align: inherit;
  appearance: none;
  -webkit-appearance: none;
}

.${P}-cut-item .${P}-list-cols-row {
  flex: 1;
  min-height: 100%;
  width: 100%;
  display: flex;
}

.${P}-wrapper.${P}-divider-bottom .${P}-cut-item {
  border-bottom-style: solid;
  border-bottom-color: var(--${P}-divider-color);
}

.${P}-cut-label {
  display: block;
  position: relative;
  z-index: 1;
  margin: 0;
  color: var(--${P}-text-color);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
`;
}

export const COLUMN_CONTENT_KEYS = [
  'AColumn',
  'BColumnWidth',
  'CColumnWidth',
  'DColumnWidth',
  'EColumnWidth',
] as const;

export const COLUMN_TEXT_PREFIXES = [
  'AColumn',
  'BColumn',
  'CColumn',
  'DColumn',
  'EColumn',
] as const;

export const CUT_LABEL_TEXT_PREFIX = 'cutLabel' as const;

export const LIST_TEXT_STYLE_PREFIXES = [
  ...COLUMN_TEXT_PREFIXES,
  CUT_LABEL_TEXT_PREFIX,
] as const;

export type ListTextStylePrefix = typeof LIST_TEXT_STYLE_PREFIXES[number];

export const LIST_COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export function getListColumnVerticalAlignSettingKey(columnLetter: string): string {
  return `${columnLetter}ColumnVerticalAlign`;
}

export const COLUMN_VALIGN_BASIC_OPTIONS = ['Top', 'Center', 'Bottom'] as const;

export function isBaselineAnchorColumnVerticalAlign(value: string | undefined): boolean {
  const raw = String(value ?? 'Top').trim();
  if (raw.toLowerCase().startsWith('baseline')) {
    return false;
  }
  return raw === 'Top' || raw === 'Center' || raw === 'Bottom';
}

export function parseBaselineAnchorLetter(value: string | undefined): string | null {
  const raw = String(value ?? '').trim();
  if (!raw.toLowerCase().startsWith('baseline')) {
    return null;
  }
  const anchorLetter = raw.slice(-1).toUpperCase();
  return LIST_COLUMN_LETTERS.includes(anchorLetter as typeof LIST_COLUMN_LETTERS[number])
    ? anchorLetter
    : null;
}

export function isValidColumnBaselineVAlign(
  value: string | undefined,
  forColumnLetter: string,
  settings: ListSettings,
): boolean {
  const anchorLetter = parseBaselineAnchorLetter(value);
  if (!anchorLetter) {
    return true;
  }
  if (anchorLetter === forColumnLetter) {
    return false;
  }
  return isBaselineAnchorColumnVerticalAlign(settings[getListColumnVerticalAlignSettingKey(anchorLetter) as ListColumnVerticalAlignKey]);
}

export function getColumnVerticalAlignOptionsForLetter(
  columnLetter: string,
  settings: ListSettings,
): string[] {
  const baselineOptions = LIST_COLUMN_LETTERS
    .filter((letter) => letter !== columnLetter)
    .filter((letter) => isBaselineAnchorColumnVerticalAlign(settings[getListColumnVerticalAlignSettingKey(letter) as ListColumnVerticalAlignKey]))
    .map((letter) => `Baseline ${letter}`);

  return [...COLUMN_VALIGN_BASIC_OPTIONS, ...baselineOptions];
}

type ColumnVerticalAlign =
  | { kind: 'top' | 'center' | 'bottom' }
  | { kind: 'baseline'; anchorLetter: string };

function parseColumnVerticalAlign(value: string | undefined): ColumnVerticalAlign {
  const raw = String(value ?? 'Top').trim();
  if (raw.toLowerCase().startsWith('baseline')) {
    const anchorLetter = raw.slice(-1).toUpperCase();
    if (LIST_COLUMN_LETTERS.includes(anchorLetter as typeof LIST_COLUMN_LETTERS[number])) {
      return { kind: 'baseline', anchorLetter };
    }
    return { kind: 'top' };
  }
  if (raw === 'Center') return { kind: 'center' };
  if (raw === 'Bottom') return { kind: 'bottom' };
  return { kind: 'top' };
}

function resolveColumnVerticalAlign(
  value: string | undefined,
  settings: ListSettings,
  columnLetter: string,
): ColumnVerticalAlign {
  if (isActiveBaselineVAlign(value, settings, columnLetter)) {
    return parseColumnVerticalAlign(value);
  }

  const parsed = parseColumnVerticalAlign(value);
  if (parsed.kind === 'baseline') {
    return { kind: 'top' };
  }

  return parsed;
}

function resolveBasicColumnVerticalAlign(value: string | undefined): ColumnVerticalAlign {
  const parsed = parseColumnVerticalAlign(value);
  if (parsed.kind === 'baseline') {
    return { kind: 'top' };
  }
  return parsed;
}

function isActiveBaselineVAlign(
  value: string | undefined,
  settings: ListSettings,
  forColumnLetter: string,
): boolean {
  if (!isValidColumnBaselineVAlign(value, forColumnLetter, settings)) {
    return false;
  }
  return parseColumnVerticalAlign(value).kind === 'baseline';
}

function getListColumnVerticalAlignSanitizeUpdates(
  settings: ListSettings,
): ListColumnVerticalAlignUpdates | null {
  const updates: ListColumnVerticalAlignUpdates = {};
  let hasUpdates = false;

  for (const letter of LIST_COLUMN_LETTERS) {
    const key = getListColumnVerticalAlignSettingKey(letter) as ListColumnVerticalAlignKey;
    const value = settings[key];

    if (settings.type === 'B') {
      const raw = String(value ?? 'Top').trim();
      if (raw !== 'Top' && raw !== 'Center' && raw !== 'Bottom') {
        updates[key] = 'Top';
        hasUpdates = true;
      }
      continue;
    }

    if (!isValidColumnBaselineVAlign(value, letter, settings)) {
      updates[key] = 'Top';
      hasUpdates = true;
    }
  }

  return hasUpdates ? updates : null;
}

function vAlignToTitleStyle(
  kind: ColumnVerticalAlign['kind'],
): React.CSSProperties {
  if (kind === 'center') {
    return { flex: '0 0 auto', marginTop: 'auto', marginBottom: 'auto' };
  }
  if (kind === 'bottom') {
    return { flex: '0 0 auto', marginTop: 'auto' };
  }
  return {};
}

function resolveCutLabelVerticalAlignKind(
  value: string | undefined,
): ColumnVerticalAlign['kind'] {
  const kind = parseColumnVerticalAlign(value).kind;
  return kind === 'baseline' ? 'center' : kind;
}

function textAlignToJustifyContent(
  textAlign: 'left' | 'center' | 'right' | 'justify',
): React.CSSProperties['justifyContent'] {
  if (textAlign === 'right') {
    return 'flex-end';
  }
  if (textAlign === 'center') {
    return 'center';
  }
  if (textAlign === 'left') {
    return 'flex-start';
  }
  return 'flex-start';
}

function cutVerticalAlignKindToFlexAlign(
  kind: ColumnVerticalAlign['kind'],
): React.CSSProperties['alignItems'] {
  if (kind === 'center') {
    return 'center';
  }
  if (kind === 'bottom') {
    return 'flex-end';
  }
  return 'flex-start';
}

function getFirstLineBaselineOffsetInTitle(
  titleEl: HTMLElement,
  probeClassName: string,
): number {
  const probe = document.createElement('i');
  probe.className = probeClassName;
  probe.setAttribute('aria-hidden', 'true');
  titleEl.prepend(probe);

  const { top: titleTop } = titleEl.getBoundingClientRect();
  const { bottom: probeBottom } = probe.getBoundingClientRect();
  const baselineOffset = probeBottom - titleTop;
  probe.remove();

  return baselineOffset;
}

function measureColumnFirstLineBaselineOffset(
  info: {
    titleEl: HTMLElement | null;
    kind: string;
  },
  rowTop: number,
  listColClassName: string,
  probeClassName: string,
): number {
  const titleEl = info.titleEl;
  if (!titleEl) return 0;

  const listCol = titleEl.closest<HTMLElement>(`.${listColClassName}`);
  if (!listCol) return 0;

  const baselineInTitle = getFirstLineBaselineOffsetInTitle(titleEl, probeClassName);

  if (info.kind === 'baseline') {
    return titleEl.getBoundingClientRect().top - rowTop + baselineInTitle;
  }

  const listColRect = listCol.getBoundingClientRect();
  const titleHeight = titleEl.getBoundingClientRect().height;
  let valignOffset = 0;

  if (info.kind === 'center') {
    valignOffset = (listColRect.height - titleHeight) / 2;
  } else if (info.kind === 'bottom') {
    valignOffset = listColRect.height - titleHeight;
  }

  return (listColRect.top - rowTop) + valignOffset + baselineInTitle;
}

function syncRowListColHeights(
  rowEl: HTMLElement,
  cols: HTMLElement[],
  listColClassName: string,
): number {
  const rowHeight = rowEl.getBoundingClientRect().height;
  if (rowHeight <= 0) {
    return 0;
  }

  cols.forEach((colEl) => {
    const listCol = colEl.querySelector<HTMLElement>(`.${listColClassName}`);
    if (listCol) {
      listCol.style.minHeight = `${rowHeight}px`;
      listCol.style.height = `${rowHeight}px`;
    }
  });

  void rowEl.offsetHeight;
  return rowHeight;
}

function applyBaselineTitleShift(titleEl: HTMLElement | null, shift: number): number {
  if (!titleEl || !shift) {
    if (titleEl) {
      titleEl.style.transform = '';
    }
    return 0;
  }

  titleEl.style.transform = `translateY(${shift}px)`;
  return shift;
}

const COLUMN_CONTENT_KEY_TO_TEXT_PREFIX: Record<
  typeof COLUMN_CONTENT_KEYS[number],
  typeof COLUMN_TEXT_PREFIXES[number]
> = {
  AColumn: 'AColumn',
  BColumnWidth: 'BColumn',
  CColumnWidth: 'CColumn',
  DColumnWidth: 'DColumn',
  EColumnWidth: 'EColumn',
};

export const LIST_GLOBAL_TEXT_STYLE_KEYS = [
  'textFontFamily',
  'textFontSettings',
  'textFontSize',
  'textLineHeight',
  'textLetterSpacing',
  'textWordSpacing',
  'textTextAlign',
  'textTextAppearance',
] as const;

export type ListGlobalTextStyleKey = typeof LIST_GLOBAL_TEXT_STYLE_KEYS[number];

export function getListColumnTextSettingKey(
  prefix: ListTextStylePrefix,
  globalKey: ListGlobalTextStyleKey,
): string {
  return `${prefix}${globalKey.replace(/^text/, 'Text')}`;
}

export const LIST_TEXT_STYLE_TAB_LABELS: Record<ListTextStylePrefix, string> = {
  AColumn: 'A',
  BColumn: 'B',
  CColumn: 'C',
  DColumn: 'D',
  EColumn: 'E',
  cutLabel: 'CUT',
};

export function createListTextStyleTabContentItems(prefix: ListTextStylePrefix): LayoutItem[] {
  return [
    getListColumnTextSettingKey(prefix, 'textFontFamily'),
    getListColumnTextSettingKey(prefix, 'textFontSettings'),
    {
      type: 'row',
      items: [
        getListColumnTextSettingKey(prefix, 'textFontSize'),
        getListColumnTextSettingKey(prefix, 'textLineHeight'),
        getListColumnTextSettingKey(prefix, 'textLetterSpacing'),
        getListColumnTextSettingKey(prefix, 'textWordSpacing'),
      ],
    },
    getListColumnTextSettingKey(prefix, 'textTextAlign'),
    getListColumnTextSettingKey(prefix, 'textTextAppearance'),
    `${prefix}VerticalAlign`,
  ];
}

export function createListTextStylePanelTab(): LayoutTab {
  return {
    type: 'tab',
    id: 'listColumnTextStyle',
    tabs: Object.fromEntries(
      LIST_TEXT_STYLE_PREFIXES.map((prefix) => [
        LIST_TEXT_STYLE_TAB_LABELS[prefix],
        createListTextStyleTabContentItems(prefix),
      ]),
    ),
  };
}

type ListTextStyleFields = {
  textFontFamily?: string;
  textFontSettings?: { fontWeight: number; fontStyle: string };
  textFontSize?: number;
  textLineHeight?: number;
  textLetterSpacing?: number;
  textWordSpacing?: number;
  textTextAlign?: 'left' | 'center' | 'right' | 'justify';
  textTextAppearance?: TextStyles['textAppearance'];
  textColor?: string;
};

type ResolvedListTextFields = {
  textFontFamily: string;
  textFontSettings: { fontWeight: number; fontStyle: string };
  textFontSize?: number;
  textLineHeight?: number;
  textLetterSpacing: number;
  textWordSpacing: number;
  textTextAlign: 'left' | 'center' | 'right' | 'justify';
  textTextAppearance?: TextStyles['textAppearance'];
  textColor?: string;
};

function resolveListColumnTextFields(
  settings: ListSettings,
  textPrefix: ListTextStylePrefix,
): ResolvedListTextFields {
  const read = <K extends ListGlobalTextStyleKey>(globalKey: K) => {
    const columnKey = getListColumnTextSettingKey(textPrefix, globalKey);
    return settings[columnKey as keyof ListSettings] as ListTextStyleFields[K] | undefined;
  };

  return {
    textFontFamily: (read('textFontFamily') as string | undefined) ?? 'Arial',
    textFontSettings: (read('textFontSettings') as ListTextStyleFields['textFontSettings']) ?? {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    textFontSize: read('textFontSize') as number | undefined,
    textLineHeight: read('textLineHeight') as number | undefined,
    textLetterSpacing: (read('textLetterSpacing') as number | undefined) ?? 0,
    textWordSpacing: (read('textWordSpacing') as number | undefined) ?? 0,
    textTextAlign: (read('textTextAlign') as ListTextStyleFields['textTextAlign'])
      ?? (textPrefix === CUT_LABEL_TEXT_PREFIX ? 'center' : 'left'),
    textTextAppearance: read('textTextAppearance') as ListTextStyleFields['textTextAppearance'],
    textColor: settings.textColor,
  };
}

function listColumnTextFieldsToCss(
  fields: ResolvedListTextFields,
  isEditor?: boolean,
): React.CSSProperties {
  const resolvedTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: fields.textFontFamily,
      fontWeight: fields.textFontSettings?.fontWeight ?? 400,
      fontStyle: fields.textFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fields.textFontSize ?? 0.01,
    lineHeight: fields.textLineHeight,
    letterSpacing: fields.textLetterSpacing,
    wordSpacing: fields.textWordSpacing,
    textAlign: fields.textTextAlign,
    textAppearance: fields.textTextAppearance,
    color: fields.textColor ?? '#767676',
  };

  return omitTextColors(textStylesToCss(resolvedTextStyle, isEditor));
}

function getListColumnTitleClassName(
  settings: ListSettings,
  prefix: ListTextStylePrefix,
  baseClassName: string,
  tightLeadingClassName: string,
): string {
  const fields = resolveListColumnTextFields(settings, prefix);
  const fontSize = fields.textFontSize ?? 0.01;
  const lineHeight = fields.textLineHeight;
  const needsTightLeading = lineHeight !== undefined && lineHeight < fontSize;

  return needsTightLeading
    ? `${baseClassName} ${tightLeadingClassName}`
    : baseClassName;
}

function getListColumnTitleVars(
  settings: ListSettings,
  prefix: ListTextStylePrefix,
  titleVarPrefix: string,
  isEditor?: boolean,
): React.CSSProperties {
  const fields = resolveListColumnTextFields(settings, prefix);
  const fontSize = fields.textFontSize ?? 0.01;
  const lineHeight = fields.textLineHeight;

  if (lineHeight === undefined || lineHeight >= fontSize) {
    return {};
  }

  return {
    [`--${titleVarPrefix}-title-leading-gap`]: scalingValue((fontSize - lineHeight) / 2, isEditor),
  } as React.CSSProperties;
}

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

const COLUMN_PADDING_BOTTOM_KEYS = [
  'AColumnPaddingBottom',
  'BColumnPaddingBottom',
  'CColumnPaddingBottom',
  'DColumnPaddingBottom',
  'EColumnPaddingBottom',
] as const;

type ColumnWidthKey = typeof COLUMN_WIDTH_KEYS[number];
type ColumnPaddingLeftKey = typeof COLUMN_PADDING_LEFT_KEYS[number];
type ColumnPaddingRightKey = typeof COLUMN_PADDING_RIGHT_KEYS[number];
type ColumnPaddingBottomKey = typeof COLUMN_PADDING_BOTTOM_KEYS[number];

type ListColumnPaddingUpdates = {
  AColumnPaddingLeft?: number;
  AColumnPaddingRight?: number;
  BColumnPaddingLeft?: number;
  BColumnPaddingRight?: number;
  CColumnPaddingLeft?: number;
  CColumnPaddingRight?: number;
  DColumnPaddingLeft?: number;
  DColumnPaddingRight?: number;
  EColumnPaddingLeft?: number;
  EColumnPaddingRight?: number;
};

type ListColumnWidthUpdates = {
  AColumnWidth?: number;
  BColumnWidth?: number;
  CColumnWidth?: number;
  DColumnWidth?: number;
  EColumnWidth?: number;
};

type ListItemColumn = {
  key: string;
  textPrefix: typeof COLUMN_TEXT_PREFIXES[number];
  widthKey: ColumnWidthKey;
  paddingLeftKey: ColumnPaddingLeftKey;
  paddingRightKey: ColumnPaddingRightKey;
  paddingBottomKey: ColumnPaddingBottomKey;
  width: number;
  paddingLeft: number;
  paddingRight: number;
  paddingBottom: number;
};

type ColorKeys =
  | 'textColor'
  | 'backgroundColor'
  | 'dividerColor'
  | 'textHoverColor'
  | 'backgroundHoverColor'
  | 'dividerHoverColor';

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  textColor: 'text-color',
  backgroundColor: 'background-color',
  dividerColor: 'divider-color',
  textHoverColor: 'text-hover-color',
  backgroundHoverColor: 'background-hover-color',
  dividerHoverColor: 'divider-hover-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;

const COL_RESIZE_HANDLE_WIDTH = 0.004;
const COL_PADDING_HANDLE_WIDTH = 0.004;
const ROW_PADDING_HANDLE_HEIGHT = COL_PADDING_HANDLE_WIDTH;
const PADDING_CONTROL_HIT_SIZE = 12;
const MIN_COLUMN_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_COLUMN_WIDTH = MIN_COLUMN_WIDTH_PX / ARTICLE_DESIGN_WIDTH;

export function getListMinColumnWidth(designWidthPx?: number): number {
  const designWidth = typeof designWidthPx === 'number' && designWidthPx > 0
    ? designWidthPx
    : ARTICLE_DESIGN_WIDTH;

  return MIN_COLUMN_WIDTH_PX / designWidth;
}

type ListPaddingControlHitPlacement = 'left-y' | 'center-x' | 'center';

function getListPaddingControlHitStyle(
  P: string,
  placement: ListPaddingControlHitPlacement,
): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    width: PADDING_CONTROL_HIT_SIZE,
    height: PADDING_CONTROL_HIT_SIZE,
    pointerEvents: 'auto',
  };

  if (placement === 'left-y') {
    return { ...base, left: 20, top: '50%', transform: 'translateY(-50%)' };
  }

  if (placement === 'center-x') {
    return {
      ...base,
      left: '50%',
      top: `var(--${P}-first-entry-handle-top, 50%)`,
      transform: 'translate(-50%, -50%)',
    };
  }

  return { ...base, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
}

type ListPaddingControlProps = {
  P: string;
  className: string;
  areaStyle: CSSProperties;
  hitPlacement: ListPaddingControlHitPlacement;
} & ComponentPropsWithoutRef<'div'>;

function ListPaddingControl({
  P,
  className,
  areaStyle,
  hitPlacement,
  ...rest
}: ListPaddingControlProps) {
  return (
    <div
      className={className}
      style={{ ...areaStyle, pointerEvents: 'none' }}
      {...rest}
    >
      <div style={getListPaddingControlHitStyle(P, hitPlacement)} />
    </div>
  );
}

function getEditorDesignWidth(element: HTMLElement | null | undefined): number {
  let el = element ?? null;

  while (el) {
    const inline = el.style.getPropertyValue('--cntrl-article-width').trim();
    if (inline) {
      const px = parseFloat(inline);
      if (Number.isFinite(px) && px > 0) {
        return px;
      }
    }

    const computed = getComputedStyle(el).getPropertyValue('--cntrl-article-width').trim();
    if (computed) {
      const px = parseFloat(computed);
      if (Number.isFinite(px) && px > 0) {
        return px;
      }
    }

    el = el.parentElement;
  }

  return ARTICLE_DESIGN_WIDTH;
}

const DEFAULT_COLUMN_WIDTHS: Record<ColumnWidthKey, number> = {
  AColumnWidth: 0.02,
  BColumnWidth: 0.02,
  CColumnWidth: 0.02,
  DColumnWidth: 0.02,
  EColumnWidth: 0.02,
};

export function getListEffectiveContentWidth(
  settings: ListSettings,
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

function getResetListColumnPaddingUpdates(): Record<
  ColumnPaddingLeftKey | ColumnPaddingRightKey,
  number
> {
  return Object.fromEntries([
    ...COLUMN_PADDING_LEFT_KEYS.map((key) => [key, 0]),
    ...COLUMN_PADDING_RIGHT_KEYS.map((key) => [key, 0]),
  ]) as Record<ColumnPaddingLeftKey | ColumnPaddingRightKey, number>;
}

function getResetListColumnPaddingBottomUpdates(): Record<ColumnPaddingBottomKey, number> {
  return Object.fromEntries(
    COLUMN_PADDING_BOTTOM_KEYS.map((key) => [key, 0]),
  ) as Record<ColumnPaddingBottomKey, number>;
}

function getStoredColumnWidths(
  settings: ListSettings,
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
  settings: ListSettings,
): ListColumnPaddingUpdates {
  const updates: ListColumnPaddingUpdates = {};

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
): ListColumnWidthUpdates {
  if (columns <= 1) {
    return {};
  }

  const resolvedWidths = resolveListColumnWidths(columns, wrapperWidth, storedWidths);
  const updates: ListColumnWidthUpdates = {};

  for (let index = 0; index < columns - 1; index += 1) {
    const key = COLUMN_WIDTH_KEYS[index];
    if (resolvedWidths[index] !== storedWidths[key]) {
      updates[key] = resolvedWidths[index];
    }
  }

  return updates;
}

function getColumnsOrder(settings: ListSettings): string[] {
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
  prevSettings: ListSettings,
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
    const prevPaddingBottomKey = COLUMN_PADDING_BOTTOM_KEYS[prevSlotIndex];
    const widthKey = COLUMN_WIDTH_KEYS[index];
    const paddingLeftKey = COLUMN_PADDING_LEFT_KEYS[index];
    const paddingRightKey = COLUMN_PADDING_RIGHT_KEYS[index];
    const paddingBottomKey = COLUMN_PADDING_BOTTOM_KEYS[index];

    const prevWidth = prevSettings[prevWidthKey];
    const prevPaddingLeft = prevSettings[prevPaddingLeftKey];
    const prevPaddingRight = prevSettings[prevPaddingRightKey];
    const prevPaddingBottom = prevSettings[prevPaddingBottomKey];

    if (typeof prevWidth === 'number') {
      updates[widthKey] = prevWidth;
    }

    if (typeof prevPaddingLeft === 'number') {
      updates[paddingLeftKey] = prevPaddingLeft;
    }

    if (typeof prevPaddingRight === 'number') {
      updates[paddingRightKey] = prevPaddingRight;
    }

    if (typeof prevPaddingBottom === 'number') {
      updates[paddingBottomKey] = prevPaddingBottom;
    }
  }

  return updates;
}

export function applyListSettingsChange(
  nextSettings: ListSettings,
  prevSettings: ListSettings,
  options?: { designWidth?: number },
): ListSettings {
  const valignSanitizeUpdates = getListColumnVerticalAlignSanitizeUpdates(nextSettings);
  if (valignSanitizeUpdates) {
    nextSettings = { ...nextSettings, ...valignSanitizeUpdates };
  }

  const minColumnWidth = getListMinColumnWidth(options?.designWidth);
  const nextColumns = nextSettings.columns;
  const prevColumns = prevSettings.columns;
  const nextContentWidth = getListEffectiveContentWidth(nextSettings);
  const prevContentWidth = getListEffectiveContentWidth(prevSettings);
  const isVerticalLayout = nextSettings.type === 'B'
    || (nextSettings.type === undefined && prevSettings.type === 'B');
  const columns =
    typeof nextColumns === 'number'
      ? nextColumns
      : typeof prevColumns === 'number'
        ? prevColumns
        : COLUMN_CONTENT_KEYS.length;

  const withColumnPaddingUpdates = (
    settings: ListSettings,
  ): ListSettings => {
    if (isVerticalLayout) {
      return settings;
    }

    const storedWidths = getStoredColumnWidths({ ...prevSettings, ...settings });
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
    const updates: ListSettings = {
      ...nextSettings,
      ...getEqualListColumnWidthUpdates(nextColumns, nextContentWidth),
      ...getResetListColumnPaddingUpdates(),
    };

    if (isVerticalLayout) {
      for (const key of COLUMN_PADDING_BOTTOM_KEYS) {
        if (typeof prevSettings[key] === 'number') {
          updates[key] = prevSettings[key];
        }
      }
    } else {
      Object.assign(updates, getResetListColumnPaddingBottomUpdates());
    }

    return updates;
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
    if (typeof columns === 'number' && !isVerticalLayout) {
      const storedWidths = getStoredColumnWidths({ ...prevSettings, ...nextSettings });

      return withColumnPaddingUpdates({
        ...nextSettings,
        ...getListColumnWidthUpdatesForWrapperWidth(columns, nextContentWidth, storedWidths),
      });
    }
  }

  if (isVerticalLayout) {
    const storedTextPaddingLR = typeof nextSettings.textPaddingLR === 'number'
      ? nextSettings.textPaddingLR as number
      : 0;
    const maxAllowedPadding = Math.max(0, (nextContentWidth - minColumnWidth) / 2);

    if (storedTextPaddingLR > maxAllowedPadding) {
      return { ...nextSettings, textPaddingLR: maxAllowedPadding };
    }

    return nextSettings;
  }

  const storedWidths = getStoredColumnWidths({ ...prevSettings, ...nextSettings });
  const prevEffectiveWidths = getEffectiveListColumnWidths(
    columns,
    prevContentWidth,
    getStoredColumnWidths(prevSettings),
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

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getColumnWidthsFromSettings(
  settings: ListSettings,
): Record<ColumnWidthKey, number> {
  return Object.fromEntries(
    COLUMN_WIDTH_KEYS.map((key) => [
      key,
      typeof settings[key] === 'number' ? settings[key] as number : DEFAULT_COLUMN_WIDTHS[key],
    ]),
  ) as Record<ColumnWidthKey, number>;
}

function getNumericSettingValues<K extends ColumnPaddingLeftKey | ColumnPaddingRightKey | ColumnPaddingBottomKey>(
  settings: ListSettings,
  keys: readonly K[],
  fallback = 0,
): Record<K, number> {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      typeof settings[key] === 'number' ? settings[key] as number : fallback,
    ]),
  ) as Record<K, number>;
}

function buildListColumns(
  columnContentOrder: readonly typeof COLUMN_CONTENT_KEYS[number][],
  columns: number,
  columnWidthByKey: Record<ColumnWidthKey, number>,
  columnPaddingLeftByKey: Record<ColumnPaddingLeftKey, number>,
  columnPaddingRightByKey: Record<ColumnPaddingRightKey, number>,
  columnPaddingBottomByKey: Record<ColumnPaddingBottomKey, number>,
): ListItemColumn[] {
  return columnContentOrder.slice(0, columns).map((key, index) => {
    const paddingLeftKey = COLUMN_PADDING_LEFT_KEYS[index];
    const paddingRightKey = COLUMN_PADDING_RIGHT_KEYS[index];
    const paddingBottomKey = COLUMN_PADDING_BOTTOM_KEYS[index];

    return {
      key,
      textPrefix: COLUMN_CONTENT_KEY_TO_TEXT_PREFIX[key],
      widthKey: COLUMN_WIDTH_KEYS[index],
      width: columnWidthByKey[COLUMN_WIDTH_KEYS[index]],
      paddingLeftKey,
      paddingRightKey,
      paddingBottomKey,
      paddingLeft: columnPaddingLeftByKey[paddingLeftKey],
      paddingRight: columnPaddingRightByKey[paddingRightKey],
      paddingBottom: columnPaddingBottomByKey[paddingBottomKey],
    };
  });
}

export function List({ settings, content, isEditor, isPreviewMode, isEditMode, activeEvent, layoutId, onUpdateSettings }: ListProps) {
  const { prefix: P } = useScopedStyles();
  const showControls = Boolean(isEditMode);
  const {
    columns,
    type,
    wrapperWidth,
    entriesCount,
    cellMinHeight,
    dividerWidth,
    showVisibility,
    cut,
    showCut,
    cutCellMinHeight,
    cutLabel,
    imageSize,
    imageOnHover,
    entryHoverEffect,
    rowPaddingTop,
    rowPaddingBottom,
    rowPaddingTopB,
    columnsOrder,
    textPaddingLR,
    textColor,
    backgroundColor,
    dividerColor,
    textHoverColor,
    backgroundHoverColor,
    dividerHoverColor,
  } = settings;

  const [visibleRowCount, setVisibleRowCount] = useState<number | undefined>(undefined);
  const [hoverImage, setHoverImage] = useState<HoverImageState | null>(null);
  const showHoverImage = imageOnHover === 'On' && (!isEditor || isPreviewMode);
  const cutEnabled = (cut ?? 0) > 0;
  const isVerticalLayout = type === 'B';
  const containerRef = useRef<HTMLDivElement>(null);
  const firstEntryRef = useRef<HTMLElement | null>(null);
  const [firstEntryHeightPx, setFirstEntryHeightPx] = useState<number | null>(null);
  const [designWidth, setDesignWidth] = useState(ARTICLE_DESIGN_WIDTH);
  const minColumnWidth = getListMinColumnWidth(designWidth);

  const storedTextPaddingLRMax = Math.max(0, ((wrapperWidth ?? 0) - minColumnWidth) / 2);
  const effectiveTextPaddingLR = Math.min(textPaddingLR ?? 0, storedTextPaddingLRMax);
  const textPaddingLRHandleWidth = Math.max(effectiveTextPaddingLR, COL_PADDING_HANDLE_WIDTH);
  const textPaddingLRMaxFraction = ((wrapperWidth ?? 0) + minColumnWidth) / 2;

  useLayoutEffect(() => {
    if (!isEditor) {
      setDesignWidth(ARTICLE_DESIGN_WIDTH);
      return;
    }

    const syncDesignWidth = () => {
      setDesignWidth(getEditorDesignWidth(containerRef.current));
    };

    syncDesignWidth();

    const observed = containerRef.current;
    if (!observed) {
      return;
    }

    const observer = new ResizeObserver(syncDesignWidth);
    observer.observe(observed);

    let pageEl: HTMLElement | null = observed;
    while (pageEl && !pageEl.style.getPropertyValue('--cntrl-article-width')) {
      pageEl = pageEl.parentElement;
    }
    if (pageEl) {
      observer.observe(pageEl);
    }

    return () => observer.disconnect();
  }, [isEditor, layoutId]);

  useEffect(() => {
    setVisibleRowCount(undefined);
  }, [cut, showCut, content, entriesCount]);

  useEffect(() => {
    if (isEditor && !isPreviewMode) {
      setVisibleRowCount(undefined);
    }
  }, [isEditor, isPreviewMode]);

  const colorVars = buildColorVars(P, {
    textColor,
    backgroundColor,
    dividerColor,
    textHoverColor,
    backgroundHoverColor,
    dividerHoverColor
  }, COLOR_VAR_MAP, STATE_KEYS);

  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';
  const entryHoverClass = (!isEditor || isPreviewMode) 
  ? entryHoverEffect === 'Default'
      ? `${P}-entry-hover-default`
      : entryHoverEffect === 'Blinds'
        ? `${P}-entry-hover-blinds`
        : ''
  : '';
  const wrapperStateClasses = `${entryHoverClass} ${stateClass}`.trim();
  const showDividerTop = showVisibility?.[0] ?? false;
  const showDividerBottom = showVisibility?.[1] ?? false;

  const prevSettingsRef = useRef(settings);
  const prevLayoutIdRef = useRef(layoutId);

  useEffect(() => {
    if (!onUpdateSettings || !isEditor) {
      prevSettingsRef.current = settings;
      prevLayoutIdRef.current = layoutId;
      return;
    }

    if (prevLayoutIdRef.current !== layoutId) {
      prevSettingsRef.current = settings;
      prevLayoutIdRef.current = layoutId;
      return;
    }

    const prevSettings = prevSettingsRef.current;
    const settingsChanged = prevSettings !== settings;

    if (!settingsChanged) {
      return;
    }

    const updatedSettings = applyListSettingsChange(
      settings,
      prevSettings,
      { designWidth },
    );

    prevSettingsRef.current = settings;

    if (updatedSettings === settings) {
      return;
    }

    onUpdateSettings(updatedSettings);
  }, [settings, onUpdateSettings, isEditor, layoutId, designWidth]);

  const columnWidthByKey = useMemo(
    () => getColumnWidthsFromSettings(settings),
    [
      settings.AColumnWidth,
      settings.BColumnWidth,
      settings.CColumnWidth,
      settings.DColumnWidth,
      settings.EColumnWidth,
    ],
  );

  const columnPaddingLeftByKey = useMemo(
    () => getNumericSettingValues(settings, COLUMN_PADDING_LEFT_KEYS),
    [
      settings.AColumnPaddingLeft,
      settings.BColumnPaddingLeft,
      settings.CColumnPaddingLeft,
      settings.DColumnPaddingLeft,
      settings.EColumnPaddingLeft,
    ],
  );

  const columnPaddingRightByKey = useMemo(
    () => getNumericSettingValues(settings, COLUMN_PADDING_RIGHT_KEYS),
    [
      settings.AColumnPaddingRight,
      settings.BColumnPaddingRight,
      settings.CColumnPaddingRight,
      settings.DColumnPaddingRight,
      settings.EColumnPaddingRight,
    ],
  );

  const columnPaddingBottomByKey = useMemo(
    () => getNumericSettingValues(settings, COLUMN_PADDING_BOTTOM_KEYS),
    [
      settings.AColumnPaddingBottom,
      settings.BColumnPaddingBottom,
      settings.CColumnPaddingBottom,
      settings.DColumnPaddingBottom,
      settings.EColumnPaddingBottom,
    ],
  );

  const columnContentOrder = useMemo((): typeof COLUMN_CONTENT_KEYS[number][] => {
    if (Array.isArray(columnsOrder) && columnsOrder.length > 0) {
      return columnsOrder as typeof COLUMN_CONTENT_KEYS[number][];
    }
    return [...COLUMN_CONTENT_KEYS];
  }, [columnsOrder]);

  const listColumns = useMemo(
    () => buildListColumns(
      columnContentOrder,
      columns,
      columnWidthByKey,
      columnPaddingLeftByKey,
      columnPaddingRightByKey,
      columnPaddingBottomByKey,
    ),
    [columnContentOrder, columns, columnWidthByKey, columnPaddingLeftByKey, columnPaddingRightByKey, columnPaddingBottomByKey],
  );

  const resolvedContentWidth = getListEffectiveContentWidth(settings);

  const storedColumnWidths = useMemo(
    () => COLUMN_WIDTH_KEYS.slice(0, columns).map((key) => columnWidthByKey[key]),
    [columns, columnWidthByKey],
  );

  const resolvedColumnWidths = useMemo(
    () => resolveListColumnWidths(columns, resolvedContentWidth, columnWidthByKey),
    [columns, resolvedContentWidth, columnWidthByKey],
  );

  const effectiveColumnWidths = useMemo(
    () => getEffectiveListColumnWidths(columns, resolvedContentWidth, columnWidthByKey),
    [columns, resolvedContentWidth, columnWidthByKey],
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

  const hasBetweenItemDividers = visibleRows.length > 1 || showCutLabel;
  const dividerClassNames = [
    showDividerTop ? `${P}-divider-top` : '',
    showDividerBottom || hasBetweenItemDividers ? `${P}-divider-bottom` : '',
  ].filter(Boolean).join(' ');

  const cutItemClickable = !isEditor || isPreviewMode;

  const handleShowMore = () => {
    if (!cutItemClickable) return;

    const currentVisible = visibleRowCount ?? cut;
    if (!showCut) {
      setVisibleRowCount(allRows.length);
      return;
    }
    setVisibleRowCount(Math.min(currentVisible + showCut, allRows.length));
  };

  const scaled = (v: number) => scalingValue(v, isEditor ?? false);
  const resolvedRowPaddingTop = isVerticalLayout
    ? (rowPaddingTopB ?? 0)
    : (rowPaddingTop ?? 0);
  const resolvedRowPaddingBottom = rowPaddingBottom ?? 0;
  const resolvedCellMinHeight = cellMinHeight ?? 0;
  const firstEntryCenterTop = (resolvedRowPaddingTop + resolvedCellMinHeight + resolvedRowPaddingBottom) / 2;
  const rowPaddingBottomControlHeight = Math.max(resolvedRowPaddingBottom, ROW_PADDING_HANDLE_HEIGHT);
  const firstEntryHandleTop = firstEntryHeightPx != null
    ? `${firstEntryHeightPx / 2}px`
    : scaled(firstEntryCenterTop);
  const rowPaddingTopControlKey = isVerticalLayout ? 'rowPaddingTopB' : 'rowPaddingTop';
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

  const getHoverImagePosition = (event: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) {
      return { x: 0, y: 0 };
    }

    const rect = container.getBoundingClientRect();
    return {
      x: event.clientX - rect.left + HOVER_IMAGE_CURSOR_OFFSET,
      y: event.clientY - rect.top + HOVER_IMAGE_CURSOR_OFFSET,
    };
  };

  const handleRowMouseEnter = (row: ListItemRow, event: React.MouseEvent) => {
    if (!showHoverImage) return;

    const image = row.image;
    if (!image?.url) {
      setHoverImage(null);
      return;
    }

    const { x, y } = getHoverImagePosition(event);
    const minWidth = imageSize?.min ?? 80;
    const maxWidth = imageSize?.max ?? 320;
    const widthPx = hoverImage?.rowId === row.id
      ? hoverImage.widthPx
      : randomBetween(minWidth, maxWidth);

    setHoverImage({
      rowId: row.id,
      url: image.url,
      objectFit: image.objectFit ?? 'cover',
      widthPx,
      x,
      y,
    });
  };

  const handleWrapperMouseMove = (event: React.MouseEvent) => {
    if (!showHoverImage || !hoverImage) return;

    const { x, y } = getHoverImagePosition(event);
    setHoverImage((prev) => {
      if (!prev) return prev;
      if (prev.x === x && prev.y === y) return prev;
      return { ...prev, x, y };
    });
  };

  const handleWrapperMouseLeave = () => {
    setHoverImage(null);
  };

  const handleCutItemMouseEnter = () => {
    if (!showHoverImage) return;
    setHoverImage(null);
  };

  useLayoutEffect(() => {
    if (!showControls || isVerticalLayout) {
      setFirstEntryHeightPx(null);
      return;
    }

    const el = firstEntryRef.current;
    if (!el) {
      setFirstEntryHeightPx(null);
      return;
    }

    const update = () => {
      setFirstEntryHeightPx(el.getBoundingClientRect().height);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, [
    showControls,
    isVerticalLayout,
    visibleRows,
    resolvedRowPaddingTop,
    resolvedRowPaddingBottom,
    resolvedCellMinHeight,
    content,
    settings,
    listColumns,
    effectiveColumnWidths,
    designWidth,
  ]);

  const hasBaselineColumn = useMemo(
    () =>
      !isVerticalLayout &&
      COLUMN_TEXT_PREFIXES.some((prefix) => {
        const columnLetter = prefix.charAt(0);
        const valign = settings[`${prefix}VerticalAlign` as ListColumnVerticalAlignKey];
        return isActiveBaselineVAlign(valign, settings, columnLetter);
      }),
    [
      isVerticalLayout,
      settings,
      settings.AColumnVerticalAlign,
      settings.BColumnVerticalAlign,
      settings.CColumnVerticalAlign,
      settings.DColumnVerticalAlign,
      settings.EColumnVerticalAlign,
    ],
  );
  
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clearBaselineStyles = () => {
      container.querySelectorAll<HTMLElement>('[data-list-col]').forEach((el) => {
        el.style.transform = '';
        const listCol = el.querySelector<HTMLElement>(`.${P}-list-col`);
        if (listCol) {
          listCol.style.minHeight = '';
          listCol.style.height = '';
        }
        const title = el.querySelector<HTMLElement>(`.${P}-list-col-title`);
        if (title) {
          title.style.transform = '';
        }
      });
    };

    if (isVerticalLayout || !hasBaselineColumn) {
      clearBaselineStyles();
      return;
    }

    const applyBaselines = () => {
      container.querySelectorAll<HTMLElement>('[data-list-row]').forEach((rowEl) => {
        const cols = Array.from(rowEl.querySelectorAll<HTMLElement>('[data-list-col]'));
        cols.forEach((el) => {
          el.style.transform = '';
          const listCol = el.querySelector<HTMLElement>(`.${P}-list-col`);
          if (listCol) {
            listCol.style.minHeight = '';
            listCol.style.height = '';
          }
          const title = el.querySelector<HTMLElement>(`.${P}-list-col-title`);
          if (title) {
            title.style.transform = '';
          }
        });

        syncRowListColHeights(rowEl, cols, `${P}-list-col`);
        void rowEl.offsetHeight;
        const rowTop = rowEl.getBoundingClientRect().top;

        type ColInfo = {
          el: HTMLElement;
          titleEl: HTMLElement | null;
          letter: string;
          kind: string;
          anchor: string | null;
        };

        const probeClassName = `${P}-baseline-probe`;
        const byLetter = new Map<string, ColInfo>();
        const infos: ColInfo[] = cols.map((el) => {
          const titleEl = el.querySelector<HTMLElement>(`.${P}-list-col-title`);
          const info: ColInfo = {
            el,
            titleEl,
            letter: el.getAttribute('data-col-letter') ?? '',
            kind: el.getAttribute('data-valign') ?? 'top',
            anchor: el.getAttribute('data-valign-anchor'),
          };
          byLetter.set(info.letter, info);
          return info;
        });

        const finalBaseline = new Map<string, number>();
        const resolve = (info: ColInfo, stack: Set<string>): number => {
          const cached = finalBaseline.get(info.letter);
          if (cached !== undefined) return cached;

          const anchor = info.anchor ? byLetter.get(info.anchor) : undefined;
          if (info.kind !== 'baseline' || !anchor || stack.has(info.letter)) {
            const baseline = measureColumnFirstLineBaselineOffset(
              info,
              rowTop,
              `${P}-list-col`,
              probeClassName,
            );
            finalBaseline.set(info.letter, baseline);
            return baseline;
          }

          stack.add(info.letter);
          const anchorBaseline = resolve(anchor, stack);
          stack.delete(info.letter);

          const followerNatural = measureColumnFirstLineBaselineOffset(
            info,
            rowTop,
            `${P}-list-col`,
            probeClassName,
          );
          const shift = anchorBaseline - followerNatural;
          applyBaselineTitleShift(info.titleEl, shift);

          const result = measureColumnFirstLineBaselineOffset(
            info,
            rowTop,
            `${P}-list-col`,
            probeClassName,
          );
          finalBaseline.set(info.letter, result);
          return result;
        };

        infos.forEach((info) => resolve(info, new Set<string>()));
      });
    };

    applyBaselines();

    const observer = new ResizeObserver(() => applyBaselines());
    observer.observe(container);

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) applyBaselines();
      });
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      clearBaselineStyles();
    };
  }, [
    hasBaselineColumn,
    isVerticalLayout,
    settings,
    content,
    designWidth,
    visibleRows,
    effectiveColumnWidths,
  ]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div style={colorVars}>
        <div
          ref={containerRef}
          className={`${P}-wrapper ${wrapperStateClasses}${dividerClassNames ? ` ${dividerClassNames}` : ''}${isVerticalLayout ? ` ${P}-type-b` : ''}`.trim()}
          style={{
            width: scalingValue(wrapperWidth ?? 0, isEditor),
            ...(!isVerticalLayout && showControls
              ? { [`--${P}-first-entry-handle-top`]: firstEntryHandleTop }
              : {}),
          }}
          onMouseMove={showHoverImage ? handleWrapperMouseMove : undefined}
          onMouseLeave={showHoverImage ? handleWrapperMouseLeave : undefined}
        >
          <div style={{ width: '100%', position: 'relative' }}>
            {visibleRows.map((row, rowIdx) => {
              const hasLink = (row.link?.length ?? 0) > 0;
              const RowElement = hasLink ? 'a' : 'div';
              const rowStyle = getEntryDividerWidths(
                rowIdx,
                visibleRows.length,
                showDividerTop,
                showDividerBottom,
                showCutLabel,
                dividerWidth ?? 0,
                isEditor ?? false,
              );

              return (
              <RowElement
                key={row.id}
                ref={rowIdx === 0 ? (el: HTMLElement | null) => { firstEntryRef.current = el; } : undefined}
                className={`${P}-list-item${hasLink ? ` ${P}-list-item-has-link` : ''}`}
                {...(hasLink ? { href: row.link, target: '_blank' } : {})}
                style={rowStyle}
                onMouseEnter={showHoverImage ? (event) => handleRowMouseEnter(row, event) : undefined}
              >
                {resolvedRowPaddingTop > 0 && (
                  <div
                    className={`${P}-row-padding-handle`}
                    style={{ height: scaled(resolvedRowPaddingTop) }}
                  />
                )}
                <div
                  className={`${P}-list-cols-row${isVerticalLayout ? '' : ` ${P}-list-cols-row-h`}${showControls && rowIdx === 0 && isVerticalLayout ? ` ${P}-list-cols-row-controls` : ''}`}
                  {...(isVerticalLayout ? {} : { 'data-list-row': '' })}
                  style={isVerticalLayout ? undefined : { minHeight: scaled(resolvedCellMinHeight) }}
                >
                  {listColumns.map((col, colIndex) => {
                    const isLastColumn = colIndex === listColumns.length - 1;
                    const effectivePadding = effectiveColumnPaddings[colIndex];
                    const columnPaddingBottom = col.paddingBottom;
                    const hasColumnText = hasListColumnText(row.cells[col.key]);
                    const showColumnPaddingBottom = isVerticalLayout
                      && hasColumnText
                      && columnPaddingBottom > 0;
                    const columnSizeStyle = isVerticalLayout
                      ? { minHeight: scaled(resolvedCellMinHeight) }
                      : { width: scaled(effectiveColumnWidths[colIndex]) };
                    const columnPaddingStyle = isVerticalLayout
                      ? {
                        paddingLeft: scaled(effectiveTextPaddingLR),
                        paddingRight: scaled(effectiveTextPaddingLR),
                      }
                      : {
                        paddingLeft: scaled(effectivePadding.paddingLeft),
                        paddingRight: scaled(effectivePadding.paddingRight),
                      };
                    const columnLetter = col.textPrefix.charAt(0);
                    const vAlign = isVerticalLayout
                      ? resolveBasicColumnVerticalAlign(
                        settings[`${col.textPrefix}VerticalAlign` as ListColumnVerticalAlignKey],
                      )
                      : resolveColumnVerticalAlign(
                        settings[`${col.textPrefix}VerticalAlign` as ListColumnVerticalAlignKey],
                        settings,
                        columnLetter,
                      );

                    const columnPaddingBottomOverlay = isVerticalLayout
                      && hasColumnText
                      && showControls
                      && rowIdx === 0;

                    return (
                      <div
                        key={col.key}
                        className={isVerticalLayout ? `${P}-list-col-wrap` : undefined}
                        {...(isVerticalLayout
                          ? {}
                          : {
                            'data-list-col': '',
                            'data-col-letter': columnLetter,
                            'data-valign': vAlign.kind,
                            ...(vAlign.kind === 'baseline'
                              ? { 'data-valign-anchor': vAlign.anchorLetter }
                              : {}),
                          })}
                      >
                        <div
                          className={`${P}-list-col${isLastColumn ? ` ${P}-list-col-last` : ''}`}
                          style={{
                            ...columnPaddingStyle,
                            ...columnSizeStyle,
                            ...(isVerticalLayout
                              ? { justifyContent: cutVerticalAlignKindToFlexAlign(vAlign.kind) }
                              : {}),
                          }}
                          data-test={col.width}
                        >
                          <span
                            className={getListColumnTitleClassName(
                              settings,
                              col.textPrefix,
                              `${P}-list-col-title`,
                              `${P}-text-tight-leading`,
                            )}
                            style={{
                              ...listColumnTextFieldsToCss(resolveListColumnTextFields(settings, col.textPrefix), isEditor),
                              ...getListColumnTitleVars(settings, col.textPrefix, P, isEditor),
                              ...(!isVerticalLayout ? vAlignToTitleStyle(vAlign.kind) : {}),
                            }}
                          >
                            {row.cells[col.key] ?? null}
                          </span>
                        </div>
                        {showColumnPaddingBottom && (
                          <div
                            className={`${P}-row-padding-handle`}
                            style={{ height: scaled(columnPaddingBottom) }}
                          />
                        )}
                        {columnPaddingBottomOverlay && (
                          <ListPaddingControl
                            P={P}
                            data-controls={col.paddingBottomKey}
                            data-controls-static-handle=""
                            data-controls-axis="y"
                            data-controls-variant="column-padding"
                            data-controls-min="0"
                            className={`${P}-padding-control-handle`}
                            hitPlacement="center"
                            areaStyle={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              width: '100%',
                              height: scaled(Math.max(columnPaddingBottom, ROW_PADDING_HANDLE_HEIGHT)),
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                  {showControls && rowIdx === 0 && isVerticalLayout && (
                    <>
                      <ListPaddingControl
                        P={P}
                        data-controls="textPaddingLR"
                        data-controls-static-handle=""
                        data-controls-paired=""
                        data-controls-axis="x"
                        data-controls-variant="column-padding"
                        data-controls-min="0"
                        data-controls-max-fraction={String(textPaddingLRMaxFraction)}
                        className={`${P}-text-padding-lr-handle`}
                        hitPlacement="center"
                        areaStyle={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: scaled(textPaddingLRHandleWidth),
                          height: '100%',
                        }}
                      />
                      <ListPaddingControl
                        P={P}
                        data-controls="textPaddingLR"
                        data-controls-static-handle=""
                        data-controls-paired=""
                        data-controls-axis="x"
                        data-controls-variant="column-padding"
                        data-controls-reverse=""
                        data-controls-min="0"
                        data-controls-max-fraction={String(textPaddingLRMaxFraction)}
                        className={`${P}-text-padding-lr-handle`}
                        hitPlacement="center"
                        areaStyle={{
                          position: 'absolute',
                          top: 0,
                          left: scaled(Math.max(textPaddingLRHandleWidth, resolvedContentWidth - textPaddingLRHandleWidth)),
                          width: scaled(textPaddingLRHandleWidth),
                          height: '100%',
                        }}
                      />
                    </>
                  )}
                </div>
                {!isVerticalLayout && resolvedRowPaddingBottom > 0 && (
                  <div
                    className={`${P}-row-padding-handle`}
                    style={{ height: scaled(resolvedRowPaddingBottom) }}
                  />
                )}
                {showControls && rowIdx === 0 && !isVerticalLayout && (
                  <ListPaddingControl
                    P={P}
                    data-controls="rowPaddingBottom"
                    data-controls-static-handle=""
                    data-controls-handle-left="20"
                    data-controls-axis="y"
                    data-controls-variant="row-padding"
                    data-controls-min="0"
                    className={`${P}-padding-control-handle`}
                    hitPlacement="left-y"
                    areaStyle={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: scaled(rowPaddingBottomControlHeight),
                    }}
                  />
                )}
              </RowElement>
            );
            })}
          {showControls && (
            <div key="row-padding-handles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <ListPaddingControl
                P={P}
                data-controls={rowPaddingTopControlKey}
                data-controls-static-handle=""
                {...(!isVerticalLayout ? { 'data-controls-handle-left': '20' } : {})}
                data-controls-axis="y"
                data-controls-variant="row-padding"
                data-controls-min="0"
                className={`${P}-padding-control-handle`}
                hitPlacement={isVerticalLayout ? 'center' : 'left-y'}
                areaStyle={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: scaled(Math.max(resolvedRowPaddingTop, ROW_PADDING_HANDLE_HEIGHT)),
                }}
              />
            </div>
          )}
          {showControls && !isVerticalLayout && firstColumn && lastColumn && (
            <div key="column-edge-padding-handles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <ListPaddingControl
                P={P}
                data-controls={firstColumn.paddingLeftKey}
                data-controls-static-handle=""
                data-controls-axis="x"
                data-controls-variant="column-padding"
                data-controls-min="0"
                data-controls-max-fraction={String(
                  effectiveColumnWidths[0] - (firstColumnEffectivePadding?.paddingRight ?? 0),
                )}
                className={`${P}-padding-control-handle`}
                hitPlacement="center-x"
                areaStyle={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: scaled(firstColumnPaddingLeftWidth),
                  height: '100%',
                }}
              />
              <ListPaddingControl
                P={P}
                data-controls={lastColumn.paddingRightKey}
                data-controls-static-handle=""
                data-controls-axis="x"
                data-controls-variant="column-padding"
                data-controls-reverse=""
                data-controls-min="0"
                data-controls-max-fraction={String(
                  effectiveColumnWidths[listColumns.length - 1]
                    - (lastColumnEffectivePadding?.paddingLeft ?? 0),
                )}
                className={`${P}-padding-control-handle`}
                hitPlacement="center-x"
                areaStyle={{
                  position: 'absolute',
                  top: 0,
                  left: scaled(columnsRightEdge - lastColumnPaddingRightWidth),
                  width: scaled(lastColumnPaddingRightWidth),
                  height: '100%',
                }}
              />
            </div>
          )}
          {showControls && !isVerticalLayout && listColumns.slice(0, -1).map((col, colIndex) => {
            const nextCol = listColumns[colIndex + 1];
            const boundaryOffset = resolvedColumnWidths.slice(0, colIndex + 1).reduce((sum, width) => sum + width, 0);
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

            return (
              <div key={`${col.paddingRightKey}-padding`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <ListPaddingControl
                  P={P}
                  data-controls={col.paddingRightKey}
                  data-controls-static-handle=""
                  data-controls-axis="x"
                  data-controls-variant="column-padding"
                  data-controls-reverse=""
                  data-controls-min="0"
                  data-controls-max-fraction={String(
                    effectiveColumnWidths[colIndex] - colEffectivePadding.paddingLeft,
                  )}
                  className={`${P}-padding-control-handle`}
                  hitPlacement="center-x"
                  areaStyle={{
                    position: 'absolute',
                    top: 0,
                    left: scaled(boundaryOffset - paddingRightWidth),
                    width: scaled(paddingRightWidth),
                    height: '100%',
                  }}
                />
                <ListPaddingControl
                  P={P}
                  data-controls={nextCol.paddingLeftKey}
                  data-controls-static-handle=""
                  data-controls-axis="x"
                  data-controls-variant="column-padding"
                  data-controls-min="0"
                  data-controls-max-fraction={String(
                    effectiveColumnWidths[colIndex + 1] - nextColEffectivePadding.paddingRight,
                  )}
                  className={`${P}-padding-control-handle`}
                  hitPlacement="center-x"
                  areaStyle={{
                    position: 'absolute',
                    top: 0,
                    left: scaled(boundaryOffset),
                    width: scaled(paddingLeftWidth),
                    height: '100%',
                  }}
                />
              </div>
            );
          })}
          {showControls && !isVerticalLayout && listColumns.slice(0, -1).map((col, colIndex) => {
            const maxColumnWidth = getColumnMaxWidth(
              colIndex,
              resolvedColumnWidths,
              storedColumnWidths,
              resolvedContentWidth,
            );
            const boundaryOffset = resolvedColumnWidths.slice(0, colIndex + 1).reduce((sum, width) => sum + width, 0);
            const columnWidthHandleOffset = boundaryOffset - COL_RESIZE_HANDLE_WIDTH / 2;

            return (
              <div key={`${col.widthKey}-junction`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div
                  data-controls={col.widthKey}
                  data-controls-static-handle=""
                  data-controls-axis="x"
                  data-controls-min={String(MIN_COLUMN_WIDTH_PX)}
                  data-controls-max-fraction={String(maxColumnWidth)}
                  data-controls-variant="column-width"
                  className={`${P}-col-resize-handle`}
                  style={{
                    position: 'absolute',
                    top: '0px',
                    left: scaled(columnWidthHandleOffset),
                    width: scaled(COL_RESIZE_HANDLE_WIDTH),
                    height: 'calc(100%)',
                    pointerEvents: 'auto',
                  }}
                />
              </div>
            );
          })}
          </div>
          {showCutLabel && (() => {
            const cutLabelFields = resolveListColumnTextFields(settings, CUT_LABEL_TEXT_PREFIX);
            const cutLabelVerticalAlignKind = resolveCutLabelVerticalAlignKind(settings.cutLabelVerticalAlign);
            const cutLabelUsesFullWidth = cutLabelFields.textTextAlign === 'justify' || isVerticalLayout;

            return (
            <button
              type="button"
              className={`${P}-cut-item`}
              style={{
                minHeight: scaled(cutCellMinHeight ?? 0),
                cursor: cutItemClickable ? 'pointer' : 'default',
                ...getCutItemDividerWidths(
                  showDividerBottom,
                  dividerWidth ?? 0,
                  isEditor ?? false,
                ),
              }}
              onClick={cutItemClickable ? handleShowMore : undefined}
              onMouseEnter={showHoverImage ? handleCutItemMouseEnter : undefined}
            >
              <div
                className={`${P}-list-cols-row`}
                style={{
                  ...(isVerticalLayout
                    ? {
                      paddingLeft: scaled(effectiveTextPaddingLR),
                      paddingRight: scaled(effectiveTextPaddingLR),
                    }
                    : {}),
                  justifyContent: textAlignToJustifyContent(cutLabelFields.textTextAlign),
                  alignItems: cutVerticalAlignKindToFlexAlign(cutLabelVerticalAlignKind),
                }}
              >
                <span
                  className={getListColumnTitleClassName(
                    settings,
                    CUT_LABEL_TEXT_PREFIX,
                    `${P}-cut-label`,
                    `${P}-text-tight-leading`,
                  )}
                  style={{
                    ...listColumnTextFieldsToCss(cutLabelFields, isEditor),
                    ...getListColumnTitleVars(settings, CUT_LABEL_TEXT_PREFIX, P, isEditor),
                    ...(cutLabelUsesFullWidth ? { width: '100%' } : {}),
                  }}
                >
                  {cutLabel}
                </span>
              </div>
            </button>
            );
          })()}
          {showHoverImage && hoverImage && (
            <img
              className={`${P}-hover-image`}
              src={hoverImage.url}
              alt=""
              style={{
                width: sv(hoverImage.widthPx),
                objectFit: hoverImage.objectFit,
                left: hoverImage.x,
                top: hoverImage.y,
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
