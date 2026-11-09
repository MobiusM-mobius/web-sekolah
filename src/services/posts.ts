import { randomBytes } from "node:crypto";
import type { z } from "zod";
import type { postInputSchema } from "@/lib/validation/post";

type PostInput = z.infer<typeof postInputSchema>;

export function slugify(value: string) {
  const slug = value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 160);
  return slug || `berita-${randomBytes(3).toString("hex")}`;
}

// Maps validated form input to Post columns; `published` is a form flag, not a column.
export function postData(input: PostInput, previous?: { status: string; publishedAt: Date | null }) {
  const keepDate = previous?.status === "PUBLISHED" && previous.publishedAt;
  return {
    title: input.title,
    slug: input.slug || slugify(input.title),
    excerpt: input.excerpt || null,
    content: input.content,
    coverImageUrl: input.coverImageUrl || null,
    categoryId: input.categoryId || null,
    status: input.published ? ("PUBLISHED" as const) : ("DRAFT" as const),
    publishedAt: input.published ? (keepDate ? previous!.publishedAt : new Date()) : null,
  };
}
