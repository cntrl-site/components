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

const defaultCaptionStyleValues = {
  widthSettings: { width: 0.13, sizing: 'manual' as const },
  fontSettings: { fontFamily: 'Arial', fontWeight: 400, fontStyle: 'normal' },
  fontSizeLineHeight: { fontSize: 0.01, lineHeight: 0.01 },
  letterSpacing: 0,
  wordSpacing: 0,
  textAlign: 'left' as const,
  textAppearance: { textTransform: 'none' as const, textDecoration: 'none' as const, fontVariant: 'normal' as const },
  color: '#000000',
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
        display: { type: 'switch-toggle' },
        enum: ['on', 'off'],
      },
      speed: {
        type: 'string',
        scope: 'layout',
        title: 'Speed',
        display: { type: 'speed-control' },
        min: 1,
        max: 10,
      },
      direction: {
        type: 'string',
        scope: 'common',
        display: { type: 'switch-toggle' },
        enum: ['left', 'right'],
      },
      pause: {
        title: 'Pause on',
        type: 'string',
        scope: 'common',
        display: { type: 'switch-toggle' },
        enum: ['hover', 'off'],
      },
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control'  },
      },
      cardWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Card width',
        min: 0,
        max: 400,
        display: { type: 'range-control'  },
      },
      cardHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Card height',
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
      iconMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Icon margin top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      iconWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Icon width',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
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
        title: 'Text min height',
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
        title: 'Caption Font Family',
        display: { type: 'font-family-select' },
      },
      captionFontSettings: {
        ...testimonialCaptionTextStyleProperties.fontSettings,
        scope: 'common',
        title: 'Caption',
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
        title: 'Text Font Family',
        display: { type: 'font-family-select' },
      },
      textFontSettings: {
        ...testimonialCaptionTextStyleProperties.fontSettings,
        scope: 'common',
        title: 'Text',
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
      pause: 'off',
      strokeColor: '#000000',
      bgColor: 'rgba(255, 255, 255, 0.2)',
      captionfontFamily: 'Arial',
      captionFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      captionLetterSpacing: 0,
      captionWordSpacing: 0,
      captionTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      textfontFamily: 'Arial',
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
        iconMarginTop: 0,
        iconWidth: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
      },
      d: {
        speed: 5,
        gap: 0.02,
        cardWidth: 0.15,
        cardHeight: 0.2,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        iconMarginTop: 0,
        iconWidth: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
      },
    },
    displayRules: [
    ],
    layout: [
      '__componentName__',
      'autoplay',
      'speed',
      'direction',
      'pause',
      'gap',
      'cardWidth',
      'cardHeight',
      'corners',
      'stroke',
      'strokeColor',
      'bgColor',
      'padding',
      'iconMarginTop',
      'iconWidth',
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
        {type: 'row', items: ['pause', 'speed']},
        {type: 'row', items: ['direction', 'gap']},
        {type: 'row', items: [{type: 'group', title: '', items: ['cardWidth', 'cardHeight', 'corners', 'stroke']}, {type: 'group', title: '', items: ['padding', 'iconWidth']}]},
        {type: 'row', items: ['textMinHeight']},
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        'fontFamily',
        {
          type: 'group',
          title: '',
          items: [ 'imageCaption', {type: 'row', items: ['imageCaptionFontSize', 'imageCaptionLineHeight', 'imageCaptionLetterSpacing', 'imageCaptionWordSpacing']}, 'imageCaptionTextAppearance'],
        },
        {
          type: 'group',
          title: '',
          items: [ 'caption', {type: 'row', items: ['captionFontSize', 'captionLineHeight', 'captionLetterSpacing', 'captionWordSpacing']}, 'captionTextAppearance'],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: ['strokeColor', 'bgColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    properties: {
      items: {
        type: 'array',
        scope: 'common',
        display: {
          type: 'content-items',
          addItemFromFileExplorer: false,
          defaultWidth: 500,
        },
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'object',
              title: 'Image',
              display: { minWidth: 58, maxWidth: 108, type: 'media-input' },
              properties: {
                url: { type: 'string' },
                name: { type: 'string' },
                objectFit: { type: 'string', enum: ['cover', 'contain'] },
              },
            },
            icon: {
              type: 'object',
              title: 'Icon',
              display: { minWidth: 58, maxWidth: 108, type: 'media-input' },
              properties: {
                url: { type: 'string' },
                name: { type: 'string' },
                objectFit: { type: 'string', enum: ['cover', 'contain'] },
              },
            },
            imageCaption: {
              type: 'array',
              title: 'Text',
              display: { type: 'rich-text', minWidth: 300, maxWidth: 550 },
            },
            caption: {
              type: 'array',
              title: 'Caption',
              display: { type: 'rich-text', minWidth: 300, maxWidth: 550 },
            },
          },
        },
      },
    },
    defaults: {
      items: [
        {
          image: {},
          icon: {
            objectFit: 'cover',
            url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
            name: '',
          },
          imageCaption: [
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
          icon: {
            objectFit: 'cover',
            url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
            name: '',
          },
          imageCaption: [
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
          icon: {
            objectFit: 'contain',
            url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
            name: '',
          },
          imageCaption: [
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
  },
};

export const TestimonialGridComponent = {
  element: Testimonials,
  id: 'testimonials',
  name: 'Testimonials',
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
    parameters: [{ path: 'styles.imageCaption.fontSettings' }]
  },
};

