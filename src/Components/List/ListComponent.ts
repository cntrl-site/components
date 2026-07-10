import {
  COLUMN_CONTENT_KEYS,
  COLUMN_TEXT_PREFIXES,
  CUT_LABEL_TEXT_PREFIX,
  COLUMN_VALIGN_BASIC_OPTIONS,
  createListTextStylePanelTab,
  getListColumnTextSettingKey,
  LIST_TEXT_STYLE_PREFIXES,
  List,
  applyListColumnCountChange,
  normalizeListColumnVerticalAlign,
  type ListSettings,
  type ListTextStylePrefix,
} from './List';
import { ComponentSchemaV1, SchemaDisplayRule, SchemaProperty } from '../../types/SchemaV1';
import formSourceRaw from './List.tsx?raw';

type ListFontSettings = { fontWeight: number; fontStyle: string };

type ListTextAppearanceSettings = {
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration: 'none' | 'underline';
  fontVariant: 'normal' | 'small-caps';
};

type ListSchemaDefaultValue =
  | string
  | number
  | boolean
  | string[]
  | ListFontSettings
  | ListTextAppearanceSettings;

type ListColumnLayoutDefaults = {
  columns: number;
  wrapperWidth: number;
  columnsOrder: string[];
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
};

type ListTypeBPaddingDefaults = {
  rowPaddingTopB?: number;
  AColumnPaddingBottom?: number;
  BColumnPaddingBottom?: number;
  CColumnPaddingBottom?: number;
  DColumnPaddingBottom?: number;
  EColumnPaddingBottom?: number;
};

type ListColumnLayoutDefaultsOverrides = {
  columns?: number;
  wrapperWidth?: number;
  columnsOrder?: string[];
  AColumnWidth?: number;
  AColumnPaddingLeft?: number;
  AColumnPaddingRight?: number;
  AColumnPaddingBottom?: number;
  BColumnWidth?: number;
  BColumnPaddingLeft?: number;
  BColumnPaddingRight?: number;
  BColumnPaddingBottom?: number;
  CColumnWidth?: number;
  CColumnPaddingLeft?: number;
  CColumnPaddingRight?: number;
  CColumnPaddingBottom?: number;
  DColumnWidth?: number;
  DColumnPaddingLeft?: number;
  DColumnPaddingRight?: number;
  DColumnPaddingBottom?: number;
  EColumnWidth?: number;
  EColumnPaddingLeft?: number;
  EColumnPaddingRight?: number;
  EColumnPaddingBottom?: number;
  type?: 'a' | 'b';
  textPaddingLR?: number;
  entriesCount?: number;
  cellMinHeight?: number;
  imageSize?: { min: number; max: number };
  dividerWidth?: number;
  cut?: number;
  showCut?: number;
  cutCellMinHeight?: number;
  rowPaddingTop?: number;
  rowPaddingBottom?: number;
  rowPaddingTopB?: number;
  textStroke?: number;
  textCorners?: number;
  textPadding?: { top: number; right: number; bottom: number; left: number };
  typeBDefaults?: ListTypeBPaddingDefaults;
};

type ListColumnTextSettings = {
  verticalAlign?: string;
  textFontFamily?: string;
  textFontSettings?: ListFontSettings;
  textFontSize?: number;
  textLineHeight?: number;
  textLetterSpacing?: number;
  textWordSpacing?: number;
  textTextAlign?: 'left' | 'center' | 'right' | 'justify';
  textTextAppearance?: ListTextAppearanceSettings;
};

type ListColumnTextDefaultsInput = {
  default?: ListColumnTextSettings;
  byPrefix?: Partial<Record<ListTextStylePrefix, ListColumnTextSettings>>;
};

const LIST_COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

const COLUMN_VALIGN_OPTIONS = [
  ...COLUMN_VALIGN_BASIC_OPTIONS,
  'Baseline A',
  'Baseline B',
  'Baseline C',
  'Baseline D',
  'Baseline E',
] as const;

const textStyleProperties = {
  fontSettings: {
    type: 'object' as const,
    display: { type: 'font-settings-weight' },
    properties: {
      fontWeight: { type: 'number' as const },
      fontStyle: { type: 'string' as const },
    },
  },
  fontSize: {
    type: 'number' as const,
    display: { type: 'font-size' },
  },
  lineHeight: {
    type: 'number' as const,
    display: { type: 'line-height-input' },
  },
  letterSpacing: {
    type: 'number' as const,
    display: { type: 'letter-spacing-input' },
  },
  wordSpacing: {
    type: 'number' as const,
    display: { type: 'word-spacing-input' },
  },
  textAlign: {
    type: 'string' as const,
    enum: ['left', 'center', 'right', 'justify'],
    display: { type: 'vertical-text-aligh-options' },
  },
  textAppearance: {
    type: 'object' as const,
    display: { type: 'text-appearance' },
    properties: {
      textTransform: { type: 'string' as const, enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
      textDecoration: { type: 'string' as const, enum: ['none', 'underline'] },
      fontVariant: { type: 'string' as const, enum: ['normal', 'small-caps'] },
    },
  },
};

function createTextInputContentProperty(label: string) {
  return {
    type: 'string' as const,
    label,
    placeholder: 'Add Title...',
    display: { type: 'text-input' as const },
  };
}

function createRangeControlLayoutProperty(title: string) {
  return {
    type: 'number' as const,
    scope: 'layout' as const,
    title,
    min: 0,
    max: 100,
    display: { type: 'range-control' as const },
  };
}

function createContentColumnProperties(): Record<string, SchemaProperty> {
  return Object.fromEntries(
    LIST_COLUMN_LETTERS.map((letter, index) => {
      const key = COLUMN_CONTENT_KEYS[index];
      const label = `${letter} column`;
      return [key, createTextInputContentProperty(label)];
    }),
  );
}

function createColumnLayoutSchemaProperties(): Record<string, SchemaProperty> {
  const properties: Record<string, SchemaProperty> = {};

  for (const letter of LIST_COLUMN_LETTERS) {
    properties[`${letter}ColumnWidth`] = createRangeControlLayoutProperty(`${letter} column width`);
    properties[`${letter}ColumnPaddingLeft`] = createRangeControlLayoutProperty(`${letter} column padding left`);
    properties[`${letter}ColumnPaddingRight`] = createRangeControlLayoutProperty(`${letter} column padding right`);
    properties[`${letter}ColumnPaddingBottom`] = createRangeControlLayoutProperty(`${letter} column padding bottom`);
  }

  return properties;
}

function createColumnLayoutDefaults(
  overrides: ListColumnLayoutDefaultsOverrides = {}
): ListColumnLayoutDefaults & Omit<ListColumnLayoutDefaultsOverrides, 'typeBDefaults'> {
  const { typeBDefaults, ...restOverrides } = overrides;

  const defaults = {
    wrapperWidth: 1,
    columnsOrder: [...COLUMN_CONTENT_KEYS],
  } as ListColumnLayoutDefaults;

  for (const letter of LIST_COLUMN_LETTERS) {
    defaults[`${letter}ColumnWidth`] = letter === "A" ? 0.0798 : 0.32;
    defaults[`${letter}ColumnPaddingLeft`] = 0;
    defaults[`${letter}ColumnPaddingRight`] = 0;
    defaults[`${letter}ColumnPaddingBottom`] = 0;
  }

  const typeBApplied: ListTypeBPaddingDefaults =
    restOverrides.type === 'b' && typeBDefaults ? typeBDefaults : {};

  return { ...defaults, ...typeBApplied, ...restOverrides };
}

function createTextStyleProperties(prefix: ListTextStylePrefix): Record<string, SchemaProperty> {
  const properties: Record<string, SchemaProperty> = {};

  if (prefix === CUT_LABEL_TEXT_PREFIX) {
    properties[`${prefix}VerticalAlign`] = {
      type: 'string',
      scope: 'layout',
      title: '',
      display: {
        type: 'drop-down',
        label: 'Vertical alignment',
        enum: [...COLUMN_VALIGN_BASIC_OPTIONS],
      },
      enum: [...COLUMN_VALIGN_BASIC_OPTIONS],
    };
  } else {
    const columnLetter = prefix.charAt(0);
    properties[`${prefix}VerticalAlign`] = {
      type: 'string',
      scope: 'layout',
      title: '',
      display: {
        type: 'drop-down',
        label: 'Vertical alignment',
        enum: [...COLUMN_VALIGN_OPTIONS],
        filterBaselineByTopAnchor: true,
        columnLetter,
      },
      enum: [...COLUMN_VALIGN_OPTIONS],
    };
  }

  properties[getListColumnTextSettingKey(prefix, 'textFontFamily')] = {
    type: 'string',
    scope: 'layout',
    title: '',
    display: { type: 'font-family-select', hideLabel: true },
  };
  properties[getListColumnTextSettingKey(prefix, 'textFontSettings')] = {
    ...textStyleProperties.fontSettings,
    scope: 'layout',
    title: '',
    display: { type: 'font-settings-weight', hideLabel: true },
  };
  properties[getListColumnTextSettingKey(prefix, 'textFontSize')] = {
    ...textStyleProperties.fontSize,
    scope: 'layout',
    title: '',
    display: { type: 'font-size' },
  };
  properties[getListColumnTextSettingKey(prefix, 'textLineHeight')] = {
    ...textStyleProperties.lineHeight,
    scope: 'layout',
    title: '',
    display: { type: 'line-height-input' },
  };
  properties[getListColumnTextSettingKey(prefix, 'textLetterSpacing')] = {
    ...textStyleProperties.letterSpacing,
    scope: 'layout',
    title: '',
    display: { type: 'letter-spacing-input' },
  };
  properties[getListColumnTextSettingKey(prefix, 'textWordSpacing')] = {
    ...textStyleProperties.wordSpacing,
    scope: 'layout',
    title: '',
    display: { type: 'word-spacing-input' },
  };
  properties[getListColumnTextSettingKey(prefix, 'textTextAlign')] = {
    ...textStyleProperties.textAlign,
    scope: 'layout',
    title: '',
    display: { type: 'vertical-text-aligh-options' },
  };
  properties[getListColumnTextSettingKey(prefix, 'textTextAppearance')] = {
    ...textStyleProperties.textAppearance,
    scope: 'layout',
    title: '',
    display: { type: 'text-appearance' },
  };

  return properties;
}

const textStylePropertiesByPrefix = LIST_TEXT_STYLE_PREFIXES.reduce<Record<string, SchemaProperty>>(
  (properties, prefix) => ({
    ...properties,
    ...createTextStyleProperties(prefix),
  }),
  {},
);

function getBaseColumnTextSettings(prefix: ListTextStylePrefix): ListColumnTextSettings {
  return {
    verticalAlign: prefix === CUT_LABEL_TEXT_PREFIX ? 'Center' : 'Top',
    textFontFamily: 'Arial',
    textFontSettings: {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    textLetterSpacing: 0,
    textWordSpacing: 0,
    textTextAlign: prefix === CUT_LABEL_TEXT_PREFIX ? 'center' : 'left',
    textTextAppearance: {
      textTransform: 'none',
      textDecoration: 'none',
      fontVariant: 'normal',
    },
  };
}

function resolveColumnTextSettings(
  prefix: ListTextStylePrefix,
  input: ListColumnTextDefaultsInput = {},
): ListColumnTextSettings {
  return {
    ...getBaseColumnTextSettings(prefix),
    ...input.default,
    ...input.byPrefix?.[prefix],
  };
}

const COMMON_SCOPED_TEXT_SETTINGS = new Set<keyof ListColumnTextSettings>([
  'textFontFamily',
  'textFontSettings',
]);

function columnTextSettingsToKeys(
  prefix: ListTextStylePrefix,
  settings: ListColumnTextSettings,
  scope?: 'common' | 'layout',
): Record<string, ListSchemaDefaultValue> {
  const include = (key: keyof ListColumnTextSettings): boolean => {
    if (scope === undefined) return true;
    return scope === 'common' ? COMMON_SCOPED_TEXT_SETTINGS.has(key) : !COMMON_SCOPED_TEXT_SETTINGS.has(key);
  };

  const entries: Record<string, ListSchemaDefaultValue> = {};

  if (include('verticalAlign') && settings.verticalAlign !== undefined) {
    entries[`${prefix}VerticalAlign`] = normalizeListColumnVerticalAlign(settings.verticalAlign);
  }
  if (include('textFontFamily') && settings.textFontFamily !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textFontFamily')] = settings.textFontFamily;
  }
  if (include('textFontSettings') && settings.textFontSettings !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textFontSettings')] = settings.textFontSettings;
  }
  if (include('textFontSize') && settings.textFontSize !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textFontSize')] = settings.textFontSize;
  }
  if (include('textLineHeight') && settings.textLineHeight !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textLineHeight')] = settings.textLineHeight;
  }
  if (include('textLetterSpacing') && settings.textLetterSpacing !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textLetterSpacing')] = settings.textLetterSpacing;
  }
  if (include('textWordSpacing') && settings.textWordSpacing !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textWordSpacing')] = settings.textWordSpacing;
  }
  if (include('textTextAlign') && settings.textTextAlign !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textTextAlign')] = settings.textTextAlign;
  }
  if (include('textTextAppearance') && settings.textTextAppearance !== undefined) {
    entries[getListColumnTextSettingKey(prefix, 'textTextAppearance')] = settings.textTextAppearance;
  }

  return entries;
}

function createTextStyleDefaults(
  input: ListColumnTextDefaultsInput = {},
  scope?: 'common' | 'layout',
): Record<string, ListSchemaDefaultValue> {
  return LIST_TEXT_STYLE_PREFIXES.reduce<Record<string, ListSchemaDefaultValue>>(
    (defaults, prefix) => ({
      ...defaults,
      ...columnTextSettingsToKeys(prefix, resolveColumnTextSettings(prefix, input), scope),
    }),
    {},
  );
}

const textStyleDefaultsByPrefix = createTextStyleDefaults();

const textStylePanelTab = createListTextStylePanelTab();

function getTextStylePropertyNames(
  prefix: ListTextStylePrefix,
): string[] {
  return [
    getListColumnTextSettingKey(prefix, 'textFontFamily'),
    getListColumnTextSettingKey(prefix, 'textFontSettings'),
    getListColumnTextSettingKey(prefix, 'textFontSize'),
    getListColumnTextSettingKey(prefix, 'textLineHeight'),
    getListColumnTextSettingKey(prefix, 'textLetterSpacing'),
    getListColumnTextSettingKey(prefix, 'textWordSpacing'),
    getListColumnTextSettingKey(prefix, 'textTextAlign'),
    getListColumnTextSettingKey(prefix, 'textTextAppearance'),
    `${prefix}VerticalAlign`,
  ];
}

function createColumnTextVisibilityDisplayRules(): SchemaDisplayRule[] {
  const rules: SchemaDisplayRule[] = [];

  COLUMN_TEXT_PREFIXES.forEach((prefix, columnIndex) => {
    const contentKey = COLUMN_CONTENT_KEYS[columnIndex];
    const propertyNames = getTextStylePropertyNames(prefix);

    for (let columnsCount = 1; columnsCount < COLUMN_CONTENT_KEYS.length; columnsCount += 1) {
      const conditions: SchemaDisplayRule['if'] = [
        { name: 'columns', value: columnsCount },
        ...Array.from({ length: columnsCount }, (_, position) => ({
          name: `columnsOrder.${position}`,
          value: contentKey,
          isNotEqual: true as const,
        })),
      ];

      propertyNames.forEach((propertyName) => {
        rules.push({
          if: conditions,
          then: {
            name: `properties.${propertyName}.display.visible`,
            value: false,
          },
        });
      });
    }
  });

  return rules;
}

const paletteBookmarkItems = [
  'textColor',
  'backgroundColor',
  'dividerColor',
  'textHoverColor',
  'backgroundHoverColor',
  'dividerHoverColor',
] as const;

const CUT_DEPENDENT_PROPERTY_NAMES = ['cutLabel', 'cutCellMinHeight', 'showCut'] as const;

const CUT_LABEL_TEXT_STYLE_PROPERTY_NAMES = getTextStylePropertyNames(CUT_LABEL_TEXT_PREFIX);

const CUT_DEPENDENT_DISPLAY_RULE_NAMES = [
  ...CUT_DEPENDENT_PROPERTY_NAMES,
  ...CUT_LABEL_TEXT_STYLE_PROPERTY_NAMES,
] as const;

const HORIZONTAL_LAYOUT_PROPERTY_NAMES = [
  ...LIST_COLUMN_LETTERS.flatMap((letter) => [
    `${letter}ColumnWidth`,
    `${letter}ColumnPaddingLeft`,
    `${letter}ColumnPaddingRight`,
  ]),
  'rowPaddingTop',
  'rowPaddingBottom',
] as const;

const DEFAULT_HOVER_IMAGES = [
  {
    objectFit: 'contain' as const,
    url: 'https://cdn.cntrl.site/component-assets/grid(1).webp',
  },
  {
    objectFit: 'contain' as const,
    url: 'https://cdn.cntrl.site/component-assets/grid(2).webp',
  },
  {
    objectFit: 'contain' as const,
    url: 'https://cdn.cntrl.site/component-assets/grid(3).webp',
  },
  {
    objectFit: 'contain' as const,
    url: 'https://cdn.cntrl.site/component-assets/grid(4).webp',
  },
  {
    objectFit: 'contain' as const,
    url: 'https://cdn.cntrl.site/component-assets/grid(5).webp',
  },
  {
    objectFit: 'contain' as const,
    url: 'https://cdn.cntrl.site/component-assets/grid(8).webp',
  },
  {
    objectFit: 'contain' as const,
    url: 'https://cdn.cntrl.site/component-assets/grid(9).webp',
  },
];

const DEFAULT_CONTENT_ITEMS = [
  {
    AColumn: '01',
    BColumnWidth: 'Ethan Parker',
    CColumnWidth: 'Midnight Atlas',
    DColumnWidth: 'Portland, OR',
    EColumnWidth: 'On Display',
    image: DEFAULT_HOVER_IMAGES[0],
    link: '',
  },
  {
    AColumn: '02',
    BColumnWidth: 'Madison Reed',
    CColumnWidth: 'Echoes in Vermilion',
    DColumnWidth: 'Savannah, GA',
    EColumnWidth: 'Scheduled',
    image: DEFAULT_HOVER_IMAGES[1],
    link: '',
  },
  {
    AColumn: '03',
    BColumnWidth: 'Noah Bennett',
    CColumnWidth: 'Paper and scissors',
    DColumnWidth: 'Madison, WI',
    EColumnWidth: 'On Display',
    image: DEFAULT_HOVER_IMAGES[2],
    link: '',
  },
  {
    AColumn: '04',
    BColumnWidth: 'Olivia Carter',
    CColumnWidth: 'The Quiet Frequency',
    DColumnWidth: 'Boise, ID',
    EColumnWidth: 'On Display',
    image: DEFAULT_HOVER_IMAGES[3],
    link: '',
  },
  {
    AColumn: '05',
    BColumnWidth: 'Mason Brooks',
    CColumnWidth: 'Sights of Tomorrow',
    DColumnWidth: 'Tampa, FL',
    EColumnWidth: 'Postponed',
    image: DEFAULT_HOVER_IMAGES[4],
    link: '',
  },
  {
    AColumn: '06',
    BColumnWidth: 'Sophia Mitchell',
    CColumnWidth: 'Velvet Horizons',
    DColumnWidth: 'Albuquerque, NM',
    EColumnWidth: 'Scheduled',
    image: DEFAULT_HOVER_IMAGES[5],
    link: '',
  },
  {
    AColumn: '07',
    BColumnWidth: 'Jackson Turner',
    CColumnWidth: 'Ink & Aurora',
    DColumnWidth: 'Pittsburgh, PA',
    EColumnWidth: 'On Display',
    image: DEFAULT_HOVER_IMAGES[6],
    link: '',
  },
];

const COLUMN_LAYOUT_PANEL_ITEMS = [
  ...LIST_COLUMN_LETTERS.flatMap((letter) => [
    `${letter}ColumnWidth`,
    `${letter}ColumnPaddingLeft`,
    `${letter}ColumnPaddingRight`,
    `${letter}ColumnPaddingBottom`,
  ]),
  'columnsOrder',
] as const;

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  content: {
      type: 'array',
      settings: {
        addItemWithoutImage: true,
      },
      display: {
        type: 'array',
        ref: { 
          columnsOrder: 'settings.properties.columnsOrder', 
          columnsCount: 'settings.properties.columns' 
        },
      },
      items: {
        type: 'object',
        properties: {
          ...createContentColumnProperties(),
          image: {
            type: 'object',
            label: 'Image',
            display: {
              isObjectFitEditable: false,
              defaultObjectFit: 'contain',
              type: 'media-input',
            },
            properties: {
              url: { type: 'string' },
              name: { type: 'string' },
              type: {
                type: 'string',
                enum: ['image', 'video'],
              },
              objectFit: { type: 'string', enum: ['cover', 'contain'] },
            },
            required: ['url', 'name'],
          },
          link: {
            type: 'string',
            label: 'Link',
            placeholder: 'Add link...',
            display: { type: 'text-input' },
          },
        },
        required: ['image'],
      },
      default: DEFAULT_CONTENT_ITEMS,
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b'],
      },
      columns: {
        type: 'number',
        scope: 'layout',
        title: 'Columns',
        display: { type: 'count-number' },
        min: 1,
        max: 5,
      },
      wrapperWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      textPaddingLR: {
        type: 'number',
        scope: 'layout',
        title: 'Text Padding LR',
        min: 0,
        max: 9999,
        display: { type: 'range-control' },
      },
      entriesCount: {
        type: 'number',
        scope: 'layout',
        title: 'Amount',
        display: { type: 'toggle-numeric-input', enum: ['auto', 'fixed'] },
        min: 1,
      },
      cellMinHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      imageOnHover: {
        type: 'boolean',
        scope: 'common',
        title: 'Image On Hover',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      imageSize: {
        type: 'object',
        scope: 'layout',
        title: 'Image size',
        display: { type: 'min-max-input' },
        min: 1,
        max: 1440,
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
        },
      },
      dividerWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Divider width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      showVisibility: {
        type: 'array',
        scope: 'common',
        title: 'Show',
        display: { type: 'double-toggle', enum: ['top', 'bottom'] },
        items: { type: 'boolean' },
        default: [true, false],
      },
      cut: {
        type: 'number',
        scope: 'layout',
        title: 'Display',
        display: { type: 'toggle-numeric-input', enum: ['off', 'on'] },
        min: 1,
      },
      entryHoverEffect: {
        type: 'string',
        scope: 'common',
        title: 'Effect',
        display: { type: 'toggle-cycle', enum: ['none', 'default', 'blinds', 'reveal'] },
      },
      entryHoverShowOption: {
        type: 'string',
        scope: 'common',
        title: 'Show',
        display: { type: 'toggle-cycle', enum: ['always', 'link only'] },
      },
      cutCellMinHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Cell min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      cutLabel: {
        type: 'string',
        scope: 'common',
        title: 'Cut Label',
        display: { type: 'label-input' },
      },
      showCut: {
        type: 'number',
        scope: 'layout',
        title: 'Show',
        display: { type: 'toggle-numeric-input', enum: ['all', 'custom'] },
        min: 1,
      },
      rowPaddingTop: {
        type: 'number',
        scope: 'layout',
        title: 'Row Padding Top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      rowPaddingBottom: {
        type: 'number',
        scope: 'layout',
        title: 'Row Padding Bottom',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      rowPaddingTopB: {
        type: 'number',
        scope: 'layout',
        title: 'Row Padding Top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      ...createColumnLayoutSchemaProperties(),
      columnsOrder: {
        type: 'array',
        scope: 'layout',
        title: 'Columns Order',
        display: { type: 'reorder-input' },
        items: { type: 'string' },
      },
      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Default',
        display: { type: 'palette-color-picker' },
      },
      textHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Hover',
        display: { type: 'palette-color-picker' },
      },
      ...textStylePropertiesByPrefix,
      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'BG Default',
        display: { type: 'palette-color-picker' },
      },
      dividerColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Default',
        display: { type: 'palette-color-picker' },
      },
      backgroundHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'BG Hover',
        display: { type: 'palette-color-picker' },
      },
      dividerHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Hover',
        display: { type: 'palette-color-picker' },
      },
    },
    defaults: {
      imageOnHover: 'on',
      entryHoverEffect: 'default',
      entryHoverShowOption: 'always',
      cutLabel: 'SEE ALL',
      showVisibility: [true, true],
      textColor: '#000000',
      textHoverColor: '#FFFFFF',
      ...textStyleDefaultsByPrefix,
      ...createTextStyleDefaults({}, 'common'),
      backgroundColor: '#FFFFFF00',
      dividerColor: '#373737',
      backgroundHoverColor: '#000000',
      dividerHoverColor: '#000000',
    },
    layoutDefaults: {
      m: createColumnLayoutDefaults({
        columns: 3,
        type: 'b',
        textPaddingLR: 0.0373,
        entriesCount: 0,
        cellMinHeight: 0.02,
        imageSize: { min: 80, max: 320 },
        dividerWidth: 0.004,
        cut: 0,
        showCut: 0,
        cutCellMinHeight: 0.02,
        rowPaddingTop: 0.01,
        rowPaddingBottom: 0.01,
        typeBDefaults: {
          rowPaddingTopB: 0.0461,
          AColumnPaddingBottom: 0.0410,
          BColumnPaddingBottom: 0.0410,
          CColumnPaddingBottom: 0.0615,
          DColumnPaddingBottom: 0,
          EColumnPaddingBottom: 0,
        },
        textStroke: 0.003,
        textCorners: 0.192,
        textPadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        ...createTextStyleDefaults({
          default: {
            textFontSize: 0.0906,
            textLineHeight: 0.0426,
            textTextAlign: 'left',
          },
          byPrefix: {
            cutLabel: {
              textTextAlign: 'center',
            },
          },
        }, 'layout'),
      }),
      d: createColumnLayoutDefaults({
        columns: 4,
        type: 'a',
        textPaddingLR: 0.01,
        entriesCount: 0,
        cellMinHeight: 0.0555,
        imageSize: { min: 200, max: 200 },
        dividerWidth: 0.002083,
        cut: 0,
        showCut: 0,
        cutCellMinHeight: 0.0555,
        rowPaddingTop: 0,
        rowPaddingBottom: 0,
        rowPaddingTopB: 0.01,
        textStroke: 0.001,
        textCorners: 0.05,
        textPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        ...createTextStyleDefaults({
          default: {
            textFontSize: 0.0333,
            textLineHeight: 0.0333,
            textLetterSpacing: -0.0009,
            textTextAlign: 'left',
            verticalAlign: 'center',
          },
          byPrefix: {
            cutLabel: {
              textTextAlign: 'center',
            },
          },
        }, 'layout'),
      }),
    },
    displayRules: [
      ...createColumnTextVisibilityDisplayRules(),
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.textPaddingLR.display.visible', value: false },
      },
      ...HORIZONTAL_LAYOUT_PROPERTY_NAMES.map((name) => ({
        if: { name: 'type', value: 'b' },
        then: { name: `properties.${name}.display.visible`, value: false },
      })),
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.rowPaddingTopB.display.visible', value: false },
      },
      ...LIST_COLUMN_LETTERS.map((letter) => ({
        if: { name: 'type', value: 'a' },
        then: { name: `properties.${letter}ColumnPaddingBottom.display.visible`, value: false },
      })),
    ],
    layout: [
      '__componentName__',
      'name',
      'type',
      'columns',
      'wrapperWidth',
      'textPaddingLR',
      'entriesCount',
      'cellMinHeight',
      'imageOnHover',
      'imageSize',
      'dividerWidth',
      'showVisibility',
      'cut',
      'showCut',
      'cutCellMinHeight',
      'entryHoverEffect',
      'entryHoverShowOption',
      'cutLabel',
      'rowPaddingTop',
      'rowPaddingBottom',
      'rowPaddingTopB',
      ...COLUMN_LAYOUT_PANEL_ITEMS,
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__', 'name'] },
        'type',
        { type: 'row', title: '', items: ['columns', 'wrapperWidth'] },
        { type: 'row', title: 'Entries', items: ['entriesCount', 'cellMinHeight'] },
        { type: 'row', title: '', items: ['imageOnHover', 'imageSize'] },
        { type: 'row', title: 'Entry Hover', items: ['entryHoverEffect', 'entryHoverShowOption'] },
        { type: 'row', title: 'Divider Settings', items: ['dividerWidth', 'showVisibility'] },
      ],
    },
    {
      id: 'columnsOrder',
      icon: 'layers',
      title: 'Columns Order',
      tooltip: 'Columns order',
      layout: ['__componentName__', 'columnsOrder'],
    },
    {
      id: 'cutSettings',
      icon: 'cut',
      title: 'Cut settings',
      tooltip: 'Cut settings',
      layout: [
        '__componentName__',
        { type: 'row', title: '', items: ['cut'] },
        { type: 'row', title: 'Cut Settings', items: ['cutLabel', 'cutCellMinHeight'] },
        { type: 'row', title: '', items: ['showCut'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        textStylePanelTab,
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: [
        'textColor',
        'backgroundColor',
        'dividerColor',
        'textHoverColor',
        'backgroundHoverColor',
        'dividerHoverColor',
      ],
    },
  },
};

export const ListComponent = {
  element: List,
  id: 'list',
  name: 'Programme',
  category: 'lists',
  layoutMode: 'structured' as const,
  normalizeLayoutSettingsUpdate: (nextSettings: Record<string, any>, prevSettings: Record<string, any>) =>
    applyListColumnCountChange(nextSettings as ListSettings, prevSettings as ListSettings),
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Programme_List.png',
  },
  version: 1,
  defaultSize: {
    d: {
      width: 720,
      height: 540,
    }
  },
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [...LIST_TEXT_STYLE_PREFIXES.map((prefix) => ({ path: `${getListColumnTextSettingKey(prefix, 'textFontFamily')}` }))]
  },
  fontRelations: {
    ...LIST_TEXT_STYLE_PREFIXES.reduce((acc, prefix) => ({
      ...acc,
      [`${prefix}TextFontSettings`]: `${getListColumnTextSettingKey(prefix, 'textFontFamily')}`,
    }), {}),
  },
  schema,
  sourceCode: formSourceRaw,
};
