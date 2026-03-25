export type PropertyScope = 'common' | 'layout';

export type SchemaDisplay = {
  type: string;
  [key: string]: unknown;
};

export type SchemaProperty = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'fields';
  scope?: PropertyScope;
  title?: string;
  icon?: string;
  tooltip?: string;
  display?: SchemaDisplay;
  enum?: Array<string | number>;
  properties?: Record<string, SchemaProperty>;
  layout?: LayoutItem[];
  items?: SchemaProperty;
  default?: unknown;
  min?: number;
  max?: number;
};

export type LayoutRow = {
  type: 'row';
  items: LayoutItem[];
};

export type LayoutGroup = {
  type: 'group';
  title: string;
  items: LayoutItem[];
};

export type LayoutSwitcher = {
  type: 'switcher';
  title: string;
  options: Record<string, LayoutItem[]>;
};

export type LayoutItem = string | LayoutRow | LayoutGroup | LayoutSwitcher;

export type SchemaSection = {
  sizing?: string;
  properties: Record<string, SchemaProperty>;
  layout?: LayoutItem[];
  defaults: Record<string, unknown>;
};

export type SchemaPanel = {
  id: string;
  icon: string;
  title: string;
  tooltip?: string;
  layout: LayoutItem[];
};

export type ComponentSchemaV1 = {
  type: 'object';
  version: 1;
  settings: SchemaSection;
  panels?: SchemaPanel[];
  content?: SchemaSection;
};
