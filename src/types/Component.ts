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
};

export function isSchemaV1(schema: any): schema is ComponentSchemaV1 {
  return schema.type === 'object' && schema.version === 1;
}
