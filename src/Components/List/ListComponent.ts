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
          AColumn: {
            type: 'string',
            label: 'A column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          BColumn: {
            type: 'string',
            label: 'B column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          CColumn: {
            type: 'string',
            label: 'C column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          DColumn: {
            type: 'string',
            label: 'D column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          EColumn: {
            type: 'string',
            label: 'E column',
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
          AColumn: 'AColumn',
          BColumn: 'BColumn',
          CColumn: 'CColumn',
          DColumn: 'DColumn',
          EColumn: 'EColumn',
          image: {
            objectFit: "cover",
            url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png",
            name: "Slider-1.png"
          },
          link: "",
        },
        {
          AColumn: 'AColumn 2',
          BColumn: 'BColumn 2',
          CColumn: 'CColumn 2',
          DColumn: 'DColumn 2',
          EColumn: 'EColumn 2',
          image: {
            objectFit: "cover",
            url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png",
            name: "Slider-2.png"
          },
          link: "",
        },
        {
          AColumn: 'AColumn 3',
          BColumn: 'BColumn 3',
          CColumn: 'CColumn 3',
          DColumn: 'DColumn 3',
          EColumn: 'EColumn 3',
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
        display: { type: 'count-number' },
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
        display: { type: 'toggle-numeric-input', enum: ['Off', 'On'] },
        min: 1,
      },
      entryHoverEffect: {
        type: 'string',
        scope: 'common',
        title: 'Entry Hover Effect',
        display: { type: 'toggle-cycle', enum: ['None', 'Default', 'Blinds'] },
      },
      cutCellMinHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Cell min height',
        display: { type: 'numeric-input' },
        min: 0,
        max: 9999,
      },
      cutLabel: {
        type: 'string',
        scope: 'common',
        title: 'Cut Label',
        display: { type: 'label-input' },
      },
      showCut: {
        type: 'number',
        scope: 'layout',
        title: 'Show',
        display: { type: 'toggle-numeric-input', enum: ['All', 'Custom'] },
        min: 1,
      },

      rowPaddingTop: {
        type: 'number',
        scope: 'layout',
        title: 'Row Padding Top',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      rowPaddingBottom: {
        type: 'number',
        scope: 'layout',
        title: 'Row Padding Bottom',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      wrapperPaddingLeft: {
        type: 'number',
        scope: 'layout',
        title: 'Wrapper Padding Left',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      wrapperPaddingRight: {
        type: 'number',
        scope: 'layout',
        title: 'Wrapper Padding Right',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      AColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'A column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      BColumn: {
        type: 'number',
        scope: 'layout',
        title: 'B column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      CColumn: {
        type: 'number',
        scope: 'layout',
        title: 'C column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      DColumn: {
        type: 'number',
        scope: 'layout',
        title: 'D column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      EColumn: {
        type: 'number',
        scope: 'layout',
        title: 'E column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      columnsOrder: {
        type: 'array',
        scope: 'layout',
        title: 'Columns Order',
        display: { type: 'reorder-input' },
        items: { type: 'string' },
      },

      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Default',
        display: { type: 'palette-color-picker' },
      },
      textHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Hover',
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
        title: 'BG Default',
        display: { type: 'palette-color-picker' },
      },
      dividerColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Default',
        display: { type: 'palette-color-picker' },
      },
      backgroundHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'BG Hover',
        display: { type: 'palette-color-picker' },
      },
      dividerHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Divider Hover',
        display: { type: 'palette-color-picker' },
      },
    },
    defaults: {
      imageOnHover: 'Off',
      entryHoverEffect: 'None',
      cutLabel: 'SEE ALL',
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
      backgroundColor: '#FFFFFF00',
      dividerColor: '#767676',
      backgroundHoverColor: '#FFFFFF00',
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
        showCut: 0,
        cutCellMinHeight: 0.02,
        rowPaddingTop: 0.01,
        rowPaddingBottom: 0.01,
        wrapperPaddingLeft: 0.01,
        wrapperPaddingRight: 0.01,
        AColumnWidth: 0.2,
        BColumn: 0.2,
        CColumn: 0.2,
        DColumn: 0.2,
        EColumn: 0.2,
        columnsOrder: ['AColumn', 'BColumn', 'CColumn', 'DColumn', 'EColumn'],
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
        showCut: 0,
        cutCellMinHeight: 0.03,
        rowPaddingTop: 0.01,
        rowPaddingBottom: 0.01,
        wrapperPaddingLeft: 0.01,
        wrapperPaddingRight: 0.01,
        AColumnWidth: 0.2,
        BColumn: 0.2,
        CColumn: 0.2,
        DColumn: 0.2,
        EColumn: 0.2,
        columnsOrder: ['AColumn', 'BColumn', 'CColumn', 'DColumn', 'EColumn'],
        textStroke: 0.001,
        textCorners: 0.05,
        textPadding: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 },
        textFontSize: 0.01,
        textLineHeight: 0.01,
      }
    },
    displayRules: [
      {
        if: { name: 'cut', value: 0 },
        then: { name: 'properties.cutLabel.display.visible', value: false },
      },
      {
        if: { name: 'cut', value: 0 },
        then: { name: 'properties.cutCellMinHeight.display.visible', value: false },
      },
      {
        if: { name: 'cut', value: 0 },
        then: { name: 'properties.showCut.display.visible', value: false },
      },
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
      'showCut',
      'cutCellMinHeight',
      'entryHoverEffect',
      'cutLabel',
      'rowPaddingTop',
      'rowPaddingBottom',
      'wrapperPaddingLeft',
      'wrapperPaddingRight',
      'AColumnWidth',
      'BColumn',
      'CColumn',
      'DColumn',
      'EColumn',
      'columnsOrder',
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
        {
          type: 'row',
          title: '',
          items: ['columns', 'wrapperWidth']
        },
        {
          type: 'row',
          title: '',
          items: ['entriesCount', 'cellMinHeight']
        },
        {
          type: 'row',
          title: '',
          items: ['imageOnHover', 'imageSize']
        },
        {
          type: 'row',
          title: '',
          items: ['dividerWidth', 'cut']
        },
        {type: 'row', title: '', items: ['entryHoverEffect']},
        {
          type: 'row',
          title: 'Cut Settings',
          items: ['cutLabel', 'cutCellMinHeight']
        },
        {
          type: 'row',
          title: '',
          items: ['showCut']
        }
      ],
    },
    { 
      id: 'fields',
      icon: 'layers',
      title: 'Fields',
      tooltip: 'Fields',
      layout: [
        'columnsOrder',
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
