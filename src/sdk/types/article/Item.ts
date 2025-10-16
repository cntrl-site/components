import { RichTextBlock, RichTextStyle, TextAlign, TextTransform, VerticalAlign } from './RichText';
import { ArticleItemType } from './ArticleItemType';
import { AreaAnchor, ItemArea } from './ItemArea';
import { ItemState } from './ItemState';
import { FXControlAny, FXCursor } from './FX';
import { CompoundSettings } from './CompoundSettings';

export type ItemAny = Item<ArticleItemType>;

export interface Item<T extends ArticleItemType> {
  id: string;
  type: T;
  area: Record<LayoutIdentifier, ItemArea>;
  hidden: Record<LayoutIdentifier, boolean>;
  link?: Link;
  items?: T extends (ArticleItemType.Group | ArticleItemType.Compound) ? ItemAny[] : never;
  sticky: Record<LayoutIdentifier, StickyParams | null>;
  compoundSettings?: Record<LayoutIdentifier, CompoundSettings>;
  commonParams: ItemCommonParamsMap[T];
  state: ItemState<T>;
  layoutParams: Record<LayoutIdentifier, ItemLayoutParamsMap[T]>;
}

export interface ItemCommonParamsMap {
  [ArticleItemType.Image]: ImageCommonParams;
  [ArticleItemType.Video]: VideoCommonParams;
  [ArticleItemType.RichText]: RichTextCommonParams;
  [ArticleItemType.Rectangle]: RectangleCommonParams;
  [ArticleItemType.VimeoEmbed]: VimeoEmbedCommonParams;
  [ArticleItemType.YoutubeEmbed]: YoutubeEmbedCommonParams;
  [ArticleItemType.Custom]: CustomCommonParams;
  [ArticleItemType.Group]: GroupCommonParams;
  [ArticleItemType.Compound]: CompoundCommonParams;
  [ArticleItemType.CodeEmbed]: CodeEmbedCommonParams
  [ArticleItemType.Component]: ComponentCommonParams;
}

export interface ItemLayoutParamsMap {
  [ArticleItemType.Image]: ImageLayoutParams;
  [ArticleItemType.Video]: VideoLayoutParams;
  [ArticleItemType.RichText]: RichTextLayoutParams;
  [ArticleItemType.Rectangle]: RectangleLayoutParams;
  [ArticleItemType.VimeoEmbed]: VimeoEmbedLayoutParams;
  [ArticleItemType.YoutubeEmbed]: YoutubeEmbedLayoutParams;
  [ArticleItemType.Custom]: CustomLayoutParams;
  [ArticleItemType.Group]: GroupLayoutParams;
  [ArticleItemType.Compound]: CompoundLayoutParams;
  [ArticleItemType.CodeEmbed]: CodeEmbedLayoutParams;
  [ArticleItemType.Component]: ComponentLayoutParams;
}

interface CommonParamsBase {
  pointerEvents?: 'never' | 'when_visible' | 'always';
}

interface MediaCommonParams extends CommonParamsBase {
  url: string;
  hasGLEffect?: boolean;
  fragmentShader: string | null;
  FXControls?: FXControlAny[];
}

interface VideoCommonParams extends MediaCommonParams {
  coverUrl: string | null;
}

interface ImageCommonParams extends MediaCommonParams {}

interface RichTextCommonParams extends CommonParamsBase {
  text: string;
  blocks?: RichTextBlock[];
}

interface RectangleCommonParams extends CommonParamsBase {
  ratioLock: boolean;
}

interface CustomCommonParams extends CommonParamsBase {
  name: string;
}

interface GroupCommonParams extends CommonParamsBase {}

interface CompoundCommonParams extends CommonParamsBase {
  overflow: 'hidden' | 'visible';
}

interface CodeEmbedCommonParams extends CommonParamsBase {
  html: string;
  scale: boolean;
  iframe: boolean;
}

interface VimeoEmbedCommonParams extends CommonParamsBase {
  url: string;
  coverUrl: string | null;
}

interface YoutubeEmbedCommonParams extends CommonParamsBase {
  url: string;
  coverUrl: string | null;
}

interface ComponentCommonParams extends CommonParamsBase {
  componentId: string;
  content?: any;
}

interface MediaLayoutParams {
  opacity: number;
  radius: number;
  strokeWidth: number;
  strokeFill: FillLayer[];
  blur: number;
  isDraggable?: boolean;
}

interface CustomLayoutParams {
  isDraggable?: boolean;
}

interface GroupLayoutParams {
  opacity: number;
  blur: number;
  isDraggable?: boolean;
}

interface CompoundLayoutParams {
  opacity: number;
  isDraggable?: boolean;
}

interface CodeEmbedLayoutParams {
  areaAnchor: AreaAnchor;
  opacity: number;
  blur: number;
  isDraggable?: boolean;
}

interface VimeoEmbedLayoutParams {
  play: 'on-hover' | 'on-click' | 'auto';
  controls: boolean;
  loop: boolean;
  muted: boolean;
  pictureInPicture: boolean;
  radius: number;
  blur: number;
  opacity: number;
}

interface YoutubeEmbedLayoutParams {
  play: 'on-hover' | 'on-click' | 'auto';
  controls: boolean;
  loop: boolean;
  radius: number;
  blur: number;
  opacity: number;
}

interface ImageLayoutParams extends MediaLayoutParams {}

interface VideoLayoutParams extends MediaLayoutParams {
  play: 'on-hover' | 'on-click' | 'auto';
  muted: boolean;
  controls: boolean;
  scrollPlayback: ScrollPlaybackParams | null;
}

interface RichTextLayoutParams {
  rangeStyles?: RichTextStyle[];
  textAlign: TextAlign;
  sizing: string;
  blur: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textTransform: TextTransform;
  verticalAlign: VerticalAlign;
  color: string;
  typeFace: string;
  fontStyle: string;
  fontWeight: number;
  fontVariant: string;
  isDraggable?: boolean;
}

interface RectangleLayoutParams {
  radius: number;
  strokeWidth: number;
  fill: FillLayer[];
  strokeFill: FillLayer[];
  blur: number;
  backdropBlur: number;
  blurMode: 'default' | 'backdrop';
  isDraggable?: boolean;
}

export type FillLayer = SolidFillLayer | LinearGradientFillLayer | RadialGradientFillLayer | ConicGradientFillLayer | ImageLayer;

type ColorPoint = {
  id: string;
  value: string;
  position: number;
}

export type SolidFillLayer = {
  id: string;
  type: 'solid';
  value: string;
  blendMode: string;
};

export type LinearGradientFillLayer = {
  id: string;
  type: 'linear-gradient';
  colors: ColorPoint[];
  start: [number, number];
  end: [number, number];
  angle: number;
  blendMode: string;
};

export type RadialGradientFillLayer = {
  id: string;
  type: 'radial-gradient';
  colors: ColorPoint[];
  diameter: number;
  center: [number, number];
  angle: number;
  blendMode: string;
};

export type ConicGradientFillLayer = {
  id: string;
  type: 'conic-gradient';
  colors: ColorPoint[];
  center: [number, number];
  angle: number;
  blendMode: string;
};

export type ImageLayer = {
  id: string;
  type: 'image';
  src: string;
  behavior: string;
  backgroundSize: number;
  opacity: number;
  blendMode: string;
  rotation?: number;
};
export interface ScrollPlaybackParams {
  from: number;
  to: number;
}

export interface StickyParams {
  from: number;
  to?: number;
}

export interface Link {
  url: string;
  target: string;
}

type LayoutIdentifier = string;

interface ComponentLayoutParams {
  parameters?: any;
  opacity: number;
  blur: number;
}

export type VideoItem = Item<ArticleItemType.Video>;
export type RectangleItem = Item<ArticleItemType.Rectangle>;
export type ImageItem = Item<ArticleItemType.Image>;
export type RichTextItem = Item<ArticleItemType.RichText>;
export type VimeoEmbedItem = Item<ArticleItemType.VimeoEmbed>;
export type YoutubeEmbedItem = Item<ArticleItemType.YoutubeEmbed>;
export type CustomItem = Item<ArticleItemType.Custom>;
export type GroupItem = Item<ArticleItemType.Group>;
export type CodeEmbedItem = Item<ArticleItemType.CodeEmbed>;
export type CompoundItem = Item<ArticleItemType.Compound>;
export type ComponentItem = Item<ArticleItemType.Component>;
