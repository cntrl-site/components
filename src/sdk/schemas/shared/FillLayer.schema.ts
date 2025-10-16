import { z } from 'zod';

export const ColorPointSchema = z.object({
  id: z.string(),
  value: z.string(),
  position: z.number()
});

export const FillLayerSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('solid'),
    value: z.string(),
    blendMode: z.string()
  }),
  z.object({
    id: z.string(),
    type: z.literal('linear-gradient'),
    colors: z.array(ColorPointSchema),
    start: z.tuple([z.number(), z.number()]),
    end: z.tuple([z.number(), z.number()]),
    angle: z.number(),
    blendMode: z.string()
  }),
  z.object({
    id: z.string(),
    type: z.literal('radial-gradient'),
    colors: z.array(ColorPointSchema),
    center: z.tuple([z.number(), z.number()]),
    diameter: z.number(),
    angle: z.number(),
    blendMode: z.string()
  }),
  z.object({
    id: z.string(),
    type: z.literal('conic-gradient'),
    colors: z.array(ColorPointSchema),
    center: z.tuple([z.number(), z.number()]),
    angle: z.number(),
    blendMode: z.string()
  }),
  z.object({
    id: z.string(),
    type: z.literal('image'),
    src: z.string(),
    behavior: z.string(),
    backgroundSize: z.number(),
    opacity: z.number(),
    blendMode: z.string(),
    rotation: z.number().optional()
  })
]);
