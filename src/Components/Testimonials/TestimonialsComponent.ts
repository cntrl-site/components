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
    height: 300
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
                enum: ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s'],
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
                    label: 'minH',
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
              },
              padding: {
                type: 'object',
                title: 'Padding',
                display: {
                  type: 'padding-controls',
                },
              },
              dropShadow: {
                type: 'object',
                title: 'Shadow',
                display: {
                  type: 'group',
                },
                properties: {
                  active: {
                    type: 'string',
                    title: 'active',
                    display: {
                      type: 'ratio-group',
                      direction: 'horizontal',
                    },
                    enum: ['on', 'off']
                  },
                  right: {
                    type: 'number',
                    title: 'Right',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  down: {
                    type: 'number',
                    title: 'Down',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  spread: {
                    type: 'number',
                    title: 'Spread',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  blur: { 
                    type: 'number',
                    title: 'Blur',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
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
                }
              },
              hasGradientCorners: {
                title: 'Grad cor',
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['gradient', 'none']
              },
            }
          },
          elements: {
            title: 'elements',
            icon: 'star',
            type: 'object',
            properties: {
              elements: {
                type: 'array',
                display: {
                  type: 'order-selector'
                },
                items: {
                  type: 'string',
                  enum: ['text', 'icon', 'caption']
                },
                default: {
                  order: ['text', 'icon', 'caption'],
                  active: 'text',
                },
              },
              text: {
                type: 'object',
                display: {
                  type: 'group',
                },
                properties: {
                  minHeight: {
                    type: 'number',
                    title: 'Min Height',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  margin: {
                    type: 'object',
                    title: 'Margin',
                    display: {
                      type: 'group',
                      visible: false,
                    },
                    properties: {
                      top: {
                        type: 'number',
                        label: 'Top',
                        scalingEnabled: true,
                        display: {
                          type: 'numeric-input',
                          visible: false,
                        },
                      },
                    },
                  },
                }
              },
              icon: {
                type: 'object',
                display: {
                  type: 'group',
                },
                properties: {
                  margin: {
                    type: 'object',
                    title: 'Margin',
                    display: {
                      type: 'group',
                      visible: false,
                    },
                    properties: {
                      top: {
                        type: 'number',
                        label: 'Top',
                        scalingEnabled: true,
                        display: {
                          type: 'numeric-input',
                          visible: false,
                        },
                      },
                    },
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
              caption: {
                type: 'object',
                display: {
                  type: 'group',
                },
                properties: {
                  minHeight: {
                    type: 'number',
                    title: 'Min Height',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  margin: {
                    type: 'object',
                    title: 'Margin',
                    display: {
                      type: 'group',
                      visible: false,
                    },
                    properties: {
                      top: {
                        type: 'number',
                        label: 'Top',
                        scalingEnabled: true,
                        display: {
                          type: 'numeric-input',
                          visible: false,
                        },
                      },
                    }
                  },
                },
              }
            }
          }
        },
        default: {
          general: {
            autoplay: 'off',
            move: 'one',
            speed: '5s',
            direction: 'left',
            pause: 'off',
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
            bgColor: 'rgba(255, 255, 255, 0.2)',
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            },
            dropShadow: {
              active: 'on',
              right: 0,
              down: 0,
              spread: 0,
              blur: 0,
              color: '#000000',
            },
            hasGradientCorners: 'gradient',
          },
          elements: {
            elements: ['text', 'icon', 'caption'],
            active: 'text',
            text: {
              minHeight: 0.01,
              margin: {
                top: 0,
              }
            },
            icon: {
              margin: {
                top: 0,
              },
              scale: 100
            },
            caption: {
              minHeight: 0.01,
              margin: {
                top: 0,
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
              name: 'elements.elements.active',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.text.properties.minHeight.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements.active',
              value: 'text'
            },
            then: {
              name: 'properties.elements.properties.caption.properties.minHeight.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements.active',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.caption.properties.minHeight.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'elements.elements.active',
              value: 'caption'
            },
            then: {
              name: 'properties.elements.properties.caption.properties.minHeight.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements.active',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.text.properties.minHeight.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements.active',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.caption.properties.minHeight.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'elements.elements.active',
              value: 'icon'
            },
            then: {
              name: 'properties.elements.properties.icon.properties.scale.display.visible',
              value: true
            }
          },
        ]
      },
      content: {
        layoutBased: false,
        type: 'array',
        settings: {
          addItemFromFileExplorer: false,
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
            caption: {
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
            image: {},
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
            caption: [
              {
                type: 'paragraph',
                children: [{ text: 'CEO @ Company' }]
              }
            ]
          },
          {
            image: {},
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
            caption: [
              {
                type: 'paragraph',
                children: [{ text: 'CEO @ Company' }]
              }
            ]
          },
          {
            image: {},
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
            caption: [
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
          imageCaption: {
            dataName: 'imageCaption',
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
            },
          },
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
          imageCaption: {
            widthSettings: {
              width: 0.13,
              sizing: 'manual',
            },
            fontSettings: {
              fontFamily: 'Arial',
              fontWeight: 400,
              fontStyle: 'normal',
            },
            fontSizeLineHeight: {
              fontSize: 0.01,
              lineHeight: 0.01
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
          },
          caption: {
            widthSettings: {
              width: 0.13,
              sizing: 'manual',
            },
            fontSettings: {
              fontFamily: 'Arial',
              fontWeight: 400,
              fontStyle: 'normal',
            },
            fontSizeLineHeight: {
              fontSize: 0.01,
              lineHeight: 0.01
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
      required: ['settings', 'content', 'styles']
    }
  },
};
