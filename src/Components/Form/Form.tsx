import React, { useState } from 'react';
import { CommonComponentProps } from '../props';
import { scalingValue, useScopedStyles } from '../utils/index';

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
  width: 100%;
}
.${P}-form.${P}-horizontal {
  flex-direction: row;
  align-items: center;
}
.${P}-form.${P}-vertical {
  flex-direction: column;
}
.${P}-fields {
  display: flex;
  flex: 1;
  min-width: 0;
}
.${P}-fields.${P}-horizontal {
  flex-direction: row;
}
.${P}-fields.${P}-vertical {
  flex-direction: column;
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
}
.${P}-input {
  width: 100%;
  padding-top: ${sv(10)};
  padding-bottom: ${sv(10)};
  padding-left: ${sv(14)};
  padding-right: ${sv(14)};
  font-size: ${sv(14)};
  line-height: 1.4;
  background: transparent;
  border: 1px solid #ccc;
  border-radius: ${sv(4)};
  outline: none;
}
.${P}-input:focus {
  border-color: #333;
}
.${P}-input[data-field-type='textarea'] {
  resize: vertical;
  min-height: 60px;
}
.${P}-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
.${P}-button {
  padding-top: ${sv(10)};
  padding-bottom: ${sv(10)};
  padding-left: ${sv(20)};
  padding-right: ${sv(20)};
  cursor: pointer;
  white-space: nowrap;
}
.${P}-success {
  margin-top: ${sv(8)};
  font-size: ${sv(14)};
  color: #22c55e;
}
.${P}-error {
  margin-top: ${sv(8)};
  font-size: ${sv(14)};
  color: #ef4444;
}
.${P}-overlay-anchor {
  position: relative;
  height: auto;
}
.${P}-gap-spacer {
  flex: 0 0 auto;
}
.${P}-fields-gap-spacer {
  flex: 0 0 auto;
}
`;
}

type FormProps = {
  settings: FormSettings;
  content?: unknown;
  isEditor?: boolean;
  onUpdateSettings?: (settings: FormSettings) => void;
} & CommonComponentProps;

export function Form({ settings, isEditor, metadata }: FormProps) {
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
  } = settings;

  const layout = type === 'A' ? 'horizontal' : 'vertical';
  const showLabels = type === 'C';
  const visibleFields = fields.slice(0, Math.min(fieldsToShow, fields.length));
  const inputCss = inputTextStyle ? textStylesToCss(inputTextStyle, isEditor) : undefined;
  const buttonTextCss = buttonTextStyle ? textStylesToCss(buttonTextStyle, isEditor) : undefined;
  const labelTextCss = labelTextStyle ? textStylesToCss(labelTextStyle, isEditor) : undefined;

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(visibleFields.map((f) => [f.name, '']))
  );
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiBase = metadata?.apiBase as string | undefined;
  const projectId = metadata?.projectId as string | undefined;
  const canSubmit = Boolean(apiBase && projectId);

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      visibleFields.map((f) => [f.name, fieldValues[f.name]?.trim() ?? '']).filter(([, v]) => v)
    );
    if (!canSubmit || Object.keys(payload).length === 0) return;

    setStatus('submitting');
    setErrorMessage(null);

    try {
      // TODO: URL should be /projects/:projectId/forms/{configId}/submit
      const res = await fetch(`${apiBase}/projects/${projectId}/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
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
    <div className={`${P}-wrapper`}>
      <style>{getCSS(P)}</style>
      <form
        onSubmit={handleSubmit}
        className={`${P}-form ${P}-${layout}`}
      >
        <div className={`${P}-fields ${P}-${layout}`}>
          {visibleFields.map((field, index) => (
            <React.Fragment key={index}>
              <div className={`${P}-field-group${showLabels ? ` ${P}-labeled` : ''}`}>
                {showLabels && (
                  <span className={`${P}-field-label`} style={labelTextCss}>
                    {field.label || field.name}
                  </span>
                )}
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    autoComplete="off"
                    value={fieldValues[field.name] ?? ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={`${P}-input`}
                    style={inputCss}
                    rows={3}
                    data-field-type="textarea"
                  />
                ) : (
                  <input
                    type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
                    name={field.name}
                    autoComplete="off"
                    value={fieldValues[field.name] ?? ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.type === 'email'}
                    className={`${P}-input`}
                    style={inputCss}
                  />
                )}
              </div>
              {index < visibleFields.length - 1 && (
                <div
                  data-axis={layout === 'horizontal' ? 'x' : 'y'}
                  className={`${P}-overlay-anchor ${P}-fields-gap-spacer`}
                  data-controls="settings.fieldsGap"
                  style={layout === 'horizontal'
                    ? ({ width: scalingValue(fieldsGap, isEditor), height: 'auto' } as React.CSSProperties)
                    : ({ height: scalingValue(fieldsGap, isEditor), width: '100%' } as React.CSSProperties)}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div
          data-axis={layout === 'horizontal' ? 'x' : 'y'}
          className={`${P}-overlay-anchor ${P}-gap-spacer`}
          data-controls="settings.gap"
          style={layout === 'horizontal'
            ? ({ width: scalingValue(gap, isEditor), height: '100%' } as React.CSSProperties)
            : ({ height: scalingValue(gap, isEditor), width: '100%' } as React.CSSProperties)}
        />
        <div className={`${P}-overlay-anchor`}>
          <button type="submit" className={`${P}-button`}>
            <span className={`${P}-overlay-anchor`} style={buttonTextCss}>
              {status === 'submitting' ? '...' : buttonLabel}
            </span>
          </button>
        </div>
      </form>
      {status === 'success' && <p className={`${P}-success`}>Thanks for subscribing!</p>}
      {status === 'error' && errorMessage && (
        <p className={`${P}-error`} role="alert">{errorMessage}</p>
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
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
  };
  letterSpacing: number;
  wordSpacing: number;
  fontSize: number;
  color: string;
};

type FormSettings = {
  type: 'A' | 'B' | 'C';
  fieldsToShow: number;
  fields: FormFieldItem[];
  buttonLabel?: string;
  input?: TextStyles;
  button?: TextStyles;
  gap?: number;
  fieldsGap?: number;
  label?: TextStyles;
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
