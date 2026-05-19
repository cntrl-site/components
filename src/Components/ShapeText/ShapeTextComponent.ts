import { ShapeText } from './ShapeText';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import shapeTextSourceRaw from './ShapeText.tsx?raw';

const defaultSampleText = `Paste your text here. By default, it fills out the entire rectangle. \
Enter the component (double-click) and click anywhere on the canvas to add anchor points. \
Click the first point to close the shape — text will then flow only inside it. \
Select a point and press Del to remove it, or drag any point to reposition it.`;

const schema = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'manual',
    properties: {
      text: {
        type: 'string',
        scope: 'common',
        title: 'Text',
        message: 'Paste your text…',
        display: { type: 'text-input' },
      },
      points: {
        type: 'array',
        scope: 'common',
        display: { type: 'text-input', visible: false },
        items: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
          },
        },
      },
      shapeClosed: {
        type: 'boolean',
        scope: 'common',
        display: { type: 'switch-toggle', visible: false },
      },
      fontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      fontSettings: {
        type: 'object',
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight', visible: true },
        properties: {
          fontWeight: { type: 'number' },
          fontStyle: { type: 'string' },
        },
      },
      fontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Font Size',
        display: { type: 'font-size' },
      },
      lineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Line Height',
        display: { type: 'line-height-input' },
      },
      letterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      wordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      textAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text Appearance',
        display: { type: 'text-appearance' },
      },
      color: {
        type: 'string',
        scope: 'common',
        title: 'Text Color',
        display: { type: 'palette-color-picker' },
      },
      bgColor: {
        type: 'string',
        scope: 'common',
        title: 'Background',
        display: { type: 'palette-color-picker' },
      },
    },
    defaults: {
      text: defaultSampleText,
      points: [],
      shapeClosed: false,
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
      color: '#000000',
      bgColor: 'rgba(0, 0, 0, 0)',
    },
    layoutDefaults: {
      m: {
        fontSize: 0.04,
        lineHeight: 0.048,
      },
      d: {
        fontSize: 0.012,
        lineHeight: 0.015,
      },
    },
  },
  panels: [
    {
      id: 'general',
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        '__componentName__',
        'text',
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
          items: [
            'fontSettings',
            { type: 'row', items: ['fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing'] },
            'textAppearance',
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: ['color', 'bgColor'],
    panelIds: ['general', 'typeStyle'],
  },
} satisfies ComponentSchemaV1;

export const ShapeTextComponent = {
  element: ShapeText,
  id: 'shape-text',
  name: 'Shape Text',
  category: 'text',
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/onelinerImg.jpg',
  },
  defaultSize: {
    width: 480,
    height: 360,
  },
  schema,
  sourceCode: shapeTextSourceRaw,
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'settings.fontSettings' }],
  },
};
