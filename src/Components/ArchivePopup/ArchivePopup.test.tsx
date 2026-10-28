import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArchivePopup, groupArchiveRows, type ArchivePopupContentItem } from './ArchivePopup';
import { ArchivePopupComponent } from './ArchivePopupComponent';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const paragraph = (...children: object[]) => [{ type: 'paragraph', children }];
const linkNode = (text: string, value: string, target: 'self' | 'blank') => ({ type: 'link', value, target, children: [{ text }] });

const content: ArchivePopupContentItem[] = [
  { group: '(2026)', title: paragraph(linkNode('One', '/one', 'self')), image: { assetId: 'one.jpg' } },
  { group: '', title: paragraph({ text: 'See ' }, linkNode('Two', '/two', 'blank')), image: { assetId: 'two.jpg' } },
  { group: '(2025)', title: paragraph({ text: 'Three' }), image: { assetId: 'three.jpg' } },
  { title: 'Four' },
];

describe('groupArchiveRows', () => {
  it('continues the group above for rows without a label', () => {
    const groups = groupArchiveRows(content);
    expect(groups.map(group => group.label)).toEqual(['(2026)', '(2025)']);
    expect(groups.map(group => group.rows.map(row => row.index))).toEqual([[0, 1], [2, 3]]);
  });


  it('keeps leading unlabeled rows in an unlabeled group', () => {
    const groups = groupArchiveRows([{ title: 'A' }, { group: 'B', title: 'B' }]);
    expect(groups.map(group => [group.label, group.rows.length])).toEqual([['', 1], ['B', 1]]);
  });
});

describe('ArchivePopupComponent schema', () => {
  it('hides the label, close and overlay settings for type b, along with the whole Label type style', () => {
    const hiddenInB = ArchivePopupComponent.schema.settings.displayRules
      .filter(rule => rule.if.value === 'b' && rule.then.value === false)
      .map(rule => rule.then.name.split('.')[1]);
    const typeStyle = ArchivePopupComponent.schema.panels.find(panel => panel.id === 'typeStyle')!;
    const labelGroup = typeStyle.layout.find(item => typeof item === 'object' && 'title' in item && item.title === 'Label');
    const labelGroupKeys = JSON.stringify(labelGroup).match(/trigger\w+/g)!;
    expect(hiddenInB).toEqual(expect.arrayContaining([
      'triggerLabel', 'closeLabel', 'triggerColor', 'triggerHoverColor', 'closeColor', 'closeHoverColor', 'overlayColor',
      ...labelGroupKeys,
    ]));
    expect(hiddenInB).not.toContain('panelColor');
    expect(hiddenInB.some(name => name.startsWith('list'))).toBe(false);
  });

  it('offers the panel position for type a only, starting at the centre old popups were saved in', () => {
    const { properties, displayRules, layoutDefaults } = ArchivePopupComponent.schema.settings;
    const positions = properties.panelPosition.display!.enum as string[];
    expect(positions[0]).toBe('center');
    expect(positions).toHaveLength(9);
    expect(displayRules).toContainEqual({ if: { name: 'type', value: 'b' }, then: { name: 'properties.panelPosition.display.visible', value: false } });
    expect(Object.values(layoutDefaults!).map(defaults => defaults.panelPosition)).toEqual(['center', 'center', 'center']);
  });
});

describe('ArchivePopupComponent columns', () => {
  const contentRules = ArchivePopupComponent.schema.content.display.rules;
  const hiddenFields = (columns: number) => contentRules
    .filter(rule => !Array.isArray(rule.if) && rule.if.name === 'columns' && rule.if.value === columns)
    .map(rule => rule.then.name);

  it('counts the group as the first column and shows a content field per column after the title', () => {
    expect(hiddenFields(2)).toEqual(['title2', 'title3', 'title4']);
    expect(hiddenFields(3)).toEqual(['title3', 'title4']);
    expect(hiddenFields(4)).toEqual(['title4']);
    expect(hiddenFields(5)).toEqual([]);
    const { group, title, title2, title3, title4 } = ArchivePopupComponent.schema.content.items.properties;
    expect([group, title, title2, title3, title4].map(field => field.label)).toEqual(['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5']);
  });

  it('keeps the image field after every column field', () => {
    expect(Object.keys(ArchivePopupComponent.schema.content.items.properties)).toEqual(['group', 'title', 'title2', 'title3', 'title4', 'image']);
  });
});

describe('ArchivePopup', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const render = (props: Partial<Parameters<typeof ArchivePopup>[0]> = {}) => {
    act(() => {
      root.render(<ArchivePopup settings={{ triggerLabel: 'Archive', closeLabel: 'Close' }} content={content} {...props} />);
    });
  };
  const trigger = () => container.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement;
  const dialog = () => document.querySelector('[role="dialog"]');

  it('opens on trigger click and shows the hovered row media', () => {
    render();
    expect(dialog()).toBeNull();

    act(() => trigger().click());
    expect(dialog()).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    const firstRow = document.querySelector('a[href="/one"]') as HTMLAnchorElement;
    act(() => {
      firstRow.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }));
    });
    const image = document.querySelector('img[src="one.jpg"]') as HTMLImageElement;
    expect(image).not.toBeNull();
    act(() => {
      image.dispatchEvent(new Event('load'));
    });
    expect(image.className).toMatch(/-media-visible/);
  });

  it('closes on Escape after the fade-out', () => {
    render();
    act(() => trigger().click());
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    act(() => {
      vi.runAllTimers();
    });
    expect(dialog()).toBeNull();
  });

  it('ignores trigger clicks on the editor canvas but shows the pinned open state', () => {
    render({ isEditor: true });
    act(() => trigger().click());
    expect(dialog()).toBeNull();

    render({ isEditor: true, currentState: 'open' });
    expect(dialog()).not.toBeNull();
  });

  it('renders links set on parts of a title, each in the tab it asks for', () => {
    render();
    act(() => trigger().click());
    expect(document.querySelector('a[href="/one"]')?.getAttribute('target')).toBeNull();
    const two = document.querySelector('a[href="/two"]');
    expect(two?.textContent).toBe('Two');
    expect(two?.getAttribute('target')).toBe('_blank');
    expect(document.querySelectorAll('[role="dialog"] a')).toHaveLength(2);
  });

  it('does not follow title links on the editor canvas', () => {
    render({ isEditor: true, currentState: 'open' });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    act(() => {
      document.querySelector('a[href="/one"]')!.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it('offers canvas padding and group gap controls on the open panel once it has slid in', () => {
    const anchors = () => [...document.querySelectorAll('[data-controls]')].map(el => el.getAttribute('data-controls'));
    render({ isEditor: true, isEditMode: true, currentState: 'open' });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(anchors()).toEqual([]);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(anchors()).toEqual(['panelPadding.top', 'panelPadding.bottom', 'panelPadding.left', 'panelPadding.right', 'groupGap']);
    const gapAnchor = document.querySelector('[data-controls="groupGap"]')!;
    expect(gapAnchor.previousElementSibling?.className).toMatch(/-group$/);
    expect(gapAnchor.nextElementSibling?.textContent).toBe('(2025)Three' + 'Four');
  });

  it('slides the panel only while opening and closing, so a new position moves it straight there', () => {
    const panelClass = () => document.querySelector('[role="dialog"] div[class*="-panel"]')!.className;
    render();
    act(() => trigger().click());
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(panelClass()).not.toMatch(/-panel-settled/);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(panelClass()).toMatch(/-panel-settled/);
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(panelClass()).not.toMatch(/-panel-settled/);
  });

  it('stays open with its controls when preview exits to edit mode, and closes on leaving edit mode', () => {
    render({ isEditor: true, isPreviewMode: true });
    act(() => trigger().click());
    expect(dialog()).not.toBeNull();

    render({ isEditor: true, isEditMode: true });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(dialog()).not.toBeNull();
    expect(document.querySelectorAll('[data-controls]')).toHaveLength(5);

    render({ isEditor: true });
    act(() => {
      vi.runAllTimers();
    });
    expect(dialog()).toBeNull();
  });

  it('renders group labels once per group', () => {
    render();
    act(() => trigger().click());
    const rows = [...document.querySelectorAll('[role="dialog"] div[class$="-row"]')];
    expect(rows.map(row => row.textContent)).toEqual(['(2026)One', 'See Two', '(2025)Three', 'Four']);
  });

  it('shows as many text columns as set, each from its own field', () => {
    act(() => {
      root.render(<ArchivePopup
        settings={{ columns: 4 }}
        content={[{ group: '(2026)', title: 'One', title2: 'Client', title3: paragraph({ text: 'Type' }), title4: 'Hidden' }]}
        isEditor
        currentState="open"
      />);
    });
    const row = document.querySelector('[role="dialog"] div[class$="-row"]')!;
    expect([...row.children].map(cell => cell.textContent)).toEqual(['(2026)', 'One', 'Client', 'Type']);
    const panel = row.closest('[class*="-panel"]') as HTMLElement;
    expect(panel.style.getPropertyValue(`--${panel.className.split('-panel')[0]}-columns`)).toBe('4');
  });

  it('places the panel at the set position, centred when none is set', () => {
    const panelOffset = (panelPosition?: string) => {
      act(() => {
        root.render(<ArchivePopup settings={{ panelPosition }} content={content} isEditor currentState="open" />);
      });
      const panel = document.querySelector('[role="dialog"] div[class*="-panel"]') as HTMLElement;
      const prefix = panel.className.split('-panel')[0];
      return [panel.style.getPropertyValue(`--${prefix}-panel-x`), panel.style.getPropertyValue(`--${prefix}-panel-y`)];
    };
    expect(panelOffset()).toEqual(['50%', '50%']);
    expect(panelOffset('right-bottom')).toEqual(['100%', '100%']);
    expect(panelOffset('left-center')).toEqual(['0%', '50%']);
    expect(panelOffset('nowhere')).toEqual(['50%', '50%']);
  });

  describe('type b', () => {
    const renderB = (props: Partial<Parameters<typeof ArchivePopup>[0]> = {}) => {
      act(() => {
        root.render(<ArchivePopup settings={{ type: 'b', triggerLabel: 'Archive', closeLabel: 'Close' }} content={content} {...props} />);
      });
    };

    it('shows the list in place, with no label, close or popup', () => {
      renderB();
      expect(trigger()).toBeNull();
      expect(dialog()).toBeNull();
      expect(container.textContent).not.toContain('Archive');
      expect(container.textContent).not.toContain('Close');
      const rows = [...container.querySelectorAll('div[class$="-row"]')];
      expect(rows.map(row => row.textContent)).toEqual(['(2026)One', 'See Two', '(2025)Three', 'Four']);
    });

    const hoverOne = () => act(() => {
      container.querySelector('a[href="/one"]')!.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }));
    });
    const layer = () => document.querySelector('[class$="-inline-layer"], [class*="-inline-layer "]');
    const copy = () => document.querySelector('[class*="-panel-copy"]');

    it('shows the hovered row media full screen, under a copy of the panel with that row highlighted', () => {
      renderB();
      hoverOne();
      const image = layer()?.querySelector('img[src="one.jpg"]') as HTMLImageElement;
      expect(image).not.toBeNull();
      expect(container.contains(image)).toBe(false);
      act(() => {
        image.dispatchEvent(new Event('load'));
      });
      expect(image.className).toMatch(/-media-visible/);
      expect(copy()?.getAttribute('aria-hidden')).toBe('true');
      expect(copy()?.querySelector('[class*="-row-active"]')?.textContent).toBe('(2026)One');
    });

    it('keeps the copy over the list while the media fades out', () => {
      renderB();
      hoverOne();
      act(() => {
        container.querySelector('[class*="-panel-inline"]')!.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
      });
      expect(copy()).not.toBeNull();
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(copy()).toBeNull();
    });

    it('cuts the media at once on scroll', () => {
      renderB();
      hoverOne();
      act(() => {
        document.dispatchEvent(new Event('scroll'));
      });
      expect(copy()).toBeNull();
      expect(layer()?.querySelector('[class*="-media-layer-instant"] img:not([class*="-media-visible"])')).not.toBeNull();
    });

    it('cuts the fading media at once on scroll after leaving the list', () => {
      renderB();
      hoverOne();
      act(() => {
        container.querySelector('[class*="-panel-inline"]')!.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
      });
      expect(copy()).not.toBeNull();
      act(() => {
        document.dispatchEvent(new Event('scroll'));
      });
      expect(copy()).toBeNull();
      expect(layer()?.querySelector('[class*="-media-layer-instant"]')).not.toBeNull();
    });

    it('ignores the pinned open state and offers its controls in edit mode straight away', () => {
      renderB({ isEditor: true, isEditMode: true, currentState: 'open' });
      expect(dialog()).toBeNull();
      expect(container.querySelectorAll('[data-controls]')).toHaveLength(5);
    });
  });
});
