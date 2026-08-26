import { Burger } from './Burger';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import burgerSourceRaw from './Burger.tsx?raw';

function createRangeControlLayoutProperty(title: string) {
  return {
    type: 'number' as const,
    scope: 'layout' as const,
    title,
    min: 0,
    max: 100,
    display: { type: 'range-control' as const },
  };
}

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
  textAlign: {
    type: 'string' as const,
    enum: ['left', 'center', 'right', 'justify'],
    display: { type: 'vertical-text-aligh-options' },
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
  'iconColor',
  'closeButtonColor',
  'linkColor',
  'menuBackgroundColor',
  'overlayColor',
] as const;

const schema = {
  type: 'object',
  version: 1,
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: false,
    },
    items: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          label: 'Label',
          placeholder: 'Add label...',
          display: { type: 'text-input' },
        },
        link: {
          type: 'string',
          label: 'Link',
          placeholder: 'Add link...',
          display: { type: 'text-input' },
        },
      },
    },
    default: [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' },
    ],
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b', 'c'],
      },
      iconColor: {
        type: 'string',
        scope: 'common',
        title: 'Icon',
        display: { type: 'palette-color-picker' },
      },
      iconSize: {
        type: 'number',
        scope: 'layout',
        title: 'Icon size',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      iconAnimation: {
        type: 'string',
        scope: 'layout',
        title: 'Icon animation',
        display: { type: 'toggle-cycle', enum: ['a'] },
      },
      linkColor: {
        type: 'string',
        scope: 'common',
        title: 'Link Default',
        titleByState: {
          default: 'Link Default',
          hover: 'Link Hover',
        },
        display: { type: 'palette-color-picker' },
      },
      menuBackgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'Menu BG',
        display: { type: 'palette-color-picker' },
      },
      overlayColor: {
        type: 'string',
        scope: 'common',
        title: 'Overlay',
        display: { type: 'palette-color-picker' },
      },
      closeButtonColor: {
        type: 'string',
        scope: 'common',
        title: 'Icon close',
        display: { type: 'palette-color-picker' },
      },
      effect: {
        type: 'string',
        scope: 'layout',
        title: 'Effect',
        display: { type: 'toggle-cycle', enum: ['fade', 'left', 'top', 'right', 'bottom'] },
      },
      menuWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Menu width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      textWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Text width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      direction: {
        type: 'string',
        scope: 'layout',
        title: 'Direction',
        display: { type: 'toggle-cycle', enum: ['left', 'top', 'right', 'bottom'] },
      },
      horizontalAlign: {
        type: 'string',
        scope: 'layout',
        title: 'Align',
        display: { type: 'toggle-cycle', enum: ['left', 'center', 'right'] },
      },
      verticalAlign: {
        type: 'string',
        scope: 'layout',
        title: 'Align',
        display: { type: 'toggle-cycle', enum: ['top', 'center', 'bottom'] },
      },
      textOrientation: {
        type: 'string',
        scope: 'layout',
        title: 'Text',
        display: { type: 'toggle-cycle', enum: ['vertical', 'horizontal'] },
      },
      stateOverrides: {
        type: 'object',
        scope: 'common',
      },
      gap: createRangeControlLayoutProperty('Gap'),
      textPaddingLeft: createRangeControlLayoutProperty('Text padding left'),
      textPaddingRight: createRangeControlLayoutProperty('Text padding right'),
      textPaddingTop: createRangeControlLayoutProperty('Text padding top'),
      textPaddingBottom: createRangeControlLayoutProperty('Text padding bottom'),
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
      textAlign: {
        ...textStyleProperties.textAlign,
        scope: 'layout',
        title: 'Align',
      },
      textAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      iconColor: '#000000',
      linkColor: '#000000',
      menuBackgroundColor: '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.45)',
      closeButtonColor: '#000000',
      effect: 'fade',
      iconAnimation: 'a',
      textOrientation: 'vertical',
      fontFamily: 'Arial',
      fontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      textAlign: 'left',
      stateOverrides: {
        hover: {
          linkColor: '#666666',
        },
      },
    },
    displayRules: [
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.menuWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.direction.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.horizontalAlign.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.verticalAlign.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.textWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.textPaddingLeft.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.textPaddingRight.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.textPaddingTop.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.textPaddingBottom.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'c', isNotEqual: true },
        then: { name: 'properties.textOrientation.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a', isNotEqual: true },
        then: { name: 'properties.effect.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.direction.display.enum', value: ['left', 'right'] },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.direction.display.enum', value: ['top', 'bottom'] },
      },
      {
        if: { name: 'direction', value: 'left' },
        then: { name: 'properties.horizontalAlign.display.visible', value: false },
      },
      {
        if: { name: 'direction', value: 'right' },
        then: { name: 'properties.horizontalAlign.display.visible', value: false },
      },
      {
        if: { name: 'direction', value: 'top' },
        then: { name: 'properties.verticalAlign.display.visible', value: false },
      },
      {
        if: { name: 'direction', value: 'bottom' },
        then: { name: 'properties.verticalAlign.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'left' },
          { name: 'verticalAlign', value: 'top', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingTop.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'right' },
          { name: 'verticalAlign', value: 'top', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingTop.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'left' },
          { name: 'verticalAlign', value: 'bottom', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingBottom.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'right' },
          { name: 'verticalAlign', value: 'bottom', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingBottom.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'top' },
          { name: 'horizontalAlign', value: 'left', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingLeft.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'bottom' },
          { name: 'horizontalAlign', value: 'left', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingLeft.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'top' },
          { name: 'horizontalAlign', value: 'right', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingRight.display.visible', value: false },
      },
      {
        if: [
          { name: 'direction', value: 'bottom' },
          { name: 'horizontalAlign', value: 'right', isNotEqual: true },
        ],
        then: { name: 'properties.textPaddingRight.display.visible', value: false },
      },
      {
        if: { name: 'direction', value: 'left' },
        then: { name: 'properties.textWidth.display.visible', value: false },
      },
      {
        if: { name: 'direction', value: 'right' },
        then: { name: 'properties.textWidth.display.visible', value: false },
      },
    ],
    layoutDefaults: {
      m: {
        type: 'b',
        direction: 'left',
        horizontalAlign: 'left',
        verticalAlign: 'top',
        iconSize: 24 / 375,
        menuWidth: 280 / 375,
        textWidth: 240 / 375,
        gap: 12 / 375,
        textPaddingLeft: 10 / 375,
        textPaddingRight: 10 / 375,
        textPaddingTop: 10 / 375,
        textPaddingBottom: 10 / 375,
        fontSize: 16 / 375,
        lineHeight: 20 / 375,
        letterSpacing: 0,
        wordSpacing: 0,
        textAppearance: {
          textTransform: 'none',
          textDecoration: 'none',
          fontVariant: 'normal',
        },
      },
      t: {
        type: 'b',
        direction: 'left',
        horizontalAlign: 'left',
        verticalAlign: 'top',
        iconSize: 24 / 768,
        menuWidth: 300 / 768,
        textWidth: 260 / 768,
        gap: 12 / 768,
        textPaddingLeft: 10 / 768,
        textPaddingRight: 10 / 768,
        textPaddingTop: 10 / 768,
        textPaddingBottom: 10 / 768,
        fontSize: 16 / 768,
        lineHeight: 20 / 768,
        letterSpacing: 0,
        wordSpacing: 0,
        textAppearance: {
          textTransform: 'none',
          textDecoration: 'none',
          fontVariant: 'normal',
        },
      },
      d: {
        type: 'b',
        direction: 'left',
        horizontalAlign: 'left',
        verticalAlign: 'top',
        iconSize: 24 / 1440,
        menuWidth: 320 / 1440,
        textWidth: 280 / 1440,
        gap: 12 / 1440,
        textPaddingLeft: 10 / 1440,
        textPaddingRight: 10 / 1440,
        textPaddingTop: 10 / 1440,
        textPaddingBottom: 10 / 1440,
        fontSize: 16 / 1440,
        lineHeight: 20 / 1440,
        letterSpacing: 0,
        wordSpacing: 0,
        textAppearance: {
          textTransform: 'none',
          textDecoration: 'none',
          fontVariant: 'normal',
        },
      },
    },
    layout: [
      '__componentName__',
      'type',
      'iconColor',
      'iconSize',
      'iconAnimation',
      'linkColor',
      'menuBackgroundColor',
      'overlayColor',
      'closeButtonColor',
      'effect',
      'menuWidth',
      'textWidth',
      'direction',
      'horizontalAlign',
      'verticalAlign',
      'textOrientation',
      'gap',
      'textPaddingLeft',
      'textPaddingRight',
      'textPaddingTop',
      'textPaddingBottom',
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
        { type: 'row', items: ['iconSize', 'iconAnimation'] },
        { type: 'row', items: ['menuWidth'] },
        { type: 'row', items: ['direction', 'horizontalAlign', 'verticalAlign'] },
        { type: 'row', items: ['textWidth', 'textOrientation'] },
        'effect',
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
        { type: 'row', items: ['fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'] },
        'textAlign',
        'textAppearance',
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['iconColor', 'closeButtonColor', 'linkColor', 'menuBackgroundColor', 'overlayColor'],
      hover: ['linkColor'],
    },
  },
  states: ['default', 'hover'],
} satisfies ComponentSchemaV1;

export const BurgerComponent = {
  element: Burger,
  id: 'burger',
  name: 'Burger',
  category: 'dev',
  version: 1,
  defaultSize: {
    d: {
      width: 24 / 1440,
      height: 24 / 1440,
    },
    t: {
      width: 24 / 768,
      height: 24 / 768,
    },
    m: {
      width: 24 / 375,
      height: 24 / 375,
    },
  },
  schema,
  sourceCode: burgerSourceRaw,
  assetsPaths: {
    content: [],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'fontFamily' }],
  },
  fontRelations: {
    fontSettings: 'fontFamily',
  },
};
