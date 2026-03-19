import React, { useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import styles from './Form.module.scss';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';

const FIELD_TYPES: FormFieldType[] = ['text', 'textarea', 'phone', 'email'];

type FormProps = {
  settings: FormSettings;
  content?: unknown;
  isEditor?: boolean;
  onUpdateSettings?: (settings: FormSettings) => void;
} & CommonComponentProps;

export function Form({ settings, isEditor, metadata, onUpdateSettings }: FormProps) {
  const {
    type = 'A',
    fieldsToShow = 2,
    fields = [],
    buttonLabel = 'Sign up',
    input: inputTextStyle,
    button: buttonTextStyle,
  } = settings;

  const layout = type === 'A' ? 'horizontal' : 'vertical';
  const visibleFields = fields.slice(0, Math.min(fieldsToShow, fields.length));

  const inputCss = inputTextStyle ? textStylesToCss(inputTextStyle, isEditor) : undefined;
  const buttonTextCss = buttonTextStyle ? textStylesToCss(buttonTextStyle, isEditor) : undefined;

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(visibleFields.map((f) => [f.name, '']))
  );
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

  const apiBase = metadata?.apiBase as string | undefined;
  const projectId = metadata?.projectId as string | undefined;
  const canSubmit = Boolean(apiBase && projectId);

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldEditorChange = (index: number, updates: Partial<FormFieldItem>) => {
    if (!onUpdateSettings) return;
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    onUpdateSettings({ ...settings, fields: updated });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (editingFieldIndex === null) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-form-field-popover]') || target.closest('[data-form-field-edit-btn]')) return;
      setEditingFieldIndex(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingFieldIndex]);

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
    <div className={styles.wrapper}>
      <form
        onSubmit={handleSubmit}
        className={cn(styles.form, {
          [styles.formHorizontal]: layout === 'horizontal',
          [styles.formVertical]: layout === 'vertical',
        })}
      >
        <div className={cn(styles.fields, {
          [styles.fieldsHorizontal]: layout === 'horizontal',
          [styles.fieldsVertical]: layout === 'vertical',
        })}>
          {visibleFields.map((field, index) => (
            <div key={field.name} className={cn(styles.fieldGroup, styles.fieldGroupWithPopover)}>
              <div className={styles.fieldInputRow}>
                <div className={styles.overlayAnchor}>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      autoComplete="off"
                      value={fieldValues[field.name] ?? ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={styles.input}
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
                      className={styles.input}
                      style={inputCss}
                    />
                  )}
                </div>
                {isEditor && (
                  <button
                    type="button"
                    className={styles.fieldEditBtn}
                    data-form-field-edit-btn
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingFieldIndex(editingFieldIndex === index ? null : index);
                    }}
                    title="Edit field"
                  />
                )}
              </div>
              {isEditor && editingFieldIndex === index && onUpdateSettings && (
                <div data-form-field-popover className={styles.fieldPopover}>
                  <div className={styles.fieldPopoverRow}>
                    <label>Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldEditorChange(index, { type: e.target.value as FormFieldType })}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.fieldPopoverRow}>
                    <label>Name</label>
                    <input
                      value={field.name}
                      onChange={(e) => handleFieldEditorChange(index, { name: e.target.value })}
                    />
                  </div>
                  <div className={styles.fieldPopoverRow}>
                    <label>Placeholder</label>
                    <input
                      value={field.placeholder}
                      onChange={(e) => handleFieldEditorChange(index, { placeholder: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.overlayAnchor}>
          <button
            type="submit"
            className={styles.button}
          >
            <span className={styles.overlayAnchor} style={buttonTextCss}>
              {status === 'submitting' ? '...' : buttonLabel}
            </span>
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

export type FormFieldType = 'text' | 'textarea' | 'phone' | 'email';

export type FormFieldItem = {
  name: string;
  type: FormFieldType;
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

type FormSettings = {
  type: 'A' | 'B';
  fieldsToShow: number;
  fields: FormFieldItem[];
  buttonLabel?: string;
  input?: TextStyles;
  button?: TextStyles;
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
