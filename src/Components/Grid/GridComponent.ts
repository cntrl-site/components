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
          gallery: {
            type: 'array',
            label: 'Gallery',
            display: {
              type: 'media-pair-list-input',
            },
            items: {
              type: 'object',
              properties: {
                media: {
                  type: 'array',
                  items: {
                    type: 'object',
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
                  },
                },
              },
            },
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
        required: ['gallery'],
      },
      default: [
        {
          title: `Flying Over the Old Town`,
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(1).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'Doors of Matera',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(2).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'Cattedrale di Santa Maria',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(3).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'City Through the Cracks',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(4).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'Private Stone Gardens',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(5).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }, {
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(6).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }, {
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(7).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'Leaving the Old Town',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(8).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'Under the Sun',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(9).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'Citygates View',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(10).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
          }],
          link: ''
        },
        {
          title: 'Around the City',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          gallery: [{
            media: [{
              url: 'https://cdn.cntrl.site/component-assets/grid(11).webp',
              name: '',
              objectFit: 'cover',
            }, {
              url: '',
              name: '',
              objectFit: 'cover',
            }],
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
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['a', 'b', 'c', 'd', 'e', 'f'],
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
              title: 'Gutter',
              min: 0,
            },
            textWidthPercent: {
              type: 'number',
              title: 'Text Width (%)',
              min: 0,
              display: { type: 'percentage-input' },
            },
          }
        }
      },
      verticalGap: {
        type: 'number',
        scope: 'layout',
        title: 'Vertical Gap',
        display: { type: 'numeric-input' },
        min: 0,
        max: 1000,
      },
      showText: {
        type: 'boolean',
        scope: 'common',
        title: 'Show text',
        display: { type: 'toggle-cycle', enum: ['always', 'on hover'] },
      },
      alignEntries: {
        type: 'boolean',
        scope: 'layout',
        title: 'Align entries',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      align: {
        type: 'string',
        scope: 'layout',
        title: 'Align',
        display: { type: 'toggle-cycle', enum: ['top', 'center', 'bottom'] },
      },
      entriesCount: {
        type: 'number',
        scope: 'layout',
        title: 'Entries #',
        display: { type: 'toggle-numeric-input', enum: ['auto', 'fixed'] },
        min: 1,
      },
      lightbox: {
        type: 'boolean',
        scope: 'common',
        title: 'Lightbox',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      imageDisplay: {
        type: 'object',
        scope: 'common',
        title: 'Display',
        display: { type: 'image-ratio-control' },
        properties: {
          display: {
            type: 'string',
            enum: ['fit', 'cover'],
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
      lightboxImageDisplay: {
        type: 'string',
        scope: 'common',
        title: 'Display',
        display: { type: 'toggle-cycle', enum: ['fit', 'cover'] },
      },
      slider: {
        type: 'boolean',
        scope: 'common',
        title: 'Slider',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
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
        display: { type: 'toggle-cycle', enum: ['horizontal', 'vertical', 'random'], enabled: true },
      },
      transition: {
        type: 'string',
        scope: 'common',
        title: 'Transition',
        display: { type: 'toggle-cycle', enum: ['fade', 'slide'] },
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
        title: 'Title Entry',
        display: { type: 'palette-color-picker' },
      },
      subtitleColor: {
        type: 'string',
        scope: 'common',
        title: 'Subtitle Entry',
        display: { type: 'palette-color-picker' },
      },
      lightboxCounterColor: {
        type: 'string',
        scope: 'common',
        title: 'Counter Lightbox',
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
      lightbox: 'on',
      imageDisplay: {
        display: 'cover',
        ratioValue: '2:3',
        reversed: false,
      },
      lightboxImageDisplay: 'fit',
      slider: 'on',
      sliderTiming: 3,
      direction: 'horizontal',
      transition: 'fade',
      showText: 'always',
      alignEntries: 'on',
      align: 'top',
      titleColor: '#000000',
      subtitleColor: '#000000',
      lightboxCounterColor: '#DEDDDD',
      titleFontFamily: 'Arial',
      titleFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      titleLetterSpacing: 0,
      titleWordSpacing: 0,
      titleTextAppearance: {
        textTransform: 'uppercase',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      subtitleFontFamily: 'Goudy Bookletter 1911',
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
      lightboxCounterFontFamily: 'Goudy Bookletter 1911',
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
        type: 'a',
        gridLayout: {
          entryWidth: 0.8,
          horizontalGap: 0.0533,
          wrapperWidth: 1,
          columnsCount: 1,
          textWidthPercent: 100,
          lockedParam: null,
        },
        verticalGap: 0.266,
        entriesCount: 0,
        titleMarginTop: 0.02,
        subtitleMarginTop: 0.02,
        titleStroke: 0.003,
        titleCorners: 0.192,
        subtitlePadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        titlePadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        titleFontSize: 0.1066,
        titleLineHeight: 0.0853,
        subtitleFontSize: 0.056,
        subtitleLineHeight: 0.0506,
        lightboxCounterFontSize: 0.0373,
        lightboxCounterLineHeight: 0.0373,
      },
      d: {
        type: 'a',
        gridLayout: {
          entryWidth: 0.0833,
          horizontalGap: 0,
          wrapperWidth: 1,
          columnsCount: 3,
          textWidthPercent: 200,
          lockedParam: null,
        },
        verticalGap: 0.09722,
        entriesCount: 0,
        titleMarginTop: 0.008,
        subtitleMarginTop: 0.008,
        titleStroke: 0.001,
        titleCorners: 0.05,
        subtitlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titleFontSize: 0.027,
        titleLineHeight: 0.0222,
        titleLetterSpacing: -0.00118,
        subtitleFontSize: 0.01,
        subtitleLineHeight: 0.01,
        lightboxCounterFontSize: 0.01,
        lightboxCounterLineHeight: 0.01,
      }
    },
    displayRules: [
      {
        if: { name: 'transition', value: 'fade' },
        then: { name: 'properties.direction.display.enabled', value: false },
      },
      {
        if: { name: 'lightbox', value: 'off' },
        then: { name: 'properties.lightboxImageDisplay.display.enabled', value: false },
      },
      {
        if: { name: 'imageDisplay.display', value: 'cover' },
        then: { name: 'properties.align.display.enabled', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'name',
      'type',
      'gridLayout',
      'verticalGap',
      'showText',
      'alignEntries',
      'align',
      'entriesCount',
      'lightbox',
      'imageDisplay',
      'lightboxImageDisplay',
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
      icon: 'settings',
      title: 'General',
      tooltip: 'General Settings',
      layout: [
        '__componentName__',
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
          items: ['verticalGap']
        },
        {type: 'row', title: '', items: ['entriesCount', 'showText']},
        {type: 'row', title: '', items: ['alignEntries', 'align']},
      ],
    },
    {
      id: 'imageSettings',
      icon: 'cover',
      title: 'Image settings',
      tooltip: 'Image settings',
      layout: [
        '__componentName__',
        {type: 'row', title: 'Image', items: ['imageDisplay']},
        {
          type: 'row',
          title: 'Lightbox',
          items: ['lightbox', 'lightboxImageDisplay']
        },
        {
          type: 'row',
          title: 'Slider',
          items: [
            { type: 'group', title: '', items: ['slider', 'direction']},
            { type: 'group', title: '', items: ['sliderTiming', 'transition']},
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
        '__componentName__',
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
    content: [{ path: 'gallery.media.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [{ path: 'titleFontFamily' }, { path: 'subtitleFontFamily' }, { path: 'lightboxCounterFontFamily' }],
  },
  fontRelations: {
    titleFontSettings: 'titleFontFamily',
    subtitleFontSettings: 'subtitleFontFamily',
    lightboxCounterFontSettings: 'lightboxCounterFontFamily',
  },
  schema,
  sourceCode: formSourceRaw,
};
