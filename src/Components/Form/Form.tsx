import React, { useState } from 'react';
import { CommonComponentProps } from '../props';
import { buildColorVars, getFormFieldValidationError, scalingValue, useScopedStyles } from '../utils/index';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';

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
.${P}-wrapper.${P}-type-C .${P}-input:focus-visible,
.${P}-wrapper.${P}-type-C .${P}-button:focus-visible {
  outline: none;
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
  outline: none;
  background-color: var(--${P}-input-color);
  color: var(--${P}-input-text-color);
  border-color: var(--${P}-input-border-color);
  transition: color 250ms, border-color 250ms, background-color 250ms;
}
.${P}-input::placeholder {
  color: var(--${P}-placeholder-color);
  opacity: 1;
  transition: color 250ms, opacity 250ms;
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
.${P}-input[data-filled="true"] {
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
}
.${P}-input:disabled {
  cursor: not-allowed;
}
.${P}-button {
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
  outline: none;
  background-color: var(--${P}-button-color);
  color: var(--${P}-button-text-color);
  border-color: var(--${P}-button-border-color);
  transition: color 250ms, background-color 250ms, border-color 250ms;
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
  outline: none;
}
.${P}-button:focus-visible,
.${P}-wrapper.${P}-state-focus .${P}-button {
  outline: none;
}
.${P}-success {
  margin-top: ${sv(8)};
  color: var(--${P}-success-success-color, var(--${P}-success-color));
}
.${P}-error {
  margin-top: ${sv(8)};
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
    buttonLabel,
    gap,
    fieldsGap,
    buttonCorners,
    buttonStroke,
    buttonPadding,
    isButtonFullWidth,
    inputCorners,
    inputStroke,
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
    inputFontSettings,
    inputFontSize,
    inputLineHeight,
    inputLetterSpacing,
    inputWordSpacing,
    inputTextAppearance,
    buttonFontSettings,
    buttonFontSize,
    buttonLineHeight,
    buttonLetterSpacing,
    buttonWordSpacing,
    buttonTextAppearance,
    labelFontSettings,
    labelFontSize,
    labelLineHeight,
    labelLetterSpacing,
    labelWordSpacing,
    labelTextAppearance,
    statusFontSettings,
    statusFontSize,
    statusLineHeight,
    statusLetterSpacing,
    statusWordSpacing,
    statusTextAppearance,
    successMessage,
    errorMessage: errorMessageText,
    stateOverrides,
  } = settings;

  const showLabels = type === 'B';
  const visibleFields = fields.slice(0, Math.min(fieldsToShow, fields.length));

  const resolvedInputTextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: inputFontSettings?.fontWeight ?? 400,
      fontStyle: inputFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: inputFontSize ?? 0.01,
    lineHeight: inputLineHeight,
    letterSpacing: inputLetterSpacing ?? 0,
    wordSpacing: inputWordSpacing ?? 0,
    textAppearance: inputTextAppearance,
    color: inputTextColor,
  };
  const inputCss = textStylesToCss(resolvedInputTextStyle, isEditor);
  const strokeForInput = scalingValue(inputStroke ?? 0, isEditor);
  const inputFieldCss = {
    ...inputCss,
    borderStyle: 'solid',
    borderRadius: type === 'C' ? 0 : scalingValue(inputCorners ?? 0, isEditor),
    ...(type === 'C'
      ? {
          borderTopWidth: 0,
          borderRightWidth: 0,
          borderBottomWidth: strokeForInput,
          borderLeftWidth: 0,
        }
      : { borderWidth: strokeForInput }),
    paddingTop: scalingValue(inputPadding?.top ?? 0, isEditor),
    paddingRight: scalingValue(inputPadding?.right ?? 0, isEditor),
    paddingBottom: scalingValue(inputPadding?.bottom ?? 0, isEditor),
    paddingLeft: scalingValue(inputPadding?.left ?? 0, isEditor),
  } as React.CSSProperties;

  const resolvedButtonTextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: buttonFontSettings?.fontWeight ?? 400,
      fontStyle: buttonFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: buttonFontSize ?? 0.01,
    lineHeight: buttonLineHeight,
    letterSpacing: buttonLetterSpacing ?? 0,
    wordSpacing: buttonWordSpacing ?? 0,
    textAppearance: buttonTextAppearance,
    color: buttonTextColor,
  };
  const buttonTextCss = textStylesToCss(resolvedButtonTextStyle, isEditor);
  const strokeForButton = scalingValue(buttonStroke ?? 0, isEditor);

  const resolvedLabelTextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: labelFontSettings?.fontWeight ?? 400,
      fontStyle: labelFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: labelFontSize ?? 0.01,
    lineHeight: labelLineHeight,
    letterSpacing: labelLetterSpacing ?? 0,
    wordSpacing: labelWordSpacing ?? 0,
    textAppearance: labelTextAppearance,
    color: labelTextColor,
  };
  const labelTextCss = textStylesToCss(resolvedLabelTextStyle, isEditor);

  const resolvedStatusTextStyle: TextStyles = {
    fontSettings: {
      fontFamily,
      fontWeight: statusFontSettings?.fontWeight ?? 400,
      fontStyle: statusFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: statusFontSize ?? 0.01,
    lineHeight: statusLineHeight,
    letterSpacing: statusLetterSpacing ?? 0,
    wordSpacing: statusWordSpacing ?? 0,
    textAppearance: statusTextAppearance,
    color: successColor,
  };
  const statusTextCss = textStylesToCss(resolvedStatusTextStyle, isEditor);

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
  }, COLOR_VAR_MAP, STATE_KEYS, stateOverrides);

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
  const wrapperStateClasses = `${stateClass}`.trim();

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
    <div className={`${P}-wrapper ${P}-type-${type} ${wrapperStateClasses}`.trim()} style={colorVars}>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P) }} />
      <form
        onSubmit={handleSubmit}
        className={`${P}-form`}
        style={{ gap: scalingValue(gap ?? 0, isEditor) }}
      >
        <div
          className={`${P}-fields`}
          style={{ gap: scalingValue(fieldsGap ?? 0, isEditor) }}
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
                  data-filled={((displayValues[field.name] ?? '') as string).trim().length > 0}
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
                  required={field.isRequired ?? field.type === 'email'}
                  className={`${P}-input`}
                  style={inputFieldCss}
                  data-filled={((displayValues[field.name] ?? '') as string).trim().length > 0}
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
              borderWidth: strokeForButton,
              paddingTop: scalingValue(buttonPadding?.top ?? 0, isEditor),
              paddingRight: scalingValue(buttonPadding?.right ?? 0, isEditor),
              paddingBottom: scalingValue(buttonPadding?.bottom ?? 0, isEditor),
              paddingLeft: scalingValue(buttonPadding?.left ?? 0, isEditor),
              ...buttonTextCss,
              ...(isButtonFullWidth
                ? {
                  width: '100%',
                  textAlign: 'center',
                  whiteSpace: 'normal',
                }
                : {}),
            }}
          >
            <span
              className={`${P}-overlay-anchor`}
              style={isButtonFullWidth
                ? {
                  display: 'inline-block',
                  maxWidth: '100%',
                  whiteSpace: 'normal',
                  textAlign: 'center',
                }
                : undefined}
            >
              {status === 'submitting' ? '...' : buttonLabel}
            </span>
          </button>
        </div>
      </form>
      {displayStatus === 'success' && (
        <p
          className={`${P}-success`}
          style={{ ...statusTextCss }}
        >
          {successMessage}
        </p>
      )}
      {displayStatus === 'error' && (
        <p
          className={`${P}-error`}
          style={{ ...statusTextCss}}
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
  isRequired?: boolean;
  error?: string;
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
  type: 'A' | 'B' | 'C';
  fontFamily: string;
  fieldsToShow: number;
  fields: FormFieldItem[];
  buttonLabel?: string;
  gap?: number;
  fieldsGap?: number;
  inputFontSettings?: { fontWeight: number; fontStyle: string };
  inputFontSize?: number;
  inputLineHeight?: number;
  inputLetterSpacing?: number;
  inputWordSpacing?: number;
  inputTextAppearance?: TextStyles['textAppearance'];
  buttonFontSettings?: { fontWeight: number; fontStyle: string };
  buttonFontSize?: number;
  buttonLineHeight?: number;
  buttonLetterSpacing?: number;
  buttonWordSpacing?: number;
  buttonTextAppearance?: TextStyles['textAppearance'];
  labelFontSettings?: { fontWeight: number; fontStyle: string };
  labelFontSize?: number;
  labelLineHeight?: number;
  labelLetterSpacing?: number;
  labelWordSpacing?: number;
  labelTextAppearance?: TextStyles['textAppearance'];
  statusFontSettings?: { fontWeight: number; fontStyle: string };
  statusFontSize?: number;
  statusLineHeight?: number;
  statusLetterSpacing?: number;
  statusWordSpacing?: number;
  statusTextAppearance?: TextStyles['textAppearance'];
  buttonCorners?: number;
  buttonStroke?: number;
  buttonPadding?: Padding;
  isButtonFullWidth?: boolean;
  inputCorners?: number;
  inputStroke?: number;
  inputPadding?: Padding;
  inputColor: string;
  inputTextColor: string;
  inputBorderColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  placeholderColor: string;
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
