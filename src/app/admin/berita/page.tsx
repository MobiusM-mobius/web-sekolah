import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminPosts } from "@/components/admin-posts";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const [posts, categories, total] = await Promise.all([db.post.findMany({ orderBy: { updatedAt: "desc" }, take: 100, include: { category: true } }), db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }), db.post.count()]);
  return <main className="min-h-screen bg-[#f6f9fc]"><div className="container-shell py-8"><Link href="/admin" className="text-sm font-bold text-school-blue">← Dashboard</Link><h1 className="mb-6 mt-5 font-heading text-3xl font-black">Manajemen berita</h1><AdminPosts initialPosts={posts} categories={categories} total={total} /></div></main>;
}
