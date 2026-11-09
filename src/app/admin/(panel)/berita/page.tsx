import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminPosts } from "@/components/admin-posts";
import { AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const [posts, categories, total] = await Promise.all([
    db.post.findMany({ orderBy: { updatedAt: "desc" }, take: 100, include: { category: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.post.count(),
  ]);
  return <>
    <AdminPageHeader title="Berita" description="Tulis kabar kegiatan sekolah. Berita draf tidak tampil di website sampai dipublikasikan." />
    <AdminPosts initialPosts={posts} categories={categories} total={total} />
  </>;
}
