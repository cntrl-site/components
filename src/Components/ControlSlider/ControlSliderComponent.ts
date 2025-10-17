import { ControlSlider } from './ControlSlider';

export const ControlSliderComponent = {
  element: ControlSlider,
  id: 'control-slider',
  name: 'Slider',
  preview: {
    type: 'video' as const,
    url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7EQ4ME6CP4KX7TJ4HPAXFEW.mp4',
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
        properties: {
          triggers: {
            name: 'triggers',
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
            name: 'direction',
            icon: 'horizontal-resize',
            tooltip: 'Direction',
            type: 'string',
            display: {
              type: 'ratio-group'
            },
            enum: ['horiz', 'vert']
          },
          transition: {
            name: 'transit',
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
                name: 'BG Color',
                display: {
                  visible: false,
                  type: 'settings-color-picker',
                  format: 'single'
                }
              },
              duration: {
                type: 'string',
                label: 'hourglass-icon',
                display: {
                  type: 'step-selector',
                },
                enum: ['100ms', '250ms', '500ms', '1000ms', '1500ms', '2000ms'],
              }
            }
          },
          controls: {
            name: 'controls',
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
                display: {
                  type: 'offset-controls',
                },
                properties: {
                  x: {
                    type: 'number',
                  },
                  y: {
                    type: 'number',
                  }
                }
              },
              scale: {
                type: 'number',
                name: 'scale',
                min: 50,
                max: 600,
                display: {
                  type: 'range-control',
                },
              },
              color: {
                name: 'color',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              },
              hover: {
                name: 'hover',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                },
              }
            },
          },
          pagination: {
            name: 'nav',
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
                name: 'nav position',
                display: {
                  type: 'socket',
                  direction: 'horizontal',
                },
                type: 'string',
                enum: ['outside-1', 'outside-2', 'inside-1', 'inside-2'],
              },
              offset: {
                type: 'object',
                display: {
                  type: 'offset-controls',
                },
                properties: {
                  x: {
                    type: 'number',
                  },
                  y: {
                    type: 'number',
                  }
                }
              },
              scale: {
                type: 'number',
                name: 'scale',
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
                name: 'color',
                type: 'array',
                items: {
                  type: 'string',
                }
              },
              hover: {
                name: 'hover',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              }
            }
          },
          caption: {
            name: 'Caption',
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
              alignment: {
                name: 'Alignment',
                type: 'string',
                display: {
                  type: 'align-grid'
                },
                enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
              },
              offset: {
                type: 'object',
                display: {
                  type: 'offset-controls',
                },
                properties: {
                  x: {
                    type: 'number',
                  },
                  y: {
                    type: 'number',
                  }
                }
              },
              hover: {
                name: 'hover',
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
          caption: {
            offset: {
              x: 0,
              y: 0
            },
            isActive: true,
            alignment: 'middle-center',
            hover: '#cccccc'
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
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'object',
              display: {
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
              display: {
                type: 'rich-text',
                placeholder: 'Add Caption...',
              }
            },
            link: {
              type: 'object',
              display: {
                type: 'text-input',
                placeholder: 'Add Caption...',
              },
              properties: {
                text: {
                  type: 'string'
                },
              }
            },
          },
          required: ['image']
        },
        default: [
          {
            image: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMHNP08T27H1649S67NZV.png',
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
              url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMTZA3RYMXKF0M095D6JD.png',
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
              url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMVSCMPVJBG2WF5KJZYHZ.png',
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
          caption: {
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
          caption: {
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
