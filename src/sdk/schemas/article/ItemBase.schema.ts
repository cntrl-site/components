import { z } from 'zod';
import { ItemAreaSchema } from './ItemArea.schema';
import { AreaAnchor, DimensionMode } from '../../types/article/ItemArea';

export const Link = z.object({
  url: z.string().min(1),
  target: z.string().min(1)
});

export const CompoundSettingsSchema = z.object({
  positionAnchor: z.nativeEnum(AreaAnchor),
  widthMode: z.nativeEnum(DimensionMode),
  heightMode: z.nativeEnum(DimensionMode),
});

export const ItemBaseSchema = z.object({
  id: z.string().min(1),
  area: z.record(ItemAreaSchema),
  hidden: z.record(z.boolean()),
  link: Link.optional(),
  compoundSettings: z.record(CompoundSettingsSchema).optional(),
  layoutParams: z.record(z.any()).optional()
});
