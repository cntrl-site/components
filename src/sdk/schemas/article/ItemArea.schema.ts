import { z } from 'zod';
import { AnchorSide, PositionType, AreaAnchor } from '../../types/article/ItemArea';

export const ItemAreaSchema = z.object({
  top: z.number(),
  left: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number(),
  angle: z.number(),
  anchorSide: z.nativeEnum(AnchorSide).optional(),
  scale: z.number().nonnegative(),
  positionType: z.nativeEnum(PositionType),
  scaleAnchor: z.nativeEnum(AreaAnchor)
});
