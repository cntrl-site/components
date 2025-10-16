import { z, ZodType } from 'zod';
import {
  CodeEmbedStateParams,
  CustomItemStateParams,
  VideoEmbedStateParams,
  GroupStateParams,
  MediaStateParams,
  RectangleStateParams,
  RichTextStateParams,
   CompoundStateParams,
  ComponentStateParams
} from '../../types/article/ItemState';
import { FillLayerSchema } from './FillLayer.schema';

const TransitionSchema = z.object({
  timing: z.string(),
  duration: z.number(),
  delay: z.number()
});

export const getStateParamsSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    value: schema,
    in: TransitionSchema,
    out: TransitionSchema
  }).optional();
};

export const ItemStateBaseSchema = z.object({
  width: getStateParamsSchema(z.number()),
  height: getStateParamsSchema(z.number()),
  angle: getStateParamsSchema(z.number()),
  top: getStateParamsSchema(z.number()),
  left: getStateParamsSchema(z.number()),
  scale: getStateParamsSchema(z.number()),
  blur: getStateParamsSchema(z.number())
});

export const MediaStateParamsSchema =
  z.object({
    opacity: getStateParamsSchema(z.number()),
    radius: getStateParamsSchema(z.number()),
    strokeWidth: getStateParamsSchema(z.number()),
    strokeFill: getStateParamsSchema(z.array(FillLayerSchema))
  })
    .merge(ItemStateBaseSchema) satisfies ZodType<MediaStateParams>;

export const RectangleStateParamsSchema = z.object({
  strokeWidth: getStateParamsSchema(z.number()),
  radius: getStateParamsSchema(z.number()),
  fill: getStateParamsSchema(z.array(FillLayerSchema)),
  strokeFill: getStateParamsSchema(z.array(FillLayerSchema)),
  backdropBlur: getStateParamsSchema(z.number())
}).merge(ItemStateBaseSchema) satisfies ZodType<RectangleStateParams>;

export const CustomItemStateParamsSchema = ItemStateBaseSchema satisfies ZodType<CustomItemStateParams>;

export const EmbedStateParamsSchema = z.object({
  radius: getStateParamsSchema(z.number()),
  opacity: getStateParamsSchema(z.number().nonnegative())
}).merge(ItemStateBaseSchema) satisfies ZodType<VideoEmbedStateParams>;

export const RichTextStateParamsSchema = z.object({
  color: getStateParamsSchema(z.string()),
  letterSpacing: getStateParamsSchema(z.number()),
  wordSpacing: getStateParamsSchema(z.number())
}).merge(ItemStateBaseSchema) satisfies ZodType<RichTextStateParams>;

export const GroupStateParamsSchema = z.object({
  opacity: getStateParamsSchema(z.number().nonnegative()),
  blur: getStateParamsSchema(z.number().nonnegative())
}).merge(ItemStateBaseSchema) satisfies ZodType<GroupStateParams>;

export const CompoundStateParamsSchema = z.object({
  opacity: getStateParamsSchema(z.number().nonnegative())
}).merge(ItemStateBaseSchema) satisfies ZodType<CompoundStateParams>;

export const CodeEmbedStateParamsSchema = z.object({
  opacity: getStateParamsSchema(z.number().nonnegative())
}).merge(ItemStateBaseSchema) satisfies ZodType<CodeEmbedStateParams>;

export const ComponentStateParamsSchema = z.object({
  opacity: getStateParamsSchema(z.number().nonnegative())
}).merge(ItemStateBaseSchema) satisfies ZodType<ComponentStateParams>;

export const ItemStateParamsSchema = z.union([
  EmbedStateParamsSchema,
  MediaStateParamsSchema,
  RectangleStateParamsSchema,
  RichTextStateParamsSchema,
  CustomItemStateParamsSchema,
  GroupStateParamsSchema,
  CompoundStateParamsSchema,
  CodeEmbedStateParamsSchema,
  ComponentStateParamsSchema
]);
