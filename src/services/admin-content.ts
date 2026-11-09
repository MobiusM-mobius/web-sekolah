import "server-only";
import { db } from "@/lib/db";
import type { ContentResource } from "@/lib/validation/content";

export async function listContent(resource: ContentResource, query: string, page: number, pageSize = 20) {
  const contains = query ? { contains: query, mode: "insensitive" as const } : undefined;
  switch (resource) {
    case "announcements": {
      const where = query ? { title: contains } : {};
      const [items, total] = await Promise.all([db.announcement.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }), db.announcement.count({ where })]); return { items, total };
    }
    case "teachers": {
      const where = query ? { name: contains } : {};
      const [items, total] = await Promise.all([db.teacher.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], skip: (page - 1) * pageSize, take: pageSize }), db.teacher.count({ where })]); return { items, total };
    }
    case "galleries": {
      const where = query ? { title: contains } : {};
      const [items, total] = await Promise.all([db.gallery.findMany({ where, orderBy: { updatedAt: "desc" }, include: { images: { orderBy: { sortOrder: "asc" } } }, skip: (page - 1) * pageSize, take: pageSize }), db.gallery.count({ where })]); return { items: items.map(({ images, ...item }) => ({ ...item, imageUrls: images.map((image) => image.imageUrl) })), total };
    }
    case "achievements": {
      const where = query ? { title: contains } : {};
      const [items, total] = await Promise.all([db.achievement.findMany({ where, orderBy: { achievedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }), db.achievement.count({ where })]); return { items, total };
    }
    case "events": {
      const where = query ? { title: contains } : {};
      const [items, total] = await Promise.all([db.event.findMany({ where, orderBy: { startsAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }), db.event.count({ where })]); return { items, total };
    }
  }
}

function makeSlug(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export async function saveContent(resource: ContentResource, data: Record<string, unknown>, id?: string) {
  switch (resource) {
    case "announcements": {
      const published = data.published === true;
      const values = { title: data.title as string, slug: (data.slug as string) || makeSlug(data.title as string), body: data.body as string, status: published ? "PUBLISHED" as const : "DRAFT" as const, publishedAt: published ? new Date() : null, expiresAt: data.expiresAt ? new Date(data.expiresAt as string) : null };
      return id ? db.announcement.update({ where: { id }, data: values }) : db.announcement.create({ data: values });
    }
    case "teachers": {
      const values = { name: data.name as string, position: (data.position as string) || null, biography: (data.biography as string) || null, photoUrl: (data.photoUrl as string) || null, sortOrder: data.sortOrder as number, visible: data.visible as boolean };
      return id ? db.teacher.update({ where: { id }, data: values }) : db.teacher.create({ data: values });
    }
    case "galleries": {
      const values = { title: data.title as string, slug: (data.slug as string) || makeSlug(data.title as string), description: (data.description as string) || null, category: (data.category as string) || null, coverUrl: (data.coverUrl as string) || null, visible: data.visible as boolean };
      const urls = data.imageUrls as string[];
      if (!id) return db.gallery.create({ data: { ...values, images: { create: urls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) } }, include: { images: true } });
      return db.$transaction(async (tx) => {
        await tx.galleryImage.deleteMany({ where: { galleryId: id } });
        return tx.gallery.update({ where: { id }, data: { ...values, images: { create: urls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) } }, include: { images: true } });
      });
    }
    case "achievements": {
      const values = { title: data.title as string, description: (data.description as string) || null, category: (data.category as string) || null, achievedAt: data.achievedAt ? new Date(data.achievedAt as string) : null, imageUrl: (data.imageUrl as string) || null, visible: data.visible as boolean };
      return id ? db.achievement.update({ where: { id }, data: values }) : db.achievement.create({ data: values });
    }
    case "events": {
      const values = { title: data.title as string, description: (data.description as string) || null, location: (data.location as string) || null, startsAt: new Date(data.startsAt as string), endsAt: data.endsAt ? new Date(data.endsAt as string) : null, visible: data.visible as boolean };
      return id ? db.event.update({ where: { id }, data: values }) : db.event.create({ data: values });
    }
  }
}

export async function deleteContent(resource: ContentResource, id: string) {
  switch (resource) {
    case "announcements": return db.announcement.delete({ where: { id } });
    case "teachers": return db.teacher.delete({ where: { id } });
    case "galleries": return db.gallery.delete({ where: { id } });
    case "achievements": return db.achievement.delete({ where: { id } });
    case "events": return db.event.delete({ where: { id } });
  }
}
