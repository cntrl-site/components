import { LightboxStrip } from './LightboxStrip';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import lightboxStripSourceRaw from './LightboxStrip.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      imageWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        min: 10,
        max: 400,
        display: { type: 'numeric-input' },
      },
      imageHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Height',
        min: 10,
        max: 400,
        display: { type: 'numeric-input' },
      },
      objectFit: {
        type: 'string',
        scope: 'common',
        title: 'Display',
        display: { type: 'toggle-cycle', enum: ['cover', 'contain'] },
      },
      closeIcon: {
        scope: 'common',
        type: ['string', 'null'] as const,
        title: 'Icon',
        display: { type: 'settings-image-input' },
      },
      closeIconMaxWidth: {
        type: 'number',
        scope: 'common',
        title: 'Icon Max Width',
        display: { type:'full-width-input' },
        min: 0,
        max: 1,
      },
    },
    defaults: {
      objectFit: 'cover',
      closeIcon: null,
    },
    layoutDefaults: {
      m: {
        gap: 0.04,
        imageWidth: 0.35,
        imageHeight: 0.25,
        closeIconMaxWidth: 0.04,
      },
      d: {
        gap: 0.02,
        imageWidth: 0.12,
        imageHeight: 0.1,
        closeIconMaxWidth: 0.04,
      },
    },
    layout: [
      '__componentName__',
      'gap',
      'imageWidth',
      'imageHeight',
      'objectFit',
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
        { type: 'row', items: ['gap'] },
        { type: 'row', items: ['imageWidth', 'imageHeight'] },
        { type: 'row', items: ['objectFit'] },
        { type: 'row', items: ['closeIcon', 'closeIconMaxWidth'] },
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
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZNCQFC3T744H0KX6R3FR.jpeg',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZRTSS60YBFT6Y37ZX00T.jpeg',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ9M9YJPQ5JWKCHDEW5M1GJD.jpeg',
          name: '',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7S04EHBXQS1T4KVAMZNZQM.jpeg',
          name: '',
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
      width: '100%',
      height: 140,
    },
    m: {
      width: 390,
      height: 100,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Lightbox.png',
  },
  schema,
  sourceCode: lightboxStripSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
