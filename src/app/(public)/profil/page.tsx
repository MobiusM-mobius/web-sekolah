import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSchoolProfile } from "@/lib/school";
import { PageIntro, Pending, SectionHeading, Star } from "@/components/brand";

export const metadata: Metadata = { title: "Profil Sekolah", description: "Sejarah, identitas, visi, misi, guru, dan fasilitas SDIT Al-Ikhlas Serpong.", alternates: { canonical: "/profil" } };

const toneColors = ["#2498dc", "#34b879", "#ffc94a", "#ff8a55"];

export default async function ProfilePage() {
  const [profile, teachers] = await Promise.all([
    getSchoolProfile(),
    db.teacher.findMany({ where: { visible: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }).catch(() => []),
  ]);
  const identity = profile?.identity && typeof profile.identity === "object" && !Array.isArray(profile.identity) ? Object.entries(profile.identity as Record<string, unknown>).filter(([, v]) => v !== "" && v != null) : [];
  const organization = profile?.organization && typeof profile.organization === "object" && !Array.isArray(profile.organization) ? Object.entries(profile.organization as Record<string, unknown>) : [];

  return <>
    <PageIntro kicker="Tentang kami" title={<>Profil <span className="mark">SDIT Al-Ikhlas</span> Serpong</>} intro="Sejarah, arah, dan orang-orang yang mendampingi anak-anak belajar setiap hari." />

    <div className="wrap grid gap-14 py-14 lg:grid-cols-[1fr_340px]">
      <div className="space-y-14">
        <section aria-labelledby="sejarah">
          <h2 id="sejarah" className="font-heading text-2xl font-extrabold">Sejarah sekolah</h2>
          <div className="mt-4">{profile?.history ? <p className="prose-school">{profile.history}</p> : <Pending>Sejarah sekolah sedang dilengkapi.</Pending>}</div>
        </section>

        <section aria-labelledby="visi" className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-sky-50 p-7">
            <h2 id="visi" className="font-heading text-2xl font-extrabold">Visi</h2>
            {profile?.vision ? <p className="mt-3 font-heading text-xl font-bold leading-snug text-sky-900">{profile.vision}</p> : <div className="mt-3"><Pending>Visi sedang dilengkapi.</Pending></div>}
          </div>
          <div className="rounded-3xl bg-leaf-50 p-7">
            <h2 className="font-heading text-2xl font-extrabold">Misi</h2>
            {profile?.mission.length ? <ol className="mt-4 space-y-3">{profile.mission.map((item, i) => <li key={i} className="flex gap-3"><span className="font-heading font-black text-leaf-700">{i + 1}.</span><span>{item}</span></li>)}</ol> : <div className="mt-3"><Pending>Misi sedang dilengkapi.</Pending></div>}
          </div>
        </section>

        {!!profile?.goals.length && (
          <section aria-labelledby="tujuan">
            <h2 id="tujuan" className="font-heading text-2xl font-extrabold">Tujuan sekolah</h2>
            <ul className="mt-5 space-y-3">{profile.goals.map((goal, i) => <li key={i} className="flex gap-3"><Star className="mt-1.5 size-4 shrink-0" color={toneColors[i % 4]} />{goal}</li>)}</ul>
          </section>
        )}

        <section aria-labelledby="kepala-sekolah" className="grid items-center gap-8 rounded-3xl border border-line bg-white p-6 sm:grid-cols-[180px_1fr] sm:p-8">
          <div className="arch relative mx-auto aspect-[4/5] w-40 bg-sun-400 sm:w-full">
            {profile?.principalPhotoUrl ? <Image src={profile.principalPhotoUrl} alt={profile.principalName ? `Foto ${profile.principalName}` : "Foto kepala sekolah"} fill unoptimized sizes="180px" className="object-cover" /> : <div className="tile tile-sun size-full" />}
          </div>
          <div>
            <p className="kicker">Kepala sekolah</p>
            <h2 id="kepala-sekolah" className="mt-1 font-heading text-2xl font-extrabold">{profile?.principalName || "Profil kepala sekolah"}</h2>
            {profile?.principalMessage ? <p className="prose-school mt-3 text-ink-soft">{profile.principalMessage}</p> : <div className="mt-3"><Pending>Profil dan sambutan kepala sekolah sedang dilengkapi.</Pending></div>}
          </div>
        </section>

        {organization.length > 0 && (
          <section aria-labelledby="struktur">
            <h2 id="struktur" className="font-heading text-2xl font-extrabold">Struktur organisasi</h2>
            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">{organization.map(([role, name]) => <div key={role} className="border-l-4 border-sky-500 pl-4"><dt className="text-sm text-ink-soft">{role}</dt><dd className="font-bold">{String(name)}</dd></div>)}</dl>
          </section>
        )}

        <section aria-labelledby="guru">
          <SectionHeading title={<span id="guru">Guru dan tenaga pendidik</span>} />
          {teachers.length ? (
            <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{teachers.map((teacher, i) => (
              <li key={teacher.id}>
                <div className={`arch relative aspect-[4/5] ${["bg-sky-100", "bg-leaf-100", "bg-sun-100", "bg-clay-100"][i % 4]}`}>
                  {teacher.photoUrl ? <Image src={teacher.photoUrl} alt={`Foto ${teacher.name}`} fill unoptimized sizes="(max-width:640px) 50vw, 220px" className="object-cover" /> : <span className="grid size-full place-items-center font-heading text-4xl font-black text-ink/30">{teacher.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>}
                </div>
                <p className="mt-3 font-bold leading-snug">{teacher.name}</p>
                {teacher.position && <p className="text-sm text-ink-soft">{teacher.position}</p>}
              </li>
            ))}</ul>
          ) : <div className="mt-4"><Pending>Data guru sedang dilengkapi.</Pending></div>}
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <section className="panel p-6" aria-labelledby="identitas">
          <h2 id="identitas" className="font-heading text-lg font-extrabold">Identitas sekolah</h2>
          <dl className="mt-4 space-y-3 text-[.95rem]">
            <div><dt className="text-sm text-ink-soft">Nama</dt><dd className="font-bold">SDIT Al-Ikhlas Serpong</dd></div>
            {identity.map(([key, value]) => <div key={key}><dt className="text-sm text-ink-soft">{key}</dt><dd className="font-bold">{String(value)}</dd></div>)}
            <div><dt className="text-sm text-ink-soft">Akreditasi</dt><dd className="font-bold">{profile?.accreditation || <span className="font-normal text-ink-faint">Sedang dilengkapi</span>}</dd></div>
          </dl>
        </section>
        <section className="panel p-6" aria-labelledby="fasilitas">
          <h2 id="fasilitas" className="font-heading text-lg font-extrabold">Fasilitas</h2>
          {profile?.facilities.length ? <ul className="mt-4 space-y-2.5">{profile.facilities.map((item, i) => <li key={i} className="flex gap-2.5"><Star className="mt-1.5 size-3.5 shrink-0" color={toneColors[i % 4]} />{item}</li>)}</ul> : <div className="mt-3"><Pending>Daftar fasilitas sedang dilengkapi.</Pending></div>}
        </section>
      </aside>
    </div>
  </>;
}
