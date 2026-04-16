import type { CSSProperties } from 'react';

export const buildColorVars = <K extends string>(
  P: string,
  defaults: Record<K, string>,
  colorVarMap: Record<K, string>,
  stateKeys: readonly string[],
  stateOverrides?: Record<string, Partial<Record<K, string>>>,
): CSSProperties => {
  const vars: Record<string, string> = {};

  for (const [key, varSuffix] of Object.entries(colorVarMap)) {
    vars[`--${P}-${varSuffix}`] = defaults[key as K];
  }

  if (stateOverrides) {
    for (const state of stateKeys) {
      const overrides = stateOverrides[state];
      if (!overrides) continue;
      for (const [key, varSuffix] of Object.entries(colorVarMap)) {
        const val = overrides[key as K];
        if (val !== undefined) {
          vars[`--${P}-${state}-${varSuffix}`] = val;
        }
      }
    }
  }

  return vars as CSSProperties;
};

