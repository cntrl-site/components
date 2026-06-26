import { FAQ } from './FAQ';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import formSourceRaw from './FAQ.tsx?raw';

function createRangeControlLayoutProperty(title: string) {
  return {
    type: 'number' as const,
    scope: 'layout' as const,
    title,
    min: 0,
    max: 100,
    display: { type: 'range-control' as const },
  };
}

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
  'iconColor',
  'questionHoverColor',
  'iconHoverColor',
  'iconActiveColor',
  'dividerHoverColor',
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
          label: 'Answer',
          placeholder: 'Add answer...',
          display: {
            type: 'rich-text',
          },
        },
      },
    },
    default: [
      {
        question: '1. What is this product used for?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'Our product helps you organize, manage, and improve your workflow with simple digital tools designed to save time and reduce manual work. It brings important tasks, information, and collaboration into one place so you can stay focused and work more efficiently.' }],
          },
        ],
      },
      {
        question: '2. Do I need technical knowledge to use it?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'No. The product is designed to be easy to use, with a clear interface and guided setup so you can get started quickly. You do not need coding skills or special training to use the core features.' }],
          },
        ],
      },
      {
        question: '3. Is there a free trial?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'Yes, you can try the product before choosing a paid plan. The trial gives you access to the main features so you can explore how it works, test it with your own workflow, and decide whether it is the right fit for your needs.' }],
          },
        ],
      },
      {
        question: '4. Can I cancel my subscription anytime?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'Yes. You can cancel your subscription at any time from your account settings. Your access will remain active until the end of your current billing period, and you will not be charged again after cancellation.' }],
          },
        ],
      },
      {
        question: '5. Is my data secure?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'Yes. We use modern security practices to protect your data, including encrypted connections and secure account access. We also follow responsible data handling practices so your information stays private and protected.' }],
          },
        ],
      },
      {
        question: '6. Can I use the product with my team?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'Yes. Team plans allow multiple users to collaborate, manage shared projects, assign responsibilities, and keep work organized in one place. This makes it easier for everyone to stay aligned and see the latest updates.' }],
          },
        ],
      },
      {
        question: '7. How do I get support?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'You can contact our support team through the help center or by email. We’ll help you with setup, troubleshooting, billing questions, and product guidance so you can get the most out of the platform.' }],
          },
        ],
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
        title: 'Min height',
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
      entryHoverEffect: {
        type: 'string',
        scope: 'common',
        title: 'Effect',
        display: { type: 'toggle-cycle', enum: ['none', 'default'] },
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
        title: 'Max Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      iconPaddingRight: createRangeControlLayoutProperty('Icon Padding Right'),
      iconAnimation: {
        type: 'string',
        scope: 'common',
        title: 'Icon Animation',
        display: { type: 'toggle-cycle', enum: ['rotate 180', 'rotate 90', 'rotate 45'] },
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
      iconColor: {
        type: 'string',
        scope: 'common',
        title: 'Icon Default',
        display: { type: 'palette-color-picker' },
      },
      questionHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Question Hover',
        display: { type: 'palette-color-picker' },
      },
      iconHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Icon Hover',
        display: { type: 'palette-color-picker' },
      },
      iconActiveColor: {
        type: 'string',
        scope: 'common',
        title: 'Icon Active',
        display: { type: 'palette-color-picker' },
      },
      dividerHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Hover',
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
      questionPaddingLeft: createRangeControlLayoutProperty('Question Padding Left'),
      questionPaddingTop: createRangeControlLayoutProperty('Question Padding Top'),
      questionPaddingBottom: createRangeControlLayoutProperty('Question Padding Bottom'),
      answerPaddingLeft: createRangeControlLayoutProperty('Answer Padding Left'),
      answerPaddingRight: createRangeControlLayoutProperty('Answer Padding Right'),
      answerPaddingTop: createRangeControlLayoutProperty('Answer Padding Top'),
      answerPaddingBottom: createRangeControlLayoutProperty('Answer Padding Bottom'),
    },
    defaults: {
      dividerStyle: 'solid',
      entryHoverEffect: 'default',
      autoclose: 'off',
      icon: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVZJ586KJS8G0PKNERN87KMN.svg',
      iconAnimation: 'rotate 45',
      questionColor: '#000000',
      answerColor: '#000000',
      dividerColor: '#000000',
      iconColor: '#000000',
      questionHoverColor: '#666666',
      iconHoverColor: '#666666',
      iconActiveColor: '#000000',
      dividerHoverColor: '#000000',
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
      answerFontFamily: 'Arial',
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
        iconPaddingRight: 0,
        questionFontSize: 0.1066,
        questionLineHeight: 0.0853,
        answerFontSize: 0.056,
        answerLineHeight: 0.0448,
        questionPaddingLeft: 0,
        questionPaddingTop: 0.01,
        questionPaddingBottom: 0.01,
        answerPaddingLeft: 0,
        answerPaddingRight: 0,
        answerPaddingTop: 0.01,
        answerPaddingBottom: 0.01,
      },
      d: {
        wrapperWidth: 1,
        cellMinHeight: 0,
        dividerWidth: 0.000694,
        iconMaxWidth: 0.00833,
        iconPaddingRight: 0,
        questionFontSize: 0.027,
        questionLineHeight: 0.0222,
        answerFontSize: 0.01,
        answerLineHeight: 0.0082,
        questionPaddingLeft: 0,
        questionPaddingTop: 0.01,
        questionPaddingBottom: 0.01,
        answerPaddingLeft: 0,
        answerPaddingRight: 0,
        answerPaddingTop: 0.01,
        answerPaddingBottom: 0.01,
      },
    },
    layout: [
      '__componentName__',
      'wrapperWidth',
      'cellMinHeight',
      'dividerWidth',
      'dividerStyle',
      'entryHoverEffect',
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
        { type: 'row', title: '', items: ['entryHoverEffect', 'autoclose'] },
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
        'iconColor',
        'questionHoverColor',
        'dividerHoverColor',
        'iconHoverColor',
        'iconActiveColor',
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
    url: 'https://cdn.cntrl.site/component-assets/FAQ_List.png',
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
