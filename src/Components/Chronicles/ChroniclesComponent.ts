import {
  ComponentContentProperty,
  ComponentSchemaV1,
  LayoutItem,
  SchemaDisplayRule,
  SchemaProperty,
} from '../../types/SchemaV1';
import {
  applyChroniclesColumnCountChange,
  Chronicles,
  CHRONICLES_COLUMN_STYLE_PREFIXES,
  CHRONICLES_COLUMN_WIDTH_KEYS,
  CHRONICLES_EXTRA_TITLE_KEYS,
  CHRONICLES_PANEL_POSITIONS,
  getChroniclesEqualColumnWidths,
} from './Chronicles';

const MIN_COLUMNS = 1;
const DEFAULT_COLUMNS = 2;
const MAX_COLUMNS = 5;

const TEXT_STYLE_PREFIXES = ['trigger', ...CHRONICLES_COLUMN_STYLE_PREFIXES] as const;

type TextStylePrefix = typeof TEXT_STYLE_PREFIXES[number];

// Group and Title are the first two columns; the extra title keys fill the rest.
const NAMED_COLUMNS = 2;

// Column counts below the max, i.e. the ones that hide something.
const PARTIAL_COLUMN_COUNTS = Array.from(
  { length: MAX_COLUMNS - MIN_COLUMNS },
  (_, index) => MIN_COLUMNS + index,
);

const DEFAULT_IMAGES = [
  '01M3QM74XESYN1HRYH9VRTZ5CK',
  '01M3QM74XEVZ9F59FC7M9BA63Q',
  '01M3QM74XEE2101QD8PM6E4JSA',
  '01M3QM74XE20C38X4NND20C5R4',
  '01M3QM74XEGBJMJ7Q63KMZY6NA',
];

const DEFAULT_ROWS: Array<[string, string]> = [
  ['(2026)', 'Midnight Atlas'],
  ['', 'Echoes in Vermilion'],
  ['', 'Paper and Scissors'],
  ['', 'Salt, Studio Edition'],
  ['(2025)', 'Quiet Rooms'],
  ['', 'Harbour Light'],
  ['', 'Still Life with Lemons'],
];

const DEFAULT_CONTENT = DEFAULT_ROWS.map(([group, title], index) => ({
  group,
  title,
  link: { type: 'url' as const, value: '', target: 'self' as const },
  image: [index, index + 1].map((imageIndex) => ({
    assetId: DEFAULT_IMAGES[imageIndex % DEFAULT_IMAGES.length],
    name: '',
    objectFit: 'cover' as const,
  })),
}));

const textAppearanceDefault = {
  textTransform: 'none',
  textDecoration: 'none',
  fontVariant: 'normal',
};

function createLayoutSizeProperty(title: string): SchemaProperty {
  return {
    type: 'number',
    scope: 'layout',
    title,
    display: { type: 'numeric-input' },
    min: 0,
    max: 9999,
  };
}

function createColorProperty(title: string): SchemaProperty {
  return {
    type: 'string',
    scope: 'common',
    title,
    display: { type: 'palette-color-picker' },
  };
}

function createTextStyleProperties(prefix: TextStylePrefix): Record<string, SchemaProperty> {
  return {
    [`${prefix}FontFamily`]: {
      type: 'string',
      scope: 'common',
      title: '',
      display: { type: 'font-family-select', hideLabel: true },
    },
    [`${prefix}FontSettings`]: {
      type: 'object',
      scope: 'common',
      title: '',
      display: { type: 'font-settings-weight', hideLabel: true },
      properties: {
        fontWeight: { type: 'number' },
        fontStyle: { type: 'string' },
      },
    },
    [`${prefix}FontSize`]: {
      type: 'number',
      scope: 'layout',
      title: '',
      display: { type: 'font-size' },
    },
    [`${prefix}LineHeight`]: {
      type: 'number',
      scope: 'layout',
      title: '',
      display: { type: 'line-height-input' },
    },
    [`${prefix}LetterSpacing`]: {
      type: 'number',
      scope: 'layout',
      title: '',
      display: { type: 'letter-spacing-input' },
    },
    [`${prefix}WordSpacing`]: {
      type: 'number',
      scope: 'layout',
      title: '',
      display: { type: 'word-spacing-input' },
    },
    ...(prefix !== 'trigger' && {
      [`${prefix}TextAlign`]: {
        type: 'string',
        scope: 'layout',
        title: '',
        enum: ['left', 'center', 'right', 'justify'],
        display: { type: 'vertical-text-aligh-options' },
      },
    }),
    [`${prefix}TextAppearance`]: {
      type: 'object',
      scope: 'layout',
      title: '',
      display: { type: 'text-appearance' },
      properties: {
        textTransform: { type: 'string', enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
        textDecoration: { type: 'string', enum: ['none', 'underline'] },
        fontVariant: { type: 'string', enum: ['normal', 'small-caps'] },
      },
    },
  };
}

function createTextStyleLayout(prefix: TextStylePrefix): LayoutItem[] {
  return [
    `${prefix}FontFamily`,
    `${prefix}FontSettings`,
    { type: 'row', items: [`${prefix}FontSize`, `${prefix}LineHeight`, `${prefix}LetterSpacing`, `${prefix}WordSpacing`] },
    ...(prefix !== 'trigger' ? [`${prefix}TextAlign`] : []),
    `${prefix}TextAppearance`,
  ];
}

function createColumnTextStyleDefaults(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(CHRONICLES_COLUMN_STYLE_PREFIXES.flatMap((prefix) => (
    Object.entries(values).map(([key, value]) => [`${prefix}${key}`, value])
  )));
}

function withEqualColumnWidths<T extends Parameters<typeof getChroniclesEqualColumnWidths>[0]>(layoutDefaults: T) {
  return { ...layoutDefaults, ...getChroniclesEqualColumnWidths(layoutDefaults) };
}

const textStyleProperties: Record<string, SchemaProperty> = Object.assign(
  {},
  ...TEXT_STYLE_PREFIXES.map(createTextStyleProperties),
);

const extraTitleProperties: Record<string, ComponentContentProperty> = Object.fromEntries(
  CHRONICLES_EXTRA_TITLE_KEYS.map((key, index) => [key, {
    type: 'string',
    label: `Column ${index + NAMED_COLUMNS + 1}`,
    placeholder: 'Add text...',
    display: { type: 'text-input' },
  }]),
);

// Sized by dragging on the canvas only, so no panel lists them.
const columnWidthProperties: Record<string, SchemaProperty> = Object.fromEntries(
  CHRONICLES_COLUMN_WIDTH_KEYS.map((key, index) => [key, createLayoutSizeProperty(`Column ${index + 1} Width`)]),
);

const contentDisplayRules: SchemaDisplayRule[] = [
  { if: { name: 'columns', value: 1 }, then: { name: 'title', value: false } },
  ...PARTIAL_COLUMN_COUNTS.flatMap((columns) => (
    CHRONICLES_EXTRA_TITLE_KEYS.slice(Math.max(0, columns - NAMED_COLUMNS)).map((key) => ({
      if: { name: 'columns', value: columns },
      then: { name: key, value: false },
    }))
  )),
];

const columnTextStyleDisplayRules: SchemaDisplayRule[] = PARTIAL_COLUMN_COUNTS.flatMap((columns) => (
  CHRONICLES_COLUMN_STYLE_PREFIXES.slice(columns).flatMap((prefix) => (
    Object.keys(createTextStyleProperties(prefix)).map((name) => ({
      if: { name: 'columns', value: columns },
      then: { name: `properties.${name}.display.visible`, value: false },
    }))
  ))
));

const TYPE_B_ONLY_PROPERTIES = [
  'triggerLabel',
  'closeLabel',
  'triggerColor',
  'triggerHoverColor',
  'closeColor',
  'closeHoverColor',
  'overlayColor',
  'panelPosition',
  ...Object.keys(createTextStyleProperties('trigger')),
];

const schema = {
  type: 'object',
  version: 1,
  content: {
    type: 'array',
    settings: {
      addItemWithoutImage: true,
      allowsVideo: true,
    },
    display: {
      type: 'array',
      rules: contentDisplayRules,
    },
    items: {
      type: 'object',
      properties: {
        group: {
          type: 'string',
          label: 'Column 1',
          placeholder: 'Leave empty to continue the group above...',
          display: { type: 'text-input' },
        },
        title: {
          type: 'string',
          label: 'Column 2',
          placeholder: 'Add title...',
          display: { type: 'text-input' },
        },
        ...extraTitleProperties,
        link: {
          type: 'object',
          label: 'Link',
          contentKey: 'link',
          display: { type: 'link-input' },
        },
        image: {
          type: 'object',
          label: 'Hover Images',
          display: { type: 'media-list-input' },
          properties: {
            assetId: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['image', 'video'] },
            objectFit: { type: 'string', enum: ['cover', 'contain'] },
          },
        },
      },
    },
    default: DEFAULT_CONTENT,
  },
  settings: {
    sizing: 'auto',
    properties: {
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b'],
      },
      triggerLabel: {
        type: 'string',
        scope: 'common',
        title: 'Label',
        display: { type: 'label-input' },
      },
      closeLabel: {
        type: 'string',
        scope: 'common',
        title: 'Close',
        display: { type: 'label-input' },
      },
      columns: {
        type: 'number',
        scope: 'layout',
        title: 'Columns',
        display: { type: 'count-number' },
        min: MIN_COLUMNS,
        max: MAX_COLUMNS,
      },
      columnGap: createLayoutSizeProperty('Column Gap'),
      ...columnWidthProperties,
      hoverInterval: {
        type: 'number',
        scope: 'common',
        title: 'Interval (ms)',
        display: { type: 'common-numeric-input' },
        min: 1000,
        step: 100,
        max: 10000,
      },
      panelPosition: {
        type: 'string',
        scope: 'layout',
        title: 'Position',
        display: { type: 'toggle-cycle', enum: CHRONICLES_PANEL_POSITIONS },
      },
      panelWidth: createLayoutSizeProperty('Width'),
      panelPadding: {
        type: 'object',
        scope: 'layout',
        title: 'Padding',
        display: { type: 'padding-controls' },
      },
      panelRadius: createLayoutSizeProperty('Corners'),
      groupGap: createLayoutSizeProperty('Groups Gap'),
      triggerColor: createColorProperty('Label Default'),
      triggerHoverColor: createColorProperty('Label Hover'),
      closeColor: createColorProperty('Close Default'),
      closeHoverColor: createColorProperty('Close Hover'),
      panelColor: createColorProperty('BG Panel'),
      textColor: createColorProperty('Text Default'),
      textHoverColor: createColorProperty('Text Hover'),
      overlayColor: createColorProperty('Popup Overlay'),
      ...textStyleProperties,
    },
    defaults: {
      triggerLabel: 'Click me!',
      closeLabel: 'Close',
      hoverInterval: 1000,
      triggerColor: '#000000',
      triggerHoverColor: '#666666',
      closeColor: '#000000',
      closeHoverColor: '#666666',
      panelColor: '#000000',
      textColor: '#FFFFFF',
      textHoverColor: '#BBBBBB',
      overlayColor: '#FFFFFFE6',
      triggerFontFamily: 'Goudy Bookletter 1911',
      triggerFontSettings: { fontWeight: 400, fontStyle: 'normal' },
      triggerLetterSpacing: 0,
      triggerWordSpacing: 0,
      triggerTextAppearance: { ...textAppearanceDefault, textTransform: 'uppercase' },
      ...createColumnTextStyleDefaults({
        FontFamily: 'Goudy Bookletter 1911',
        FontSettings: { fontWeight: 400, fontStyle: 'normal' },
        LetterSpacing: 0,
        WordSpacing: 0,
        TextAlign: 'left',
        TextAppearance: textAppearanceDefault,
      }),
    },
    layoutDefaults: {
      m: withEqualColumnWidths({
        type: 'b',
        panelPosition: 'center',
        columns: DEFAULT_COLUMNS,
        columnGap: 0.0427,
        panelWidth: 0.9147,
        panelPadding: { top: 0.0427, right: 0.0427, bottom: 0.0427, left: 0.0427 },
        panelRadius: 8 / 375,
        groupGap: 0.0427,
        triggerFontSize: 0.0347,
        triggerLineHeight: 0.0427,
        ...createColumnTextStyleDefaults({ FontSize: 0.0347, LineHeight: 0.0427 }),
      }),
      t: withEqualColumnWidths({
        type: 'b',
        panelPosition: 'center',
        columns: DEFAULT_COLUMNS,
        columnGap: 0.0234,
        panelWidth: 0.5469,
        panelPadding: { top: 0.0182, right: 0.0182, bottom: 0.0182, left: 0.0182 },
        panelRadius: 8 / 768,
        groupGap: 0.0234,
        triggerFontSize: 0.0169,
        triggerLineHeight: 0.0208,
        ...createColumnTextStyleDefaults({ FontSize: 0.0169, LineHeight: 0.0208 }),
      }),
      d: withEqualColumnWidths({
        type: 'b',
        panelPosition: 'center',
        columns: DEFAULT_COLUMNS,
        columnGap: 0.0139,
        panelWidth: 0.3194,
        panelPadding: { top: 0.00972, right: 0.00972, bottom: 0.00972, left: 0.00972 },
        panelRadius: 8 / 1440,
        groupGap: 0.0139,
        triggerFontSize: 0.00833,
        triggerLineHeight: 0.0104,
        ...createColumnTextStyleDefaults({ FontSize: 0.00833, LineHeight: 0.00972 }),
      }),
    },
    displayRules: [
      ...TYPE_B_ONLY_PROPERTIES.map((name) => ({
        if: { name: 'type', value: 'a' },
        then: { name: `properties.${name}.display.visible`, value: false },
      })),
      ...columnTextStyleDisplayRules,
    ],
  },
  panels: [
    {
      id: 'open',
      icon: 'settings',
      title: 'Open',
      tooltip: 'Open State',
      layout: [
        '__componentName__',
        'type',
        { type: 'row', title: '', items: ['panelWidth', 'panelRadius'] },
        { type: 'row', title: '', items: ['columns', 'columnGap'] },
        { type: 'row', title: '', items: ['panelPosition', 'hoverInterval'] },
        'triggerLabel',
        'closeLabel',
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        {
          type: 'tab',
          id: 'chroniclesTextStyle',
          tabs: {
            Label: createTextStyleLayout('trigger'),
            ...Object.fromEntries(CHRONICLES_COLUMN_STYLE_PREFIXES.map((prefix, index) => [
              String(index + 1),
              createTextStyleLayout(prefix),
            ])),
          },
        },
      ],
    },
  ],
  paletteBookmark: {
    items: [
      'triggerColor',
      'triggerHoverColor',
      'closeColor',
      'closeHoverColor',
      'panelColor',
      'textColor',
      'textHoverColor',
      'overlayColor',
    ],
    panelIds: ['default', 'open'],
    stateItems: {
      default: ['triggerColor'],
      hover: ['triggerHoverColor'],
      open: ['closeColor', 'closeHoverColor', 'panelColor', 'textColor', 'textHoverColor', 'overlayColor'],
    },
  },
  states: ['default', 'hover'],
  statePanels: ['default', 'open'],
} satisfies ComponentSchemaV1;

export const ChroniclesComponent = {
  element: Chronicles,
  id: 'chronicles',
  name: 'Chronicles',
  category: 'ui-elements',
  normalizeLayoutSettingsUpdate: applyChroniclesColumnCountChange,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Chronicles.png',
  },
  version: 1,
  schema,
  assetsPaths: {
    content: [{ path: 'image.assetId', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: TEXT_STYLE_PREFIXES.map((prefix) => ({ path: `${prefix}FontFamily` })),
  },
  fontRelations: Object.fromEntries(
    TEXT_STYLE_PREFIXES.map((prefix) => [`${prefix}FontSettings`, `${prefix}FontFamily`]),
  ),
};
