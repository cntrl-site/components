import { Marquee } from './Marquee';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import marqueeSourceRaw from './Marquee.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
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
      pauseOnHover: {
        title: 'Pause on hover',
        type: 'string',
        scope: 'common',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      hoverEffect: {
        type: 'string',
        scope: 'common',
        title: 'Effect',
        display: { type: 'toggle-cycle', enum: ['off', 'brightness', 'grayscale'] },
      },
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        min: 0,
        display: { type: 'numeric-input' },
      },
      imageMaxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Max width',
        min: 10,
        display: { type: 'numeric-input' },
      },
      imageMaxHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Max height',
        min: 10,
        display: { type: 'numeric-input' },
      },
      imageFit: {
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
    },
    defaults: {
      direction: 'left',
      pauseOnHover: 'off',
      hoverEffect: 'off',
      imageFit: {
        display: 'fit',
        ratioValue: '16:9',
        reversed: false,
      },
    },
    layoutDefaults: {
      m: {
        speed: 0.55,
        gap: 0.04,
        imageMaxWidth: 0.8,
        imageMaxHeight: 0.8,
      },
      t: {
        speed: 1.64,
        gap: 0.02,
        imageMaxWidth: 0.5208,
        imageMaxHeight: 0.5208,
      },
      d: {
        speed: 1.64,
        gap: 0.02,
        imageMaxWidth: 0.208,
        imageMaxHeight: 0.278,
      },
    },
    displayRules: [
      {
        if: { name: 'imageFit.display', value: 'cover' },
        then: { name: 'properties.hoverEffect.display.enum', value: ['off', 'brightness', 'grayscale', 'randomize'] },
      }
    ],
    layout: [
      '__componentName__',
      'speed',
      'direction',
      'pauseOnHover',
      'hoverEffect',
      'gap',
      'imageMaxWidth',
      'imageMaxHeight',
      'imageFit',
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
        { type: 'row', items: ['direction' ] },
        { type: 'row', items: [ 'speed', 'imageFit'] },
        { type: 'row', items: [ 'imageMaxWidth', 'imageMaxHeight'] },
        { type: 'row', title: 'Hover Settings', items: [
          {type: 'row', title: '', items: ['hoverEffect', 'pauseOnHover']}
        ]},
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
            isObjectFitEditable: false,
            type: 'media-input',
          },
        },
        link: {
          label: 'URL',
          placeholder: 'Enter link...',
          display: {
            type: 'text-input',
          },
        },
      },
    },
    default: [
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-1.jpg',
          name: '',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-2.jpg',
          name: '',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-3.jpg',
          name: '',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-4.jpg',
          name: '',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-5.jpg',
          name: '',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-6.jpg',
          name: '',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-7.jpg',
          name: '',
        },
        link: '',
      },
    ],
  },
};

export const MarqueeComponent = {
  element: Marquee,
  id: 'marquee',
  name: 'Simple Marquee',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: '100%',
    },
    t: {
      width: '100%',
    },
    m: {
      width: '100%',
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Simple_Marquee.mp4',
  },
  schema,
  sourceCode: marqueeSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
