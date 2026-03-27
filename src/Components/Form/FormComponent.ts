import { Form } from './Form';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import formSourceRaw from './Form.tsx?raw';

const defaultFieldsItems = [
  { name: 'email', type: 'email' as const, placeholder: 'Enter your email', label: 'Email' },
  { name: 'name', type: 'text' as const, placeholder: 'Enter your name', label: 'Name' },
  { name: 'company', type: 'text' as const, placeholder: 'Enter company', label: 'Company' },
  { name: 'phone', type: 'phone' as const, placeholder: 'Enter your phone', label: 'Phone' },
  { name: 'message', type: 'textarea' as const, placeholder: 'Enter your message', label: 'Message' },
  { name: 'message2', type: 'textarea' as const, placeholder: 'Enter your message 2', label: 'Message 2' },
  { name: 'message3', type: 'textarea' as const, placeholder: 'Enter your message 3', label: 'Message 3' },
];

const textStyleProperties = {
  fontSettings: {
    type: 'object' as const,
    display: { type: 'font-settings' },
    properties: {
      fontFamily: { type: 'string' as const },
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

const textStyleDefault = (fontWeight: number) => ({
  fontSettings: {
    fontFamily: 'Arial',
    fontWeight,
    fontStyle: 'normal',
  },
  lineHeight: 0,
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
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string', enum: ['text', 'textarea', 'phone', 'email'] },
            placeholder: { type: 'string' },
            label: { type: 'string' },
          },
        },
      },
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['A', 'B', 'C'],
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
        title: 'Color',
        display: { type: 'palette-color-picker' },
      },
      inputTextColor: {
        type: 'string',
        scope: 'layout',
        title: 'Text Color',
        display: { type:'palette-color-picker' },
      },
      inputBorderColor: {
        type: 'string',
        scope: 'layout',
        title: 'Border Color',
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
        title: 'Color',
        display: { type: 'palette-color-picker' },
      },
      buttonTextColor: {
        type: 'string',
        scope: 'layout',
        title: 'Text Color',
        display: { type: 'palette-color-picker' },
      },
      buttonBorderColor: {
        type: 'string',
        scope: 'layout',
        title: 'Border Color',
        display: { type: 'palette-color-picker' },
      },
      labelTextColor: {
        type: 'string',
        scope: 'layout',
        title: 'Text Color',
        display: { type: 'palette-color-picker' },
      },
      labelBorderColor: {
        type: 'string',
        scope: 'layout',
        title: 'Border Color',
        display: { type: 'palette-color-picker' },
      },
      input: {
        type: 'object',
        scope: 'layout',
        properties: textStyleProperties,
        layout: [
          'fontSettings',
          {
            type: 'row',
            items: ['letterSpacing', 'wordSpacing', 'fontSize', 'lineHeight'],
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
            items: ['letterSpacing', 'wordSpacing','fontSize', 'lineHeight'],
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
            items: ['letterSpacing', 'wordSpacing', 'fontSize', 'lineHeight'],
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
      buttonColor: '#666666',
      buttonTextColor: '#ffffff',
      buttonBorderColor: '#cccccc',
      labelTextColor: '#999999',
      input: textStyleDefault(400),
      button: textStyleDefault(700),
      label: textStyleDefault(400),
    },
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
          title: 'BUTTON',
          items: [
            {
              type: 'row',
              items: [
                {
                  type: 'switcher',
                  title: '',
                  options: {
                    'Button': [
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
                    'Input': [
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
                },
              ],
            },
          ],
        },
        {
          type: 'row',
          items: ['inputColor', 'inputTextColor', 'inputBorderColor', 'placeholderColor', 'buttonColor', 'buttonTextColor', 'buttonBorderColor', 'labelTextColor'],
        },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        {
          type: 'switcher',
          title: '',
          options: {
            'Input': ['input'],
            'Button': ['button'],
            'Label': ['label'],
          },
        },
      ],
    }
  ],
  allowedPlugins: 'newsletter',
};

export const FormComponent = {
  element: Form,
  id: 'form',
  name: 'Form',
  version: 1,
  defaultSize: {
    width: 400,
    height: 42,
  },
  schema,
  sourceCode: formSourceRaw,
};
