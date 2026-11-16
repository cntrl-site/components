import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Grid } from './Grid';
import { CustomGridComponent } from './CustomGridComponent';
import { GridComponent } from './GridComponent';
import type { LayoutItem } from '../../types/SchemaV1';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const placementKeys = ['gridLayout', 'verticalGap', 'alignEntries', 'entriesCount'];

function collectLayoutKeys(items: LayoutItem[]): string[] {
  return items.flatMap((item) => {
    if (typeof item === 'string') return [item];
    if ('items' in item) return collectLayoutKeys(item.items);
    if ('options' in item) return Object.values(item.options).flatMap(collectLayoutKeys);
    if ('tabs' in item) return Object.values(item.tabs).flatMap(collectLayoutKeys);
    return [];
  });
}

describe('CustomGridComponent schema', () => {
  const { settings, panels } = CustomGridComponent.schema;

  it('drops the settings that place Neptune entries', () => {
    for (const key of placementKeys) {
      expect(settings.properties).not.toHaveProperty(key);
      expect(settings.defaults).not.toHaveProperty(key);
      for (const values of Object.values(settings.layoutDefaults ?? {})) {
        expect(values).not.toHaveProperty(key);
      }
    }
  });

  it('gives every layout a custom grid that covers Neptune\'s default entries', () => {
    const entriesCount = GridComponent.schema.content.default.length;
    for (const values of Object.values(settings.layoutDefaults ?? {})) {
      const { blocks, repeat, columnsCount } = values.customGrid as { blocks: { column: number; span: number }[]; repeat: number; columnsCount: number };
      expect(blocks.length * repeat).toBe(entriesCount);
      for (const block of blocks) {
        expect(block.column + block.span).toBeLessThanOrEqual(columnsCount);
      }
    }
  });

  it('only lays out settings it has', () => {
    const keys = [
      ...collectLayoutKeys(settings.layout ?? []),
      ...(panels ?? []).flatMap(panel => collectLayoutKeys(panel.layout)),
    ].filter(key => key !== '__componentName__' && key !== 'name');
    for (const key of keys) {
      expect(settings.properties).toHaveProperty(key);
    }
    expect(keys).toContain('customGrid');
  });

  it('keeps the align rule on the plain image display', () => {
    const alignRule = settings.displayRules?.find(rule => rule.then.name === 'properties.align.display.enabled');
    expect(alignRule?.if).toEqual({ name: 'imageDisplay', value: 'cover' });
  });

  it('renders with Neptune\'s element', () => {
    expect(CustomGridComponent.element).toBe(GridComponent.element);
    expect(CustomGridComponent.id).not.toBe(GridComponent.id);
  });
});

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

describe('Grid with a custom layout', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', NoopObserver);
    vi.stubGlobal('IntersectionObserver', NoopObserver);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  const entry = (title: string) => ({
    title,
    subtitle: '',
    gallery: [{ media: [{ assetId: `${title}.jpg`, name: '', objectFit: 'cover' }] }],
  });

  const render = (content: unknown[]) => {
    const settings = {
      ...CustomGridComponent.schema.settings.defaults,
      ...CustomGridComponent.schema.settings.layoutDefaults!.d,
      slider: 'off',
      textBoxWidth: 100,
      customGrid: {
        columnsCount: 4,
        columnWidth: 0.2,
        gutterWidth: 0.01,
        maxWidth: null,
        repeat: 2,
        repeatHeight: 0.5,
        blocks: [
          { column: 0, span: 3, top: 0, height: 0.3 },
          { column: 3, span: 1, top: 0.1, height: 0.2 },
        ],
      },
    };
    act(() => {
      root.render(<Grid settings={settings as any} content={content} activeEvent={undefined} />);
    });
    const wrapper = container.querySelector<HTMLElement>('[class$="-wrapper"], [class*="-wrapper "]')!;
    const items = Array.from(wrapper.children) as HTMLElement[];
    return { wrapper, items };
  };

  it('puts entries in the blocks, one repeat after another, up to the repeats', () => {
    const { wrapper, items } = render(['a', 'b', 'c', 'd', 'e'].map(entry));

    expect(items).toHaveLength(4);
    expect(wrapper.style.gridTemplateColumns).toBe('repeat(4, 20vw)');
    expect(wrapper.style.gridTemplateRows).toBe('repeat(1, minmax(50vw, auto)) auto');
    expect(items.map(item => [item.style.gridColumn, item.style.gridRow])).toEqual([
      ['1 / span 3', '1'],
      ['4 / span 1', '1'],
      ['1 / span 3', '2'],
      ['4 / span 1', '2'],
    ]);
    expect(items[1].style.marginTop).toBe('10vw');
  });

  it('sizes each whole entry by its block, the media taking what the text leaves', () => {
    const { wrapper, items } = render(['a', 'b'].map(entry));
    const [first, second] = items.map(item => item.firstElementChild as HTMLElement);
    const media = first.querySelector<HTMLElement>('[class*="-item-image-wrapper"]')!;

    expect(wrapper.className).toContain('-custom-layout');
    expect(Number.parseFloat(first.style.width)).toBeCloseTo(62);
    expect(first.style.height).toBe('30vw');
    expect(second.style.width).toBe('20vw');
    expect(second.style.height).toBe('20vw');
    expect(media.style.flex).toBe('1 1 0%');
    expect(media.style.height).toBe('');
    expect(first.querySelector('[class*="-item-title"]')?.textContent).toBe('a');
  });
});
