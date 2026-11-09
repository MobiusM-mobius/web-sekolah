import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Prestasi", description: "Prestasi siswa dan sekolah SDIT Al-Ikhlas Serpong." };

export default async function AchievementsPage() {
  const achievements = await db.achievement.findMany({ where: { visible: true }, orderBy: { achievedAt: "desc" } }).catch(() => []);
  return <div className="container-shell section-space"><span className="eyebrow">Apresiasi & pencapaian</span><h1 className="mt-3 font-heading text-4xl font-black">Prestasi</h1><p className="mt-3 text-slate-600">Dokumentasi prestasi yang dipublikasikan oleh sekolah.</p>{achievements.length ? <div className="mt-8 grid gap-5 md:grid-cols-2">{achievements.map((item) => <article key={item.id} className="soft-card overflow-hidden sm:flex">{item.imageUrl ? <Image src={item.imageUrl} alt="" width={320} height={320} unoptimized className="aspect-square w-full object-cover sm:w-40" /> : <div className="grid aspect-square w-full place-items-center bg-amber-50 text-5xl sm:w-40">🏆</div>}<div className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-school-orange">{item.category ?? "Prestasi"}{item.achievedAt ? ` · ${item.achievedAt.getFullYear()}` : ""}</p><h2 className="mt-2 font-heading text-xl font-extrabold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></div></article>)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-10 text-center"><h2 className="font-heading text-xl font-bold">Informasi prestasi belum tersedia</h2><p className="mt-2 text-sm text-slate-600">Prestasi hanya ditampilkan setelah dimasukkan dan dipublikasikan oleh admin sekolah.</p></div>}</div>;
}
