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
        display: { type: 'switch-control' },
        enum: ['on', 'off'],
      },
      speed: {
        type: 'number',
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
      imageWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Image width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      imageMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Image margin top',
        min: 0,
        max: 100,
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
        title: 'Caption',
        display: { type: 'font-family-select' },
      },
      captionFontSettings: {
        ...testimonialCaptionTextStyleProperties.fontSettings,
        scope: 'common',
        title: '',
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
        display: { type: 'font-settings-weight' },
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
      textTextAlign: {
        display: { type: 'text-align-control' },
        type: 'string',
        scope: 'common',
        title: 'Text Align',
        enum: ['left', 'center', 'right'],
      },
      textColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Text Color',
      },
    },
    defaults: {
      autoplay: 'off',
      textFontFamily: defaultCaptionStyleValues.fontSettings.fontFamily,
      textFontSettings: {
        fontWeight: defaultCaptionStyleValues.fontSettings.fontWeight,
        fontStyle: defaultCaptionStyleValues.fontSettings.fontStyle,
      },
      textLetterSpacing: defaultCaptionStyleValues.letterSpacing,
      textWordSpacing: defaultCaptionStyleValues.wordSpacing,
      textTextAlign: defaultCaptionStyleValues.textAlign,
      textTextAppearance: defaultCaptionStyleValues.textAppearance,
      textColor: defaultCaptionStyleValues.color,
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
        imageMarginTop: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
        textFontSize: 0.01,
        captionFontSize: 0.01,
        textLineHeight: 0.01,
        captionLineHeight: 0.01,
        imageWidth: 0.15,
      },
      d: {
        speed: 5,
        width: 0.15,
        height: 0.2,
        corners: 0.005,
        stroke: 0.001,
        imageMarginTop: 0,
        textMarginTop: 0,
        textMinHeight: 0.01,
        captionMarginTop: 0,
        textFontSize: 0.01,
        captionFontSize: 0.01,
        textLineHeight: 0.01,
        captionLineHeight: 0.01,
        imageWidth: 0.15,
      },
    },
    displayRules: [],
    layout: [
      '__componentName__',
      'autoplay',
      'speed',
      'width',
      'imageMarginTop',
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
        { type: 'row', items: ['controls', 'speed'] },
        { type: 'row', items: [{ type: 'group', title: '', items: ['width'] }] },
        { type: 'row', items: [{ type: 'group', title: '', items: ['delay', 'imageWidth'] }] },
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
    items: ['textColor', 'captionColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: true
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
          image: {
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
          image: {
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
          image: {
            objectFit: 'cover',
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

export const TestimonialSingleComponent = {
  element: TestimonialSingle,
  id: 'testimonial-single',
  name: 'Clara',
  category: 'testimonials',
  version: 1,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/testimonialsSingle.png',
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
    parameters: [{ path: 'styles.text.fontSettings' }, { path: 'styles.caption.fontSettings' }]
  },
};

