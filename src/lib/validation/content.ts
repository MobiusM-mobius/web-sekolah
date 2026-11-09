import { z } from "zod";

const httpsUrl = z.string().url().refine((value) => value.startsWith("https://")).or(z.literal(""));
const slug = z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional().or(z.literal(""));

export const contentSchemas = {
  announcements: z.object({ title: z.string().trim().min(3).max(180), slug, body: z.string().trim().min(5).max(20000), published: z.boolean(), expiresAt: z.iso.datetime().optional().or(z.literal("")) }),
  teachers: z.object({ name: z.string().trim().min(2).max(120), position: z.string().trim().max(120), biography: z.string().max(5000), photoUrl: httpsUrl, sortOrder: z.number().int().min(0).max(10000), visible: z.boolean() }),
  galleries: z.object({ title: z.string().trim().min(3).max(180), slug, description: z.string().max(5000), category: z.string().trim().max(100), coverUrl: httpsUrl, visible: z.boolean(), imageUrls: z.array(httpsUrl).max(100) }),
  achievements: z.object({ title: z.string().trim().min(3).max(180), description: z.string().max(5000), category: z.string().trim().max(100), achievedAt: z.iso.datetime().optional().or(z.literal("")), imageUrl: httpsUrl, visible: z.boolean() }),
  events: z.object({ title: z.string().trim().min(3).max(180), description: z.string().max(5000), location: z.string().trim().max(300), startsAt: z.iso.datetime(), endsAt: z.iso.datetime().optional().or(z.literal("")), visible: z.boolean() }),
};

export type ContentResource = keyof typeof contentSchemas;
export const contentResources = Object.keys(contentSchemas) as ContentResource[];
export function isContentResource(value: string): value is ContentResource { return contentResources.includes(value as ContentResource); }
