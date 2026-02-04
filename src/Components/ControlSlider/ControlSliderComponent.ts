import { ControlSlider } from './ControlSlider';

export const ControlSliderComponent = {
  element: ControlSlider,
  id: 'control-slider',
  name: 'Slider',
  preview: {
    type: 'video' as const,
    url: 'https://cdn.cntrl.site/component-assets/Control-slider-preview.mp4',
  },
  defaultSize: {
    width: 400,
    height: 400
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
          triggers: {
            title: 'triggers',
            icon: 'target',
            tooltip: 'Triggers',
            type: 'object',
            properties: {
              triggersList: {
                type: 'object',
                display: {
                  type: 'toggle-ratio-group',
                },
                properties: {
                  click: {
                    type: 'boolean',
                  },
                  drag: {
                    type: 'boolean',
                  }
                }
              },
              autoPlay: {
                type: ['string', 'null'],
                label: 'Auto',
                display: {
                  type: 'step-selector',
                },
                enum: [null, '1s', '2s', '3s', '4s', '5s'],
              }
            }
          },
          direction: {
            icon: 'horizontal-resize',
            tooltip: 'Direction',
            type: 'string',
            display: {
              type: 'ratio-group'
            },
            enum: ['horiz', 'vert']
          },
          transition: {
            title: 'transit',
            icon: 'transition',
            tooltip: 'Transition',
            type: 'object',
            properties: {
              type: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['slide', 'fade in']
              },
              backgroundColor: {
                type: ['string', 'null'],
                title: 'BG Color',
                display: {
                  visible: false,
                  type: 'settings-color-picker',
                  format: 'single'
                }
              },
              duration: {
                type: 'string',
                label: 'icon:hourglass',
                display: {
                  type: 'step-selector',
                },
                enum: ['100ms', '250ms', '500ms', '1000ms', '1500ms', '2000ms'],
              }
            }
          },
          controls: {
            title: 'controls',
            icon: 'controls',
            tooltip: 'Controls',
            type: 'object',
            properties: {
              isActive: {
                type: 'boolean',
                display: {
                  type: 'setting-toggle',
                }
              },
              arrowsImgUrl: {
                type: ['string', 'null'],
                display: {
                  type: 'settings-image-input',
                },
              },
              offset: {
                type: 'object',
                title: 'Offset',
                display: {
                  type: 'group',
                },
                properties: {
                  x: {
                    type: 'number',
                    label: 'X',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                  y: {
                    type: 'number',
                    label: 'Y',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                }
              },
              scale: {
                type: 'number',
                title: 'scale',
                min: 50,
                max: 600,
                display: {
                  type: 'range-control',
                },
              },
              color: {
                title: 'color',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              },
              hover: {
                title: 'hover',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                },
              },
              show: {
                title: 'Show',
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['always', 'on hover']
              },
            },
          },
          pagination: {
            title: 'nav',
            icon: 'pagination',
            tooltip: 'Navigation',
            type: 'object',
            properties: {
              isActive: {
                type: 'boolean',
                display: {
                  type: 'setting-toggle',
                }
              },
              position: {
                display: {
                  type: 'socket',
                  direction: 'horizontal',
                },
                type: 'string',
                enum: ['outside-1', 'outside-2', 'inside-1', 'inside-2'],
              },
              offset: {
                type: 'object',
                title: 'Offset',
                display: {
                  type: 'group',
                },
                properties: {
                  x: {
                    type: 'number',
                    label: 'X',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                  y: {
                    type: 'number',
                    label: 'Y',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                }
              },
              scale: {
                type: 'number',
                title: 'scale',
                min: 10,
                max: 400,
                display: {
                  type: 'range-control',
                },
              },
              colors: {
                display: {
                  type: 'settings-color-picker',
                  format: 'multiple'
                },
                title: 'color',
                type: 'array',
                items: {
                  type: 'string',
                }
              },
              hover: {
                title: 'hover',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              }
            }
          },
          imageCaption: {
            title: 'Caption',
            icon: 'text-icon',
            tooltip: 'Caption',
            type: 'object',
            properties: {
              isActive: {
                type: 'boolean',
                display: {
                  type: 'setting-toggle',
                }
              },
              alignment: {                type: 'string',
                display: {
                  type: 'align-grid'
                },
                enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
              },
              offset: {
                type: 'object',
                title: 'Offset',
                display: {
                  type: 'group',
                },
                properties: {
                  x: {
                    type: 'number',
                    label: 'X',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                  y: {
                    type: 'number',
                    label: 'Y',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                }
              },
              linkColor: {
                title: 'Link Color',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              },
              hover: {
                title: 'Link Hover',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              }
            }
          }
        },
        default: {
          triggers: {
            triggersList: {
              click: false,
              drag: true,
            },
            autoPlay: null,
          },
          controls: {
            isActive: true,
            arrowsImgUrl: null,
            offset: {
              x: 0,
              y: 0
            },
            scale: 100,
            color: '#000000',
            hover: '#cccccc',
            show: 'always',
          },
          transition: {
            type: 'slide',
            duration: '500ms',
            backgroundColor: null,
          },
          pagination: {
            isActive: true,
            scale: 50,
            position: 'outside-1',
            offset: {
              x: 0,
              y: 0
            },
            colors: ['#cccccc', '#cccccc', '#000000'],
            hover: '#cccccc'
          },
          direction: 'horiz',
          imageCaption: {
            offset: {
              x: 0,
              y: 0
            },
            isActive: true,
            alignment: 'middle-center',
            linkColor: '#cccccc',
            hover: '#cccccc',
          }
        },
        displayRules: [
          {
            if: {
              name: 'direction',
              value: 'vert'
            },
            then: {
              name: 'properties.pagination.properties.position.display.direction',
              value: 'vertical'
            }
          },
          {
            if: {
              name: 'transition.type',
              value: 'fade in'
            },
            then: {
              name: 'properties.transition.properties.backgroundColor.display.visible',
              value: true
            }
          }
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
            imageCaption: {
              placeholder: 'Add Caption...',
              label: 'Description',
              display: {
                type: 'rich-text',
                minWidth: 300,
                maxWidth: 550
              }
            },
          },
          required: ['image']
        },
        default: [
          {
            image: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
              name: 'Slider-1.png'
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ]
          },
          {
            image: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
              name: 'Slider-2.png'
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ]
          },
          {
            image: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
              name: 'Slider-3.png'
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ]
          }
        ]
      },
      styles: {
        layoutBased: true,
        type: 'object',
        properties: {
          imageCaption: {
            dataName: 'caption',
            type: 'object',
            properties: {
              fontSettings: {
                type: 'object',
                display: {
                  type: 'font-settings',
                },
                properties: {
                  fontFamily: {
                    type: 'string',
                  },
                  fontWeight: {
                    type: 'number',
                  },
                  fontStyle: {
                    type: 'string',
                  }
                }
              },
              widthSettings: {
                display: {
                  type: 'text-width-control',
                },
                type: 'object',
                properties: {
                  width: {
                    type: 'number',
                  },
                  sizing: {
                    type: 'string',
                    enum: ['auto', 'manual'],
                  }
                }
              },
              fontSizeLineHeight: {
                type: 'object',
                display: {
                  type: 'font-size-line-height',
                },
                properties: {
                  fontSize: {
                    type: 'number',
                  },
                  lineHeight: {
                    type: 'number',
                  }
                }
              },
              letterSpacing: {
                display: {
                  type: 'letter-spacing-input',
                },
                type: 'number',
              },
              wordSpacing: {
                display: {
                  type: 'word-spacing-input',
                },
                type: 'number',
              },
              textAlign: {
                display: {
                  type: 'text-align-control',
                },
                type: 'string',
                enum: ['left', 'center', 'right', 'justify'],
              },
              textAppearance: {
                display: {
                  type: 'text-appearance',
                },
                properties: {
                  textTransform: {
                    type: 'string',
                    enum: ['none', 'uppercase', 'lowercase', 'capitalize'],
                  },
                  textDecoration: {
                    type: 'string',
                    enum: ['none', 'underline'],
                  },
                  fontVariant: {
                    type: 'string',
                    enum: ['normal', 'small-caps'],
                  },
                }
              },
              color: {
                display: {
                  type: 'style-panel-color-picker',
                },
                type: 'string',
              }
            }
          }
        },
        default: {
          imageCaption: {
            widthSettings: {
              width: 0.13,
              sizing: 'auto',
            },
            fontSettings: {
              fontFamily: 'Arial',
              fontWeight: 400,
              fontStyle: 'normal',
            },
            fontSizeLineHeight: {
              fontSize: 0.02,
              lineHeight: 0.02
            },
            letterSpacing: 0,
            wordSpacing: 0,
            textAlign: 'left',
            textAppearance: {
              textTransform: 'none',
              textDecoration: 'none',
              fontVariant: 'normal',
            },
            color: '#000000'
          }
        }
      },
    },
    required: ['settings', 'content', 'styles']
  }
};
