export type ValidatableFormField = {
  name: string;
  type: 'text' | 'textarea' | 'phone' | 'email';
};

const SIMPLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmailFormat = (value: string): boolean =>
  SIMPLE_EMAIL_RE.test(value.trim());

export const isValidPhoneFormat = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

export const getFormFieldValidationError = (
  visibleFields: ValidatableFormField[],
  values: Record<string, string>,
): string | null => {
  for (const field of visibleFields) {
    const raw = values[field.name]?.trim() ?? '';
    if (!raw) continue;
    if (field.type === 'email' && !isValidEmailFormat(raw)) {
      return 'Please enter a valid email address.';
    }
    if (field.type === 'phone' && !isValidPhoneFormat(raw)) {
      return 'Please enter a valid phone number.';
    }
  }
  return null;
};
