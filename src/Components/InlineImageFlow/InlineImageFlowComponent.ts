import { InlineImageFlow } from './InlineImageFlow';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import inlineImageFlowSourceRaw from './InlineImageFlow.tsx?raw';

const fontSettingsProperty = {
  type: 'object' as const,
  scope: 'common' as const,
  display: { type: 'font-settings-weight' },
  properties: {
    fontWeight: { type: 'number' as const, scope: 'common' as const },
    fontStyle: { type: 'string' as const, scope: 'common' as const },
  },
};

const richText = (text: string) => [
  {
    type: 'paragraph',
    children: [{ text }],
  },
];

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      fontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      fontSettings: {
        ...fontSettingsProperty,
        title: '',
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
      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Text',
        display: { type: 'palette-color-picker' },
      },
      linkColor: {
        type: 'string',
        scope: 'common',
        title: 'Link',
        display: { type: 'palette-color-picker' },
      },
      linkHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Link hover',
        display: { type: 'palette-color-picker' },
      },
      imageWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        min: 0,
        max: 220,
        display: { type: 'range-control' },
      },
      imageHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Height',
        min: 0,
        max: 220,
        display: { type: 'range-control' },
      },
      imageFit: {
        type: 'string',
        scope: 'common',
        title: 'Fit',
        enum: ['cover', 'contain'],
        display: { type: 'radio-group' },
      },
      imageAlign: {
        type: 'string',
        scope: 'common',
        title: 'Align',
        enum: ['baseline', 'middle', 'top', 'bottom'],
        display: { type: 'radio-group' },
      },
      textImageGap: {
        type: 'number',
        scope: 'layout',
        title: 'Text gap',
        min: 0,
        max: 80,
        display: { type: 'range-control' },
      },
      entryGap: {
        type: 'number',
        scope: 'layout',
        title: 'Entry gap',
        min: 0,
        max: 120,
        display: { type: 'range-control' },
      },
      imageRadius: {
        type: 'number',
        scope: 'layout',
        title: 'Corners',
        min: 0,
        max: 120,
        display: { type: 'range-control' },
      },
      imageOpacity: {
        type: 'number',
        scope: 'common',
        title: 'Opacity',
        min: 0,
        max: 100,
        display: { type: 'number' },
      },
      hoverScale: {
        type: 'number',
        scope: 'common',
        title: 'Hover scale',
        min: 100,
        max: 400,
        display: { type: 'number' },
      },
      hoverOpacity: {
        type: 'number',
        scope: 'common',
        title: 'Hover opacity',
        min: 0,
        max: 100,
        display: { type: 'number' },
      },
      transitionDuration: {
        type: 'number',
        scope: 'common',
        title: 'Transition ms',
        min: 0,
        max: 2000,
        display: { type: 'number' },
      },
      clickAction: {
        type: 'string',
        scope: 'common',
        title: 'Click',
        enum: ['none', 'same tab', 'new tab'],
        display: { type: 'radio-group' },
      },
    },
    defaults: {
      fontFamily: 'Goudy Bookletter 1911',
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
      textColor: '#000000',
      linkColor: '#000000',
      linkHoverColor: '#7a7a7a',
      imageFit: 'cover',
      imageAlign: 'middle',
      imageOpacity: 100,
      hoverScale: 145,
      hoverOpacity: 100,
      transitionDuration: 180,
      clickAction: 'new tab',
    },
    layoutDefaults: {
      m: {
        fontSize: 0.062,
        lineHeight: 0.071,
        imageWidth: 0.04,
        imageHeight: 0.04,
        textImageGap: 0.006,
        entryGap: 0.016,
        imageRadius: 0,
      },
      d: {
        fontSize: 0.046,
        lineHeight: 0.053,
        imageWidth: 0.032,
        imageHeight: 0.032,
        textImageGap: 0.005,
        entryGap: 0.012,
        imageRadius: 0,
      },
    },
    layout: [
      '__componentName__',
      'fontFamily',
      'fontSettings',
      'fontSize',
      'lineHeight',
      'letterSpacing',
      'wordSpacing',
      'textAppearance',
      'textColor',
      'linkColor',
      'linkHoverColor',
      'imageWidth',
      'imageHeight',
      'imageFit',
      'imageAlign',
      'textImageGap',
      'entryGap',
      'imageRadius',
      'imageOpacity',
      'hoverScale',
      'hoverOpacity',
      'transitionDuration',
      'clickAction',
    ],
  },
  panels: [
    {
      id: 'type',
      icon: 'text-icon',
      title: 'Type',
      tooltip: 'Type Settings',
      layout: [
        '__componentName__',
        'fontFamily',
        'fontSettings',
        { type: 'row', items: ['fontSize', 'lineHeight'] },
        { type: 'row', items: ['letterSpacing', 'wordSpacing'] },
        'textAppearance',
        { type: 'row', title: 'Color', items: ['textColor', 'linkColor', 'linkHoverColor'] },
      ],
    },
    {
      id: 'image',
      icon: 'cover',
      title: 'Image',
      tooltip: 'Image Interaction',
      layout: [
        { type: 'row', title: 'Size', items: ['imageWidth', 'imageHeight'] },
        { type: 'row', title: 'Flow', items: ['textImageGap', 'entryGap'] },
        { type: 'row', title: 'Image', items: ['imageFit', 'imageAlign'] },
        { type: 'row', title: 'Shape', items: ['imageRadius', 'imageOpacity'] },
        { type: 'row', title: 'Hover', items: ['hoverScale', 'hoverOpacity', 'transitionDuration'] },
        'clickAction',
      ],
    },
  ],
  paletteBookmark: {
    items: ['textColor', 'linkColor', 'linkHoverColor'],
    panelIds: ['type'],
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
            type: 'rich-text',
          },
        },
        image: {
          type: 'object',
          label: 'Image',
          display: {
            isObjectFitEditable: false,
            type: 'media-input',
          },
        },
        link: {
          label: 'URL',
          placeholder: 'Image click URL...',
          display: {
            type: 'text-input',
          },
        },
        after: {
          label: 'After',
          placeholder: ';',
          display: {
            type: 'text-input',
          },
        },
      },
    },
    default: [
      {
        text: richText('Frog 24, Review "Lutz Bacher: Burning the Days"'),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Cover.jpg',
          name: 'Cover.jpg',
        },
        link: '',
        after: ';',
      },
      {
        text: richText("Nicolas Roggy 'Facings'"),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/2.jpg',
          name: '2.jpg',
        },
        link: '',
        after: ';',
      },
      {
        text: richText('Ambient images'),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/3.jpg',
          name: '3.jpg',
        },
        link: '',
        after: ';',
      },
      {
        text: richText('Ludovic Beillard & Angélique Aubrit'),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/4.jpg',
          name: '4.jpg',
        },
        link: '',
        after: ';',
      },
      {
        text: richText("Jordan Derrien 'Eight attempts, for eight works and a little more'"),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
          name: 'Control-slider-default-picture-1.png',
        },
        link: '',
        after: ';',
      },
      {
        text: richText('Noémie Bablet'),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
          name: 'Control-slider-default-picture-2.png',
        },
        link: '',
        after: ';',
      },
      {
        text: richText('Anne Bourse'),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
          name: 'Control-slider-default-picture-3.png',
        },
        link: '',
        after: ';',
      },
      {
        text: richText('Emilie Pitoiset'),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/julia.png',
          name: 'julia.png',
        },
        link: '',
        after: ';',
      },
      {
        text: richText('Victoria Soufflet'),
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/pia.png',
          name: 'pia.png',
        },
        link: '',
        after: ';',
      },
    ],
  },
  states: ['default', 'hover'],
};

export const InlineImageFlowComponent = {
  element: InlineImageFlow,
  id: 'inline-image-flow',
  name: 'Text Image Flow',
  category: 'lists',
  version: 1,
  defaultSize: {
    width: '100%',
    height: 420,
  },
  schema,
  sourceCode: inlineImageFlowSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'settings.fontSettings' }],
  },
};
