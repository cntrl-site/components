import {
  createStripTextStylePanelTab,
  getStripTextStyleSettingKey,
  STRIP_TEXT_STYLE_PREFIXES,
  StripTextStylePrefix,
  LightboxStrip,
} from './LightboxStrip';
import { ComponentSchemaV1, SchemaProperty } from '../../types/SchemaV1';
import lightboxStripSourceRaw from './LightboxStrip.tsx?raw';

const defaultCloseIconUrl =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M15.959 0.40332L0.402635 15.9597" stroke="#000000" stroke-width="1.14"/>' +
      '<path d="M15.959 15.9594L0.402635 0.403002" stroke="#000000" stroke-width="1.14"/>' +
    '</svg>',
  );

type StripFontSettings = { fontWeight: number; fontStyle: string };

type StripTextAppearanceSettings = {
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration: 'none' | 'underline';
  fontVariant: 'normal' | 'small-caps';
};

type StripSchemaDefaultValue =
  | string
  | number
  | StripFontSettings
  | StripTextAppearanceSettings;

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

function createStripTextStyleProperties(prefix: StripTextStylePrefix): Record<string, SchemaProperty> {
  const properties: Record<string, SchemaProperty> = {};

  properties[getStripTextStyleSettingKey(prefix, 'fontFamily')] = {
    type: 'string',
    scope: 'common',
    title: '',
    display: { type: 'font-family-select', hideLabel: true, useTabDesign: true },
  };
  properties[getStripTextStyleSettingKey(prefix, 'fontSettings')] = {
    ...textStyleProperties.fontSettings,
    scope: 'common',
    title: '',
    display: { type: 'font-settings-weight', hideLabel: true, useTabDesign: true },
  };
  properties[getStripTextStyleSettingKey(prefix, 'fontSize')] = {
    ...textStyleProperties.fontSize,
    scope: 'layout',
    title: '',
    display: { type: 'font-size' },
  };
  properties[getStripTextStyleSettingKey(prefix, 'lineHeight')] = {
    ...textStyleProperties.lineHeight,
    scope: 'layout',
    title: '',
    display: { type: 'line-height-input' },
  };
  properties[getStripTextStyleSettingKey(prefix, 'letterSpacing')] = {
    ...textStyleProperties.letterSpacing,
    scope: 'layout',
    title: '',
    display: { type: 'letter-spacing-input' },
  };
  properties[getStripTextStyleSettingKey(prefix, 'wordSpacing')] = {
    ...textStyleProperties.wordSpacing,
    scope: 'layout',
    title: '',
    display: { type: 'word-spacing-input' },
  };
  properties[getStripTextStyleSettingKey(prefix, 'textAlign')] = {
    ...textStyleProperties.textAlign,
    scope: 'layout',
    title: '',
    display: { type: 'vertical-text-aligh-options' },
  };
  properties[getStripTextStyleSettingKey(prefix, 'textAppearance')] = {
    ...textStyleProperties.textAppearance,
    scope: 'layout',
    title: '',
    display: { type: 'text-appearance', useTabDesign: true },
  };

  return properties;
}

const textStylePropertiesByPrefix = STRIP_TEXT_STYLE_PREFIXES.reduce<Record<string, SchemaProperty>>(
  (properties, prefix) => ({
    ...properties,
    ...createStripTextStyleProperties(prefix),
  }),
  {},
);

const textStyleDefaultsByPrefix = STRIP_TEXT_STYLE_PREFIXES.reduce<Record<string, StripSchemaDefaultValue>>(
  (defaults, prefix) => ({
    ...defaults,
    [getStripTextStyleSettingKey(prefix, 'fontFamily')]: 'Goudy Bookletter 1911',
    [getStripTextStyleSettingKey(prefix, 'fontSettings')]: {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    [getStripTextStyleSettingKey(prefix, 'letterSpacing')]: 0,
    [getStripTextStyleSettingKey(prefix, 'wordSpacing')]: 0,
    [getStripTextStyleSettingKey(prefix, 'textAlign')]: 'left',
    [getStripTextStyleSettingKey(prefix, 'textAppearance')]: {
      textTransform: 'none',
      textDecoration: 'none',
      fontVariant: 'normal',
    },
  }),
  {},
);

type StripTextLayoutDefaults = {
  title1FontSize?: number;
  title2FontSize?: number;
  title3FontSize?: number;
  title1LineHeight?: number;
  title2LineHeight?: number;
  title3LineHeight?: number;
};

function createTextStyleLayoutDefaults(
  layoutDefaults: StripTextLayoutDefaults,
): Partial<StripTextLayoutDefaults> {
  return STRIP_TEXT_STYLE_PREFIXES.reduce<Record<string, number>>((defaults, prefix) => {
    const fontSize = layoutDefaults[`${prefix}FontSize` as keyof StripTextLayoutDefaults];
    const lineHeight = layoutDefaults[`${prefix}LineHeight` as keyof StripTextLayoutDefaults];
    if (fontSize !== undefined) {
      defaults[getStripTextStyleSettingKey(prefix, 'fontSize')] = fontSize;
    }
    if (lineHeight !== undefined) {
      defaults[getStripTextStyleSettingKey(prefix, 'lineHeight')] = lineHeight;
    }
    return defaults;
  }, {});
}

const textStylePanelTab = createStripTextStylePanelTab();

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
      thumbnailSize: {
        type: 'number',
        scope: 'layout',
        title: 'Thumbnail Size',
        min: 0,
        display: { type: 'range-control' },
      },
      thumbnailGap: {
        type: 'number',
        scope: 'layout',
        title: 'Thumbnail Gap',
        min: 0,
        display: { type: 'range-control' },
      },
      thumbnailMarginBottom: {
        type: 'number',
        scope: 'layout',
        title: 'Thumbnail Margin Bottom',
        min: 0,
        display: { type: 'range-control' },
      },
      imageGap: {
        type: 'number',
        scope: 'layout',
        title: 'Image Gap',
        min: 0,
        display: { type: 'range-control' },
      },
      backgroundColor: {
        type: 'string',
        scope: 'layout',
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
        display: { type:'full-width-input' },
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
      thumbnailVisibility: {
        type: 'boolean',
        scope: 'layout',
        title: 'Visibility',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      thumbnailObjectFit: {
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
      thumbnailTrigger: {
        type: 'string',
        scope: 'common',
        title: 'Trigger',
        display: { type: 'toggle-cycle', enum: ['click', 'hover'] },
      },
      thumbnailActive: {
        type: 'boolean',
        scope: 'common',
        title: 'Active',
        display: { type: 'toggle-cycle', enum: ['outline', 'color', 'scale-up'] },
      },
      thumbnailActiveColor: {
        type: 'string',
        scope: 'common',
        title: 'Outline Active',
        display: { type: 'palette-color-picker', visible: false },
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
      ...textStylePropertiesByPrefix,
      contentMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Content margin top',
        min: 0,
        display: { type: 'range-control' },
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
      iconMarginLeft: {
        type: 'number',
        scope: 'layout',
        title: 'Icon margin left',
        min: 0,
        display: { type: 'range-control' },
      },
    },
    defaults: {
      cover: 'https://cdn.cntrl.site/component-assets/lightbox_strip_1.jpg',
      coverFit: {
        display: 'fit',
        ratioValue: '1:1',
        reversed: false,
      },
      closeIcon: defaultCloseIconUrl,
      closeIconColor: '#000000',
      closeIconHoverColor: '#cccccc',
      thumbnailObjectFit: {
        display: 'fit',
        ratioValue: '16:9',
        reversed: false,
      },
      thumbnailTrigger: 'click',
      thumbnailActive: 'color',
      thumbnailActiveColor: '#ffffff',
      title1Color: '#000000',
      title2Color: '#000000',
      title3Color: '#000000',
      ...textStyleDefaultsByPrefix
    },
    layoutDefaults: {
      m: {
        thumbnailSize: 0.1,
        thumbnailVisibility: 'off',
        titleHeaderLayout: 'mobile',
        thumbnailGap: 0.04,
        thumbnailMarginBottom: 0.04,
        imageGap: 0.005,
        title1Width: 0.25,
        title2Width: 0.6,
        title3Width: 0.25,
        title1MarginLeft: 0.04,
        title2MarginLeft: 0.04,
        title3MarginLeft: 0.04,
        titleRowMarginBottom: 0.08,
        closeIconMaxWidth: 0.04,
        backgroundColor: '#FFFFFF',
        contentMarginTop: 0.08,
        iconMarginLeft: 0.02,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.04,
          title1LineHeight: 0.04,
          title2FontSize: 0.04,
          title2LineHeight: 0.04,
          title3FontSize: 0.04,
          title3LineHeight: 0.04,
        }),
      },
      d: {
        thumbnailSize: 0.03,
        thumbnailVisibility: 'on',
        titleHeaderLayout: 'desktop',
        thumbnailGap: 0.02,
        thumbnailMarginBottom: 0.007,
        imageGap: 0.005,
        title1Width: 0.29,
        title2Width: 0.13,
        title3Width: 0.14,
        title1MarginLeft: 0.015,
        title2MarginLeft: 0.1,
        title3MarginLeft: 0.1,
        titleRowMarginBottom: 0,
        closeIconMaxWidth: 0.02,
        backgroundColor: '#FFFFFF',
        contentMarginTop: 0.015,
        iconMarginLeft: 0.02,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.011,
          title1LineHeight: 0.02,
          title2FontSize: 0.011,
          title2LineHeight: 0.02,
          title3FontSize: 0.011,
          title3LineHeight: 0.02,
        }),
      },
    },
    displayRules: [
      {
        if: { name: 'thumbnailActive', value: 'outline' },
        then: { name: 'properties.thumbnailActiveColor.display.visible', value: true },
      },
    ],
    layout: [
      '__componentName__',
      'thumbnailGap',
      'thumbnailMarginBottom',
      'imageGap',
      'title1Width',
      'title2Width',
      'title3Width',
      'title2MarginLeft',
      'title3MarginLeft',
      'titleHeaderLayout',
      'titleRowMarginBottom',
      'contentMarginTop',
      'title1MarginLeft',
      'iconMarginLeft',
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
        { type: 'row', title: 'Thumbnails', items: ['thumbnailVisibility', 'thumbnailObjectFit']},
        { type: 'row', items: ['thumbnailTrigger', 'thumbnailActive']},
        { type: 'row', title: 'Close icon', items: ['closeIcon', 'closeIconMaxWidth'] },
        { type: 'row', title: 'Cover', items: ['cover', 'coverFit'] },
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
    items: ['title1Color', 'title2Color', 'title3Color', 'backgroundColor', 'closeIconColor', 'closeIconHoverColor', 'thumbnailActiveColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: true,
    },
    items: {
      type: 'object',
      properties: {
        image: {
          type: 'object',
          label: 'Image',
          display: {
            isObjectFitEditable: false,
            defaultObjectFit: 'contain',
            type: 'media-input',
          },
        },
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
      },
    },
    default: [
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/lightbox_strip_2.jpg',
          name: '',
          objectFit: 'contain',
        },
        title1: 'Giovanni Andrea Vavassore',
        title2: 'ESEMPLA',
        title3: 'Venice, 1500',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/lightbox_strip_3.jpg',
          name: '',
          objectFit: 'contain',
        },
        title1: 'Giovanni Andrea Vavassore',
        title2: 'ESEMPLA',
        title3: 'Venice, 1500',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/lightbox_strip_4.jpg',
          name: '',
          objectFit: 'contain',
        },
        title1: 'Giovanni Andrea Vavassore',
        title2: 'ESEMPLA',
        title3: 'Venice, 1500',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/lightbox_strip_5.jpg',
          name: '',
          objectFit: 'contain',
        },
        title1: 'Giovanni Andrea Vavassore',
        title2: 'ESEMPLA',
        title3: 'Venice, 1500',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/lightbox_strip_6.jpg',
          name: '',
          objectFit: 'contain',
        },
        title1: 'Giovanni Andrea Vavassore',
        title2: 'ESEMPLA',
        title3: 'Venice, 1500',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/lightbox_strip_7.jpg',
          name: '',
          objectFit: 'contain',
        },
        title1: 'Giovanni Andrea Vavassore',
        title2: 'ESEMPLA',
        title3: 'Venice, 1500',
      },
    ],
  },
};

export const LightboxStripComponent = {
  element: LightboxStrip,
  id: 'lightbox-strip',
  name: 'Strip',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: 350,
      height: 350,
    },
    m: {
      width: 300,
      height: 350,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Strip.mp4',
  },
  schema,
  sourceCode: lightboxStripSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [], 
  },
  fontSettingsPaths: {
    content: [],
    parameters: [...STRIP_TEXT_STYLE_PREFIXES.map((prefix) => ({ path: `settings.${getStripTextStyleSettingKey(prefix, 'fontFamily')}` }))]
  },
  fontRelations: {
    ...STRIP_TEXT_STYLE_PREFIXES.reduce((acc, prefix) => ({
      ...acc,
      [prefix]: `settings.${getStripTextStyleSettingKey(prefix, 'fontFamily')}`,
    }), {}),
  },
};
