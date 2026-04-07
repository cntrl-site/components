export type PropertyScope = 'common' | 'layout';

export type SchemaDisplay = {
  type: string;
  [key: string]: unknown;
};

export type SchemaProperty = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'fields' | readonly ['string', 'null'];
  scope?: PropertyScope;
  title?: string;
  message?: string;
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
  title?: string;
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

export type LayoutAccordion = {
  type: 'accordion';
  title: string;
  options: Record<string, LayoutItem[]>;
};

export type LayoutPaletteBookmark = {
  type: 'palette-bookmark';
  items: string[];
};

export type LayoutItem =
  | string
  | LayoutRow
  | LayoutGroup
  | LayoutSwitcher
  | LayoutAccordion
  | LayoutPaletteBookmark;

export type SchemaDisplayRule = {
  if:
    | {
        name: string;
        value: unknown;
        isNotEqual?: boolean;
      }
    | Array<{
        name: string;
        value: unknown;
        isNotEqual?: boolean;
      }>;
  then: {
    name: string;
    value: unknown;
  };
};

export type SchemaSection = {
  sizing?: string;
  properties: Record<string, SchemaProperty>;
  layout?: LayoutItem[];
  defaults: Record<string, unknown>;
  displayRules?: SchemaDisplayRule[];
};

export type SchemaPanel = {
  id: string;
  icon: string;
  title: string;
  tooltip?: string;
  layout: LayoutItem[];
};

export type SchemaPaletteBookmark = {
  items: string[];
  panelIds: string[];
  stateItems?: Record<string, string[]>;
};

export type ComponentSchemaV1 = {
  type: 'object';
  version: 1;
  settings: SchemaSection;
  panels?: SchemaPanel[];
  paletteBookmark?: SchemaPaletteBookmark;
  content?: SchemaSection;
  allowedPlugins?: string[];
  states?: string[];
};
