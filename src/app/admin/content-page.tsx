import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { isContentResource } from "@/lib/validation/content";
import { listContent } from "@/services/admin-content";
import { AdminContentRecords } from "@/components/admin-content-records";

export async function AdminContentPage({ resource, label }: { resource: string; label: string }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  if (!isContentResource(resource)) notFound();
  const { items, total } = await listContent(resource, "", 1);
  await db.adminActivityLog.create({ data: { userId: user.id, action: `VIEW_${resource.toUpperCase()}`, entity: resource } });
  const safeItems = items as unknown as Record<string, string | number | boolean | string[] | Date | null>[];
  const imageResource = resource === "galleries" || resource === "teachers" || resource === "achievements";
  const categories = resource === "galleries" ? await db.category.findMany({ select: { name: true }, orderBy: { name: "asc" } }).catch(() => []) : [];
  return <main className="min-h-screen bg-[#f6f9fc]"><div className="container-shell py-8"><Link href="/admin" className="text-sm font-bold text-school-blue">← Dashboard</Link><h1 className="mb-6 mt-5 font-heading text-3xl font-black">{label}</h1>{imageResource && categories.length > 0 && <p className="mb-4 text-sm text-slate-500">Kategori tersedia: {categories.map((category) => category.name).join(", ")}</p>}<AdminContentRecords resource={resource} initialItems={safeItems} total={total} /></div></main>;
}
