import { Pretext, SHAPE_IDS, settingsForEditablePreset } from './Pretext';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import pretextSourceRaw from './Pretext.tsx?raw';

const SHAPE_OPTIONS = [...SHAPE_IDS];

const textStyleProperties = {
  fontSettings: {
    type: 'object' as const,
    display: { type: 'font-settings-weight' },
    properties: {
      fontWeight: { type: 'number' as const },
      fontStyle: { type: 'string' as const },
    },
  },
};

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'manual',
    properties: {
      shape: {
        type: 'string',
        scope: 'layout',
        title: 'Shape',
        display: {
          type: 'drop-down',
          label: 'Shape',
          enum: SHAPE_OPTIONS,
        },
        enum: SHAPE_OPTIONS,
      },
      customPath: {
        type: 'string',
        scope: 'layout',
        title: 'Path',
        tooltip: 'SVG path (M…) or a point list (0,0 100,0 50,100). Used when Shape is set to custom.',
        display: { type: 'full-width-input', placeholder: 'M0,0 C…' },
      },
      pathSnap: {
        type: 'number',
        scope: 'common',
        title: 'Snap',
        tooltip: 'Grid the points snap to while dragging, in path units (the path box is 100 x 100). 0 is off.',
        min: 0,
        max: 25,
        step: 0.5,
        display: { type: 'numeric-input' },
      },
      pathFit: {
        type: 'string',
        scope: 'common',
        title: 'Path fit',
        tooltip: 'Stretch — the drawing fills the box. Viewbox — the drawing keeps its position in path coordinates (0–100).',
        display: { type: 'toggle-cycle', enum: ['stretch', 'viewbox'] },
      },
      shapeMode: {
        type: 'string',
        scope: 'common',
        title: '',
        tooltip: 'A — text fills the path. B — text flows around the path.',
        display: { type: 'radio-group' },
        enum: ['A', 'B'],
      },
      fitText: {
        type: 'string',
        scope: 'common',
        title: 'Fit text',
        tooltip: 'Scales the type down until all text fits the path.',
        display: { type: 'toggle-cycle', enum: ['off', 'on'] },
      },
      dropCap: {
        type: 'string',
        scope: 'common',
        title: 'Drop cap',
        display: { type: 'toggle-cycle', enum: ['off', 'on'] },
      },
      dropCapLines: {
        type: 'number',
        scope: 'common',
        title: 'Drop cap lines',
        min: 2,
        max: 8,
        step: 1,
        display: { type: 'numeric-input' },
      },
      dropCapSize: {
        type: 'number',
        scope: 'common',
        title: 'Drop cap size',
        tooltip: 'Height of the drop cap, in lines of body text.',
        min: 1,
        max: 8,
        step: 0.5,
        display: { type: 'common-numeric-input' },
      },
      image: {
        type: ['string', 'null'] as const,
        scope: 'common',
        title: '',
        display: { type: 'settings-image-input' },
      },
      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'Background',
        display: { type: 'settings-color-picker' },
      },
      textFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font Family',
        display: { type: 'font-family-select' },
      },
      textFontSettings: {
        ...textStyleProperties.fontSettings,
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
      textAlign: {
        type: 'string',
        scope: 'layout',
        title: '',
        enum: ['left', 'center', 'right', 'justify'],
        display: { type: 'vertical-text-aligh-options' },
      },
      textTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Text Appearance',
        display: { type: 'text-appearance' },
        properties: {
          textTransform: { type: 'string', enum: ['none', 'uppercase', 'lowercase', 'capitalize'] },
          textDecoration: { type: 'string', enum: ['none', 'underline'] },
          fontVariant: { type: 'string', enum: ['normal', 'small-caps'] },
        },
      },
      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Default',
        display: { type: 'style-panel-color-picker' },
      },
      linkColor: {
        type: 'string',
        scope: 'common',
        title: 'Link',
        display: { type: 'style-panel-color-picker' },
      },
    },
    defaults: {
      ...settingsForEditablePreset('diamond'),
      pathSnap: 0,
      shapeMode: 'A',
      fitText: 'off',
      dropCap: 'off',
      dropCapLines: 3,
      dropCapSize: 3,
      image: null,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      textFontFamily: 'Goudy Bookletter 1911',
      textFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      textAlign: 'center',
      textTextAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
      textColor: '#000000',
      linkColor: '#000000',
    },
    layoutDefaults: {
      m: {
        textFontSize: 0.037,
        textLineHeight: 0.048,
        textLetterSpacing: 0,
        textWordSpacing: 0,
      },
      t: {
        textFontSize: 0.018,
        textLineHeight: 0.024,
        textLetterSpacing: 0,
        textWordSpacing: 0,
      },
      d: {
        textFontSize: 0.011,
        textLineHeight: 0.0155,
        textLetterSpacing: 0,
        textWordSpacing: 0,
      },
    },
    layout: [
      '__componentName__',
      'shape',
      'customPath',
      'pathSnap',
      'pathFit',
      'shapeMode',
      'fitText',
      'dropCap',
      'dropCapLines',
      'dropCapSize',
      'image',
    ],
    displayRules: [
      {
        if: { name: 'shapeMode', value: 'B', isNotEqual: true },
        then: { name: 'properties.image.display.visible', value: false },
      },
      {
        if: { name: 'dropCap', value: 'on', isNotEqual: true },
        then: { name: 'properties.dropCapSize.display.visible', value: false },
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
        { type: 'row', items: ['__componentName__'] },
        { type: 'row', items: ['shapeMode'] },
        { type: 'row', items: ['shape'] },
        { type: 'row', items: ['image', 'dropCap'] },
        { type: 'row', items: ['dropCapSize'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        '__componentName__',
        {
          type: 'group',
          title: '',
          items: [
            'textFontFamily',
            'textFontSettings',
            {
              type: 'row',
              items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing'],
            },
            'textAlign',
            'textTextAppearance',
          ],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: ['textColor', 'linkColor', 'backgroundColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemWithoutImage: true,
      addItemFromFileExplorer: false,
    },
    display: {
      type: 'array',
    },
    items: {
      type: 'object',
      properties: {
        text: {
          label: 'Text',
          placeholder: 'Add Text...',
          display: {
            type: 'rich-text',
          },
        },
      },
    },
    default: [
      {
        text: [
          {
            type: 'paragraph',
            children: [
              { text: 'Style is viewed by many as a shallow obsession with disembodied surfaces. However our activities as designers are based on style’s function as a cultural communicator. A vocabulary or set of formal characteristics constitutes a particular style, recognized most frequently in retrospect. Style itself is the visual language of a culture: in fashion, in consumer goods, in art, in literature, in all media. Style is ephemeral; it is timely. To be in style is to embody the influences and values of your time.' },
            ],
          },
        ],
      },
    ],
  },
};

export const PretextComponent = {
  element: Pretext,
  id: 'pretext',
  name: 'Shaped Type',
  category: 'typography',
  version: 1,
  normalizeLayoutSettingsUpdate: (nextSettings: Record<string, any>, prevSettings: Record<string, any>) => {
    const shape = nextSettings.shape;
    if (typeof shape !== 'string' || shape === 'custom' || (SHAPE_IDS as readonly string[]).indexOf(shape) === -1) {
      return nextSettings;
    }
    return {
      ...nextSettings,
      ...settingsForEditablePreset(shape as typeof SHAPE_IDS[number], 1, prevSettings),
    };
  },
  defaultSize: {
    d: {
      width: 380,
      height: 382,
    },
    t: {
      width: 380,
      height: 382,
    },
    m: {
      width: 334,
      height: 336,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/pretext.png',
  },
  schema,
  sourceCode: pretextSourceRaw,
  assetsPaths: {
    content: [],
    parameters: [{ path: 'image', placeholderEnabled: true }],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'textFontFamily' }],
  },
  fontRelations: {
    textFontSettings: 'textFontFamily',
  },
};
