import { ClickGallerie } from './ClickGallerie';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import clickGallerieSourceRaw from './ClickGallerie.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
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
          properties: {
            url: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
          required: ['url', 'name'],
        },
        link: {
          label: 'URL',
          placeholder: 'Enter link...',
          display: {
            type: 'text-input',
          },
        },
      },
      required: ['image'],
    },
    default: [
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png',
          name: 'Slider-1.png',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png',
          name: 'Slider-2.png',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQNEVRXPSRX5K1YTMJQY9.png',
          name: 'Slider-3.png',
        },
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQP84JKRDT7WNWDQZR4Y9.png',
          name: 'Slider-4.png',
        },
        link: '',
      },
    ],
  },
  settings: {
    sizing: 'manual',
    properties: {
      imageSize: {
        type: 'object',
        scope: 'layout',
        title: 'Img Size',
        display: {
          type: 'toggle-cycle-numeric-input',
          enum: ['custom', 'as is', 'random'],
          inputs: {
            custom: 'single',
            'as is': 'none',
            random: 'range',
          },
          defaultValue: 700,
          defaultMin: 400,
          defaultMax: 700,
        },
        min: 0,
        max: 9999,
        properties: {
          sizeType: { type: 'string' },
          value: { type: 'number' },
          min: { type: 'number' },
          max: { type: 'number' },
        },
      },
      cursor: {
        type: 'string',
        scope: 'common',
        title: 'Cursor',
        display: { type: 'toggle-cycle', enum: ['system', 'custom'] },
      },
      target: {
        type: 'string',
        scope: 'common',
        title: 'Target',
        display: { type: 'toggle-cycle', enum: ['area', 'image'] },
      },
      position: {
        type: 'string',
        scope: 'common',
        title: 'Position',
        display: { type: 'toggle-cycle', enum: ['random', 'same', 'on Click'] },
      },
      visible: {
        type: 'string',
        scope: 'common',
        title: 'Visible',
        display: { type: 'toggle-cycle', enum: ['all', 'last One'] },
      },
      defaultCursor: {
        type: ['string', 'null'] as const,
        scope: 'common',
        title: 'Default',
        display: { type: 'settings-image-input', visible: false },
      },
      hoverCursor: {
        type: ['string', 'null'] as const,
        scope: 'common',
        title: 'Hover',
        display: { type: 'settings-image-input', visible: false },
      },
    },
    defaults: {
      imageSize: {
        sizeType: 'custom',
        value: 700,
        min: 400,
        max: 700,
      },
      cursor: 'system',
      target: 'area',
      position: 'random',
      visible: 'all',
      defaultCursor: null,
      hoverCursor: null,
    },
    layoutDefaults: {
      m: {
        imageSize: {
          sizeType: 'custom',
          value: 500,
          min: 400,
          max: 700,
        },
      },
      t: {
        imageSize: {
          sizeType: 'custom',
          value: 600,
          min: 400,
          max: 700,
        },
      },
      d: {
        imageSize: {
          sizeType: 'custom',
          value: 700,
          min: 400,
          max: 700,
        },
      },
    },
    displayRules: [
      {
        if: { name: 'cursor', value: 'custom' },
        then: { name: 'properties.defaultCursor.display.visible', value: true },
      },
      {
        if: { name: 'cursor', value: 'custom' },
        then: { name: 'properties.hoverCursor.display.visible', value: true },
      },
    ],
    layout: [
      '__componentName__',
      'imageSize',
      'cursor',
      'target',
      'position',
      'visible',
      'defaultCursor',
      'hoverCursor',
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
        { type: 'row', title: '', items: ['imageSize'] },
        { type: 'row', title: '', items: ['cursor', 'target'] },
        { type: 'row', title: '', items: ['position', 'visible'] },
        { type: 'row', title: 'Custom Cursor', items: ['defaultCursor', 'hoverCursor'] },
      ],
    },
  ],
};

export const ClickGallerieComponent = {
  element: ClickGallerie,
  id: 'click-gallerie',
  name: 'Click',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: '100%',
      height: '100%',
    },
    t: {
      width: '100%',
      height: '100%',
    },
    m: {
      width: '100%',
      height: '100%',
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Click_Gallery.mp4',
  },
  schema,
  sourceCode: clickGallerieSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [
      { path: 'settings.defaultCursor' },
      { path: 'settings.hoverCursor' },
    ],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
