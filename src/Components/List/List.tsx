import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';
import { CommonComponentProps } from '../props';
import { buildColorVars, scalingValue, useScopedStyles } from '../utils/index';
import { useMemo, useRef } from 'react';
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
}

.${P}-list-item {
  display: flex;
  align-items: stretch;
  width: 100%;
  overflow: visible;
  position: relative;
  box-sizing: border-box;
  border-bottom-style: solid;
  border-bottom-color: var(--${P}-divider-color);
  user-select: none;
  background: var(--${P}-background-color);
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

.${P}-col-resize-handle {
  background: transparent;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item {
  transition: background-color 250ms, border-color 250ms;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-col-title {
  transition: color 250ms;
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:hover,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item {
  background: var(--${P}-background-hover-color);
}

.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:hover,
.${P}-wrapper.${P}-entry-hover-default .${P}-list-item:has(+ .${P}-list-item:hover),
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-list-item,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover,
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:has(+ .${P}-list-item:hover),
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item {
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
.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover .${P}-list-col-title,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item .${P}-list-col-title {
  color: var(--${P}-text-hover-color);
}

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item::before {
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

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-col {
  z-index: 1;
}

.${P}-wrapper.${P}-entry-hover-blinds .${P}-list-item:hover::before,
.${P}-wrapper.${P}-entry-hover-blinds.${P}-state-hover .${P}-list-item::before {
  transform: scaleY(1);
}
`;
}

type ListItemColumn = {
  key: string;
  widthKey: ColumnWidthKey;
  width: number;
};

const COLUMN_CONTENT_KEYS = [
  'firstColumn',
  'secondColumn',
  'thirdColumn',
  'fourthColumn',
  'fifthColumn',
] as const;

const COLUMN_WIDTH_KEYS = [
  'firstColumnWidth',
  'secondColumnWidth',
  'thirdColumnWidth',
  'fourthColumnWidth',
  'fifthColumnWidth',
] as const;

type ColumnWidthKey = typeof COLUMN_WIDTH_KEYS[number];
const COL_RESIZE_HANDLE_WIDTH = 0.004;
const MIN_COLUMN_WIDTH_PX = 50;
const ARTICLE_DESIGN_WIDTH = 1440;
const MIN_COLUMN_WIDTH = MIN_COLUMN_WIDTH_PX / ARTICLE_DESIGN_WIDTH;

function getColumnMaxWidth(
  columnIndex: number,
  columns: ListItemColumn[],
  wrapperWidth: number,
): number {
  const otherFixedColumnsWidth = columns.reduce(
    (sum, column, index) => {
      if (index === columnIndex || index === columns.length - 1) return sum;
      return sum + column.width;
    },
    0,
  );
  return Math.max(MIN_COLUMN_WIDTH, wrapperWidth - otherFixedColumnsWidth - MIN_COLUMN_WIDTH);
}

const DEFAULT_COLUMN_WIDTHS: Record<ColumnWidthKey, number> = {
  firstColumnWidth: 0.02,
  secondColumnWidth: 0.02,
  thirdColumnWidth: 0.02,
  fourthColumnWidth: 0.02,
  fifthColumnWidth: 0.02,
};

type ListContentItem = {
  firstColumn?: string;
  secondColumn?: string;
  thirdColumn?: string;
  fourthColumn?: string;
  fifthColumn?: string;
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
};

type ListProps = {
  layoutId?: string;
  settings: ListSettings;
  content?: ListContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: ListSettings) => void;
} & CommonComponentProps;

export function List({ settings, content, isEditor, isPreviewMode, metadata, activeEvent, layoutId }: ListProps) {
  const { prefix: P } = useScopedStyles();
  const {
    columns,
    wrapperWidth,
    entriesCount,
    cellMinHeight,
    dividerWidth,
    cut,
    imageSize,
    imageOnHover,
    entryHoverEffect,
    firstColumnWidth,
    secondColumnWidth,
    thirdColumnWidth,
    fourthColumnWidth,
    fifthColumnWidth,
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

  const resolvedTextTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: textFontFamily,
      fontWeight: textFontSettings?.fontWeight ?? 400,
      fontStyle: textFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: textFontSize ?? 0.01,
    lineHeight: textLineHeight,
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

  const columnWidthByKey: Record<ColumnWidthKey, number> = {
    firstColumnWidth: firstColumnWidth ?? DEFAULT_COLUMN_WIDTHS.firstColumnWidth,
    secondColumnWidth: secondColumnWidth ?? DEFAULT_COLUMN_WIDTHS.secondColumnWidth,
    thirdColumnWidth: thirdColumnWidth ?? DEFAULT_COLUMN_WIDTHS.thirdColumnWidth,
    fourthColumnWidth: fourthColumnWidth ?? DEFAULT_COLUMN_WIDTHS.fourthColumnWidth,
    fifthColumnWidth: fifthColumnWidth ?? DEFAULT_COLUMN_WIDTHS.fifthColumnWidth,
  };

  const listColumns: ListItemColumn[] = useMemo(
    () =>
      COLUMN_CONTENT_KEYS.slice(0, columns).map((key, index) => ({
        key,
        widthKey: COLUMN_WIDTH_KEYS[index],
        width: columnWidthByKey[COLUMN_WIDTH_KEYS[index]],
      })),
    [
      columns,
      firstColumnWidth,
      secondColumnWidth,
      thirdColumnWidth,
      fourthColumnWidth,
      fifthColumnWidth,
    ]
  );

  const resolvedRows: ListItemRow[] = useMemo(() => {
    const resEntriesCount = entriesCount === 0 ? Infinity : entriesCount;
    const items = (content ?? []).slice(0, resEntriesCount);

    return items.map((item, index) => ({
      id: index,
      cells: Object.fromEntries(
        COLUMN_CONTENT_KEYS.map((key) => [key, item[key] ?? ''])
      ),
    }));
  }, [content, entriesCount]);

  const scaled = (v: number) => scalingValue(v, isEditor ?? false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <div style={colorVars}>
        <div
          ref={containerRef}
          className={`${P}-wrapper ${wrapperStateClasses}`.trim()}
          style={{
            width: scalingValue(wrapperWidth ?? 0, isEditor)
          }}
        >
          <div style={{ width: '100%' }}>
            {resolvedRows.map((row, rowIdx) => (
              <div
                key={row.id}
                className={`${P}-list-item`}
                style={{
                  minHeight: scaled(cellMinHeight ?? 0),
                  borderBottomWidth: scalingValue(dividerWidth ?? 0, isEditor),
                  ...(rowIdx === 0 ? { borderTopWidth: scalingValue(dividerWidth ?? 0, isEditor) } : {}),
                }}
              >
                {listColumns.map((col, colIndex) => {
                  const isLastColumn = colIndex === listColumns.length - 1;
                  const resolvedWrapperWidth = wrapperWidth ?? 1;
                  const maxColumnWidth = getColumnMaxWidth(colIndex, listColumns, resolvedWrapperWidth);
                  const columnWidth = Math.min(Math.max(col.width, MIN_COLUMN_WIDTH), maxColumnWidth);
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
            ))}
          </div>
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
  entryHoverEffect: 'None' | 'Default' | 'Blinds';
  firstColumnWidth: number;
  secondColumnWidth: number;
  thirdColumnWidth: number;
  fourthColumnWidth: number;
  fifthColumnWidth: number;
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
