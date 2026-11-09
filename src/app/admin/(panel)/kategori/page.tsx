import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminCategories } from "@/components/admin-categories";
import { AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_CATEGORIES", entity: "Category" } });
  return <>
    <AdminPageHeader title="Kategori berita" description="Kategori membantu pengunjung menyaring berita, misalnya kegiatan, pengumuman akademik, atau keislaman." />
    <AdminCategories initialCategories={categories} />
  </>;
}
