import type { CSSProperties } from 'react';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { LayoutItem, LayoutTab } from '../../types/SchemaV1';

type JournalImage = {
  url: string;
  name?: string;
  objectFit?: 'cover' | 'contain';
};

type JournalEntry = {
  title1: string;
  title2: string;
  title3: string;
  image: JournalImage[];
};

type JournalSettings = {
  title1Color: string;
  title2Color: string;
  title3Color: string;
  countColor: string;
} & Record<string, unknown>;

export const STRIP_NAV_SWIPE_MIN_PX = 50;
export const STRIP_NAV_TAP_MAX_PX = 10;

const JOURNAL_URL_PARAM_PREFIX = 'cntrl-lightbox-journal';
const LEGACY_JOURNAL_URL_PARAM_KEY = JOURNAL_URL_PARAM_PREFIX;
const LEGACY_JOURNAL_URL_PARAM_PREFIX = `${JOURNAL_URL_PARAM_PREFIX}-`;

const getJournalUrlParamKey = (itemId: string) => `${JOURNAL_URL_PARAM_PREFIX}-${itemId}`;

const isJournalUrlParamKey = (key: string) =>
  key === LEGACY_JOURNAL_URL_PARAM_KEY || key.startsWith(LEGACY_JOURNAL_URL_PARAM_PREFIX);

const parseJournalSlideNumber = (value: string | null) => {
  if (!value) return null;
  const slideNumber = Number.parseInt(value, 10);
  if (Number.isFinite(slideNumber) && slideNumber >= 1) {
    return slideNumber;
  }
  return null;
};

export const findJournalUrlSlideNumber = (itemId?: string | null): number | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (itemId) {
    const slideNumber = parseJournalSlideNumber(params.get(getJournalUrlParamKey(itemId)));
    if (slideNumber) return slideNumber;
  }
  const legacySlideNumber = parseJournalSlideNumber(params.get(LEGACY_JOURNAL_URL_PARAM_KEY));
  if (legacySlideNumber) return legacySlideNumber;
  for (const [key] of params) {
    if (!key.startsWith(LEGACY_JOURNAL_URL_PARAM_PREFIX)) continue;
    const suffix = key.slice(LEGACY_JOURNAL_URL_PARAM_PREFIX.length);
    if (!/^\d+$/.test(suffix)) continue;
    const slideNumber = Number.parseInt(suffix, 10);
    if (Number.isFinite(slideNumber) && slideNumber >= 1) {
      return slideNumber;
    }
  }
  return null;
};

export const slideNumberToIndex = (slideNumber: number, slideCount: number) => {
  if (slideCount <= 0) return -1;
  const slideIndex = slideNumber - 1;
  if (slideIndex < 0 || slideIndex >= slideCount) return -1;
  return slideIndex;
};

export const setJournalUrlParam = (slideNumber: number, itemId?: string | null, replace = true) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  [...url.searchParams.keys()].forEach((key) => {
    if (isJournalUrlParamKey(key)) {
      url.searchParams.delete(key);
    }
  });
  if (itemId) {
    url.searchParams.set(getJournalUrlParamKey(itemId), String(slideNumber));
  } else {
    url.searchParams.set(LEGACY_JOURNAL_URL_PARAM_KEY, String(slideNumber));
  }
  const historyMethod = replace ? 'replaceState' : 'pushState';
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history[historyMethod](window.history.state, '', nextUrl);
};

const clearJournalUrlParam = (itemId?: string | null) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const keysToDelete = [...url.searchParams.keys()].filter((key) => (
    itemId
      ? key === getJournalUrlParamKey(itemId) || key === LEGACY_JOURNAL_URL_PARAM_KEY
      : isJournalUrlParamKey(key)
  ));
  keysToDelete.forEach((key) => url.searchParams.delete(key));
  if (keysToDelete.length > 0) {
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }
};

export const hasJournalUrlParam = (itemId?: string | null) => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (itemId) {
    return params.has(getJournalUrlParamKey(itemId));
  }
  return [...params.keys()].some((key) => isJournalUrlParamKey(key));
};

export const removeJournalUrlParam = (didPushHistory: boolean, itemId?: string | null) => {
  if (!hasJournalUrlParam(itemId)) return;
  if (didPushHistory) {
    window.history.back();
    return;
  }
  clearJournalUrlParam(itemId);
};

const GAP_LABEL_AREA_PX = 20;
const MAX_IMAGES_PER_ENTRY = 2;

type JournalSlide = {
  entry: JournalEntry;
  entryIndex: number;
  images: JournalImage[];
};

export const getGapControlSize = (gap: string) => `max(${gap}, ${GAP_LABEL_AREA_PX}px)`;

export const getEntryImages = (entry: JournalEntry | undefined): JournalImage[] =>
  (entry?.image ?? []).slice(0, MAX_IMAGES_PER_ENTRY);

const getTotalImageCount = (entries: JournalEntry[]) =>
  entries.reduce((sum, entry) => sum + getEntryImages(entry).length, 0);

const getEntryImageRange = (entries: JournalEntry[], entryIndex: number) => {
  const start = entries.slice(0, entryIndex).reduce(
    (sum, entry) => sum + getEntryImages(entry).length,
    1,
  );
  const imageCount = getEntryImages(entries[entryIndex]).length;
  return { start, end: start + imageCount - 1 };
};

const formatImageCounter = (entries: JournalEntry[], activeEntryIndex: number) => {
  const totalImages = getTotalImageCount(entries);
  const { start, end } = getEntryImageRange(entries, activeEntryIndex);
  if (start === end) {
    return `${start} / ${totalImages}`;
  }
  return `${start}-${end} / ${totalImages}`;
};

export const buildJournalSlides = (entries: JournalEntry[], journalType: 'A' | 'B'): JournalSlide[] => {
  if (journalType === 'B') {
    return entries.flatMap((entry, entryIndex) =>
      getEntryImages(entry).map((image) => ({
        entry,
        entryIndex,
        images: [image],
      })),
    );
  }
  return entries.map((entry, entryIndex) => ({
    entry,
    entryIndex,
    images: getEntryImages(entry),
  }));
};

export const formatSlideCounter = (
  slides: JournalSlide[],
  activeSlideIndex: number,
  journalType: 'A' | 'B',
  entries: JournalEntry[],
) => {
  if (journalType === 'B') {
    return `${activeSlideIndex + 1} / ${slides.length}`;
  }
  const activeEntryIndex = slides[activeSlideIndex]?.entryIndex ?? 0;
  return formatImageCounter(entries, activeEntryIndex);
};

export const getEntryTitleKey = (entry: JournalEntry | undefined) =>
  entry ? `${entry.title1 ?? ''}|${entry.title2 ?? ''}|${entry.title3 ?? ''}` : '';

export const shouldShowCounter = (
  journalType: 'A' | 'B',
  slides: JournalSlide[],
  entries: JournalEntry[],
) => (journalType === 'B' ? slides.length > 1 : getTotalImageCount(entries) > 1);

type JournalTitleWidthKey = 'title1Width' | 'title2Width' | 'title3Width';

export const TITLE_RESIZE_HANDLE_WIDTH = 0.004;
export const TITLE_PADDING_HANDLE_WIDTH = 0.004;

export const DEFAULT_JOURNAL_TITLE_WIDTHS: Record<JournalTitleWidthKey, number> = {
  title1Width: 0.13,
  title2Width: 0.13,
  title3Width: 0.14,
};

export type JournalTitleSlot = {
  prefix: 'title1' | 'title2' | 'title3';
  widthKey: JournalTitleWidthKey;
  marginLeftKey?: 'title2MarginLeft' | 'title3MarginLeft';
  className: string;
  style: CSSProperties;
  text: string;
};

export const buildJournalTitleSlots = (
  prefix: string,
  entry: JournalEntry,
  title1Style: CSSProperties,
  title2Style: CSSProperties,
  title3Style: CSSProperties,
): JournalTitleSlot[] => {
  const slots: JournalTitleSlot[] = [];

  if (entry.title1) {
    slots.push({
      prefix: 'title1',
      widthKey: 'title1Width',
      className: `${prefix}-title1`,
      style: title1Style,
      text: entry.title1,
    });
  }
  if (entry.title2) {
    slots.push({
      prefix: 'title2',
      widthKey: 'title2Width',
      marginLeftKey: 'title2MarginLeft',
      className: `${prefix}-title2`,
      style: title2Style,
      text: entry.title2,
    });
  }
  if (entry.title3) {
    slots.push({
      prefix: 'title3',
      widthKey: 'title3Width',
      marginLeftKey: 'title3MarginLeft',
      className: `${prefix}-title3`,
      style: title3Style,
      text: entry.title3,
    });
  }

  return slots;
};

export const resolveJournalTitleWidths = (
  count: number,
  storedWidths: number[],
): number[] => {
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

export const getEffectiveJournalTitleWidths = (
  count: number,
  storedWidths: number[],
): number[] => resolveJournalTitleWidths(count, storedWidths);

export const getJournalTitleMaxWidth = (
  columnIndex: number,
  resolvedWidths: number[],
): number => {
  const otherWidths = resolvedWidths
    .filter((_, index) => index !== columnIndex)
    .reduce((sum, width) => sum + width, 0);
  return Math.max(1 - otherWidths, 0);
};

export const getRowScopedJournalTitleWidths = (
  slots: JournalTitleSlot[],
  widthByKey: Record<JournalTitleWidthKey, number>,
): { resolved: number[]; effective: number[] } => {
  const stored = slots.map((slot) => widthByKey[slot.widthKey] ?? 0);
  return {
    resolved: resolveJournalTitleWidths(slots.length, stored),
    effective: getEffectiveJournalTitleWidths(slots.length, stored),
  };
};

export const getJournalTitleOffsetBeforeSlot = (
  slots: JournalTitleSlot[],
  resolvedWidths: number[],
  marginByKey: Record<'title2MarginLeft' | 'title3MarginLeft', number>,
  slotIndex: number,
): number => slots.slice(0, slotIndex).reduce(
  (offset, slot, index) => offset
    + (slot?.marginLeftKey ? marginByKey[slot.marginLeftKey] ?? 0 : 0)
    + (resolvedWidths[index] ?? 0),
  0,
);

export const getJournalTitleBoundaryOffset = (
  slots: JournalTitleSlot[],
  resolvedWidths: number[],
  marginByKey: Record<'title2MarginLeft' | 'title3MarginLeft', number>,
  upToIndex: number,
): number => slots.slice(0, upToIndex + 1).reduce(
  (offset, slot, index) => offset
    + (slot?.marginLeftKey ? marginByKey[slot.marginLeftKey] ?? 0 : 0)
    + (resolvedWidths[index] ?? 0),
  0,
);

export const JOURNAL_TEXT_STYLE_PREFIXES = ['title1', 'title2', 'title3', 'count'] as const;
export type JournalTextStylePrefix = typeof JOURNAL_TEXT_STYLE_PREFIXES[number];

export const JOURNAL_GLOBAL_TEXT_STYLE_KEYS = [
  'fontFamily',
  'fontSettings',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textAlign',
  'textAppearance',
] as const;

export type JournalGlobalTextStyleKey = typeof JOURNAL_GLOBAL_TEXT_STYLE_KEYS[number];

export const getJournalTextStyleSettingKey = (
  prefix: JournalTextStylePrefix,
  globalKey: JournalGlobalTextStyleKey,
): string => `${prefix}${globalKey.charAt(0).toUpperCase()}${globalKey.slice(1)}`;

export const JOURNAL_TEXT_STYLE_TAB_LABELS: Record<JournalTextStylePrefix, string> = {
  title1: '1',
  title2: '2',
  title3: '3',
  count: 'Count',
};

export const createJournalTextStyleTabContentItems = (prefix: JournalTextStylePrefix): LayoutItem[] => [
  getJournalTextStyleSettingKey(prefix, 'fontFamily'),
  getJournalTextStyleSettingKey(prefix, 'fontSettings'),
  {
    type: 'row',
    items: [
      getJournalTextStyleSettingKey(prefix, 'fontSize'),
      getJournalTextStyleSettingKey(prefix, 'lineHeight'),
      getJournalTextStyleSettingKey(prefix, 'letterSpacing'),
      getJournalTextStyleSettingKey(prefix, 'wordSpacing'),
    ],
  },
  getJournalTextStyleSettingKey(prefix, 'textAlign'),
  getJournalTextStyleSettingKey(prefix, 'textAppearance'),
];

export const createJournalTextStylePanelTab = (): LayoutTab => ({
  type: 'tab',
  id: 'journalTextStyle',
  tabs: Object.fromEntries(
    JOURNAL_TEXT_STYLE_PREFIXES.map((prefix) => [
      JOURNAL_TEXT_STYLE_TAB_LABELS[prefix],
      createJournalTextStyleTabContentItems(prefix),
    ]),
  ),
});

type JournalTextStyleFields = {
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

type ResolvedJournalTextFields = {
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

const JOURNAL_TEXT_STYLE_COLOR_KEYS: Record<JournalTextStylePrefix, keyof JournalSettings> = {
  title1: 'title1Color',
  title2: 'title2Color',
  title3: 'title3Color',
  count: 'countColor',
};

const JOURNAL_TEXT_STYLE_DEFAULT_FONT_SIZES: Record<JournalTextStylePrefix, number> = {
  title1: 0.02,
  title2: 0.02,
  title3: 0.02,
  count: 0.017,
};

export const resolveJournalTextFields = (
  settings: JournalSettings,
  prefix: JournalTextStylePrefix,
): ResolvedJournalTextFields => {
  const read = <K extends JournalGlobalTextStyleKey>(globalKey: K) => {
    const settingKey = getJournalTextStyleSettingKey(prefix, globalKey);
    return settings[settingKey] as JournalTextStyleFields[K] | undefined;
  };

  return {
    fontFamily: (read('fontFamily') as string | undefined) ?? 'Arial',
    fontSettings: (read('fontSettings') as JournalTextStyleFields['fontSettings']) ?? {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    fontSize: read('fontSize') as number | undefined,
    lineHeight: read('lineHeight') as number | undefined,
    letterSpacing: (read('letterSpacing') as number | undefined) ?? 0,
    wordSpacing: (read('wordSpacing') as number | undefined) ?? 0,
    textAlign: (read('textAlign') as JournalTextStyleFields['textAlign']) ?? 'left',
    textAppearance: read('textAppearance') as JournalTextStyleFields['textAppearance'],
    color: settings[JOURNAL_TEXT_STYLE_COLOR_KEYS[prefix]] as string | undefined,
  };
};

export const journalTextFieldsToCss = (
  prefix: JournalTextStylePrefix,
  fields: ResolvedJournalTextFields,
  isEditor?: boolean,
): CSSProperties => {
  const resolvedTextStyle: TextStyles = {
    fontSettings: {
      fontFamily: fields.fontFamily,
      fontWeight: fields.fontSettings?.fontWeight ?? 400,
      fontStyle: fields.fontSettings?.fontStyle ?? 'normal',
    },
    fontSize: fields.fontSize ?? JOURNAL_TEXT_STYLE_DEFAULT_FONT_SIZES[prefix],
    lineHeight: fields.lineHeight,
    letterSpacing: fields.letterSpacing,
    wordSpacing: fields.wordSpacing,
    textAlign: fields.textAlign,
    textAppearance: fields.textAppearance,
    color: fields.color ?? '#ffffff',
  };

  return textStylesToCss(resolvedTextStyle, isEditor);
};
