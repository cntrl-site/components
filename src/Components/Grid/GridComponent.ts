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
          title: `BIRD'S EYE VIEW OVER THE OLD TOWN`,
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMT6MP4CXE4D8M7F07N.jpeg',
            name: 'Grid-1.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'DOORS OF MATERA',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMTTK8C047Y4HVS0Y47.jpeg',
            name: 'Grid-2.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'Cattedrale di Santa Maria',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMT6W6J7F3PMQMGQAW5.jpeg',
            name: 'Grid-3.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'OLD CITY THROUGH THE CRACKS',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMT05YW60A4ZJSQFXMH.jpeg',
            name: 'Grid-4.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'PRIVATE STONE GARDENS',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMTXRHFWCZ0ENQCCQB8.jpeg',
            name: 'Grid-5.png',
            objectFit: 'cover',
          },
          {
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMTH9CN4VJ64RCDBR5Y.jpeg',
            name: 'Grid-6.png',
            objectFit: 'cover',
          },
          {
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMT38ZBD3E1CF9Q95V9.jpeg',
            name: 'Grid-7.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'EXITING THE OLD TOWN',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMTA4P1VVZ4NW8GFX2N.jpeg',
            name: 'Grid-8.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'LAUNDRY UNDER THE SUN',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMT8CC7M3EH3M86DSGD.jpeg',
            name: 'Grid-9.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'CITY GATES VIEW',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMTE1564HYYJH5GGVGY.jpeg',
            name: 'Grid-10.png',
            objectFit: 'cover',
          }],
          link: ''
        },
        {
          title: 'FORTIFICATIONS AROUND THE CITY',
          subtitle: 'Leica M6 / SUMMICRON-M 50mm F2/ PORTRA 400',
          image: [{
            url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01KVDNXFMTE3YZYKJJPEAZWAD2.jpeg',
            name: 'Grid-11.png',
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
        scope: 'layout',
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
      showText: {
        type: 'boolean',
        scope: 'common',
        title: 'Show text',
        display: { type: 'toggle-cycle', enum: ['Always', 'On hover'] },
      },
      alignEntries: {
        type: 'boolean',
        scope: 'layout',
        title: 'Align entries',
        display: { type: 'toggle-cycle', enum: ['On', 'Off'] },
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
      lightboxImageDisplay: {
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
      lightbox: 'On',
      imageDisplay: {
        display: 'Cover',
        ratioValue: '2:3',
        reversed: false,
      },
      lightboxImageDisplay: 'Fit',
      slider: 'On',
      sliderTiming: 3,
      direction: 'Horizontal',
      transition: 'Fade',
      showText: 'Always',
      alignEntries: 'On',
      titleColor: '#000000',
      subtitleColor: '#000000',
      lightboxCounterColor: '#DEDDDD',
      titleFontFamily: 'Affigere-Regular',
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
        type: 'C',
        gridLayout: {
          entryWidth: 0.8,
          horizontalGap: 0.0533,
          wrapperWidth: 1,
          columnsCount: 1,
          lockedParam: null,
        },
        textBoxWidth: 100,
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
        type: 'C',
        gridLayout: {
          entryWidth: 0.1736,
          horizontalGap: 0,
          wrapperWidth: 1,
          columnsCount: 3,
          lockedParam: null,
        },
        textBoxWidth: 100,
        verticalGap: 0.0694,
        entriesCount: 0,
        titleMarginTop: 0.008,
        subtitleMarginTop: 0.008,
        titleStroke: 0.001,
        titleCorners: 0.05,
        subtitlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titlePadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        titleFontSize: 0.027,
        titleLineHeight: 0.0222,
        titleLetterSpacing: 0.00055,
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
      {
        if: { name: 'lightbox', value: 'Off' },
        then: { name: 'properties.lightboxImageDisplay.display.enabled', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.alignEntries.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.alignEntries.display.visible', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'name',
      'type',
      'gridLayout',
      'textBoxWidth',
      'verticalGap',
      'showText',
      'alignEntries',
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
        {type: 'row', title: '', items: ['verticalGap', 'showText']},
        {type: 'row', title: '', items: ['alignEntries']},
      ],
    },
    {
      id: 'imageSettings',
      icon: 'cover',
      title: 'Image settings',
      tooltip: 'Image settings',
      layout: [
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
