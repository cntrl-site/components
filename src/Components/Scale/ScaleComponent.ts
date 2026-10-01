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
      transition: 700,
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
          url: '01M3QM74XESYN1HRYH9VRTZ5CK',
          name: '',
        },
      },
      {
        image: {
          url: '01M3QM74XEVZ9F59FC7M9BA63Q',
          name: '',
        },
      },
      {
        image: {
          url: '01M3QM74XEE2101QD8PM6E4JSA',
          name: '',
        },
      },
      {
        image: {
          url: '01M3QM74XE20C38X4NND20C5R4',
          name: '',
        },
      },
      {
        image: {
          url: '01M3QM74XEGBJMJ7Q63KMZY6NA',
          name: '',
        },
      },
      {
        image: {
          url: '01M3QM74XEBS5231QA4355P4VQ',
          name: '',
        },
      },
      {
        image: {
          url: '01M3QM74XEWT5YM43KF6PEYRCV',
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
    url: '01M3QM74XG650XSVXMDJM47DEE',
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
