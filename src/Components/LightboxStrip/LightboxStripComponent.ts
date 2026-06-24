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
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">' +
      '<path fill="#000000" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />' +
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
    [getStripTextStyleSettingKey(prefix, 'fontFamily')]: 'Arial',
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
            enum: ['Fit', 'Cover'],
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
        scope: 'common',
        title: '',
        display: { type: 'radio-group' },
        enum: ['A', 'B'],
      },
      thumbnailGap: {
        type: 'number',
        scope: 'layout',
        title: 'Thumbnail Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      thumbnailMarginBottom: {
        type: 'number',
        scope: 'layout',
        title: 'Thumbnail Margin Bottom',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      imageGap: {
        type: 'number',
        scope: 'layout',
        title: 'Image Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      backgroundColor: {
        type: 'string',
        scope: 'layout',
        title: 'BG Default',
        display: { type: 'settings-color-picker' },
      },
      contentBackgroundColor: {
        type: 'string',
        scope: 'layout',
        title: 'Header BG Default',
        display: { type: 'settings-color-picker', visible: true },
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
        scope: 'common',
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
            enum: ['Fit', 'Cover'],
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
      textMaxWidth: {
        type: 'string',
        scope: 'common',
        title: 'Max Width',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
      },
      title1Gap: {
        type: 'number',
        scope: 'layout',
        title: 'Title 1 Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      title2Gap: {
        type: 'number',
        scope: 'layout',
        title: 'Title 2 Gap',
        min: 0,
        max: 200,
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
      ...textStylePropertiesByPrefix,
      contentMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Content margin top',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      contentMarginBottom: {
        type: 'number',
        scope: 'layout',
        title: 'Content margin bottom',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      contentMarginLeft: {
        type: 'number',
        scope: 'layout',
        title: 'Content margin left',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      contentMarginRight: {
        type: 'number',
        scope: 'layout',
        title: 'Content margin right',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
    },
    defaults: {
      cover: 'https://cdn.cntrl.site/component-assets/LightboxJournal_1.jpg',
      coverFit: {
        display: 'Cover',
        ratioValue: '16:9',
        reversed: false,
      },
      type: 'A',
      closeIcon: defaultCloseIconUrl,
      closeIconColor: '#ffffff',
      closeIconHoverColor: '#cccccc',
      thumbnailVisibility: 'on',
      thumbnailSize: 'S',
      thumbnailObjectFit: {
        display: 'Fit',
        ratioValue: '16:9',
        reversed: false,
      },
      thumbnailTrigger: 'click',
      thumbnailActive: 'color',
      thumbnailActiveColor: '#ffffff',
      title1Color: '#ffffff',
      title2Color: '#ffffff',
      title3Color: '#ffffff',
      ...textStyleDefaultsByPrefix,
    },
    layoutDefaults: {
      m: {
        thumbnailGap: 0.04,
        thumbnailMarginBottom: 0.04,
        imageGap: 0.005,
        textMaxWidth: 0.4,
        closeIconMaxWidth: 0.02,
        backgroundColor: 'rgba(28, 31, 34, 0.9)',
        contentBackgroundColor: 'rgb(10, 10, 10)',
        contentMarginTop: 0,
        contentMarginBottom: 0,
        contentMarginLeft: 0.02,
        contentMarginRight: 0.2,
        title1Gap: 0.1,
        title2Gap: 0.1,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.01,
          title1LineHeight: 0.02,
          title2FontSize: 0.01,
          title2LineHeight: 0.02,
          title3FontSize: 0.01,
          title3LineHeight: 0.02,
        }),
      },
      d: {
        thumbnailGap: 0.02,
        thumbnailMarginBottom: 0.02,
        imageGap: 0.005,
        textMaxWidth: 0.4,
        closeIconMaxWidth: 0.02,
        backgroundColor: 'rgba(28, 31, 34, 0.9)',
        contentBackgroundColor: 'rgb(10, 10, 10)',
        contentMarginTop: 0.02,
        contentMarginBottom: 0.02,
        contentMarginLeft: 0.02,
        contentMarginRight: 0.02,
        title1Gap: 0.1,
        title2Gap: 0.1,
        ...createTextStyleLayoutDefaults({
          title1FontSize: 0.015,
          title1LineHeight: 0.02,
          title2FontSize: 0.015,
          title2LineHeight: 0.02,
          title3FontSize: 0.015,
          title3LineHeight: 0.02,
        }),
      },
    },
    displayRules: [
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.contentBackgroundColor.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.contentMarginBottom.display.visible', value: false },
      },
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
      'title1Gap',
      'title2Gap',
      'contentMarginTop',
      'contentMarginBottom',
      'contentMarginLeft',
      'contentMarginRight',
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
        { type: 'row', title: 'Thumbnails', items: ['thumbnailVisibility', 'thumbnailObjectFit']},
        { type: 'row', items: ['thumbnailTrigger', 'thumbnailActive']},
        { type: 'row', title: 'Text', items: ['textMaxWidth'] },
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
    items: ['title1Color', 'title2Color', 'title3Color', 'contentBackgroundColor', 'backgroundColor', 'closeIconColor', 'closeIconHoverColor', 'thumbnailActiveColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: true,
      stripFieldsOnAdd: ['title1', 'title2', 'title3', 'text'],
    },
    items: {
      type: 'object',
      properties: {
        image: {
          type: 'object',
          label: 'Image',
          display: {
            type: 'media-input',
            supportsMainImage: true,
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
          url: 'https://cdn.cntrl.site/component-assets/LightboxStrip_1.jpg',
          name: '',
          objectFit: 'contain',
        },
        title1: 'Ethan Parker',
        title2: 'Midnight Atlas',
        title3: 'Portland, OR',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/LightboxStrip_2.jpg',
          name: '',
          objectFit: 'contain',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/LightboxStrip_3.jpg',
          name: '',
          objectFit: 'contain',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/LightboxStrip_4.jpg',
          name: '',
          objectFit: 'contain',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/LightboxStrip_5.jpg',
          name: '',
          objectFit: 'contain',
        },
      },
    ],
  },
};

export const LightboxStripComponent = {
  element: LightboxStrip,
  id: 'lightbox-strip',
  name: 'Lightbox Strip',
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
    parameters: STRIP_TEXT_STYLE_PREFIXES.map((prefix) => ({
      path: `styles.${getStripTextStyleSettingKey(prefix, 'fontSettings')}`,
    })),
  },
};
