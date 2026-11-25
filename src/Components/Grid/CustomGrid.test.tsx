import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Grid } from './Grid';
import { CustomGridComponent } from './CustomGridComponent';
import { GridComponent } from './GridComponent';
import type { LayoutItem } from '../../types/SchemaV1';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const droppedKeys = ['gridLayout', 'verticalGap', 'alignEntries', 'entriesCount', 'align'];

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

  it('drops the settings that place Neptune entries, and the align', () => {
    for (const key of droppedKeys) {
      expect(settings.properties).not.toHaveProperty(key);
      expect(settings.defaults).not.toHaveProperty(key);
      for (const values of Object.values(settings.layoutDefaults ?? {})) {
        expect(values).not.toHaveProperty(key);
      }
    }
  });

  it('keeps the custom grid once for every layout, linked to the first preset', () => {
    expect(settings.properties.customGrid.scope).toBe('common');
    expect(settings.defaults.customGrid).toEqual({ preset: 0 });
    for (const values of Object.values(settings.layoutDefaults ?? {})) {
      expect(values).not.toHaveProperty('customGrid');
    }
  });

  it('makes the text as wide as its block on every layout', () => {
    const layoutDefaults = Object.values(settings.layoutDefaults ?? {});
    expect(layoutDefaults).toHaveLength(Object.keys(GridComponent.schema.settings.layoutDefaults ?? {}).length);
    for (const values of layoutDefaults) {
      expect(values.textBoxWidth).toBe(100);
    }
    expect(GridComponent.schema.settings.layoutDefaults?.d.textBoxWidth).toBe(200);
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

  it('grows the text inside the blocks unless set outside, from the general panel', () => {
    expect(settings.properties.textGrowth.display).toEqual({ type: 'toggle-cycle', enum: ['inside', 'outside'] });
    expect(settings.defaults.textGrowth).toBe('inside');
    const general = panels?.find(panel => panel.id === 'general');
    expect(collectLayoutKeys(general?.layout ?? [])).toContain('textGrowth');
  });

  it('has no rule left on the align', () => {
    expect(settings.displayRules?.some(rule => rule.then.name.includes('align'))).toBe(false);
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

  const customGrid = {
    columnsCount: 4,
    columnWidth: 0.2,
    gutterWidth: 0.01,
    maxWidth: null,
    verticalGap: 0.05,
    blocks: [
      { column: 0, span: 3, top: 0, height: 0.3 },
      { column: 3, span: 1, top: 0.1, height: 0.2 },
    ],
  };

  const render = (content: unknown[], grid: Record<string, unknown> = customGrid, overrides: Record<string, unknown> = {}) => {
    const settings = {
      ...CustomGridComponent.schema.settings.defaults,
      ...CustomGridComponent.schema.settings.layoutDefaults!.d,
      slider: 'off',
      textBoxWidth: 100,
      customGrid: grid,
      ...overrides,
    };
    act(() => {
      root.render(<Grid settings={settings as any} content={content} activeEvent={undefined} />);
    });
    const wrapper = container.querySelector<HTMLElement>('[class$="-wrapper"], [class*="-wrapper "]')!;
    const items = Array.from(wrapper.children) as HTMLElement[];
    return { wrapper, items };
  };

  const getTracks = (wrapper: HTMLElement) => wrapper.style.gridTemplateRows
    .split(' ')
    .map(track => (track === 'auto' ? track : Number.parseFloat(track)));

  const expectTracks = (wrapper: HTMLElement, expected: (number | 'auto')[]) => {
    const tracks = getTracks(wrapper);
    expect(tracks).toHaveLength(expected.length);
    expected.forEach((track, index) => (
      track === 'auto' ? expect(tracks[index]).toBe('auto') : expect(tracks[index]).toBeCloseTo(track)
    ));
  };

  it('puts every entry on the line of its block\'s top, one group after another, the vertical gap a track between them', () => {
    const { wrapper, items } = render(['a', 'b', 'c', 'd', 'e'].map(entry));

    expect(items).toHaveLength(5);
    expect(wrapper.style.gridTemplateColumns).toBe('repeat(4, 20vw)');
    expectTracks(wrapper, [10, 'auto', 5, 10, 'auto', 5, 'auto']);
    expect(Number.parseFloat(wrapper.style.rowGap)).toBe(0);
    expect(items.map(item => [item.style.gridColumn, item.style.gridRow])).toEqual([
      ['1 / span 3', '1 / 3'],
      ['4 / span 1', '2 / 3'],
      ['1 / span 3', '4 / 6'],
      ['4 / span 1', '5 / 6'],
      ['1 / span 3', '7 / 8'],
    ]);
    expect(items.every(item => item.style.marginTop === '')).toBe(true);
  });

  it('takes the gap of a layout saved with the height of a whole group', () => {
    const { verticalGap, ...rest } = customGrid;
    const { wrapper, items } = render(['a', 'b', 'c'].map(entry), { ...rest, repeat: 1, repeatHeight: 0.45 });

    expect(verticalGap).toBeDefined();
    expect(items).toHaveLength(3);
    expect(getTracks(wrapper)[2]).toBeCloseTo(15);
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

  it('fills each block with the media when the text grows outside it', () => {
    const { wrapper, items } = render(['a', 'b'].map(entry), customGrid, { textGrowth: 'outside' });
    const [first, second] = items.map(item => item.firstElementChild as HTMLElement);
    const media = first.querySelector<HTMLElement>('[class*="-item-image-wrapper"]')!;

    expect(wrapper.className).toContain('-text-outside');
    expect(first.style.height).toBe('');
    expect(second.style.height).toBe('');
    expect(media.style.height).toBe('30vw');
    expect(media.style.flexShrink).toBe('0');
    expect(first.querySelector('[class*="-item-title"]')?.textContent).toBe('a');
  });

  it('ends an entry on the top of the block under it in its columns, or with its group, the text inside or outside', () => {
    const stacked = {
      ...customGrid,
      blocks: [
        { column: 0, span: 2, top: 0, height: 0.3 },
        { column: 3, span: 1, top: 0, height: 0.3 },
        { column: 0, span: 1, top: 0.35, height: 0.2 },
      ],
    };
    for (const textGrowth of ['inside', 'outside']) {
      const { wrapper, items } = render(['a', 'b', 'c', 'd'].map(entry), stacked, { textGrowth });
      expectTracks(wrapper, [35, 'auto', 'auto', 5, 'auto']);
      expect(items.map(item => item.style.gridRow)).toEqual(['1 / 3', '1 / 4', '3 / 4', '5 / 6']);
    }
  });

  it('draws no line where an entry ends in other columns only', () => {
    const staggered = {
      ...customGrid,
      blocks: [
        { column: 0, span: 1, top: 0, height: 0.3 },
        { column: 1, span: 1, top: 0, height: 0.4 },
        { column: 2, span: 1, top: 0, height: 0.5 },
      ],
    };
    const { wrapper, items } = render(['a', 'b', 'c'].map(entry), staggered, { textGrowth: 'outside' });

    expectTracks(wrapper, ['auto']);
    expect(items.map(item => item.style.gridRow)).toEqual(['1 / 2', '1 / 2', '1 / 2']);
  });

  const renderMeasured = (grid: Record<string, unknown>, heights: Record<string, number>) => {
    const offsetWidth = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.className.includes('-custom-layout') ? 830 : 0;
    });
    const offsetHeight = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      const title = this.querySelector('[class*="-item-title"]')?.textContent ?? '';
      return this.className.includes('-item-inner') ? heights[title] ?? 0 : 0;
    });
    const rendered = render(Object.keys(heights).map(entry), grid, { textGrowth: 'outside' });
    offsetWidth.mockRestore();
    offsetHeight.mockRestore();
    return rendered;
  };

  it('puts the end of every group on the beat under its tallest entry on a grid with beats', () => {
    const staggered = {
      ...customGrid,
      beat: 0.05,
      blocks: [
        { column: 0, span: 1, top: 0, height: 0.3 },
        { column: 1, span: 1, top: 0, height: 0.4 },
        { column: 2, span: 1, top: 0, height: 0.5 },
      ],
    };
    const { wrapper } = renderMeasured(staggered, { a: 380, b: 460, c: 560, d: 380 });

    expectTracks(wrapper, [60, 5, 40]);
  });

  it('puts what an entry pushes down onto the beat under it', () => {
    const stacked = {
      ...customGrid,
      beat: 0.05,
      blocks: [
        { column: 0, span: 2, top: 0, height: 0.3 },
        { column: 3, span: 1, top: 0, height: 0.3 },
        { column: 0, span: 1, top: 0.35, height: 0.2 },
      ],
    };
    const { wrapper, items } = renderMeasured(stacked, { a: 380, b: 380, c: 280 });

    expectTracks(wrapper, [35, 5, 30]);
    expect(items.map(item => item.style.gridRow)).toEqual(['1 / 3', '1 / 4', '3 / 4']);
  });

  it('leaves the tracks content-sized on a grid without beats', () => {
    const { wrapper } = renderMeasured(customGrid, { a: 380, b: 380 });

    expectTracks(wrapper, [10, 'auto']);
  });

  const sized = (title: string, width?: number, height?: number) => ({
    title,
    subtitle: '',
    gallery: [{ media: [{ assetId: `${title}.jpg`, name: '', type: 'image', width, height }] }],
  });
  const getTops = (items: HTMLElement[]) => items.map(item => Number.parseFloat(item.style.top));
  const expectNumbers = (values: number[], expected: number[]) => {
    expect(values).toHaveLength(expected.length);
    expected.forEach((value, index) => expect(values[index]).toBeCloseTo(value));
  };

  it('with masonry on, starts each repeated entry the vertical gap under its columns', () => {
    const { wrapper, items } = render(['a', 'b', 'c', 'd', 'e'].map(entry), { ...customGrid, masonry: 'on' });

    expect(items.every(item => item.style.position === 'absolute')).toBe(true);
    expectNumbers(items.map(item => Number.parseFloat(item.style.left)), [0, 63, 0, 63, 0]);
    expectNumbers(getTops(items), [0, 10, 35, 35, 70]);
    expect(Number.parseFloat(wrapper.style.height)).toBeCloseTo(100);
    expect((items[0].firstElementChild as HTMLElement).style.height).toBe('30vw');
  });

  it('with the cell height auto, fills the width of each block with the media at its own ratio', () => {
    const { wrapper, items } = render(
      [sized('a', 1000, 500), sized('b', 1000, 500), sized('c'), { title: 'd', subtitle: '', gallery: [] }],
      { ...customGrid, cellHeight: 'auto' },
    );
    const [first, , third, fourth] = items.map(item => item.firstElementChild as HTMLElement);
    const media = (inner: HTMLElement) => inner.querySelector<HTMLElement>('[class*="-item-image-wrapper"]')!;

    expect(wrapper.className).toContain('-auto-height');
    expect(first.style.height).toBe('');
    expect(media(first).style.aspectRatio).toBe('2');
    expect(media(first).style.height).toBe('auto');
    expect(first.querySelector<HTMLElement>('img')!.style.width).toBe('100%');
    expect(third.querySelector<HTMLElement>('img')!.style.height).toBe('auto');
    expect(media(fourth).style.height).toBe('20vw');
    expectNumbers(getTops(items), [0, 10, 36, 46]);
  });

  it('places entries by the heights they are measured at', () => {
    const { items } = renderMeasured({ ...customGrid, cellHeight: 'auto', masonry: 'on' }, { a: 400, b: 100, c: 300, d: 300 });

    expectNumbers(getTops(items), [0, 10, 45, 25]);
  });
});
