import React, { useState } from 'react';
import cn from 'classnames';
import styles from './NewsletterSignup.module.scss';
import { CommonComponentProps } from '../props';
import { scalingValue } from '../utils/scalingValue';

type NewsletterSignupProps = {
  settings: NewsletterSignupSettings;
  content?: unknown;
  styles: NewsletterSignupStyles;
  isEditor?: boolean;
} & CommonComponentProps;

const inputStyleClassName: Record<NewsletterSignupSettings['inputStyle'], string> = {
  bordered: styles.inputBordered,
  underline: styles.inputUnderline,
  with_label: styles.inputWithLabel,
};

export function NewsletterSignup({ settings, styles: componentStyles, isEditor, metadata }: NewsletterSignupProps) {
  const {
    layout = 'horizontal',
    fieldsCount = 1,
    inputStyle = 'bordered',
    placeholderEmail = 'Enter your email',
    placeholderName = 'Enter your name',
    labelEmail = 'Email',
    labelName = 'Name',
    buttonLabel = 'Sign up',
  } = settings;

  const inputCss = componentStyles ? textStylesToCss(componentStyles.input, isEditor) : undefined;
  const labelCss = componentStyles?.label ? textStylesToCss(componentStyles.label, isEditor) : undefined;
  const buttonTextCss = componentStyles ? textStylesToCss(componentStyles.button, isEditor) : undefined;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showNameField = fieldsCount === 2;
  const hasLabels = inputStyle === 'with_label';

  const apiBase = metadata?.apiBase as string | undefined;
  const projectId = metadata?.projectId as string | undefined;
  const canSubmit = Boolean(apiBase && projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !email.trim()) return;

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          ...(showNameField && name.trim() ? { name: name.trim() } : {}),
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      setStatus('success');
      setEmail('');
      setName('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const preventDefault = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={styles.wrapper}>
      <form
        onSubmit={handleSubmit}
        className={cn(styles.form, {
          [styles.formHorizontal]: layout === 'horizontal' && !hasLabels,
          [styles.formHorizontalWithLabel]: layout === 'horizontal' && hasLabels,
          [styles.formVertical]: layout === 'vertical',
        })}
      >
        <div className={cn(styles.fields, {
          [styles.fieldsHorizontal]: layout === 'horizontal',
          [styles.fieldsVertical]: layout === 'vertical',
        })}>
          {showNameField && (
            <div className={styles.fieldGroup}>
              {hasLabels && (
                <span className={cn(styles.label, styles.overlayAnchor)} style={labelCss}>
                  {labelName}
                  {isEditor && <div className={styles.overlay} data-styles="label" />}
                </span>
              )}
              <div className={styles.overlayAnchor}>
                <input
                  type="text"
                  name="name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={hasLabels ? undefined : placeholderName}
                  className={cn(styles.input, inputStyleClassName[inputStyle])}
                  style={inputCss}
                />
                {isEditor && <div className={styles.overlay} data-styles="input" />}
              </div>
            </div>
          )}
          <div className={styles.fieldGroup}>
            {hasLabels && (
              <span className={cn(styles.label, styles.overlayAnchor)} style={labelCss}>
                {labelEmail}
                {isEditor && <div className={styles.overlay} data-styles="label" />}
              </span>
            )}
            <div className={styles.overlayAnchor}>
              <input
                type="email"
                name="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={hasLabels ? undefined : placeholderEmail}
                required
                className={cn(styles.input, inputStyleClassName[inputStyle])}
                style={inputCss}
              />
              {isEditor && <div className={styles.overlay} data-styles="input" />}
            </div>
          </div>
        </div>
        <div className={styles.overlayAnchor}>
          <button
            type="submit"
            className={styles.button}
          >
            <span className={styles.overlayAnchor} style={buttonTextCss}>
              {status === 'submitting' ? '...' : buttonLabel}
              {isEditor && <div className={cn(styles.overlay, styles.overlayAbove)} data-styles="button" onClick={preventDefault} />}
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

function buttonBackgroundToCss(bg: ButtonBackgroundStyles, isEditor?: boolean): React.CSSProperties {
  return {
    backgroundColor: bg.backgroundColor,
    borderColor: bg.borderColor,
    borderWidth: scalingValue(bg.borderWidth, isEditor),
    borderRadius: scalingValue(bg.borderRadius, isEditor),
    borderStyle: bg.borderWidth ? 'solid' : 'none',
  };
}

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

type ButtonBackgroundStyles = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
};

type NewsletterSignupStyles = {
  input: TextStyles;
  label: TextStyles;
  button: TextStyles;
};

type NewsletterSignupSettings = {
  layout: 'vertical' | 'horizontal';
  fieldsCount: 1 | 2;
  inputStyle: 'bordered' | 'underline' | 'with_label';
  placeholderEmail?: string;
  placeholderName?: string;
  labelEmail?: string;
  labelName?: string;
  buttonLabel?: string;
};
