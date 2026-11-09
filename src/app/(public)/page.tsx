import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, MessageCircle, Quote } from "lucide-react";
import { db } from "@/lib/db";
import { BrandMark, SectionHeading, Star } from "@/components/brand";
import { dateLong, getActivePeriod, getSchoolProfile, whatsappHref } from "@/lib/school";

const accents = ["border-sky-500", "border-leaf-500", "border-sun-400", "border-clay-400"];
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export default async function HomePage() {
  const now = new Date();
  const [profile, period, posts, announcements, achievements, galleries] = await Promise.all([
    getSchoolProfile(),
    getActivePeriod(),
    db.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 4, select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, publishedAt: true, category: { select: { name: true } } } }).catch(() => []),
    db.announcement.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: now }, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }, orderBy: { publishedAt: "desc" }, take: 4, select: { id: true, title: true, body: true, publishedAt: true } }).catch(() => []),
    db.achievement.findMany({ where: { visible: true }, orderBy: { achievedAt: "desc" }, take: 4 }).catch(() => []),
    db.gallery.findMany({ where: { visible: true }, orderBy: { createdAt: "desc" }, take: 5, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } }).catch(() => []),
  ]);

  const isOpen = !!period && period.opensAt <= now && period.closesAt >= now;
  const wa = whatsappHref(profile?.whatsapp, "Assalamu'alaikum, saya ingin bertanya tentang SDIT Al-Ikhlas Serpong.");
  const programs = [...(profile?.learningPrograms ?? []), ...(profile?.islamicPrograms ?? [])];
  const strengths = profile?.strengths ?? [];
  const [featured, ...otherPosts] = posts;
  const jsonLd = { "@context": "https://schema.org", "@type": "ElementarySchool", name: "SDIT Al-Ikhlas Serpong", url: appUrl, ...(profile?.address ? { address: profile.address } : {}), ...(profile?.phone ? { telephone: profile.phone } : {}), ...(profile?.email ? { email: profile.email } : {}) };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="wrap grid items-center gap-12 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_.9fr] lg:pb-20">
        <div>
          <p className="kicker">Sekolah Dasar Islam Terpadu di Serpong</p>
          <h1 className="mt-4 font-heading text-[2.6rem] font-black leading-[1.08] sm:text-[3.6rem]">
            {profile?.heroHeadline || <>Selamat datang di <span className="mark whitespace-nowrap">SDIT Al-Ikhlas</span> Serpong</>}
          </h1>
          <p className="mt-5 max-w-xl text-[1.1rem] leading-8 text-ink-soft">{profile?.heroDescription || "Kenali sekolah kami, ikuti kabar terbaru, dan temukan informasi penerimaan peserta didik baru di sini."}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ppdb" className="btn btn-primary">{isOpen ? "Daftar PPDB sekarang" : "Informasi PPDB"}</Link>
            <Link href="/profil" className="btn btn-secondary">Kenali sekolah kami</Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[440px]">
          <div className="absolute -right-6 -top-6 size-40 rounded-full bg-sun-400 sm:-right-10" aria-hidden="true" />
          <div className="absolute -bottom-5 -left-5 size-24 rounded-[28px] bg-leaf-500" aria-hidden="true" />
          <div className="arch relative aspect-[4/5] border-[10px] border-white bg-sky-500 shadow-[0_24px_60px_-20px_rgba(19,103,152,.45)]">
            {profile?.heroImageUrl
              ? <Image src={profile.heroImageUrl} alt="Suasana SDIT Al-Ikhlas Serpong" fill priority unoptimized sizes="(max-width: 1024px) 90vw, 440px" className="object-cover" />
              : <div className="tile grid size-full place-items-center"><BrandMark className="size-36 drop-shadow-[0_8px_0_rgba(15,58,86,.25)]" /></div>}
          </div>
        </div>
      </div>

      {/* Practical info instead of invented statistics */}
      <div className="wrap pb-14">
        <dl className="grid overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-3 md:divide-x md:divide-line">
          <div className="flex gap-4 border-b border-line p-5 md:border-b-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sun-50 text-sun-700"><CalendarDays size={21} /></span>
            <div><dt className="text-sm font-semibold text-ink-soft">Penerimaan siswa baru</dt>
              <dd className="mt-0.5 font-bold">{period ? (isOpen ? `Dibuka hingga ${dateLong(period.closesAt)}` : period.opensAt > now ? `Dibuka ${dateLong(period.opensAt)}` : "Periode telah ditutup") : "Jadwal segera diumumkan"}</dd></div>
          </div>
          <div className="flex gap-4 border-b border-line p-5 md:border-b-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-700"><MessageCircle size={21} /></span>
            <div><dt className="text-sm font-semibold text-ink-soft">Tanya langsung</dt>
              <dd className="mt-0.5 font-bold">{wa ? <a href={wa} target="_blank" rel="noreferrer" className="link">Chat WhatsApp sekolah</a> : <Link href="/kontak" className="link">Lihat kontak sekolah</Link>}</dd></div>
          </div>
          <div className="flex gap-4 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-clay-50 text-clay-700"><MapPin size={21} /></span>
            <div><dt className="text-sm font-semibold text-ink-soft">Lokasi</dt>
              <dd className="mt-0.5 font-bold">{profile?.address ? <Link href="/kontak" className="line-clamp-2 hover:underline">{profile.address}</Link> : "Serpong, Tangerang Selatan"}</dd></div>
          </div>
        </dl>
      </div>
    </section>

    {/* Principal's welcome */}
    {profile?.principalMessage && (
      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="wrap grid items-center gap-10 md:grid-cols-[260px_1fr]">
          <div className="arch relative mx-auto aspect-[4/5] w-52 bg-leaf-500 md:w-full">
            {profile.principalPhotoUrl ? <Image src={profile.principalPhotoUrl} alt={profile.principalName ? `Foto ${profile.principalName}` : "Foto kepala sekolah"} fill unoptimized sizes="260px" className="object-cover" /> : <div className="tile tile-green size-full" />}
          </div>
          <figure>
            <Quote className="text-sun-400" size={44} strokeWidth={2.5} aria-hidden="true" />
            <p className="kicker mt-2">Sambutan kepala sekolah</p>
            <blockquote className="prose-school mt-3 max-w-3xl font-heading text-xl font-semibold leading-relaxed sm:text-2xl">{profile.principalMessage}</blockquote>
            {profile.principalName && <figcaption className="mt-6"><span className="block text-lg font-bold">{profile.principalName}</span><span className="text-ink-soft">Kepala SDIT Al-Ikhlas Serpong</span></figcaption>}
          </figure>
        </div>
      </section>
    )}

    {/* Vision & mission */}
    {(profile?.vision || !!profile?.mission.length) && (
      <section className="wrap grid gap-10 py-16 sm:py-20 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <SectionHeading kicker="Arah kami" title={<>Visi <span className="mark mark-blue">sekolah</span></>} />
          {profile?.vision && <p className="mt-6 font-heading text-2xl font-bold leading-snug text-sky-900">{profile.vision}</p>}
          <Link href="/profil" className="link mt-6 inline-block">Baca profil lengkap</Link>
        </div>
        {!!profile?.mission.length && (
          <div className="rounded-3xl bg-sky-50 p-7 sm:p-9">
            <h3 className="font-heading text-xl font-extrabold">Misi</h3>
            <ol className="mt-5 space-y-4">
              {profile.mission.map((item, index) => (
                <li key={index} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-white font-heading font-black text-sky-700">{index + 1}</span><span className="pt-1">{item}</span></li>
              ))}
            </ol>
          </div>
        )}
      </section>
    )}

    {/* Programmes & strengths */}
    {(programs.length > 0 || strengths.length > 0) && (
      <section className="bg-white py-16 sm:py-20">
        <div className="wrap">
          <SectionHeading kicker="Kegiatan belajar" title={<>Program dan <span className="mark mark-green">keunggulan</span></>} action={<Link href="/akademik" className="link">Lihat halaman akademik</Link>} />
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {programs.length > 0 && <div><h3 className="font-heading text-lg font-extrabold">Program unggulan</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">{programs.map((program, index) => <li key={`${program}-${index}`} className={`border-l-4 ${accents[index % 4]} rounded-r-xl bg-paper py-3 pl-4 pr-3 font-semibold`}>{program}</li>)}</ul></div>}
            {strengths.length > 0 && <div><h3 className="font-heading text-lg font-extrabold">Mengapa memilih kami</h3>
              <ul className="mt-4 space-y-3">{strengths.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3"><Star className="mt-1.5 size-4 shrink-0" color={["#2498dc", "#34b879", "#ffc94a", "#ff8a55"][index % 4]} /><span>{item}</span></li>)}</ul></div>}
          </div>
        </div>
      </section>
    )}

    {/* News & announcements */}
    <section className="wrap py-16 sm:py-20">
      <SectionHeading kicker="Kabar sekolah" title={<>Berita & <span className="mark mark-orange">pengumuman</span></>} action={<Link href="/berita" className="link">Semua berita</Link>} />
      <div className={`mt-10 grid gap-8 ${announcements.length ? "lg:grid-cols-[1.5fr_1fr]" : ""}`}>
        {featured ? (
          <div className="grid gap-6">
            <Link href={`/berita/${featured.slug}`} className="group grid overflow-hidden rounded-3xl border border-line bg-white md:grid-cols-2">
              <div className="relative aspect-[16/10] bg-sky-100 md:aspect-auto">{featured.coverImageUrl ? <Image src={featured.coverImageUrl} alt="" fill unoptimized sizes="(max-width:768px) 100vw, 400px" className="object-cover" /> : <div className="tile size-full" />}</div>
              <div className="p-6 sm:p-7">
                <p className="text-sm font-semibold text-sky-700">{featured.category?.name ?? "Berita"}{featured.publishedAt ? `, ${dateLong(featured.publishedAt)}` : ""}</p>
                <h3 className="mt-2 font-heading text-2xl font-extrabold leading-snug group-hover:text-sky-700">{featured.title}</h3>
                {featured.excerpt && <p className="mt-3 line-clamp-3 text-ink-soft">{featured.excerpt}</p>}
              </div>
            </Link>
            {otherPosts.length > 0 && <ul className="divide-y divide-line border-y border-line">{otherPosts.map((post) => (
              <li key={post.id}><Link href={`/berita/${post.slug}`} className="flex items-baseline justify-between gap-6 py-4 hover:text-sky-700"><span className="font-bold">{post.title}</span>{post.publishedAt && <time className="shrink-0 text-sm text-ink-faint">{post.publishedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</time>}</Link></li>
            ))}</ul>}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-line bg-white p-8 sm:p-10">
            <h3 className="font-heading text-xl font-extrabold">Belum ada berita</h3>
            <p className="mt-2 max-w-md text-ink-soft">Kabar kegiatan sekolah akan tampil di sini setelah diterbitkan.</p>
          </div>
        )}

        {announcements.length > 0 && (
          <aside className="tile-sun tile rounded-3xl p-3" aria-labelledby="papan-pengumuman">
            <div className="h-full rounded-[18px] bg-white p-6">
              <h3 id="papan-pengumuman" className="font-heading text-xl font-extrabold">Papan pengumuman</h3>
              <ul className="mt-4 space-y-5">{announcements.map((item) => (
                <li key={item.id} className="border-b border-dashed border-line pb-5 last:border-0 last:pb-0">
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-ink-soft">{item.body}</p>
                </li>
              ))}</ul>
            </div>
          </aside>
        )}
      </div>
    </section>

    {/* Gallery & achievements */}
    {(galleries.length > 0 || achievements.length > 0) && (
      <section className="border-t border-line bg-white py-16 sm:py-20">
        <div className="wrap grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          {galleries.length > 0 && <div>
            <SectionHeading kicker="Momen sekolah" title="Galeri kegiatan" action={<Link href="/galeri" className="link">Buka galeri</Link>} />
            <div className="mt-8 grid grid-cols-3 grid-rows-2 gap-3">
              {galleries.map((album, index) => { const cover = album.coverUrl || album.images[0]?.imageUrl; return (
                <Link key={album.id} href="/galeri" className={`group relative overflow-hidden rounded-2xl bg-sky-100 ${index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                  {cover ? <Image src={cover} alt={album.title} fill unoptimized sizes="(max-width:768px) 50vw, 300px" className="object-cover" /> : <div className="tile size-full" />}
                  <span className="absolute inset-x-2 bottom-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-bold sm:text-sm">{album.title}</span>
                </Link>
              ); })}
            </div>
          </div>}
          {achievements.length > 0 && <div>
            <SectionHeading kicker="Apresiasi" title="Prestasi siswa" action={<Link href="/prestasi" className="link">Semua prestasi</Link>} />
            <ul className="mt-8 space-y-4">{achievements.map((item) => (
              <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-line p-3">
                <div className="arch relative size-16 shrink-0 bg-sun-400">{item.imageUrl ? <Image src={item.imageUrl} alt="" fill unoptimized sizes="64px" className="object-cover" /> : <div className="tile tile-sun size-full" />}</div>
                <div><p className="font-bold leading-snug">{item.title}</p><p className="text-sm text-ink-soft">{[item.category, item.achievedAt?.getFullYear()].filter(Boolean).join(", ")}</p></div>
              </li>
            ))}</ul>
          </div>}
        </div>
      </section>
    )}

    {/* PPDB call to action */}
    <section className="wrap pb-20 pt-4">
      <div className="tile tile-green overflow-hidden rounded-[28px] p-3 sm:p-4">
        <div className="grid items-center gap-6 rounded-[20px] bg-white p-7 sm:p-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="kicker !text-leaf-700">{period ? `PPDB tahun ajaran ${period.academicYear}` : "Penerimaan peserta didik baru"}</p>
            <h2 className="mt-2 font-heading text-3xl font-black">{isOpen ? "Pendaftaran sudah dibuka" : "Siapkan pendaftaran putra-putri Anda"}</h2>
            <p className="mt-2 max-w-xl text-ink-soft">{isOpen && period ? `Daftar secara online hingga ${dateLong(period.closesAt)}.${period.requirements.length ? ` Siapkan ${period.requirements.map((r) => r.label.toLowerCase()).join(", ")}.` : ""}` : "Lihat persyaratan dan alur pendaftaran, lalu daftar online saat periode dibuka."}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/ppdb" className="btn btn-green">{isOpen ? "Isi formulir" : "Lihat informasi PPDB"}</Link>
            <Link href="/ppdb/cek-status" className="btn btn-secondary">Cek status</Link>
          </div>
        </div>
      </div>
    </section>
  </>;
}
