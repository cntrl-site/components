import React from 'react';
import { ComponentSchemaV1 } from './SchemaV1';

export type Component = {
  element: (props: any) => React.ReactElement;
  id: string;
  name: string;
  version?: number;
  defaultSize?: {
    width?: number | string;
    height?: number | string;
  };
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
};

type Path = {
  path: string;
  placeholderEnabled?: boolean;
};

export function isSchemaV1(schema: any): schema is ComponentSchemaV1 {
  return schema.type === 'object' && schema.version === 1;
}
