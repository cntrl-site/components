import { Form } from './Form';
import { ComponentSchemaV1 } from '../../types/SchemaV1';

const defaultFieldsItems = [
  { name: 'email', type: 'email' as const, label: 'Email', placeholder: 'Enter your email' },
  { name: 'name', type: 'text' as const, label: 'Name', placeholder: 'Enter your name' },
  { name: 'company', type: 'text' as const, label: 'Company', placeholder: 'Enter company' },
  { name: 'phone', type: 'phone' as const, label: 'Phone', placeholder: 'Enter your phone' },
  { name: 'message', type: 'textarea' as const, label: 'Message', placeholder: 'Enter your message' },
  { name: 'message2', type: 'textarea' as const, label: 'Message 2', placeholder: 'Enter your message 2' },
  { name: 'message3', type: 'textarea' as const, label: 'Message 3', placeholder: 'Enter your message 3' },
];

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    properties: {
      fields: {
        type: 'fields',
        scope: 'common',
        title: 'Fields',
        display: { type: 'fields' },
        properties: {
          fieldsToShow: {
            type: 'number',
            title: 'Visible',
            min: 1,
            max: 5,
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: ['text', 'textarea', 'phone', 'email'] },
                label: { type: 'string' },
                placeholder: { type: 'string' },
              },
            },
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
      inputStyle: {
        type: 'string',
        scope: 'common',
        title: 'Input',
        display: { type: 'radio-group' },
        enum: ['input_bordered', 'input_underline', 'input_with_label'],
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
      buttonAlignment: {
        type: 'string',
        scope: 'layout',
        title: 'Alignment',
        display: { type: 'radio-group' },
        enum: ['button_start', 'button_center', 'button_end', 'button_stretch'],
      },
    },
    layout: [
      { type: 'row', items: ['fields', 'type'] },
      'inputStyle',
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
          'buttonAlignment',
        ],
      },
    ],
    defaults: {
      fields: {
        fieldsToShow: 2,
        items: defaultFieldsItems,
      },
      type: 'A',
      inputStyle: 'bordered',
      buttonWidth: 300,
      buttonStroke: 2,
      buttonCorners: 8,
      buttonAlignment: 'start',
      buttonPadding: { top: 25, right: 25, bottom: 25, left: 25 },
      inputPadding: { top: 10, right: 14, bottom: 10, left: 14 },
    },
  },
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
