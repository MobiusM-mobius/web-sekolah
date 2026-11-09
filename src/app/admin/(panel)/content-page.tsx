import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { isContentResource } from "@/lib/validation/content";
import { listContent } from "@/services/admin-content";
import { AdminContentRecords } from "@/components/admin-content-records";
import { AdminPageHeader } from "@/components/admin-ui";

export async function AdminContentPage({ resource, label, description }: { resource: string; label: string; description: string }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  if (!isContentResource(resource)) notFound();
  const { items, total } = await listContent(resource, "", 1);
  await db.adminActivityLog.create({ data: { userId: user.id, action: `VIEW_${resource.toUpperCase()}`, entity: resource } });
  const safeItems = items as unknown as Record<string, string | number | boolean | string[] | Date | null>[];
  return <>
    <AdminPageHeader title={label} description={description} />
    <AdminContentRecords resource={resource} initialItems={safeItems} total={total} />
  </>;
}
