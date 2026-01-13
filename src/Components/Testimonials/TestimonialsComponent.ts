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
            title: 'general',
            icon: 'thumbnail',
            tooltip: 'General',
            type: 'object',
            properties: {
              autoplay: {
                type: 'boolean',
                display: {
                  type: 'setting-toggle',
                }
              },
              inView: {
                type: 'number',
                label: 'In View',
                min: 1,
                display: {
                  type: 'numeric-input',
                },
              },
              alignment: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['left', 'center', 'right']
              },
              move: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['one', 'view']
              },
              speed: {
                type: 'number',
                label: 'Speed',
                min: 100,
                max: 10000,
                step: 100,
                display: {
                  type: 'numeric-input',
                },
              },
              direction: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['left', 'right']
              },
              pause: {
                type: 'string',
                display: {
                  type: 'ratio-group'
                },
                enum: ['hover', 'click', 'off']
              }
            }
          },
          card: {
            title: 'card',
            icon: 'card',
            tooltip: 'Card',
            type: 'object',
            properties: {
              dimensions: {
                type: 'object',
                title: 'Dimensions',
                display: {
                  type: 'group',
                },
                properties: {
                  width: {
                    type: 'number',
                    label: 'Width',
                    scalingEnabled: true,
                    display: {
                      type: 'numeric-input',
                      visible: true,
                    },
                  },
                  height: {
                    type: 'number',
                    label: 'Height',
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
                label: 'Gap',
                scalingEnabled: true,
                min: 0,
                display: {
                  type: 'numeric-input',
                },
              },
              corner: {
                type: 'number',
                label: 'Corners',
                scalingEnabled: true,
                min: 0,
                display: {
                  type: 'numeric-input',
                },
              },
              borderWidth: {
                type: 'number',
                label: 'Borders',
                scalingEnabled: true,
                min: 0,
                display: {
                  type: 'numeric-input',
                },
              },
              borderColor: {
                title: 'Border Color',
                type: 'string',
                display: {
                  type: 'settings-color-picker',
                  format: 'single'
                }
              },
              bgColor: {
                title: 'Background Color',
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
            tooltip: 'Elements',
            type: 'object',
            properties: {
              text: {
                type: 'object',
                title: 'Text',
                display: {
                  type: 'group',
                },
                properties: {
                  alignment: {
                    type: 'string',
                    display: {
                      type: 'position-selector',
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
              },
              icon: {
                type: 'object',
                title: 'Icon',
                display: {
                  type: 'group',
                },
                properties: {
                  alignment: {
                    type: 'string',
                    display: {
                      type: 'position-selector',
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
                    },
                  }
                }
              },
              creds: {
                type: 'object',
                title: 'Credentials',
                display: {
                  type: 'group',
                },
                properties: {
                  alignment: {
                    type: 'string',
                    display: {
                      type: 'position-selector',
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
              },
              cover: {
                type: 'object',
                title: 'Cover',
                display: {
                  type: 'group',
                },
                properties: {
                  gradient: {
                    title: 'Gradient',
                    type: 'string',
                    display: {
                      type: 'settings-color-picker',
                      format: 'gradient'
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
            autoplay: false,
            inView: 3,
            alignment: 'center',
            move: 'one',
            speed: 3000,
            direction: 'left',
            pause: 'hover'
          },
          card: {
            dimensions: {
              width: 300,
              height: 400
            },
            gap: 20,
            corner: 0,
            borderWidth: 0,
            borderColor: '#000000',
            bgColor: '#ffffff'
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
          elements: {
            text: {
              alignment: 'bottom-center',
              offset: {
                x: 0,
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
              alignment: 'bottom-center',
              offset: {
                x: 0,
                y: 0
              }
            },
            cover: {
              gradient: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)'
            }
          }
        }
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
              placeholder: 'Add Caption...',
              label: 'Description',
              display: {
                type: 'rich-text',
                minWidth: 300,
                maxWidth: 550
              }
            },
            creds: {
              placeholder: 'Add Credentials...',
              label: 'Credentials',
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
              url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMHNP08T27H1649S67NZV.png',
              name: 'Testimonial-1.png'
            },
            icon: {
              objectFit: 'cover',
              url: '',
              name: ''
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ],
            creds: [
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
              name: 'Testimonial-2.png'
            },
            icon: {
              objectFit: 'cover',
              url: '',
              name: ''
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ],
            creds: [
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
              name: 'Testimonial-3.png'
            },
            icon: {
              objectFit: 'cover',
              url: '',
              name: ''
            },
            imageCaption: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ],
            creds: [
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

