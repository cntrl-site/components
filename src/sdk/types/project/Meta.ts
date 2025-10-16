export interface Meta extends GenericMeta {
  favicon?: string;
}

export interface GenericMeta {
  title?: string;
  description?: string;
  opengraphThumbnail?: string;
  keywords?: string;
}
