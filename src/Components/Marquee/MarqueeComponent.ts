import { Marquee } from './Marquee';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import marqueeSourceRaw from './Marquee.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      autoplay: {
        type: 'string',
        scope: 'common',
        title: 'Autoplay',
        display: { type: 'switch-control' },
        enum: ['on', 'off'],
      },
      speed: {
        type: 'number',
        scope: 'layout',
        title: 'Speed',
        display: { type: 'speed-control' },
        min: 0.5,
        max: 8,
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
        display: { type: 'switch-toggle-2', enum: ['on', 'off'] },
      },
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      imageMaxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Max width',
        min: 0,
        max: 400,
        display: { type: 'range-control' },
      },
      imageMaxHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Max height',
        min: 0,
        max: 400,
        display: { type: 'range-control' },
      },
    },
    defaults: {
      autoplay: 'on',
      direction: 'left',
      pauseOnHover: 'off',
    },
    layoutDefaults: {
      m: {
        speed: 0.55,
        gap: 0.04,
        imageMaxWidth: 0.8,
        imageMaxHeight: 0.21,
      },
      d: {
        speed: 1.64,
        gap: 0.02,
        imageMaxWidth: 0.15,
        imageMaxHeight: 0.027,
      },
    },
    displayRules: [],
    layout: [
      '__componentName__',
      'autoplay',
      'speed',
      'direction',
      'pauseOnHover',
      'gap',
      'imageMaxWidth',
      'imageMaxHeight',
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__', 'autoplay'] },
        { type: 'row', items: ['imageMaxWidth', 'speed'] },
        { type: 'row', items: [ 'imageMaxHeight', 'pauseOnHover'] },
        { type: 'row', items: ['direction'] },
      ],
    },
  ],
  paletteBookmark: {
    items: [],
    panelIds: ['general'],
  },
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: false,
    },
    items: {
      type: 'object',
      properties: {
        image: {
          type: 'object',
          label: 'Image',
          display: {
            type: 'media-input',
          },
        },
      },
    },
    default: [
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/2.jpg',
          name: '',
        },
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/3.jpg',
          name: '',
        },
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/4.jpg',
          name: '',
        },
      },
    ],
  },
};

export const MarqueeComponent = {
  element: Marquee,
  id: 'marquee',
  name: 'Marquee',
  category: 'galleries',
  version: 1,
  defaultSize: {
    width: '100%',
    height: 200,
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/marquee.png',
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
