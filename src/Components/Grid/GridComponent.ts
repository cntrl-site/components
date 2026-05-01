import { Grid } from './Grid';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import formSourceRaw from './Grid.tsx?raw';

type GridSchema = ComponentSchemaV1 & {
  properties: {
    content: {
      type: 'array';
      settings?: { addItemFromFileExplorer?: boolean };
      items: any;
      default: any[];
    };
  };
};

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
  }
};

const paletteBookmarkItems = [
  'titleColor',
  'subtitleColor',
] as const;

const schema: GridSchema = {
  type: 'object',
  version: 1,
  properties: {
    content: {
      type: 'array',
      settings: {
        addItemFromFileExplorer: true,
      },
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            label: 'Title',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          subtitle: {
            type: 'string',
            label: 'Subtitle',
            placeholder: 'Add Subtitle...',
            display: {
              type: 'text-input',
            },
          },
          image: {
            type: 'object',
            label: 'Image',
            display: {
              type: 'media-list-input',
            },
            properties: {
              url: { type: 'string' },
              name: { type: 'string' },
              objectFit: {
                type: 'string',
                enum: ['cover', 'contain'],
              },
            },
            required: ['url', 'name'],
          },
        },
        required: ['image'],
      },
      default: [
        {
          title: 'Title 1',
          subtitle: 'Subtitle 1',
          image: [{
            url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
            name: 'Grid-1.png',
            objectFit: 'cover',
          }],
        },
        {
          title: 'Title 2',
          subtitle: 'Subtitle 2',
          image: [{
            url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
            name: 'Grid-2.png',
            objectFit: 'cover',
          }],
        },
        {
          title: 'Title 3',
          subtitle: 'Subtitle 3',
          image: [{
            url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
            name: 'Grid-3.png',
            objectFit: 'cover',
          }],
        },
      ],
    },
  },
  settings: {
    sizing: 'auto manual', // TODO think where to place this non-editable property
    properties: {
      fieldsToShow: {
        type: 'number',
        scope: 'layout',
        title: 'Columns',
        display: { type: 'count-number' },
      },
      type: {
        type: 'string',
        scope: 'common',
        title: '',
        display: { type: 'radio-group' },
        enum: ['A', 'B'],
      },
      textBoxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Textbox Width',
        display: { type: 'percentage-input' },
        min: 0,
        max: 200,
      },
      verticalGap: {
        type: 'number',
        scope: 'layout',
        title: 'Vertical Gap',
        display: { type: 'numeric-input' },
        min: 0,
        max: 1000,
      },
      entriesCount: {
        type: 'number',
        scope: 'layout',
        title: 'Entries #',
        display: { type: 'toggle-numeric-input', enum: ['Auto', 'Fixed'] },
        min: 1,
      },
      lightbox: {
        type: 'boolean',
        scope: 'common',
        title: 'Lightbox',
        display: { type: 'toggle-cycle', enum: ['On', 'Off'] },
      },
      imageSize: {
        type: 'string',
        scope: 'layout',
        title: 'Size',
        display: { type: 'toggle-cycle', enum: ['Small', 'Medium', 'Big'] },
      },
      imageDisplay: {
        type: 'string',
        scope: 'common',
        title: 'Display',
        display: { type: 'toggle-cycle', enum: ['Fit', 'Cover'] },
      },
      slider: {
        type: 'boolean',
        scope: 'common',
        title: 'Slider',
        display: { type: 'toggle-cycle', enum: ['On', 'Off'] },
      },
      sliderTiming: {
        type: 'number',
        scope: 'common',
        title: 'Timing (S)',
        display: { type: 'common-numeric-input' },
        min: 1,
        max: 10,
      },
      direction: {
        type: 'string',
        scope: 'common',
        title: 'Direction',
        display: { type: 'toggle-cycle', enum: ['Horizontal', 'Vertical', 'Random'] },
      },
      transition: {
        type: 'string',
        scope: 'common',
        title: 'Transition',
        display: { type: 'toggle-cycle', enum: ['Fade', 'Slide'] },
      },
      titleColor: {
        type: 'string',
        scope: 'common',
        title: 'Title Color',
        display: { type: 'palette-color-picker' },
      },
      subtitleColor: {
        type: 'string',
        scope: 'common',
        title: 'Subtitle Color',
        display: { type: 'palette-color-picker' },
      },
      titleFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      titleFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display : { type: 'font-settings-weight'},
      },
      titleFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Input Font Size',
        display: { type: 'font-size' },
      },
      titleLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Input Line Height',
        display: { type: 'line-height-input' },
      },
      titleLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      titleWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      titleTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Input Text Appearance',
        display: { type: 'text-appearance' },
      },
      subtitleFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      subtitleFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display : { type: 'font-settings-weight' },
      },
      subtitleFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Subtitle Font Size',
        display: { type: 'font-size' },
      },
      subtitleLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Subtitle Line Height',
        display: { type: 'line-height-input' },
      },
      subtitleLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Subtitle Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      subtitleWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Subtitle Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      subtitleTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Subtitle Text Appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      fieldsToShow: 2,
      lightbox: 'Off',
      imageDisplay: 'Fit',
      type: 'A',
      slider: 'Off',
      sliderTiming: 5,
      direction: 'Horizontal',
      transition: 'Slide',
      titleColor: '#767676',
      subtitleColor: '#DEDDDD',
      titleFontFamily: 'Arial',
      titleFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      titleLetterSpacing: 0,
      titleWordSpacing: 0,
      titleTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      subtitleFontFamily: 'Arial',
      subtitleFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      subtitleLetterSpacing: 0,
      subtitleWordSpacing: 0,
      subtitleTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
    layoutDefaults: {
      m: {
        textBoxWidth: 100,
        verticalGap: 0.0083,
        entriesCount: 0,
        imageSize: 'Medium',
        titleStroke: 0.003,
        titleCorners: 0.192,
        subtitlePadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        titlePadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        titleFontSize: 0.043,
        titleLineHeight: 0.043,
        subtitleFontSize: 0.0373,
        subtitleLineHeight: 0.0373,
      },
      d: {
        textBoxWidth: 100,
        verticalGap: 0.0083,
        entriesCount: 0,
        imageSize: 'Medium',
        titleStroke: 0.001,
        titleCorners: 0.05,
        subtitlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titleFontSize: 0.01,
        titleLineHeight: 0.01,
        subtitleFontSize: 0.01,
        subtitleLineHeight: 0.01,
      }
    },
    displayRules: [

    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__', 'name', 'fieldsToShow'] },
        'type',
        {
          type: 'group',
          title: '',
          items: [
            {
              type: 'row',
              title: '',
              items: [
                {
                  type: 'row',
                  title: '',
                  items: ['textBoxWidth'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['verticalGap'],
                },
              ],
            },
            {
              type: 'row',
              title: '',
              items: [
                {
                  type: 'row',
                  title: '',
                  items: ['entriesCount'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['lightbox'],
                },
              ],
            },
          ],
        },
        {
          type: 'group',
          title: 'Image',
          items: [
            {
              type: 'row',
              title: '',
              items: [
                {
                  type: 'row',
                  title: '',
                  items: ['imageSize'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['imageDisplay'],
                },
              ],
            },
          ],
        },
        {
          type: 'group',
          title: 'Slider',
          items: [
            {
              type: 'row',
              title: '',
              items: [
                {
                  type: 'row',
                  title: '',
                  items: ['slider'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['sliderTiming'],
                },
              ],
            },
            {
              type: 'row',
              title: '',
              items: [
                {
                  type: 'row',
                  title: '',
                  items: ['direction'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['transition'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        {
          type: 'group',
          title: 'Title',
          items: [ 'titleFontFamily', 'titleFontSettings', {type: 'row', items: ['titleFontSize', 'titleLineHeight', 'titleLetterSpacing', 'titleWordSpacing']}, 'titleTextAppearance'],
        },
        {
          type: 'group',
          title: 'Subtitle',
          items: [ 'subtitleFontFamily', 'subtitleFontSettings', {type: 'row', items: ['subtitleFontSize', 'subtitleLineHeight', 'subtitleLetterSpacing', 'subtitleWordSpacing']}, 'subtitleTextAppearance'],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['titleColor', 'subtitleColor'],
    },
  },
};

export const GridComponent = {
  element: Grid,
  id: 'grid',
  name: 'Grid Default',
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/formImg.png',
  },
  version: 1,
  defaultSize: {
    width: 720,
    height: 540,
  },
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  schema,
  sourceCode: formSourceRaw,
};
