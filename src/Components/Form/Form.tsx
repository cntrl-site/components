import React, { useState, useEffect, useRef } from 'react';
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
    labelTextColor
  } = settings;

  const layout = type === 'A' ? 'horizontal' : 'vertical';
  const showLabels = type === 'C';
  const visibleFields = fields.slice(0, Math.min(fieldsToShow, fields.length));
  const inputCss = inputTextStyle ? textStylesToCss(inputTextStyle, isEditor) : undefined;
  const inputFieldCss = {
    ...inputCss,
    borderStyle: 'solid',
    borderRadius: scalingValue(inputCorners ?? 0, isEditor),
    borderWidth: scalingValue(inputStroke ?? 0, isEditor),
    paddingTop: scalingValue(inputPadding?.top ?? 0, isEditor),
    paddingRight: scalingValue(inputPadding?.right ?? 0, isEditor),
    paddingBottom: scalingValue(inputPadding?.bottom ?? 0, isEditor),
    paddingLeft: scalingValue(inputPadding?.left ?? 0, isEditor),
    backgroundColor: inputColor,
    color: inputTextColor,
    borderColor: inputBorderColor,
    '--placeholder-color': placeholderColor,
  } as React.CSSProperties;
  const buttonTextCss = buttonTextStyle ? textStylesToCss(buttonTextStyle, isEditor) : undefined;
  const labelTextCss = labelTextStyle ? textStylesToCss(labelTextStyle, isEditor) : undefined;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const fieldsContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonContainerRef = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(visibleFields.map((f) => [f.name, '']))
  );
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

  const apiBase = metadata?.apiBase as string | undefined;
  const projectId = metadata?.projectId as string | undefined;
  const configId = metadata?.pluginConfigId as string | undefined;
  const canSubmit = Boolean(apiBase && projectId && configId);

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
      const url = `${apiBase}/projects/${projectId}/forms/${configId}/submit`;
      const res = await fetch(url, {
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
    <div
      ref={wrapperRef}
      className={styles.wrapper}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={cn(styles.form, {
          [styles.formHorizontal]: layout === 'horizontal',
          [styles.formVertical]: layout === 'vertical',
        })}
      >
        <div
          ref={fieldsContainerRef}
          className={cn(styles.fields, {
          [styles.fieldsHorizontal]: layout === 'horizontal',
          [styles.fieldsVertical]: layout === 'vertical',
        })}
        >
          {visibleFields.map((field, index) => (
            <React.Fragment key={index}>
              <div className={cn(styles.fieldGroup, styles.fieldGroupWithPopover, {
                [styles.fieldGroupLabeled]: showLabels,
              })}>
                {showLabels && (
                  <span className={styles.fieldLabel} style={{...labelTextCss, color: labelTextColor}}>
                    {field.label || field.name}
                  </span>
                )}
                <div className={styles.fieldInputWrapper}>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      autoComplete="off"
                      value={fieldValues[field.name] ?? ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={styles.input}
                      style={inputFieldCss}
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
                      style={inputFieldCss}
                    />
                  )}
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
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          handleFieldEditorChange(index, { name: nextValue });
                        }}
                      />
                    </div>
                    <div className={styles.fieldPopoverRow}>
                      <label>Placeholder</label>
                      <input
                        value={field.placeholder}
                        onChange={(e) => handleFieldEditorChange(index, { placeholder: e.target.value })}
                      />
                    </div>
                    <div className={styles.fieldPopoverRow}>
                      <label>Label</label>
                      <input
                        value={field.label ?? ''}
                        onChange={(e) => handleFieldEditorChange(index, { label: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
              {index < visibleFields.length - 1 && (
                <div
                  data-axis={layout === 'horizontal' ? 'x' : 'y'}
                  className={cn(styles.overlayAnchor, styles.fieldsGapSpacer)}
                  data-controls="settings.fieldsGap"
                  style={layout === 'horizontal'
                    ? ({ width: scalingValue(fieldsGap, isEditor), height: 'auto' })
                    : ({ height: scalingValue(fieldsGap, isEditor), width: '100%' })}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div
          data-axis={layout === 'horizontal' ? 'x' : 'y'}
          className={cn(styles.overlayAnchor, styles.gapSpacer)}
          data-controls="settings.gap"
          style={layout === 'horizontal'
            ? ({ width: scalingValue(gap, isEditor) })
            : ({ height: scalingValue(gap, isEditor), width: '100%' })}
        />
        <div className={styles.overlayAnchor}>
          <button
            type="submit"
            className={styles.button}
            ref={buttonContainerRef}
            style={{
              borderStyle: 'solid',
              borderRadius: scalingValue(buttonCorners ?? 0, isEditor),
              borderWidth: scalingValue(buttonStroke ?? 0, isEditor),
              paddingTop: scalingValue(buttonPadding?.top ?? 0, isEditor),
              paddingRight: scalingValue(buttonPadding?.right ?? 0, isEditor),
              paddingBottom: scalingValue(buttonPadding?.bottom ?? 0, isEditor),
              paddingLeft: scalingValue(buttonPadding?.left ?? 0, isEditor),
              backgroundColor: buttonColor,
              color: buttonTextColor,
              borderColor: buttonBorderColor,
            }}
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
  buttonCorners?: number;
  buttonStroke?: number;
  inputCorners?: number;
  inputStroke?: number;
  buttonPadding?: Padding;
  inputPadding?: Padding;
  inputColor: string,
  inputTextColor: string,
  inputBorderColor: string,
  placeholderColor: string,
  buttonColor: string,
  buttonTextColor: string,
  buttonBorderColor: string,
  labelTextColor: string,
};

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
