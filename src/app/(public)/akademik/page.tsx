import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSchoolProfile } from "@/lib/school";
import { PageIntro, Pending } from "@/components/brand";

export const metadata: Metadata = { title: "Akademik", description: "Kurikulum, program pembelajaran, program keislaman, ekstrakurikuler, dan kalender akademik SDIT Al-Ikhlas Serpong.", alternates: { canonical: "/akademik" } };

function ProgramList({ title, items, accent, empty }: { title: string; items: string[]; accent: string; empty: string }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-6 sm:p-7">
      <h2 className="flex items-center gap-3 font-heading text-xl font-extrabold"><span className={`h-6 w-1.5 rounded-full ${accent}`} aria-hidden="true" />{title}</h2>
      {items.length ? <ul className="mt-4 divide-y divide-line">{items.map((item, i) => <li key={i} className="py-2.5">{item}</li>)}</ul> : <div className="mt-4"><Pending>{empty}</Pending></div>}
    </section>
  );
}

export default async function AcademicPage() {
  const now = new Date();
  const [profile, events] = await Promise.all([
    getSchoolProfile(),
    db.event.findMany({ where: { visible: true, OR: [{ startsAt: { gte: now } }, { endsAt: { gte: now } }] }, orderBy: { startsAt: "asc" }, take: 24 }).catch(() => []),
  ]);
  const byMonth: Record<string, (typeof events)[number][]> = {};
  for (const event of events) (byMonth[event.startsAt.toLocaleDateString("id-ID", { month: "long", year: "numeric" })] ??= []).push(event);

  return <>
    <PageIntro tone="leaf" kicker="Belajar dan bertumbuh" title={<>Kegiatan <span className="mark mark-green">akademik</span></>} intro="Kurikulum, program keislaman, dan kegiatan yang membentuk hari-hari belajar di sekolah." />
    <div className="wrap space-y-12 py-14">
      <section className="grid gap-6 rounded-3xl bg-sky-50 p-7 sm:p-9 md:grid-cols-[220px_1fr]">
        <h2 className="font-heading text-2xl font-extrabold">Kurikulum</h2>
        {profile?.curriculum ? <p className="prose-school">{profile.curriculum}</p> : <Pending>Informasi kurikulum sedang dilengkapi.</Pending>}
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <ProgramList title="Program pembelajaran" items={profile?.learningPrograms ?? []} accent="bg-sky-500" empty="Program pembelajaran sedang dilengkapi." />
        <ProgramList title="Program keislaman" items={profile?.islamicPrograms ?? []} accent="bg-leaf-500" empty="Program keislaman sedang dilengkapi." />
        <ProgramList title="Ekstrakurikuler" items={profile?.extracurriculars ?? []} accent="bg-sun-400" empty="Daftar ekstrakurikuler sedang dilengkapi." />
      </div>

      <section aria-labelledby="kalender">
        <h2 id="kalender" className="font-heading text-2xl font-extrabold">Kalender akademik</h2>
        {events.length ? (
          <div className="mt-6 space-y-8">{Object.entries(byMonth).map(([month, items]) => (
            <div key={month} className="grid gap-4 md:grid-cols-[180px_1fr]">
              <h3 className="font-heading text-lg font-extrabold capitalize text-sky-700">{month}</h3>
              <ul className="divide-y divide-line rounded-2xl border border-line bg-white">{items.map((event) => (
                <li key={event.id} className="flex gap-5 p-4">
                  <div className="w-14 shrink-0 rounded-xl bg-sun-50 py-2 text-center"><span className="block font-heading text-2xl font-black leading-none">{event.startsAt.getDate()}</span><span className="text-xs font-semibold text-sun-700">{event.startsAt.toLocaleDateString("id-ID", { weekday: "short" })}</span></div>
                  <div><p className="font-bold">{event.title}</p>{(event.location || event.endsAt) && <p className="text-sm text-ink-soft">{[event.location, event.endsAt ? `sampai ${event.endsAt.toLocaleDateString("id-ID", { day: "numeric", month: "long" })}` : null].filter(Boolean).join(", ")}</p>}{event.description && <p className="mt-1 text-sm text-ink-soft">{event.description}</p>}</div>
                </li>
              ))}</ul>
            </div>
          ))}</div>
        ) : <div className="mt-4"><Pending>Belum ada agenda yang dijadwalkan.</Pending></div>}
      </section>
    </div>
  </>;
}
