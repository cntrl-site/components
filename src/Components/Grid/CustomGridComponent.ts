import { Grid } from './Grid';
import { GridComponent } from './GridComponent';
import { ComponentSchemaV1, LayoutItem, SchemaDisplayRule, SchemaProperty } from '../../types/SchemaV1';

// the settings that place Neptune entries, and the align of media a block sizes
const droppedKeys = new Set(['gridLayout', 'verticalGap', 'alignEntries', 'entriesCount', 'align']);

const neptuneSettings = GridComponent.schema.settings;

const TEXT_BOX_WIDTH = 100;

function withoutDropped<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(Object.entries(values).filter(([key]) => !droppedKeys.has(key))) as T;
}

function getRuleSettingKeys(rule: SchemaDisplayRule): string[] {
  const conditions = Array.isArray(rule.if) ? rule.if : [rule.if];
  return [
    ...conditions.map(condition => condition.name.split('.')[0]),
    rule.then.name.replace(/^properties\./, '').split('.')[0],
  ];
}

const imageDisplay: SchemaProperty = {
  type: 'string',
  scope: 'common',
  title: 'Display',
  display: { type: 'toggle-cycle', enum: ['fit', 'cover'] },
};

const customGrid: SchemaProperty = {
  type: 'object',
  scope: 'common',
  title: '',
  display: { type: 'custom-grid-layout' },
};

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
  { type: 'row', title: '', items: ['textGrowth'] },
];

const schema: ComponentSchemaV1 = {
  ...GridComponent.schema,
  settings: {
    ...neptuneSettings,
    properties: {
      ...withoutDropped(neptuneSettings.properties),
      customGrid,
      textGrowth,
      imageDisplay,
    },
    defaults: {
      ...withoutDropped(neptuneSettings.defaults),
      imageDisplay: 'cover',
      customGrid: { preset: 0 },
      textGrowth: 'inside',
    },
    layoutDefaults: Object.fromEntries(
      Object.entries(neptuneSettings.layoutDefaults ?? {}).map(([layoutKey, values]) => [
        layoutKey,
        { ...withoutDropped(values), textBoxWidth: TEXT_BOX_WIDTH },
      ]),
    ),
    displayRules: (neptuneSettings.displayRules ?? [])
      .filter(rule => !getRuleSettingKeys(rule).some(key => droppedKeys.has(key))),
    layout: [
      ...(neptuneSettings.layout ?? []).filter(item => typeof item !== 'string' || !droppedKeys.has(item)),
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
