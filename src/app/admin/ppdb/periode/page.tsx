import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminPpdbPeriods } from "@/components/admin-ppdb-periods";

export const dynamic = "force-dynamic";

export default async function AdminPpdbPeriodsPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const periods = await db.ppdbPeriod.findMany({ orderBy: { opensAt: "desc" }, include: { requirements: { orderBy: { sortOrder: "asc" } }, _count: { select: { applicants: true } } } });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_PPDB_PERIODS", entity: "PpdbPeriod" } });
  return <main className="min-h-screen bg-[#f6f9fc]"><div className="container-shell py-8"><Link href="/admin/ppdb" className="text-sm font-bold text-school-blue">← Pendaftar PPDB</Link><h1 className="mb-6 mt-5 font-heading text-3xl font-black">Periode & persyaratan PPDB</h1><AdminPpdbPeriods periods={periods} /></div></main>;
}
