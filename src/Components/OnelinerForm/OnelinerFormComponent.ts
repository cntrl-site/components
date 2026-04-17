import { OnelinerForm } from './OnelinerForm';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import onelinerFormSourceRaw from './OnelinerForm.tsx?raw';

const onelinerDefaultSubmitIconUrl =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="9">' +
      '<path fill="white" transform="translate(0.0625 0.0595703)" d="M0.18305826 0.18305826C0.40836075 -0.042244215 0.76288015 -0.059575174 1.0080621 0.13106538L1.0669417 0.18305826L4.8169417 3.9330583C5.0422444 4.158361 5.0595751 4.5128803 4.8689346 4.7580624L4.8169417 4.8169417L1.0669417 8.5669422C0.82286406 8.8110189 0.42713594 8.8110189 0.18305826 8.5669422C-0.042244215 8.3416395 -0.059575174 7.9871197 0.13106538 7.7419376L0.18305826 7.6830583L3.4906249 4.375L0.18305826 1.0669417C-0.042244215 0.84163928 -0.059575174 0.48711985 0.13106538 0.24193785L0.18305826 0.18305826Z" fill-rule="evenodd"/>' +
      '</svg>',
  );

const defaultFields = [
  { name: 'email', type: 'email' as const, placeholder: 'Enter your email', label: 'Email', isRequired: true, error: 'Please, enter a valid e-mail.' },
  { name: 'name', type: 'text' as const, placeholder: 'Enter your name', label: 'Name', isRequired: false, error: 'Please, enter your name.' },
  { name: 'company', type: 'text' as const, placeholder: 'Enter company', label: 'Company', isRequired: false, error: 'Please, enter your company name.' },
  { name: 'phone', type: 'phone' as const, placeholder: 'Enter your phone', label: 'Phone', isRequired: false, error: 'Please, enter a valid phone number.' },
];

const textStyleProperties = {
  fontSettings: {
    type: 'object' as const,
    display: { type: 'font-settings-weight', visible: true },
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

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      fieldsToShow: {
        type: 'number',
        scope: 'common',
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
            type: { type: 'string', enum: ['text', 'phone', 'email'] },
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
        scope: 'common',
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
        scope: 'common',
        title: 'Stroke',
        display: { type: 'palette-color-picker' },
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
        display: { type: 'palette-color-picker' },
      },
      placeholderColor: {
        type: 'string',
        scope: 'common',
        title: 'Filler Text',
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
      stateOverrides: {
        type: 'object',
        scope: 'common',
      },
      inputFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
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
        scope: 'common',
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
      fields: defaultFields,
      fieldsToShow: 1,
      buttonContent: {
        mode: 'Icon',
        label: 'Submit',
        icon: onelinerDefaultSubmitIconUrl,
      },
      fontFamily: 'Arial',
      strokeColor: '#0A00F8',
      inputColor: '#ffffff',
      inputTextColor: '#0A00F8',
      placeholderColor: '#0A00F8',
      buttonColor: '#0A00F8',
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
    },
    layoutDefaults: {
      m: {
        minHeight: 0.1,
        stroke: 0.0026,
        corners: 0.192,
        buttonPadding: { top: 0.02, right: 0.04, bottom: 0.02, left: 0.04 },
        inputPadding: { top: 0.01, right: 0.03, bottom: 0.01, left: 0.03 },
        inputFontSize: 0.0373,
        inputLineHeight: 0.0373,
        buttonFontSize: 0.0373,
        buttonLineHeight: 0.0373,
        statusFontSize: 0.0373,
        statusLineHeight: 0.0373,
      },
      d: {
        minHeight: 0.028,
        stroke: 0.0015,
        corners: 0.05,
        buttonPadding: { right: 0.01, left: 0.01, top: 0.005, bottom: 0.005,},
        inputPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        inputFontSize: 0.01,
        inputLineHeight: 0.01,
        buttonFontSize: 0.01,
        buttonLineHeight: 0.01,
        statusFontSize: 0.01,
        statusLineHeight: 0.01,
      },
    },
    displayRules: [
      {
        if: { name: 'stroke', value: 0 },
        then: { name: 'properties.strokeColor.display.visible', value: false },
      },
      {
        if: { name: 'buttonContent.mode', value: 'Icon' },
        then: { name: 'properties.buttonFontSettings.display.visible', value: false },
      },
      {
        if: { name: 'buttonContent.mode', value: 'Icon' },
        then: { name: 'properties.buttonFontSize.display.visible', value: false },
      },
      {
        if: { name: 'buttonContent.mode', value: 'Icon' },
        then: { name: 'properties.buttonLineHeight.display.visible', value: false },
      },
      {
        if: { name: 'buttonContent.mode', value: 'Icon' },
        then: { name: 'properties.buttonLetterSpacing.display.visible', value: false },
      },
      {
        if: { name: 'buttonContent.mode', value: 'Icon' },
        then: { name: 'properties.buttonWordSpacing.display.visible', value: false },
      },
      {
        if: { name: 'buttonContent.mode', value: 'Icon' },
        then: { name: 'properties.buttonTextAppearance.display.visible', value: false },
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
          title: '',
          items: ['inputFontSettings', { type: 'row', items: ['inputFontSize', 'inputLineHeight', 'inputLetterSpacing', 'inputWordSpacing'] }, 'inputTextAppearance'],
        },
        {
          type: 'group',
          title: '',
          items: ['buttonFontSettings', { type: 'row', items: ['buttonFontSize', 'buttonLineHeight', 'buttonLetterSpacing', 'buttonWordSpacing'] }, 'buttonTextAppearance'],
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
        'successMessage',
        'errorMessage',
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['strokeColor', 'placeholderColor', 'inputColor', 'buttonTextColor', 'buttonColor'],
      hover: ['strokeColor', 'inputColor', 'buttonTextColor', 'buttonColor'],
      focus: ['strokeColor', 'inputTextColor', 'buttonTextColor', 'buttonColor'],
      filled: ['strokeColor', 'inputColor', 'inputTextColor', 'buttonTextColor'],
      success: ['successColor'],
      error: ['errorColor'],
    },
  },
  allowedPlugins: ['newsletter'],
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
    width: 300,
    height: 60,
  },
  schema,
  sourceCode: onelinerFormSourceRaw,
};
