import { ItemAny, Item as TItem } from '../../sdk/types/article/Item';
import { ArticleItemType } from '../../sdk/types/article/ArticleItemType';

export function isItemType<T extends ArticleItemType>(item: ItemAny, itemType: T): item is TItem<T> {
  return item.type === itemType;
}
