export interface RichTextEntity {
  start: number;
  end: number;
  type: string;
  data?: any;
}

export interface RichTextStyle {
  start: number;
  end: number;
  style: string;
  value?: string;
}

export interface RichTextBlock {
  start: number;
  end: number;
  type: string;
  entities?: RichTextEntity[];
  children?: RichTextBlock[];
  data?: any;
}

export enum TextAlign {
  Left = 'left',
  Right = 'right',
  Center = 'center',
  Justify = 'justify'
}

export enum TextTransform {
  None = 'none',
  Uppercase = 'uppercase',
  Lowercase = 'lowercase'
}

export enum VerticalAlign {
  Super = 'super',
  Sub = 'sub',
  Unset = 'unset'
}

export enum TextDecoration {
  Underline = 'underline',
  None = 'none'
}
