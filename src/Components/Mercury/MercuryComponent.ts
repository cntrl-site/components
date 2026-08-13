import { Mercury } from './Mercury';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import mercurySourceRaw from './Mercury.tsx?raw';

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

const schema: ComponentSchemaV1 = {
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
    },
    items: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          label: 'Title',
          placeholder: 'Add Title...',
          display: {
            type: 'text-input',
          },
        },
        gallery: {
          type: 'array',
          label: 'Gallery',
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
    default: [
      {
        title: 'Earth-orbital mission',
        gallery: [
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-1.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-3.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-6.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
        ],
      },
      {
        title: 'Salton Sea from Above',
        gallery: [
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-11.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-7.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
        ],
      },
      {
        title: 'Lunar Module Pilot',
        gallery: [
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-2.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-5.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-8.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
        ],
      },
      {
        title: 'Command Module',
        gallery: [
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-9.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
          {
            media: [
              { url: 'https://cdn.cntrl.site/component-assets/Component-default-10.jpg', name: '', objectFit: 'cover' },
              { url: '', name: '', objectFit: 'cover' },
            ],
          },
        ],
      },
    ],
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      wrapperWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b', 'c'],
      },
      imgWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Img width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      titleWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
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
      galleryPaddingRight: createRangeControlLayoutProperty('Gallery Padding Right'),
      galleryPaddingLeft: createRangeControlLayoutProperty('Gallery Padding Left'),
      galleryPaddingBetween: createRangeControlLayoutProperty('Gallery Padding Between'),
      cornerRadius: {
        type: 'number',
        scope: 'layout',
        title: 'Corner radius',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      imgCaption: {
        type: 'boolean',
        scope: 'common',
        title: 'Img caption',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      position: {
        type: 'string',
        scope: 'layout',
        title: 'Position',
        display: { type: 'toggle-cycle', enum: ['left', 'center', 'right', 'top'] },
      },
      titleTopPadding: createRangeControlLayoutProperty('Title Top Padding'),
      transition: {
        type: 'string',
        scope: 'common',
        title: 'Transition',
        display: { type: 'toggle-cycle', enum: ['fade', 'retype', 'scroll'] },
      },
      titleColor: {
        type: 'string',
        scope: 'common',
        title: 'Title',
        display: { type: 'palette-color-picker' },
      },
      titleFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      titleFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      titleFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Input Font Size',
        display: { type: 'font-size' },
      },
      titleLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Input Line Height',
        display: { type: 'line-height-input' },
      },
      titleLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      titleWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      titleAlign: {
        ...textStyleProperties.textAlign,
        scope: 'layout',
        title: 'Align',
      },
      titleTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Input Text Appearance',
        display: { type: 'text-appearance' },
      },
      lightbox: {
        type: 'boolean',
        scope: 'common',
        title: 'Lightbox',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      lightboxImageDisplay: {
        type: 'string',
        scope: 'common',
        title: 'Display',
        display: { type: 'toggle-cycle', enum: ['fit', 'cover'] },
      },
      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'BG Lightbox',
        display: { type: 'settings-color-picker' },
      },
      lightboxCounterColor: {
        type: 'string',
        scope: 'common',
        title: 'Counter Lightbox',
        display: { type: 'palette-color-picker' },
      },
      lightboxCounterFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      lightboxCounterFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      lightboxCounterFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Input Font Size',
        display: { type: 'font-size' },
      },
      lightboxCounterLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Input Line Height',
        display: { type: 'line-height-input' },
      },
      lightboxCounterLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      lightboxCounterWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      lightboxCounterTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Input Text Appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      type: 'a',
      imgCaption: 'on',
      position: 'center',
      transition: 'scroll',
      titleColor: '#000000',
      titleFontFamily: 'Arial',
      titleFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      titleLetterSpacing: 0,
      titleWordSpacing: 0,
      titleAlign: 'left',
      titleTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      lightbox: 'on',
      imageDisplay: {
        display: 'fit',
        ratioValue: '2:3',
        reversed: false,
      },
      lightboxImageDisplay: 'fit',
      backgroundColor: 'rgba(28,31,34,0.9)',
      lightboxCounterColor: '#DEDDDD',
      lightboxCounterFontFamily: 'Goudy Bookletter 1911',
      lightboxCounterFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      lightboxCounterLetterSpacing: 0,
      lightboxCounterWordSpacing: 0,
      lightboxCounterTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
    layoutDefaults: {
      d: {
        wrapperWidth: 1,
        imgWidth: 300 / 1440,
        titleWidth: 400 / 1440,
        galleryPaddingRight: 0,
        galleryPaddingLeft: 0,
        galleryPaddingBetween: 0,
        titleTopPadding: 0,
        cornerRadius: 8 / 1440,
        titleFontSize: 0.027,
        titleLineHeight: 0.0222,
        lightboxCounterFontSize: 0.01,
        lightboxCounterLineHeight: 0.01,
      },
      m: {
        wrapperWidth: 1,
        imgWidth: 120 / 375,
        titleWidth: 220 / 375,
        galleryPaddingRight: 0,
        galleryPaddingLeft: 0,
        galleryPaddingBetween: 0,
        titleTopPadding: 0,
        cornerRadius: 8 / 375,
        titleFontSize: 0.1066,
        titleLineHeight: 0.0853,
        lightboxCounterFontSize: 0.0373,
        lightboxCounterLineHeight: 0.0373,
      },
      t: {
        wrapperWidth: 1,
        imgWidth: 300 / 768,
        titleWidth: 260 / 768,
        galleryPaddingRight: 0,
        galleryPaddingLeft: 0,
        galleryPaddingBetween: 0,
        titleTopPadding: 0,
        cornerRadius: 8 / 768,
        titleFontSize: 0.03255,
        titleLineHeight: 0.03255,
        lightboxCounterFontSize: 0.01,
        lightboxCounterLineHeight: 0.01,
      },
    },
    displayRules: [
      {
        if: { name: 'lightbox', value: 'off' },
        then: { name: 'properties.lightboxImageDisplay.display.enabled', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'type',
      'wrapperWidth',
      'imgWidth',
      'titleWidth',
      'imageDisplay',
      'cornerRadius',
      'imgCaption',
      'position',
      'transition',
      'lightbox',
      'lightboxImageDisplay',
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
        'type',
        { type: 'row', items: ['wrapperWidth', 'imgWidth'] },
        { type: 'row', items: ['cornerRadius', 'imgCaption'] },
        { type: 'row', items: ['imageDisplay'] },
        { type: 'row', title: 'Title', items: ['position', 'transition'] },
        'titleWidth',
        { type: 'row', title: 'Lightbox', items: ['lightbox', 'lightboxImageDisplay'] },
        { type: 'row', items: ['backgroundColor'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        {
          type: 'group',
          title: 'Title',
          items: [
            'titleFontFamily',
            'titleFontSettings',
            {
              type: 'row',
              items: [
                'titleFontSize',
                'titleLineHeight',
                'titleLetterSpacing',
                'titleWordSpacing',
              ],
            },
            'titleAlign',
            'titleTextAppearance',
          ],
        },
        {
          type: 'group',
          title: 'Lightbox Counter',
          items: [
            'lightboxCounterFontFamily',
            'lightboxCounterFontSettings',
            {
              type: 'row',
              items: [
                'lightboxCounterFontSize',
                'lightboxCounterLineHeight',
                'lightboxCounterLetterSpacing',
                'lightboxCounterWordSpacing',
              ],
            },
            'lightboxCounterTextAppearance',
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: ['titleColor', 'backgroundColor', 'lightboxCounterColor'],
    panelIds: ['general', 'typeStyle'],
  },
};

export const MercuryComponent = {
  element: Mercury,
  id: 'mercury',
  name: 'Mercury',
  category: 'lists',
  layoutMode: 'structured' as const,
  version: 1,
  defaultSize: {
    d: {
      width: 720,
      height: 540,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Mercury.mp4',
  },
  schema,
  sourceCode: mercurySourceRaw,
  assetsPaths: {
    content: [{ path: 'gallery.media.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'titleFontFamily' }, { path: 'lightboxCounterFontFamily' }],
  },
  fontRelations: {
    titleFontSettings: 'titleFontFamily',
    lightboxCounterFontSettings: 'lightboxCounterFontFamily',
  },
};
