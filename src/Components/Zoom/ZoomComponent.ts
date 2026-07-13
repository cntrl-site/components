import { Zoom } from './Zoom';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import zoomSourceRaw from './Zoom.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'manual',
    properties: {
      imageSize: {
        type: 'number',
        scope: 'common',
        title: 'Image size (%)',
        display: { type: 'percentage-input' },
        min: 10,
        max: 100,
      },
      transition: {
        type: 'number',
        scope: 'common',
        title: 'Transition (ms)',
        display: { type: 'common-numeric-input' },
        min: 100,
        max: 9999,
      },
      bgImage: {
        type: 'string',
        scope: 'common',
        title: 'BG image',
        display: { type: 'toggle-cycle', enum: ['greyscale', 'blur', 'as is'] },
      },
      effectAmount: {
        type: 'number',
        scope: 'common',
        title: 'Effect amount',
        display: { type: 'percentage-input' },
        min: 0,
        max: 100,
      },
    },
    defaults: {
      imageSize: 60,
      transition: 1000,
      bgImage: 'greyscale',
      effectAmount: 50,
    },
    displayRules: [
      {
        if: { name: 'bgImage', value: 'as is' },
        then: { name: 'properties.effectAmount.display.visible', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'imageSize',
      'transition',
      'bgImage',
      'effectAmount',
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
        { type: 'row', title: '', items: ['imageSize', 'transition'] },
        { type: 'row', title: '', items: ['bgImage', 'effectAmount'] },
      ],
    },
  ],
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
            type: 'media-input',
            isObjectFitEditable: false,
          },
        },
      },
    },
    default: [
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/grid(1).webp',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/grid(2).webp',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/grid(3).webp',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/grid(4).webp',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/grid(5).webp',
          name: '',
        },
      },
    ],
  },
};

export const ZoomComponent = {
  element: Zoom,
  id: 'zoom',
  name: 'Zoom',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: 920,
      height: 540,
    },
    m: {
      width: '100%',
      height: 300,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Zoom.mp4',
  },
  schema,
  sourceCode: zoomSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
