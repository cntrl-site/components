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
    display: { type: 'font-settings-weight', hideLabel: true, useTabDesign: true },
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
    display: { type: 'text-appearance', useTabDesign: true },
    properties: {
      textTransform: { type: 'string' as const, enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
      textDecoration: { type: 'string' as const, enum: ['none', 'underline'] },
      fontVariant: { type: 'string' as const, enum: ['normal', 'small-caps'] },
    },
  },
};

function prefixedTextStyleKey(prefix: 'open' | '', name: string) {
  if (!prefix) return name;
  return `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

function createBurgerTextStyleProperties(prefix: 'open' | '') {
  return {
    [prefixedTextStyleKey(prefix, 'fontFamily')]: {
      type: 'string' as const,
      scope: 'common' as const,
      title: '',
      display: { type: 'font-family-select' as const, hideLabel: true, useTabDesign: true },
    },
    [prefixedTextStyleKey(prefix, 'fontSettings')]: {
      ...textStyleProperties.fontSettings,
      scope: 'common' as const,
      title: '',
    },
    [prefixedTextStyleKey(prefix, 'fontSize')]: {
      ...textStyleProperties.fontSize,
      scope: 'layout' as const,
      title: '',
    },
    [prefixedTextStyleKey(prefix, 'lineHeight')]: {
      ...textStyleProperties.lineHeight,
      scope: 'layout' as const,
      title: '',
    },
    [prefixedTextStyleKey(prefix, 'letterSpacing')]: {
      ...textStyleProperties.letterSpacing,
      scope: 'layout' as const,
      title: '',
    },
    [prefixedTextStyleKey(prefix, 'wordSpacing')]: {
      ...textStyleProperties.wordSpacing,
      scope: 'layout' as const,
      title: '',
    },
    [prefixedTextStyleKey(prefix, 'textAlign')]: {
      ...textStyleProperties.textAlign,
      scope: 'layout' as const,
      title: '',
    },
    [prefixedTextStyleKey(prefix, 'textAppearance')]: {
      ...textStyleProperties.textAppearance,
      scope: 'layout' as const,
      title: '',
    },
  };
}

const closedTextStyleProperties = createBurgerTextStyleProperties('');
const openTextStyleProperties = createBurgerTextStyleProperties('open');

const burgerTextStylePanelTab = {
  type: 'tab' as const,
  id: 'burgerTextStyle',
  tabs: {
    Closed: [
      'fontFamily',
      'fontSettings',
      { type: 'row' as const, items: ['fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'] },
      'textAlign',
      'textAppearance',
    ],
    Open: [
      'openFontFamily',
      'openFontSettings',
      { type: 'row' as const, items: ['openFontSize', 'openLineHeight', 'openLetterSpacing', 'openWordSpacing'] },
      'openTextAlign',
      'openTextAppearance',
    ],
  },
};

const defaultTextAppearance = {
  textTransform: 'none',
  textDecoration: 'none',
  fontVariant: 'normal',
};

const defaultFontSettings = {
  fontWeight: 400,
  fontStyle: 'normal',
};

const POSITION_VALUES = [
  'left-top',
  'center-top',
  'right-top',
  'left-center',
  'center-center',
  'right-center',
  'left-bottom',
  'center-bottom',
  'right-bottom',
] as const;

const paletteBookmarkItems = [
  'iconColor',
  'closeButtonColor',
  'linkColor',
  'socialIconColor',
  'menuBackgroundColor',
  'overlayColor',
  'panelColor',
] as const;

// Non-color parameters that a navigation state may override. Colors keep using
// `stateOverrides`, so they are intentionally absent here.
const navigationStateProperties = [
  'panelHeight',
  'logoMaxWidth',
  'iconSize',
  'navGap',
  'navPaddingRight',
  'navTextWidth',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textAppearance',
] as const;

const schema = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b', 'c'],
      },
      link: {
        type: 'array',
        scope: 'common',
        display: { type: 'page-url-link' },
        items: {
          type: 'object',
          properties: {
            mode: { type: 'string', enum: ['page', 'url'] },
            page: { type: 'string' },
            url: { type: 'string', message: 'Paste URL here...' },
            label: { type: 'string' },
            anchor: { type: 'string' },
            openIn: { type: 'string' },
            showIn: { type: 'string', enum: ['always', 'open only'] },
          },
        },
      },
      socialLink: {
        type: 'array',
        scope: 'common',
        display: { type: 'url-list' },
        items: {
          type: 'string',
          message: 'Paste URL here...',
        },
      },
      logo: {
        type: 'object',
        scope: 'common',
        title: 'Logo',
        display: { type: 'button-icon-switch' },
        properties: {
          mode: {
            type: 'string',
            enum: ['On', 'Off'],
          },
          icon: {
            type: ['string', 'null'] as const,
            title: 'Logo',
            display: { type: 'settings-image-input' },
          },
        },
      },
      logoMaxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Logo Max Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      panelHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      panelColor: {
        type: 'string',
        scope: 'common',
        title: 'Panel',
        display: { type: 'palette-color-picker' },
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
          onScroll: 'Link Scroll',
        },
        display: { type: 'palette-color-picker' },
      },
      socialIconColor: {
        type: 'string',
        scope: 'common',
        title: 'Social Default',
        titleByState: {
          default: 'Social Default',
          hover: 'Social Hover',
          onScroll: 'Social Scroll',
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
        title: 'Open text width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      navTextWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Closed text width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      position: {
        type: 'string',
        scope: 'layout',
        title: 'Position',
        display: { type: 'toggle-cycle', enum: [...POSITION_VALUES] },
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
      navigationStateOverrides: {
        type: 'object',
        scope: 'layout',
      },
      gap: createRangeControlLayoutProperty('Gap'),
      navGap: {
        type: 'number' as const,
        scope: 'layout' as const,
        title: 'Nav gap',
        min: 0,
        max: 100,
        display: { type: 'range-control' as const, visible: false },
      },
      navPaddingRight: {
        type: 'number' as const,
        scope: 'layout' as const,
        title: 'Nav padding right',
        min: 0,
        max: 100,
        display: { type: 'range-control' as const, visible: false },
      },
      textPaddingLeft: createRangeControlLayoutProperty('Text padding left'),
      textPaddingRight: createRangeControlLayoutProperty('Text padding right'),
      textPaddingTop: createRangeControlLayoutProperty('Text padding top'),
      textPaddingBottom: createRangeControlLayoutProperty('Text padding bottom'),
      ...closedTextStyleProperties,
      ...openTextStyleProperties,
    },
    defaults: {
      link: [
        { mode: 'page', page: '', url: '', label: 'Home', anchor: '', openIn: 'Same Tab' },
        { mode: 'page', page: '', url: '', label: 'Works', anchor: '', openIn: 'Same Tab' },
        { mode: 'page', page: '', url: '', label: 'About', anchor: '', openIn: 'Same Tab' },
        { mode: 'page', page: '', url: '', label: 'Contact', anchor: '', openIn: 'Same Tab' },
      ],
      socialLink: ['', '', '', ''],
      logo: {
        mode: 'On',
        icon: null,
      },
      panelColor: '#ffffff',
      iconColor: '#000000',
      linkColor: '#000000',
      socialIconColor: '#000000',
      menuBackgroundColor: '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.45)',
      closeButtonColor: '#000000',
      effect: 'fade',
      iconAnimation: 'a',
      position: 'left-top',
      textOrientation: 'vertical',
      fontFamily: 'Goudy Bookletter 1911',
      fontSettings: defaultFontSettings,
      textAlign: 'left',
      openFontFamily: 'Goudy Bookletter 1911',
      openFontSettings: defaultFontSettings,
      openTextAlign: 'left',
      stateOverrides: {
        hover: {
          linkColor: '#666666',
          socialIconColor: '#666666',
        },
      },
    },
    displayRules: [
      {
        if: { name: 'logo.mode', value: 'Off' },
        then: { name: 'properties.logoMaxWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a' },
        then: { name: 'properties.menuWidth.display.visible', value: false },
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
        if: { name: 'type', value: 'c', isNotEqual: true },
        then: { name: 'properties.textOrientation.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.textOrientation.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'a', isNotEqual: true },
        then: { name: 'properties.effect.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.horizontalAlign.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'b' },
        then: { name: 'properties.verticalAlign.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.verticalAlign.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'c' },
        then: { name: 'properties.horizontalAlign.display.visible', value: false },
      },
    ],
    layoutDefaults: {
      m: {
        type: 'b',
        position: 'left-top',
        panelHeight: 56 / 375,
        logoMaxWidth: 80 / 375,
        iconSize: 16 / 375,
        menuWidth: 280 / 375,
        textWidth: 240 / 375,
        navTextWidth: 120 / 375,
        gap: 24 / 375,
        navGap: 24 / 375,
        navPaddingRight: 10 / 375,
        textPaddingLeft: 10 / 375,
        textPaddingRight: 10 / 375,
        textPaddingTop: 10 / 375,
        textPaddingBottom: 10 / 375,
        fontSize: 16 / 375,
        lineHeight: 20 / 375,
        letterSpacing: 0,
        wordSpacing: 0,
        textAppearance: defaultTextAppearance,
        openFontSize: 16 / 375,
        openLineHeight: 20 / 375,
        openLetterSpacing: 0,
        openWordSpacing: 0,
        openTextAppearance: defaultTextAppearance,
      },
      t: {
        type: 'b',
        position: 'left-top',
        panelHeight: 60 / 768,
        logoMaxWidth: 100 / 768,
        iconSize: 16 / 768,
        menuWidth: 300 / 768,
        textWidth: 260 / 768,
        navTextWidth: 140 / 768,
        gap: 32 / 768,
        navGap: 32 / 768,
        navPaddingRight: 10 / 768,
        textPaddingLeft: 10 / 768,
        textPaddingRight: 10 / 768,
        textPaddingTop: 10 / 768,
        textPaddingBottom: 10 / 768,
        fontSize: 16 / 768,
        lineHeight: 20 / 768,
        letterSpacing: 0,
        wordSpacing: 0,
        textAppearance: defaultTextAppearance,
        openFontSize: 16 / 768,
        openLineHeight: 20 / 768,
        openLetterSpacing: 0,
        openWordSpacing: 0,
        openTextAppearance: defaultTextAppearance,
      },
      d: {
        type: 'b',
        position: 'left-top',
        panelHeight: 40 / 1440,
        logoMaxWidth: 120 / 1440,
        iconSize: 16 / 1440,
        menuWidth: 320 / 1440,
        textWidth: 60 / 1440,
        navTextWidth: 60 / 1440,
        gap: 12 / 1440,
        navGap: 12 / 1440,
        navPaddingRight: 10 / 1440,
        textPaddingLeft: 10 / 1440,
        textPaddingRight: 10 / 1440,
        textPaddingTop: 10 / 1440,
        textPaddingBottom: 10 / 1440,
        fontSize: 16 / 1440,
        lineHeight: 16 / 1440,
        letterSpacing: 0,
        wordSpacing: 0,
        textAppearance: defaultTextAppearance,
        textAlign: 'center',
        openFontSize: 16 / 1440,
        openLineHeight: 16 / 1440,
        openLetterSpacing: 0,
        openWordSpacing: 0,
        openTextAppearance: defaultTextAppearance,
        openTextAlign: 'center',
      },
    },
    layout: [
      '__componentName__',
      'type',
      'link',
      'socialLink',
      'logo',
      'logoMaxWidth',
      'panelHeight',
      'panelColor',
      'iconColor',
      'iconSize',
      'iconAnimation',
      'linkColor',
      'socialIconColor',
      'menuBackgroundColor',
      'overlayColor',
      'closeButtonColor',
      'effect',
      'menuWidth',
      'textWidth',
      'navTextWidth',
      'position',
      'horizontalAlign',
      'verticalAlign',
      'textOrientation',
      'gap',
      'navGap',
      'navPaddingRight',
      'textPaddingLeft',
      'textPaddingRight',
      'textPaddingTop',
      'textPaddingBottom',
      'fontFamily',
      'fontSettings',
      'fontSize',
      'lineHeight',
      'letterSpacing',
      'wordSpacing',
      'textAlign',
      'textAppearance',
      'openFontFamily',
      'openFontSettings',
      'openFontSize',
      'openLineHeight',
      'openLetterSpacing',
      'openWordSpacing',
      'openTextAlign',
      'openTextAppearance',
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
        'logo',
        { type: 'row', items: ['logoMaxWidth', 'panelHeight'] },
        { type: 'row', items: ['iconSize', 'iconAnimation'] },
        { type: 'row', items: ['menuWidth'] },
        'position',
        { type: 'row', items: ['textWidth', 'navTextWidth'] },
        'effect',
      ],
    },
    {
      id: 'links',
      icon: 'settings',
      title: 'Links',
      tooltip: 'Links Settings',
      layout: [
        '__componentName__',
        'link',
      ],
    },
    {
      id: 'links',
      icon: 'settings',
      title: 'Links',
      tooltip: 'Links Settings',
      layout: [
        '__componentName__',
        'socialLink',
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        burgerTextStylePanelTab,
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['iconColor', 'closeButtonColor', 'linkColor', 'socialIconColor', 'menuBackgroundColor', 'overlayColor', 'panelColor'],
      hover: ['linkColor', 'socialIconColor'],
      onScroll: ['iconColor', 'closeButtonColor', 'linkColor', 'socialIconColor', 'menuBackgroundColor', 'overlayColor', 'panelColor'],
    },
  },
  states: ['default', 'hover'],
  navigationStates: ['default', 'onScroll'],
  navigationStateProperties: [...navigationStateProperties],
} satisfies ComponentSchemaV1;

export const BurgerComponent = {
  element: Burger,
  id: 'burger',
  name: 'Burger',
  category: 'dev',
  version: 1,
  layoutMode: 'navigation' as const,
  defaultSize: {
    d: {
      width: '100%',
      height: 60 / 1440,
    },
    t: {
      width: '100%',
      height: 60 / 768,
    },
    m: {
      width: '100%',
      height: 56 / 375,
    },
  },
  schema,
  sourceCode: burgerSourceRaw,
  assetsPaths: {
    content: [],
    parameters: [{ path: 'logo.icon' }],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'fontFamily' }, { path: 'openFontFamily' }],
  },
  fontRelations: {
    fontSettings: 'fontFamily',
    openFontSettings: 'openFontFamily',
  },
};
