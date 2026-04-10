import { OnelinerForm } from './OnelinerForm';
import { ComponentSchemaV1 } from '../../types/SchemaV1';

const defaultFields = [
  { name: 'email', type: 'email' as const, placeholder: 'Enter your email', label: 'Email', isRequired: true, error: 'Please, enter a valid e-mail.' },
  { name: 'name', type: 'text' as const, placeholder: 'Enter your name', label: 'Name', isRequired: false, error: 'Please, enter your name.' },
  { name: 'company', type: 'text' as const, placeholder: 'Enter company', label: 'Company', isRequired: false, error: 'Please, enter your company name.' },
  { name: 'phone', type: 'phone' as const, placeholder: 'Enter your phone', label: 'Phone', isRequired: false, error: 'Please, enter a valid phone number.' },
];

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
  color: {
    type: 'string' as const,
    title: 'Text Color',
    display: { type: 'palette-color-picker' },
  },
};

const paletteBookmarkItems = [
  'strokeColor',
  'inputColor',
  'inputTextColor',
  'placeholderColor',
  'buttonColor',
  'buttonTextColor',
  'successColor',
  'errorColor',
] as const;

const textStyleDefault = (fontWeight: number) => ({
  fontSettings: {
    fontWeight,
    fontStyle: 'normal',
  },
  letterSpacing: 0,
  wordSpacing: 0,
  fontSize: 0.01,
  lineHeight: 0.01,
  color: '#111111',
});

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      fieldsToShow: {
        type: 'number',
        scope: 'layout',
        title: 'Fields',
        display: { type: 'number' },
        min: 1,
        max: 3,
      },
      fields: {
        type: 'array',
        scope: 'common',
        display: { type: 'fields-group' },
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string', enum: ['text', 'textarea', 'phone', 'email'] },
            placeholder: { type: 'string' },
            label: { type: 'string' },
            isRequired: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
      buttonContent: {
        type: 'object',
        scope: 'common',
        display: { type: 'button-content-switch' },
        properties: {
          mode: {
            type: 'string',
            enum: ['Label', 'Icon'],
          },
          label: {
            type: ['string', 'null'] as const,
            title: 'Label',
            message: 'Subscribe',
            display: { type: 'text-input' },
          },
          icon: {
            type: ['string', 'null'] as const,
            title: 'Icon',
            display: { type: 'settings-image-input' },
          },
        },
      },
      fontFamily: {
        type: 'string',
        scope: 'layout',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      inputPadding: {
        type: 'object',
        scope: 'layout',
        title: '',
        display: { type: 'padding-controls' },
      },
      buttonPadding: {
        type: 'object',
        scope: 'layout',
        title: '',
        display: { type: 'padding-controls' },
      },
      minHeight: {
        type: 'number',
        scope: 'layout',
        title: 'min Height',
        display: { type: 'range-control' },
        min: 0,
        max: 200,
      },
      corners: {
        type: 'number',
        scope: 'layout',
        title: 'Corners',
        display: { type: 'range-control' },
        min: 0,
        max: 100,
      },
      stroke: {
        type: 'number',
        scope: 'layout',
        title: 'Stroke',
        display: { type: 'range-control' },
        min: 0,
        max: 20,
      },
      strokeColor: {
        type: 'string',
        scope: 'layout',
        title: 'Border Color',
        display: { type: 'palette-color-picker' },
      },
      inputColor: {
        type: 'string',
        scope: 'layout',
        title: 'Input Color',
        display: { type: 'palette-color-picker' },
      },
      inputTextColor: {
        type: 'string',
        scope: 'layout',
        title: 'Input Text Color',
        display: { type: 'palette-color-picker' },
      },
      placeholderColor: {
        type: 'string',
        scope: 'layout',
        title: 'Placeholder Color',
        display: { type: 'palette-color-picker' },
      },
      buttonColor: {
        type: 'string',
        scope: 'layout',
        title: 'Button Color',
        display: { type: 'palette-color-picker' },
      },
      buttonTextColor: {
        type: 'string',
        scope: 'layout',
        title: 'Button Text Color',
        display: { type: 'palette-color-picker' },
      },
      successColor: {
        type: 'string',
        scope: 'layout',
        title: 'Success Message Color',
        display: { type: 'palette-color-picker' },
      },
      errorColor: {
        type: 'string',
        scope: 'layout',
        title: 'Error Message Color',
        display: { type: 'palette-color-picker' },
      },
      successMessage: {
        type: 'string',
        scope: 'layout',
        title: 'Success Message',
        display: { type: 'text-input' },
      },
      errorMessage: {
        type: 'string',
        scope: 'layout',
        title: 'Error Message',
        display: { type: 'text-input' },
      },
      stateOverrides: {
        type: 'object',
        scope: 'layout',
      },
      inputFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'layout',
        title: 'Input',
      },
      inputFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Input Font Size',
        display: { type: 'font-size' },
      },
      inputLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Input Line Height',
        display: { type: 'line-height-input' },
      },
      inputLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      inputWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      inputTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Input Text Appearance',
        display: { type: 'text-appearance' },
      },
      buttonFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'layout',
        title: 'Button',
      },
      buttonFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Button Font Size',
        display: { type: 'font-size' },
      },
      buttonLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Button Line Height',
        display: { type: 'line-height-input' },
      },
      buttonLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Button Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      buttonWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Button Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      buttonTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Button Text Appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      fields: defaultFields,
      fieldsToShow: 1,
      buttonContent: {
        mode: 'Label',
        label: 'Submit',
        icon: null,
      },
      fontFamily: 'Arial',
      inputPadding: {
        right: 0.01,
        left: 0.01,
        top: 0.01,
        bottom: 0.01,
      },
      buttonPadding: {
        right: 0.01,
        left: 0.01,
        top: 0.01,
        bottom: 0.01,
      },
      minHeight: 0.028,
      corners: 0.05,
      stroke: 0.001,
      strokeColor: '#cccccc',
      inputColor: '#ffffff',
      inputTextColor: '#999999',
      placeholderColor: '#cccccc',
      buttonColor: '#cccccc',
      buttonTextColor: '#ffffff',
      errorColor: '#ef4444',
      successColor: '#22c55e',
      successMessage: 'Thanks for subscribing!',
      errorMessage: 'Please, fill all required fields.',
      stateOverrides: {},
      inputFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      inputFontSize: 0.01,
      inputLineHeight: 0.01,
      inputLetterSpacing: 0,
      inputWordSpacing: 0,
      inputTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      buttonFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      buttonFontSize: 0.01,
      buttonLineHeight: 0.01,
      buttonLetterSpacing: 0,
      buttonWordSpacing: 0,
      buttonTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
  },
  panels: [
    {
      id: 'general',
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__', 'fieldsToShow'] },
        {type: 'row', items: ['minHeight', 'corners']},
        {type: 'row', items: [
          {type: 'group', title: '', items: ['stroke', 'buttonContent']},
          {
          type: 'switcher',
          title: 'Padding',
          options: {
            'Input': ['inputPadding'],
            'Button': ['buttonPadding'],
          },
        },
      ]},
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
          title: 'Input',
          items: ['inputFontSettings', { type: 'row', items: ['inputFontSize', 'inputLineHeight', 'inputLetterSpacing', 'inputWordSpacing'] }, 'inputTextAppearance'],
        },
        {
          type: 'group',
          title: 'Button',
          items: ['buttonFontSettings', { type: 'row', items: ['buttonFontSize', 'buttonLineHeight', 'buttonLetterSpacing', 'buttonWordSpacing'] }, 'buttonTextAppearance'],
        },
      ],
    },
    { 
      id: 'fields',
      icon: 'layers',
      title: 'Fields',
      tooltip: 'Fields',
      layout: [
        'fields',
        'successMessage',
        'errorMessage',
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['strokeColor', 'inputColor', 'inputTextColor', 'placeholderColor', 'buttonColor', 'buttonTextColor'],
      hover: ['strokeColor', 'inputColor', 'inputTextColor', 'buttonColor', 'buttonTextColor'],
      focus: ['strokeColor', 'inputColor', 'inputTextColor', 'buttonColor', 'buttonTextColor'],
      filled: ['strokeColor', 'inputColor', 'inputTextColor', 'buttonColor', 'buttonTextColor'],
      success: ['successColor'],
      error: ['errorColor'],
    },
  },
  states: ['default', 'hover', 'focus', 'filled', 'success', 'error'],
};

export const OnelinerFormComponent = {
  element: OnelinerForm,
  id: 'oneliner-form',
  name: 'Newsletter Single Line',
  version: 1,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/onelinerImg.png',
  },
  defaultSize: {
    width: '30%',
    height: 60,
  },
  schema,
};
