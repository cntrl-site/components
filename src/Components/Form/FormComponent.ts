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

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual', // TODO think where to place this non-editable property
    properties: {
      fieldsToShow: {
        type: 'number',
        scope: 'common',
        title: 'Fields',
        display: { type: 'number' },
        min: 1,
        max: 7,
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
      buttonLabel: {
        type: 'string',
        scope: 'common',
        title: 'Button Label',
        display: { type: 'text-input' },
      },
      successMessage: {
        type: 'string',
        scope: 'common',
        title: 'Success Message',
        display: { type: 'text-input' },
      },
      errorMessage: {
        type: 'string',
        scope: 'common',
        title: 'Error Message',
        display: { type: 'text-input' },
      },
      type: {
        type: 'string',
        scope: 'common',
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
        scope: 'common',
        title: 'Input Fill',
        display: { type: 'palette-color-picker' },
      },
      inputTextColor: {
        type: 'string',
        scope: 'common',
        title: 'Input Label',
        display: { type:'palette-color-picker' },
      },
      inputBorderColor: {
        type: 'string',
        scope: 'common',
        title: 'Input Stroke',
        display: { type: 'palette-color-picker' },
      },
      placeholderColor: {
        type: 'string',
        scope: 'common',
        title: 'Filler text',
        display: { type: 'palette-color-picker' },
      },
      buttonColor: {
        type: 'string',
        scope: 'common',
        title: 'Button Fill',
        display: { type: 'palette-color-picker' },
      },
      buttonTextColor: {
        type: 'string',
        scope: 'common',
        title: 'Button Label',
        display: { type: 'palette-color-picker' },
      },
      isButtonFullWidth: {
        type: 'boolean',
        scope: 'common',
        title: 'Full Width',
        display: { type:'toggle', enum: ['On', 'Off'] },
      },
      buttonBorderColor: {
        type: 'string',
        scope: 'common',
        title: 'Button Stroke',
        display: { type: 'palette-color-picker' },
      },
      labelTextColor: {
        type: 'string',
        scope: 'common',
        title: 'Label Color',
        display: { type: 'palette-color-picker', visible: false },
      },
      successColor: {
        type: 'string',
        scope: 'common',
        title: 'Success Message Color',
        display: { type: 'palette-color-picker' },
      },
      errorColor: {
        type: 'string',
        scope: 'common',
        title: 'Error Message Color',
        display: { type: 'palette-color-picker' },
      },
      stateOverrides: {
        type: 'object',
        scope: 'common',
      },
      fontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      inputFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: 'Input',
        display : { type: 'font-settings-weight'},
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
        scope: 'common',
        title: 'Button',
        display : { type: 'font-settings-weight' },
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
      labelFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: 'Label',
        display : { type: 'font-settings-weight', visible: false },
      },
      labelFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Label Font Size',
        display: { type: 'font-size', visible: false },
      },
      labelLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Label Line Height',
        display: { type: 'line-height-input', visible: false },
      },
      labelLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Label Letter Spacing',
        display: { type: 'letter-spacing-input', visible: false },
      },
      labelWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Label Word Spacing',
        display: { type: 'word-spacing-input', visible: false },
      },
      labelTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Label Text Appearance',
        display: { type: 'text-appearance', visible: false },
      },
      statusFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: 'Success/Error',
      },
      statusFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Success/Error Font Size',
        display: { type: 'font-size' },
      },
      statusLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Success/Error Line Height',
        display: { type: 'line-height-input' },
      },
      statusLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Success/Error Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      statusWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Success/Error Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      statusTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Success/Error Text Appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      fieldsToShow: 2,
      fields: defaultFieldsItems,
      type: 'A',
      inputColor: '#FFFFFF',
      inputTextColor: '#0A00F8',
      inputBorderColor: '#E2E2E2',
      placeholderColor: '#808080',
      buttonColor: '#0A00F8',
      buttonTextColor: '#ffffff',
      buttonBorderColor: '#0A00F8',
      labelTextColor: '#999999',
      successColor: '#22c55e',
      errorColor: '#ef4444',
      stateOverrides: {
        hover: {
          buttonColor: '#194EFF',
        }
      },
      fontFamily: 'Arial',
      inputFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
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
      buttonLetterSpacing: 0,
      buttonWordSpacing: 0,
      buttonTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      labelFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      labelLetterSpacing: 0,
      labelWordSpacing: 0,
      labelTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      statusFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      statusLetterSpacing: 0,
      statusWordSpacing: 0,
      statusTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      isButtonFullWidth: false,
      buttonLabel: 'Sign up',
      successMessage: 'Thanks for subscribing!',
      errorMessage: 'Please, fill all required fields.',
    },
    layoutDefaults: {
      m: {
        gap: 0.032,
        fieldsGap: 0.032,
        buttonStroke: 0,
        buttonCorners: 0.192,
        inputStroke: 0.003,
        inputCorners: 0.192,
        buttonPadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        inputPadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        inputFontSize: 0.043,
        inputLineHeight: 0.043,
        buttonFontSize: 0.0373,
        buttonLineHeight: 0.0373,
        labelFontSize: 0.0373,
        labelLineHeight: 0.0373,
        statusFontSize: 0.0373,
        statusLineHeight: 0.0373,
      },
      d: {
        gap: 0.0083,
        fieldsGap: 0.0083,
        buttonStroke: 0,
        buttonCorners: 0.05,
        inputStroke: 0.001,
        inputCorners: 0.05,
        buttonPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        inputPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        inputFontSize: 0.01,
        inputLineHeight: 0.01,
        buttonFontSize: 0.01,
        buttonLineHeight: 0.01,
        labelFontSize: 0.01,
        labelLineHeight: 0.01,
        statusFontSize: 0.01,
        statusLineHeight: 0.01,
      }
    },
    displayRules: [
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelTextColor.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelFontSettings.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelFontSize.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelLineHeight.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelLetterSpacing.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelWordSpacing.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.labelTextAppearance.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'C' },
        then: { name: 'properties.buttonCorners.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'C' },
        then: { name: 'properties.inputCorners.display.visible', value: false },
      },
      {
        if: { name: 'buttonStroke', value: 0 },
        then: { name: 'properties.buttonBorderColor.display.visible', value: false },
      },
      {
        if: { name: 'inputStroke', value: 0 },
        then: { name: 'properties.inputBorderColor.display.visible', value: false },
      },
      {
        if: { name: 'fieldsToShow', value: 1 },
        then: { name: 'properties.fieldsGap.display.visible', value: false },
      }
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__', 'name', 'fieldsToShow'] },
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
                    title: '',
                    items: ['inputPadding'],
                  },
              ],
            },
            {
              type: 'group',
              title: 'Button',
              items: [
                {type: 'row', items: ['isButtonFullWidth']},
                {
                  type: 'row',
                  items: [
                    { type: 'group', title: '', items: ['gap', 'buttonStroke', 'buttonCorners']},
                    { type: 'group', title: '', items: ['buttonPadding']}
                  ]
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
          type: 'group',
          title: '',
          items: [ 'inputFontSettings', {type: 'row', items: ['inputFontSize', 'inputLineHeight', 'inputLetterSpacing', 'inputWordSpacing']}, 'inputTextAppearance'],
        },
        {
          type: 'group',
          title: '',
          items: [ 'buttonFontSettings', {type: 'row', items: ['buttonFontSize', 'buttonLineHeight', 'buttonLetterSpacing', 'buttonWordSpacing']}, 'buttonTextAppearance'],
        },
        {
          type: 'group',
          title: '',
          items: [ 'labelFontSettings', {type: 'row', items: ['labelFontSize', 'labelLineHeight', 'labelLetterSpacing', 'labelWordSpacing']}, 'labelTextAppearance'],
        },
        {
          type: 'group',
          title: '',
          items: ['statusFontSettings', { type: 'row', items: ['statusFontSize', 'statusLineHeight', 'statusLetterSpacing', 'statusWordSpacing'] }, 'statusTextAppearance'],
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
        'buttonLabel',
        'successMessage',
        'errorMessage',
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['placeholderColor', 'inputColor', 'inputBorderColor', 'buttonTextColor', 'buttonColor', 'buttonBorderColor', 'labelTextColor'],
      hover: ['inputColor', 'inputBorderColor','buttonTextColor', 'buttonColor', 'buttonBorderColor'],
      focus: ['inputColor', 'inputBorderColor', 'buttonTextColor', 'buttonColor', 'buttonBorderColor'],
      filled: ['inputTextColor', 'inputColor', 'inputBorderColor', 'buttonTextColor'],
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
  name: 'Newsletter Stacked',
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/formImg.jpg',
  },
  version: 1,
  defaultSize: {
    width: 300,
    height: 42,
  },
  schema,
  sourceCode: formSourceRaw,
};
