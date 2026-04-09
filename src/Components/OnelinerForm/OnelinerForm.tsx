import React, { useState } from 'react';
import { CommonComponentProps } from '../props';
import { getFormFieldValidationError, scalingValue, useScopedStyles } from '../utils/index';

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: stretch;
  justify-content: center;
}
.${P}-form {
  display: flex;
  width: 100%;
  align-items: stretch;
  overflow: hidden;
}
.${P}-inputWrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  background-color: var(--${P}-input-color);
  transition: all 250ms;
}
.${P}-inputWrap:hover,
.${P}-wrapper.${P}-state-hover .${P}-inputWrap {
  background-color: var(--${P}-hover-input-color, var(--${P}-input-color));
}
.${P}-inputWrap:focus-within,
.${P}-wrapper.${P}-state-focus .${P}-inputWrap {
  background-color: var(--${P}-focus-input-color, var(--${P}-input-color));
}
.${P}-wrapper.${P}-state-filled .${P}-inputWrap {
  background-color: var(--${P}-filled-input-color, var(--${P}-input-color));
}
.${P}-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--${P}-input-text-color);
  transition: all 250ms;
}
.${P}-input:hover {
  color: var(--${P}-hover-input-text-color, var(--${P}-input-text-color));
}
.${P}-inputWrap:hover .${P}-input,
.${P}-wrapper.${P}-state-hover .${P}-input {
  color: var(--${P}-hover-input-text-color, var(--${P}-input-text-color));
}
.${P}-input:focus,
.${P}-wrapper.${P}-state-focus .${P}-input {
  color: var(--${P}-focus-input-text-color, var(--${P}-input-text-color));
}
.${P}-wrapper.${P}-state-filled .${P}-input {
  color: var(--${P}-filled-input-text-color, var(--${P}-input-text-color));
}
.${P}-input::placeholder {
  color: var(--${P}-placeholder-color);
  opacity: 1;
  transition: all 250ms;
}
.${P}-inputWrap:hover .${P}-input::placeholder,
.${P}-wrapper.${P}-state-hover .${P}-input::placeholder {
  color: var(--${P}-hover-placeholder-color, var(--${P}-placeholder-color));
}
.${P}-submitBtn {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  background-color: var(--${P}-button-color);
  color: var(--${P}-button-text-color);
  border-left-style: solid;
  border-left-color: var(--${P}-stroke-color);
  transition: all 250ms;
}
.${P}-submitBtn img {
  display: block;
  box-sizing: border-box;
  flex: 0 1 auto;
  min-width: 0;
  height: 100%;
  width: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.${P}-submitBtn:hover,
.${P}-wrapper.${P}-state-hover .${P}-submitBtn {
  background-color: var(--${P}-hover-button-color, var(--${P}-button-color));
  color: var(--${P}-hover-button-text-color, var(--${P}-button-text-color));
  border-left-color: var(--${P}-hover-stroke-color, var(--${P}-stroke-color));
}
.${P}-submitBtn:focus,
.${P}-wrapper.${P}-state-focus .${P}-submitBtn {
  background-color: var(--${P}-focus-button-color, var(--${P}-button-color));
  color: var(--${P}-focus-button-text-color, var(--${P}-button-text-color));
  border-left-color: var(--${P}-focus-stroke-color, var(--${P}-stroke-color));
}
.${P}-wrapper.${P}-state-filled .${P}-submitBtn {
  background-color: var(--${P}-filled-button-color, var(--${P}-button-color));
  color: var(--${P}-filled-button-text-color, var(--${P}-button-text-color));
  border-left-color: var(--${P}-filled-stroke-color, var(--${P}-stroke-color));
}
.${P}-wrapper.${P}-state-success .${P}-input,
.${P}-wrapper.${P}-state-success .${P}-submitBtn {
  pointer-events: none;
}
.${P}-overlayAnchor {
  position: relative;
  display: flex;
  align-items: center;
}
.${P}-success {
  margin-top: ${sv(8)};
  font-size: ${sv(14)};
  color: var(--${P}-success-success-color, var(--${P}-success-color));
}
.${P}-error {
  margin-top: ${sv(8)};
  font-size: ${sv(14)};
  color: var(--${P}-error-error-color, var(--${P}-error-color));
}
`;
}

type OnelinerFormProps = {
  settings: OnelinerFormSettings;
  content?: unknown;
  isEditor?: boolean;
  activeEvent?: string;
} & CommonComponentProps;

export const OnelinerForm = ({ settings, isEditor, metadata, activeEvent }: OnelinerFormProps) => {
  const { prefix: P } = useScopedStyles();
  const {
    fields = [{ name: 'email', type: 'email', placeholder: 'Your email' }],
    buttonContent: buttonContentFromSettings,
    submitButtonContent: submitButtonContentLegacy,
    buttonLabel: buttonLabelLegacy,
    buttonIcon: buttonIconLegacy,
    fieldsToShow = 1,
    fontFamily,
    input: inputTextStyle,
    button: buttonTextStyle,
    minHeight,
    corners,
    stroke,
    stateOverrides,
    inputPadding,
    buttonPadding,
    successMessage = 'Thanks for subscribing!',
    errorMessage: errorMessageText = 'Please, fill all required fields.',
  } = settings;

  const visibleFields = fields.slice(0, Math.min(fieldsToShow, fields.length));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(visibleFields.map((f) => [f.name, '']))
  );
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayStatus = activeEvent === 'success' ? 'success'
    : activeEvent === 'error' ? 'error'
    : status;
  const displayError = activeEvent === 'error' ? errorMessageText : errorMessage;
  const displayValues = activeEvent === 'filled'
    ? Object.fromEntries(visibleFields.map((f) => [f.name, 'Filled']))
    : values;
  const validationErrorMessage =
    displayStatus === 'error'
      ? getFormFieldValidationError(visibleFields, displayValues)
      : null;
  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';

  const submitUrl = metadata?.submitUrl as string | undefined;
  const bc = buttonContentFromSettings;
  const submitButtonContent: 'Label' | 'Icon' =
    bc?.mode === 'Icon' || bc?.mode === 'Label'
      ? bc.mode
      : submitButtonContentLegacy === 'Icon'
        ? 'Icon'
        : 'Label';
  const buttonLabel =
    bc === undefined ? buttonLabelLegacy : bc.label !== undefined ? bc.label : buttonLabelLegacy;
  const buttonIcon =
    bc === undefined ? buttonIconLegacy : bc.icon !== undefined ? bc.icon : buttonIconLegacy;
  const labelText = buttonLabel ?? '';
  const iconSrc = buttonIcon ?? '';
  const useIconButton = submitButtonContent === 'Icon';
  const submitAriaLabel = labelText || 'Submit';

  const inputCss = inputTextStyle
    ? textStylesToCss(
        {
          ...inputTextStyle,
          fontSettings: {
            ...inputTextStyle.fontSettings,
            fontFamily: fontFamily ?? inputTextStyle.fontSettings.fontFamily,
          },
        },
        isEditor,
      )
    : undefined;
  const buttonCss = buttonTextStyle
    ? textStylesToCss(
        {
          ...buttonTextStyle,
          fontSettings: {
            ...buttonTextStyle.fontSettings,
            fontFamily: fontFamily ?? buttonTextStyle.fontSettings.fontFamily,
          },
        },
        isEditor,
      )
    : undefined;

  const colorVars = buildColorVars(P, {
    strokeColor: settings.strokeColor,
    inputColor: settings.inputColor,
    placeholderColor: settings.placeholderColor,
    buttonColor: settings.buttonColor,
    successColor: settings.successColor,
    errorColor: settings.errorColor,
    inputTextColor: settings.inputTextColor ?? inputTextStyle?.color ?? '#111111',
    buttonTextColor: settings.buttonTextColor ?? buttonTextStyle?.color ?? '#ffffff',
  }, stateOverrides);

  const formStyle: React.CSSProperties = {
    borderRadius: scalingValue(corners, isEditor),
    borderWidth: scalingValue(stroke, isEditor),
    borderStyle: 'solid',
    borderColor: `var(--${P}-stroke-color)`
  };

  const dividerWidthStyle = { borderLeftWidth: scalingValue(stroke, isEditor) };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      visibleFields.map((f) => [f.name, values[f.name]?.trim() ?? '']).filter(([, v]) => v)
    );
    if (!submitUrl || Object.keys(payload).length === 0) return;

    const validationError = getFormFieldValidationError(visibleFields, values);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      setStatus('success');
      setValues(Object.fromEntries(visibleFields.map((f) => [f.name, ''])));
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className={`${P}-wrapper ${stateClass}`.trim()} style={colorVars}>
      <style>{getCSS(P)}</style>
      <form
        onSubmit={handleSubmit}
        className={`${P}-form`}
        style={{ ...formStyle, minHeight: scalingValue(minHeight, isEditor) }}
      >
        <div
          className={`${P}-inputWrap ${P}-overlayAnchor`}
          style={{ flex: 1, minWidth: 0 }}
        >
          {visibleFields.map((field) => (
            <input
              key={field.name}
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              name={field.name}
              autoComplete="off"
              value={displayValues[field.name] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
              placeholder={field.placeholder}
              required={field.type === 'email'}
              className={`${P}-input`}
              style={{
                ...inputCss,
                paddingRight: scalingValue(inputPadding.right, isEditor),
                paddingLeft: scalingValue(inputPadding.left, isEditor),
                paddingTop: scalingValue(inputPadding.top, isEditor),
                paddingBottom: scalingValue(inputPadding.bottom, isEditor),
              }}
            />
          ))}
        </div>
        <div className={`${P}-overlayAnchor`}>
          <button
            type="submit"
            className={`${P}-submitBtn`}
            aria-label={submitAriaLabel}
            style={{
              ...buttonCss,
              ...dividerWidthStyle,
              paddingRight: scalingValue(buttonPadding.right, isEditor),
              paddingLeft: scalingValue(buttonPadding.left, isEditor),
              paddingTop: scalingValue(buttonPadding.top, isEditor),
              paddingBottom: scalingValue(buttonPadding.bottom, isEditor),
            }}
          >
            {status === 'submitting'
              ? '...'
              : useIconButton
                ? (iconSrc ? <img src={iconSrc} alt="" draggable={false} /> : null)
                : labelText}
          </button>
        </div>
      </form>
      {displayStatus === 'success' && (
        <p
          className={`${P}-success`}
          style={{ ...inputCss, lineHeight: inputCss?.fontSize }}
        >
          {successMessage}
        </p>
      )}
      {displayStatus === 'error' && (
        <p
          className={`${P}-error`}
          style={{ ...inputCss, lineHeight: inputCss?.fontSize }}
          role="alert"
        >
          {validationErrorMessage ?? displayError ?? errorMessageText}
        </p>
      )}
    </div>
  );
};

type FieldConfig = {
  name: string;
  type: 'text' | 'phone' | 'email';
  placeholder: string;
};

type TextStyles = {
  fontSettings: {
    fontFamily?: string;
    fontWeight: number;
    fontStyle: string;
  };
  letterSpacing: number;
  wordSpacing: number;
  fontSize: number;
  color: string;
};

type OnelinerColorKeys =
  | 'strokeColor'
  | 'inputColor'
  | 'placeholderColor'
  | 'buttonColor'
  | 'inputTextColor'
  | 'buttonTextColor'
  | 'successColor'
  | 'errorColor';

type StateColorOverrides = Partial<Record<OnelinerColorKeys, string>>;

export type OnelinerFormButtonContent = {
  mode?: 'Label' | 'Icon';
  label?: string | null;
  icon?: string | null;
};

export type OnelinerFormSettings = {
  fields: FieldConfig[];
  fieldsToShow: number;
  buttonContent?: OnelinerFormButtonContent;
  submitButtonContent?: 'Label' | 'Icon';
  buttonLabel?: string | null;
  buttonIcon?: string | null;
  fontFamily?: string;
  input?: TextStyles;
  button?: TextStyles;
  minHeight: number;
  corners: number;
  stroke: number;
  inputPadding: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  buttonPadding: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  strokeColor: string;
  inputColor: string;
  placeholderColor: string;
  buttonColor: string;
  successColor: string;
  errorColor: string;
  inputTextColor?: string;
  buttonTextColor?: string;
  stateOverrides?: Record<string, StateColorOverrides>;
  successMessage?: string;
  errorMessage?: string;
};

const COLOR_VAR_MAP: Record<OnelinerColorKeys, string> = {
  strokeColor: 'stroke-color',
  inputColor: 'input-color',
  placeholderColor: 'placeholder-color',
  buttonColor: 'button-color',
  inputTextColor: 'input-text-color',
  buttonTextColor: 'button-text-color',
  successColor: 'success-color',
  errorColor: 'error-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;

function buildColorVars(
  P: string,
  defaults: Record<OnelinerColorKeys, string>,
  stateOverrides?: Record<string, StateColorOverrides>,
): React.CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, varSuffix] of Object.entries(COLOR_VAR_MAP)) {
    vars[`--${P}-${varSuffix}`] = defaults[key as OnelinerColorKeys];
  }
  if (stateOverrides) {
    for (const state of STATE_KEYS) {
      const overrides = stateOverrides[state];
      if (!overrides) continue;
      for (const [key, varSuffix] of Object.entries(COLOR_VAR_MAP)) {
        const val = overrides[key as OnelinerColorKeys];
        if (val !== undefined) {
          vars[`--${P}-${state}-${varSuffix}`] = val;
        }
      }
    }
  }
  return vars as unknown as React.CSSProperties;
}

function textStylesToCss(textStyles: TextStyles, isEditor?: boolean): React.CSSProperties {
  return {
    fontFamily: textStyles.fontSettings.fontFamily,
    fontWeight: textStyles.fontSettings.fontWeight,
    fontStyle: textStyles.fontSettings.fontStyle,
    letterSpacing: scalingValue(textStyles.letterSpacing, isEditor),
    wordSpacing: scalingValue(textStyles.wordSpacing, isEditor),
    fontSize: scalingValue(textStyles.fontSize, isEditor),
  };
}
