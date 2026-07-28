import { Slider20 } from './Slider20';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import slider20SourceRaw from './Slider20.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'manual',
    properties: {
      trigger: {
        type: 'string',
        scope: 'common',
        title: 'Trigger',
        display: { type: 'toggle-cycle', enum: ['click', 'drag', 'auto'] },
      },
      direction: {
        type: 'string',
        scope: 'common',
        title: 'Direction',
        display: { type: 'toggle-cycle', enum: ['horizontal', 'vertical'] },
      },
      transition: {
        type: 'string',
        scope: 'common',
        title: 'Transition',
        display: { type: 'toggle-cycle', enum: ['slide', 'fade in', 'reveal'] },
      },
      nav: {
        type: 'string',
        scope: 'common',
        title: 'Nav',
        display: { type: 'toggle-cycle', enum: ['type', 'classic', 'no'] },
      },
      controls: {
        type: ['string', 'null'] as const,
        scope: 'common',
        title: '',
        display: { type: 'settings-image-input' },
      },
      controlsMaxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Max Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      show: {
        type: 'string',
        scope: 'common',
        title: 'Show',
        display: { type: 'toggle-cycle', enum: ['always', 'on click', 'never'] },
      },
      position: {
        type: 'string',
        scope: 'common',
        title: 'Position',
        display: { type: 'toggle-cycle', enum: ['inside', 'outside'] },
      },
    },
    defaults: {
      trigger: 'drag',
      direction: 'horizontal',
      transition: 'slide',
      nav: 'classic',
      controls: null,
      show: 'always',
      position: 'outside',
    },
    layoutDefaults: {
      d: {
        controlsMaxWidth: 65 / 1440,
      },
      t: {
        controlsMaxWidth: 65 / 768,
      },
      m: {
        controlsMaxWidth: 65 / 375,
      },
    },
    layout: [
      '__componentName__',
      'trigger',
      'direction',
      'transition',
      'nav',
      'controls',
      'controlsMaxWidth',
      'show',
      'position',
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
        { type: 'row', title: '', items: ['trigger', 'direction'] },
        { type: 'row', title: '', items: ['transition', 'nav'] },
        {
          type: 'group',
          title: 'Controls',
          items: [
            { type: 'row', title: 'Icon', items: ['controls', 'controlsMaxWidth'] },
            { type: 'row', title: '', items: ['show', 'position'] },
          ],
        },
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
          properties: {
            url: { type: 'string' },
            name: { type: 'string' },
            objectFit: { type: 'string', enum: ['cover', 'contain'] },
          },
          required: ['url', 'name'],
        },
        imageCaption: {
          placeholder: 'Add Caption...',
          label: 'Description',
          display: { type: 'rich-text' },
        },
      },
      required: ['image'],
    },
    default: [
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
          name: 'Slider-1.png',
        },
        imageCaption: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
          name: 'Slider-2.png',
        },
        imageCaption: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
          name: 'Slider-3.png',
        },
        imageCaption: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
    ],
  },
};

export const Slider20Component = {
  element: Slider20,
  id: 'slider-2-0',
  name: 'Slider 2.0',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: 400,
      height: 400,
    },
    t: {
      width: 400,
      height: 400,
    },
    m: {
      width: 300,
      height: 300,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Slider.mp4',
  },
  schema,
  sourceCode: slider20SourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [{ path: 'controls' }],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
