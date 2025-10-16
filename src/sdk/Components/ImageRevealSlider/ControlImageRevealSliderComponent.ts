import { Component } from '../../types/component/Component';
import { ImageRevealSlider } from './ImageRevealSlider';

export const ControlImageRevealSliderComponent = {
  element: ImageRevealSlider,
  id: 'control-image-reveal',
  name: 'Click Gallery',
  preview: {
    type: 'video' as const,
    url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7EQ3WSW43JG5YMC8B2HTPKT.mp4'
  },
  defaultSize: {
    width: 700,
    height: 400,
  },
  schema: {
    type: 'object',
    properties: {
      settings: {
        layoutBased: true,
        type: 'object',
        properties: {
          imageSize: {
            name: 'IMG SIZE',
            icon: 'size',
            tooltip: 'IMG SIZE',
            type: 'object',
            properties: {
              sizeType: {
                name: 'sizeType',
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['as Is', 'custom', 'random']
              },
              imageWidth: {
                type: 'number',
                label: 'W',
                display: {
                  type: 'numeric-input',
                  visible: false
                },
              },
              randomRangeImageWidth: {
                type: 'object',
                display: {
                  type: 'random-range-controls',
                  visible: false
                },
                properties: {
                  min: {
                    type: 'number',
                  },
                  max: {
                    type: 'number',
                  }
                }
              },
            }
          },
          cursor: {
            name: 'cursor',
            icon: 'cursor',
            tooltip: 'cursor',
            type: 'object',
            properties: {
              cursorType: {
                name: 'cursorType',
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['system', 'custom']
              },
              defaultCursor: {
                type: ['string', 'null'],
                display: {
                  type: 'settings-image-input',
                  title: 'Default',
                  visible: false
                },
              },
              hoverCursor: {
                type: ['string', 'null'],
                display: {
                  type: 'settings-image-input',
                  title: 'Hover',
                  visible: false
                },
              },
            }
          },
          position: {
            name: 'position',
            icon: 'transition',
            tooltip: 'Position',
            type: 'object',
            properties: {
              revealPosition: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['random', 'same', 'on Click']
              },
              visible: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['all', 'last One']
              },
              target: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['area', 'image']
              },
            }
          }
        },
        default: {
          imageSize: {
            sizeType: 'custom',
            imageWidth: 500,
            randomRangeImageWidth: {
              min: 100,
              max: 1000
            }
          },
          cursor: {
            cursorType: 'system',
            defaultCursor: null,
            hoverCursor: null
          },
          position: {
            revealPosition: 'random',
            visible: 'all',
            target: 'area',
          }
        },
        displayRules: [
          {
            if: {
              name: 'imageSize.sizeType',
              value: 'custom'
            },
            then: {
              name: 'properties.imageSize.properties.imageWidth.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'imageSize.sizeType',
              value: 'random'
            },
            then: {
              name: 'properties.imageSize.properties.randomRangeImageWidth.display.visible',
              value: true
            }
          },
          {
            if: [
              { name: 'position.target', value: 'image' },
              { name: 'cursor.cursorType', value: 'custom' },
            ],
            then: {
              name: 'properties.cursor.properties.defaultCursor.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'cursor.cursorType',
              value: 'custom'
            },
            then: {
              name: 'properties.cursor.properties.hoverCursor.display.visible',
              value: true
            }
          },
        ]
      },
      content: {
        layoutBased: false,
        type: 'array',
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'object',
              display: {
                type: 'media-input',
                isObjectFitEditable: false,
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
              display: {
                type: 'text-input',
                placeholder: 'Enter link...'
              }
            }
          },
          required: ['image']
        },
        default: [
          {
            image: {
              objectFit: "cover",
              url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png",
              name: "Slider-1.png"
            },
            link: "",
          },
          {
            image: {
              objectFit: "cover",
              url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQMFT72JD18WKP0Q2DVAT.png",
              name: "Slider-2.png"
            },
            link: "",
          },
          {
            image: {
              objectFit: "cover",
              url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQNEVRXPSRX5K1YTMJQY9.png",
              name: "Slider-3.png"
            },
            link: "",
          },
          {
            image: {
              objectFit: "cover",
              url: "https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQP84JKRDT7WNWDQZR4Y9.png",
              name: "Slider-4.png"
            },
            link: "",
          }
        ]
      },
    }
  }
};
