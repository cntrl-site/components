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
        display: {
          type: 'shape-select',
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
      dropCapLines: {
        type: 'number',
        scope: 'common',
        title: 'Drop cap lines',
        min: 1,
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
      ...settingsForEditablePreset('circle'),
      pathSnap: 0,
      shapeMode: 'A',
      fitText: 'off',
      dropCapLines: 1,
      dropCapSize: 1,
      image: 'https://cdn.cntrl.site/component-assets/shapedType_img.jpg',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      textFontFamily: 'Basteleur',
      textFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      textAlign: 'center',
      textTextAppearance: { textTransform: 'uppercase', textDecoration: 'none', fontVariant: 'normal' },
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
        textFontSize: 0.032,
        textLineHeight: 0.0155,
        textLetterSpacing: -0.001,
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
      'dropCapLines',
      'dropCapSize',
      'image',
    ],
    displayRules: [
      {
        if: { name: 'shapeMode', value: 'B', isNotEqual: true },
        then: { name: 'properties.image.display.visible', value: false },
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
        { type: 'row', title: 'Shape', items: ['shape'] },
        { type: 'row', items: ['dropCapSize', 'image'] },
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
              { text: "Le loro superficie, excelso Duca, fra loro similmente possiamo dire al medesimo modo esser proportionali commo de lor massa corporea s'è dicto, cioè irrationali per la malitia de la figura pentagona che in lo duodecedron se interpone. Ma de l'altre possano a le volte essere rationali, commo quelle del tetracedron, cubo, octocedron, per essere triangole e quadrate e note in proportione con lo diametro de la loro sphera in la quale si formano, commo s'è veduto di sopra." },
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
  normalizeLayoutSettingsUpdate: (nextSettings: Record<string, any>, _prevSettings: Record<string, any>) => {
    const shape = nextSettings.shape;
    if (typeof shape !== 'string' || shape === 'custom' || (SHAPE_IDS as readonly string[]).indexOf(shape) === -1) {
      return nextSettings;
    }
    return {
      ...nextSettings,
      ...settingsForEditablePreset(shape as typeof SHAPE_IDS[number]),
    };
  },
  defaultSize: {
    d: {
      width: 1420,
      height: 640,
    },
    t: {
      width: 710,
      height: 320,
    },
    m: {
      width: 355,
      height: 160,
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
