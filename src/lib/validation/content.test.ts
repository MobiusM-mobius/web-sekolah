import { describe, expect, it } from "vitest";
import { contentSchemas } from "./content";
import { categorySchema } from "./category";

describe("CMS validation", () => {
  it("requires an announcement body and a valid expiry date", () => {
    const valid = { title: "Jadwal kegiatan", body: "Informasi kegiatan sekolah.", published: true, expiresAt: "2026-12-01T00:00:00.000Z" };
    expect(contentSchemas.announcements.safeParse(valid).success).toBe(true);
    expect(contentSchemas.announcements.safeParse({ ...valid, expiresAt: "nanti" }).success).toBe(false);
    expect(contentSchemas.announcements.safeParse({ ...valid, body: "" }).success).toBe(false);
  });

  it("accepts HTTPS media only and limits gallery images", () => {
    const valid = { title: "Album kegiatan", description: "", category: "Kegiatan", coverUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", visible: true, imageUrls: [] };
    expect(contentSchemas.galleries.safeParse(valid).success).toBe(true);
    expect(contentSchemas.galleries.safeParse({ ...valid, coverUrl: "http://example.com/photo.jpg" }).success).toBe(false);
    expect(contentSchemas.galleries.safeParse({ ...valid, imageUrls: Array(101).fill("https://res.cloudinary.com/demo/photo.jpg") }).success).toBe(false);
  });

  it("rejects duplicate-looking or unsafe category slugs", () => {
    expect(categorySchema.safeParse({ name: "Kegiatan", slug: "kegiatan-sekolah" }).success).toBe(true);
    expect(categorySchema.safeParse({ name: "Kegiatan", slug: "../admin" }).success).toBe(false);
  });
});
