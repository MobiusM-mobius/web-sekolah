import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Akademik", description: "Informasi akademik dan program SDIT Al-Ikhlas Serpong." };

function ListBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <section className="soft-card p-6"><h2 className="font-heading text-xl font-extrabold">{title}</h2>{items.length ? <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">{items.map((item, i) => <li key={i} className="rounded-xl bg-slate-50 p-3">{item}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">{empty}</p>}</section>;
}

export default async function AcademicPage() {
  const [profile, events] = await Promise.all([db.schoolProfile.findFirst().catch(() => null), db.event.findMany({ where: { visible: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 20 }).catch(() => [])]);
  return <div className="container-shell section-space"><span className="eyebrow">Belajar & bertumbuh</span><h1 className="mt-3 font-heading text-4xl font-black">Akademik</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Program dan informasi akademik resmi sekolah.</p><section className="mt-8 rounded-3xl bg-sky-50 p-7"><h2 className="font-heading text-xl font-extrabold">Kurikulum</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{profile?.curriculum || "Informasi kurikulum belum dilengkapi oleh administrator."}</p></section><div className="mt-6 grid gap-5 md:grid-cols-3"><ListBlock title="Program pembelajaran" items={profile?.learningPrograms ?? []} empty="Program pembelajaran belum diisi." /><ListBlock title="Program keislaman" items={profile?.islamicPrograms ?? []} empty="Program keislaman belum diisi." /><ListBlock title="Ekstrakurikuler" items={profile?.extracurriculars ?? []} empty="Informasi ekstrakurikuler belum diisi." /></div><section className="mt-10"><h2 className="font-heading text-2xl font-extrabold">Kalender akademik</h2>{events.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{events.map((event) => <article key={event.id} className="soft-card p-5"><p className="text-xs font-bold text-school-blue">{event.startsAt.toLocaleDateString("id-ID", { dateStyle: "long" })}</p><h3 className="mt-2 font-bold">{event.title}</h3><p className="mt-1 text-sm text-slate-500">{event.location}</p></article>)}</div> : <p className="mt-3 text-sm text-slate-600">Agenda akademik belum dipublikasikan.</p>}</section></div>;
}
