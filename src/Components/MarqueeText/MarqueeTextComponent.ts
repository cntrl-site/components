import { MarqueeText } from './MarqueeText';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import marqueeTextSourceRaw from './MarqueeText.tsx?raw';

const marqueeTextFontStyleProperties = {
  fontSettings: {
    type: 'object' as const,
    scope: 'common' as const,
    display: { type: 'font-settings-weight' },
    properties: {
      fontWeight: { type: 'number' as const, scope: 'common' as const },
      fontStyle: { type: 'string' as const, scope: 'common' as const },
    },
  },
};

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      speed: {
        type: 'number',
        scope: 'layout',
        title: 'Speed',
        display: { type: 'speed-control' },
        min: 0,
        max: 7,
      },
      direction: {
        type: 'string',
        scope: 'common',
        title: 'Direction',
        display: { type: 'direction-control' },
        enum: ['left', 'right'],
      },
      pauseOnHover: {
        title: 'Pause on hover',
        type: 'string',
        scope: 'common',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      gap: {
        type: 'number',
        scope: 'layout',
        title: 'Gap',
        min: 0,
        display: { type: 'numeric-input' },
      },
      ribbonWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Ribbon Width',
        min: 0,
        display: { type: 'numeric-input' },
      },
      layoutType: {
        type: 'string',
        scope: 'common',
        title: 'Path Type',
        display: { type: 'toggle-cycle', enum: ['straight', 'curve'] },
      },
      curveAmplitude: {
        type: 'number',
        scope: 'layout',
        title: 'Amplitude',
        min: 0,
        max: 30,
        step: 1,
        display: { type: 'common-numeric-input', visible: false },
      },
      curveFrequency: {
        type: 'number',
        scope: 'layout',
        title: 'Frequency',
        min: 0,
        max: 100,
        step: 1,
        display: { type: 'common-numeric-input', visible: false },
      },
      textFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font Family',
        display: { type: 'font-family-select' },
      },
      textFontSettings: {
        ...marqueeTextFontStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      textFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Font Size',
        display: { type: 'font-size' },
      },
      textLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Line Height',
        display: { type: 'line-height-input' },
      },
      textLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      textWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      textTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text Appearance',
        display: { type: 'text-appearance' },
      },
      textColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Text Color',
      },
      backgroundColor: {
        display: { type: 'style-panel-color-picker' },
        type: 'string',
        scope: 'common',
        title: 'Ribbon Color',
      },
    },
    defaults: {
      direction: 'left',
      pauseOnHover: 'off',
      layoutType: 'straight',
      textFontFamily: 'Goudy Bookletter 1911',
      textFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      textLetterSpacing: 0,
      textWordSpacing: 0,
      textTextAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
      textColor: '#000000',
      backgroundColor: '#FFFFFF00',
    },
    layoutDefaults: {
      m: {
        speed: 0.55,
        gap: 0.04,
        ribbonWidth: 0.08,
        curveAmplitude: 6,
        curveFrequency: 15,
        textFontSize: 0.08,
        textLineHeight: 0.08,
      },
      t: {
        speed: 1.64,
        gap: 0.02,
        ribbonWidth: 0.05,
        curveAmplitude: 5,
        curveFrequency: 15,
        textFontSize: 0.05,
        textLineHeight: 0.05,
      },
      d: {
        speed: 1.64,
        gap: 0.02,
        ribbonWidth: 0.035,
        curveAmplitude: 5,
        curveFrequency: 15,
        textFontSize: 0.035,
        textLineHeight: 0.035,
      },
    },
    displayRules: [
      {
        if: { name: 'layoutType', value: 'curve' },
        then: { name: 'properties.curveAmplitude.display.visible', value: true },
      },
      {
        if: { name: 'layoutType', value: 'curve' },
        then: { name: 'properties.curveFrequency.display.visible', value: true },
      },
    ],
    layout: [
      '__componentName__',
      'speed',
      'direction',
      'pauseOnHover',
      'gap',
      'ribbonWidth',
      'layoutType',
      'curveAmplitude',
      'curveFrequency',
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__'] },
        { type: 'row', items: ['direction', 'speed'] },
        { type: 'row', items: ['ribbonWidth', 'gap'] },
        { type: 'row', items: ['pauseOnHover', 'layoutType'] },
        { type: 'row', items: ['curveAmplitude', 'curveFrequency'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        'textFontFamily',
        'textFontSettings',
        { type: 'row', items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing'] },
        'textTextAppearance',
      ],
    },
  ],
  paletteBookmark: {
    items: ['textColor', 'backgroundColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: false,
    },
    items: {
      type: 'object',
      properties: {
        text: {
          placeholder: 'Add text...',
          label: 'Text',
          display: {
            type: 'text-input',
          },
        },
        image: {
          type: 'object',
          label: 'Image',
          display: {
            type: 'media-input',
          },
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
      { 
        text: 'NEW COLLECTION',
        image: { 
          url: 'https://cdn.cntrl.site/component-assets/Component-default-1.jpg',
          name: '',
        },
        link: '',
      },
      { 
        text: 'SHOP NOW',
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-2.jpg',
          name: '',
        },
        link: '',
      },
      { 
        text: 'LIMITED EDITION',
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-3.jpg',
          name: '',
        },
        link: '',
      },
      { 
        text: 'EXPLORE MORE',
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-4.jpg',
          name: '',
        },
        link: '',
      },
    ],
  },
};

export const MarqueeTextComponent = {
  element: MarqueeText,
  id: 'marquee-text',
  name: 'Marquee Text',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: '100%',
    },
    t: {
      width: '100%',
    },
    m: {
      width: '100%',
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Simple-Marquee.mp4',
  },
  schema,
  sourceCode: marqueeTextSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'textFontFamily' }],
  },
  fontRelations: {
    textFontSettings: 'textFontFamily',
  },
};
