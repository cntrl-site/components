import React from 'react';

export type Component = {
  element: (props: any) => React.ReactElement;
  id: string;
  name: string;
  defaultSize?: {
    width?: number | string;
    height?: number | string;
  };
  schema: any;
  preview?: {
    type: 'image' | 'video';
    url: string;
  };
};
