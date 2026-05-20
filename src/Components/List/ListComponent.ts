import { List } from './List';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import formSourceRaw from './List.tsx?raw';

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
  'textColor',
  'backgroundColor',
  'dividerColor',
  'textHoverColor',
  'backgroundHoverColor',
  'dividerHoverColor'
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
          firstColumn: {
            type: 'string',
            label: 'First column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          secondColumn: {
            type: 'string',
            label: 'Second column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          thirdColumn: {
            type: 'string',
            label: 'Third column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          fourthColumn: {
            type: 'string',
            label: 'Fourth column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          fifthColumn: {
            type: 'string',
            label: 'Fifth column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          image: {
            type: 'object',
            label: 'Image',
            display: {
              isObjectFitEditable: false,
              type: 'media-input',
            },
            properties: {
              url: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              objectFit: {
                type: 'string',
                enum: ['cover', 'contain'],
              }
            },
            required: ['url', 'name']
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
          firstColumn: 'firstColumn',
          secondColumn: 'secondColumn',
          thirdColumn: 'thirdColumn',
          fourthColumn: 'fourthColumn',
          fifthColumn: 'fifthColumn',
          image: {
            objectFit: "cover",
            url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png",
            name: "Slider-1.png"
          },
          link: "",
        },
        {
          firstColumn: 'firstColumn 2',
          secondColumn: 'secondColumn 2',
          thirdColumn: 'thirdColumn 2',
          fourthColumn: 'fourthColumn 2',
          fifthColumn: 'fifthColumn 2',
          image: {
            objectFit: "cover",
            url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png",
            name: "Slider-2.png"
          },
          link: "",
        },
        {
          firstColumn: 'firstColumn 3',
          secondColumn: 'secondColumn 3',
          thirdColumn: 'thirdColumn 3',
          fourthColumn: 'fourthColumn 3',
          fifthColumn: 'fifthColumn 3',
          image: {
            objectFit: "cover",
            url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQNEVRXPSRX5K1YTMJQY9.png",
            name: "Slider-3.png"
          },
          link: "",
        },
      ],
    },
  },
  settings: {
    sizing: 'auto auto',
    properties: {
      columns: {
        type: 'number',
        scope: 'layout',
        title: 'Columns',
        display: { type: 'common-numeric-input' },
        min: 1,
        max: 5,
      },
      wrapperWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      entriesCount: {
        type: 'number',
        scope: 'layout',
        title: 'Entries #',
        display: { type: 'toggle-numeric-input', enum: ['Auto', 'Fixed'] },
        min: 1,
      },
      cellMinHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Cell min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      imageOnHover: {
        type: 'boolean',
        scope: 'common',
        title: 'Image On Hover',
        display: { type: 'toggle-cycle', enum: ['On', 'Off'] },
      },
      imageSize: {
        type: 'object',
        scope: 'layout',
        title: 'Image size',
        display: { type: 'min-max-input' },
        min: 1,
        max: 1440,
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
        },
      },
      dividerWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Divider width',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      cut: {
        type: 'number',
        scope: 'layout',
        title: 'Cut',
        display: { type: 'toggle-numeric-input', enum: ['Auto', 'Fixed'] },
        min: 1,
      },
      entryHoverEffect: {
        type: 'string',
        scope: 'common',
        title: 'Entry Hover Effect',
        display: { type: 'toggle-cycle', enum: ['None', 'Default', 'Blinds'] },
      },

      firstColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'First column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      secondColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Second column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      thirdColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Third column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      fourthColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Fourth column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      fifthColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Fifth column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },

      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Color',
        display: { type: 'palette-color-picker' },
      },
      textHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Hover Color',
        display: { type: 'palette-color-picker' },
      },
      textFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Font family',
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
        title: 'Input Font Size',
        display: { type: 'font-size' },
      },
      textLineHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Input Line Height',
        display: { type: 'line-height-input' },
      },
      textLetterSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Letter Spacing',
        display: { type: 'letter-spacing-input' },
      },
      textWordSpacing: {
        type: 'number',
        scope: 'layout',
        title: 'Input Word Spacing',
        display: { type: 'word-spacing-input' },
      },
      textTextAppearance: {
        type: 'object',
        scope: 'layout',
        title: 'Input Text Appearance',
        display: { type: 'text-appearance' },
      },

      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'Background Color',
        display: { type: 'palette-color-picker' },
      },
      dividerColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Color',
        display: { type: 'palette-color-picker' },
      },
      backgroundHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Background Hover Color',
        display: { type: 'palette-color-picker' },
      },
      dividerHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Hover Color',
        display: { type: 'palette-color-picker' },
      },
    },
    defaults: {
      imageOnHover: 'Off',
      entryHoverEffect: 'None',
      textColor: '#767676',
      textHoverColor: '#767676',
      textFontFamily: 'Arial',
      textFontSettings: {
        fontWeight: 400,
        fontStyle: 'normal',
      },
      textLetterSpacing: 0,
      textWordSpacing: 0,
      textTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
      backgroundColor: '#FFFFFF',
      dividerColor: '#767676',
      backgroundHoverColor: '#FFFFFF',
      dividerHoverColor: '#767676'
    },
    layoutDefaults: {
      m: {
        columns: 5,
        wrapperWidth: 1,
        entriesCount: 0,
        cellMinHeight: 0.02,
        imageSize: { min: 80, max: 320 },
        dividerWidth: 0.002,
        cut: 0,
        firstColumnWidth: 0.2,
        secondColumnWidth: 0.2,
        thirdColumnWidth: 0.2,
        fourthColumnWidth: 0.2,
        fifthColumnWidth: 0.2,
        textStroke: 0.003,
        textCorners: 0.192,
        textPadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        textFontSize: 0.043,
        textLineHeight: 0.043,
      },
      d: {
        columns: 5,
        wrapperWidth: 1,
        entriesCount: 0,
        cellMinHeight: 0.03,
        imageSize: { min: 80, max: 320 },
        dividerWidth: 0.0006,
        cut: 0,
        firstColumnWidth: 0.2,
        secondColumnWidth: 0.2,
        thirdColumnWidth: 0.2,
        fourthColumnWidth: 0.2,
        fifthColumnWidth: 0.2,
        textStroke: 0.001,
        textCorners: 0.05,
        textPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        textFontSize: 0.01,
        textLineHeight: 0.01,
      }
    },
    displayRules: [
      {
        if: { name: 'entryHoverEffect', value: 'None' },
        then: { name: 'properties.direction.display.visible', value: false },
      }
    ],
    layout: [
      '__componentName__',
      'name',
      'columns',
      'wrapperWidth',
      'entriesCount',
      'cellMinHeight',
      'imageOnHover',
      'imageSize',
      'dividerWidth',
      'cut',
      'entryHoverEffect',
      'firstColumnWidth',
      'secondColumnWidth',
      'thirdColumnWidth',
      'fourthColumnWidth',
      'fifthColumnWidth',
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
        'gridLayout',
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
                  items: ['columns'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['wrapperWidth'],
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
                  items: ['cellMinHeight'],
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
                  items: ['imageOnHover'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['imageSize'],
                },
              ],
            },
          ],
        },
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
                  items: ['dividerWidth'],
                },
                {
                  type: 'row',
                  title: '',
                  items: ['cut'],
                },
              ],
            },
          ],
        },
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
                  items: ['entryHoverEffect'],
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
          title: 'Text',
          items: ['textFontFamily', 'textFontSettings', { type: 'row', items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing'] }, 'textTextAppearance'],
        },
      ],
    },
  ],
  paletteBookmark: {
    items: [...paletteBookmarkItems],
    panelIds: ['general', 'typeStyle'],
    stateItems: {
      default: [
        'textColor',
        'backgroundColor',
        'dividerColor',
        'textHoverColor',
        'backgroundHoverColor',
        'dividerHoverColor'
      ],
    },
  },
};

export const ListComponent = {
  element: List,
  id: 'list',
  name: 'Default List',
  category: 'lists',
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
