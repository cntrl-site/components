import { title } from 'process';
import { LightboxGallery } from './Lightbox';
import { Component } from '../../types/Component';

export const LightboxComponent: Component = {
  element: LightboxGallery,
  id: 'lightbox',
  name: 'Lightbox',
  preview: {
    type: 'video' as const,
    url: 'https://cdn.cntrl.site/projects/01GJ2SPDSH73MC92WW7ZA2CWBY/articles-assets/01KA24CHYZXJBZ0Q714B05A7VD.mp4',
  },
  defaultSize: {
    width: 440,
    height: 550
  },
  schema: {
    type: 'object',
    properties: {
      settings: {
        layoutBased: true,
        type: 'object',
        properties: {
          thumbnailBlock: {
            display: {
              type: 'settings-block',
              triggerEvent: 'close'
            },
            type: 'object',
            properties: {
              cover: {
                title: 'COVER',
                icon: 'cover',
                tooltip: 'Cover Image',
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    display: {
                      mode: 'cover',
                      type: 'settings-image-input',
                    }
                  }
                }
              },
            }
          },
          lightboxBlock: {
            display: {
              type: 'settings-block',
              triggerEvent: 'open'
            },
            type: 'object',
            properties: {
              appear: {
                title: 'APPEAR',
                icon: 'transition',
                tooltip: 'Appearance',
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    display: {
                      type: 'ratio-group'
                    },
                    enum: ['slide in', 'fade in', 'mix']
                  },
                  duration: {
                    type: 'string',
                    label: 'T',
                    display: {
                      type: 'step-selector',
                    },
                    enum: ['100ms', '250ms', '500ms', '1000ms', '1500ms', '2000ms'],
                  },
                  direction: {
                    type: 'string',
                    title: 'FROM',
                    display: {
                      type: 'direction-control',
                    },
                    enum: ['top','left', 'right', 'bottom']
                  },
                  repeat: {
                    type: 'string',
                    title: 'Repeat',
                    display: {
                      type: 'ratio-group'
                    },
                    enum: ['close', 'loop']
                  }
                }
              },
              triggers: {
                title: 'TRIGGERS',
                icon: 'target',
                tooltip: 'Triggers',
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    display: {
                      type: 'ratio-group'
                    },
                    enum: ['click', 'drag']
                  },
                  switch: {
                    type: 'string',
                    display: {
                      type: 'ratio-group',
                    },
                    enum: ['image', '50/50']
                  }
                }
              },
              slider: {
                title: 'SLIDER',
                icon: 'horizontal-resize',
                tooltip: 'Slider',
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    display: {
                      type: 'ratio-group'
                    },
                    enum: ['slide', 'fade', 'scale']
                  },
                  direction: {
                    type: 'string',
                    display: {
                      type: 'ratio-group'
                    },
                    enum: ['horiz', 'vert']
                  },
                  duration: {
                    type: 'string',
                    label: 'T',
                    display: {
                      type: 'step-selector',
                    },
                    enum: ['100ms', '250ms', '500ms', '1000ms', '1500ms', '2000ms'],
                  }
                }
              },
              thumbnail: {
                title: 'THUMB',
                icon: 'thumbnail',
                tooltip: 'Thumbnail',
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
                      type: 'align-grid',
                    },
                    type: 'string',
                    enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'],
                  },
                  fit: {
                    type: 'string',
                    display: {
                      type: 'ratio-group'
                    },
                    enum: ['cover', 'fit']
                  },
                  align: {
                    type: 'string',
                    title: 'Align',
                    display: {
                      type: 'align-group',
                      direction: 'horizontal',
                    },
                    enum: ['start', 'center', 'end']
                  },
                  triggers: {
                    type: 'string',
                    title: 'Triggers',
                    display: {
                      type: 'ratio-group',
                      direction: 'horizontal',
                    },
                    enum: ['clk', 'hov']
                  },
                  grid: {
                    type: 'object',
                    title: 'Grid',
                    display: {
                      type: 'group'
                    },  
                    properties: {
                      height: {
                        type: 'number',
                        label: 'H',
                        display: {
                          type: 'numeric-input',
                          visible: true,
                        },
                      },
                      width: {
                        type: 'number',
                        label: 'W',
                        display: {
                          type: 'numeric-input',
                          visible: false,
                        },
                      },
                      gap: {
                        type: 'number',
                        label: 'Gap',
                        display: {
                          type: 'numeric-input',
                        },
                      }
                    }
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
                  opacity: {
                    type: 'number',
                    title: 'Opacity',
                    label: 'icon:opacity',
                    min: 0,
                    max: 100,
                    step: 1,
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  activeState: {
                    type: 'object',
                    title: 'ACTIVE',
                    display: {
                      type: 'group'
                    },
                    properties: {
                      scale: {
                        type: 'number',
                        title: 'Scale',
                        min: 1,
                        max: 5,
                        step: 0.1,
                        display: {
                          type: 'range-control',
                        },
                      },
                      opacity: {
                        type: 'number',
                        title: 'Opacity',
                        label: 'icon:opacity',
                        min: 0,
                        max: 100,
                        step: 1,
                        display: {
                          type: 'numeric-input',
                        },
                      }
                    }
                  }
                }
              },
              layout: {
                title: 'LAYOUT',
                icon: 'layout',
                tooltip: 'Layout',
                type: 'object',
                properties: {
                  position: {
                    display: {
                      type: 'align-grid',
                    },
                    type: 'string',
                    enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'],
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
                  padding: {
                    type: 'object',
                    title: 'Padding',
                    display: {
                      type: 'padding-controls',
                    },
                    properties: {
                      top: {
                        type: 'number',
                      },
                      left: {
                        type: 'number',
                      },
                      right: {
                        type: 'number',
                      },
                      bottom: {
                        type: 'number',
                      },
                    }
                  }
                }
              },
              controls: {
                title: 'CONTROLS',
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
                    title: 'Offset',
                    type: 'object',
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
                    title: 'Scale',
                    min: 0.5,
                    max: 5,
                    step: 0.1,
                    display: {
                      type: 'range-control',
                    },
                  },
                  color: {
                    title: 'Color',
                    type: 'string',
                    display: {
                      type: 'settings-color-picker',
                      format: 'single'
                    }
                  },
                  hover: {
                    title: 'Hover',
                    type: 'string',
                    display: {
                      type: 'settings-color-picker',
                      format: 'single'
                    },
                  }
                },
              },
              area: {
                title: 'AREA',
                icon: 'area',
                tooltip: 'Area',
                type: 'object',
                properties: {
                  color: {
                    type: 'string',
                    display: {
                      type: 'settings-color-picker',
                      format: 'single'
                    }
                  },
                  blur: {
                    type: 'number',
                    label: 'icon:blur',
                    display: {
                      type: 'numeric-input',
                    },
                  },
                  closeIconUrl: {
                    type: ['string', 'null'],
                    title: 'CLOSE ICON',
                    display: {
                      type: 'settings-image-input',
                    },
                  },
                  closeIconAlign: {
                    display: {
                      type: 'align-grid',
                      direction: 'horizontal',
                    },
                    type: 'string',
                    enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'],
                  },
                  closeIconScale: {
                    type: 'number',
                    title: 'Scale',
                    min: 0.5,
                    max: 5,
                    step: 0.1,
                    display: {
                      type: 'range-control',
                    },
                  },
                  closeIconOffset: {
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
              caption: {
                title: 'DESC',
                icon: 'text-icon',
                tooltip: 'Description',
                type: 'object',
                properties: {
                  isActive: {
                    type: 'boolean',
                    display: {
                      type: 'setting-toggle',
                    }
                  },
                  alignment: {
                    type: 'string',
                    display: {
                      type: 'align-grid'
                    },
                    enum: ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
                  },
                  offset: {
                    title: 'Offset',
                    type: 'object',
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
                  hover: {
                    title: 'Hover',
                    type: 'string',
                    display: {
                      type: 'settings-color-picker',
                      format: 'single'
                    }
                  }
                }
              }
            }
          },
        },
        default: {
          thumbnailBlock: {
            cover: {
              url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERMHNP08T27H1649S67NZV.png'
            },
          },
          lightboxBlock: {
            appear: {
              type: 'slide in',
              duration: '500ms',
              direction: 'right',
              repeat: 'loop'
            },
            triggers: {
              type: 'click',
              switch: 'image',
            },
            slider: {
              type: 'fade',
              direction: 'horiz',
              duration: '1000ms'
            },
            thumbnail: {
              isActive: true,
              position: 'bottom-center',
              fit: 'cover',
              align: 'center',
              triggers: 'clk',
              grid: {
                height: 0.03,
                width: 0.03,
                gap: 0.008
              },
              offset: { x: 0, y: 0 },
              opacity: 80,
              activeState: {
                scale: 1,
                opacity: 100
              }
            },
            layout: {
              position: 'middle-center',
              offset: { x: 0, y: 0 },
              padding: { top: 0, right: 0, bottom: 0, left: 0 }
            },
            controls: {
              isActive: true,
              arrowsImgUrl: null,
              offset: { x: 0, y: 0 },
              scale: 1,
              color: '#000000',
              hover: '#cccccc'
            },
            area: {
              color: 'rgba(0,0,0,0.9)',
              blur: 0,
              closeIconUrl: null,
              closeIconAlign: 'top-right',
              closeIconOffset: { x: 0, y: 0 },
              closeIconScale: 1
            },
            caption: {
              isActive: true,
              alignment: 'middle-center',
              offset: { x: 0, y: 0 },
              hover: '#cccccc'
            }
          }
        },
        displayRules: [
          {
            if: {
              name: 'lightboxBlock.appear.type',
              value: 'slide in'
            },
            then: {
              name: 'properties.lightboxBlock.properties.appear.properties.direction.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'lightboxBlock.slider.direction',
              value: 'vert'
            },
            then: {
              name: 'properties.lightboxBlock.properties.thumbnail.properties.align.display.direction',
              value: 'vertical'
            }
          },
          {
            if: {
              name: 'lightboxBlock.slider.direction',
              value: 'vert'
            },
            then: {
              name: 'properties.lightboxBlock.properties.thumbnail.properties.grid.properties.width.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'lightboxBlock.slider.direction',
              value: 'horiz'
            },
            then: {
              name: 'properties.lightboxBlock.properties.thumbnail.properties.grid.properties.height.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'lightboxBlock.slider.direction',
              value: 'vert'
            },
            then: {
              name: 'properties.lightboxBlock.properties.thumbnail.properties.grid.properties.height.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'lightboxBlock.slider.direction',
              value: 'horiz'
            },
            then: {
              name: 'properties.lightboxBlock.properties.thumbnail.properties.grid.properties.width.display.visible',
              value: false
            }
          },
          {
            if: {
              name: 'lightboxBlock.appear.type',
              value: 'mix'
            },
            then: {
              name: 'properties.lightboxBlock.properties.appear.properties.direction.display.visible',
              value: true
            }
          },
          {
            if: {
              name: 'lightboxBlock.appear.type',
              value: 'fade in'
            },
            then: {
              name: 'properties.lightboxBlock.properties.appear.properties.direction.display.visible',
              value: false
            }
          },
          // {
          //   if: {
          //     name: 'lightboxBlock.triggers.type',
          //     value: 'click'
          //   },
          //   then: {
          //     name: 'properties.lightboxBlock.properties.slider.properties.switch.display.visible',
          //     value: true
          //   }
          // },
          // {
          //   if: {
          //     name: 'lightboxBlock.triggers.type',
          //     value: 'drag'
          //   },
          //   then: {
          //     name: 'properties.lightboxBlock.properties.slider.properties.switch.display.visible',
          //     value: false
          //   }
          // }
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
                type: 'media-input',
                minWidth: 58,
                maxWidth: 108
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
              label: 'Description',
              placeholder: 'Add Caption...',
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
              objectFit: 'contain',
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
              objectFit: 'contain',
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
              objectFit: 'contain',
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

