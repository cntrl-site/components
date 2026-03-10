import { NewsletterSignup } from './NewsletterSignup';

const textStyleProperties = {
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
      },
    },
  },
  fontSize: {
    type: 'number',
    display: {
      type: 'font-size',
    },
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
  color: {
    display: {
      type: 'style-panel-color-picker',
    },
    type: 'string',
  },
};

const buttonBackgroundProperties = {
  backgroundColor: {
    display: {
      type: 'style-panel-color-picker',
    },
    type: 'string',
  },
  borderColor: {
    display: {
      type: 'style-panel-color-picker',
    },
    type: 'string',
  },
  borderWidth: {
    type: 'number',
    label: 'BW',
    display: {
      type: 'scaling-number',
    },
  },
  borderRadius: {
    type: 'number',
    label: 'BR',
    display: {
      type: 'scaling-number',
    },
  },
};

const textStyleDefault = (fontWeight: number, color: string) => ({
  fontSettings: {
    fontFamily: 'Arial',
    fontWeight,
    fontStyle: 'normal',
  },
  letterSpacing: 0,
  wordSpacing: 0,
  fontSize: 0.01,
  color,
});

export const NewsletterSignupComponent = {
  element: NewsletterSignup,
  id: 'newsletter-signup',
  name: 'Newsletter Signup',
  defaultSize: {
    width: 400,
    height: 80,
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
          layout: {
            title: 'Layout',
            icon: 'layout',
            tooltip: 'Layout',
            type: 'string',
            display: {
              type: 'ratio-group',
            },
            enum: ['horizontal', 'vertical'],
          },
          fieldsCount: {
            title: 'Fields',
            icon: 'size',
            tooltip: 'Fields',
            type: 'number',
            display: {
              type: 'ratio-group',
            },
            enum: [1, 2],
          },
          inputStyle: {
            title: 'Style',
            icon: 'text-icon',
            tooltip: 'Input Style',
            type: 'string',
            display: {
              type: 'ratio-group',
            },
            enum: ['bordered', 'underline', 'with_label'],
          },
        },
        default: {
          layout: 'horizontal',
          fieldsCount: 1,
          inputStyle: 'bordered',
        },
      },
      styles: {
        layoutBased: true,
        type: 'object',
        properties: {
          input: {
            dataName: 'input',
            type: 'object',
            properties: textStyleProperties,
          },
          label: {
            dataName: 'label',
            type: 'object',
            properties: textStyleProperties,
          },
          button: {
            dataName: 'button',
            type: 'object',
            properties: textStyleProperties,
          },
          buttonBackground: {
            dataName: 'buttonBackground',
            type: 'object',
            properties: buttonBackgroundProperties,
          },
        },
        default: {
          input: textStyleDefault(400, '#000000'),
          label: textStyleDefault(400, '#000000'),
          button: textStyleDefault(700, '#ffffff'),
          buttonBackground: {
            backgroundColor: '#000000',
            borderColor: '#000000',
            borderWidth: 0,
            borderRadius: 0.003,
          },
        },
      },
    },
    required: ['settings', 'styles'],
  },
};
