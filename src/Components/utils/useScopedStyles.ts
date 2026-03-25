import { useId } from 'react';

export type ScopedStyles = {
  prefix: string;
  cls: (name: string) => string;
};

export function useScopedStyles(): ScopedStyles {
  const id = useId().replace(/:/g, '');
  const prefix = `cf-${id}`;
  return {
    prefix,
    cls: (name: string) => `${prefix}-${name}`,
  };
}
