import { Testimonials } from './TestimonialSingle';
import { ComponentSchemaV1 } from '../../types/SchemaV1';
import testimonialSingleSourceRaw from './TestimonialSingle.tsx?raw';

const schema: ComponentSchemaV1 = {
  type: 'object',
  version: 1,
  settings: {
    sizing: 'auto manual',
    properties: {
      general: {
        type: 'object',
        scope: 'common',
        properties: {
          autoplay: {
            type: 'string',
            scope: 'common',
            title: 'Autoplay',
            display: { type: 'ratio-group', direction: 'horizontal' },
            enum: ['on', 'off'],
          },
          move: {
            type: 'string',
            scope: 'common',
            title: 'Move',
            display: { type: 'ratio-group', direction: 'horizontal' },
            enum: ['one', 'view'],
          },
          speed: {
            type: ['string', 'null'] as const,
            scope: 'common',
            title: 'Speed',
            display: { type: 'step-selector' },
            enum: ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s'],
          },
          direction: {
            type: 'string',
            scope: 'common',
            display: { type: 'ratio-group' },
            enum: ['left', 'right'],
          },
          pause: {
            title: 'Pause on',
            type: 'string',
            scope: 'common',
            display: { type: 'ratio-group' },
            enum: ['hover', 'click', 'off'],
          },
          controls: {
            title: 'controls',
            type: 'object',
            scope: 'common',
            properties: {
              isActive: {
                type: 'string',
                scope: 'common',
                title: 'Controls',
                display: { type: 'ratio-group', direction: 'vertical' },
                enum: ['visible', 'hidden'],
              },
              arrowsImgUrl: {
                type: ['string', 'null'] as const,
                scope: 'common',
                display: { type: 'settings-image-input' },
              },
              align: {
                display: { type: 'align-grid', direction: 'horizontal' },
                scope: 'common',
                type: 'string',
                enum: [
                  'top-left',
                  'top-center',
                  'top-right',
                  'middle-left',
                  'middle-center',
                  'middle-right',
                  'bottom-left',
                  'bottom-center',
                  'bottom-right',
                ],
              },
              gap: {
                type: 'number',
                scope: 'layout',
                title: 'Gap',
                display: { type: 'numeric-input' },
              },
              scale: {
                type: 'number',
                scope: 'layout',
                title: 'scale',
                min: 50,
                max: 600,
                display: { type: 'range-control' },
              },
              color: {
                title: 'color',
                type: 'string',
                scope: 'common',
                display: { type: 'settings-color-picker', format: 'single' },
              },
              hover: {
                title: 'hover',
                type: 'string',
                scope: 'common',
                display: { type: 'settings-color-picker', format: 'single' },
              },
            },
          },
          gradientCorners: {
            type: 'object',
            scope: 'common',
            title: '',
            display: { type: 'group' },
            properties: {
              active: {
                type: 'string',
                scope: 'common',
                title: 'Corners',
                display: { type: 'ratio-group', direction: 'vertical' },
                enum: ['gradient', 'none'],
              },
              color: {
                type: 'string',
                scope: 'common',
                title: 'Gradient',
                display: { type: 'settings-color-picker', format: 'single' },
              },
            },
          },
        },
      },
      card: {
        type: 'object',
        scope: 'common',
        properties: {
          dimensions: {
            type: 'object',
            scope: 'common',
            title: 'Size',
            display: { type: 'group' },
            properties: {
              width: {
                type: 'number',
                scope: 'layout',
                display: { type: 'numeric-input', visible: true },
              },
              height: {
                type: 'number',
                scope: 'layout',
                title: 'Min Height',
                display: { type: 'numeric-input', visible: true },
              },
            },
          },
          gap: {
            type: 'number',
            scope: 'layout',
            title: 'Gap',
            min: 0,
            display: { type: 'numeric-input' },
          },
          corner: {
            type: 'number',
            scope: 'layout',
            title: 'Corners',
            min: 0,
            display: { type: 'numeric-input' },
          },
          borders: {
            type: 'object',
            scope: 'common',
            title: 'Borders',
            display: { type: 'group' },
            properties: {
              width: {
                type: 'number',
                scope: 'layout',
                min: 0,
                display: { type: 'numeric-input' },
              },
              color: {
                type: 'string',
                scope: 'common',
                display: { type: 'settings-color-picker', format: 'single' },
              },
            },
          },
          bgColor: {
            title: 'BG color',
            type: 'string',
            scope: 'common',
            display: { type: 'settings-color-picker', format: 'single' },
          },
          padding: {
            type: 'object',
            scope: 'layout',
            title: 'Padding',
            display: { type: 'padding-controls' },
          },
          dropShadow: {
            type: 'object',
            scope: 'common',
            title: 'Shadow',
            display: { type: 'group' },
            properties: {
              active: {
                type: 'string',
                scope: 'common',
                title: 'active',
                display: { type: 'ratio-group', direction: 'horizontal' },
                enum: ['on', 'off'],
              },
              right: {
                type: 'number',
                scope: 'layout',
                display: { type: 'numeric-input' },
              },
              down: {
                type: 'number',
                scope: 'layout',
                display: { type: 'numeric-input' },
              },
              blur: {
                type: 'number',
                scope: 'layout',
                display: { type: 'numeric-input' },
              },
              spread: {
                type: 'number',
                scope: 'layout',
                title: 'Spread',
                display: { type: 'numeric-input' },
              },
              color: {
                title: 'color',
                type: 'string',
                scope: 'common',
                display: { type: 'settings-color-picker', format: 'single' },
              },
            },
          },
        },
      },
      elements: {
        title: 'elements',
        type: 'object',
        scope: 'common',
        properties: {
          elements: {
            type: 'object',
            scope: 'common',
            display: { type: 'order-selector' },
            properties: {
              order: {
                type: 'array',
                scope: 'common',
                items: { type: 'string', enum: ['text', 'icon', 'caption'] },
              },
              active: {
                type: 'string',
                scope: 'common',
                enum: ['text', 'icon', 'caption'],
              },
            },
          },
          text: {
            type: 'object',
            scope: 'common',
            display: { type: 'group' },
            properties: {
              minHeight: {
                type: 'number',
                scope: 'layout',
                title: 'Min Height',
                display: { type: 'numeric-input' },
              },
              margin: {
                type: 'object',
                scope: 'layout',
                title: 'Margin',
                display: { type: 'group', visible: false },
                properties: {
                  top: {
                    type: 'number',
                    scope: 'layout',
                    title: 'Top',
                    min: 0,
                    display: { type: 'numeric-input', visible: false },
                  },
                },
              },
            },
          },
          icon: {
            type: 'object',
            scope: 'common',
            display: { type: 'group' },
            properties: {
              margin: {
                type: 'object',
                scope: 'layout',
                title: 'Margin',
                display: { type: 'group', visible: false },
                properties: {
                  top: {
                    type: 'number',
                    scope: 'layout',
                    title: 'Top',
                    min: 0,
                    display: { type: 'numeric-input', visible: false },
                  },
                },
              },
              align: {
                type: 'string',
                scope: 'common',
                title: 'Align',
                enum: ['left', 'center', 'right'],
                display: { type: 'align-group', direction: 'vertical' },
              },
              scale: {
                type: 'number',
                scope: 'layout',
                title: 'scale',
                min: 50,
                max: 600,
                display: { type: 'range-control', visible: false },
              },
            },
          },
          caption: {
            type: 'object',
            scope: 'common',
            display: { type: 'group' },
            properties: {
              minHeight: {
                type: 'number',
                scope: 'layout',
                title: 'Min Height',
                display: { type: 'numeric-input' },
              },
              margin: {
                type: 'object',
                scope: 'layout',
                title: 'Margin',
                display: { type: 'group', visible: false },
                properties: {
                  top: {
                    type: 'number',
                    scope: 'layout',
                    title: 'Top',
                    min: 0,
                    display: { type: 'numeric-input', visible: false },
                  },
                },
              },
            },
          },
        },
      },
      styles: {
        type: 'object',
        scope: 'common',
        properties: {
          imageCaption: {
            type: 'object',
            scope: 'common',
            properties: {
              fontSettings: {
                type: 'object',
                scope: 'common',
                display: { type: 'font-settings' },
                properties: {
                  fontFamily: { type: 'string', scope: 'common' },
                  fontWeight: { type: 'number', scope: 'common' },
                  fontStyle: { type: 'string', scope: 'common' },
                },
              },
              widthSettings: {
                display: { type: 'text-width-control' },
                type: 'object',
                scope: 'common',
                properties: {
                  width: { type: 'number', scope: 'layout' },
                  sizing: { type: 'string', scope: 'common', enum: ['auto', 'manual'] },
                },
              },
              fontSizeLineHeight: {
                type: 'object',
                scope: 'common',
                display: { type: 'font-size-line-height' },
                properties: {
                  fontSize: { type: 'number', scope: 'layout' },
                  lineHeight: { type: 'number', scope: 'layout' },
                },
              },
              letterSpacing: {
                display: { type: 'letter-spacing-input' },
                type: 'number',
                scope: 'layout',
              },
              wordSpacing: {
                display: { type: 'word-spacing-input' },
                type: 'number',
                scope: 'layout',
              },
              textAlign: {
                display: { type: 'text-align-control' },
                type: 'string',
                scope: 'common',
                enum: ['left', 'center', 'right'],
              },
              textAppearance: {
                display: { type: 'text-appearance' },
                type: 'object',
                scope: 'common',
                properties: {
                  textTransform: { type: 'string', scope: 'common', enum: ['none', 'uppercase', 'lowercase'] },
                  textDecoration: { type: 'string', scope: 'common', enum: ['none', 'underline'] },
                  fontVariant: { type: 'string', scope: 'common', enum: ['normal', 'small-caps'] },
                },
              },
              color: {
                display: { type: 'style-panel-color-picker' },
                type: 'string',
                scope: 'common',
              },
            },
          },
          caption: {
            type: 'object',
            scope: 'common',
            properties: {
              fontSettings: {
                type: 'object',
                scope: 'common',
                display: { type: 'font-settings' },
                properties: {
                  fontFamily: { type: 'string', scope: 'common' },
                  fontWeight: { type: 'number', scope: 'common' },
                  fontStyle: { type: 'string', scope: 'common' },
                },
              },
              widthSettings: {
                display: { type: 'text-width-control' },
                type: 'object',
                scope: 'common',
                properties: {
                  width: { type: 'number', scope: 'layout' },
                  sizing: { type: 'string', scope: 'common', enum: ['auto', 'manual'] },
                },
              },
              fontSizeLineHeight: {
                type: 'object',
                scope: 'common',
                display: { type: 'font-size-line-height' },
                properties: {
                  fontSize: { type: 'number', scope: 'layout' },
                  lineHeight: { type: 'number', scope: 'layout' },
                },
              },
              letterSpacing: {
                display: { type: 'letter-spacing-input' },
                type: 'number',
                scope: 'layout',
              },
              wordSpacing: {
                display: { type: 'word-spacing-input' },
                type: 'number',
                scope: 'layout',
              },
              textAlign: {
                display: { type: 'text-align-control' },
                type: 'string',
                scope: 'common',
                enum: ['left', 'center', 'right'],
              },
              textAppearance: {
                display: { type: 'text-appearance' },
                type: 'object',
                scope: 'common',
                properties: {
                  textTransform: { type: 'string', scope: 'common', enum: ['none', 'uppercase', 'lowercase'] },
                  textDecoration: { type: 'string', scope: 'common', enum: ['none', 'underline'] },
                  fontVariant: { type: 'string', scope: 'common', enum: ['normal', 'small-caps'] },
                },
              },
              color: {
                display: { type: 'style-panel-color-picker' },
                type: 'string',
                scope: 'common',
              },
            },
          },
        },
      },
    },
    defaults: {
      general: {
        autoplay: 'off',
        move: 'one',
        speed: '5s',
        direction: 'left',
        pause: 'off',
        controls: {
          isActive: 'hidden',
          arrowsImgUrl: null,
          align: 'top-center',
          gap: 0.02,
          scale: 100,
          color: '#000000',
          hover: '#cccccc',
        },
        gradientCorners: {
          active: 'none',
          color: '#ffffff',
        },
      },
      card: {
        dimensions: {
          width: 0.15,
          height: 0.2,
        },
        gap: 0.02,
        corner: 0.005,
        borders: {
          width: 0.001,
          color: '#000000',
        },
        bgColor: 'rgba(255, 255, 255, 0.2)',
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        dropShadow: {
          active: 'on',
          right: 0,
          down: 0,
          spread: 0,
          blur: 0,
          color: '#000000',
        },
      },
      elements: {
        elements: {
          order: ['text', 'icon', 'caption'],
          active: 'text',
        },
        text: {
          minHeight: 0.01,
          margin: { top: 0 },
        },
        icon: {
          margin: { top: 0 },
          scale: 100,
          align: 'left',
        },
        caption: {
          minHeight: 0.01,
          margin: { top: 0 },
        },
      },
      styles: {
        imageCaption: {
          widthSettings: { width: 0.13, sizing: 'manual' },
          fontSettings: { fontFamily: 'Arial', fontWeight: 400, fontStyle: 'normal' },
          fontSizeLineHeight: { fontSize: 0.01, lineHeight: 0.01 },
          letterSpacing: 0,
          wordSpacing: 0,
          textAlign: 'left',
          textAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
          color: '#000000',
        },
        caption: {
          widthSettings: { width: 0.13, sizing: 'manual' },
          fontSettings: { fontFamily: 'Arial', fontWeight: 400, fontStyle: 'normal' },
          fontSizeLineHeight: { fontSize: 0.01, lineHeight: 0.01 },
          letterSpacing: 0,
          wordSpacing: 0,
          textAlign: 'left',
          textAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
          color: '#000000',
        },
      },
    },
    displayRules: [
      {
        if: { name: 'general.autoplay', value: 'off' },
        then: { name: 'properties.general.properties.move.display.visible', value: true },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.move.display.visible', value: false },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.direction.display.visible', value: true },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.pause.display.visible', value: true },
      },
      {
        if: { name: 'general.autoplay', value: 'off' },
        then: { name: 'properties.general.properties.direction.display.visible', value: false },
      },
      {
        if: { name: 'general.autoplay', value: 'off' },
        then: { name: 'properties.general.properties.pause.display.visible', value: false },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.controls.properties.isActive.display.visible', value: false },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.controls.properties.arrowsImgUrl.display.visible', value: false },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.controls.properties.scale.display.visible', value: false },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.controls.properties.color.display.visible', value: false },
      },
      {
        if: { name: 'general.autoplay', value: 'on' },
        then: { name: 'properties.general.properties.controls.properties.hover.display.visible', value: false },
      },
      {
        if: { name: 'elements.elements.active', value: 'text' },
        then: { name: 'properties.elements.properties.text.properties.minHeight.display.visible', value: true },
      },
      {
        if: { name: 'elements.elements.active', value: 'text' },
        then: { name: 'properties.elements.properties.caption.properties.minHeight.display.visible', value: false },
      },
      {
        if: { name: 'elements.elements.active', value: 'caption' },
        then: { name: 'properties.elements.properties.caption.properties.minHeight.display.visible', value: true },
      },
      {
        if: { name: 'elements.elements.active', value: 'caption' },
        then: { name: 'properties.elements.properties.text.properties.minHeight.display.visible', value: false },
      },
      {
        if: { name: 'elements.elements.active', value: 'caption' },
        then: { name: 'properties.elements.properties.icon.properties.align.display.visible', value: false },
      },
      {
        if: { name: 'elements.elements.active', value: 'text' },
        then: { name: 'properties.elements.properties.icon.properties.align.display.visible', value: false },
      },
      {
        if: { name: 'elements.elements.active', value: 'icon' },
        then: { name: 'properties.elements.properties.text.properties.minHeight.display.visible', value: false },
      },
      {
        if: { name: 'elements.elements.active', value: 'icon' },
        then: { name: 'properties.elements.properties.caption.properties.minHeight.display.visible', value: false },
      },
      {
        if: { name: 'elements.elements.active', value: 'icon' },
        then: { name: 'properties.elements.properties.icon.properties.scale.display.visible', value: true },
      },
      {
        if: { name: 'elements.elements.active', value: 'icon' },
        then: { name: 'properties.elements.properties.icon.properties.align.display.visible', value: true },
      },
    ],
    layout: ['__componentName__', 'general', 'card', 'elements', 'styles'],
  },
  content: {
    properties: {
      items: {
        type: 'array',
        scope: 'common',
        display: {
          type: 'content-items',
          addItemFromFileExplorer: false,
          defaultWidth: 500,
        },
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'object',
              title: 'Image',
              display: { minWidth: 58, maxWidth: 108, type: 'media-input' },
              properties: {
                url: { type: 'string' },
                name: { type: 'string' },
                objectFit: { type: 'string', enum: ['cover', 'contain'] },
              },
            },
            icon: {
              type: 'object',
              title: 'Icon',
              display: { minWidth: 58, maxWidth: 108, type: 'media-input' },
              properties: {
                url: { type: 'string' },
                name: { type: 'string' },
                objectFit: { type: 'string', enum: ['cover', 'contain'] },
              },
            },
            imageCaption: {
              type: 'object',
              title: 'Text',
              display: { type: 'rich-text', minWidth: 300, maxWidth: 550 },
            },
            caption: {
              type: 'object',
              title: 'Caption',
              display: { type: 'rich-text', minWidth: 300, maxWidth: 550 },
            },
          },
        },
      },
    },
    defaults: {
      items: [
        {
          image: {},
          icon: {
            objectFit: 'cover',
            url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
            name: '',
          },
          imageCaption: [
            {
              type: 'paragraph',
              children: [{ text: 'Innovative solutions redefine connectivity, enhancing user experience through seamless digital integration and efficiency.' }],
            },
          ],
          caption: [
            {
              type: 'paragraph',
              children: [{ text: 'CEO @ Company' }],
            },
          ],
        },
        {
          image: {},
          icon: {
            objectFit: 'cover',
            url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
            name: '',
          },
          imageCaption: [
            {
              type: 'paragraph',
              children: [{ text: 'In the realm of digital innovation, transformative algorithms redefine connectivity, propelling unprecedented technological advancements.' }],
            },
          ],
          caption: [
            {
              type: 'paragraph',
              children: [{ text: 'CEO @ Company' }],
            },
          ],
        },
        {
          image: {},
          icon: {
            objectFit: 'cover',
            url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
            name: '',
          },
          imageCaption: [
            {
              type: 'paragraph',
              children: [{ text: 'Harnessing innovative algorithms, this paradigm shift enhances computational efficiency and optimizes data processing frameworks.' }],
            },
          ],
          caption: [
            {
              type: 'paragraph',
              children: [{ text: 'CEO @ Company' }],
            },
          ],
        },
      ],
    },
  },
};

export const TestimonialSingleComponent = {
  element: Testimonials,
  id: 'testimonials single',
  name: 'Testimonial Single',
  version: 1,
  preview: {
    type: 'image' as const,
    url: 'https://cdn.cntrl.site/component-assets/testimonials.png',
  },
  defaultSize: {
    width: 700,
    height: 300,
  },
  schema,
  sourceCode: testimonialSingleSourceRaw,
};

