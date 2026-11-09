import { z } from "zod";

export const postInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional().or(z.literal("")),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().trim().min(10).max(100000),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  coverImageUrl: z.url().max(2000).optional().or(z.literal("")),
  published: z.boolean().default(false),
});
