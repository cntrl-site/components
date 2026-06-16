import {
  COLUMN_CONTENT_KEYS,
  COLUMN_TEXT_PREFIXES,
  CUT_LABEL_TEXT_PREFIX,
  COLUMN_VALIGN_BASIC_OPTIONS,
  createListTextStylePanelTab,
  getListColumnTextSettingKey,
  LIST_TEXT_STYLE_PREFIXES,
  List,
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
  type?: 'A' | 'B';
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
};

type ListColumnTextLayoutDefaultsInput = {
  textFontSize?: number;
  textLineHeight?: number;
  textTextAlign?: 'left' | 'center' | 'right' | 'justify';
};

type ListColumnTextLayoutDefaults = {
  AColumnTextFontSize?: number;
  BColumnTextFontSize?: number;
  CColumnTextFontSize?: number;
  DColumnTextFontSize?: number;
  EColumnTextFontSize?: number;
  AColumnTextLineHeight?: number;
  BColumnTextLineHeight?: number;
  CColumnTextLineHeight?: number;
  DColumnTextLineHeight?: number;
  EColumnTextLineHeight?: number;
  AColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  BColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  CColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  DColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  EColumnTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
  cutLabelTextTextAlign?: 'left' | 'center' | 'right' | 'justify';
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
    display: { type: 'text-appearance', useTabDesign: true },
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

function createColumnLayoutDefaults(overrides: ListColumnLayoutDefaultsOverrides = {}): ListColumnLayoutDefaults & ListColumnLayoutDefaultsOverrides {
  const defaults = {
    columns: 5,
    wrapperWidth: 1,
    columnsOrder: [...COLUMN_CONTENT_KEYS],
  } as ListColumnLayoutDefaults;

  for (const letter of LIST_COLUMN_LETTERS) {
    defaults[`${letter}ColumnWidth`] = 0.2;
    defaults[`${letter}ColumnPaddingLeft`] = 0;
    defaults[`${letter}ColumnPaddingRight`] = 0;
    defaults[`${letter}ColumnPaddingBottom`] = 0;
  }

  return { ...defaults, ...overrides };
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
        useTabDesign: true,
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
        useTabDesign: true,
      },
      enum: [...COLUMN_VALIGN_OPTIONS],
    };
  }

  properties[getListColumnTextSettingKey(prefix, 'textFontFamily')] = {
    type: 'string',
    scope: 'common',
    title: '',
    display: { type: 'font-family-select', hideLabel: true, useTabDesign: true },
  };
  properties[getListColumnTextSettingKey(prefix, 'textFontSettings')] = {
    ...textStyleProperties.fontSettings,
    scope: 'common',
    title: '',
    display: { type: 'font-settings-weight', hideLabel: true, useTabDesign: true },
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
    display: { type: 'text-appearance', useTabDesign: true },
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

const textStyleDefaultsByPrefix = LIST_TEXT_STYLE_PREFIXES.reduce<Record<string, ListSchemaDefaultValue>>(
  (defaults, prefix) => ({
    ...defaults,
    [`${prefix}VerticalAlign`]: prefix === CUT_LABEL_TEXT_PREFIX ? 'Center' : 'Top',
    [getListColumnTextSettingKey(prefix, 'textFontFamily')]: 'Arial',
    [getListColumnTextSettingKey(prefix, 'textFontSettings')]: {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    [getListColumnTextSettingKey(prefix, 'textLetterSpacing')]: 0,
    [getListColumnTextSettingKey(prefix, 'textWordSpacing')]: 0,
    [getListColumnTextSettingKey(prefix, 'textTextAlign')]:
      prefix === CUT_LABEL_TEXT_PREFIX ? 'center' : 'left',
    [getListColumnTextSettingKey(prefix, 'textTextAppearance')]: {
      textTransform: 'none',
      textDecoration: 'none',
      fontVariant: 'normal',
    },
  }),
  {},
);

function createTextStyleLayoutDefaults(
  layoutDefaults: ListColumnTextLayoutDefaultsInput,
): Partial<ListColumnTextLayoutDefaults> {
  const { textFontSize, textLineHeight, textTextAlign } = layoutDefaults;
  return LIST_TEXT_STYLE_PREFIXES.reduce<Record<string, any>>((defaults, prefix) => {
    if (textFontSize !== undefined) {
      defaults[`${prefix}TextFontSize`] = textFontSize;
    }
    if (textLineHeight !== undefined) {
      defaults[`${prefix}TextLineHeight`] = textLineHeight;
    }
    if (textTextAlign !== undefined) {
      defaults[getListColumnTextSettingKey(prefix, 'textTextAlign')] = textTextAlign;
    }
    return defaults;
  }, {}) as Partial<ListColumnTextLayoutDefaults>;
}

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

function createDefaultContentItem(
  labelSuffix: string,
  image: { objectFit: 'cover'; url: string; name: string },
) {
  const suffix = labelSuffix ? ` ${labelSuffix}` : '';
  return {
    AColumn: `AColumn${suffix}`,
    BColumnWidth: `BColumnWidth${suffix}`,
    CColumnWidth: `CColumnWidth${suffix}`,
    DColumnWidth: `DColumnWidth${suffix}`,
    EColumnWidth: `EColumnWidth${suffix}`,
    image,
    link: '',
  };
}

const DEFAULT_CONTENT_ITEMS = [
  createDefaultContentItem('', {
    objectFit: 'cover',
    url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png',
    name: 'Slider-1.png',
  }),
  createDefaultContentItem('2', {
    objectFit: 'cover',
    url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png',
    name: 'Slider-2.png',
  }),
  createDefaultContentItem('3', {
    objectFit: 'cover',
    url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQNEVRXPSRX5K1YTMJQY9.png',
    name: 'Slider-3.png',
  }),
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
              type: 'media-input',
            },
            properties: {
              url: { type: 'string' },
              name: { type: 'string' },
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
        enum: ['A', 'B'],
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
        title: 'Entries #',
        display: { type: 'toggle-numeric-input', enum: ['Auto', 'Fixed'] },
        min: 1,
      },
      cellMinHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Cell min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      imageOnHover: {
        type: 'boolean',
        scope: 'common',
        title: 'Image On Hover',
        display: { type: 'toggle-cycle', enum: ['On', 'Off'] },
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
        display: { type: 'double-toggle', enum: ['Top', 'Bottom'] },
        items: { type: 'boolean' },
        default: [true, false],
      },
      cut: {
        type: 'number',
        scope: 'layout',
        title: 'Cut',
        display: { type: 'toggle-numeric-input', enum: ['Off', 'On'] },
        min: 1,
      },
      entryHoverEffect: {
        type: 'string',
        scope: 'common',
        title: 'Entry Hover Effect',
        display: { type: 'toggle-cycle', enum: ['None', 'Default', 'Blinds'] },
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
        display: { type: 'toggle-numeric-input', enum: ['All', 'Custom'] },
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
      imageOnHover: 'Off',
      entryHoverEffect: 'None',
      cutLabel: 'SEE ALL',
      showVisibility: [true, true],
      textColor: '#767676',
      textHoverColor: '#767676',
      ...textStyleDefaultsByPrefix,
      backgroundColor: '#FFFFFF00',
      dividerColor: '#767676',
      backgroundHoverColor: '#FFFFFF00',
      dividerHoverColor: '#767676',
    },
    layoutDefaults: {
      m: createColumnLayoutDefaults({
        type: 'B',
        textPaddingLR: 0.0373,
        entriesCount: 0,
        cellMinHeight: 0.02,
        imageSize: { min: 80, max: 320 },
        dividerWidth: 0.002,
        cut: 0,
        showCut: 0,
        cutCellMinHeight: 0.043,
        rowPaddingTop: 0.01,
        rowPaddingBottom: 0.01,
        rowPaddingTopB: 0.01,
        textStroke: 0.003,
        textCorners: 0.192,
        textPadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        ...createTextStyleLayoutDefaults({
          textFontSize: 0.043,
          textLineHeight: 0.043,
          textTextAlign: 'center',
        }),
      }),
      d: createColumnLayoutDefaults({
        type: 'A',
        textPaddingLR: 0.01,
        entriesCount: 0,
        cellMinHeight: 0.03,
        imageSize: { min: 80, max: 320 },
        dividerWidth: 0.0006,
        cut: 0,
        showCut: 0,
        cutCellMinHeight: 0.03,
        rowPaddingTop: 0.01,
        rowPaddingBottom: 0.01,
        rowPaddingTopB: 0.01,
        textStroke: 0.001,
        textCorners: 0.05,
        textPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        ...createTextStyleLayoutDefaults({
          textFontSize: 0.01,
          textLineHeight: 0.01,
        }),
      }),
    },
    displayRules: [
      ...createColumnTextVisibilityDisplayRules(),
      ...CUT_DEPENDENT_DISPLAY_RULE_NAMES.map((name) => ({
        if: { name: 'cut', value: 0 },
        then: { name: `properties.${name}.display.visible`, value: false },
      })),
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.textPaddingLR.display.visible', value: false },
      },
      ...HORIZONTAL_LAYOUT_PROPERTY_NAMES.map((name) => ({
        if: { name: 'type', value: 'B' },
        then: { name: `properties.${name}.display.visible`, value: false },
      })),
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.rowPaddingTopB.display.visible', value: false },
      },
      ...LIST_COLUMN_LETTERS.map((letter) => ({
        if: { name: 'type', value: 'A' },
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
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__', 'name'] },
        'type',
        { type: 'row', title: '', items: ['columns', 'wrapperWidth'] },
        { type: 'row', title: '', items: ['entriesCount', 'cellMinHeight'] },
        { type: 'row', title: '', items: ['imageOnHover', 'imageSize'] },
        { type: 'row', title: '', items: ['entryHoverEffect'] },
        { type: 'row', title: 'Divider Settings', items: ['dividerWidth', 'showVisibility'] },
        { type: 'row', title: '', items: ['cut'] },
        { type: 'row', title: 'Cut Settings', items: ['cutLabel', 'cutCellMinHeight'] },
        { type: 'row', title: '', items: ['showCut'] },
      ],
    },
    {
      id: 'columnsOrder',
      icon: 'layers',
      title: 'Columns Order',
      tooltip: 'Columns order',
      layout: ['columnsOrder'],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
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
  name: 'Default List',
  category: 'lists',
  layoutMode: 'structured' as const,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Programme_List.png ',
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
  schema,
  sourceCode: formSourceRaw,
};
