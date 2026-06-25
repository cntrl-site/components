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
  'questionColor',
  'answerColor',
  'dividerColor',
  'questionHoverColor',
  'dividerHoverColor',
  'backgroundHoverColor',
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
        question: {
          type: 'string',
          label: 'Question',
          placeholder: 'Add question...',
          display: {
            type: 'text-input',
          },
        },
        answer: {
          type: 'string',
          label: 'Answer',
          placeholder: 'Add answer...',
          display: {
            type: 'text-input',
          },
        },
      },
    },
    default: [
      {
        question: 'What is your return policy?',
        answer: 'You can return any item within 30 days of purchase.',
      },
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 5–7 business days.',
      },
      {
        question: 'Do you offer international delivery?',
        answer: 'Yes, we ship to most countries worldwide.',
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
      dividerWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      dividerStyle: {
        type: 'string',
        scope: 'common',
        title: 'Style',
        display: { type: 'toggle-cycle', enum: ['solid', 'dashed', 'dotted'] },
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
      icon: {
        type: ['string', 'null'] as const,
        scope: 'common',
        title: 'Icon',
        display: { type: 'icon-switch-control' },
      },
      iconMaxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Icon Max Width',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
      },
      iconAnimation: {
        type: 'string',
        scope: 'common',
        title: 'Icon Animation',
        display: { type: 'toggle-cycle', enum: ['180', '90', '45'] },
      },
      questionColor: {
        type: 'string',
        scope: 'common',
        title: 'Question Default',
        display: { type: 'palette-color-picker' },
      },
      answerColor: {
        type: 'string',
        scope: 'common',
        title: 'Answer Default',
        display: { type: 'palette-color-picker' },
      },
      dividerColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Default',
        display: { type: 'palette-color-picker' },
      },
      questionHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Question Hover',
        display: { type: 'palette-color-picker' },
      },
      dividerHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Hover',
        display: { type: 'palette-color-picker' },
      },
      backgroundHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'BG Hover',
        display: { type: 'palette-color-picker' },
      },
      questionFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      questionFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      questionFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Question Font Size',
        display: { type: 'font-size' },
      },
      questionLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Question Line Height',
        display: { type: 'line-height-input' },
      },
      questionLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Question Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      questionWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Question Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      questionTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Question Text Appearance',
        display: { type: 'text-appearance' },
      },
      answerFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      answerFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      answerFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Answer Font Size',
        display: { type: 'font-size' },
      },
      answerLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Answer Line Height',
        display: { type: 'line-height-input' },
      },
      answerLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Answer Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      answerWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Answer Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      answerTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Answer Text Appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      dividerStyle: 'solid',
      hover: 'color',
      autoclose: 'off',
      icon: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVZJ586KJS8G0PKNERN87KMN.svg',
      iconAnimation: '45',
      questionColor: '#000000',
      answerColor: '#000000',
      dividerColor: '#000000',
      questionHoverColor: '#666666',
      dividerHoverColor: '#000000',
      backgroundHoverColor: '#000000',
      questionFontFamily: 'Arial',
      questionFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      questionLetterSpacing: 0,
      questionWordSpacing: 0,
      questionTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      answerFontFamily: 'Goudy Bookletter 1911',
      answerFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      answerLetterSpacing: 0,
      answerWordSpacing: 0,
      answerTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
    layoutDefaults: {
      m: {
        wrapperWidth: 1,
        cellMinHeight: 0,
        dividerWidth: 0.001389,
        iconMaxWidth: 0.025,
        questionFontSize: 0.1066,
        questionLineHeight: 0.0853,
        answerFontSize: 0.056,
        answerLineHeight: 0.0448,
      },
      d: {
        wrapperWidth: 1,
        cellMinHeight: 0,
        dividerWidth: 0.000694,
        iconMaxWidth: 0.00833,
        questionFontSize: 0.027,
        questionLineHeight: 0.0222,
        answerFontSize: 0.01,
        answerLineHeight: 0.0082,
      },
    },
    layout: [
      '__componentName__',
      'wrapperWidth',
      'cellMinHeight',
      'dividerWidth',
      'dividerStyle',
      'hover',
      'autoclose',
      'icon',
      'iconMaxWidth',
      'iconAnimation',
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
        { type: 'row', title: 'Divider', items: ['dividerWidth', 'dividerStyle'] },
        { type: 'row', title: 'Icon', items: ['icon', 'iconMaxWidth'] },
        { type: 'row', title: '', items: ['iconAnimation'] },
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
          title: 'Question',
          items: [
            'questionFontFamily',
            'questionFontSettings',
            { type: 'row', items: ['questionFontSize', 'questionLineHeight', 'questionLetterSpacing', 'questionWordSpacing'] },
            'questionTextAppearance',
          ],
        },
        {
          type: 'group',
          title: 'Answer',
          items: [
            'answerFontFamily',
            'answerFontSettings',
            { type: 'row', items: ['answerFontSize', 'answerLineHeight', 'answerLetterSpacing', 'answerWordSpacing'] },
            'answerTextAppearance',
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: [
        'questionColor',
        'answerColor',
        'dividerColor',
        'questionHoverColor',
        'dividerHoverColor',
        'backgroundHoverColor',
      ],
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
    parameters: [{ path: 'icon' }],
  },
  schema,
  sourceCode: formSourceRaw,
};
