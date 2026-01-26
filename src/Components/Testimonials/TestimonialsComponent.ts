import React from 'react';
import { Testimonials } from './Testimonials';
import { Component } from '../../types/Component';

export const TestimonialsComponent: Component = {
  element: Testimonials as (props: any) => React.ReactElement,
  id: 'testimonials',
  name: 'Testimonials',
  preview: {
    type: 'video' as const,
    url: 'https://cdn.cntrl.site/component-assets/testimonials.mp4',
  },
  defaultSize: {
    width: 700,
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
          general: {
            icon: 'thumbnail',
            type: 'object',
            properties: {
              autoplay: {
                type: 'string',
                title: 'Autoplay',
                display: {
                  type: 'ratio-group',
                  direction: 'horizontal',
                },
                enum: ['on', 'off']
              },
              inView: {
                type: 'number',
                title: 'In View',
                min: 1,
                display: {
                  type: 'numeric-input',
                },
              },
              alignment: {
                type: 'string',
                title: 'Alignment',
                display: {
                  type: 'align-group',
                  direction: 'vertical',
                },
                enum: ['left', 'center', 'right']
              },
              move: {
                type: 'string',
                title: 'Move',
                display: {
                  type: 'ratio-group',
                  direction: 'horizontal',
                },
                enum: ['one', 'view']
              },
              speed: {
                type: ['string', 'null'],
                title: 'Speed',
                display: {
                  type: 'step-selector',
                },
                enum: ['100ms', '250ms', '500ms', '1000ms', '1500ms', '2000ms'],
              },
              direction: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['left', 'right']
              },
              pause: {
                title: 'Pause on',
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['hover', 'click', 'off']
              }
            }
          },
          card: {
            icon: 'card',
            type: 'object',
            properties: {
              dimensions: {
                type: 'object',
                title: 'Size',
                display: {
                  type: 'group',
                },
                properties: {
                  width: {
                    type: 'number',
                    label: 'W',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                  height: {
                    type: 'number',
                    label: 'H',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                }
              },
              gap: {
                type: 'number',
                title: 'Gap',
                scalingEnabled: true,
                min: 0,
                display: {
                  type: 'numeric-input',
                },
              },
              corner: {
                type: 'number',
                title: 'Corners',
                scalingEnabled: true,
                min: 0,
                label: 'icon:border-radius',
                display: {
                  type: 'numeric-input',
                },
              },
              borders: {
                type: 'object',
                title: 'Borders',
                display: {
                  type: 'group'
                },  
                properties: {
                  width: {
                    type: 'number',
                    label: 'icon:border-width',
                    scalingEnabled: true,
                    min: 0,
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  color: {
                    type: 'string',
                    display: {
                      type: 'settings-color-picker',
                      format: 'single'
                    }
                  },
                }
              },
              bgColor: {
                title: 'BG color',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              }
            }
          },
          elements: {
            title: 'elements',
            icon: 'star',
            type: 'object',
            properties: {
              elements: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['text', 'icon', 'caption']
              },
              text: {
                type: 'object',
                display: {
                  type: 'group',
                },
                properties: {
                  alignment: {
                    type: 'string',
                    display: {
                      type: 'align-grid',
                      visible: true,
                    },
                    enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
                  },
                  offset: {
                    type: 'object',
                    title: 'Offset',
                    display: {
                      type: 'group',
                      visible: true,
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
                  }
                }
              },
              icon: {
                type: 'object',
                display: {
                  type: 'group',
                },
                properties: {
                  alignment: {
                    type: 'string',
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
                  scale: {
                    type: 'number',
                    title: 'scale',
                    min: 50,
                    max: 600,
                    display: {
                      type: 'range-control',
                      visible: false,
                    },
                  }
                }
              },
              creds: {
                type: 'object',
                display: {
                  type: 'group',
                },
                properties: {
                  alignment: {
                    type: 'string',
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
                  }
                }
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
            },
          }
        },
        default: {
          general: {
            autoplay: 'off',
            inView: 3,
            alignment: 'center',
            move: 'one',
            speed: '3s',
            direction: 'left',
            pause: 'off'
          },
          card: {
            dimensions: {
              width: 0.15,
              height: 0.2
            },
            gap: 0.02,
            corner: 0.005,
            borders: {
              width: 0.001,
              color: '#000000',
            },
            bgColor: 'rgba(255, 255, 255, 0.2)'
          },
          controls: {
            isActive: false,
            arrowsImgUrl: null,
            offset: {
              x: 0,
              y: 0
            },
            scale: 100,
            color: '#000000',
            hover: '#cccccc',
          },
          elements: {
            elements: 'text',
            text: {
              alignment: 'middle-left',
              offset: {
                x: 0.005,
                y: 0
              }
            },
            icon: {
              alignment: 'top-left',
              offset: {
                x: 0,
                y: 0
              },
              scale: 100
            },
            creds: {
              alignment: 'bottom-left',
              offset: {
                x: 0.005,
                y: -0.005
              }
            }
          }
        },
        displayRules: [
          {
            if: {
              name: 'general.autoplay',
              value: 'off'
            },
            then: {
              name: 'properties.general.properties.inView.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'off'
            },
            then: {
              name: 'properties.general.properties.alignment.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'off'
            },
            then: {
              name: 'properties.general.properties.move.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'on'
            },
            then: {
              name: 'properties.general.properties.inView.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'on'
            },
            then: {
              name: 'properties.general.properties.alignment.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'on'
            },
            then: {
              name: 'properties.general.properties.move.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'on'
            },
            then: {
              name: 'properties.general.properties.speed.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'on'
            },
            then: {
              name: 'properties.general.properties.direction.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'on'
            },
            then: {
              name: 'properties.general.properties.pause.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'off'
            },
            then: {
              name: 'properties.general.properties.speed.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'off'
            },
            then: {
              name: 'properties.general.properties.direction.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'general.autoplay',
              value: 'off'
            },
            then: {
              name: 'properties.general.properties.pause.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.text.properties.alignment.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.text.properties.offset.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.alignment.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.offset.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.creds.properties.alignment.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.creds.properties.offset.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.alignment.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.offset.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.text.properties.alignment.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.text.properties.offset.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.creds.properties.alignment.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.creds.properties.offset.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.creds.properties.alignment.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.creds.properties.offset.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.text.properties.alignment.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.text.properties.offset.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.alignment.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.offset.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.scale.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.scale.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.scale.display.visible',
              value: false
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
            icon: {
              type: 'object',
              label: 'Icon',
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
              placeholder: 'Add Text...',
              label: 'Text',
              display: {
                type: 'rich-text',
                minWidth: 300,
                maxWidth: 550
              }
            },
            creds: {
              placeholder: 'Add Caption...',
              label: 'Caption',
              display: {
                type: 'rich-text',
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
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/component-assets/2.jpg',
              name: 'Testimonial-1.png'
            },
            icon: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
              name: ''
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: 'Innovative solutions redefine connectivity, enhancing user experience through seamless digital integration and efficiency.' }]
              }
            ],
            creds: [
              {
                type: 'paragraph',
                children: [{ text: 'CEO @ Company' }]
              }
            ]
          },
          {
            image: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/component-assets/3.jpg',
              name: 'Testimonial-2.png'
            },
            icon: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
              name: ''
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: 'In the realm of digital innovation, transformative algorithms redefine connectivity, propelling unprecedented technological advancements.' }]
              }
            ],
            creds: [
              {
                type: 'paragraph',
                children: [{ text: 'CEO @ Company' }]
              }
            ]
          },
          {
            image: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/component-assets/4.jpg',
              name: 'Testimonial-3.png'
            },
            icon: {
              objectFit: 'cover',
              url: 'https://cdn.cntrl.site/projects/01GJ2SPNXG3V5P35ZA35YM1JTW/articles-assets/01KFXFA89BHQHVAJNAZCJMWDA1.png',
              name: ''
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: 'Harnessing innovative algorithms, this paradigm shift enhances computational efficiency and optimizes data processing frameworks.' }]
              }
            ],
            creds: [
              {
                type: 'paragraph',
                children: [{ text: 'CEO @ Company' }]
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
                enum: ['left', 'center', 'right'],
              },
              textAppearance: {
                display: {
                  type: 'text-appearance',
                },
                properties: {
                  textTransform: {
                    type: 'string',
                    enum: ['none', 'uppercase', 'lowercase'],
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

