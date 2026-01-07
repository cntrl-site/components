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
    width: '100%',
    height: '100%'
  },
  schema: {
    type: 'object',
    properties: {
      settings: {
        layoutBased: true,
        type: 'object',
        display: {
          type: 'settings-block',
        },
        properties: {
          imageSize: {
            title: 'IMG SIZE',
            icon: 'size',
            tooltip: 'IMG SIZE',
            type: 'object',
            properties: {
              sizeType: {
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
            title: 'cursor',
            icon: 'cursor',
            tooltip: 'cursor',
            type: 'object',
            properties: {
              cursorType: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['system', 'custom']
              },
              defaultCursor: {
                type: ['string', 'null'],
                title: 'Default',
                display: {
                  type: 'settings-image-input',
                  visible: false
                },
              },
              defaultCursorScale: {
                type: 'number',
                title: 'Scale',
                min: 1,
                max: 5,
                step: 0.1,
                display: {
                  type: 'range-control',
                  visible: false
                },
              },
              hoverCursor: {
                type: ['string', 'null'],
                title: 'Hover',
                display: {
                  type: 'settings-image-input',
                  visible: false
                },
              },
              hoverCursorScale: {
                type: 'number',
                title: 'Scale',
                min: 1,
                max: 5,
                step: 0.1,
                display: {
                  type: 'range-control',
                  visible: false
                },
              },
            }
          },
          position: {
            title: 'position',
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
                title: 'Visible',
                display: {
                  type: 'ratio-group'
                },
                enum: ['all', 'last One']
              },
              target: {
                type: 'string',
                title: 'Target',
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
            defaultCursorScale: 2,
            hoverCursor: null,
            hoverCursorScale: 2
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
            if: [
              { name: 'position.target', value: 'image' },
              { name: 'cursor.cursorType', value: 'custom' },
              { name: 'cursor.defaultCursor', value: null, isNotEqual: true }
            ],
            then: {
              name: 'properties.cursor.properties.defaultCursorScale.display.visible',
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
          {
            if: [
              { name: 'cursor.cursorType', value: 'custom' },
              { name: 'cursor.hoverCursor', value: null, isNotEqual: true }
            ],
            then: {
              name: 'properties.cursor.properties.hoverCursorScale.display.visible',
              value: true
            }
          },
        ]
      },
      content: {
        layoutBased: false,
        type: 'array',
        settings: {
          addItemFromFileExplorer: true,
          defaultWidth: 500
        },
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'object',
              label: 'Image',
              display: {
                isObjectFitEditable: false,
                minWidth: 58,
                maxWidth: 108,
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
              label: 'URL',
              placeholder: 'Enter link...',
              display: {
                type: 'text-input',
                minWidth: 300,
                maxWidth: 550
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
