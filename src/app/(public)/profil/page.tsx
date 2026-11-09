import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSchoolProfile } from "@/lib/school";
import { Art, PageIntro, Pending, Shape, Star, toneCycle, type Tone } from "@/components/brand";

export const metadata: Metadata = { title: "Profil Sekolah", description: "Sejarah, identitas, visi, misi, guru, dan fasilitas SDIT Al-Ikhlas Serpong.", alternates: { canonical: "/profil" } };

const starTones: Tone[] = ["sky", "leaf", "sun", "clay"];

export default async function ProfilePage() {
  const [profile, teachers] = await Promise.all([
    getSchoolProfile(),
    db.teacher.findMany({ where: { visible: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }).catch(() => []),
  ]);
  const identity = profile?.identity && typeof profile.identity === "object" && !Array.isArray(profile.identity) ? Object.entries(profile.identity as Record<string, unknown>).filter(([, v]) => v !== "" && v != null) : [];
  const organization = profile?.organization && typeof profile.organization === "object" && !Array.isArray(profile.organization) ? Object.entries(profile.organization as Record<string, unknown>) : [];

  return <>
    <PageIntro kicker="Tentang kami" title={<>Mengenal <span className="pill-word">Al-Ikhlas</span></>} intro="Sejarah, arah, dan orang-orang yang mendampingi anak-anak belajar setiap hari." />

    {/* History + identity */}
    <section className="py-20 sm:py-24">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
        <div>
          <h2 className="display display-md">Sejarah sekolah</h2>
          <div className="mt-6 max-w-3xl">{profile?.history ? <p className="prose-school text-[1.12rem]">{profile.history}</p> : <Pending>Sejarah sekolah sedang dilengkapi.</Pending>}</div>
        </div>
        <aside className="relative overflow-hidden rounded-[32px] bg-night p-7 text-white sm:p-8" aria-labelledby="identitas">
          <div className="absolute -right-8 -top-8 size-36 opacity-40"><Shape kind="star" tone="sky" /></div>
          <h2 id="identitas" className="relative font-heading text-xl font-black">Identitas sekolah</h2>
          <dl className="relative mt-6 divide-y divide-white/10">
            <div className="pb-4"><dt className="text-sm text-white/55">Nama</dt><dd className="mt-0.5 font-bold">SDIT Al-Ikhlas Serpong</dd></div>
            {identity.map(([key, value]) => <div key={key} className="py-4"><dt className="text-sm text-white/55">{key}</dt><dd className="mt-0.5 font-bold">{String(value)}</dd></div>)}
            <div className="pt-4"><dt className="text-sm text-white/55">Akreditasi</dt><dd className="mt-0.5 font-bold">{profile?.accreditation || <span className="font-normal text-white/50">Sedang dilengkapi</span>}</dd></div>
          </dl>
        </aside>
      </div>
    </section>

    {/* Vision and mission as two colour blocks */}
    <section className="pb-20 sm:pb-24">
      <div className="wrap grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[36px] bg-sky-500 p-8 text-white sm:p-10">
          <div className="absolute -bottom-10 -right-6 size-56 opacity-25"><Shape kind="arch" tone="white" /></div>
          <h2 className="relative font-heading text-lg font-extrabold text-sun-300">Visi</h2>
          {profile?.vision ? <p className="relative mt-6 font-heading text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.3rem]">{profile.vision}</p> : <div className="relative mt-6"><Pending>Visi sedang dilengkapi.</Pending></div>}
        </div>
        <div className="rounded-[36px] bg-leaf-50 p-8 sm:p-10">
          <h2 className="font-heading text-lg font-extrabold text-leaf-700">Misi</h2>
          {profile?.mission.length ? (
            <ol className="mt-6 space-y-5">{profile.mission.map((item, i) => (
              <li key={i} className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-leaf-500 font-heading text-lg font-black text-white">{i + 1}</span><span className="pt-1.5 text-[1.05rem]">{item}</span></li>
            ))}</ol>
          ) : <div className="mt-6"><Pending>Misi sedang dilengkapi.</Pending></div>}
          {!!profile?.goals.length && <>
            <h3 className="mt-10 font-heading text-lg font-extrabold text-leaf-700">Tujuan sekolah</h3>
            <ul className="mt-4 space-y-3">{profile.goals.map((goal, i) => <li key={i} className="flex gap-3"><Star className="mt-1 size-5 shrink-0" tone={starTones[i % 4]} />{goal}</li>)}</ul>
          </>}
        </div>
      </div>
    </section>

    {/* Principal */}
    <section className="bg-white py-20 sm:py-24">
      <div className="wrap grid items-center gap-10 md:grid-cols-[minmax(0,300px)_1fr] md:gap-16">
        <div className="relative mx-auto w-full max-w-[300px]">
          <div className="absolute -right-4 -top-4 size-16"><Shape kind="crescent" tone="sun" /></div>
          <div className="arch relative aspect-[4/5]">
            {profile?.principalPhotoUrl ? <Image src={profile.principalPhotoUrl} alt={profile.principalName ? `Foto ${profile.principalName}` : "Foto kepala sekolah"} fill unoptimized sizes="300px" className="object-cover" /> : <Art tone="sun" shape="star" ink="night" />}
          </div>
        </div>
        <div>
          <p className="kicker">Kepala sekolah</p>
          <h2 className="display display-md mt-3">{profile?.principalName || "Profil kepala sekolah"}</h2>
          <div className="mt-5 max-w-2xl">{profile?.principalMessage ? <p className="prose-school text-ink-soft">{profile.principalMessage}</p> : <Pending>Profil dan sambutan kepala sekolah sedang dilengkapi.</Pending>}</div>
          {organization.length > 0 && (
            <dl className="mt-10 grid gap-3 sm:grid-cols-2">{organization.map(([role, name], i) => <div key={role} className={`rounded-2xl p-4 ${["bg-sky-50", "bg-leaf-50", "bg-sun-50", "bg-clay-50"][i % 4]}`}><dt className="text-sm text-ink-soft">{role}</dt><dd className="font-bold">{String(name)}</dd></div>)}</dl>
          )}
        </div>
      </div>
    </section>

    {/* Teachers */}
    <section className="py-20 sm:py-24">
      <div className="wrap">
        <h2 className="display display-md">Guru dan tenaga pendidik</h2>
        {teachers.length ? (
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">{teachers.map((teacher, i) => {
            const c = toneCycle[i % toneCycle.length];
            return (
              <li key={teacher.id}>
                <div className="arch relative aspect-[4/5]">
                  {teacher.photoUrl ? <Image src={teacher.photoUrl} alt={`Foto ${teacher.name}`} fill unoptimized sizes="(max-width:640px) 50vw, 230px" className="object-cover" /> : <Art tone={c.tone} shape={c.shape} ink={c.ink} inset="30%" />}
                </div>
                <p className="mt-4 font-heading text-lg font-extrabold leading-snug">{teacher.name}</p>
                {teacher.position && <p className="text-[.95rem] text-ink-soft">{teacher.position}</p>}
              </li>
            );
          })}</ul>
        ) : <div className="mt-6 max-w-xl"><Pending>Data guru sedang dilengkapi.</Pending></div>}
      </div>
    </section>

    {/* Facilities */}
    <section className="pb-24">
      <div className="wrap rounded-[36px] bg-sun-50 p-8 sm:p-10" style={{ "--pw": "var(--color-sun-400)" } as CSSProperties}>
        <h2 className="display display-md">Fasilitas</h2>
        {profile?.facilities.length ? (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profile.facilities.map((item, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold"><span className="size-9 shrink-0"><Shape kind={toneCycle[i % 4].shape} tone={toneCycle[i % 4].tone} /></span>{item}</li>
          ))}</ul>
        ) : <div className="mt-6 max-w-xl"><Pending>Daftar fasilitas sedang dilengkapi.</Pending></div>}
      </div>
    </section>
  </>;
}
