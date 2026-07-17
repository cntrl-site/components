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
      speed: {
        type: 'number',
        scope: 'layout',
        title: 'Speed',
        display: { type: 'speed-control' },
        min: 0,
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
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
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
        title: 'Alignment',
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
        display: { type: 'numeric-input'  },
      },
      corners: {
        type: 'number',
        scope: 'layout',
        title: 'Corners',
        min: 0,
        max: 100,
        display: { type: 'numeric-input' },
      },
      stroke: {
        type: 'number',
        scope: 'layout',
        title: 'Stroke',
        min: 0,
        max: 10,
        display: { type: 'numeric-input' },
      },
      strokeColor: {
        type: 'string',
        scope: 'common',
        title: 'Stroke Card',
        display: { type: 'palette-color-picker', visible: true },
      },
      bgColor: {
        title: 'BG card',
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
        max: 200,
        display: { type: 'range-control' },
      },
      logoWidth: {
        type: 'number',
        scope: 'layout',
        title: 'width',
        min: 0,
        max: 200,
        display: { type: 'numeric-input' },
      },
      logoHeight: {
        type: 'number',
        scope: 'layout',
        title: 'height',
        min: 0,
        max: 200,
        display: { type: 'numeric-input' },
      },
      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Fill',
        display: { type: 'palette-color-picker' },
      },
      captionColor: {
        type: 'string',
        scope: 'common',
        title: 'Caption Fill',
        display: { type: 'palette-color-picker' },
      },
      captionMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Caption margin top',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      captionFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font Family',
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
        title: 'Font Family',
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
      direction: 'left',
      pauseOnHover: 'off',
      strokeColor: '#000000',
      bgColor: 'rgba(255, 255, 255, 0.81)',
      textColor: '#000000',
      captionColor: '#000000',
      captionFontFamily: 'Goudy Bookletter 1911',
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
      textFontFamily: 'Goudy Bookletter 1911',
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
        speed: 0.55,
        gap: 0.04,
        cardWidth: 0.8,
        corners: 0.02,
        stroke: 0.001,
        padding: { top: 0.053, right: 0.026, bottom: 0.053, left: 0.026 },
        logoMarginTop: 0.18,
        logoWidth: 0.21,
        logoHeight: 0.21,
        captionMarginTop: 0.056,
        textFontSize: 0.069,
        textLineHeight: 0.093,
        captionFontSize: 0.053,
        captionLineHeight: 0.069,
      },
      t: {
        speed: 1.64,
        gap: 0.02,
        cardWidth: 0.44,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0.01, right: 0.01, bottom: 0.065, left: 0.01 },
        logoMarginTop: 0.1,
        logoWidth: 0.052,
        logoHeight: 0.052,
        captionMarginTop: 0.005,
        textFontSize: 0.035,
        textLineHeight: 0.04,
        captionFontSize: 0.023,
        captionLineHeight: 0.029,
      },
      d: {
        speed: 1.64,
        gap: 0.02,
        cardWidth: 0.15,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        logoMarginTop: 0.048,
        logoWidth: 0.055,
        logoHeight: 0.027,
        captionMarginTop: 0.005,
        textFontSize: 0.012,
        textLineHeight: 0.013,
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
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        {type: 'row', items: ['__componentName__']},
        {type: 'row', items: ['align', 'direction']},
        {type: 'row', items: ['speed', 'pauseOnHover']},
        {type: 'row', title: 'Card', items: [{type: 'group', title: '', items: ['cardWidth', 'corners']}, {type: 'group', title: '', items: ['stroke', 'padding']}]},
        {type: 'row', title: 'Image Container', items: ['logoWidth', 'logoHeight']},
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        { type: 'group', title: 'Text', items: [
        'textFontFamily',
        'textFontSettings',
        { type: 'group',title: '', items: [ 'text', {type: 'row', items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing']}, 'textTextAppearance']}
      ]},
        { type: 'group', title: 'Caption', items: [
        'captionFontFamily',
        'captionFontSettings',
        { type: 'group', title: '', items: [ 'caption', {type: 'row', items: ['captionFontSize', 'captionLineHeight', 'captionLetterSpacing', 'captionWordSpacing']}, 'captionTextAppearance']},
      ]},
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
          url: 'https://cdn.cntrl.site/component-assets/julia.png',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: 'This website is a great tool for designers and developers. The ease of creating animations here is mesmerizing. Bravo to the creators of this product!' }],
          },
        ],
        caption: [
          {
            type: 'paragraph',
            children: [{ text: 'Julia Smith,' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Freelance Designer' }],
          },
        ],
      },
      {
        logo: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/component-assets/mark.png',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: 'This is super cool. The on onboarding terminal style animation brings me back to what made the Internet simple and fun.' }],
          },
        ],
        caption: [
          {
            type: 'paragraph',
            children: [{ text: 'Mark Travis,' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Architect @ United Architects' }],
          },
        ],
      },
      {
        logo: {
          objectFit: 'contain',
          url: 'https://cdn.cntrl.site/component-assets/pia.png',
          name: '',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: 'Great tool for someone who wants to quickly and easily build a site that has fancy scrolling animations. Totally addictive!' }],
          },
        ],
        caption: [
          {
            type: 'paragraph',
            children: [{ text: 'Pia,' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Media Buyer' }],
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
    url: 'https://cdn.cntrl.site/component-assets/Testimonials_Grid.mp4',
  },
  defaultSize: {
    d: {
      width: '100%',
      height: 320
    }    
  },
  schema,
  sourceCode: testimonialGridSourceRaw,
  assetsPaths: {
    content: [{ path: 'logo.url', placeholderEnabled: true }],
    parameters: []
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'textFontFamily' }, { path: 'captionFontFamily' }]
  },
  fontRelations: {
    textFontSettings: 'textFontFamily',
    captionFontSettings: 'captionFontFamily',
  },
};

