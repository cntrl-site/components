import { TestimonialSingle } from './TestimonialSingle';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import testimonialSingleSourceRaw from './TestimonialSingle.tsx?raw';

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
      width: {
        type: 'number',
        scope: 'layout',
        title: 'Card width',
        min: 0,
        max: 400,
        display: { type: 'range-control' },
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
      iconAlign: {
        type: 'string',
        scope: 'common',
        title: 'Icon align',
        enum: ['left', 'center', 'right'],
        display: { type: 'align-group', direction: 'vertical' },
      },
      iconScale: {
        type: 'number',
        scope: 'layout',
        title: 'Icon scale',
        min: 50,
        max: 600,
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

      imageCaptionFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Text Font Family',
        display: { type: 'font-family-select' },
      },
      imageCaptionFontSettings: {
        ...testimonialCaptionTextStyleProperties.fontSettings,
        scope: 'common',
        title: 'Text',
        display: { type: 'font-settings-weight' },
      },
      imageCaptionFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Text Font Size',
        display: { type: 'font-size' },
      },
      imageCaptionLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Text Line Height',
        display: { type: 'line-height-input' },
      },
      imageCaptionLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Text Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      imageCaptionWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Text Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      imageCaptionTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text Text Appearance',
        display: { type: 'text-appearance' },
      },
      imageCaptionTextAlign: {
        display: { type: 'text-align-control' },
        type: 'string',
        scope: 'common',
        title: 'Text Align',
        enum: ['left', 'center', 'right'],
      },
      imageCaptionColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Text Color',
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
        display: { type: 'font-settings-weight' },
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
      captionTextAlign: {
        display: { type: 'text-align-control' },
        type: 'string',
        scope: 'common',
        title: 'Caption Align',
        enum: ['left', 'center', 'right'],
      },
      captionColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Caption Color',
      },
    },
    defaults: {
      autoplay: 'off',
      iconAlign: 'left',
      iconScale: 100,

      imageCaptionFontFamily: defaultCaptionStyleValues.fontSettings.fontFamily,
      imageCaptionFontSettings: {
        fontWeight: defaultCaptionStyleValues.fontSettings.fontWeight,
        fontStyle: defaultCaptionStyleValues.fontSettings.fontStyle,
      },
      imageCaptionLetterSpacing: defaultCaptionStyleValues.letterSpacing,
      imageCaptionWordSpacing: defaultCaptionStyleValues.wordSpacing,
      imageCaptionTextAlign: defaultCaptionStyleValues.textAlign,
      imageCaptionTextAppearance: defaultCaptionStyleValues.textAppearance,
      imageCaptionColor: defaultCaptionStyleValues.color,

      captionFontFamily: defaultCaptionStyleValues.fontSettings.fontFamily,
      captionFontSettings: {
        fontWeight: defaultCaptionStyleValues.fontSettings.fontWeight,
        fontStyle: defaultCaptionStyleValues.fontSettings.fontStyle,
      },
      captionLetterSpacing: defaultCaptionStyleValues.letterSpacing,
      captionWordSpacing: defaultCaptionStyleValues.wordSpacing,
      captionTextAlign: defaultCaptionStyleValues.textAlign,
      captionTextAppearance: defaultCaptionStyleValues.textAppearance,
      captionColor: defaultCaptionStyleValues.color,
    },
    layoutDefaults: {
      m: {
        speed: 5,
        width: 0.15,
        height: 0.2,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        iconMarginTop: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
      },
      d: {
        speed: 5,
        width: 0.15,
        height: 0.2,
        corners: 0.005,
        stroke: 0.001,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        iconMarginTop: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
      },
    },
    displayRules: [],
    layout: [
      '__componentName__',
      'autoplay',
      'speed',
      'width',
      'padding',
      'iconMarginTop',
      'iconAlign',
      'iconScale',
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
        { type: 'row', items: ['__componentName__', 'autoplay'] },
        { type: 'row', items: ['speed'] },
        { type: 'row', items: [{ type: 'group', title: '', items: ['width'] }, { type: 'group', title: '', items: ['padding'] }] },
        { type: 'row', items: [{ type: 'group', title: '', items: ['iconMarginTop', 'iconAlign', 'iconScale'] }] },
        { type: 'row', items: [{ type: 'group', title: '', items: ['textMarginTop', 'textMinHeight', 'captionMarginTop'] }] },
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
          title: '',
          items: [
            { type: 'row', items: ['imageCaptionFontFamily', 'imageCaptionFontSettings'] },
            { type: 'row', items: ['imageCaptionFontSize', 'imageCaptionLineHeight', 'imageCaptionLetterSpacing', 'imageCaptionWordSpacing'] },
            'imageCaptionTextAppearance',
            { type: 'row', items: ['imageCaptionTextAlign', 'imageCaptionColor'] },
          ],
        },
        {
          type: 'group',
          title: '',
          items: [
            { type: 'row', items: ['captionFontFamily', 'captionFontSettings'] },
            { type: 'row', items: ['captionFontSize', 'captionLineHeight', 'captionLetterSpacing', 'captionWordSpacing'] },
            'captionTextAppearance',
            { type: 'row', items: ['captionTextAlign', 'captionColor'] },
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: ['imageCaptionColor', 'captionColor'],
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
            objectFit: 'cover',
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

export const TestimonialSingleComponent = {
  element: TestimonialSingle,
  id: 'testimonial single',
  name: 'Testimonial Single',
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
  sourceCode: testimonialSingleSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [{ path: 'settings.controls.arrowsImgUrl' }]
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'styles.imageCaption.fontSettings' }, { path: 'styles.caption.fontSettings' }]
  },
};

