import { LightboxJournal } from './LightboxJournal';
import {
  createJournalTextStylePanelTab,
  getJournalTextStyleSettingKey,
  JOURNAL_TEXT_STYLE_PREFIXES,
  type JournalTextStylePrefix,
} from './utils';
import { ComponentSchemaV1, SchemaProperty } from '../../types/SchemaV1';
import lightboxJournalSourceRaw from './LightboxJournal.tsx?raw';

const defaultCloseIconUrl =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M15.959 0.40332L0.402635 15.9597" stroke="#000000" stroke-width="1.14"/>' +
      '<path d="M15.959 15.9594L0.402635 0.403002" stroke="#000000" stroke-width="1.14"/>' +
    '</svg>',
  );

type JournalFontSettings = { fontWeight: number; fontStyle: string };

type JournalTextAppearanceSettings = {
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration: 'none' | 'underline';
  fontVariant: 'normal' | 'small-caps';
};

type JournalSchemaDefaultValue =
  | string
  | number
  | JournalFontSettings
  | JournalTextAppearanceSettings;

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

function createJournalTextStyleProperties(prefix: JournalTextStylePrefix): Record<string, SchemaProperty> {
  const properties: Record<string, SchemaProperty> = {};

  properties[getJournalTextStyleSettingKey(prefix, 'fontFamily')] = {
    type: 'string',
    scope: 'common',
    title: '',
    display: { type: 'font-family-select', hideLabel: true, useTabDesign: true },
  };
  properties[getJournalTextStyleSettingKey(prefix, 'fontSettings')] = {
    ...textStyleProperties.fontSettings,
    scope: 'common',
    title: '',
    display: { type: 'font-settings-weight', hideLabel: true, useTabDesign: true },
  };
  properties[getJournalTextStyleSettingKey(prefix, 'fontSize')] = {
    ...textStyleProperties.fontSize,
    scope: 'layout',
    title: '',
    display: { type: 'font-size' },
  };
  properties[getJournalTextStyleSettingKey(prefix, 'lineHeight')] = {
    ...textStyleProperties.lineHeight,
    scope: 'layout',
    title: '',
    display: { type: 'line-height-input' },
  };
  properties[getJournalTextStyleSettingKey(prefix, 'letterSpacing')] = {
    ...textStyleProperties.letterSpacing,
    scope: 'layout',
    title: '',
    display: { type: 'letter-spacing-input' },
  };
  properties[getJournalTextStyleSettingKey(prefix, 'wordSpacing')] = {
    ...textStyleProperties.wordSpacing,
    scope: 'layout',
    title: '',
    display: { type: 'word-spacing-input' },
  };
  properties[getJournalTextStyleSettingKey(prefix, 'textAlign')] = {
    ...textStyleProperties.textAlign,
    scope: 'layout',
    title: '',
    display: { type: 'vertical-text-aligh-options' },
  };
  properties[getJournalTextStyleSettingKey(prefix, 'textAppearance')] = {
    ...textStyleProperties.textAppearance,
    scope: 'layout',
    title: '',
    display: { type: 'text-appearance', useTabDesign: true },
  };

  return properties;
}

const textStylePropertiesByPrefix = JOURNAL_TEXT_STYLE_PREFIXES.reduce<Record<string, SchemaProperty>>(
  (properties, prefix) => ({
    ...properties,
    ...createJournalTextStyleProperties(prefix),
  }),
  {},
);

const textStyleDefaultsByPrefix = JOURNAL_TEXT_STYLE_PREFIXES.reduce<Record<string, JournalSchemaDefaultValue>>(
  (defaults, prefix) => ({
    ...defaults,
    [getJournalTextStyleSettingKey(prefix, 'fontFamily')]: 'Goudy Bookletter 1911',
    [getJournalTextStyleSettingKey(prefix, 'fontSettings')]: {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    [getJournalTextStyleSettingKey(prefix, 'letterSpacing')]: 0,
    [getJournalTextStyleSettingKey(prefix, 'wordSpacing')]: 0,
    [getJournalTextStyleSettingKey(prefix, 'textAlign')]: 'left',
    [getJournalTextStyleSettingKey(prefix, 'textAppearance')]: {
      textTransform: 'none',
      textDecoration: 'none',
      fontVariant: 'normal',
    },
  }),
  {},
);

type JournalTextLayoutDefaults = {
  title1FontSize?: number;
  title2FontSize?: number;
  title3FontSize?: number;
  countFontSize?: number;
  title1LineHeight?: number;
  title2LineHeight?: number;
  title3LineHeight?: number;
  countLineHeight?: number;
};

function createTextStyleLayoutDefaults(
  layoutDefaults: JournalTextLayoutDefaults,
): Partial<JournalTextLayoutDefaults> {
  return JOURNAL_TEXT_STYLE_PREFIXES.reduce<Record<string, number>>((defaults, prefix) => {
    const fontSize = layoutDefaults[`${prefix}FontSize` as keyof JournalTextLayoutDefaults];
    const lineHeight = layoutDefaults[`${prefix}LineHeight` as keyof JournalTextLayoutDefaults];
    if (fontSize !== undefined) {
      defaults[getJournalTextStyleSettingKey(prefix, 'fontSize')] = fontSize;
    }
    if (lineHeight !== undefined) {
      defaults[getJournalTextStyleSettingKey(prefix, 'lineHeight')] = lineHeight;
    }
    return defaults;
  }, {});
}

const textStylePanelTab = createJournalTextStylePanelTab();

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      cover: {
        type: 'string',
        scope: 'common',
        title: '',
        display: { type: 'settings-image-input' },
      },
      coverFit: {
        type: 'object',
        scope: 'common',
        title: 'Display',
        display: { type: 'image-ratio-control' },
        properties: {
          display: {
            type: 'string',
            enum: ['fit', 'cover'],
          },
          ratioValue: {
            type: 'string',
            enum: ['1:1', '2:3', '3:4', '4:5', '16:9'],
          },
          reversed: {
            type: 'boolean',
          },
        },
      },
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['A', 'B'],
      },
      maxHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Max Height (%)',
        min: 0,
        max: 100,
        display: { type: 'percentage-input' },
      },
      maxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Max Width (%)',
        min: 0,
        max: 100,
        display: { type: 'percentage-input' },
      },
      imageGap: {
        type: 'number',
        scope: 'layout',
        title: 'Image Gap',
        min: 0,
        display: { type: 'range-control', visible: false },
      },
      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'BG Default',
        display: { type: 'settings-color-picker' },
      },
      closeIcon: {
        type: ['string', 'null'] as const,
        scope: 'common',
        title: '',
        display: { type: 'settings-image-input' },
      },
      closeIconMaxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Max Width',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
      },
      closeIconColor: {
        type: 'string',
        scope: 'common',
        title: 'Icon Default',
        display: { type: 'settings-color-picker' },
      },
      closeIconHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Icon Hover',
        display: { type: 'settings-color-picker' },
      },
      textTransition: {
        type: 'string',
        scope: 'common',
        title: 'Transition',
        display: { type: 'toggle-cycle', enum: ['none', 'fade'] },
      },
      title1Width: {
        type: 'number',
        scope: 'layout',
        title: 'Title 1 width',
        min: 0,
        display: { type: 'range-control' },
      },
      title2Width: {
        type: 'number',
        scope: 'layout',
        title: 'Title 2 width',
        min: 0,
        display: { type: 'range-control' },
      },
      title3Width: {
        type: 'number',
        scope: 'layout',
        title: 'Title 3 width',
        min: 0,
        display: { type: 'range-control' },
      },
      title2MarginLeft: {
        type: 'number',
        scope: 'layout',
        title: 'Title 2 margin left',
        min: 0,
        display: { type: 'range-control' },
      },
      title3MarginLeft: {
        type: 'number',
        scope: 'layout',
        title: 'Title 3 margin left',
        min: 0,
        display: { type: 'range-control' },
      },
      titleHeaderLayout: {
        type: 'string',
        scope: 'layout',
        title: 'Title header layout',
        display: { type: 'toggle-cycle', enum: ['desktop', 'mobile'] },
      },
      title1MarginLeft: {
        type: 'number',
        scope: 'layout',
        title: 'Title 1 margin left',
        min: 0,
        display: { type: 'range-control' },
      },
      titleRowMarginBottom: {
        type: 'number',
        scope: 'layout',
        title: 'Title row margin bottom',
        min: 0,
        display: { type: 'range-control' },
      },
      countCloseGap: {
        type: 'number',
        scope: 'layout',
        title: 'Count / Close Gap',
        min: 0,
        display: { type: 'range-control' },
      },
      title1Color: {
        type: 'string',
        scope: 'common',
        title: 'Title Default',
        display: { type: 'palette-color-picker' },
      },
      title2Color: {
        type: 'string',
        scope: 'common',
        title: 'Subtitle Default',
        display: { type: 'palette-color-picker' },
      },
      title3Color: {
        type: 'string',
        scope: 'common',
        title: 'Caption Default',
        display: { type: 'palette-color-picker' },
      },
      countColor: {
        type: 'string',
        scope: 'common',
        title: 'Count Default',
        display: { type: 'palette-color-picker' },
      },
      ...textStylePropertiesByPrefix,
      contentMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Content margin top',
        min: 0,
        display: { type: 'range-control' },
      },
      iconMarginRight: {
        type: 'number',
        scope: 'layout',
        title: 'Icon margin right',
        min: 0,
        display: { type: 'range-control' },
      },
    },
    defaults: {
      cover: 'https://cdn.cntrl.site/component-assets/Component-default-1.jpg',
      coverFit: {
        display: 'fit',
        ratioValue: '1:1',
        reversed: false,
      },
      closeIcon: defaultCloseIconUrl,
      backgroundColor: 'rgb(255, 255, 255)',
      closeIconColor: '#000000',
      closeIconHoverColor: '#cccccc',
      textTransition: 'fade',
      title1Color: '#000000',
      title2Color: '#000000',
      title3Color: '#000000',
      countColor: '#000000',
      ...textStyleDefaultsByPrefix,
      countFontFamily: 'Arial',
    },
    layoutDefaults: {
      m: {
        type: 'B',
        imageGap: 0.01,
        maxHeight: 80,
        maxWidth: 80,
        closeIconMaxWidth: 0.08,
        contentMarginTop: 0.04,
        titleHeaderLayout: 'mobile',
        title1Width: 0.4,
        title2Width: 0.55,
        title3Width: 0.3,
        title1MarginLeft: 0.04,
        title2MarginLeft: 0.04,
        title3MarginLeft: 0.08,
        titleRowMarginBottom: 0.08,
        iconMarginRight: 0.01,
        countCloseGap: 0.005,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.04,
          title1LineHeight: 0.04,
          title2FontSize: 0.04,
          title2LineHeight: 0.04,
          title3FontSize: 0.04,
          title3LineHeight: 0.04,
          countFontSize: 0.04,
          countLineHeight: 0.04,
        }),
      },
      t: {
        type: 'A',
        imageGap: 0.05,
        maxHeight: 80,
        maxWidth: 40,
        closeIconMaxWidth: 0.03,
        contentMarginTop: 0.01,
        titleHeaderLayout: 'desktop',
        title1Width: 0.35,
        title2Width: 0.16,
        title3Width: 0.1,
        title1MarginLeft: 0.01,
        title2MarginLeft: 0.1,
        title3MarginLeft: 0.1,
        titleRowMarginBottom: 0,
        iconMarginRight: 0.01,
        countCloseGap: 0.03,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.0208,
          title1LineHeight: 0.0208,
          title2FontSize: 0.0208,
          title2LineHeight: 0.0208,
          title3FontSize: 0.0208,
          title3LineHeight: 0.0208,
          countFontSize: 0.0208,
          countLineHeight: 0.0208,
        }),
      },
      d: {
        type: 'A',
        maxHeight: 80,
        maxWidth: 40,
        imageGap: 0.05,
        closeIconMaxWidth: 0.0125,
        contentMarginTop: 0.01,
        titleHeaderLayout: 'desktop',
        title1Width: 0.35,
        title2Width: 0.248,
        title3Width: 0.1,
        title1MarginLeft: 0.01,
        title2MarginLeft: 0.1,
        title3MarginLeft: 0.1,
        titleRowMarginBottom: 0,
        iconMarginRight: 0.01,
        countCloseGap: 0.02,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.0098,
          title1LineHeight: 0.0098,
          title2FontSize: 0.0098,
          title2LineHeight: 0.0098,
          title3FontSize: 0.0098,
          title3LineHeight: 0.0098,
          countFontSize: 0.008,
          countLineHeight: 0.0098,
        }),
      },
    },
    layout: [
      '__componentName__',
      'maxWidth',
      'maxHeight',
      'imageGap',
      'title1Width',
      'title2Width',
      'title3Width',
      'title2MarginLeft',
      'title3MarginLeft',
      'titleHeaderLayout',
      'titleRowMarginBottom',
      'title1MarginLeft',
      'countCloseGap',
      'contentMarginTop',
      'iconMarginRight',
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__'] },
        { type: 'row', items: ['type'] },
        { type: 'row', title: 'Image', items: ['maxWidth', 'maxHeight'] },
        { type: 'row', title: 'Text', items: ['textTransition'] },
        { type: 'row', title: 'Close icon', items: ['closeIcon', 'closeIconMaxWidth'] },
        { type: 'row', title: 'Cover Image', items: ['cover', 'coverFit'] },
      ],
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
    items: ['title1Color', 'title2Color', 'title3Color', 'backgroundColor', 'countColor', 'closeIconColor', 'closeIconHoverColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemWithoutImage: true,
    },
    items: {
      type: 'object',
      properties: {
        title1: {
          type: 'string',
          label: 'Title',
          placeholder: 'Add Title...',
          display: { type: 'text-input' },
        },
        title2: {
          type: 'string',
          label: 'Subtitle',
          placeholder: 'Add Subtitle...',
          display: { type: 'text-input' },
        },
        title3: {
          type: 'string',
          label: 'Caption',
          placeholder: 'Add Caption...',
          display: { type: 'text-input' },
        },
        image: {
          type: 'object',
          label: 'Image',
          max: 2,
          display: {
            type: 'media-list-input',
          },
          properties: {
            url: { type: 'string' },
            name: { type: 'string' },
            objectFit: { type: 'string', enum: ['cover', 'contain'] },
          },
          required: ['url', 'name'],
        },
      },
    },
    default: [
      {
        title1: 'NASA',
        title2: 'Apollo 9 Mission, 1969',
        title3: 'Archival Footage',
        image: [
          {
            url: 'https://cdn.cntrl.site/component-assets/Component-default-2.jpg',
            name: '',
            objectFit: 'contain',
          },
          {
            url: 'https://cdn.cntrl.site/component-assets/Component-default-3.jpg',
            name: '',
            objectFit: 'contain',
          },
        ],
      },
      {
        title1: 'NASA',
        title2: 'Apollo 9 Mission, 1969',
        title3: 'Archival Footage',
        image: [
          {
            url: 'https://cdn.cntrl.site/component-assets/Component-default-4.jpg',
            name: '',
            objectFit: 'contain',
          }
        ],
      },
      {
        title1: 'NASA',
        title2: 'Apollo 9 Mission, 1969',
        title3: 'Archival Footage',
        image: [
          {
            url: 'https://cdn.cntrl.site/component-assets/Component-default-5.jpg',
            name: '',
            objectFit: 'contain',
          },
          {
            url: 'https://cdn.cntrl.site/component-assets/Component-default-6.jpg',
            name: '',
            objectFit: 'contain',
          },
        ],
      },
      {
        title1: 'NASA',
        title2: 'Apollo 9 Mission, 1969',
        title3: 'Archival Footage',
        image: [
          {
            url: 'https://cdn.cntrl.site/component-assets/Component-default-7.jpg',
            name: '',
            objectFit: 'contain',
          },
        ],
      },
    ],
  },
};

export const LightboxJournalComponent = {
  element: LightboxJournal,
  id: 'lightbox-journal',
  name: 'Journal',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: 350,
    },
    t: {
      width: 300,
    },
    m: {
      width: 300,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Journal.png',
  },
  schema,
  sourceCode: lightboxJournalSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [{ path: 'cover', placeholderEnabled: true }], 
  },
  fontSettingsPaths: {
    content: [],
    parameters: [...JOURNAL_TEXT_STYLE_PREFIXES.map((prefix) => ({ path: `${getJournalTextStyleSettingKey(prefix, 'fontFamily')}` }))]
  },
  fontRelations: {
    ...JOURNAL_TEXT_STYLE_PREFIXES.reduce((acc, prefix) => ({
      ...acc,
      [`${prefix}FontSettings`]: `${getJournalTextStyleSettingKey(prefix, 'fontFamily')}`,
    }), {}),
  },
};
