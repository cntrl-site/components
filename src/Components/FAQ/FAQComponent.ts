import { FAQ } from './FAQ';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import formSourceRaw from './FAQ.tsx?raw';

const textStyleProperties = {
  fontSettings: {
    type: 'object' as const,
    display: { type: 'font-settings-weight' },
    properties: {
      fontWeight: { type: 'number' as const },
      fontStyle: { type: 'string' as const },
    },
  },
  fontSize: {
    type: 'number' as const,
    display: { type: 'font-size' },
  },
  lineHeight: {
    type: 'number' as const,
    display: { type: 'line-height-input' },
  },
  letterSpacing: {
    type: 'number' as const,
    display: { type: 'letter-spacing-input' },
  },
  wordSpacing: {
    type: 'number' as const,
    display: { type: 'word-spacing-input' },
  },
  textAppearance: {
    type: 'object' as const,
    display: { type: 'text-appearance' },
    properties: {
      textTransform: { type: 'string' as const, enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
      textDecoration: { type: 'string' as const, enum: ['none', 'underline'] },
      fontVariant: { type: 'string' as const, enum: ['normal', 'small-caps'] },
    },
  },
};

const paletteBookmarkItems = [
  'titleColor',
  'titleHoverColor',
  'contentColor',
  'contentHoverColor',
] as const;

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  content: {
    type: 'array',
    display: {
      type: 'array',
    },
    items: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          label: 'Title',
          placeholder: 'Add title...',
          display: {
            type: 'text-input',
          },
        },
        content: {
          type: 'string',
          label: 'Content',
          placeholder: 'Add content...',
          display: {
            type: 'text-input',
          },
        },
      },
    },
    default: [
      {
        title: 'What is your return policy?',
        content: 'You can return any item within 30 days of purchase.',
      },
      {
        title: 'How long does shipping take?',
        content: 'Standard shipping typically takes 5–7 business days.',
      },
      {
        title: 'Do you offer international delivery?',
        content: 'Yes, we ship to most countries worldwide.',
      },
    ],
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      wrapperWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      cellMinHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Cell min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      hover: {
        type: 'string',
        scope: 'common',
        title: 'Hover',
        display: { type: 'toggle-cycle', enum: ['off', 'color'] },
      },
      autoclose: {
        type: 'string',
        scope: 'common',
        title: 'Autoclose',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      titleColor: {
        type: 'string',
        scope: 'common',
        title: 'Title Default',
        display: { type: 'palette-color-picker' },
      },
      titleHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Title Hover',
        display: { type: 'palette-color-picker' },
      },
      contentColor: {
        type: 'string',
        scope: 'common',
        title: 'Content Default',
        display: { type: 'palette-color-picker' },
      },
      contentHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Content Hover',
        display: { type: 'palette-color-picker' },
      },
      titleFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      titleFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      titleFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Title Font Size',
        display: { type: 'font-size' },
      },
      titleLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Title Line Height',
        display: { type: 'line-height-input' },
      },
      titleLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Title Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      titleWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Title Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      titleTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Title Text Appearance',
        display: { type: 'text-appearance' },
      },
      contentFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      contentFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      contentFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Content Font Size',
        display: { type: 'font-size' },
      },
      contentLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Content Line Height',
        display: { type: 'line-height-input' },
      },
      contentLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Content Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      contentWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Content Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      contentTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Content Text Appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      hover: 'color',
      autoclose: 'off',
      titleColor: '#000000',
      titleHoverColor: '#666666',
      contentColor: '#000000',
      contentHoverColor: '#666666',
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
      contentFontFamily: 'Goudy Bookletter 1911',
      contentFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      contentLetterSpacing: 0,
      contentWordSpacing: 0,
      contentTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
    layoutDefaults: {
      m: {
        wrapperWidth: 1,
        cellMinHeight: 0,
        titleFontSize: 0.1066,
        titleLineHeight: 0.0853,
        contentFontSize: 0.056,
        contentLineHeight: 0.0448,
      },
      d: {
        wrapperWidth: 1,
        cellMinHeight: 0,
        titleFontSize: 0.027,
        titleLineHeight: 0.0222,
        contentFontSize: 0.01,
        contentLineHeight: 0.0082,
      },
    },
    layout: [
      '__componentName__',
      'wrapperWidth',
      'cellMinHeight',
      'hover',
      'autoclose',
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
        { type: 'row', title: '', items: ['wrapperWidth', 'cellMinHeight'] },
        { type: 'row', title: '', items: ['hover', 'autoclose'] },
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
        {
          type: 'group',
          title: 'Content',
          items: [
            'contentFontFamily',
            'contentFontSettings',
            { type: 'row', items: ['contentFontSize', 'contentLineHeight', 'contentLetterSpacing', 'contentWordSpacing'] },
            'contentTextAppearance',
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['titleColor', 'titleHoverColor', 'contentColor', 'contentHoverColor'],
    },
  },
};

export const FAQComponent = {
  element: FAQ,
  id: 'faq',
  name: 'FAQ',
  category: 'lists',
  layoutMode: 'structured' as const,
  preview: {
    type: 'image' as const,
    url: '',
  },
  version: 1,
  defaultSize: {
    d: {
      width: 720,
      height: 540,
    },
  },
  assetsPaths: {
    content: [],
    parameters: [],
  },
  schema,
  sourceCode: formSourceRaw,
};
