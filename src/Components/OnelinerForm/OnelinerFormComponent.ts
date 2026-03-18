import { OnelinerForm } from './OnelinerForm';
import { ComponentSchemaV1 } from '../../types/SchemaV1';

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
      field: {
        type: 'object',
        scope: 'common',
        title: 'Field',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['text', 'phone', 'email'] },
          placeholder: { type: 'string' },
        },
      },
      buttonLabel: {
        type: 'string',
        scope: 'common',
        title: 'Button Label',
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
        max: 10,
      },
      strokeColor: {
        type: 'string',
        scope: 'layout',
        title: 'Border',
        display: { type: 'style-panel-color-picker' },
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
      field: {
        name: 'email',
        type: 'email',
        placeholder: 'Your email',
      },
      buttonLabel: 'Submit',
      corners: 40,
      stroke: 1,
      strokeColor: '#cccccc',
      input: textStyleDefault(400, '#999999'),
      button: textStyleDefault(400, '#666666'),
    },
  },
  panels: [
    {
      id: 'general',
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__template__', 'corners'] },
        'stroke',
        'strokeColor',
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

export const OnelinerFormComponent = {
  element: OnelinerForm,
  id: 'oneliner-form',
  name: 'Oneliner',
  version: 1,
  defaultSize: {
    width: '50%',
    height: 60,
  },
  schema,
};
