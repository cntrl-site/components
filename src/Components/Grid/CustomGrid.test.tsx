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

  it('puts every entry in the blocks, one group after another, the vertical gap between groups', () => {
    const { wrapper, items } = render(['a', 'b', 'c', 'd', 'e'].map(entry));

    expect(items).toHaveLength(5);
    expect(wrapper.style.gridTemplateColumns).toBe('repeat(4, 20vw)');
    const [, rowsCount, groupHeight] = wrapper.style.gridTemplateRows.match(/^repeat\((\d+), minmax\(([\d.]+)vw, auto\)\) auto$/)!;
    expect(rowsCount).toBe('2');
    expect(Number(groupHeight)).toBeCloseTo(30);
    expect(Number.parseFloat(wrapper.style.rowGap)).toBeCloseTo(5);
    expect(items.map(item => [item.style.gridColumn, item.style.gridRow])).toEqual([
      ['1 / span 3', '1'],
      ['4 / span 1', '1'],
      ['1 / span 3', '2'],
      ['4 / span 1', '2'],
      ['1 / span 3', '3'],
    ]);
    expect(items[1].style.marginTop).toBe('10vw');
  });

  it('takes the gap of a layout saved with the height of a whole group', () => {
    const { verticalGap, ...rest } = customGrid;
    const { wrapper, items } = render(['a', 'b', 'c'].map(entry), { ...rest, repeat: 1, repeatHeight: 0.45 });

    expect(verticalGap).toBeDefined();
    expect(items).toHaveLength(3);
    expect(Number.parseFloat(wrapper.style.rowGap)).toBeCloseTo(15);
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

  // the layout is 0.83 wide over 830px: 1000px a unit. Every entry measures 140px, 60 of them its
  // media: 0.08 of text
  const renderMeasured = (grid: Record<string, unknown>, count: number) => {
    const offsetWidth = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.className.includes('-custom-layout') ? 830 : 0;
    });
    const offsetHeight = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.className.includes('-item-image-wrapper')) return 60;
      if (this.className.includes('-item-inner')) return 140;
      return 0;
    });
    const rendered = render(['a', 'b', 'c', 'd', 'e'].slice(0, count).map(entry), grid, { textGrowth: 'outside' });
    offsetWidth.mockRestore();
    offsetHeight.mockRestore();
    return { ...rendered, tops: rendered.items.map(item => Number.parseFloat(item.style.marginTop)) };
  };

  it('moves the entries an outside text reaches onto the first beat under it, in the same columns only', () => {
    const stacked = {
      ...customGrid,
      beat: 0.05,
      blocks: [
        { column: 0, span: 2, top: 0, height: 0.3 },
        { column: 1, span: 1, top: 0.35, height: 0.2 },
        { column: 3, span: 1, top: 0.35, height: 0.2 },
        { column: 1, span: 1, top: 0.6, height: 0.1 },
      ],
    };
    const { wrapper, tops } = renderMeasured(stacked, 5);

    // the first text ends at 0.38: the next block goes onto 0.4, the one in its own columns stays;
    // the one under it, moved along to 0.65, is reached by its text at 0.68 and goes onto 0.7
    [0, 40, 35, 70, 0].forEach((top, index) => expect(tops[index]).toBeCloseTo(top));
    // the lowest text ends at 0.7 + 0.1 + 0.08, the group on the beat under it
    const [, groupHeight] = wrapper.style.gridTemplateRows.match(/^minmax\(([\d.]+)vw, auto\) auto$/)!;
    expect(Number(groupHeight)).toBeCloseTo(90);
  });

  it('leaves the entries a text does not reach where they are drawn', () => {
    const spaced = {
      ...customGrid,
      beat: 0.05,
      blocks: [
        { column: 0, span: 2, top: 0, height: 0.3 },
        { column: 0, span: 1, top: 0.4, height: 0.2 },
      ],
    };
    const { tops } = renderMeasured(spaced, 2);

    expect(tops[1]).toBeCloseTo(40);
  });

  it('puts the entries a text reaches right under it on a grid without beats', () => {
    const stacked = {
      ...customGrid,
      blocks: [
        { column: 0, span: 2, top: 0, height: 0.3 },
        { column: 0, span: 1, top: 0.33, height: 0.2 },
      ],
    };
    const { tops } = renderMeasured(stacked, 2);

    expect(tops[1]).toBeCloseTo(38);
  });
});
