import React from 'react';

export type Component = {
  element: (props: any) => React.ReactElement;
  id: string;
  name: string;
  defaultSize: {
    width: number;
    height: number;
  };
  schema: any;
  preview?: {
    type: 'image' | 'video';
    url: string;
  };
};
