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
    field = { name: 'email', type: 'email', placeholder: 'Your email' },
    buttonLabel = 'Submit',
    input: inputTextStyle,
    button: buttonTextStyle,
    corners = 40, // TODO remake when settings arrive
    stroke = 1, // TODO remake when settings arrive
    strokeColor = '#cccccc',
  } = settings;

  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBase = metadata?.apiBase as string | undefined;
  const projectId = metadata?.projectId as string | undefined;
  const canSubmit = Boolean(apiBase && projectId);

  const inputCss = inputTextStyle ? textStylesToCss(inputTextStyle, isEditor) : undefined;
  const buttonCss = buttonTextStyle ? textStylesToCss(buttonTextStyle, isEditor) : undefined;

  const formStyle: React.CSSProperties = {
    borderRadius: scalingValue(corners / 1440, isEditor), // TODO remake when settings arrive
    borderWidth: scalingValue(stroke / 1440, isEditor), // TODO remake when settings arrive
    borderStyle: 'solid',
    borderColor: strokeColor,
  };

  const dividerStyle: React.CSSProperties = {
    borderLeftWidth: scalingValue(stroke / 1440, isEditor), // TODO remake when settings arrive
    borderLeftStyle: 'solid',
    borderLeftColor: strokeColor,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!canSubmit || !trimmed) return;

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field.name]: trimmed,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      setStatus('success');
      setValue('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form} style={formStyle}>
        <div className={styles.overlayAnchor} style={{ flex: 1, minWidth: 0 }}>
          <input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            name={field.name}
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            required={field.type === 'email'}
            className={styles.input}
            style={inputCss}
          />
        </div>
        <div className={styles.overlayAnchor}>
          <button
            type="submit"
            className={styles.submitBtn}
            style={{ ...buttonCss, ...dividerStyle }}
          >
            {status === 'submitting' ? '...' : buttonLabel}
          </button>
        </div>
      </form>
      {status === 'success' && <p className={styles.success}>Thanks for subscribing!</p>}
      {status === 'error' && errorMessage && (
        <p className={styles.error} role="alert">{errorMessage}</p>
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
  field: FieldConfig;
  buttonLabel: string;
  input?: TextStyles;
  button?: TextStyles;
  corners: number;
  stroke: number;
  strokeColor: string;
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
