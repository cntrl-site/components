import { Layout } from './sdk/types/project/Layout';

export function getLayoutStyles<V, M> (
  layouts: Layout[],
  layoutValues: Record<string, V>[],
  mapToStyles: (values: V[], exemplary: number) => M
): string {
  const mediaQueries = layouts
    .sort((a, b) => a.startsWith - b.startsWith)
    .reduce((acc, layout) => {
      const values = layoutValues.map(lv => lv[layout.id]);
      return `
        ${acc}
        ${layout.startsWith !== 0
        ? `@media (min-width: ${layout.startsWith}px) {${mapToStyles(values, layout.exemplary)}}`
        : `${mapToStyles(values, layout.exemplary)}`
      }`;
    },
    '');
  return mediaQueries;
}

export function getLayoutMediaQuery(layoutId: string, layouts: Layout[]): string {
  const sorted = layouts.slice().sort((a, b) => a.startsWith - b.startsWith);
  const layoutIndex = sorted.findIndex(l => l.id === layoutId);
  if (layoutIndex === -1) {
    throw new Error(`No layout was found by the given id #${layoutId}`);
  }
  const current = sorted[layoutIndex];
  const next = sorted[layoutIndex + 1];
  if (!next) {
    return `@media (min-width: ${current.startsWith}px)`;
  }
  return `@media (min-width: ${current.startsWith}px) and (max-width: ${next.startsWith - 1}px)`;
}

