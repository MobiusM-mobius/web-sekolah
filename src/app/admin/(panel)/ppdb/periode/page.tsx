import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminPpdbPeriods } from "@/components/admin-ppdb-periods";
import { AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminPpdbPeriodsPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const periods = await db.ppdbPeriod.findMany({ orderBy: { opensAt: "desc" }, include: { requirements: { orderBy: { sortOrder: "asc" } }, _count: { select: { applicants: true } } } });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_PPDB_PERIODS", entity: "PpdbPeriod" } });
  return <>
    <AdminPageHeader back={{ href: "/admin/ppdb", label: "Pendaftar" }} title="Periode & persyaratan PPDB" description="Atur tahun ajaran, jadwal, kuota, biaya, dokumen wajib, dan FAQ. Hanya satu periode yang aktif pada satu waktu." />
    <AdminPpdbPeriods periods={periods} />
  </>;
}
