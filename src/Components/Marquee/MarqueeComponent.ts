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
        min: 0.5,
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
        min: 10,
        max: 400,
        display: { type: 'range-control' },
      },
      imageMaxHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Max height',
        min: 10,
        max: 400,
        display: { type: 'range-control' },
      },
    },
    defaults: {
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
        imageMaxHeight: 0.1,
      },
    },
    displayRules: [],
    layout: [
      '__componentName__',
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
        { type: 'row', items: ['__componentName__'] },
        { type: 'row', items: ['imageMaxWidth', 'speed'] },
        { type: 'row', items: [ 'imageMaxHeight', 'pauseOnHover'] },
        { type: 'row', items: ['direction'] },
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
          },
        },
      },
    },
    default: [
      {
        image: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZNCQFC3T744H0KX6R3FR.jpeg',
          name: '',
        },
      },
      {
        image: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZRTSS60YBFT6Y37ZX00T.jpeg',
          name: '',
        },
      },
      {
        image: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ9M9YJPQ5JWKCHDEW5M1GJD.jpeg',
          name: '',
        },
      },
      {
        image: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7S04EHBXQS1T4KVAMZNZQM.jpeg',
          name: '',
        },
      },
      {
        image: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7S08Q40WHD39024VNDWF2Q.jpeg',
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
