import { ItemAny } from './Item';

export enum SectionHeightMode {
  ControlUnits = 'control-units' ,
  ViewportHeightUnits = 'viewport-height-units'
}

export interface SectionHeight {
  mode: SectionHeightMode;
  units: number;
  vhUnits?: number;
}

export type SectionVideo = {
  url: string;
  size: string;
  type: 'video';
  play: 'on-click' | 'auto';
  position: string;
  coverUrl: string | null;
  offsetX: number | null;
};

export type SectionImage = {
  url: string;
  type: 'image';
  size: string;
  position: string;
  offsetX: number | null;
};

export type SectionMedia = SectionVideo | SectionImage;

export interface Section {
  id: string;
  name?: string;
  height: Record<string, SectionHeight>;
  hidden: Record<string, boolean>;
  items: ItemAny[];
  position: Record<string, number>;
  color: Record<string, string | null>;
  media?: Record<string, SectionMedia>;
}
