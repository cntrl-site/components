import { Hive } from './Hive';
import { ComponentSchemaV1, SchemaProperty } from '../../types/SchemaV1';
import {
  createJournalTextStyleTabContentItems,
  getJournalTextStyleSettingKey,
  JOURNAL_TEXT_STYLE_PREFIXES,
  JOURNAL_TEXT_STYLE_TAB_LABELS,
  type JournalTextStylePrefix,
} from '../LightboxJournal/utils';
import hiveSourceRaw from './Hive.tsx?raw';

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

const HIVE_TEXT_STYLE_PREFIXES = JOURNAL_TEXT_STYLE_PREFIXES.filter(
  (prefix): prefix is Exclude<JournalTextStylePrefix, 'count'> => prefix !== 'count',
);

const textStylePropertiesByPrefix = HIVE_TEXT_STYLE_PREFIXES.reduce<Record<string, SchemaProperty>>(
  (properties, prefix) => ({
    ...properties,
    ...createJournalTextStyleProperties(prefix),
  }),
  {},
);

const textStyleDefaultsByPrefix = HIVE_TEXT_STYLE_PREFIXES.reduce<Record<string, JournalSchemaDefaultValue>>(
  (defaults, prefix) => ({
    ...defaults,
    [getJournalTextStyleSettingKey(prefix, 'fontFamily')]: 'Arial',
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
  title1LineHeight?: number;
  title2LineHeight?: number;
  title3LineHeight?: number;
};

function createTextStyleLayoutDefaults(
  layoutDefaults: JournalTextLayoutDefaults,
): Partial<JournalTextLayoutDefaults> {
  return HIVE_TEXT_STYLE_PREFIXES.reduce<Record<string, number>>((defaults, prefix) => {
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

const textStylePanelTab = {
  type: 'tab' as const,
  id: 'journalTextStyle',
  tabs: Object.fromEntries(
    HIVE_TEXT_STYLE_PREFIXES.map((prefix) => [
      JOURNAL_TEXT_STYLE_TAB_LABELS[prefix],
      createJournalTextStyleTabContentItems(prefix),
    ]),
  ),
};

const HIVE_DEFAULT_TITLES = {
  title1: 'NASA',
  title2: 'Ames Research Center',
  title3: 'Archive Footage',
};

const HIVE_DEFAULT_CONTENT = (() => {
  const items = [];
  for (let i = 1; i <= 24; i += 1) {
    items.push({
      ...HIVE_DEFAULT_TITLES,
      gallery: [{
        media: [{
          url: `https://cdn.cntrl.site/component-assets/hive_${i}.jpg`,
          name: '',
          objectFit: 'cover' as const,
        }, {
          url: '',
          name: '',
          objectFit: 'cover' as const,
        }],
      }],
    });
  }
  return items;
})();

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: true,
      allowsVideo: true,
    },
    display: {
      type: 'array',
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
        gallery: {
          type: 'array',
          label: 'Gallery',
          max: 1,
          display: {
            type: 'media-pair-list-input',
          },
          items: {
            type: 'object',
            properties: {
              media: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    name: { type: 'string' },
                    type: {
                      type: 'string',
                      enum: ['image', 'video'],
                    },
                    objectFit: {
                      type: 'string',
                      enum: ['cover', 'contain'],
                    },
                  },
                },
              },
            },
          },
        },
      },
      required: ['gallery'],
    },
    default: HIVE_DEFAULT_CONTENT,
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      gridLayout: {
        type: 'grid-layout',
        scope: 'layout',
        display: { type: 'grid-layout' },
        gridParams: {
          type: 'object',
          properties: {
            columnsCount: {
              type: 'number',
              title: 'Columns',
              min: 1,
              max: 9999,
              display: { type: 'numeric-input' },
            },
            wrapperWidth: {
              type: 'number',
              title: 'Width',
              min: 0,
            },
            entryWidth: {
              type: 'number',
              title: 'Entry',
              min: 0,
            },
            horizontalGap: {
              type: 'number',
              title: 'Gutter',
              min: 0,
            },
          },
        },
      },
      verticalGap: {
        type: 'number',
        scope: 'layout',
        title: 'Vertical Gap',
        display: { type: 'numeric-input' },
        min: 0,
        max: 1000,
      },
      align: {
        type: 'string',
        scope: 'layout',
        title: 'Align',
        display: { type: 'toggle-cycle', enum: ['top', 'center', 'bottom'] },
      },
      imageDisplay: {
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
      contentMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Content margin top',
        min: 0,
        display: { type: 'range-control' },
      },
      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'BG Lightbox',
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
      iconMarginRight: {
        type: 'number',
        scope: 'layout',
        title: 'Icon margin right',
        min: 0,
        display: { type: 'range-control' },
      },
      ...textStylePropertiesByPrefix,
    },
    defaults: {
      imageDisplay: {
        display: 'fit',
        ratioValue: '2:3',
        reversed: false,
      },
      align: 'top',
      title1Color: '#000000',
      title2Color: '#000000',
      title3Color: '#000000',
      backgroundColor: '#FFFFFF',
      closeIcon: defaultCloseIconUrl,
      closeIconColor: '#000000',
      closeIconHoverColor: '#999999',
      ...textStyleDefaultsByPrefix,
    },
    layoutDefaults: {
      m: {
        gridLayout: {
          entryWidth: 0.37837,
          horizontalGap: 0.0810,
          wrapperWidth: 1,
          columnsCount: 2,
          lockedParam: 'wrapperWidth',
        },
        verticalGap: 0.0810,
        titleHeaderLayout: 'mobile',
        title1Width: 0.4,
        title2Width: 0.464864,
        title3Width: 0.3,
        title1MarginLeft: 0.04,
        title2MarginLeft: 0.04,
        title3MarginLeft: 0.08,
        titleRowMarginBottom: 0.08,
        contentMarginTop: 0.0810,
        closeIconMaxWidth: 0.0810,
        iconMarginRight: 0.05405,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.04864,
          title1LineHeight: 0.056756,
          title2FontSize: 0.04864,
          title2LineHeight: 0.056756,
          title3FontSize: 0.04864,
          title3LineHeight: 0.056756,
        }),
      },
      t: {
        gridLayout: {
          entryWidth: 0.10416,
          horizontalGap: 0.013,
          wrapperWidth: 1,
          columnsCount: 8,
          lockedParam: 'wrapperWidth',
        },
        verticalGap: 0.013,
        titleHeaderLayout: 'desktop',
        title1Width: 0.3,
        title2Width: 0.248,
        title3Width: 0.1,
        title1MarginLeft: 0.01,
        title2MarginLeft: 0.1,
        title3MarginLeft: 0.1,
        titleRowMarginBottom: 0,
        contentMarginTop: 0.026,
        closeIconMaxWidth: 0.039,
        iconMarginRight: 0.026,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.02083,
          title1LineHeight: 0.02734,
          title2FontSize: 0.02083,
          title2LineHeight: 0.02734,
          title3FontSize: 0.02083,
          title3LineHeight: 0.02734,
        }),
      },
      d: {
        gridLayout: {
          entryWidth: 0.06944,
          horizontalGap: 0.006944,
          wrapperWidth: 1,
          columnsCount: 12,
          lockedParam: 'wrapperWidth',
        },
        verticalGap: 0.00694,
        titleHeaderLayout: 'desktop',
        title1Width: 0.35,
        title2Width: 0.248,
        title3Width: 0.1,
        title1MarginLeft: 0.01,
        title2MarginLeft: 0.1,
        title3MarginLeft: 0.1,
        titleRowMarginBottom: 0,
        contentMarginTop: 0.01,
        closeIconMaxWidth: 0.0125,
        iconMarginRight: 0.01,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.0098,
          title1LineHeight: 0.0098,
          title2FontSize: 0.0098,
          title2LineHeight: 0.0098,
          title3FontSize: 0.0098,
          title3LineHeight: 0.0098,
        }),
      },
    },
    displayRules: [
      {
        if: { name: 'imageDisplay.display', value: 'cover' },
        then: { name: 'properties.align.display.enabled', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'gridLayout',
      'verticalGap',
      'align',
      'imageDisplay',
      'title1Width',
      'title2Width',
      'title3Width',
      'title2MarginLeft',
      'title3MarginLeft',
      'titleHeaderLayout',
      'titleRowMarginBottom',
      'title1MarginLeft',
      'contentMarginTop',
      'closeIconMaxWidth',
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
        '__componentName__',
        {
          type: 'row',
          title: '',
          items: [
            { type: 'group', title: '', items: ['gridLayout'] },
          ],
        },
        { type: 'row', title: '', items: ['verticalGap'] },
        { type: 'row', title: '', items: ['imageDisplay', 'align'] },
        { type: 'row', title: 'Close icon', items: ['closeIcon', 'closeIconMaxWidth'] },
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
    items: ['title1Color', 'title2Color', 'title3Color', 'backgroundColor', 'closeIconColor', 'closeIconHoverColor'],
    panelIds: ['general', 'typeStyle'],
  },
};

export const HiveComponent = {
  element: Hive,
  id: 'hive',
  name: 'Hive',
  category: 'grids',
  layoutMode: 'structured' as const,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/hive.png',
  },
  version: 1,
  defaultSize: {
    d: {
      width: 720,
      height: 540,
    },
  },
  assetsPaths: {
    content: [{ path: 'gallery.media.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [...HIVE_TEXT_STYLE_PREFIXES.map((prefix) => ({ path: `${getJournalTextStyleSettingKey(prefix, 'fontFamily')}` }))],
  },
  fontRelations: {
    ...HIVE_TEXT_STYLE_PREFIXES.reduce((acc, prefix) => ({
      ...acc,
      [`${prefix}FontSettings`]: `${getJournalTextStyleSettingKey(prefix, 'fontFamily')}`,
    }), {}),
  },
  schema,
  sourceCode: hiveSourceRaw,
};
