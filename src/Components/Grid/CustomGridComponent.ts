import { Grid } from './Grid';
import { GridComponent } from './GridComponent';
import { ComponentSchemaV1, LayoutItem, SchemaDisplayRule, SchemaProperty } from '../../types/SchemaV1';

/**
 * Neptune whose entries sit where a layout drawn in the CMS custom grid builder puts them. The
 * builder opens before the component is added (on any `custom-grid-layout` setting) and again from
 * the settings panel; the rest of the settings are Neptune's.
 */

// Neptune settings that decide where entries go; the custom layout does that instead
const placementKeys = new Set(['gridLayout', 'verticalGap', 'alignEntries', 'entriesCount']);

const neptuneSettings = GridComponent.schema.settings;

function withoutPlacement<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(Object.entries(values).filter(([key]) => !placementKeys.has(key))) as T;
}

// the settings a display rule reads and the one it changes: `if` names a setting path, `then` a schema path
function getRuleSettingKeys(rule: SchemaDisplayRule): string[] {
  const conditions = Array.isArray(rule.if) ? rule.if : [rule.if];
  return [
    ...conditions.map(condition => condition.name.split('.')[0]),
    rule.then.name.replace(/^properties\./, '').split('.')[0],
  ];
}

// blocks set the box each entry's media fills, so the image display is only fit or cover, without a ratio
const imageDisplay: SchemaProperty = {
  type: 'string',
  scope: 'common',
  title: 'Display',
  display: { type: 'toggle-cycle', enum: ['fit', 'cover'] },
};

const customGrid: SchemaProperty = {
  type: 'object',
  scope: 'layout',
  title: '',
  display: { type: 'custom-grid-layout' },
};

// three blocks over each layout's default grid, each a 4:5 image with its text, repeated three times: Neptune's nine entries
const layoutDefaultCustomGrids: Record<string, unknown> = {
  d: {
    columnsCount: 12,
    columnWidth: 0.0634,
    gutterWidth: 0.0167,
    maxWidth: null,
    repeat: 3,
    repeatHeight: 0.4844,
    blocks: [
      { column: 0, span: 4, top: 0, height: 0.4404 },
      { column: 4, span: 4, top: 0, height: 0.4404 },
      { column: 8, span: 4, top: 0, height: 0.4404 },
    ],
  },
  t: {
    columnsCount: 6,
    columnWidth: 0.1389,
    gutterWidth: 0.0208,
    maxWidth: null,
    repeat: 3,
    repeatHeight: 0.4763,
    blocks: [
      { column: 0, span: 2, top: 0, height: 0.433 },
      { column: 2, span: 2, top: 0, height: 0.433 },
      { column: 4, span: 2, top: 0, height: 0.433 },
    ],
  },
  m: {
    columnsCount: 4,
    columnWidth: 0.2047,
    gutterWidth: 0.032,
    maxWidth: null,
    repeat: 3,
    repeatHeight: 2.1632,
    blocks: [
      { column: 0, span: 4, top: 0, height: 1.3265 },
      { column: 0, span: 2, top: 1.4592, height: 0.64 },
      { column: 2, span: 2, top: 1.4592, height: 0.64 },
    ],
  },
};

const generalPanelLayout: LayoutItem[] = [
  '__componentName__',
  'type',
  { type: 'row', title: 'Grid', items: ['customGrid'] },
  { type: 'row', title: '', items: ['textBoxWidth', 'showText'] },
  { type: 'row', title: '', items: ['align'] },
];

const schema: ComponentSchemaV1 = {
  ...GridComponent.schema,
  settings: {
    ...neptuneSettings,
    properties: {
      ...withoutPlacement(neptuneSettings.properties),
      customGrid,
      imageDisplay,
    },
    defaults: {
      ...withoutPlacement(neptuneSettings.defaults),
      imageDisplay: 'cover',
    },
    layoutDefaults: Object.fromEntries(
      Object.entries(neptuneSettings.layoutDefaults ?? {}).map(([layoutKey, values]) => [
        layoutKey,
        { ...withoutPlacement(values), customGrid: layoutDefaultCustomGrids[layoutKey] },
      ]),
    ),
    displayRules: (neptuneSettings.displayRules ?? [])
      .filter(rule => !getRuleSettingKeys(rule).some(key => placementKeys.has(key)))
      .map(rule => (!Array.isArray(rule.if) && rule.if.name === 'imageDisplay.display'
        ? { ...rule, if: { ...rule.if, name: 'imageDisplay' } }
        : rule)),
    layout: [
      ...(neptuneSettings.layout ?? []).filter(item => typeof item !== 'string' || !placementKeys.has(item)),
      'customGrid',
    ],
  },
  panels: GridComponent.schema.panels?.map(panel => (
    panel.id === 'general' ? { ...panel, layout: generalPanelLayout } : panel
  )),
};

export const CustomGridComponent = {
  ...GridComponent,
  element: Grid,
  id: 'custom-grid',
  name: 'Neptune Custom',
  schema,
};
