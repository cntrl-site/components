import { OnelinerForm } from './OnelinerForm';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import onelinerFormSourceRaw from './OnelinerForm.tsx?raw';

const onelinerDefaultSubmitIconUrl =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg width="23px" height="20px" viewBox="0 0 23 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      '<g id="Newsletter" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">' +
        '<g id="Tutorials-pop-up-Copy-12" transform="translate(-43, -687)" fill="#FFFFFF" fill-rule="nonzero">' +
          '<path d="M66,697 C66,697.552285 65.5522847,698 65,698 L44,698 C43.4477153,698 43,697.552285 43,697 C43,696.447715 43.4477153,696 44,696 L65,696 C65.5522847,696 66,696.447715 66,697 Z M55.6689647,687.256706 L65.6689647,696.256706 C66.1103451,696.653948 66.1103451,697.346052 65.6689647,697.743294 L55.6689647,706.743294 C55.2584547,707.112753 54.6261649,707.079475 54.2567059,706.668965 C53.8872468,706.258455 53.9205252,705.626165 54.3310353,705.256706 L63.5051529,697 L54.3310353,688.743294 C53.9205252,688.373835 53.8872468,687.741545 54.2567059,687.331035 C54.6261649,686.920525 55.2584547,686.887247 55.6689647,687.256706 Z" id="Combined-Shape"></path>' +
        '</g>' +
      '</g>' +
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
      buttonLabel: {
        type: 'string',
        scope: 'common',
        title: 'Button Label',
        display: { type: 'text-input' },
      },
      buttonIcon: {
        type: 'object',
        scope: 'common',
        title: 'Button Icon',
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
      iconMaxWidth: {
        type: 'number',
        scope: 'common',
        title: 'Icon Max Width',
        display: { type:'full-width-input' },
        min: 0,
        max: 1,
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
      buttonLabel: 'Subscribe',
      buttonIcon: {
        mode: 'Off',
        icon: onelinerDefaultSubmitIconUrl,
      },
      fontFamily: 'Arial',
      strokeColor: '#0A00F8',
      inputColor: '#ffffff',
      inputTextColor: '#0A00F8',
      placeholderColor: '#000000',
      buttonColor: '#0088D7',
      buttonTextColor: '#ffffff',
      errorColor: '#ef4444',
      successColor: '#22c55e',
      successMessage: 'Thanks for subscribing!',
      errorMessage: 'Please, fill all required fields.',
      stateOverrides: {
        hover: {
          buttonColor: '#33A2F2',
        }
      },
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
        textTransform: 'uppercase',
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
        iconMaxWidth: 0.1,
        stroke: 0,
        corners: 0,
        buttonPadding: { top: 0.02, right: 0.04, bottom: 0.02, left: 0.04 },
        inputPadding: { top: 0.01, right: 0.03, bottom: 0.01, left: 0.03 },
        inputFontSize: 0.043,
        inputLineHeight: 0.043,
        buttonFontSize: 0.0373,
        buttonLineHeight: 0.0373,
        statusFontSize: 0.0373,
        statusLineHeight: 0.0373,
      },
      d: {
        minHeight: 0.028,
        iconMaxWidth: 0.028,
        stroke: 0,
        corners: 0,
        buttonPadding: { right: 0.0175, left: 0.0175, top: 0.005, bottom: 0.004,},
        inputPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        inputFontSize: 0.01,
        inputLineHeight: 0.01,
        buttonFontSize: 0.009,
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
        if: { name: 'buttonIcon.mode', value: 'On' },
        then: { name: 'properties.buttonFontSettings.display.visible', value: false },
      },
      {
        if: { name: 'buttonIcon.mode', value: 'On' },
        then: { name: 'properties.buttonFontSize.display.visible', value: false },
      },
      {
        if: { name: 'buttonIcon.mode', value: 'On' },
        then: { name: 'properties.buttonLineHeight.display.visible', value: false },
      },
      {
        if: { name: 'buttonIcon.mode', value: 'On' },
        then: { name: 'properties.buttonLetterSpacing.display.visible', value: false },
      },
      {
        if: { name: 'buttonIcon.mode', value: 'On' },
        then: { name: 'properties.buttonWordSpacing.display.visible', value: false },
      },
      {
        if: { name: 'buttonIcon.mode', value: 'On' },
        then: { name: 'properties.buttonTextAppearance.display.visible', value: false },
      },
      {
        if: { name: 'buttonIcon.mode', value: 'Off' },
        then: { name: 'properties.iconMaxWidth.display.visible', value: false },
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
          {type: 'group', title: '', items: ['stroke', 'buttonIcon']},
          {
          type: 'switcher',
          title: 'Padding',
          options: {
            'Input': ['inputPadding'],
            'Button': ['buttonPadding'],
          },
        },
      ]},
      'iconMaxWidth'
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
    url: 'https://cdn.cntrl.site/component-assets/onelinerImg.jpg',
  },
  defaultSize: {
    width: 400,
    height: 60,
  },
  assetsPaths: {
    content: [],
    parameters: [{ path: 'buttonIcon.icon' }]
  },
  schema,
  sourceCode: onelinerFormSourceRaw,
};
