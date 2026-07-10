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
        question: 'What are the three main parts of The Divine Comedy?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'The poem is divided into Inferno, Purgatorio, and Paradiso. These three sections follow Dante’s journey through Hell, Purgatory, and Heaven.' }],
          },
        ],
      },
      {
        question: 'Who guides Dante through Hell and most of Purgatory?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'Dante is guided by Virgil, the ancient Roman poet. Virgil represents human reason and wisdom, but because he lived before Christianity, he cannot guide Dante all the way into Heaven.' }],
          },
        ],
      },
      {
        question: 'What does the dark wood at the beginning of the poem symbolize?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'The dark wood symbolizes Dante’s spiritual confusion and moral crisis. It shows that he has lost the “straight way” in life and needs guidance to return to truth and salvation.' }],
          },
        ],
      },
      {
        question: 'What is “contrapasso” in Inferno?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: '“Contrapasso” is the principle that punishments in Hell reflect the sins committed during life. For example, people who caused division are themselves physically divided, showing how their punishment mirrors their wrongdoing.' }],
          },
        ],
      },
      {
        question: 'Who guides Dante through Heaven?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'Beatrice guides Dante through Paradiso. She represents divine love, grace, and spiritual understanding, helping Dante move beyond human reason toward a vision of God.' }],
          },
        ],
      },
      {
        question: 'Why is The Divine Comedy important in literary history?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'The Divine Comedy is important because it is one of the greatest works of world literature and helped shape the Italian language. Dante wrote it in the Tuscan dialect rather than Latin, making serious literature more accessible to ordinary readers.' }],
          },
        ],
      },
      {
        question: 'What is the overall journey of The Divine Comedy about?',
        answer: [
          {
            type: 'paragraph',
            children: [{ text: 'The poem is about Dante’s spiritual journey from sin and despair toward repentance, wisdom, and union with God. On a deeper level, it represents the soul’s path from confusion to divine truth.' }],
          },
        ],
      },
    ],
  },
  settings: {
    sizing: 'auto',
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
        display: { type: 'settings-image-input' },
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
      dividerStyle: 'dotted',
      entryHoverEffect: 'default',
      autoclose: 'off',
      icon: 'https://cdn.cntrl.site/component-assets/PlusIcon.svg',
      iconAnimation: 'rotate 45',
      questionColor: '#000000',
      answerColor: '#000000',
      dividerColor: '#000000',
      iconColor: '#000000',
      questionHoverColor: '#A60239',
      iconHoverColor: '#A60239',
      iconActiveColor: '#000000',
      dividerHoverColor: '#A60239',
      questionFontFamily: 'Goudy Bookletter 1911',
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
        dividerWidth: 0.008,
        iconMaxWidth: 0.0533,
        iconPaddingRight: 0.08,
        questionFontSize: 0.09066,
        questionLineHeight: 0.10133,
        questionLetterSpacing: -0.00266,
        answerFontSize: 0.0533,
        answerLineHeight: 0.064,
        questionPaddingLeft: 0.0533,
        questionPaddingTop: 0.0533,
        questionPaddingBottom: 0.0533,
        answerPaddingLeft: 0.0533,
        answerPaddingRight: 0.16,
        answerPaddingTop: 0.0533,
        answerPaddingBottom: 0.0533,
      },
      t: {
        wrapperWidth: 0.651041,
        cellMinHeight: 0,
        dividerWidth: 0.00390625,
        iconMaxWidth: 0.02604166,
        iconPaddingRight: 0.0130208,
        questionFontSize: 0.0390625,
        questionLineHeight: 0.044270,
        questionLetterSpacing: -0.00091145833,
        answerFontSize: 0.0234375,
        answerLineHeight: 0.026041,
        questionPaddingLeft: 0,
        questionPaddingTop: 0.013020,
        questionPaddingBottom: 0.013020,
        answerPaddingLeft: 0.065104,
        answerPaddingRight: 0.09765625,
        answerPaddingTop: 0.026041,
        answerPaddingBottom: 0.026041,
      },
      d: {
        wrapperWidth: 0.6388,
        cellMinHeight: 0,
        dividerWidth: 0.002083,
        iconMaxWidth: 0.01388,
        iconPaddingRight: 0.01388,
        questionFontSize: 0.0333,
        questionLineHeight: 0.0333,
        questionLetterSpacing: -0.0009,
        answerFontSize: 0.01111,
        answerLineHeight: 0.01388,
        questionPaddingLeft: 0,
        questionPaddingTop: 0.01111,
        questionPaddingBottom: 0.01111,
        answerPaddingLeft: 0.0625,
        answerPaddingRight: 0.1625,
        answerPaddingTop: 0,
        answerPaddingBottom: 0.01111,
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
    parameters: [{ path: 'icon' }]
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'questionFontFamily' }, { path: 'answerFontFamily' }]
  },
  fontRelations: {
    questionFontSettings: 'questionFontFamily', 
    answerFontSettings: 'answerFontFamily',
  },
  schema,
  sourceCode: formSourceRaw,
};
