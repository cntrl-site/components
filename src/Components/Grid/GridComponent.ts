import { Grid } from './Grid';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import formSourceRaw from './Grid.tsx?raw';

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
  'lightboxCounterColor',
] as const;

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  content: {
      type: 'array',
      settings: {
        addItemWithoutImage: true,
      },
      display: {
        type: 'array',
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
              type: {
                type: 'string',
                enum: ['image', 'video'],
              },
              objectFit: {
                type: 'string',
                enum: ['cover', 'contain'],
              },
            },
            required: ['url', 'name'],
          },
          link: {
            type: 'string',
            label: 'Link',
            placeholder: 'Add link...',
            display: {
              type: 'text-input',
            },
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
          link: ''
        },
        {
          title: 'Title 2',
          subtitle: 'Subtitle 2',
          image: [{
            url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
            name: 'Grid-2.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'Title 3',
          subtitle: 'Subtitle 3',
          image: [{
            url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
            name: 'Grid-3.png',
            objectFit: 'cover',
          }],
          link: ''
        },
      ],
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      type: {
        type: 'string',
        scope: 'common',
        title: '',
        display: { type: 'radio-group' },
        enum: ['A', 'B', 'C'],
      },
      gridLayout: {
        type: 'grid-layout',
        scope: 'layout',
        display: { type: 'grid-layout' },
        gridParams: {
          type: 'object',
          properties: {
            columnsCount: {
              type: 'number',
              title: 'Columns',
              min: 1,
              max: 4
            },
            wrapperWidth: {
              type: 'number',
              title: 'Width',
              min: 0,
            },
            entryWidth: {
              type: 'number',
              title: 'Entry',
              min: 0,
            },
            horizontalGap: {
              type: 'number',
              title: 'Gap',
              min: 0,
            }
          }
        }
      },
      textBoxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Text Width (%)',
        display: { type: 'percentage-input' },
        min: 0,
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
      imageDisplay: {
        type: 'object',
        scope: 'common',
        title: 'Display',
        display: { type: 'image-ratio-control' },
        properties: {
          display: {
            type: 'string',
            enum: ['Fit', 'Cover'],
          },
          ratioValue: {
            type: 'string',
            enum: ['1:1', '2:3', '3:4', '4:5', '16:9'],
          },
          reversed: {
            type: 'boolean',
          },
        },
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
        title: 'Timing (Sec)',
        display: { type: 'common-numeric-input' },
        min: 1,
        max: 10,
      },
      direction: {
        type: 'string',
        scope: 'common',
        title: 'Direction',
        display: { type: 'toggle-cycle', enum: ['Horizontal', 'Vertical', 'Random'], enabled: true },
      },
      transition: {
        type: 'string',
        scope: 'common',
        title: 'Transition',
        display: { type: 'toggle-cycle', enum: ['Fade', 'Slide'] },
      },
      titleMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Title margin top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      subtitleMarginTop: {
        type: 'number',
        scope: 'layout',
        title: 'Subtitle margin top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
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
      lightboxCounterColor: {
        type: 'string',
        scope: 'common',
        title: 'Lightbox Counter Color',
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
        display: { type: 'font-settings-weight' },
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
        display: { type: 'font-settings-weight' },
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
      lightboxCounterFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
        display: { type: 'font-family-select' },
      },
      lightboxCounterFontSettings: {
        ...textStyleProperties.fontSettings,
        scope: 'common',
        title: '',
        display: { type: 'font-settings-weight' },
      },
      lightboxCounterFontSize: {
        type: 'number',
        scope: 'layout',
        title: 'Input Font Size',
        display: { type: 'font-size' },
      },
      lightboxCounterLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Input Line Height',
        display: { type: 'line-height-input' },
      },
      lightboxCounterLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      lightboxCounterWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      lightboxCounterTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Input Text Appearance',
        display: { type: 'text-appearance' },
      },
    },
    defaults: {
      lightbox: 'Off',
      imageDisplay: {
        display: 'Fit',
        ratioValue: '16:9',
        reversed: false,
      },
      type: 'A',
      slider: 'Off',
      sliderTiming: 5,
      direction: 'Horizontal',
      transition: 'Slide',
      titleColor: '#767676',
      subtitleColor: '#DEDDDD',
      lightboxCounterColor: '#DEDDDD',
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
      lightboxCounterFontFamily: 'Arial',
      lightboxCounterFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      lightboxCounterLetterSpacing: 0,
      lightboxCounterWordSpacing: 0,
      lightboxCounterTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
    layoutDefaults: {
      m: {
        gridLayout: {
          entryWidth: 0.2,
          horizontalGap: 0.05,
          wrapperWidth: 1,
          columnsCount: 2,
          lockedParam: null,
        },
        textBoxWidth: 100,
        verticalGap: 0.0083,
        entriesCount: 0,
        titleMarginTop: 0.02,
        subtitleMarginTop: 0.02,
        titleStroke: 0.003,
        titleCorners: 0.192,
        subtitlePadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        titlePadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        titleFontSize: 0.043,
        titleLineHeight: 0.043,
        subtitleFontSize: 0.0373,
        subtitleLineHeight: 0.0373,
        lightboxCounterFontSize: 0.0373,
        lightboxCounterLineHeight: 0.0373,
      },
      d: {
        gridLayout: {
          entryWidth: 0.2,
          horizontalGap: 0.05,
          wrapperWidth: 1,
          columnsCount: 2,
          lockedParam: null,
        },
        textBoxWidth: 100,
        verticalGap: 0.0083,
        entriesCount: 0,
        titleMarginTop: 0.008,
        subtitleMarginTop: 0.008,
        titleStroke: 0.001,
        titleCorners: 0.05,
        subtitlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titleFontSize: 0.01,
        titleLineHeight: 0.01,
        subtitleFontSize: 0.01,
        subtitleLineHeight: 0.01,
        lightboxCounterFontSize: 0.01,
        lightboxCounterLineHeight: 0.01,
      }
    },
    displayRules: [
      {
        if: { name: 'transition', value: 'Fade' },
        then: { name: 'properties.direction.display.enabled', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'name',
      'type',
      'gridLayout',
      'textBoxWidth',
      'verticalGap',
      'entriesCount',
      'lightbox',
      'imageDisplay',
      'slider',
      'sliderTiming',
      'direction',
      'transition',
      'transition',
      'titleMarginTop',
      'subtitleMarginTop'
    ],
  },
  panels: [
    {
      id: 'general',
      icon: 'cursor',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        { type: 'row', items: ['__componentName__', 'name'] },
        'type',
        {
          type: 'row',
          title: 'Grid',
          items: [
            {type: 'group', title: '', items: ['gridLayout']},
          ],
        },
        {
          type: 'row',
          title: '',
          items: ['textBoxWidth', 'entriesCount']
        },
        {type: 'row', title: '', items: ['verticalGap']},
        {
          type: 'row',
          title: 'Image',
          items: ['imageDisplay', 'lightbox']
        },
        {
          type: 'row',
          title: 'Slider',
          items: [
            { type: 'group', title: '', items: ['slider', 'sliderTiming']},
            { type: 'group', title: '', items: ['direction', 'transition']},
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
          items: ['titleFontFamily', 'titleFontSettings', { type: 'row', items: ['titleFontSize', 'titleLineHeight', 'titleLetterSpacing', 'titleWordSpacing'] }, 'titleTextAppearance'],
        },
        {
          type: 'group',
          title: 'Subtitle',
          items: ['subtitleFontFamily', 'subtitleFontSettings', { type: 'row', items: ['subtitleFontSize', 'subtitleLineHeight', 'subtitleLetterSpacing', 'subtitleWordSpacing'] }, 'subtitleTextAppearance'],
        },
        {
          type: 'group',
          title: 'Lightbox Counter',
          items: ['lightboxCounterFontFamily', 'lightboxCounterFontSettings', { type: 'row', items: ['lightboxCounterFontSize', 'lightboxCounterLineHeight', 'lightboxCounterLetterSpacing', 'lightboxCounterWordSpacing'] }, 'lightboxCounterTextAppearance'],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: ['titleColor', 'subtitleColor', 'lightboxCounterColor'],
    },
  },
};

export const GridComponent = {
  element: Grid,
  id: 'grid',
  name: 'Neptune',
  category: 'grids',
  layoutMode: 'structured' as const,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Neptune_Grid.png',
  },
  version: 1,
  defaultSize: {
    d: {
      width: 720,
      height: 540,
    }
  },
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  schema,
  sourceCode: formSourceRaw,
};
