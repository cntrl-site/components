import React, { useState } from 'react';
import styles from './OnelinerForm.module.scss';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';

type OnelinerFormProps = {
  settings: OnelinerFormSettings;
  content?: unknown;
  isEditor?: boolean;
} & CommonComponentProps;

export function OnelinerForm({ settings, isEditor, metadata }: OnelinerFormProps) {
  const {
    fields = [{ name: 'email', type: 'email', placeholder: 'Your email' }],
    buttonLabel = 'Submit',
    input: inputTextStyle,
    button: buttonTextStyle,
    height,
    corners,
    stroke,
    strokeColor,
    inputColor,
    placeholderColor,
    buttonColor,
    successColor,
    errorColor,
    fieldsToShow,
    inputPadding,
    buttonPadding,
  } = settings;

  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBase = metadata?.apiBase as string | undefined;
  const projectId = metadata?.projectId as string | undefined;
  const canSubmit = Boolean(apiBase && projectId);

  const inputCss = inputTextStyle ? textStylesToCss(inputTextStyle, isEditor) : undefined;
  const buttonCss = buttonTextStyle ? textStylesToCss(buttonTextStyle, isEditor) : undefined;

  const formStyle: React.CSSProperties = {
    borderRadius: scalingValue(corners, isEditor), // TODO remake when settings arrive
    borderWidth: scalingValue(stroke, isEditor), // TODO remake when settings arrive
    borderStyle: 'solid',
    borderColor: strokeColor,
  };

  const dividerStyle: React.CSSProperties = {
    borderLeftWidth: scalingValue(stroke, isEditor), // TODO remake when settings arrive
    borderLeftStyle: 'solid',
    borderLeftColor: strokeColor,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = Object.values(values).join('').trim();
    if (!canSubmit || !trimmed) return;

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields.map((field) => ({ [field.name]: trimmed })),
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      setStatus('success');
      setValues({});
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form} style={{ ...formStyle, height: scalingValue(height, isEditor)}}>
        <div className={styles.overlayAnchor} style={{ flex: 1, minWidth: 0, backgroundColor: inputColor }}>
          {fields.slice(0, fieldsToShow).map((field) => (
            <input
              key={field.name}
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              name={field.name}
              autoComplete="off"
              value={values[field.name] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
              placeholder={field.placeholder}
              required={field.type === 'email'}
              className={styles.input}
              style={{ ...inputCss, paddingRight: scalingValue(inputPadding.right, isEditor), paddingLeft: scalingValue(inputPadding.left, isEditor), '--placeholder-color': placeholderColor } as React.CSSProperties}
            />
          ))}
        </div>
        <div className={styles.overlayAnchor}>
          <button
            type="submit"
            className={styles.submitBtn}
            style={{ ...buttonCss, ...dividerStyle, backgroundColor: buttonColor, paddingRight: scalingValue(buttonPadding.right, isEditor), paddingLeft: scalingValue(buttonPadding.left, isEditor) }}
          >
            {status === 'submitting' ? '...' : buttonLabel}
          </button>
        </div>
      </form>
      {status === 'success' && <p className={styles.success} style={{ color: successColor }}>Thanks for subscribing!</p>}
      {status === 'error' && errorMessage && (
        <p className={styles.error} style={{ color: errorColor }} role="alert">{errorMessage}</p>
      )}
    </div>
  );
}

type FieldConfig = {
  name: string;
  type: 'text' | 'phone' | 'email';
  placeholder: string;
};

type TextStyles = {
  fontSettings: {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
  };
  letterSpacing: number;
  wordSpacing: number;
  fontSize: number;
  color: string;
};

export type OnelinerFormSettings = {
  fields: FieldConfig[];
  fieldsToShow: number;
  buttonLabel: string;
  input?: TextStyles;
  button?: TextStyles;
  height: number;
  corners: number;
  stroke: number;
  inputPadding: {
    left: number;
    right: number;
  };
  buttonPadding: {
    left: number;
    right: number;
  };
  strokeColor: string;
  inputColor: string;
  placeholderColor: string;
  buttonColor: string;
  successColor: string;
  errorColor: string;
};

function textStylesToCss(textStyles: TextStyles, isEditor?: boolean): React.CSSProperties {
  return {
    fontFamily: textStyles.fontSettings.fontFamily,
    fontWeight: textStyles.fontSettings.fontWeight,
    fontStyle: textStyles.fontSettings.fontStyle,
    letterSpacing: scalingValue(textStyles.letterSpacing, isEditor),
    wordSpacing: scalingValue(textStyles.wordSpacing, isEditor),
    fontSize: scalingValue(textStyles.fontSize, isEditor),
    color: textStyles.color,
  };
}
