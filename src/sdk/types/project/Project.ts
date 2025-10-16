import { Layout } from './Layout';
import { Fonts } from './Fonts';
import { Meta } from './Meta';
import { Page } from './Page';

export interface AdditionalHTML {
  head: string;
  afterBodyOpen: string;
  beforeBodyClose: string;
}

export interface Project {
  id: string;
  html: AdditionalHTML;
  meta: Meta;
  layouts: Layout[];
  pages: Page[];
  fonts: Fonts;
}
