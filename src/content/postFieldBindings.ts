import type { ComponentContentProperty, ComponentContentSchema, ContentKey } from '../types/SchemaV1';

/** A value of a component's content as the content panel writes it and the component reads it: plain data. */
export type ContentValue = string | number | boolean | ContentValue[] | { [key: string]: ContentValue };

/** What a collection post offers a field from the entry under the field's key: its text, and its images' files. */
export type PostFieldEntry = { text: string; images: string[] };

/** The post page a field bound to the post's link is given. */
export type PostFieldPage = { pageId: string; slug: string };

/**
 * How one field of a component's content takes its value from a collection post: the post key the
 * schema binds it to, and the value the field's display holds for what the post offers.
 */
export type PostFieldBinding = {
  fieldKey: string;
  contentKey?: ContentKey;
  /** The value for the entry under the field's key; a post without one offers no text and no images. */
  fromEntry: (entry: PostFieldEntry) => ContentValue;
  /** The value of a field bound to the post's link. */
  toPage: (page: PostFieldPage) => ContentValue;
};

function media(assetId: string): ContentValue {
  return { assetId, name: '', type: 'image', objectFit: 'cover' };
}

/**
 * An entry in the shape the field's display writes, so a row filled from a post is indistinguishable
 * from a typed one. A link field is only ever filled with the post's own page, so from an entry it
 * has no link yet.
 */
function fromEntry(display: string | undefined, { text, images }: PostFieldEntry): ContentValue {
  switch (display) {
    case 'media-pair-list-input':
      // a pair is the full image plus an optional display variant; posts only have the former
      return images.map(image => ({ media: [media(image), media('')] }));
    case 'media-list-input':
      return images.map(media);
    case 'media-input':
      return images.length > 0 ? media(images[0]) : { assetId: '', name: '' };
    case 'rich-text':
      return [{ type: 'paragraph', children: [{ text }] }];
    case 'link-input':
      return { type: 'url', value: '', target: 'self' };
    default:
      return text;
  }
}

/** A link field links the post's page; a text field keeps the path it has always been given. */
function toPage(display: string | undefined, { pageId, slug }: PostFieldPage): ContentValue {
  return display === 'link-input' ? { type: 'page', value: pageId, target: 'self' } : `/${slug}`;
}

/** How each field of a component's content is filled from a collection post, in the schema's order. */
export function getPostFieldBindings(schema: ComponentContentSchema | undefined): PostFieldBinding[] {
  const properties: Record<string, ComponentContentProperty> = schema?.items?.properties ?? {};
  return Object.entries(properties).map(([fieldKey, property]) => {
    const display = property.display?.type;
    return {
      fieldKey,
      ...(property.contentKey !== undefined ? { contentKey: property.contentKey } : {}),
      fromEntry: entry => fromEntry(display, entry),
      toPage: page => toPage(display, page),
    };
  });
}
