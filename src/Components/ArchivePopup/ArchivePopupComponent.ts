import { ComponentContentProperty, ComponentSchemaV1, SchemaDisplayRule, SchemaProperty } from '../../types/SchemaV1';
import {
  ArchivePopup,
  ARCHIVE_POPUP_EXTRA_TITLE_KEYS,
  ARCHIVE_POPUP_MAX_COLUMNS,
  ARCHIVE_POPUP_MIN_COLUMNS,
  ARCHIVE_POPUP_PANEL_POSITIONS,
} from './ArchivePopup';

type TextStylePrefix = 'trigger' | 'list';

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
      title: 'Font family',
      display: { type: 'font-family-select' },
    },
    [`${prefix}FontSettings`]: {
      type: 'object',
      scope: 'common',
      title: '',
      display: { type: 'font-settings-weight' },
      properties: {
        fontWeight: { type: 'number' },
        fontStyle: { type: 'string' },
      },
    },
    [`${prefix}FontSize`]: {
      type: 'number',
      scope: 'layout',
      title: 'Font Size',
      display: { type: 'font-size' },
    },
    [`${prefix}LineHeight`]: {
      type: 'number',
      scope: 'layout',
      title: 'Line Height',
      display: { type: 'line-height-input' },
    },
    [`${prefix}LetterSpacing`]: {
      type: 'number',
      scope: 'layout',
      title: 'Letter Spacing',
      display: { type: 'letter-spacing-input' },
    },
    [`${prefix}WordSpacing`]: {
      type: 'number',
      scope: 'layout',
      title: 'Word Spacing',
      display: { type: 'word-spacing-input' },
    },
    [`${prefix}TextAppearance`]: {
      type: 'object',
      scope: 'layout',
      title: 'Text Appearance',
      display: { type: 'text-appearance' },
      properties: {
        textTransform: { type: 'string', enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
        textDecoration: { type: 'string', enum: ['none', 'underline'] },
        fontVariant: { type: 'string', enum: ['normal', 'small-caps'] },
      },
    },
  };
}

function createTextStyleLayout(prefix: TextStylePrefix) {
  return [
    `${prefix}FontFamily`,
    `${prefix}FontSettings`,
    { type: 'row' as const, items: [`${prefix}FontSize`, `${prefix}LineHeight`, `${prefix}LetterSpacing`, `${prefix}WordSpacing`] },
    `${prefix}TextAppearance`,
  ];
}

// Group and Title are the first two columns; each one after is a title field of its own, shown in the content panel only while the columns reach it.
function createExtraTitleProperties(): Record<string, ComponentContentProperty> {
  return Object.fromEntries(ARCHIVE_POPUP_EXTRA_TITLE_KEYS.map((key, index) => [key, {
    label: `Column ${index + ARCHIVE_POPUP_MIN_COLUMNS + 1}`,
    placeholder: 'Add text...',
    display: { type: 'rich-text' },
  }]));
}

function createExtraTitleDisplayRules(): SchemaDisplayRule[] {
  const rules: SchemaDisplayRule[] = [];
  for (let columns = ARCHIVE_POPUP_MIN_COLUMNS; columns < ARCHIVE_POPUP_MAX_COLUMNS; columns += 1) {
    ARCHIVE_POPUP_EXTRA_TITLE_KEYS.slice(columns - ARCHIVE_POPUP_MIN_COLUMNS).forEach((key) => {
      rules.push({ if: { name: 'columns', value: columns }, then: { name: key, value: false } });
    });
  }
  return rules;
}

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
  title: [{ type: 'paragraph', children: [{ text: title }] }],
  image: {
    assetId: DEFAULT_IMAGES[index % DEFAULT_IMAGES.length],
    name: '',
    objectFit: 'cover' as const,
  },
}));

const textAppearanceDefault = {
  textTransform: 'none',
  textDecoration: 'none',
  fontVariant: 'normal',
};

const paletteBookmarkItems = [
  'triggerColor',
  'triggerHoverColor',
  'closeColor',
  'closeHoverColor',
  'panelColor',
  'textColor',
  'textHoverColor',
  'overlayColor',
] as const;

// B is always open in place: it has no label to open it, close label to dismiss it or overlay behind it.
const TYPE_A_ONLY_PROPERTIES = [
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
      rules: createExtraTitleDisplayRules(),
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
          label: 'Column 2',
          placeholder: 'Add title...',
          display: { type: 'rich-text' },
        },
        ...createExtraTitleProperties(),
        image: {
          type: 'object',
          label: 'Hover Image',
          display: {
            type: 'media-input',
            isObjectFitEditable: true,
            defaultObjectFit: 'cover',
          },
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
        display: { type: 'text-input' },
      },
      closeLabel: {
        type: 'string',
        scope: 'common',
        title: 'Close',
        display: { type: 'text-input' },
      },
      columns: {
        type: 'number',
        scope: 'layout',
        title: 'Columns',
        display: { type: 'count-number' },
        min: ARCHIVE_POPUP_MIN_COLUMNS,
        max: ARCHIVE_POPUP_MAX_COLUMNS,
      },
      columnGap: createLayoutSizeProperty('Column Gap'),
      panelPosition: {
        type: 'string',
        scope: 'layout',
        title: 'Position',
        display: { type: 'toggle-cycle', enum: ARCHIVE_POPUP_PANEL_POSITIONS },
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
      triggerColor: createColorProperty('Label'),
      triggerHoverColor: createColorProperty('Label Hover'),
      closeColor: createColorProperty('Close'),
      closeHoverColor: createColorProperty('Close Hover'),
      textColor: createColorProperty('Text'),
      textHoverColor: createColorProperty('Text Hover'),
      panelColor: createColorProperty('Panel BG'),
      overlayColor: createColorProperty('Overlay'),
      ...createTextStyleProperties('trigger'),
      ...createTextStyleProperties('list'),
    },
    defaults: {
      triggerLabel: 'Archive',
      closeLabel: 'Close',
      triggerColor: '#000000',
      triggerHoverColor: '#666666',
      closeColor: '#000000',
      closeHoverColor: '#666666',
      panelColor: '#FFFFFF',
      textColor: '#333132',
      textHoverColor: '#BBBBBB',
      overlayColor: '#FFFFFFE6',
      triggerFontFamily: 'Goudy Bookletter 1911',
      triggerFontSettings: { fontWeight: 400, fontStyle: 'normal' },
      triggerLetterSpacing: 0,
      triggerWordSpacing: 0,
      triggerTextAppearance: { ...textAppearanceDefault, textTransform: 'uppercase' },
      listFontFamily: 'Goudy Bookletter 1911',
      listFontSettings: { fontWeight: 400, fontStyle: 'normal' },
      listLetterSpacing: 0,
      listWordSpacing: 0,
      listTextAppearance: textAppearanceDefault,
    },
    layoutDefaults: {
      m: {
        type: 'a',
        panelPosition: 'center',
        columns: ARCHIVE_POPUP_MIN_COLUMNS,
        columnGap: 0.0427,
        panelWidth: 0.9147,
        panelPadding: { top: 0.0427, right: 0.0427, bottom: 0.0427, left: 0.0427 },
        panelRadius: 8 / 375,
        groupGap: 0.0427,
        triggerFontSize: 0.0347,
        triggerLineHeight: 0.0427,
        listFontSize: 0.0347,
        listLineHeight: 0.0427,
      },
      t: {
        type: 'a',
        panelPosition: 'center',
        columns: ARCHIVE_POPUP_MIN_COLUMNS,
        columnGap: 0.0234,
        panelWidth: 0.5469,
        panelPadding: { top: 0.0182, right: 0.0182, bottom: 0.0182, left: 0.0182 },
        panelRadius: 8 / 768,
        groupGap: 0.0234,
        triggerFontSize: 0.0169,
        triggerLineHeight: 0.0208,
        listFontSize: 0.0169,
        listLineHeight: 0.0208,
      },
      d: {
        type: 'a',
        panelPosition: 'center',
        columns: ARCHIVE_POPUP_MIN_COLUMNS,
        columnGap: 0.0139,
        panelWidth: 0.3194,
        panelPadding: { top: 0.00972, right: 0.00972, bottom: 0.00972, left: 0.00972 },
        panelRadius: 8 / 1440,
        groupGap: 0.0139,
        triggerFontSize: 0.00833,
        triggerLineHeight: 0.0104,
        listFontSize: 0.00833,
        listLineHeight: 0.00972,
      },
    },
    displayRules: TYPE_A_ONLY_PROPERTIES.map((name) => ({
      if: { name: 'type', value: 'b' },
      then: { name: `properties.${name}.display.visible`, value: false },
    })),
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
        'panelPosition',
        { type: 'row', title: '', items: ['panelWidth',  'panelRadius',] },
        { type: 'row', title: '', items: ['columns', 'columnGap'] },
        // { type: 'row', title: '', items: [ 'panelPadding', 'groupGap'] },
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
        { type: 'group', title: 'Label', items: createTextStyleLayout('trigger') },
        { type: 'group', title: 'List', items: createTextStyleLayout('list') },
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
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

export const ArchivePopupComponent = {
  element: ArchivePopup,
  id: 'archive-popup',
  name: 'Archive Popup',
  category: 'ui-elements',
    preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Journal.png',
  },
  version: 1,
  schema,
  assetsPaths: {
    content: [{ path: 'image.assetId', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'triggerFontFamily' }, { path: 'listFontFamily' }],
  },
  fontRelations: {
    triggerFontSettings: 'triggerFontFamily',
    listFontSettings: 'listFontFamily',
  },
};
