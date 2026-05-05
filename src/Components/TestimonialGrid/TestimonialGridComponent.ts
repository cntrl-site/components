import { TestimonialGrid } from './TestimonialGrid';
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
        max: 10,
        display: { type: 'range-control' },
      },
      strokeColor: {
        type: 'string',
        scope: 'common',
        title: 'Stroke color',
        display: { type: 'palette-color-picker', visible: true },
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
        title: 'width',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      logoHeight: {
        type: 'number',
        scope: 'layout',
        title: 'height',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      textColor: {
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
      bgColor: 'rgba(255, 255, 255, 0.81)',
      textColor: '#000000',
      captionColor: '#000000',
      captionFontFamily: 'Arial',
      captionFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      align: 'center',
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
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        logoMarginTop: 0,
        logoWidth: 0.02,
        logoHeight: 0.02,
        captionMarginTop: 0,
        textFontSize: 0.01,
        textLineHeight: 0.01,
        captionFontSize: 0.01,
        captionLineHeight: 0.01,
      },
      d: {
        speed: 5,
        gap: 0.02,
        cardWidth: 0.15,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        logoMarginTop: 0.01,
        logoWidth: 0.05,
        logoHeight: 0.05,
        captionMarginTop: 0.01,
        textFontSize: 0.01,
        textLineHeight: 0.01,
        captionFontSize: 0.01,
        captionLineHeight: 0.01,
      },
    },
    displayRules: [
      {
        if: { name: 'stroke', value: 0 },
        then: { name: 'properties.strokeColor.display.visible', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'autoplay',
      'speed',
      'direction',
      'pauseOnHover',
      'gap',
      'cardWidth',
      'corners',
      'stroke',
      'strokeColor',
      'bgColor',
      'padding',
      'logoMarginTop',
      'logoWidth',
      'logoHeight',
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
        {type: 'row', items: ['speed', 'pauseOnHover']},
        {type: 'row', items: ['align', 'direction']},
        {type: 'row', title: 'Card', items: [{type: 'group', title: '', items: ['cardWidth', 'corners', 'stroke']}, {type: 'group', title: '', items: ['padding']}]},
        {type: 'row', title: 'Logo Container', items: ['logoWidth', 'logoHeight']},
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
    items: ['bgColor','strokeColor', 'textColor', 'captionColor'],
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
        logo: {
          objectFit: 'contain',
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
        logo: {
          objectFit: 'contain',
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
  element: TestimonialGrid,
  id: 'testimonials',
  name: 'Eliana',
  category: 'testimonials',
  version: 1,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/testimonials.png',
  },
  defaultSize: {
    width: 750,
    height: 300,
  },
  schema,
  sourceCode: testimonialGridSourceRaw,
  assetsPaths: {
    content: [{ path: 'logo.url', placeholderEnabled: true }],
    parameters: []
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'styles.text.fontSettings' }, { path: 'styles.caption.fontSettings' }]
  },
};

