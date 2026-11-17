import { Grid } from './Grid';
import { GridComponent } from './GridComponent';
import { ComponentSchemaV1, LayoutItem, SchemaDisplayRule, SchemaProperty } from '../../types/SchemaV1';

/**
 * Neptune whose entries sit where a layout drawn in the CMS custom grid builder puts them: a group
 * of blocks over the article grid, repeated for every entry. The builder opens before the component
 * is added (on any `custom-grid-layout` setting) and again from the settings panel; the rest of the
 * settings are Neptune's.
 */

// Neptune settings that decide where entries go; the custom layout does that instead
const placementKeys = new Set(['gridLayout', 'verticalGap', 'alignEntries', 'entriesCount']);

const neptuneSettings = GridComponent.schema.settings;

// the text is as wide as its block on every layout, where Neptune makes it wider than its entry
const TEXT_BOX_WIDTH = 100;

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

// kept once for every layout: the preset it is linked to keeps the blocks of each layout
const customGrid: SchemaProperty = {
  type: 'object',
  scope: 'common',
  title: '',
  display: { type: 'custom-grid-layout' },
};

// inside, a block is the whole entry and its media takes what the text leaves; outside, the media
// fills the block and the text sits beyond it
const textGrowth: SchemaProperty = {
  type: 'string',
  scope: 'common',
  title: 'Text growth',
  display: { type: 'toggle-cycle', enum: ['inside', 'outside'] },
};

const generalPanelLayout: LayoutItem[] = [
  '__componentName__',
  'type',
  { type: 'row', title: 'Grid', items: ['customGrid'] },
  { type: 'row', title: '', items: ['textBoxWidth', 'showText'] },
  { type: 'row', title: '', items: ['textGrowth', 'align'] },
];

const schema: ComponentSchemaV1 = {
  ...GridComponent.schema,
  settings: {
    ...neptuneSettings,
    properties: {
      ...withoutPlacement(neptuneSettings.properties),
      customGrid,
      textGrowth,
      imageDisplay,
    },
    defaults: {
      ...withoutPlacement(neptuneSettings.defaults),
      imageDisplay: 'cover',
      customGrid: { preset: 0 },
      textGrowth: 'inside',
    },
    layoutDefaults: Object.fromEntries(
      Object.entries(neptuneSettings.layoutDefaults ?? {}).map(([layoutKey, values]) => [
        layoutKey,
        { ...withoutPlacement(values), textBoxWidth: TEXT_BOX_WIDTH },
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
      'textGrowth',
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
