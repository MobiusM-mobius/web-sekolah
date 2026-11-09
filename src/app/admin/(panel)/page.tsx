import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminPageHeader, StatusBadge } from "@/components/admin-ui";

const actionLabels: Record<string, string> = {
  VIEW_DASHBOARD: "Membuka dashboard", CREATE_POST: "Membuat berita", UPDATE_POST: "Mengubah berita", DELETE_POST: "Menghapus berita",
  UPDATE_APPLICANT_STATUS: "Mengubah status pendaftar", ACCESS_APPLICANT_DOCUMENT: "Membuka dokumen pendaftar", EXPORT_APPLICANTS: "Mengekspor data pendaftar",
  UPDATE_SCHOOL_PROFILE: "Memperbarui profil sekolah", CREATE_ADMIN_USER: "Menambah admin", UPDATE_ADMIN_USER: "Mengubah akun admin", UPLOAD_MEDIA: "Mengunggah gambar",
  CREATE_PPDB_PERIOD: "Membuat periode PPDB", UPDATE_PPDB_PERIOD: "Mengubah periode PPDB",
};
const resourceNames: Record<string, string> = { ANNOUNCEMENTS: "pengumuman", TEACHERS: "data guru", GALLERIES: "album galeri", ACHIEVEMENTS: "prestasi", EVENTS: "agenda", CATEGORY: "kategori" };
const verbs: Record<string, string> = { CREATE: "Menambah", UPDATE: "Mengubah", DELETE: "Menghapus" };
function describe(action: string) {
  if (actionLabels[action]) return actionLabels[action];
  const [verb, ...rest] = action.split("_");
  const noun = resourceNames[rest.join("_")];
  return verbs[verb] && noun ? `${verbs[verb]} ${noun}` : action.toLowerCase().replaceAll("_", " ");
}

export default async function AdminDashboard() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "ADMIN_PPDB", "EDITOR"]);
  const canPpdb = user.role === "SUPER_ADMIN" || user.role === "ADMIN_PPDB";
  const now = new Date();
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [newsCount, applicantCount, pendingCount, acceptedCount, latestApplicants, activity, groupedMonths, profile] = await Promise.all([
    db.post.count(),
    db.applicant.count(),
    db.applicant.count({ where: { status: "PENDING" } }),
    db.applicant.count({ where: { status: "ACCEPTED" } }),
    canPpdb ? db.applicant.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, studentName: true, registrationNo: true, status: true, createdAt: true } }) : Promise.resolve([]),
    db.adminActivityLog.findMany({ where: { action: { notIn: ["VIEW_DASHBOARD"] }, NOT: { action: { startsWith: "VIEW_" } } }, orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
    db.$queryRaw<{ month: Date; count: number }[]>(Prisma.sql`SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::int AS count FROM "Applicant" WHERE "createdAt" >= ${firstMonth} GROUP BY 1 ORDER BY 1`),
    db.schoolProfile.findFirst({ select: { history: true, vision: true, principalName: true, address: true, whatsapp: true, heroImageUrl: true } }),
  ]);
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_DASHBOARD", entity: "Dashboard" } });

  const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)).map((date) => ({ date, count: groupedMonths.find((g) => g.month.getFullYear() === date.getFullYear() && g.month.getMonth() === date.getMonth())?.count ?? 0 }));
  const max = Math.max(1, ...months.map((m) => m.count));
  const stats = [
    { label: "Berita", value: newsCount, href: "/admin/berita", bar: "bg-sky-500" },
    { label: "Total pendaftar", value: applicantCount, href: "/admin/ppdb", bar: "bg-clay-400" },
    { label: "Menunggu verifikasi", value: pendingCount, href: "/admin/ppdb?status=PENDING", bar: "bg-sun-400" },
    { label: "Diterima", value: acceptedCount, href: "/admin/ppdb?status=ACCEPTED", bar: "bg-leaf-500" },
  ];
  const checklist = [
    { label: "Sejarah sekolah", done: !!profile?.history }, { label: "Visi sekolah", done: !!profile?.vision }, { label: "Nama kepala sekolah", done: !!profile?.principalName },
    { label: "Alamat", done: !!profile?.address }, { label: "Nomor WhatsApp", done: !!profile?.whatsapp }, { label: "Foto utama beranda", done: !!profile?.heroImageUrl },
  ];
  const missing = checklist.filter((c) => !c.done);
  const canWebsite = user.role === "SUPER_ADMIN" || user.role === "ADMIN_WEBSITE";

  return <>
    <AdminPageHeader title={`Assalamu'alaikum, ${user.name?.split(" ")[0] ?? "Admin"}`} description="Ringkasan website sekolah dan pendaftaran hari ini." />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href} className="panel relative overflow-hidden p-5 hover:border-sky-200">
          <span className={`absolute inset-y-0 left-0 w-1.5 ${stat.bar}`} aria-hidden="true" />
          <p className="text-sm font-semibold text-ink-soft">{stat.label}</p>
          <p className="mt-2 font-heading text-4xl font-black">{stat.value}</p>
        </Link>
      ))}
    </div>

    {canWebsite && missing.length > 0 && (
      <section className="mt-6 rounded-2xl border border-sun-400 bg-sun-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-heading text-lg font-extrabold">Profil sekolah belum lengkap</h2><p className="text-sm text-ink-soft">Bagian ini masih tampil sebagai &ldquo;sedang dilengkapi&rdquo; di website publik.</p></div>
          <Link href="/admin/konten" className="btn btn-primary btn-sm">Lengkapi profil</Link>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">{missing.map((item) => <li key={item.label} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-sun-700 ring-1 ring-sun-100">{item.label}</li>)}</ul>
      </section>
    )}

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <section className="panel p-6">
        <h2 className="font-heading text-lg font-extrabold">Pendaftaran per bulan</h2>
        <p className="text-sm text-ink-soft">Enam bulan terakhir</p>
        <div className="mt-6 flex h-48 items-end gap-3" role="img" aria-label={`Grafik pendaftaran: ${months.map((m) => `${m.date.toLocaleDateString("id-ID", { month: "long" })} ${m.count}`).join(", ")}`}>
          {months.map(({ date, count }) => (
            <div key={date.toISOString()} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-sm font-bold">{count}</span>
              <div className="w-full max-w-14 rounded-t-lg bg-sky-500" style={{ height: `${Math.max(3, (count / max) * 100)}%`, opacity: count ? 1 : 0.25 }} />
              <span className="text-xs font-semibold capitalize text-ink-soft">{date.toLocaleDateString("id-ID", { month: "short" })}</span>
            </div>
          ))}
        </div>
      </section>

      {canPpdb ? (
        <section className="panel p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="font-heading text-lg font-extrabold">Pendaftar terbaru</h2><Link href="/admin/ppdb" className="link text-sm">Semua pendaftar</Link></div>
          {latestApplicants.length ? <ul className="mt-4 divide-y divide-line">{latestApplicants.map((a) => (
            <li key={a.id}><Link href={`/admin/ppdb/${a.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-sky-700"><span><span className="block font-bold">{a.studentName}</span><span className="font-mono text-xs text-ink-faint">{a.registrationNo}</span></span><StatusBadge status={a.status} /></Link></li>
          ))}</ul> : <p className="mt-4 text-ink-soft">Belum ada pendaftar.</p>}
        </section>
      ) : (
        <section className="panel p-6">
          <h2 className="font-heading text-lg font-extrabold">Mulai menulis</h2>
          <p className="mt-1 text-ink-soft">Bagikan kegiatan sekolah terbaru kepada orang tua.</p>
          <Link href="/admin/berita" className="btn btn-primary mt-5">Tulis berita</Link>
        </section>
      )}
    </div>

    <section className="panel mt-6 p-6">
      <h2 className="font-heading text-lg font-extrabold">Aktivitas terakhir</h2>
      {activity.length ? <ul className="mt-4 divide-y divide-line">{activity.map((item) => (
        <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3"><span><span className="font-semibold">{item.user.name}</span> <span className="text-ink-soft">{describe(item.action).toLowerCase()}</span></span><time className="text-sm text-ink-faint">{item.createdAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</time></li>
      ))}</ul> : <p className="mt-3 text-ink-soft">Belum ada aktivitas perubahan data.</p>}
    </section>
  </>;
}
