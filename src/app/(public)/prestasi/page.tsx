import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";
import { Art, PageIntro } from "@/components/brand";
import { dateLong } from "@/lib/school";

export const metadata: Metadata = { title: "Prestasi", description: "Prestasi siswa SDIT Al-Ikhlas Serpong.", alternates: { canonical: "/prestasi" } };

export default async function AchievementsPage() {
  const achievements = await db.achievement.findMany({ where: { visible: true }, orderBy: [{ achievedAt: "desc" }, { createdAt: "desc" }] }).catch(() => []);
  const byYear: Record<string, (typeof achievements)[number][]> = {};
  for (const item of achievements) (byYear[item.achievedAt ? String(item.achievedAt.getFullYear()) : "Lainnya"] ??= []).push(item);

  return <>
    <PageIntro tone="sun" kicker="Apresiasi" title={<>Prestasi <span className="pill-word">siswa</span></>} intro="Capaian siswa yang telah didokumentasikan dan dipublikasikan sekolah." />
    <div className="wrap py-12">
      {achievements.length ? (
        <div className="space-y-12">{Object.entries(byYear).map(([year, items]) => (
          <section key={year} className="grid gap-6 md:grid-cols-[140px_1fr]" aria-labelledby={`tahun-${year}`}>
            <h2 id={`tahun-${year}`} className="font-heading text-3xl font-black text-sun-700">{year}</h2>
            <ul className="grid gap-5 sm:grid-cols-2">{items.map((item) => (
              <li key={item.id} className="flex gap-5 rounded-2xl border border-line bg-white p-4">
                <div className="arch relative h-28 w-22 shrink-0 bg-sun-400">{item.imageUrl ? <Image src={item.imageUrl} alt="" fill unoptimized sizes="88px" className="object-cover" /> : <Art tone="sun" shape="star" ink="night" inset="24%" />}</div>
                <div className="py-1">
                  {item.category && <p className="text-sm font-semibold text-clay-700">{item.category}</p>}
                  <h3 className="font-heading text-lg font-extrabold leading-snug">{item.title}</h3>
                  {item.achievedAt && <p className="mt-0.5 text-sm text-ink-faint">{dateLong(item.achievedAt)}</p>}
                  {item.description && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{item.description}</p>}
                </div>
              </li>
            ))}</ul>
          </section>
        ))}</div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-line bg-white p-10 text-center">
          <h2 className="font-heading text-xl font-extrabold">Belum ada prestasi yang dipublikasikan</h2>
          <p className="mt-2 text-ink-soft">Prestasi siswa akan tampil di sini setelah didokumentasikan sekolah.</p>
        </div>
      )}
    </div>
  </>;
}
