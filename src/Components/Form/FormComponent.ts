import { Form } from './Form';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import formSourceRaw from './Form.tsx?raw';

const defaultFieldsItems = [
  { name: 'email', type: 'email' as const, placeholder: 'Enter your email', label: 'Email', isRequired: true, error: 'Please, enter a valid e-mail.' },
  { name: 'name', type: 'text' as const, placeholder: 'Enter your name', label: 'Name', isRequired: false, error: 'Please, enter your name.' },
  { name: 'company', type: 'text' as const, placeholder: 'Enter company', label: 'Company', isRequired: false, error: 'Please, enter your company name.' },
  { name: 'phone', type: 'phone' as const, placeholder: 'Enter your phone', label: 'Phone', isRequired: false, error: 'Please, enter a valid phone number.' },
  { name: 'message', type: 'textarea' as const, placeholder: 'Enter your message', label: 'Message', isRequired: false, error: 'Message is required' },
  { name: 'message2', type: 'textarea' as const, placeholder: 'Enter your message 2', label: 'Message 2', isRequired: false, error: 'Message 2 is required' },
  { name: 'message3', type: 'textarea' as const, placeholder: 'Enter your message 3', label: 'Message 3', isRequired: false, error: 'Message 3 is required' },
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
  textAppearance: {
    type: 'object' as const,
    display: { type: 'text-appearance' },
    properties: {
      textTransform: { type: 'string' as const, enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
      textDecoration: { type: 'string' as const, enum: ['none', 'underline'] },
      fontVariant: { type: 'string' as const, enum: ['normal', 'small-caps'] },
    },
  }
};

const paletteBookmarkItems = [
  'inputColor',
  'inputTextColor',
  'inputBorderColor',
  'placeholderColor',
  'buttonColor',
  'buttonTextColor',
  'buttonBorderColor',
  'labelTextColor',
  'successColor',
  'errorColor',
] as const;

const textStyleDefault = (fontWeight: number) => ({
  fontSettings: {
    fontWeight,
    fontStyle: 'normal',
  },
  lineHeight: 0.01,
  letterSpacing: 0,
  wordSpacing: 0,
  fontSize: 0.01,
  textAppearance: {
    textTransform: 'none',
    textDecoration: 'none',
    fontVariant: 'normal',
  }
});
const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto', // TODO think where to place this non-editable property
    properties: {
      fieldsToShow: {
        type: 'number',
        scope: 'layout',
        title: 'Fields',
        display: { type: 'number' },
        min: 1,
        max: 8,
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
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['A', 'B'],
      },
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        display: { type: 'range-control' },
        min: 0,
        max: 100,
      },
      fieldsGap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        display: { type: 'range-control' },
        min: 0,
        max: 100,
      },
      buttonPadding: {
        type: 'object',
        scope: 'layout',
        title: 'Padding',
        display: { type: 'padding-controls' },
      },
      inputPadding: {
        type: 'object',
        scope: 'layout',
        title: 'Padding',
        display: { type: 'padding-controls' },
      },
      buttonStroke: {
        type: 'number',
        scope: 'layout',
        title: 'Stroke',
        display: { type: 'range-control' },
        min: 0,
        max: 20,
      },
      buttonCorners: {
        type: 'number',
        scope: 'layout',
        title: 'Corners',
        display: { type: 'range-control' },
        min: 0,
        max: 100,
      },
      inputStroke: {
        type: 'number',
        scope: 'layout',
        title: 'Stroke',
        display: { type: 'range-control' },
        min: 0,
        max: 20,
      },
      inputCorners: {
        type: 'number',
        scope: 'layout',
        title: 'Corners',
        display: { type: 'range-control' },
        min: 0,
        max: 100,
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
        display: { type:'palette-color-picker' },
      },
      inputBorderColor: {
        type: 'string',
        scope: 'layout',
        title: 'Input Border Color',
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
      buttonBorderColor: {
        type: 'string',
        scope: 'layout',
        title: 'Button Border Color',
        display: { type: 'palette-color-picker' },
      },
      labelTextColor: {
        type: 'string',
        scope: 'layout',
        title: 'Label Color',
        display: { type: 'palette-color-picker', visible: false },
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
      stateOverrides: {
        type: 'object',
        scope: 'layout',
      },
      fontFamily: {
        type: 'string',
        scope: 'layout',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      input: {
        type: 'object',
        scope: 'layout',
        properties: textStyleProperties,
        layout: [
          'fontSettings',
          {
            type: 'row',
            items: ['fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'],
          },
          'textAppearance'
        ],
      },
      button: {
        type: 'object',
        scope: 'layout',
        properties: textStyleProperties,
        layout: [
          'fontSettings',
          {
            type: 'row',
            items: ['fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'],
          },
          'textAppearance'
        ],
      },
      label: {
        type: 'object',
        scope: 'layout',
        properties: textStyleProperties,
        layout: [
          'fontSettings',
          {
            type: 'row',
            items: ['fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'],
          },
          'textAppearance'
        ],
      },
    },
    defaults: {
      fieldsToShow: 2,
      fields: defaultFieldsItems,
      type: 'A',
      gap: 0.008,
      fieldsGap: 0.008,
      buttonStroke: 0.001,
      buttonCorners: 0,
      inputStroke: 0.001,
      inputCorners: 0,
      buttonPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
      inputPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
      inputColor: '#000000',
      inputTextColor: '#999999',
      inputBorderColor: '#cccccc',
      placeholderColor: '#cccccc',
      buttonColor: '#666666',
      buttonTextColor: '#ffffff',
      buttonBorderColor: '#cccccc',
      labelTextColor: '#999999',
      successColor: '#22c55e',
      errorColor: '#ef4444',
      stateOverrides: {},
      fontFamily: 'Arial',
      input: textStyleDefault(400),
      button: textStyleDefault(700),
      label: textStyleDefault(400),
      successMessage: 'Thanks for subscribing!',
      errorMessage: 'Please, fill all required fields.',
    },
    displayRules: [
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelTextColor.display.visible', value: true },
      },
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__template__', 'fieldsToShow'] },
        'type',
        {
          type: 'group',
          title: '',
          items: [
            {
              type: 'row',
              title: 'Input',
              items: [
                  {
                    type: 'group',
                    title: '',
                    items: ['fieldsGap', 'inputStroke', 'inputCorners'],
                  },
                  {
                    type: 'group',
                    title: 'Padding',
                    items: ['inputPadding'],
                  },
              ],
            },
            {
              type: 'row',
              title: 'Button',
              items: [
                {
                    type: 'group',
                    title: '',
                    items: ['gap', 'buttonStroke', 'buttonCorners'],
                  },
                {
                  type: 'group',
                    title: 'Padding',
                    items: ['buttonPadding'],
                },
              ],
            },
          ],
        },
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
          type: 'row',
          title: 'Input',
          items: ['input'],
        },
        {
          type: 'row',
          title: 'Button',
          items: ['button'],
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
      default: ['inputColor', 'inputBorderColor', 'placeholderColor','placeholderTextColor', 'buttonColor', 'buttonTextColor', 'buttonBorderColor', 'labelTextColor'],
      hover: ['inputColor', 'inputBorderColor', 'placeholderColor', 'buttonColor', 'buttonTextColor', 'buttonBorderColor'],
      focus: ['inputColor', 'inputBorderColor', 'placeholderColor', 'buttonColor', 'buttonTextColor', 'buttonBorderColor'],
      filled: ['inputColor', 'inputTextColor', 'inputBorderColor'],
      success: ['successColor'],
      error: ['errorColor'],
    },
  },
  allowedPlugins: ['newsletter'],
  states: ['default', 'hover', 'focus', 'filled', 'success', 'error'],
};

export const FormComponent = {
  element: Form,
  id: 'form',
  name: 'Form',
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/clickGalleryPreview.png',
  },
  version: 1,
  defaultSize: {
    width: 400,
    height: 42,
  },
  schema,
  sourceCode: formSourceRaw,
};
