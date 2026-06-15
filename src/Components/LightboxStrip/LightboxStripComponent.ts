import { LightboxStrip } from './LightboxStrip';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import lightboxStripSourceRaw from './LightboxStrip.tsx?raw';

const defaultCloseIconUrl = 'https://cdn.cntrl.site/component-assets/Close.svg';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    // sizing: 'auto manual',
    properties: {
      cover: {
        type: 'string',
        scope: 'common',
        title: '',
        display: { type: 'settings-image-input' },
      },
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
      thumbnailObjectFit: {
        type: 'string',
        scope: 'common',
        title: 'Display',
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
      textMaxWidth: {
        type: 'string',
        scope: 'common',
        title: 'Max Width',
        display: { type: 'full-width-input' },
        min: 0,
        max: 1,
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
      cover: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
      objectFit: 'cover',
      closeIcon: {
        icon: defaultCloseIconUrl,
      },
      closeIconColor: '#ffffff',
      closeIconHoverColor: '#cccccc',
      thumbnailVisibility: 'on',
      thumbnailSize: 'S',
      thumbnailObjectFit: 'contain',
      thumbnailTrigger: 'click',
      thumbnailActive: 'invert',
      textColor: '#ffffff',
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
        textMaxWidth: 0.4,
        closeIconMaxWidth: 0.06,
        backgroundColor: 'rgba(28, 31, 34, 0.9)',
      },
      d: {
        thumbnailGap: 0.02,
        textMaxWidth: 0.4,
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
        { type: 'row', title: 'Thumbnails', items: ['thumbnailVisibility', 'thumbnailObjectFit']},
        { type: 'row', items: ['thumbnailTrigger', 'thumbnailActive']},
        { type: 'row', title: 'Cover', items: ['cover'] },
        { type: 'row', title: 'Text', items: ['textMaxWidth'] },
        { type: 'row', title: 'Close icon', items: ['closeIcon', 'closeIconMaxWidth'] },
      ],
    },
    {
      id: 'typeStyle',
      icon: 'text-icon',
      title: 'Type Style',
      tooltip: 'Typography',
      layout: [
        'textFontFamily',
        { type: 'group', title: '', items: ['textColor', { type: 'row', items: ['textFontSize', 'textLineHeight'] }, { type: 'row', items: ['textFontWeight', 'textLetterSpacing'] }] },
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
            supportsMainImage: true,
          },
        },
        text: {
          type: 'string',
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
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZNCQFC3T744H0KX6R3FR.jpeg',
          name: '',
          objectFit: 'contain',
        },
        text: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7RZRTSS60YBFT6Y37ZX00T.jpeg',
          name: '',
          objectFit: 'contain',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ9M9YJPQ5JWKCHDEW5M1GJD.jpeg',
          name: '',
          objectFit: 'contain',
        },
      },
      {
        image: {
          url: 'https://cdn.cntrl.site/projects/01KM5KBNFNRT3D0JP64K5EY92A/articles-assets/01KQ7S04EHBXQS1T4KVAMZNZQM.jpeg',
          name: '',
          objectFit: 'contain',
        },
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
