import { GenericMeta } from './Meta';

export interface PageMeta extends GenericMeta {
  enabled?: boolean;
}

export interface Page {
  id: string;
  title: string;
  articleId: string;
  slug: string;
  meta?: PageMeta;
}
