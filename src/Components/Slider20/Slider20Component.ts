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
        type: 'object',
        scope: 'common',
        title: 'Trigger',
        display: {
          type: 'toggle-cycle-numeric-input',
          enum: ['click', 'drag', 'auto'],
          inputs: {
            click: 'none',
            drag: 'none',
            auto: 'single',
          },
          defaultValue: 3,
          showDash: false,
        },
        min: 1,
        max: 5,
        properties: {
          sizeType: { type: 'string' },
          value: { type: 'number' },
          min: { type: 'number' },
          max: { type: 'number' },
        },
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
        display: { type: 'toggle-cycle', enum: ['classic', 'no'] },
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
        display: { type: 'toggle-cycle', enum: ['always', 'on hover', 'never'] },
      },
      paddingX: {
        type: 'number',
        scope: 'layout',
        title: 'Padding X',
        display: { type: 'numeric-input' },
        min: -9999,
        max: 9999,
      },
      paddingY: {
        type: 'number',
        scope: 'layout',
        title: 'Padding Y',
        display: { type: 'numeric-input' },
        min: -9999,
        max: 9999,
      },
      controlsColor: {
        type: 'string',
        scope: 'common',
        title: 'Controls',
        display: { type: 'palette-color-picker' },
      },
      controlsHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Controls Hover',
        display: { type: 'palette-color-picker' },
      },
      navColor: {
        type: 'string',
        scope: 'common',
        title: 'Nav',
        display: { type: 'palette-color-picker' },
      },
      navPaginationColor: {
        type: 'string',
        scope: 'common',
        title: 'Nav Pagination',
        display: { type: 'palette-color-picker' },
      },
      navBackgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'Nav Background',
        display: { type: 'palette-color-picker' },
      },
      navPaginationHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Nav Pagination Hover',
        display: { type: 'palette-color-picker' },
      },
      linkColor: {
        type: 'string',
        scope: 'common',
        title: 'Link',
        display: { type: 'palette-color-picker' },
      },
      linkHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Link Hover',
        display: { type: 'palette-color-picker' },
      },
      titleColor: {
        type: 'string',
        scope: 'common',
        title: 'Title',
        display: { type: 'palette-color-picker' },
      },
      titleFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      titleFontSettings: {
        type: 'object',
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
        properties: {
          fontWeight: { type: 'number' },
          fontStyle: { type: 'string' },
        },
      },
      titleFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Font Size',
        display: { type: 'font-size' },
      },
      titleLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Line Height',
        display: { type: 'line-height-input' },
      },
      titleLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      titleWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      titleTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text Appearance',
        display: { type: 'text-appearance' },
        properties: {
          textTransform: { type: 'string', enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
          textDecoration: { type: 'string', enum: ['none', 'underline'] },
          fontVariant: { type: 'string', enum: ['normal', 'small-caps'] },
        },
      },
    },
    defaults: {
      trigger: {
        sizeType: 'drag',
        value: 3,
        min: 1,
        max: 5,
      },
      direction: 'horizontal',
      transition: 'slide',
      nav: 'classic',
      controls: null,
      show: 'always',
      controlsColor: '#000000',
      controlsHoverColor: '#cccccc',
      navColor: '#cccccc',
      navPaginationColor: '#cccccc',
      navBackgroundColor: '#000000',
      navPaginationHoverColor: '#cccccc',
      linkColor: '#cccccc',
      linkHoverColor: '#cccccc',
      titleColor: '#000000',
      titleFontFamily: 'Arial',
      titleFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      titleLetterSpacing: 0,
      titleWordSpacing: 0,
      titleTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
    layoutDefaults: {
      d: {
        controlsMaxWidth: 30 / 1440,
        paddingX: 0,
        paddingY: 0,
        titleFontSize: 0.02,
        titleLineHeight: 0.02,
      },
      t: {
        controlsMaxWidth: 30 / 768,
        paddingX: 0,
        paddingY: 0,
        titleFontSize: 0.02,
        titleLineHeight: 0.02,
      },
      m: {
        controlsMaxWidth: 30 / 375,
        paddingX: 0,
        paddingY: 0,
        titleFontSize: 0.02,
        titleLineHeight: 0.02,
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
      'paddingX',
      'paddingY',
      'titleFontSize',
      'titleLineHeight',
      'titleLetterSpacing',
      'titleWordSpacing',
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
            { type: 'row', title: '', items: ['controls', 'controlsMaxWidth'] },
            { type: 'row', title: '', items: ['paddingX', 'paddingY'] },
            { type: 'row', title: '', items: ['show'] },
          ],
        },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        {
          type: 'group',
          title: 'Title',
          items: [
            'titleFontFamily',
            'titleFontSettings',
            { type: 'row', items: ['titleFontSize', 'titleLineHeight', 'titleLetterSpacing', 'titleWordSpacing'] },
            'titleTextAppearance',
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: [
      'controlsColor',
      'controlsHoverColor',
      'navColor',
      'navPaginationColor',
      'navBackgroundColor',
      'navPaginationHoverColor',
      'linkColor',
      'linkHoverColor',
      'titleColor',
    ],
    panelIds: ['general', 'typeStyle'],
  },
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
          url: 'https://cdn.cntrl.site/component-assets/Component-default-1.jpg',
        },
        imageCaption: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Component-default-2.jpg',
        },
        imageCaption: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Component-default-3.jpg',
        },
        imageCaption: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Component-default-4.jpg',
        },
        imageCaption: [
          { type: 'paragraph', children: [{ text: '' }] },
        ],
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Component-default-5.jpg',
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
    parameters: [{ path: 'titleFontFamily' }],
  },
  fontRelations: {
    titleFontSettings: 'titleFontFamily',
  },
};
