import { Zoom } from './Zoom';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import zoomSourceRaw from './Zoom.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'manual',
    properties: {
      maxWidth: {
        type: 'number',
        scope: 'common',
        title: 'Max width (%)',
        display: { type: 'percentage-input' },
        min: 10,
        max: 100,
      },
      maxHeight: {
        type: 'number',
        scope: 'common',
        title: 'Max height (%)',
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
    },
    defaults: {
      maxWidth: 60,
      maxHeight: 60,
      transition: 1000,
      bgImage: 'greyscale',
    },
    layout: [
      '__componentName__',
      'maxWidth',
      'maxHeight',
      'transition',
      'bgImage',
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
        { type: 'row', title: '', items: ['maxWidth', 'maxHeight'] },
        { type: 'row', title: '', items: ['transition', 'bgImage'] },
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
