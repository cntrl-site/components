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
  fontRelations?: Record<string, string>;
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

export function resolveStates(schema: unknown, layoutId?: string): string[] {
  if (!isSchemaV1(schema) || !schema.states) {
    return [];
  }
  if (layoutId) {
    const layoutStates = schema.statesByLayout?.[layoutId];
    if (layoutStates) {
      return layoutStates;
    }
  }
  return schema.states;
}
