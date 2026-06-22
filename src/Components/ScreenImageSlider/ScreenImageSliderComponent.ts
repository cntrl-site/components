import { ScreenImageSlider } from './ScreenImageSlider';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import screenImageSliderSourceRaw from './ScreenImageSlider.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'manual',
    properties: {
      imageWidth: {
        type: 'number',
        scope: 'layout',
        title: 'Width',
        min: 10,
        max: 100,
        display: { type: 'range-control' },
      },
      imageMaxHeight: {
        type: 'number',
        scope: 'layout',
        title: 'Max height',
        min: 10,
        max: 100,
        display: { type: 'range-control' },
      },
      imageRadius: {
        type: 'number',
        scope: 'layout',
        title: 'Corners',
        min: 0,
        max: 160,
        display: { type: 'range-control' },
      },
      backgroundColor: {
        type: 'string',
        scope: 'common',
        title: 'Background',
        display: { type: 'palette-color-picker' },
      },
      backdropScale: {
        type: 'number',
        scope: 'common',
        title: 'Previous scale',
        min: 1,
        max: 8,
        step: 0.1,
        display: { type: 'number' },
      },
      transitionDuration: {
        type: 'number',
        scope: 'common',
        title: 'Duration',
        min: 100,
        max: 2000,
        step: 50,
        display: { type: 'number' },
      },
    },
    defaults: {
      backgroundColor: 'oklch(1 0.0001 90 / 0)',
      backdropScale: 3.8,
      transitionDuration: 700,
    },
    layoutDefaults: {
      m: {
        imageWidth: 78,
        imageMaxHeight: 72,
        imageRadius: 0,
      },
      d: {
        imageWidth: 56,
        imageMaxHeight: 74,
        imageRadius: 0,
      },
    },
    layout: [
      '__componentName__',
      'imageWidth',
      'imageMaxHeight',
      'imageRadius',
      'backgroundColor',
      'backdropScale',
      'transitionDuration',
    ],
  },
  panels: [
    {
      id: 'controls',
      icon: 'controls',
      title: 'Controls',
      tooltip: 'Slider Controls',
      layout: [
        '__componentName__',
        { type: 'row', title: 'Current image', items: ['imageWidth', 'imageMaxHeight'] },
        { type: 'row', title: 'Transition', items: ['backdropScale', 'transitionDuration'] },
        { type: 'row', title: 'Surface', items: ['imageRadius', 'backgroundColor'] },
      ],
    },
  ],
  paletteBookmark: {
    items: ['backgroundColor'],
    panelIds: ['controls'],
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
            isObjectFitEditable: false,
            type: 'media-input',
          },
        },
      },
    },
    default: [
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
          name: 'Slider-1.png',
        },
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
          name: 'Slider-2.png',
        },
      },
      {
        image: {
          objectFit: 'cover',
          url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
          name: 'Slider-3.png',
        },
      },
    ],
  },
};

export const ScreenImageSliderComponent = {
  element: ScreenImageSlider,
  id: 'screen-image-slider',
  name: 'Stage Slider',
  category: 'galleries',
  version: 1,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/sliderImg.png',
  },
  defaultSize: {
    width: '100%',
    height: '100%',
  },
  schema,
  sourceCode: screenImageSliderSourceRaw,
  assetsPaths: {
    content: [{ path: 'image.url', placeholderEnabled: true }],
    parameters: [],
  },
  fontSettingsPaths: {
    content: [],
    parameters: [],
  },
};
