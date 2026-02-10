import { Grid } from './Grid';

const defaultTextStyles = {
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
};

const textProperties = {
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
};

export const GridComponent = {
  element: Grid,
  id: 'grid',
  name: 'Grid',
  preview: {
    type: 'video' as const,
    url: 'https://cdn.cntrl.site/component-assets/Control-slider-preview.mp4',
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
          grid: {
            title: 'grid',
            icon: 'thumbnail',
            tooltip: 'Grid',
            type: 'object',
            properties: {
              entriesPerRow: {
                type: 'number',
                min: 1,
                max: 40,
                label: '#PR',
                display: {
                  type: 'numeric-input',
                },
              },
              rowGap: {
                type: 'number',
                scalingEnabled: true,
                label: 'RG',
                display: {
                  type: 'numeric-input',
                },
              },
              columnGap: {
                type: 'number',
                scalingEnabled: true,
                label: 'CG',
                display: {
                  type: 'numeric-input',
                },
              }
            }
          },
          media: {
            title: 'media',
            icon: 'cover',
            tooltip: 'Media',
            type: 'object',
            properties: {
              widthType: {
                type: 'string',
                enum: ['auto', 'fixed'],
              },
              maxWidth: {
                type: 'number',
                min: 0,
                label: 'W',
                scalingEnabled: true,
                display: {
                  type: 'numeric-input',
                },
              },
            }
          },
          title: {
            title: 'title',
            icon: 'text-icon',
            tooltip: 'Title',
            type: 'object',
            properties: {
              marginTop: {
                type: 'number',
                scalingEnabled: true,
                label: 'MT',
                display: {
                  type: 'numeric-input',
                },
              },
            }
          },
          subtitle: {
            title: 'subtitle',
            icon: 'text-icon',
            tooltip: 'Subtitle',
            type: 'object',
            properties: {
              marginTop: {
                type: 'number',
                scalingEnabled: true,
                label: 'MT',
                display: {
                  type: 'numeric-input',
                },
              },
            }
          },
          description: {
            title: 'description',
            icon: 'text-icon',
            tooltip: 'Description',
            type: 'object',
            properties: {
              marginTop: {
                type: 'number',
                scalingEnabled: true,
                label: 'MT',
                display: {
                  type: 'numeric-input',
                },
              },
            }
          }
        },
        default: {
          grid: {
            entriesPerRow: 3,
            rowGap: 0.05,
            columnGap: 0.005,
          },
          media: {
            widthType: 'auto',
            maxWidth: 0.5,
          },
          title: {
            marginTop: 0,
          },
          subtitle: {
            marginTop: 0,
          },
          description: {
            marginTop: 0,
          }
        }
      },
      content: {
        layoutBased: false,
        type: 'array',
        settings: {
          addItemFromFileExplorer: false,
          defaultWidth: 1408
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
            title: {
              placeholder: 'Add Title...',
              label: 'Title',
              display: {
                type: 'rich-text',
                minWidth: 100,
                maxWidth: 300
              }
            },
            subtitle: {
              placeholder: 'Add Subtitle...',
              label: 'Subtitle',
              display: {
                type: 'rich-text',
                minWidth: 100,
                maxWidth: 300
              }
            },
            description: {
              placeholder: 'Add Description...',
              label: 'Description',
              display: {
                type: 'rich-text',
                minWidth: 100,
                maxWidth: 300
              }
            },
            link: {
              type: 'string',
              label: 'URL',
              placeholder: 'Enter link...',
              display: {
                type: 'text-input',
                minWidth: 200,
                maxWidth: 400
              }
            }
          },
          required: ['image']
        },
        default: [
          {
            image: {
              url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
              objectFit: 'cover' as const
            },
            title: [
              {
                type: 'paragraph',
                children: [{ text: 'Connect devices to enhance productivity' }]
              }
            ],
            subtitle: [
              {
                type: 'paragraph',
                children: [{ text: 'Existence unfolds; meaning weaves itself into the fabric of awareness.' }]
              }
            ],
            description: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ],
            link: 'https://www.google.com'
          },
          {
            image: {
              url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
              objectFit: 'cover' as const
            },
            title: [
              {
                type: 'paragraph',
                children: [{ text: 'Innovative solutions drive digital transformation' }]
              }
            ],
            subtitle: [
              {
                type: 'paragraph',
                children: [{ text: 'Knowing oneself unveils truth, while doubt illuminates paths unexplored.' }]
              }
            ],
            description: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ],
            link: 'https://www.google.com'
          },
          {
            image: {
              url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
              objectFit: 'cover' as const
            },
            title: [
              {
                type: 'paragraph',
                children: [{ text: 'Data transforms our everyday life' }]
              }
            ],
            subtitle: [
              {
                type: 'paragraph',
                children: [{ text: 'Questions reveal truths that silence conceals. Understanding begins within.' }]
              }
            ],
            description: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ],
            link: 'https://www.google.com'
          },
          {
            image: {
              url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png',
              objectFit: 'cover' as const
            },
            title: [
              {
                type: 'paragraph',
                children: [{ text: 'Existence questions the nature itself.' }]
              }
            ],
            subtitle: [
              {
                type: 'paragraph',
                children: [{ text: 'Truth reflects the labyrinth of understanding woven into existence.' }]
              }
            ],
            description: [
              {
                type: 'paragraph',
                children: [{ text: '' }]
              }
            ],
            link: 'https://www.google.com'
          }
        ]
      },
      styles: {
        layoutBased: true,
        type: 'object',
        properties: {
          title: {
            dataName: 'title',
            type: 'object',
            properties: textProperties
          },
          subtitle: {
            dataName: 'subtitle',
            type: 'object',
            properties: textProperties
          },
          description: {
            dataName: 'description',
            type: 'object',
            properties: textProperties
          }
        },
        default: {
          title: defaultTextStyles,
          subtitle: defaultTextStyles,
          description: defaultTextStyles
        }
      }
    }
  }
};
