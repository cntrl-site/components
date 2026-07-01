import type { CSSProperties } from 'react';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { LayoutItem, LayoutTab } from '../../types/SchemaV1';
import type {
  LightboxStripItem,
  LightboxStripSettings,
  SharedStripTitles,
} from './LightboxStrip';

export const LIGHTBOX_ANIM_MS = 300;
export const SNAP_SCROLL_MIN_MS = 900;
export const SNAP_SCROLL_MAX_MS = 1500;
export const SNAP_SCROLL_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const CONTROLS_IDLE_MS = 3000;
export const THUMB_MAX_SIZE_PX = 50;
export const WHEEL_SPEED = 2;
export const WHEEL_LINE_HEIGHT_PX = 16;
export const WHEEL_LERP = 0.05;
export const MOUSE_DRAG_THRESHOLD_PX = 1;
export const DRAG_SNAP_RATIO = 0.15;
export const GAP_LABEL_AREA_PX = 20;
export const TITLE_RESIZE_HANDLE_WIDTH = 0.004;

export const STRIP_TEXT_STYLE_PREFIXES = ['title1', 'title2', 'title3'] as const;
export type StripTextStylePrefix = typeof STRIP_TEXT_STYLE_PREFIXES[number];

export const STRIP_GLOBAL_TEXT_STYLE_KEYS = [
  'fontFamily',
  'fontSettings',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textAlign',
  'textAppearance',
] as const;

export type StripGlobalTextStyleKey = typeof STRIP_GLOBAL_TEXT_STYLE_KEYS[number];

export const STRIP_TEXT_STYLE_TAB_LABELS: Record<StripTextStylePrefix, string> = {
  title1: '1',
  title2: '2',
  title3: '3',
};

export const STRIP_TITLE_WIDTH_KEYS = ['title1Width', 'title2Width', 'title3Width'] as const;
export type StripTitleWidthKey = typeof STRIP_TITLE_WIDTH_KEYS[number];

type LightboxStripLegacyItem = LightboxStripItem & {
  text?: Array<{
    type?: string;
    children?: Array<{ text?: string }>;
  }>;
};

type StripTextStyleFields = {
  fontFamily?: string;
  fontSettings?: { fontWeight: number; fontStyle: string };
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textAppearance?: TextStyles['textAppearance'];
  color?: string;
};

type ResolvedStripTextFields = {
  fontFamily: string;
  fontSettings: { fontWeight: number; fontStyle: string };
  fontSize?: number;
  lineHeight?: number;
  letterSpacing: number;
  wordSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textAppearance?: TextStyles['textAppearance'];
  color?: string;
};

const STRIP_TEXT_STYLE_COLOR_KEYS: Record<StripTextStylePrefix, keyof LightboxStripSettings> = {
  title1: 'title1Color',
  title2: 'title2Color',
  title3: 'title3Color',
};

const STRIP_TEXT_STYLE_DEFAULT_FONT_SIZES: Record<StripTextStylePrefix, number> = {
  title1: 0.02,
  title2: 0.02,
  title3: 0.02,
};

export type StripTitleSlot = {
  prefix: StripTextStylePrefix;
  widthKey: StripTitleWidthKey;
  marginLeftKey?: 'title1MarginLeft' | 'title2MarginLeft' | 'title3MarginLeft';
  className: string;
  style: CSSProperties;
  text: string;
};

export const getGapControlSize = (gap: string) => `max(${gap}, ${GAP_LABEL_AREA_PX}px)`;

export const extractTitlesFromLegacyText = (
  text: LightboxStripLegacyItem['text'],
): Partial<SharedStripTitles> => {
  if (!Array.isArray(text) || text.length === 0) return {};

  const paragraph = text.find((node) => node?.type === 'paragraph') ?? text[0];
  const children = paragraph?.children;
  if (!Array.isArray(children)) return {};

  const values = children
    .map((child) => (typeof child?.text === 'string' ? child.text.trim() : ''))
    .filter(Boolean);

  return {
    title1: values[0],
    title2: values[1],
    title3: values[2],
  };
};

export const resolveSharedStripTitles = (items: LightboxStripLegacyItem[]): SharedStripTitles => {
  for (const item of items) {
    if (item.title1 || item.title2 || item.title3) {
      return {
        title1: item.title1 ?? '',
        title2: item.title2 ?? '',
        title3: item.title3 ?? '',
      };
    }
  }

  for (const item of items) {
    const fromText = extractTitlesFromLegacyText(item.text);
    if (fromText.title1 || fromText.title2 || fromText.title3) {
      return {
        title1: fromText.title1 ?? '',
        title2: fromText.title2 ?? '',
        title3: fromText.title3 ?? '',
      };
    }
  }

  return { title1: '', title2: '', title3: '' };
};

export const getStripTextStyleSettingKey = (
  prefix: StripTextStylePrefix,
  globalKey: StripGlobalTextStyleKey,
): string => {
  return `${prefix}${globalKey.charAt(0).toUpperCase()}${globalKey.slice(1)}`;
};

export const createStripTextStyleTabContentItems = (prefix: StripTextStylePrefix): LayoutItem[] => {
  return [
    getStripTextStyleSettingKey(prefix, 'fontFamily'),
    getStripTextStyleSettingKey(prefix, 'fontSettings'),
    {
      type: 'row',
      items: [
        getStripTextStyleSettingKey(prefix, 'fontSize'),
        getStripTextStyleSettingKey(prefix, 'lineHeight'),
        getStripTextStyleSettingKey(prefix, 'letterSpacing'),
        getStripTextStyleSettingKey(prefix, 'wordSpacing'),
      ],
    },
    getStripTextStyleSettingKey(prefix, 'textAlign'),
    getStripTextStyleSettingKey(prefix, 'textAppearance'),
  ];
};

export const createStripTextStylePanelTab = (): LayoutTab => {
  return {
    type: 'tab',
    id: 'stripTextStyle',
    tabs: Object.fromEntries(
      STRIP_TEXT_STYLE_PREFIXES.map((prefix) => [
        STRIP_TEXT_STYLE_TAB_LABELS[prefix],
        createStripTextStyleTabContentItems(prefix),
      ]),
    ),
  };
};

export const resolveStripTitleWidths = (count: number, storedWidths: number[]): number[] => {
  if (count <= 0) {
    return [];
  }

  const widths = storedWidths.slice(0, count);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  if (totalWidth <= 1) {
    return widths;
  }

  const { widths: shrunkWidths } = [...widths].reverse().reduce<{
    overflow: number;
    widths: number[];
  }>(
    ({ overflow, widths: acc }, width) => {
      if (overflow <= 0 || width <= 0) {
        return { overflow, widths: [width, ...acc] };
      }

      const shrinkAmount = Math.min(overflow, width);
      return {
        overflow: overflow - shrinkAmount,
        widths: [width - shrinkAmount, ...acc],
      };
    },
    { overflow: totalWidth - 1, widths: [] },
  );

  return shrunkWidths;
};

export const getEffectiveStripTitleWidths = (count: number, storedWidths: number[]): number[] => {
  return resolveStripTitleWidths(count, storedWidths);
};

export const getStripTitleMaxWidth = (columnIndex: number, resolvedWidths: number[]): number => {
  const otherWidths = resolvedWidths
    .filter((_, index) => index !== columnIndex)
    .reduce((sum, width) => sum + width, 0);

  return Math.max(1 - otherWidths, 0);
};

export const getRowScopedStripTitleWidths = (
  slots: StripTitleSlot[],
  widthByKey: Record<StripTitleWidthKey, number>,
): { resolved: number[]; effective: number[] } => {
  const stored = slots.map((slot) => widthByKey[slot.widthKey] ?? 0);
  return {
    resolved: resolveStripTitleWidths(slots.length, stored),
    effective: getEffectiveStripTitleWidths(slots.length, stored),
  };
};

export const buildStripTitleSlots = (
  prefix: string,
  title1: string,
  title2: string,
  title3: string,
  title1Style: CSSProperties,
  title2Style: CSSProperties,
  title3Style: CSSProperties,
): StripTitleSlot[] => {
  const slots: StripTitleSlot[] = [];

  if (title1) {
    slots.push({
      prefix: 'title1',
      widthKey: 'title1Width',
      className: `${prefix}-title1`,
      style: title1Style,
      text: title1,
    });
  }
  if (title2) {
    slots.push({
      prefix: 'title2',
      widthKey: 'title2Width',
      marginLeftKey: 'title2MarginLeft',
      className: `${prefix}-title2`,
      style: title2Style,
      text: title2,
    });
  }
  if (title3) {
    slots.push({
      prefix: 'title3',
      widthKey: 'title3Width',
      marginLeftKey: 'title3MarginLeft',
      className: `${prefix}-title3`,
      style: title3Style,
      text: title3,
    });
  }

  return slots;
};

export const resolveStripTextFields = (
  settings: LightboxStripSettings,
  prefix: StripTextStylePrefix,
): ResolvedStripTextFields => {
  const read = <K extends StripGlobalTextStyleKey>(globalKey: K) => {
    const settingKey = getStripTextStyleSettingKey(prefix, globalKey);
    return settings[settingKey as keyof LightboxStripSettings] as StripTextStyleFields[K] | undefined;
  };

  return {
    fontFamily: (read('fontFamily') as string | undefined) ?? 'Arial',
    fontSettings: (read('fontSettings') as StripTextStyleFields['fontSettings']) ?? {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    fontSize: read('fontSize') as number | undefined,
    lineHeight: read('lineHeight') as number | undefined,
    letterSpacing: (read('letterSpacing') as number | undefined) ?? 0,
    wordSpacing: (read('wordSpacing') as number | undefined) ?? 0,
    textAlign: (read('textAlign') as StripTextStyleFields['textAlign']) ?? 'left',
    textAppearance: read('textAppearance') as StripTextStyleFields['textAppearance'],
    color: settings[STRIP_TEXT_STYLE_COLOR_KEYS[prefix]] as string | undefined,
  };
};

export const getStripTitleOffsetBeforeSlot = (
  slots: StripTitleSlot[],
  resolvedWidths: number[],
  marginByKey: Record<'title1MarginLeft' | 'title2MarginLeft' | 'title3MarginLeft', number>,
  slotIndex: number,
): number => {
  return slots.slice(0, slotIndex).reduce(
    (offset, slot, index) => offset
      + (slot?.marginLeftKey ? marginByKey[slot.marginLeftKey] ?? 0 : 0)
      + (resolvedWidths[index] ?? 0),
    0,
  );
};

export const stripTextFieldsToCss = (
  prefix: StripTextStylePrefix,
  fields: ReturnType<typeof resolveStripTextFields>,
  isEditor?: boolean,
): CSSProperties => {
  const resolvedTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: fields.fontFamily,
      fontWeight: fields.fontSettings?.fontWeight ?? 400,
      fontStyle: fields.fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fields.fontSize ?? STRIP_TEXT_STYLE_DEFAULT_FONT_SIZES[prefix],
    lineHeight: fields.lineHeight,
    letterSpacing: fields.letterSpacing,
    wordSpacing: fields.wordSpacing,
    textAlign: fields.textAlign,
    textAppearance: fields.textAppearance,
    color: fields.color ?? '#ffffff',
  };

  return textStylesToCss(resolvedTextStyle, isEditor);
};
