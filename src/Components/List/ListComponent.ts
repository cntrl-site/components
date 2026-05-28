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
          BColumnWidth: {
            type: 'string',
            label: 'B column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          CColumnWidth: {
            type: 'string',
            label: 'C column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          DColumnWidth: {
            type: 'string',
            label: 'D column',
            placeholder: 'Add Title...',
            display: {
              type: 'text-input',
            },
          },
          EColumnWidth: {
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
          BColumnWidth: 'BColumnWidth',
          CColumnWidth: 'CColumnWidth',
          DColumnWidth: 'DColumnWidth',
          EColumnWidth: 'EColumnWidth',
          image: {
            objectFit: "cover",
            url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png",
            name: "Slider-1.png"
          },
          link: "",
        },
        {
          AColumn: 'AColumn 2',
          BColumnWidth: 'BColumnWidth 2',
          CColumnWidth: 'CColumnWidth 2',
          DColumnWidth: 'DColumnWidth 2',
          EColumnWidth: 'EColumnWidth 2',
          image: {
            objectFit: "cover",
            url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png",
            name: "Slider-2.png"
          },
          link: "",
        },
        {
          AColumn: 'AColumn 3',
          BColumnWidth: 'BColumnWidth 3',
          CColumnWidth: 'CColumnWidth 3',
          DColumnWidth: 'DColumnWidth 3',
          EColumnWidth: 'EColumnWidth 3',
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
      type: {
        type: 'string',
        scope: 'layout',
        title: '',
        display: { type: 'radio-group' },
        enum: ['A', 'B'],
      },
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
      showVisibility: {
        type: 'array',
        scope: 'common',
        title: 'Show',
        display: { type: 'double-toggle', enum: ['Top', 'Bottom'] },
        items: { type: 'boolean' },
        default: [true, false],
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
      rowPaddingTopB: {
        type: 'number',
        scope: 'layout',
        title: 'Row Padding Top',
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
      AColumnPaddingLeft: {
        type: 'number',
        scope: 'layout',
        title: 'A column padding left',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      AColumnPaddingRight: {
        type: 'number',
        scope: 'layout',
        title: 'A column padding right',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      BColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'B column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      BColumnPaddingLeft: {
        type: 'number',
        scope: 'layout',
        title: 'B column padding left',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      BColumnPaddingRight: {
        type: 'number',
        scope: 'layout',
        title: 'B column padding right',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      CColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'C column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      CColumnPaddingLeft: {
        type: 'number',
        scope: 'layout',
        title: 'C column padding left',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      CColumnPaddingRight: {
        type: 'number',
        scope: 'layout',
        title: 'C column padding right',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      DColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'D column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      DColumnPaddingLeft: {
        type: 'number',
        scope: 'layout',
        title: 'D column padding left',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      DColumnPaddingRight: {
        type: 'number',
        scope: 'layout',
        title: 'D column padding right',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      EColumnWidth: {
        type: 'number',
        scope: 'layout',
        title: 'E column width',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      EColumnPaddingLeft: {
        type: 'number',
        scope: 'layout',
        title: 'E column padding left',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      EColumnPaddingRight: {
        type: 'number',
        scope: 'layout',
        title: 'E column padding right',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      AColumnPaddingBottom: {
        type: 'number',
        scope: 'layout',
        title: 'A column padding bottom',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      BColumnPaddingBottom: {
        type: 'number',
        scope: 'layout',
        title: 'B column padding bottom',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      CColumnPaddingBottom: {
        type: 'number',
        scope: 'layout',
        title: 'C column padding bottom',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      DColumnPaddingBottom: {
        type: 'number',
        scope: 'layout',
        title: 'D column padding bottom',
        min: 0,
        max: 100,
        display: { type: 'range-control' },
      },
      EColumnPaddingBottom: {
        type: 'number',
        scope: 'layout',
        title: 'E column padding bottom',
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
      showVisibility: [false, true],
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
        type: 'B',
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
        rowPaddingTopB: 0.01,
        AColumnWidth: 0.2,
        AColumnPaddingLeft: 0,
        AColumnPaddingRight: 0,
        BColumnWidth: 0.2,
        BColumnPaddingLeft: 0,
        BColumnPaddingRight: 0,
        CColumnWidth: 0.2,
        CColumnPaddingLeft: 0,
        CColumnPaddingRight: 0,
        DColumnWidth: 0.2,
        DColumnPaddingLeft: 0,
        DColumnPaddingRight: 0,
        EColumnWidth: 0.2,
        EColumnPaddingLeft: 0,
        EColumnPaddingRight: 0,
        AColumnPaddingBottom: 0,
        BColumnPaddingBottom: 0,
        CColumnPaddingBottom: 0,
        DColumnPaddingBottom: 0,
        EColumnPaddingBottom: 0,
        columnsOrder: ['AColumn', 'BColumnWidth', 'CColumnWidth', 'DColumnWidth', 'EColumnWidth'],
        textStroke: 0.003,
        textCorners: 0.192,
        textPadding: { top: 0.0373, right: 0.0373, bottom: 0.0373, left: 0.0373 },
        textFontSize: 0.043,
        textLineHeight: 0.043,
      },
      d: {
        columns: 5,
        type: 'A',
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
        rowPaddingTopB: 0.01,
        AColumnWidth: 0.2,
        AColumnPaddingLeft: 0,
        AColumnPaddingRight: 0,
        BColumnWidth: 0.2,
        BColumnPaddingLeft: 0,
        BColumnPaddingRight: 0,
        CColumnWidth: 0.2,
        CColumnPaddingLeft: 0,
        CColumnPaddingRight: 0,
        DColumnWidth: 0.2,
        DColumnPaddingLeft: 0,
        DColumnPaddingRight: 0,
        EColumnWidth: 0.2,
        EColumnPaddingLeft: 0,
        EColumnPaddingRight: 0,
        AColumnPaddingBottom: 0,
        BColumnPaddingBottom: 0,
        CColumnPaddingBottom: 0,
        DColumnPaddingBottom: 0,
        EColumnPaddingBottom: 0,
        columnsOrder: ['AColumn', 'BColumnWidth', 'CColumnWidth', 'DColumnWidth', 'EColumnWidth'],
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
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.AColumnWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.AColumnPaddingLeft.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.AColumnPaddingRight.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.BColumnWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.BColumnPaddingLeft.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.BColumnPaddingRight.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.CColumnWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.CColumnPaddingLeft.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.CColumnPaddingRight.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.DColumnWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.DColumnPaddingLeft.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.DColumnPaddingRight.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.EColumnWidth.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.EColumnPaddingLeft.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.EColumnPaddingRight.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.rowPaddingTop.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'B' },
        then: { name: 'properties.rowPaddingBottom.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.rowPaddingTopB.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.AColumnPaddingBottom.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.BColumnPaddingBottom.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.CColumnPaddingBottom.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.DColumnPaddingBottom.display.visible', value: false },
      },
      {
        if: { name: 'type', value: 'A' },
        then: { name: 'properties.EColumnPaddingBottom.display.visible', value: false },
      },
    ],
    layout: [
      '__componentName__',
      'name',
      'type',
      'columns',
      'wrapperWidth',
      'entriesCount',
      'cellMinHeight',
      'imageOnHover',
      'imageSize',
      'dividerWidth',
      'showVisibility',
      'cut',
      'showCut',
      'cutCellMinHeight',
      'entryHoverEffect',
      'cutLabel',
      'rowPaddingTop',
      'rowPaddingBottom',
      'rowPaddingTopB',
      'AColumnWidth',
      'AColumnPaddingLeft',
      'AColumnPaddingRight',
      'AColumnPaddingBottom',
      'BColumnWidth',
      'BColumnPaddingLeft',
      'BColumnPaddingRight',
      'BColumnPaddingBottom',
      'CColumnWidth',
      'CColumnPaddingLeft',
      'CColumnPaddingRight',
      'CColumnPaddingBottom',
      'DColumnWidth',
      'DColumnPaddingLeft',
      'DColumnPaddingRight',
      'DColumnPaddingBottom',
      'EColumnWidth',
      'EColumnPaddingLeft',
      'EColumnPaddingRight',
      'EColumnPaddingBottom',
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
        'type',
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
        {type: 'row', title: '', items: ['entryHoverEffect']},
        {
          type: 'row',
          title: 'Divider Settings',
          items: ['dividerWidth', 'showVisibility']
        },
        {type: 'row', title: '', items: ['cut']},
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
