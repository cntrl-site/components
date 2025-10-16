import { z, ZodType } from 'zod';
import { Interaction, InteractionItemTrigger, InteractionScrollTrigger, VideoInteractionAction } from '../../types/article/Interaction';

const ItemTriggerSchema = z.object({
  itemId: z.string(),
  type: z.enum(['hover-in', 'hover-out', 'click']),
  from: z.string(),
  to: z.string()
}) satisfies ZodType<InteractionItemTrigger>;

const ScrollTriggerSchema = z.object({
  position: z.number(),
  from: z.string(),
  to: z.string(),
  isReverse: z.boolean()
}) satisfies ZodType<InteractionScrollTrigger>;

const VideoInteractionActionSchema = z.object({
  type: z.enum(['play', 'pause']),
  itemId: z.string()
}) satisfies ZodType<VideoInteractionAction>;

const StateSchema = z.object({
  id: z.string(),
  actions: z.array(VideoInteractionActionSchema).optional()
});

export const InteractionSchema = z.object({
  id: z.string(),
  triggers: z.array(z.union([ItemTriggerSchema, ScrollTriggerSchema])),
  states: z.array(StateSchema),
  startStateId: z.string(),
}) satisfies ZodType<Interaction>;
