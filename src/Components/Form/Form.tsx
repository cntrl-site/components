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
  min-height: ${sv(48)};
}
.${P}-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.${P}-fields {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.${P}-field-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.${P}-field-group.${P}-labeled {
  gap: ${sv(4)};
}
.${P}-field-label {
  white-space: nowrap;
  color: var(--${P}-label-text-color);
}
.${P}-input {
  width: 100%;
  box-sizing: border-box;
  line-height: 1.4;
  outline: none;
  background-color: var(--${P}-input-color);
  color: var(--${P}-input-text-color);
  border-color: var(--${P}-input-border-color);
  transition: all 250ms;
}
.${P}-input::placeholder {
  color: var(--${P}-placeholder-color);
  opacity: 1;
  transition: all 250ms;
}
.${P}-input:hover {
  background-color: var(--${P}-hover-input-color, var(--${P}-input-color));
  color: var(--${P}-hover-input-text-color, var(--${P}-input-text-color));
  border-color: var(--${P}-hover-input-border-color, var(--${P}-input-border-color));
}
.${P}-wrapper.${P}-state-hover .${P}-input {
  background-color: var(--${P}-hover-input-color, var(--${P}-input-color));
  color: var(--${P}-hover-input-text-color, var(--${P}-input-text-color));
  border-color: var(--${P}-hover-input-border-color, var(--${P}-input-border-color));
}
.${P}-input:focus,
.${P}-input:focus-visible,
.${P}-wrapper.${P}-state-focus .${P}-input {
  background-color: var(--${P}-focus-input-color, var(--${P}-input-color));
  color: var(--${P}-focus-input-text-color, var(--${P}-input-text-color));
  border-color: var(--${P}-focus-input-border-color, var(--${P}-input-border-color));
}
.${P}-wrapper.${P}-state-filled .${P}-input {
  background-color: var(--${P}-filled-input-color, var(--${P}-input-color));
  color: var(--${P}-filled-input-text-color, var(--${P}-input-text-color));
  border-color: var(--${P}-filled-input-border-color, var(--${P}-input-border-color));
}
.${P}-wrapper.${P}-state-success .${P}-input,
.${P}-wrapper.${P}-state-success .${P}-button {
  pointer-events: none;
}
.${P}-wrapper.${P}-state-error .${P}-input {
}
.${P}-input[data-field-type="textarea"] {
  resize: vertical;
  min-height: 60px;
}
.${P}-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
.${P}-button {
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  background-color: var(--${P}-button-color);
  color: var(--${P}-button-text-color);
  border-color: var(--${P}-button-border-color);
  transition: all 250ms;
}
.${P}-button:hover {
  background-color: var(--${P}-hover-button-color, var(--${P}-button-color));
  color: var(--${P}-hover-button-text-color, var(--${P}-button-text-color));
  border-color: var(--${P}-hover-button-border-color, var(--${P}-button-border-color));
}
.${P}-wrapper.${P}-state-hover .${P}-button {
  background-color: var(--${P}-hover-button-color, var(--${P}-button-color));
  color: var(--${P}-hover-button-text-color, var(--${P}-button-text-color));
  border-color: var(--${P}-hover-button-border-color, var(--${P}-button-border-color));
}
.${P}-button:focus,
.${P}-button:focus-visible,
.${P}-wrapper.${P}-state-focus .${P}-button {
  background-color: var(--${P}-focus-button-color, var(--${P}-button-color));
  color: var(--${P}-focus-button-text-color, var(--${P}-button-text-color));
  border-color: var(--${P}-focus-button-border-color, var(--${P}-button-border-color));
}
.${P}-input:focus-visible,
.${P}-wrapper.${P}-state-focus .${P}-input {
  outline: 1px solid var(--${P}-focus-input-border-color, var(--${P}-input-border-color));
}
.${P}-button:focus-visible,
.${P}-wrapper.${P}-state-focus .${P}-button {
  outline: 1px solid var(--${P}-focus-button-border-color, var(--${P}-button-border-color));
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
.${P}-overlay-anchor {
  position: relative;
  height: auto;
}
`;
}

type FormProps = {
  settings: FormSettings;
  content?: unknown;
  isEditor?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: FormSettings) => void;
} & CommonComponentProps;

export function Form({ settings, isEditor, metadata, activeEvent }: FormProps) {
  const { prefix: P } = useScopedStyles();
  const {
    type = 'A',
    fieldsToShow = 2,
    fields = [],
    buttonLabel = 'Sign up',
    input: inputTextStyle,
    button: buttonTextStyle,
    gap = 0.008,
    fieldsGap = 0.008,
    label: labelTextStyle,
    buttonCorners,
    buttonStroke,
    inputCorners,
    inputStroke,
    buttonPadding,
    inputPadding,
    inputColor,
    inputTextColor,
    inputBorderColor,
    placeholderColor,
    buttonColor,
    buttonTextColor,
    buttonBorderColor,
    labelTextColor,
    successColor,
    errorColor,
    fontFamily,
    successMessage,
    errorMessage: errorMessageText,
    stateOverrides,
  } = settings;

  const showLabels = type === 'B';
  const visibleFields = fields.slice(0, Math.min(fieldsToShow, fields.length));
  const inputCss = inputTextStyle
    ? textStylesToCss(
        {
          ...inputTextStyle,
          fontSettings: { ...inputTextStyle.fontSettings, fontFamily },
        },
        isEditor,
      )
    : undefined;
  const inputFieldCss = {
    ...inputCss,
    borderStyle: 'solid',
    borderRadius: scalingValue(inputCorners ?? 0, isEditor),
    borderWidth: scalingValue(inputStroke ?? 0, isEditor),
    paddingTop: scalingValue(inputPadding?.top ?? 0, isEditor),
    paddingRight: scalingValue(inputPadding?.right ?? 0, isEditor),
    paddingBottom: scalingValue(inputPadding?.bottom ?? 0, isEditor),
    paddingLeft: scalingValue(inputPadding?.left ?? 0, isEditor),
  } as React.CSSProperties;
  const buttonTextCss = buttonTextStyle
    ? textStylesToCss(
        {
          ...buttonTextStyle,
          fontSettings: { ...buttonTextStyle.fontSettings, fontFamily },
        },
        isEditor,
      )
    : undefined;
  const labelTextCss = labelTextStyle
    ? textStylesToCss(
        {
          ...labelTextStyle,
          fontSettings: { ...labelTextStyle.fontSettings, fontFamily },
        },
        isEditor,
      )
    : undefined;

  const colorVars = buildColorVars(P, {
    inputColor,
    inputTextColor,
    inputBorderColor,
    placeholderColor: placeholderColor?.trim() ? placeholderColor : '#cccccc',
    buttonColor,
    buttonTextColor,
    buttonBorderColor,
    labelTextColor,
    successColor,
    errorColor,
  }, stateOverrides);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
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
    : fieldValues;
  const validationErrorMessage =
    displayStatus === 'error'
      ? getFormFieldValidationError(visibleFields, displayValues)
      : null;
  const stateClass = activeEvent && activeEvent !== 'default' ? `${P}-state-${activeEvent}` : '';

  const submitUrl = metadata?.submitUrl as string | undefined;
  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      visibleFields.map((f) => [f.name, fieldValues[f.name]?.trim() ?? '']).filter(([, v]) => v)
    );
    if (!submitUrl || Object.keys(payload).length === 0) return;

    const validationError = getFormFieldValidationError(visibleFields, fieldValues);
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
      setFieldValues(Object.fromEntries(visibleFields.map((f) => [f.name, ''])));
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
        style={{ gap: scalingValue(gap, isEditor) }}
      >
        <div
          className={`${P}-fields`}
          style={{ gap: scalingValue(fieldsGap, isEditor) }}
        >
          {visibleFields.map((field, index) => (
            <div key={index} className={`${P}-field-group${showLabels ? ` ${P}-labeled` : ''}`}>
              {showLabels && (
                <span className={`${P}-field-label`} style={labelTextCss ? { ...labelTextCss, lineHeight: labelTextCss.fontSize } : undefined}>
                  {field.label || field.name}
                </span>
              )}
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  autoComplete="off"
                  value={displayValues[field.name] ?? ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className={`${P}-input`}
                  style={inputFieldCss}
                  rows={1}
                  data-field-type="textarea"
                />
              ) : (
                <input
                  type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
                  name={field.name}
                  autoComplete="off"
                  value={displayValues[field.name] ?? ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.type === 'email'}
                  className={`${P}-input`}
                  style={inputFieldCss}
                />
              )}
            </div>
          ))}
        </div>
        <div className={`${P}-overlay-anchor`}>
          <button
            type="submit"
            className={`${P}-button`}
            style={{
              borderStyle: 'solid',
              borderRadius: scalingValue(buttonCorners ?? 0, isEditor),
              borderWidth: scalingValue(buttonStroke ?? 0, isEditor),
              paddingTop: scalingValue(buttonPadding?.top ?? 0, isEditor),
              paddingRight: scalingValue(buttonPadding?.right ?? 0, isEditor),
              paddingBottom: scalingValue(buttonPadding?.bottom ?? 0, isEditor),
              paddingLeft: scalingValue(buttonPadding?.left ?? 0, isEditor),
              ...buttonTextCss,
            }}
          >
            <span className={`${P}-overlay-anchor`}>
              {status === 'submitting' ? '...' : buttonLabel}
            </span>
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
}

export type FormFieldType = 'text' | 'textarea' | 'phone' | 'email';

export type FormFieldItem = {
  name: string;
  type: FormFieldType;
  placeholder: string;
  label?: string;
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
  lineHeight?: number;
  textAppearance?: {
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline';
    fontVariant?: 'normal' | 'small-caps';
  };
  color: string;
};

type Padding = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

type ColorKeys =
  | 'inputColor'
  | 'inputTextColor'
  | 'inputBorderColor'
  | 'placeholderColor'
  | 'buttonColor'
  | 'buttonTextColor'
  | 'buttonBorderColor'
  | 'labelTextColor'
  | 'successColor'
  | 'errorColor';

type StateColorOverrides = Partial<Record<ColorKeys, string>>;

type FormSettings = {
  type: 'A' | 'B';
  fontFamily: string;
  fieldsToShow: number;
  fields: FormFieldItem[];
  buttonLabel?: string;
  input?: TextStyles;
  button?: TextStyles;
  gap?: number;
  fieldsGap?: number;
  label?: TextStyles;
  buttonCorners?: number;
  buttonStroke?: number;
  inputCorners?: number;
  inputStroke?: number;
  buttonPadding?: Padding;
  inputPadding?: Padding;
  inputColor: string;
  inputTextColor: string;
  inputBorderColor: string;
  placeholderColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  labelTextColor: string;
  successColor: string;
  errorColor: string;
  successMessage: string;
  errorMessage: string;
  stateOverrides?: Record<string, StateColorOverrides>;
};

const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  inputColor: 'input-color',
  inputTextColor: 'input-text-color',
  inputBorderColor: 'input-border-color',
  placeholderColor: 'placeholder-color',
  buttonColor: 'button-color',
  buttonTextColor: 'button-text-color',
  buttonBorderColor: 'button-border-color',
  labelTextColor: 'label-text-color',
  successColor: 'success-color',
  errorColor: 'error-color',
};

const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;

function buildColorVars(
  P: string,
  defaults: Record<ColorKeys, string>,
  stateOverrides?: Record<string, StateColorOverrides>,
): React.CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, varSuffix] of Object.entries(COLOR_VAR_MAP)) {
    vars[`--${P}-${varSuffix}`] = defaults[key as ColorKeys];
  }
  if (stateOverrides) {
    for (const state of STATE_KEYS) {
      const overrides = stateOverrides[state];
      if (!overrides) continue;
      for (const [key, varSuffix] of Object.entries(COLOR_VAR_MAP)) {
        const val = overrides[key as ColorKeys];
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
    lineHeight: textStyles.lineHeight !== undefined ? scalingValue(textStyles.lineHeight, isEditor) : undefined,
    textTransform: textStyles.textAppearance?.textTransform,
    textDecoration: textStyles.textAppearance?.textDecoration,
    fontVariant: textStyles.textAppearance?.fontVariant
  };
}
