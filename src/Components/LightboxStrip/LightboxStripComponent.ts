import { LightboxStrip } from './LightboxStrip';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import lightboxStripSourceRaw from './LightboxStrip.tsx?raw';

const defaultCloseIconUrl = 'https://cdn.cntrl.site/component-assets/Close.svg';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      thumbnailGap: {
        type: 'number',
        scope: 'layout',
        title: 'Thumbnail Gap',
        min: 0,
        max: 200,
        display: { type: 'range-control' },
      },
      backgroundColor: {
        type: 'string',
        scope: 'layout',
        title: 'Background Color',
        display: { type: 'settings-color-picker' },
      },
      objectFit: {
        type: 'string',
        scope: 'common',
        title: 'Display',
        display: { type: 'toggle-cycle', enum: ['cover', 'contain'] },
      },
      closeIcon: {
        type: 'object',
        scope: 'common',
        title: 'Visibility',
        display: { type: 'button-icon-switch' },
        properties: {
          mode: {
            type: 'string',
            enum: ['On', 'Off'],
          },
          icon: {
            type: ['string', 'null'] as const,
            title: 'Icon',
            display: { type: 'settings-image-input' },
          },
        },
      },
      closeIconMaxWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Icon Max Width',
        display: { type:'full-width-input' },
        min: 0,
        max: 1,
      },
      closeIconPosition: {
        type: 'string',
        scope: 'common',
        title: 'Icon Position',
        display: { type: 'toggle-cycle', enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'] },
      },
      closeIconColor: {
        type: 'string',
        scope: 'common',
        title: 'Fill Close Icon',
        display: { type: 'settings-color-picker' },
      },
      closeIconHoverColor: {
        type: 'string',
        scope: 'common',
        title: 'Hover Close Icon',
        display: { type: 'settings-color-picker' },
      },
      thumbnailVisibility: {
        type: 'boolean',
        scope: 'common',
        title: 'Visibility',
        display: { type: 'toggle-cycle', enum: ['on', 'off'] },
      },
      thumbnailSize: {
        type: 'number',
        scope: 'common',
        title: 'Size',
        display: { type: 'toggle-cycle', enum: ['S', 'M', 'L'] },
      },
      thumbnailObjectFit: {
        type: 'string',
        scope: 'common',
        title: 'Object Fit',
        display: { type: 'toggle-cycle', enum: ['cover', 'contain'] },
      },
      thumbnailTrigger: {
        type: 'string',
        scope: 'common',
        title: 'Trigger',
        display: { type: 'toggle-cycle', enum: ['click', 'hover'] },
      },
      thumbnailActive: {
        type: 'boolean',
        scope: 'common',
        title: 'Active',
        display: { type: 'toggle-cycle', enum: ['invert', 'grayscale', 'scale-up'] },
      },
      textPosition: {
        type: 'string',
        scope: 'common',
        title: 'Text Position',
        display: { type: 'toggle-cycle', enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'] },
      },
      textPadding: {
        type: 'number',
        scope: 'common',
        title: 'Text Padding',
        display: { type: 'padding-controls' },
      },
      textColor: {
        type: 'string',
        scope: 'common',
        title: 'Text Color',
        display: { type: 'color-input' },
      },
      textFontSize: {
        type: 'number',
        scope: 'common',
        title: 'Text Font Size',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
      },
      textFontWeight: {
        type: 'number',
        scope: 'common',
        title: 'Text Font Weight',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
      },
      textFontFamily: {
        type: 'string',
        scope: 'common',
        title: 'Text Font Family',
        display: { type: 'full-width-input' },
      },
      textLineHeight: {
        type: 'number',
        scope: 'common',
        title: 'Text Line Height',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
      },
      textLetterSpacing: {
        type: 'number',
        scope: 'common',
        title: 'Text Letter Spacing',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
      },
    },
    defaults: {
      objectFit: 'cover',
      closeIcon: {
        mode: 'On',
        icon: defaultCloseIconUrl,
      },
      closeIconPosition: 'top-right',
      closeIconColor: '#ffffff',
      closeIconHoverColor: '#cccccc',
      thumbnailVisibility: 'on',
      thumbnailSize: 'S',
      thumbnailObjectFit: 'contain',
      thumbnailTrigger: 'click',
      thumbnailActive: 'invert',
      textPosition: 'top-left',
      textPadding: {
        top: 0.02,
        left: 0.02,
        right: 0.02,
        bottom: 0.02,
      },
      textColor: '#000000',
      textFontSize: 0.04,
      textFontWeight: 400,
      textFontFamily: 'Arial',
      textLineHeight: 1.5,
      textLetterSpacing: 0,
      textWordSpacing: 0,
      textTextAppearance: {
        textTransform: 'none',
        textDecoration: 'none',
        fontVariant: 'normal',
      },
    },
    layoutDefaults: {
      m: {
        thumbnailGap: 0.04,
        closeIconMaxWidth: 0.06,
        backgroundColor: 'rgba(28, 31, 34, 0.9)',
      },
      d: {
        thumbnailGap: 0.02,
        closeIconMaxWidth: 0.06,
        backgroundColor: 'rgba(28, 31, 34, 0.9)',
      },
    },
    layout: [
      '__componentName__',
      'thumbnailGap',
      'objectFit',
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
        { type: 'row', items: ['timing'] },
        { type: 'row', title: 'Thumbnails', items: ['thumbnailVisibility', 'thumbnailSize']},
        { type: 'row', items: ['thumbnailObjectFit', 'thumbnailTrigger']},
         'thumbnailActive',
        { type: 'row', title: 'Text', items: ['textPosition', 'textPadding'] },
        { type: 'row', title: 'Close icon', items: ['closeIcon'] },
        { type: 'row', items: ['closeIconPosition', 'closeIconMaxWidth'] }
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        'textFontFamily',
        'textFontSettings',
        { type: 'group', title: '', items: [ 'text', {type: 'row', items: ['textFontSize', 'textLineHeight', 'textLetterSpacing', 'textWordSpacing']}, 'textTextAppearance']},
      ],
    },
  ],
  paletteBookmark: {
    items: ['backgroundColor', 'textColor', 'closeIconColor', 'closeIconHoverColor'],
    panelIds: ['general', 'typeStyle'],
  },
  content: {
    type: 'array',
    settings: {
      addItemFromFileExplorer: true,
    },
    items: {
      type: 'object',
      properties: {
        image: {
          type: 'object',
          label: 'Image',
          display: {
            type: 'media-input',
          },
        },
        text: {
          type: 'string',
          label: 'Text',
          display: {
            type: 'text-input',
          },
        },
      },
    },
    default: [
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZNCQFC3T744H0KX6R3FR.jpeg',
          name: '',
          objectFit: 'contain',
        },
        text: 'Image 1',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZRTSS60YBFT6Y37ZX00T.jpeg',
          name: '',
          objectFit: 'contain',
        },
        text: 'Image 2',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ9M9YJPQ5JWKCHDEW5M1GJD.jpeg',
          name: '',
          objectFit: 'contain',
        },
        text: 'Image 3',
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7S04EHBXQS1T4KVAMZNZQM.jpeg',
          name: '',
          objectFit: 'contain',
        },
        text: 'Image 4',
      },
    ],
  },
};

export const LightboxStripComponent = {
  element: LightboxStrip,
  id: 'lightbox-strip',
  name: 'Lightbox Strip',
  category: 'galleries',
  version: 1,
  defaultSize: {
    d: {
      width: 350,
      height: 140,
    },
    m: {
      width: 390,
      height: 100,
    },
  },
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/Lightbox.png',
  },
  schema,
  sourceCode: lightboxStripSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
