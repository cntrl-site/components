import { z, ZodType } from 'zod';
import { RichTextBlock, TextAlign, TextTransform, VerticalAlign } from '../../types/article/RichText';
import { ItemBaseSchema } from './ItemBase.schema';
import { ArticleItemType } from '../../types/article/ArticleItemType';
import { RichTextStateParamsSchema } from './ItemState.schema';
import { RichTextItem } from '../../types/article/Item';

const pointerEvents = z.enum(['never', 'when_visible', 'always']).optional();

export const RichTextEntitySchema = z.object({
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  type: z.string(),
  data: z.any().optional()
});

export const RichTextStyleSchema = z.object({
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  style: z.string().min(1),
  value: z.string().optional()
});

export const RichTextBlockSchema: z.Schema<RichTextBlock> = z.lazy(() => (
  z.object({
    start: z.number().nonnegative(),
    end: z.number().nonnegative(),
    type: z.string().min(1),
    entities: z.array(RichTextEntitySchema).optional(),
    children: z.array(RichTextBlockSchema).optional(),
    data: z.any().optional()
  })
));

export const RichTextItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.RichText),
  commonParams: z.object({
    text: z.string(),
    blocks: z.array(RichTextBlockSchema).optional(),
    pointerEvents
  }),
  sticky: z.record(
    z.object({
      from: z.number(),
      to: z.number().optional()
    }).nullable(),
  ),
  layoutParams: z.record(
    z.object({
      rangeStyles: z.array(RichTextStyleSchema).optional(),
      textAlign: z.nativeEnum(TextAlign),
      sizing: z.string(),
      blur: z.number(),
      fontSize: z.number(),
      lineHeight: z.number(),
      letterSpacing: z.number(),
      wordSpacing: z.number(),
      textTransform: z.nativeEnum(TextTransform),
      verticalAlign: z.nativeEnum(VerticalAlign),
      color: z.string(),
      typeFace: z.string(),
      fontStyle: z.string(),
      fontWeight: z.number(),
      fontVariant: z.string(),
      isDraggable: z.boolean().optional()
    })
  ),
  state: z.record(RichTextStateParamsSchema)
}) satisfies ZodType<RichTextItem>;
