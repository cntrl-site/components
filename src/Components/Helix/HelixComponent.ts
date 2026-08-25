import { Helix } from './Helix';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import helixSourceRaw from './Helix.tsx?raw';

const defaultImageUrls = [
  'https://cdn.cntrl.site/component-assets/Helix-default-1.png',
  'https://cdn.cntrl.site/component-assets/Helix-default-2.png',
  'https://cdn.cntrl.site/component-assets/Helix-default-3.png',
  'https://cdn.cntrl.site/component-assets/Helix-default-4.png',
  'https://cdn.cntrl.site/component-assets/Helix-default-5.png',
];

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: true,
      deleteImageDeletesEntry: true,
      allowsVideo: true,
    },
    display: {
      type: 'array',
    },
    items: {
      type: 'object',
      properties: {
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
            type: {
              type: 'string',
              enum: ['image', 'video'],
            },
          },
        },
      },
    },
    default: defaultImageUrls.map((url) => ({ image: { url, name: '' } })),
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      width: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      imageWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Img width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      turnHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Turn height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      itemsPerTurn: {
        type: 'number',
        scope: 'common',
        title: 'Per turn',
        display: { type: 'common-numeric-input' },
        min: 3,
        max: 40,
      },
      turns: {
        type: 'number',
        scope: 'common',
        title: 'Turns',
        display: { type: 'common-numeric-input' },
        min: 1,
        max: 30,
      },
      speed: {
        type: 'number',
        scope: 'layout',
        title: 'Speed',
        display: { type: 'speed-control' },
        min: 0,
        max: 7,
      },
      direction: {
        type: 'string',
        scope: 'common',
        title: 'Direction',
        display: { type: 'direction-control' },
        enum: ['left', 'right'],
      },
      playback: {
        type: 'string',
        scope: 'common',
        title: 'Playback',
        display: { type: 'toggle-cycle', enum: ['autoplay', 'scroll'] },
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
      cornerRadius: {
        type: 'number',
        scope: 'layout',
        title: 'Corner radius',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      blur: {
        type: 'string',
        scope: 'common',
        title: 'Blur',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
    },
    defaults: {
      itemsPerTurn: 14,
      turns: 3,
      direction: 'right',
      playback: 'autoplay',
      blur: 'off',
      imageDisplay: {
        display: 'cover',
        ratioValue: '2:3',
        reversed: false,
      },
    },
    layoutDefaults: {
      d: {
        defaultPaddingTop: 30 / 1440,
        width: 800 / 1440,
        imageWidth: 160 / 1440,
        turnHeight: 380 / 1440,
        speed: 2.2,
        cornerRadius: 0,
      },
      m: {
        defaultPaddingTop: 10 / 375,
        width: 320 / 375,
        imageWidth: 75 / 375,
        turnHeight: 310 / 375,
        speed: 2.8,
        cornerRadius: 0,
      },
      t: {
        defaultPaddingTop: 20 / 768,
        width: 620 / 768,
        imageWidth: 100 / 768,
        turnHeight: 280 / 768,
        speed: 2.8,
        cornerRadius: 0,
      },
    },
    layout: [
      '__componentName__',
      'width',
      'imageWidth',
      'turnHeight',
      'itemsPerTurn',
      'turns',
      'playback',
      'speed',
      'direction',
      'imageDisplay',
      'cornerRadius',
      'blur',
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
        { type: 'row', items: ['direction', 'speed'] },
        { type: 'row', items: ['width'] },
        { type: 'row', items: ['imageWidth', 'turnHeight'] },
        { type: 'row', items: ['cornerRadius', 'imageDisplay'] },
        { type: 'row', items: ['itemsPerTurn', 'turns'] },
        { type: 'row', items: ['playback', 'blur'] },
      ],
    },
  ],
};

export const HelixComponent = {
  element: Helix,
  id: 'helix',
  name: 'Helix',
  category: 'lists',
  layoutMode: 'structured' as const,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Helix.mp4',
  },
  version: 1,
  defaultSize: {
    d: {
      width: 720,
      height: 540,
    },
  },
  schema,
  sourceCode: helixSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
