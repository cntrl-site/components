import { SimpleButton } from './SimpleButton';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import simpleButtonSourceRaw from './SimpleButton.tsx?raw';

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
        text: {
          label: 'Text',
          placeholder: 'Enter text...',
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
        text: 'Button',
      },
    ],
  },
  settings: {
    sizing: 'auto',
    properties: {
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b'],
      },
      dimensions: {
        type: 'number',
        scope: 'layout',
        title: 'Dimensions',
        display: { type: 'toggle-numeric-input', enum: ['auto', 'fixed'] },
        min: 1,
      },
      padding: {
        type: 'object',
        scope: 'layout',
        title: 'Padding',
        display: { type: 'padding-controls' },
      },
      minWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Min width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      minHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
    },
    defaults: {
      type: 'a',
      dimensions: 100,
      padding: {
        top: 10 / 1440,
        right: 10 / 1440,
        bottom: 10 / 1440,
        left: 10 / 1440,
      },
      minWidth: 100 / 1440,
      minHeight: 100 / 1440,
    },
    layoutDefaults: {
      m: {
        dimensions: 100,
        padding: {
          top: 10 / 375,
          right: 10 / 375,
          bottom: 10 / 375,
          left: 10 / 375,
        },
        minWidth: 100 / 375,
        minHeight: 100 / 375,
      },
      t: {
        dimensions: 100,
        padding: {
          top: 10 / 768,
          right: 10 / 768,
          bottom: 10 / 768,
          left: 10 / 768,
        },
        minWidth: 100 / 768,
        minHeight: 100 / 768,
      },
      d: {
        dimensions: 100,
        padding: {
          top: 10 / 1440,
          right: 10 / 1440,
          bottom: 10 / 1440,
          left: 10 / 1440,
        },
        minWidth: 100 / 1440,
        minHeight: 100 / 1440,
      },
    },
    layout: [
      '__componentName__',
      'type',
      { type: 'row', title: '', items: ['dimensions', 'padding'] },
      { type: 'row', title: '', items: ['minWidth', 'minHeight'] },
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
        'type',
        { type: 'row', title: '', items: ['dimensions', 'padding'] },
        { type: 'row', title: '', items: ['minWidth', 'minHeight'] },
      ],
    },
  ],
};

export const SimpleButtonComponent = {
  element: SimpleButton,
  id: 'simple-button',
  name: 'Simple Button',
  category: 'dev',
  version: 1,
  defaultSize: {
    d: {
      width: 200,
      height: 100,
    },
    m: {
      width: 160,
      height: 80,
    },
  },
  schema,
  sourceCode: simpleButtonSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
