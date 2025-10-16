import { z, ZodType } from 'zod';
import {
  CodeEmbedItem,
  ComponentItem,
  CustomItem,
  ImageItem,
  ItemAny,
  RectangleItem,
  VideoItem,
  VimeoEmbedItem,
  YoutubeEmbedItem
} from '../../types/article/Item';
import {
  CodeEmbedStateParamsSchema,
   ComponentStateParamsSchema,
    CompoundStateParamsSchema,
  CustomItemStateParamsSchema,
  EmbedStateParamsSchema, GroupStateParamsSchema,
  MediaStateParamsSchema,
  RectangleStateParamsSchema
} from './ItemState.schema';
import { RichTextItemSchema } from './RichTextItem.schema';
import { ItemBaseSchema } from './ItemBase.schema';
import { ArticleItemType } from '../../types/article/ArticleItemType';
import { FXControlAny } from '../../types/article/FX';
import { AreaAnchor } from '../../types/article/ItemArea';
import { FillLayerSchema } from './FillLayer.schema';

const pointerEvents = z.enum(['never', 'when_visible', 'always']).optional();

export const FXControlSchema = z.discriminatedUnion('type',[
  z.object({
    type: z.literal('float'),
    shaderParam: z.string(),
    value: z.number()
  }),
  z.object({
    type: z.literal('int'),
    shaderParam: z.string(),
    value: z.number()
  }),
  z.object({
    type: z.literal('vec2'),
    shaderParam: z.string(),
    value: z.tuple([z.number(), z.number()])
  })
]) satisfies ZodType<FXControlAny>;

const FXParams = z.object({
  url: z.string().min(1),
  hasGLEffect: z.boolean().optional(),
  fragmentShader: z.string().nullable(),
  FXControls: z.array(FXControlSchema).optional()
});

const ImageItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.Image),
  commonParams: z.object({
    pointerEvents
  }).merge(FXParams),
  sticky: z.record(
    z.object({
      from: z.number(),
      to: z.number().optional()
    }).nullable(),
  ),
  layoutParams: z.record(
    z.object({
      opacity: z.number().nonnegative(),
      radius: z.number(),
      strokeWidth: z.number(),
      strokeFill: z.array(FillLayerSchema),
      blur: z.number(),
      isDraggable: z.boolean().optional()
    })
  ),
  state: z.record(MediaStateParamsSchema)
}) satisfies ZodType<ImageItem>;

const VideoItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.Video),
  commonParams: z.object({
    coverUrl: z.string().nullable(),
    pointerEvents
  }).merge(FXParams),
  sticky: z.record(
    z.object({
      from: z.number(),
      to: z.number().optional()
    }).nullable(),
  ),
  layoutParams: z.record(
    z.object({
      scrollPlayback: z.object({
        from: z.number(),
        to: z.number()
      }).nullable(),
      opacity: z.number().nonnegative(),
      radius: z.number(),
      strokeWidth: z.number(),
      strokeFill: z.array(FillLayerSchema),
      blur: z.number(),
      isDraggable: z.boolean().optional(),
      play: z.enum(['on-hover', 'on-click', 'auto']),
      muted: z.boolean(),
      controls: z.boolean(),
    })
  ),
  state: z.record(MediaStateParamsSchema)
}) satisfies ZodType<VideoItem>;

const RectangleItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.Rectangle),
  commonParams: z.object({
    ratioLock: z.boolean(),
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
      radius: z.number(),
      strokeWidth: z.number(),
      fill: z.array(FillLayerSchema),
      strokeFill: z.array(FillLayerSchema),
      blur: z.number(),
      backdropBlur: z.number(),
      blurMode: z.enum(['default', 'backdrop']),
      isDraggable: z.boolean().optional()
    })
  ),
  state: z.record(RectangleStateParamsSchema)
}) satisfies ZodType<RectangleItem>;

const CustomItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.Custom),
  commonParams: z.object({
    name: z.string(),
    pointerEvents
  }),
  sticky: z.record(
    z.object({
      from: z.number(),
      to: z.number().optional()
    }).nullable(),
  ),
  layoutParams: z.record(z.object({
    isDraggable: z.boolean().optional()
  })),
  state: z.record(CustomItemStateParamsSchema)
}) satisfies ZodType<CustomItem>;

const VimeoEmbedItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.VimeoEmbed),
  commonParams: z.object({
    url: z.string().min(1),
    coverUrl: z.string().nullable(),
    ratioLock: z.boolean(),
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
      radius: z.number(),
      blur: z.number(),
      opacity: z.number().nonnegative(),
      play: z.union([z.literal('on-hover'), z.literal('on-click'), z.literal('auto')]),
      controls: z.boolean(),
      loop: z.boolean(),
      muted: z.boolean(),
      pictureInPicture: z.boolean()
    })
  ),
  state: z.record(EmbedStateParamsSchema)
}) satisfies ZodType<VimeoEmbedItem>;

const YoutubeEmbedItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.YoutubeEmbed),
  commonParams: z.object({
    url: z.string().min(1),
    coverUrl: z.string().nullable(),
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
      radius: z.number(),
      blur: z.number(),
      opacity: z.number().nonnegative(),
      play: z.enum(['on-hover', 'on-click', 'auto']),
      controls: z.boolean(),
      loop: z.boolean(),
    })
  ),
  state: z.record(EmbedStateParamsSchema)
}) satisfies ZodType<YoutubeEmbedItem>;

const CodeEmbedItemSchema =  ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.CodeEmbed),
  commonParams: z.object({
    html: z.string(),
    scale: z.boolean(),
    iframe: z.boolean(),
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
      areaAnchor:  z.nativeEnum(AreaAnchor),
      opacity: z.number().nonnegative(),
      blur: z.number(),
      isDraggable: z.boolean().optional()
    })
  ),
  state: z.record(CodeEmbedStateParamsSchema)
}) satisfies ZodType<CodeEmbedItem>;

const ComponentItemSchema = ItemBaseSchema.extend({
  type: z.literal(ArticleItemType.Component),
  commonParams: z.object({
    componentId: z.string(),
    content: z.any().optional()
  }),
  sticky: z.record(
    z.object({
      from: z.number(),
      to: z.number().optional()
    }).nullable(),
  ),
  layoutParams: z.record(z.object({
    parameters: z.any().optional(),
    opacity: z.number().nonnegative(),
    blur: z.number()
  })),
  state: z.record(ComponentStateParamsSchema)
}) satisfies ZodType<ComponentItem>;

export const ItemSchema: ZodType<ItemAny> = z.lazy(() => z.discriminatedUnion('type', [
  ImageItemSchema,
  VideoItemSchema,
  RectangleItemSchema,
  CustomItemSchema,
  RichTextItemSchema,
  VimeoEmbedItemSchema,
  YoutubeEmbedItemSchema,
  CodeEmbedItemSchema,
  ComponentItemSchema,
  ItemBaseSchema.extend({
    type: z.literal(ArticleItemType.Group),
    commonParams: z.object({
      pointerEvents
    }),
    items: z.array(ItemSchema),
    sticky: z.record(
      z.object({
        from: z.number(),
        to: z.number().optional()
      }).nullable(),
    ),
    layoutParams: z.record(
      z.object({
        opacity: z.number().nonnegative(),
        blur: z.number()
      })
    ),
    state: z.record(GroupStateParamsSchema)
  }),
  ItemBaseSchema.extend({
    type: z.literal(ArticleItemType.Compound),
    commonParams: z.object({
      overflow: z.enum(['hidden', 'visible']),
      pointerEvents,
    }),
    items: z.array(ItemSchema),
    sticky: z.record(
      z.object({
        from: z.number(),
        to: z.number().optional()
      }).nullable(),
    ),
    layoutParams: z.record(
      z.object({
        opacity: z.number().nonnegative()
      })
    ),
    state: z.record(CompoundStateParamsSchema)
  })
]));
