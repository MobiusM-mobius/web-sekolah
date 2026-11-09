import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/profil", "/akademik", "/berita", "/galeri", "/prestasi", "/kontak", "/ppdb"];
  const posts = await db.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }).catch(() => []);
  return [...staticRoutes.map((route) => ({ url: `${base}${route}`, changeFrequency: "weekly" as const })), ...posts.map((post) => ({ url: `${base}/berita/${post.slug}`, lastModified: post.updatedAt, changeFrequency: "monthly" as const }))];
}
