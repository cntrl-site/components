import { Testimonials } from './TestimonialGrid';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import testimonialGridSourceRaw from './TestimonialGrid.tsx?raw';

const testimonialCaptionTextStyleProperties = {
  fontSettings: {
    type: 'object' as const,
    scope: 'common' as const,
    display: { type: 'font-settings' },
    properties: {
      fontWeight: { type: 'number' as const, scope: 'common' as const },
      fontStyle: { type: 'string' as const, scope: 'common' as const },
    },
  }
};

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      autoplay: {
        type: 'string',
        scope: 'common',
        title: 'Autoplay',
        display: { type: 'switch-control' },
        enum: ['on', 'off'],
      },
      speed: {
        type: 'number',
        scope: 'layout',
        title: 'Speed',
        display: { type: 'speed-control' },
        min: 0.5,
        max: 8,
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
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control'  },
      },
      align: {
        type: 'string',
        title: 'Align',
        display: {
          type: 'align-group',
          direction: 'horizontal',
        },
        enum: ['start', 'center', 'end']
      },
      cardWidth: {
        type: 'number',
        scope: 'layout',
        title: 'width',
        min: 0,
        max: 400,
        display: { type: 'range-control'  },
      },
      cardHeight: {
        type: 'number',
        scope: 'layout',
        title: 'height',
        min: 0,
        max: 400,
        display: { type: 'range-control' },
      },
      corners: {
        type: 'number',
        scope: 'layout',
        title: 'Corners',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      stroke: {
        type: 'number',
        scope: 'layout',
        title: 'Stroke',
        min: 0,
        max: 20,
        display: { type: 'range-control' },
      },
      strokeColor: {
        type: 'string',
        scope: 'common',
        title: 'Stroke color',
        display: { type: 'palette-color-picker' },
      },
      bgColor: {
        title: 'BG color',
        type: 'string',
        scope: 'common',
        display: { type: 'palette-color-picker' },
      },
      padding: {
        type: 'object',
        scope: 'layout',
        title: 'Padding',
        display: { type: 'padding-controls' },
      },
      logoMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Logo margin top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      logoWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Logo width',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      imageCaptionColor: {
        type: 'string',
        scope: 'common',
        title: 'Text color',
        display: { type: 'palette-color-picker' },
      },
      captionColor: {
        type: 'string',
        scope: 'common',
        title: 'Caption color',
        display: { type: 'palette-color-picker' },
      },
      textMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Text margin top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      textMinHeight: {
        type: 'number',
        scope: 'layout',
        title: 'min height',
        min: 0,
        max: 300,
        display: { type: 'range-control' },
      },
      captionMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Caption margin top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      captionFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Caption',
        display: { type: 'font-family-select' },
      },
      captionFontSettings: {
        ...testimonialCaptionTextStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display : { type: 'font-settings-weight'},
      },
      captionFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Caption Font Size',
        display: { type: 'font-size' },
      },
      captionLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Caption Line Height',
        display: { type: 'line-height-input' },
      },
      captionLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Caption Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      captionWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Caption Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      captionTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Caption Text Appearance',
        display: { type: 'text-appearance' },
      },
      textFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Text',
        display: { type: 'font-family-select' },
      },
      textFontSettings: {
        ...testimonialCaptionTextStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display : { type: 'font-settings-weight'},
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
    },
    defaults: {
      autoplay: 'off',
      direction: 'left',
      pauseOnHover: 'off',
      strokeColor: '#000000',
      bgColor: 'rgba(255, 255, 255, 0.2)',
      imageCaptionColor: '#000000',
      captionColor: '#000000',
      captionFontFamily: 'Arial',
      captionFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      align: 'start',
      captionLetterSpacing: 0,
      captionWordSpacing: 0,
      captionTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
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
    },
    layoutDefaults: {
      m: {
        speed: 3,
        gap: 0.02,
        cardWidth: 0.15,
        cardHeight: 0.2,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        logoMarginTop: 0,
        logoWidth: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
        textFontSize: 0.01,
        captionFontSize: 0.01,
      },
      d: {
        speed: 5,
        gap: 0.02,
        cardWidth: 0.15,
        cardHeight: 0.2,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        logoMarginTop: 0,
        logoWidth: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
        textFontSize: 0.01,
        captionFontSize: 0.01,
      },
    },
    displayRules: [
    ],
    layout: [
      '__componentName__',
      'autoplay',
      'speed',
      'direction',
      'pauseOnHover',
      'gap',
      'cardWidth',
      'cardHeight',
      'corners',
      'stroke',
      'strokeColor',
      'bgColor',
      'padding',
      'logoMarginTop',
      'logoWidth',
      'textMarginTop',
      'textMinHeight',
      'captionMarginTop',
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        {type: 'row', items: ['__componentName__', 'autoplay']},   
        {type: 'row', items: ['speed', {type: 'row', title: '', items: ['pauseOnHover', 'direction']}]},
        {type: 'row', items: ['align']},
        {type: 'row', title: 'Card', items: [{type: 'group', title: '', items: ['cardWidth', 'cardHeight', 'corners', 'stroke']}, {type: 'group', title: '', items: ['padding', 'logoWidth']}]},
        {type: 'row', title: 'Quote', items: ['textMinHeight', '']},
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        'textFontFamily',
        'textFontSettings',
        {
          type: 'group',
          title: '',
          items: [ 'text', {type: 'row', items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing']}, 'textTextAppearance'],
        },
        'captionFontFamily',
        'captionFontSettings',
        {
          type: 'group',
          title: '',
          items: [ 'caption', {type: 'row', items: ['captionFontSize', 'captionLineHeight', 'captionLetterSpacing', 'captionWordSpacing']}, 'captionTextAppearance'],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: ['strokeColor', 'bgColor', 'imageCaptionColor', 'captionColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: false
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
            url: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            objectFit: {
              type: 'string',
              enum: ['cover', 'contain'],
            }
          },
        },
        logo: {
          type: 'object',
          label: 'Logo',
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
        caption: {
          placeholder: 'Add Caption...',
          label: 'Caption',
          display: {
            type: 'rich-text',
          }
        },
      },
    },
    default: [
      {
        image: {},
        logo: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/logo.png',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: 'Innovative solutions redefine connectivity, enhancing user experience through seamless digital integration and efficiency.' }],
          },
        ],
        caption: [
          {
            type: 'paragraph',
            children: [{ text: 'CEO @ Company' }],
          },
        ],
      },
      {
        image: {},
        logo: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/logo.png',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: 'In the realm of digital innovation, transformative algorithms redefine connectivity, propelling unprecedented technological advancements.' }],
          },
        ],
        caption: [
          {
            type: 'paragraph',
            children: [{ text: 'CEO @ Company' }],
          },
        ],
      },
      {
        image: {},
        logo: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/component-assets/logo.png',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: 'Harnessing innovative algorithms, this paradigm shift enhances computational efficiency and optimizes data processing frameworks.' }],
          },
        ],
        caption: [
          {
            type: 'paragraph',
            children: [{ text: 'CEO @ Company' }],
          },
        ],
      },
    ],
  },
};

export const TestimonialGridComponent = {
  element: Testimonials,
  id: 'testimonials',
  name: 'Eliana',
  category: 'testimonials',
  version: 1,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/testimonials.png',
  },
  defaultSize: {
    width: 700,
    height: 300,
  },
  schema,
  sourceCode: testimonialGridSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [{ path: 'settings.controls.arrowsImgUrl' }]
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'styles.text.fontSettings' }]
  },
};

