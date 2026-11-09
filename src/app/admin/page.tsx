import Link from "next/link";
import { Prisma } from "@prisma/client";
import { BookOpenText, CalendarDays, FileUser, Images, Megaphone, ShieldCheck, Trophy, UserRound, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminSignOut } from "@/components/admin-sign-out";

const links = [
  { href: "/admin/ppdb", label: "Pendaftar PPDB", icon: FileUser, roles: ["SUPER_ADMIN", "ADMIN_PPDB"] },
  { href: "/admin/ppdb/periode", label: "Periode PPDB", icon: FileUser, roles: ["SUPER_ADMIN", "ADMIN_PPDB"] },
  { href: "/admin/berita", label: "Berita", icon: BookOpenText, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"] },
  { href: "/admin/kategori", label: "Kategori", icon: BookOpenText, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE"] },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"] },
  { href: "/admin/galeri", label: "Galeri", icon: Images, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"] },
  { href: "/admin/prestasi", label: "Prestasi", icon: Trophy, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"] },
  { href: "/admin/guru", label: "Data guru", icon: UserRound, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"] },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"] },
  { href: "/admin/konten", label: "Profil sekolah", icon: UsersRound, roles: ["SUPER_ADMIN", "ADMIN_WEBSITE"] },
  { href: "/admin/admins", label: "Manajemen admin", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
] as const;

export default async function AdminDashboard() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "ADMIN_PPDB", "EDITOR"]);
  const now = new Date();
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [newsCount, applicantCount, pendingCount, acceptedCount, recent, groupedMonths] = await Promise.all([
    db.post.count(),
    db.applicant.count(),
    db.applicant.count({ where: { status: "PENDING" } }),
    db.applicant.count({ where: { status: "ACCEPTED" } }),
    db.adminActivityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
    db.$queryRaw<{ month: Date; count: number }[]>(Prisma.sql`SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::int AS count FROM "Applicant" WHERE "createdAt" >= ${firstMonth} GROUP BY 1 ORDER BY 1`),
  ]);
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_DASHBOARD", entity: "Dashboard" } });
  const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)).map((date) => ({ date, count: groupedMonths.find((item) => item.month.getFullYear() === date.getFullYear() && item.month.getMonth() === date.getMonth())?.count ?? 0 }));
  const maxCount = Math.max(1, ...months.map((month) => month.count));
  const stats = [{ label: "Total berita", value: newsCount, color: "bg-sky-50 text-school-blue" }, { label: "Total pendaftar", value: applicantCount, color: "bg-violet-50 text-violet-700" }, { label: "Menunggu verifikasi", value: pendingCount, color: "bg-amber-50 text-amber-700" }, { label: "Diterima", value: acceptedCount, color: "bg-emerald-50 text-emerald-700" }];
  return <main className="min-h-screen bg-[#f6f9fc]"><header className="border-b border-slate-200 bg-white"><div className="container-shell flex min-h-20 items-center justify-between gap-4"><Link href="/" className="font-heading font-extrabold">SDIT Al-Ikhlas <span className="text-school-blue">/ Admin</span></Link><div className="flex items-center gap-3 text-sm"><span className="hidden text-slate-500 sm:inline">{user.name} · {user.role.replaceAll("_", " ")}</span><AdminSignOut /></div></div></header><div className="container-shell py-9"><div><p className="eyebrow">Ringkasan pengelolaan</p><h1 className="mt-2 font-heading text-3xl font-black">Dashboard admin</h1></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="soft-card p-5"><p className="text-sm font-semibold text-slate-500">{stat.label}</p><p className={`mt-3 inline-flex rounded-xl px-3 py-2 font-heading text-2xl font-black ${stat.color}`}>{stat.value}</p></article>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><section className="soft-card p-6"><div className="flex items-center justify-between"><h2 className="font-heading text-xl font-extrabold">Pendaftaran enam bulan terakhir</h2><Link href="/admin/ppdb" className="text-sm font-bold text-school-blue">Pendaftar →</Link></div><div className="mt-6 flex h-44 items-end gap-3 border-b border-slate-100">{months.map(({ date, count }) => <div key={`${date.getFullYear()}-${date.getMonth()}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-slate-600">{count || ""}</span><div title={`${count} pendaftar`} className="w-full max-w-12 rounded-t-lg bg-school-blue/85" style={{ height: `${Math.max(count ? 12 : 4, (count / maxCount) * 100)}%` }} /><span className="mb-2 text-[10px] font-semibold text-slate-500">{date.toLocaleDateString("id-ID", { month: "short" })}</span></div>)}</div></section><section className="soft-card p-6"><h2 className="font-heading text-xl font-extrabold">Menu pengelolaan</h2><div className="mt-4 grid max-h-[430px] gap-2 overflow-y-auto">{links.filter((link) => link.roles.some((role) => role === user.role)).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold transition hover:bg-sky-50"><Icon size={18} className="text-school-blue" />{label}</Link>)}</div></section></div><section className="soft-card mt-6 p-6"><h2 className="font-heading text-xl font-extrabold">Aktivitas admin terbaru</h2>{recent.length ? <ul className="mt-4 grid gap-3 md:grid-cols-2">{recent.map((item) => <li key={item.id} className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-bold">{item.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-500">{item.user.name} · {item.createdAt.toLocaleString("id-ID")}</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Belum ada aktivitas tercatat.</p>}</section></div></main>;
}
