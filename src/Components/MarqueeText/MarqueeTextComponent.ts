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
      layoutType: {
        type: 'string',
        scope: 'common',
        title: 'Path Type',
        display: { type: 'toggle-cycle', enum: ['angle', 'curve'] },
      },
      curveAmplitude: {
        type: 'number',
        scope: 'layout',
        title: 'Amplitude',
        min: 0,
        max: 0.3,
        step: 0.01,
        display: { type: 'common-numeric-input', visible: false },
      },
      curveFrequency: {
        type: 'number',
        scope: 'layout',
        title: 'Frequency',
        min: 0,
        max: 8,
        step: 0.1,
        display: { type: 'common-numeric-input', visible: false },
      },
      angle: {
        type: 'number',
        scope: 'layout',
        title: 'Angle',
        min: -45,
        max: 45,
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
        title: 'Background Color',
      },
    },
    defaults: {
      direction: 'left',
      pauseOnHover: 'off',
      layoutType: 'angle',
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
        curveAmplitude: 0.06,
        curveFrequency: 1.5,
        angle: 0,
        textFontSize: 0.08,
        textLineHeight: 0.08,
      },
      t: {
        speed: 1.64,
        gap: 0.02,
        curveAmplitude: 0.05,
        curveFrequency: 1.5,
        angle: 0,
        textFontSize: 0.05,
        textLineHeight: 0.05,
      },
      d: {
        speed: 1.64,
        gap: 0.02,
        curveAmplitude: 0.05,
        curveFrequency: 1.5,
        angle: 0,
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
      {
        if: { name: 'layoutType', value: 'angle' },
        then: { name: 'properties.angle.display.visible', value: true },
      },
    ],
    layout: [
      '__componentName__',
      'speed',
      'direction',
      'pauseOnHover',
      'gap',
      'layoutType',
      'curveAmplitude',
      'curveFrequency',
      'angle',
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
        { type: 'row', items: ['gap', 'pauseOnHover'] },
        { type: 'row', items: ['layoutType'] },
        { type: 'row', items: ['curveAmplitude', 'curveFrequency'] },
        { type: 'row', items: ['angle'] },
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
          label: 'URL',
          placeholder: 'Enter link...',
          display: {
            type: 'text-input',
          },
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
      },
      { 
        text: 'SHOP NOW',
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-2.jpg',
          name: '',
        },
      },
      { 
        text: 'LIMITED EDITION',
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-3.jpg',
          name: '',
        },
      },
      { 
        text: 'EXPLORE MORE',
        image: {
          url: 'https://cdn.cntrl.site/component-assets/Component-default-4.jpg',
          name: '',
        },
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
