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
      hoverEffect: {
        type: 'string',
        scope: 'common',
        title: 'Hover Effect',
        display: { type: 'switch-toggle', enum: ['off', 'brightness', 'grayscale', 'saturate'] },
        enum: ['off', 'brightness', 'grayscale', 'saturate'],
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
      imageFit: {
        type: 'string',
        scope: 'common',
        title: 'Image cover',
        enum: ['cover', 'contain'],
        display: { type: 'switch-toggle-2', enum: ['cover', 'contain'] },
      },
      textFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font Family',
        display: { type: 'font-family-select' },
      },
      textFontSettings: {
        type: 'object' as const,
        scope: 'common' as const,
        display: { type: 'font-settings-weight' },
        properties: {
          fontWeight: { type: 'number' as const, scope: 'common' as const },
          fontStyle: { type: 'string' as const, scope: 'common' as const },
        },
        title: '',
      },
      textFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Text Font Size',
        display: { type: 'font-size' },
      },
      textLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Text Line Height',
        display: { type: 'line-height-input' },
      },
      textLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Text Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      textWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Text Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      textTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text Text Appearance',
        display: { type: 'text-appearance' },
      },
      textColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Fill Text',
      },
      textMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Text margin top',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
    },
    defaults: {
      direction: 'left',
      pauseOnHover: 'off',
      hoverEffect: 'off',
      imageFit: 'contain',
      textFontFamily: 'Arial',
      textFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      textLetterSpacing: 0,
      textWordSpacing: 0,
      textTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      textColor: '#000000',
    },
    layoutDefaults: {
      m: {
        speed: 0.55,
        gap: 0.04,
        imageMaxWidth: 0.8,
        imageMaxHeight: 0.21,
        textFontSize: 0.04,
        textLineHeight: 0.04,
        textMarginTop: 0.02,
      },
      d: {
        speed: 1.64,
        gap: 0.02,
        imageMaxWidth: 0.15,
        imageMaxHeight: 0.1,
        textFontSize: 0.01,
        textLineHeight: 0.01,
        textMarginTop: 0.008,
      },
    },
    displayRules: [],
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
        { type: 'row', items: [ 'speed', 'imageFit'] },
        { type: 'row', items: [ 'imageMaxWidth', 'imageMaxHeight'] },
        { type: 'row', items: ['direction' ] },
        { type: 'row', title: 'Hover Settings', items: ['pauseOnHover', 'hoverEffect'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        {
          type: 'group',
          title: 'Text',
          items: [
            'textFontFamily',
            'textFontSettings',
            {
              type: 'row',
              items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing'],
            },
            'textTextAppearance',
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: ['textColor'],
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
        },
        text: {
          placeholder: 'Add Text...',
          label: 'Text',
          display: {
            type: 'rich-text',
          }
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
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZNCQFC3T744H0KX6R3FR.jpeg',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZRTSS60YBFT6Y37ZX00T.jpeg',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ9M9YJPQ5JWKCHDEW5M1GJD.jpeg',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7S04EHBXQS1T4KVAMZNZQM.jpeg',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        link: '',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7S08Q40WHD39024VNDWF2Q.jpeg',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        link: '',
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
    parameters: [
      { path: 'textFontFamily', placeholderEnabled: true },
      { path: 'textFontSettings.fontWeight' },
      { path: 'textFontSettings.fontStyle' },
    ],
  },
};
