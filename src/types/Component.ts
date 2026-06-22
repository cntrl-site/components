import React from 'react';
import { ComponentSchemaV1 } from './SchemaV1';

export type Breakpoint = 'd' | 't' | 'm';

export type ComponentSize = {
  width?: number | string;
  height?: number | string;
};

export type ComponentDefaultSize = Partial<Record<Breakpoint, ComponentSize>>;

export type Component = {
  element: (props: any) => React.ReactElement;
  id: string;
  name: string;
  category?: string;
  version?: number;
  layoutMode?: 'freeform' | 'structured';
  defaultSize?: ComponentDefaultSize;
  schema: any;
  preview?: {
    type: 'image' | 'video';
    url: string;
  };
  sourceCode?: string;
  assetsPaths?: {
    content: Path[];
    parameters: Path[];
  };
  fontSettingsPaths?: {
    content: Path[];
    parameters: Path[];
  };
  normalizeLayoutSettingsUpdate?: (
    nextSettings: Record<string, any>,
    prevSettings: Record<string, any>,
    options?: any,
  ) => Record<string, any>;
};

type Path = {
  path: string;
  placeholderEnabled?: boolean;
};

export function isSchemaV1(schema: any): schema is ComponentSchemaV1 {
  return schema.type === 'object' && schema.version === 1;
}
