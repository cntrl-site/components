export enum FontFileTypes {
  OTF = 'otf',
  TTF = 'ttf',
  WOFF = 'woff',
  WOFF2 = 'woff2',
  EOT = 'eot'
}

export interface CustomFontFile {
  type: FontFileTypes;
  url: string;
}

export interface CustomFont {
  name: string;
  style: string;
  weight: number;
  files: CustomFontFile[];
}

export interface Fonts {
  google: string;
  adobe: string;
  custom: CustomFont[];
}
