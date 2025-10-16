export function getFontFamilyValue(value: string | undefined) {
  return value && value.includes('"') ? value : `"${value}"`;
}
