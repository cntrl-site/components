import { Scale } from './Scale';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import scaleSourceRaw from './Scale.tsx?raw';

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
      deleteImageDeletesEntry: true,
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
          url: 'https://cdn.cntrl.site/component-assets/scale_component_1.jpg ',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/scale_component_2.jpg',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/scale_component_3.jpg',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/scale_component_4.jpg',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/scale_component_5.jpg',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/scale_component_6.jpg',
          name: '',
        },
      },
    ],
  },
};

export const ScaleComponent = {
  element: Scale,
  id: 'scale',
  name: 'Scale',
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
    url: 'https://cdn.cntrl.site/component-assets/Scale.mp4',
  },
  schema,
  sourceCode: scaleSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
