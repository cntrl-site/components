import { ComponentType } from 'react';
import { RectangleItem } from './RectangleItem/RectangleItem';
import { ImageItem } from './FileItem/ImageItem';
import { VideoItem } from './FileItem/VideoItem';
import { RichTextItem } from './RichTextItem/RichTextItem';
import { YoutubeEmbedItem } from './EmbedVideoItem/YoutubeEmbed';
import { VimeoEmbedItem } from './EmbedVideoItem/VimeoEmbed';
import { CustomItem } from './CustomItem/CustomItem';
import { GroupItem } from './GroupItem/GroupItem';
import { CodeEmbedItem } from './CodeEmbedItem/CodeEmbedItem';
import { ItemProps } from './Item';
import { CompoundItem } from './CompoundItem/CompoundItem';
import { ComponentItem } from './ComponentItem/ComponentItem';
import { ArticleItemType } from '../../../sdk/types/article/ArticleItemType';

export const itemsMap: Record<ArticleItemType, ComponentType<ItemProps<any>>> = {
  [ArticleItemType.Rectangle]: RectangleItem,
  [ArticleItemType.Image]: ImageItem,
  [ArticleItemType.Video]: VideoItem,
  [ArticleItemType.RichText]: RichTextItem,
  [ArticleItemType.YoutubeEmbed]: YoutubeEmbedItem,
  [ArticleItemType.VimeoEmbed]: VimeoEmbedItem,
  [ArticleItemType.Custom]: CustomItem,
  [ArticleItemType.Group]: GroupItem,
  [ArticleItemType.Compound]: CompoundItem,
  [ArticleItemType.CodeEmbed]: CodeEmbedItem,
  [ArticleItemType.Component]: ComponentItem
};
