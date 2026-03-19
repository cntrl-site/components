import { Form } from './Form';
import { ComponentSchemaV1 } from '../../types/SchemaV1';

const defaultFieldsItems = [
  { name: 'email', type: 'email' as const, placeholder: 'Enter your email' },
  { name: 'name', type: 'text' as const, placeholder: 'Enter your name' },
  { name: 'company', type: 'text' as const, placeholder: 'Enter company' },
  { name: 'phone', type: 'phone' as const, placeholder: 'Enter your phone' },
  { name: 'message', type: 'textarea' as const, placeholder: 'Enter your message' },
  { name: 'message2', type: 'textarea' as const, placeholder: 'Enter your message 2' },
  { name: 'message3', type: 'textarea' as const, placeholder: 'Enter your message 3' },
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
    display: { type: 'style-panel-color-picker' },
  },
};

const textStyleDefault = (fontWeight: number, color: string) => ({
  fontSettings: {
    fontFamily: 'Arial',
    fontWeight,
    fontStyle: 'normal',
  },
  letterSpacing: 0,
  wordSpacing: 0,
  fontSize: 0.01,
  color,
});

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    properties: {
      fieldsToShow: {
        type: 'number',
        scope: 'layout',
        title: 'Fields',
        display: { type: 'select' },
        enum: [1, 2, 3, 4, 5, 6, 7],
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
          },
        },
      },
      type: {
        type: 'string',
        scope: 'layout',
        title: 'Alignment',
        display: { type: 'switch-toggle' },
        enum: ['A', 'B'],
      },
      buttonWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'range-control' },
        min: 0,
        max: 10,
      },
      buttonPadding: {
        type: 'object',
        scope: 'layout',
        display: { type: 'padding-controls' },
      },
      inputPadding: {
        type: 'object',
        scope: 'layout',
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
      input: {
        type: 'object',
        scope: 'layout',
        properties: textStyleProperties,
      },
      button: {
        type: 'object',
        scope: 'layout',
        properties: textStyleProperties,
      },
    },
    defaults: {
      fieldsToShow: 2,
      fields: defaultFieldsItems,
      type: 'A',
      gap: 0.008,
      fieldsGap: 0.008,
      buttonWidth: 300,
      buttonStroke: 2,
      buttonCorners: 8,
      buttonPadding: { top: 25, right: 25, bottom: 25, left: 25 },
      inputPadding: { top: 10, right: 14, bottom: 10, left: 14 },
      input: textStyleDefault(400, '#000000'),
      button: textStyleDefault(700, '#000000'),
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
                'buttonWidth',
                {
                  type: 'switcher',
                  title: 'Padding',
                  options: {
                    'Button': ['buttonPadding'],
                    'Input': ['inputPadding'],
                  },
                },
              ],
            },
            'buttonStroke',
            'buttonCorners',
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
        {
          type: 'switcher',
          title: 'Element',
          options: {
            'Input': ['input'],
            'Button': ['button'],
          },
        },
      ],
    },
  ],
};

export const FormComponent = {
  element: Form,
  id: 'form',
  name: 'Form',
  version: 1,
  defaultSize: {
    width: 400,
    height: 80,
  },
  schema,
};
