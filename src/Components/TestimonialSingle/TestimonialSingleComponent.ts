import { TestimonialSingle } from './TestimonialSingle';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import testimonialSingleSourceRaw from './TestimonialSingle.tsx?raw';

const testimonialDefaultControlsIconUrl =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 18" width="10" height="18">' +
      '<path fill="#000000" fill-rule="evenodd" d="M-3.70710678,4.29289322 C-3.34662282,3.93240926 -2.77939176,3.90467972 -2.38710056,4.20970461 L-2.29289322,4.29289322 L5,11.585 L12.2928932,4.29289322 C12.6533772,3.93240926 13.2206082,3.90467972 13.6128994,4.20970461 L13.7071068,4.29289322 C14.0675907,4.65337718 14.0953203,5.22060824 13.7902954,5.61289944 L13.7071068,5.70710678 L5.70710678,13.7071068 C5.34662282,14.0675907 4.77939176,14.0953203 4.38710056,13.7902954 L4.29289322,13.7071068 L-3.70710678,5.70710678 C-4.09763107,5.31658249 -4.09763107,4.68341751 -3.70710678,4.29289322 Z" transform="translate(5, 9) rotate(-90) translate(-5, -9)"/>' +
    '</svg>',
  );

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
      delay: {
        type: 'number',
        scope: 'layout',
        title: 'Delay(s)',
        display: { type: 'percentage-input'},
        step: 1,
        min: 1,
        max: 8,
      },
      align: {
        type: 'string',
        scope: 'common',
        title: 'Align',
        display: {
          type: 'align-group',
          direction: 'horizontal',
        },
        enum: ['start', 'center', 'end']
      },
      width: {
        type: 'number',
        scope: 'layout',
        title: 'width',
        min: 0,
        max: 1000,
        display: { type: 'numeric-input' },
      },
      imageWidth: {
        type: 'number',
        scope: 'layout',
        title: 'width',
        min: 0,
        max: 300,
        display: { type: 'numeric-input' },
      },
      imageHeight: {
        type: 'number',
        scope: 'layout',
        title: 'height',
        min: 0,
        max: 300,
        display: { type: 'numeric-input' },
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
      controls: {
        type: 'object',
        scope: 'common',
        title: 'Controls',
        display: { type: 'button-icon-switch' },
        properties: {
          mode: {
            type: 'string',
            enum: ['On', 'Off'],
          },
          icon: {
            type: ['string', 'null'] as const,
            title: 'Icon',
            display: { type: 'settings-image-input' },
          },
        },
      },
      controlsWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Controls width',
        min: 0,
        max: 100,
        display: { type: 'numeric-input' },
      },
      controlsColor: {
        type: 'string',
        scope: 'common',
        title: 'Controls Color',
        display: { type: 'settings-color-picker' },
      },
      controlsHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Controls Hover',
        display: { type: 'settings-color-picker' },
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
        title: 'Font Family',
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
      captionColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Caption Color',
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
      textColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Text Color',
      },
    },
    defaults: {
      autoplay: 'on',
      controls: {
        mode: 'On',
        icon: testimonialDefaultControlsIconUrl,
      },
      controlsColor: '#000000',
      controlsHoverColor: '#EABC01',
      align: 'center',
      textFontFamily: 'Goudy Bookletter 1911',
      textFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      textLetterSpacing: 0,
      textWordSpacing: 0,
      textTextAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
      textColor: '#000000',
      captionFontFamily: 'Charter',
      captionFontSettings: { fontWeight: 400, fontStyle: 'normal' },
      captionLetterSpacing: 0,
      captionWordSpacing: 0,
      captionTextAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
      captionColor: '#000000',
    },
    layoutDefaults: {
      m: {
        delay: 3,
        width: 0.69,
        imageMarginTop: 0.08,
        captionMarginTop: 0.04,
        textMarginTop: 0,
        textFontSize: 0.069,
        captionFontSize: 0.053,
        textLineHeight: 0.093,
        captionLineHeight: 0.069,
        imageWidth: 0.21,
        imageHeight: 0.21,
        controlsWidth: 0.06,
      },
      d: {
        delay: 3,
        width: 0.35,
        imageMarginTop: 0.02,
        textMarginTop: 0,
        captionMarginTop: 0.01,
        textFontSize: 0.016,
        captionFontSize: 0.009,
        textLineHeight: 0.018,
        captionLineHeight: 0.009,
        imageWidth: 0.027,
        imageHeight: 0.027,
        controlsWidth: 0.014,
      },
    },
    displayRules: [
      {
        if: { name: 'autoplay', value: 'off' },
        then: { name: 'properties.delay.display.enabled', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'autoplay',
      'delay',
      'width',
      'imageMarginTop',
      'textMarginTop',
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
        { type: 'row', items: ['__componentName__', 'autoplay'] },
        { type: 'row', items: ['width', 'align'] },
        { type: 'row', items: ['controls'] },
        { type: 'row', items: ['controlsWidth', 'delay'] },
        { type: 'row', title: 'Image Container', items: ['imageWidth', 'imageHeight'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        { type: 'group', title: 'Text', items: [
        'textFontFamily',
        'textFontSettings',
        { type: 'group', title: '', items: [ 'text', {type: 'row', items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing']}, 'textTextAppearance']},
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
    items: ['textColor', 'captionColor', 'controlsColor', 'controlsHoverColor'],
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
          image: {
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
          image: {
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
    parameters: [{ path: 'settings.controls.icon' } ]
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'styles.text.fontSettings' }, { path: 'styles.caption.fontSettings' }]
  },
};

