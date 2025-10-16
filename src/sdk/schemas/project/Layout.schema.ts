import { z } from 'zod';

export const LayoutSchema = z.object({
  id: z.string(),
  title: z.string(),
  startsWith: z.number().nonnegative(),
  exemplary: z.number().positive()
});
