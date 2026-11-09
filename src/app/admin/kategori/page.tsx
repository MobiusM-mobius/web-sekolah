import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminCategories } from "@/components/admin-categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_CATEGORIES", entity: "Category" } });
  return <main className="min-h-screen bg-[#f6f9fc]"><div className="container-shell py-8"><Link href="/admin" className="text-sm font-bold text-school-blue">← Dashboard</Link><h1 className="mb-6 mt-5 font-heading text-3xl font-black">Kategori konten</h1><AdminCategories initialCategories={categories} /></div></main>;
}
