import { z } from 'zod';
import { LayoutSchema } from './Layout.schema';
import { FontFileTypes } from '../../types/project/Fonts';

export const ProjectSchema = z.object({
  id: z.string().min(1),
  html: z.object({
    head: z.string(),
    afterBodyOpen: z.string(),
    beforeBodyClose: z.string()
  }),
  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    opengraphThumbnail: z.string().optional(),
    keywords: z.string().optional(),
    favicon: z.string().optional()
  }),
  layouts: z.array(LayoutSchema),
  pages: z.array(z.object({
    title: z.string(),
    articleId: z.string().min(1),
    slug: z.string(),
    meta: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      opengraphThumbnail: z.string().optional(),
      keywords: z.string().optional(),
      enabled: z.boolean()
    }).optional(),
    id: z.string().min(1)
  })),
  fonts: z.object({
    google: z.string(),
    adobe: z.string(),
    custom: z.array(z.object({
      name: z.string().min(1),
      style: z.string().min(1),
      weight: z.number(),
      files: z.array(
        z.object({
          type: z.nativeEnum(FontFileTypes),
          url: z.string()
        })
      )
    }))
  })
});
