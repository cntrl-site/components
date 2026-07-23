import { SimpleButton } from './SimpleButton';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import simpleButtonSourceRaw from './SimpleButton.tsx?raw';

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
  },
};

const paletteBookmarkItems = [
  'backgroundColor',
  'textColor',
  'borderColor',
  'iconColor',
  'boxShadowColor',
  'innerBoxShadowColor',
] as const;

const schema = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto',
    properties: {
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b', 'c'],
      },
      label: {
        type: 'string',
        scope: 'common',
        title: 'Label',
        display: { type: 'label-input' },
      },
      icon: {
        type: ['string', 'null'] as const,
        scope: 'common',
        title: 'Icon',
        display: { type: 'settings-image-input', visible: false },
      },
      alignment: {
        type: 'string',
        scope: 'layout',
        title: 'Alignment',
        display: { type: 'toggle-cycle', enum: ['left', 'center', 'right'] },
      },
      alignA: {
        type: 'string',
        scope: 'layout',
        title: 'Alignment',
        display: { type: 'toggle-cycle', enum: ['left', 'center', 'right'], visible: false },
      },
      order: {
        type: 'string',
        scope: 'layout',
        title: 'Order',
        display: { type: 'toggle-cycle', enum: ['text-icon', 'icon-text'], visible: false },
      },
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        display: { type: 'numeric-input', visible: false },
        min: 0,
        max: 9999,
      },
      iconScale: {
        type: 'number',
        scope: 'layout',
        title: 'Icon size (%)',
        display: { type: 'percentage-input', visible: false },
        min: 10,
        max: 9999,
      },
      iconSize: {
        type: 'number',
        scope: 'layout',
        title: 'Icon width',
        display: { type: 'numeric-input', visible: false },
        min: 0,
        max: 9999,
      },
      dimensions: {
        type: 'boolean',
        scope: 'layout',
        title: 'Dimensions',
        display: { type: 'toggle', enum: ['auto', 'fixed'] },
      },
      padding: {
        type: 'object',
        scope: 'layout',
        title: 'Padding',
        display: { type: 'padding-controls' },
      },
      cornerRadius: {
        type: 'object',
        scope: 'layout',
        title: 'Corner radius',
        display: { type: 'padding-controls' },
      },
      boxShadow: {
        type: 'object',
        scope: 'layout',
        title: 'Shadow',
        display: {
          type: 'padding-controls',
          step: 0.1,
          decimal: true,
          allowNegative: true,
          nonNegativeSides: ['right'],
          sideLetters: { top: 'Y', left: 'X', right: 'B', bottom: 'S' },
        },
      },
      boxShadowColor: {
        type: 'string',
        scope: 'common',
        title: 'Shadow color',
        display: { type: 'palette-color-picker' },
      },
      innerBoxShadow: {
        type: 'object',
        scope: 'layout',
        title: 'Inner shadow',
        display: {
          type: 'padding-controls',
          step: 0.1,
          decimal: true,
          allowNegative: true,
          nonNegativeSides: ['right'],
          sideLetters: { top: 'Y', left: 'X', right: 'B', bottom: 'S' },
        },
      },
      innerBoxShadowColor: {
        type: 'string',
        scope: 'common',
        title: 'Inner shadow color',
        display: { type: 'palette-color-picker' },
      },
      stroke: {
        type: 'number',
        scope: 'layout',
        title: 'Border',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'Default background',
        display: { type: 'palette-color-picker' },
      },
      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Default text',
        display: { type: 'palette-color-picker' },
      },
      borderColor: {
        type: 'string',
        scope: 'common',
        title: 'Border color',
        display: { type: 'palette-color-picker' },
      },
      iconColor: {
        type: 'string',
        scope: 'common',
        title: 'Default icon',
        display: { type: 'palette-color-picker' },
      },
      stateOverrides: {
        type: 'object',
        scope: 'common',
      },
      hoverEffect: {
        type: 'string',
        scope: 'layout',
        title: 'Hover effect',
        display: { type: 'toggle-cycle', enum: ['none', 'scale-up', 'lift', 'blinds', 'reveal', 'swipe', 'content-roll'] },
      },
      fontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      fontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      fontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Font size',
        display: { type: 'font-size' },
      },
      lineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Line height',
        display: { type: 'line-height-input' },
      },
      letterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Letter spacing',
        display: { type: 'letter-spacing-input' },
      },
      wordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Word spacing',
        display: { type: 'word-spacing-input' },
      },
      textAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text appearance',
        display: { type: 'text-appearance' },
      },
      minWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Min width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      minHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
    },
    defaults: {
      type: 'a',
      label: 'Button',
      icon: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KY78A0YVT403B042HVWWTHBC.svg',
      alignment: 'center',
      alignA: 'center',
      order: 'text-icon',
      gap: 0,
      iconScale: 100,
      iconSize: 40 / 1440,
      dimensions: false,
      padding: {
        top: 10 / 1440,
        right: 10 / 1440,
        bottom: 10 / 1440,
        left: 10 / 1440,
      },
      cornerRadius: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      boxShadow: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      boxShadowColor: '#000000',
      innerBoxShadow: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      innerBoxShadowColor: '#000000',
      stroke: 0,
      backgroundColor: '#000000',
      textColor: '#ffffff',
      borderColor: '#ffffff',
      iconColor: '#ffffff',
      hoverEffect: 'none',
      fontFamily: 'Arial',
      fontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      letterSpacing: 0,
      wordSpacing: 0,
      textAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      stateOverrides: {
        hover: {
          backgroundColor: '#333333',
        },
        active: {
          backgroundColor: '#555555',
        },
      },
      minWidth: 100 / 1440,
      minHeight: 100 / 1440,
    },
    layoutDefaults: {
      m: {
        dimensions: false,
        padding: {
          top: 10 / 375,
          right: 10 / 375,
          bottom: 10 / 375,
          left: 10 / 375,
        },
        minWidth: 100 / 375,
        minHeight: 100 / 375,
        iconSize: 32 / 375,
        fontSize: 0.0426,
        lineHeight: 0.0426,
      },
      t: {
        dimensions: false,
        padding: {
          top: 10 / 768,
          right: 10 / 768,
          bottom: 10 / 768,
          left: 10 / 768,
        },
        minWidth: 100 / 768,
        minHeight: 100 / 768,
        iconSize: 36 / 768,
        fontSize: 0.02083,
        lineHeight: 0.02604,
      },
      d: {
        dimensions: false,
        padding: {
          top: 10 / 1440,
          right: 10 / 1440,
          bottom: 10 / 1440,
          left: 10 / 1440,
        },
        minWidth: 100 / 1440,
        minHeight: 100 / 1440,
        iconSize: 40 / 1440,
        fontSize: 0.01,
        lineHeight: 0.01,
      },
    },
    layout: [
      '__componentName__',
      'type',
      'label',
      'icon',
      'alignment',
      'order',
      'gap',
      'iconScale',
      'iconSize',
      'hoverEffect',
      { type: 'row', title: '', items: ['dimensions', 'padding'] },
      'cornerRadius',
      'boxShadow',
      'boxShadowColor',
      'innerBoxShadow',
      'innerBoxShadowColor',
      { type: 'row', title: '', items: ['stroke', 'borderColor'] },
      { type: 'row', title: '', items: ['minWidth', 'minHeight'] },
    ],
    displayRules: [
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.icon.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.alignment.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.alignA.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.iconColor.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.icon.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.label.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.fontFamily.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.fontSettings.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.fontSize.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.lineHeight.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.letterSpacing.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.wordSpacing.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.textAppearance.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.iconSize.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.icon.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.order.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.iconScale.display.visible', value: true },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.gap.display.visible', value: true },
      },
      {
        if: { name: 'stroke', value: 0 },
        then: { name: 'properties.borderColor.display.visible', value: false },
      },
      {
        if: { name: 'dimensions', value: true },
        then: { name: 'properties.minWidth.display.visible', value: false },
      },
      {
        if: { name: 'dimensions', value: true },
        then: { name: 'properties.minHeight.display.visible', value: false },
      },
      {
        if: { name: 'dimensions', value: true },
        then: { name: 'properties.alignment.display.enabled', value: false },
      },
      {
        if: { name: 'dimensions', value: true },
        then: { name: 'properties.alignA.display.enabled', value: false },
      },
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        '__componentName__',
        'type',
        { type: 'row', title: '', items: ['label', 'icon', 'iconSize', 'alignA'] },
        { type: 'row', title: '', items: ['alignment', 'order'] },
        { type: 'row', title: '', items: ['gap', 'iconScale'] },
        { type: 'row', title: '', items: ['dimensions', 'padding'] },
        { type: 'row', title: '', items: ['minWidth', 'minHeight'] },
        { type: 'row', title: '', items: ['hoverEffect', 'cornerRadius'] },
        { type: 'row', title: '', items: ['boxShadow'] },
        { type: 'row', title: '', items: ['innerBoxShadow'] },
        { type: 'row', title: '', items: ['stroke'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        'fontFamily',
        'fontSettings',
        { type: 'row', title: '', items: ['fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'] },
        'textAppearance',
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['backgroundColor', 'textColor', 'borderColor', 'iconColor', 'boxShadowColor', 'innerBoxShadowColor'],
      hover: ['backgroundColor', 'textColor', 'borderColor', 'iconColor', 'boxShadowColor', 'innerBoxShadowColor'],
      active: ['backgroundColor', 'textColor', 'borderColor', 'iconColor', 'boxShadowColor', 'innerBoxShadowColor'],
    },
  },
  states: ['default', 'hover', 'active'],
  statesByLayout: {
    m: ['default', 'active'],
    t: ['default', 'active'],
  },
} satisfies ComponentSchemaV1;

export const SimpleButtonComponent = {
  element: SimpleButton,
  id: 'simple-button',
  name: 'Simple Button',
  category: 'dev',
  version: 1,
  defaultSize: {
    d: {
      width: 200,
      height: 100,
    },
    m: {
      width: 160,
      height: 80,
    },
  },
  schema,
  sourceCode: simpleButtonSourceRaw,
  assetsPaths: {
    content: [],
    parameters: [{ path: 'settings.icon', placeholderEnabled: true }],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'fontFamily' }],
  },
  fontRelations: {
    fontSettings: 'fontFamily',
  },
};
