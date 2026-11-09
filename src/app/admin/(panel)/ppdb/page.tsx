import Link from "next/link";
import { Download, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminPageHeader, StatusBadge, statusLabels } from "@/components/admin-ui";

type Params = Promise<{ q?: string; status?: string; period?: string; page?: string }>;
const statuses = ["PENDING", "VERIFIED", "REVISION_REQUIRED", "ACCEPTED", "REJECTED"] as const;
const PAGE_SIZE = 20;

export default async function AdminPpdbPage({ searchParams }: { searchParams: Params }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const params = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page ?? "1", 10) || 1));
  const q = params.q?.trim().slice(0, 100) ?? "";
  const status = statuses.find((s) => s === params.status);
  const periods = await db.ppdbPeriod.findMany({ orderBy: { opensAt: "desc" }, select: { id: true, academicYear: true } });
  const periodId = periods.find((p) => p.id === params.period)?.id;
  const where: Prisma.ApplicantWhereInput = {
    ...(q ? { OR: [{ studentName: { contains: q, mode: "insensitive" } }, { registrationNo: { contains: q, mode: "insensitive" } }] } : {}),
    ...(status ? { status } : {}),
    ...(periodId ? { periodId } : {}),
  };
  const [applicants, total, counts] = await Promise.all([
    db.applicant.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: { id: true, registrationNo: true, studentName: true, fatherName: true, motherName: true, status: true, createdAt: true, period: { select: { academicYear: true } } } }),
    db.applicant.count({ where }),
    db.applicant.groupBy({ by: ["status"], _count: true, where: periodId ? { periodId } : {} }),
  ]);
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_APPLICANTS_PAGE", entity: "Applicant", details: { page, filtered: !!(q || status || periodId) } } });

  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const href = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { q: q || undefined, status, period: periodId, page: undefined, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return `/admin/ppdb${s ? `?${s}` : ""}`;
  };
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return <>
    <AdminPageHeader title="Pendaftar PPDB" description="Periksa berkas, ubah status, dan beri catatan untuk orang tua."
      actions={<><Link href="/admin/ppdb/periode" className="btn btn-secondary">Periode & syarat</Link><a href="/api/admin/applicants/export" className="btn btn-primary"><Download size={17} />Ekspor ke Excel (CSV)</a></>} />

    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter status">
      <Link href={href({ status: undefined })} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${!status ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}>Semua <span className="opacity-60">{counts.reduce((a, c) => a + c._count, 0)}</span></Link>
      {statuses.map((s) => <Link key={s} href={href({ status: s })} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${status === s ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}>{statusLabels[s]} <span className="opacity-60">{countOf(s)}</span></Link>)}
    </nav>

    <form action="/admin/ppdb" className="mt-4 flex flex-col gap-3 md:flex-row" role="search">
      {status && <input type="hidden" name="status" value={status} />}
      <label className="relative flex-1"><span className="sr-only">Cari pendaftar</span><Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" /><input name="q" defaultValue={q} placeholder="Nama calon siswa atau nomor pendaftaran" className="field !mt-0 !pl-10" /></label>
      <label className="md:w-56"><span className="sr-only">Tahun ajaran</span><select name="period" defaultValue={periodId ?? ""} className="field !mt-0"><option value="">Semua tahun ajaran</option>{periods.map((p) => <option key={p.id} value={p.id}>{p.academicYear}</option>)}</select></label>
      <button type="submit" className="btn btn-primary">Terapkan</button>
    </form>

    <section className="panel mt-5 overflow-hidden">
      {applicants.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-line bg-paper text-sm text-ink-soft"><tr><th className="px-5 py-3 font-semibold">Calon siswa</th><th className="px-5 py-3 font-semibold">Orang tua</th><th className="px-5 py-3 font-semibold">Tahun ajaran</th><th className="px-5 py-3 font-semibold">Mendaftar</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead>
            <tbody className="divide-y divide-line">{applicants.map((a) => (
              <tr key={a.id} className="hover:bg-paper">
                <td className="px-5 py-3.5"><Link href={`/admin/ppdb/${a.id}`} className="font-bold hover:text-sky-700 hover:underline">{a.studentName}</Link><p className="font-mono text-xs text-ink-faint">{a.registrationNo}</p></td>
                <td className="px-5 py-3.5 text-sm text-ink-soft">{a.fatherName}<br />{a.motherName}</td>
                <td className="px-5 py-3.5 text-sm">{a.period.academicYear}</td>
                <td className="px-5 py-3.5 text-sm">{a.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center"><p className="font-heading text-lg font-extrabold">{q || status || periodId ? "Tidak ada pendaftar yang cocok" : "Belum ada pendaftar"}</p><p className="mt-1 text-ink-soft">{q || status || periodId ? "Ubah kata kunci atau filter." : "Pendaftar akan muncul di sini setelah orang tua mengirim formulir."}</p>{(q || status || periodId) && <Link href="/admin/ppdb" className="btn btn-secondary mt-4">Hapus filter</Link>}</div>
      )}
    </section>

    {pages > 1 && (
      <nav className="mt-5 flex items-center justify-between" aria-label="Halaman pendaftar">
        {page > 1 ? <Link href={href({ page: String(page - 1) })} className="btn btn-secondary btn-sm">Sebelumnya</Link> : <span />}
        <span className="text-sm text-ink-soft">Halaman {page} dari {pages}, {total} pendaftar</span>
        {page < pages ? <Link href={href({ page: String(page + 1) })} className="btn btn-secondary btn-sm">Berikutnya</Link> : <span />}
      </nav>
    )}
  </>;
}
