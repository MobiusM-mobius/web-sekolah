import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { Mosaic, SectionHeading, Shape, Star, type ShapeKind, type Tile, type Tone } from "@/components/brand";
import { InkStatement } from "@/components/ink-statement";
import { dateLong, getActivePeriod, getSchoolProfile, whatsappHref } from "@/lib/school";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const cycle: { tone: Tone; ink: Tone; shape: ShapeKind }[] = [
  { tone: "sky", ink: "white", shape: "arch" },
  { tone: "sun", ink: "night", shape: "star" },
  { tone: "leaf", ink: "white", shape: "crescent" },
  { tone: "clay", ink: "white", shape: "quarter" },
  { tone: "night", ink: "sun", shape: "dots" },
];
const v = (i: number) => ({ "--i": i }) as CSSProperties;

export default async function HomePage() {
  const now = new Date();
  const [profile, period, posts, announcements, achievements, galleries] = await Promise.all([
    getSchoolProfile(),
    getActivePeriod(),
    db.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 4, select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, publishedAt: true, category: { select: { name: true } } } }).catch(() => []),
    db.announcement.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: now }, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }, orderBy: { publishedAt: "desc" }, take: 3, select: { id: true, title: true, body: true } }).catch(() => []),
    db.achievement.findMany({ where: { visible: true }, orderBy: { achievedAt: "desc" }, take: 4 }).catch(() => []),
    db.gallery.findMany({ where: { visible: true }, orderBy: { createdAt: "desc" }, take: 4, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } }).catch(() => []),
  ]);

  const isOpen = !!period && period.opensAt <= now && period.closesAt >= now;
  const wa = whatsappHref(profile?.whatsapp, "Assalamu'alaikum, saya ingin bertanya tentang SDIT Al-Ikhlas Serpong.");
  const programs = [...(profile?.learningPrograms ?? []), ...(profile?.islamicPrograms ?? [])].slice(0, 6);
  const strengths = profile?.strengths ?? [];
  const [featured, ...otherPosts] = posts;
  const jsonLd = { "@context": "https://schema.org", "@type": "ElementarySchool", name: "SDIT Al-Ikhlas Serpong", url: appUrl, ...(profile?.address ? { address: profile.address } : {}), ...(profile?.phone ? { telephone: profile.phone } : {}) };

  const heroPhoto = profile?.heroImageUrl;
  const heroTiles: Tile[] = [
    { tone: "sun", shape: "star", shapeTone: "night" },
    {
      tone: "sky", span: "col-span-2 row-span-2", round: "rounded-[30%_30%_14%_14%]",
      content: heroPhoto
        ? <Image src={heroPhoto} alt="Suasana SDIT Al-Ikhlas Serpong" fill priority unoptimized sizes="(max-width:1024px) 60vw, 380px" className="object-cover" />
        : <div className="lattice absolute inset-0"><div className="absolute inset-x-[16%] bottom-0 top-[18%]"><Shape kind="arch" tone="night" style={{ opacity: .22 }} /></div><div className="absolute inset-[30%]"><Shape kind="star" tone="sun" /></div><div className="absolute right-[12%] top-[12%] size-[20%]"><Shape kind="crescent" tone="white" /></div></div>,
    },
    { tone: "leaf", shape: "half", shapeTone: "white" },
    { tone: "clay", shape: "quarter", shapeTone: "white", rotate: 90 },
    { tone: "sun", shape: "crescent", shapeTone: "night" },
    { tone: "night", shape: "rainbow" },
  ];

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

    {/* Hero */}
    <section className="relative overflow-hidden bg-sky-50 lattice-ink">
      <div className="wrap grid items-center gap-12 pb-16 pt-32 sm:pt-36 lg:min-h-[min(860px,100svh)] lg:grid-cols-[1.15fr_.85fr] lg:gap-14 lg:pb-20">
        <div>
          <p className="kicker rise-soft" style={v(0)}>SDIT Al-Ikhlas Serpong</p>
          <h1 className="display display-xl mt-5 text-night">
            {profile?.heroHeadline
              ? <span className="rise-mask"><span className="rise-line">{profile.heroHeadline}</span></span>
              : <>
                <span className="rise-mask"><span className="rise-line" style={v(0)}>Sekolah dasar</span></span>
                <span className="rise-mask"><span className="rise-line" style={v(1)}><span className="pill-word">Islam terpadu</span></span></span>
                <span className="rise-mask"><span className="rise-line" style={v(2)}>di Serpong.</span></span>
              </>}
          </h1>
          <p className="rise-soft mt-7 max-w-xl text-[1.15rem] leading-8 text-ink-soft" style={v(1)}>{profile?.heroDescription || "Profil sekolah, kabar kegiatan, dan pendaftaran siswa baru secara online, semuanya di satu tempat."}</p>
          <div className="rise-soft mt-9 flex flex-wrap gap-3" style={v(2)}>
            <Link href="/ppdb" className="btn btn-primary !min-h-[54px] !px-7 !text-[1.02rem]">{isOpen ? "Daftarkan anak sekarang" : "Lihat info PPDB"}</Link>
            <Link href="/profil" className="btn btn-secondary !min-h-[54px] !px-7 !text-[1.02rem]">Kenali sekolah</Link>
          </div>
        </div>
        <Mosaic tiles={heroTiles} cols={3} animate className="mx-auto w-full max-w-[520px]" />
      </div>
    </section>

    {/* Visit and enrolment facts */}
    <section className="relative z-10 -mt-8">
      <div className="wrap">
        <dl className="grid overflow-hidden rounded-[28px] bg-night text-white shadow-[0_30px_60px_-30px_rgb(19_48_74/.6)] md:grid-cols-3">
          <div className="flex gap-4 border-b border-white/10 p-6 md:border-b-0 md:border-r">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun-400 text-night"><CalendarDays size={22} /></span>
            <div><dt className="text-sm font-semibold text-white/60">Penerimaan siswa baru</dt>
              <dd className="mt-1 font-heading text-lg font-extrabold">{period ? (isOpen ? `Dibuka sampai ${dateLong(period.closesAt)}` : period.opensAt > now ? `Dibuka ${dateLong(period.opensAt)}` : "Periode sudah ditutup") : "Jadwal segera diumumkan"}</dd></div>
          </div>
          <div className="flex gap-4 border-b border-white/10 p-6 md:border-b-0 md:border-r">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf-500"><MessageCircle size={22} /></span>
            <div><dt className="text-sm font-semibold text-white/60">Tanya langsung</dt>
              <dd className="mt-1 font-heading text-lg font-extrabold">{wa ? <a href={wa} target="_blank" rel="noreferrer" className="underline decoration-white/30 decoration-2 underline-offset-4 hover:decoration-sun-400">Chat WhatsApp sekolah</a> : <Link href="/kontak" className="underline decoration-white/30 decoration-2 underline-offset-4">Lihat kontak sekolah</Link>}</dd></div>
          </div>
          <div className="flex gap-4 p-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-clay-400"><MapPin size={22} /></span>
            <div className="min-w-0"><dt className="text-sm font-semibold text-white/60">Lokasi</dt>
              <dd className="mt-1 line-clamp-2 font-heading text-lg font-extrabold">{profile?.address || "Serpong, Tangerang Selatan"}</dd></div>
          </div>
        </dl>
      </div>
    </section>

    {/* Statement moment: the school's vision inks word by word */}
    {profile?.vision && (
      <section className="py-24 sm:py-32" style={{ "--wh-bg": "var(--color-paper)" } as CSSProperties}>
        <div className="wrap grid gap-10 lg:grid-cols-[220px_1fr]">
          <div className="flex items-start gap-3 lg:flex-col">
            <div className="size-16 sm:size-20"><Mosaic cols={1} tiles={[{ tone: "sun", shape: "star", shapeTone: "night" }]} /></div>
            <p className="kicker pt-3 lg:pt-0">Visi sekolah</p>
          </div>
          <div>
            <InkStatement text={profile.vision} className="display display-lg !leading-[1.08]" />
            <Link href="/profil" className="link mt-10 inline-block text-[1.05rem]">Baca visi, misi, dan sejarah sekolah</Link>
          </div>
        </div>
      </section>
    )}

    {/* Principal */}
    {profile?.principalMessage && (
      <section className={`${profile?.vision ? "" : "pt-24"} pb-24 sm:pb-28`}>
        <div className="wrap">
          <div className="grid items-center gap-10 overflow-hidden rounded-[36px] bg-leaf-500 p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16 lg:p-14">
            <div className="relative mx-auto w-full max-w-[340px]">
              <div className="absolute -left-3 -top-3 size-20 sm:-left-5 sm:-top-5 sm:size-24"><Shape kind="star" tone="sun" /></div>
              <div className="arch relative aspect-[4/5] border-[8px] border-white/25 bg-leaf-700">
                {profile.principalPhotoUrl
                  ? <Image src={profile.principalPhotoUrl} alt={profile.principalName ? `Foto ${profile.principalName}` : "Foto kepala sekolah"} fill unoptimized sizes="340px" className="object-cover" />
                  : <div className="lattice grid size-full place-items-center"><div className="size-1/2"><Shape kind="arch" tone="sun" /></div></div>}
              </div>
            </div>
            <figure>
              <p className="font-heading text-lg font-extrabold text-sun-300">Sambutan kepala sekolah</p>
              <blockquote className="prose-school mt-4 font-heading text-[1.4rem] font-bold leading-snug sm:text-[1.75rem]">{profile.principalMessage}</blockquote>
              {profile.principalName && <figcaption className="mt-8 flex items-center gap-4"><span className="h-px w-10 bg-white/50" /><span><span className="block text-lg font-bold">{profile.principalName}</span><span className="text-white/75">Kepala SDIT Al-Ikhlas Serpong</span></span></figcaption>}
            </figure>
          </div>
        </div>
      </section>
    )}

    {/* Programmes as a bento of colour blocks */}
    {(programs.length > 0 || strengths.length > 0) && (
      <section className="pb-24 sm:pb-28">
        <div className="wrap">
          <SectionHeading kicker="Kegiatan belajar" title={<>Program yang mengisi <span className="pill-word" style={{ "--pw": "var(--color-leaf-300)" } as CSSProperties}>hari-hari</span> anak</>} action={<Link href="/akademik" className="btn btn-secondary">Lihat kurikulum</Link>} />
          {programs.length > 0 && (
            <ul className="mt-12 grid auto-rows-[minmax(170px,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {programs.map((program, i) => {
                const c = cycle[i % cycle.length];
                const wide = i === 0 || (i === 3 && programs.length > 4);
                const textColor = c.tone === "sun" ? "text-night" : "text-white";
                return (
                  <li key={`${program}-${i}`} className={`relative flex flex-col justify-between overflow-hidden rounded-[28px] p-6 ${{ sky: "bg-sky-500", sun: "bg-sun-400", leaf: "bg-leaf-500", clay: "bg-clay-400", night: "bg-night", white: "bg-white", paper: "bg-paper" }[c.tone]} ${textColor} ${wide ? "sm:col-span-2" : ""}`}>
                    <div className={`absolute -right-5 -top-5 ${wide ? "size-36" : "size-24"} opacity-90`}><Shape kind={c.shape} tone={c.ink} /></div>
                    <span className="relative font-heading text-sm font-extrabold opacity-75">Program</span>
                    <p className={`relative mt-10 max-w-[18ch] font-heading font-black leading-[1.05] tracking-tight ${wide ? "text-[2rem] sm:text-[2.4rem]" : "text-[1.55rem]"}`}>{program}</p>
                  </li>
                );
              })}
            </ul>
          )}
          {strengths.length > 0 && (
            <div className="mt-6 grid gap-6 rounded-[28px] border border-line bg-white p-6 sm:p-8 lg:grid-cols-[260px_1fr]">
              <h3 className="font-heading text-2xl font-black">Mengapa orang tua memilih kami</h3>
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{strengths.map((item, i) => <li key={`${item}-${i}`} className="flex gap-3 text-[1.02rem]"><Star className="mt-1 size-5 shrink-0" tone={(["sky", "leaf", "sun", "clay"] as Tone[])[i % 4]} /><span>{item}</span></li>)}</ul>
            </div>
          )}
        </div>
      </section>
    )}

    {/* News */}
    <section className="bg-white py-24 sm:py-28">
      <div className="wrap">
        <SectionHeading kicker="Kabar sekolah" title={<>Cerita terbaru dari <span className="pill-word" style={{ "--pw": "var(--color-clay-300)" } as CSSProperties}>kelas</span></>} action={<Link href="/berita" className="btn btn-secondary">Semua berita</Link>} />
        <div className={`mt-12 grid gap-6 ${announcements.length ? "lg:grid-cols-[1.55fr_1fr]" : ""}`}>
          {featured ? (
            <div className="grid gap-6">
              <Link href={`/berita/${featured.slug}`} className="card-link group grid overflow-hidden border border-line bg-paper hover:border-sky-200 md:grid-cols-[1.1fr_1fr]">
                <div className="relative aspect-[4/3] overflow-hidden bg-sky-500 md:aspect-auto md:min-h-[300px]">
                  {featured.coverImageUrl ? <Image src={featured.coverImageUrl} alt="" fill unoptimized sizes="(max-width:768px) 100vw, 420px" className="zoom object-cover" /> : <div className="zoom lattice absolute inset-0 grid place-items-center"><div className="size-1/3"><Shape kind="arch" tone="sun" /></div></div>}
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-9">
                  <p className="text-sm font-bold text-sky-700">{featured.category?.name ?? "Berita"}{featured.publishedAt && <span className="font-medium text-ink-faint">, {dateLong(featured.publishedAt)}</span>}</p>
                  <h3 className="mt-3 font-heading text-[1.75rem] font-black leading-tight tracking-tight group-hover:text-sky-700">{featured.title}</h3>
                  {featured.excerpt && <p className="mt-3 line-clamp-3 text-ink-soft">{featured.excerpt}</p>}
                </div>
              </Link>
              {otherPosts.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-3">{otherPosts.map((post, i) => (
                  <li key={post.id}><Link href={`/berita/${post.slug}`} className="card-link group flex h-full flex-col gap-3 border border-line bg-paper p-5 hover:border-sky-200">
                    <span className={`size-3 rounded-full ${["bg-leaf-500", "bg-sun-400", "bg-clay-400"][i % 3]}`} aria-hidden="true" />
                    <span className="font-heading text-lg font-extrabold leading-snug group-hover:text-sky-700">{post.title}</span>
                    {post.publishedAt && <time className="mt-auto text-sm text-ink-faint">{dateLong(post.publishedAt)}</time>}
                  </Link></li>
                ))}</ul>
              )}
            </div>
          ) : (
            <div className="grid place-items-center rounded-[28px] border border-dashed border-line bg-paper p-12 text-center">
              <div className="mx-auto size-16"><Shape kind="arch" tone="sky" /></div>
              <h3 className="mt-5 font-heading text-2xl font-black">Belum ada berita</h3>
              <p className="mt-2 max-w-sm text-ink-soft">Kabar kegiatan sekolah akan tampil di sini setelah diterbitkan.</p>
            </div>
          )}

          {announcements.length > 0 && (
            <aside className="relative overflow-hidden rounded-[28px] bg-sun-400 p-7 text-night sm:p-8" aria-labelledby="papan-pengumuman">
              <div className="absolute -right-10 -top-10 size-40 opacity-25"><Shape kind="star" tone="white" /></div>
              <h3 id="papan-pengumuman" className="relative font-heading text-2xl font-black">Papan pengumuman</h3>
              <ul className="relative mt-6 space-y-3">{announcements.map((item) => (
                <li key={item.id} className="rounded-2xl bg-white/85 p-5">
                  <p className="font-heading text-lg font-extrabold leading-snug">{item.title}</p>
                  <p className="mt-1.5 line-clamp-3 text-[.95rem] text-ink-soft">{item.body}</p>
                </li>
              ))}</ul>
            </aside>
          )}
        </div>
      </div>
    </section>

    {/* Gallery and achievements */}
    {(galleries.length > 0 || achievements.length > 0) && (
      <section className="py-24 sm:py-28">
        <div className="wrap grid gap-16 lg:grid-cols-[1.25fr_1fr]">
          {galleries.length > 0 && <div>
            <SectionHeading kicker="Momen sekolah" title="Galeri kegiatan" action={<Link href="/galeri" className="link">Buka galeri</Link>} />
            <div className="mt-10 grid grid-cols-2 gap-3">
              {galleries.map((album, i) => { const cover = album.coverUrl || album.images[0]?.imageUrl; const c = cycle[i % cycle.length]; return (
                <Link key={album.id} href="/galeri" className={`card-link group relative overflow-hidden ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"} ${{ sky: "bg-sky-500", sun: "bg-sun-400", leaf: "bg-leaf-500", clay: "bg-clay-400", night: "bg-night", white: "bg-white", paper: "bg-paper" }[c.tone]}`}>
                  {cover ? <Image src={cover} alt={album.title} fill unoptimized sizes="(max-width:768px) 50vw, 360px" className="zoom object-cover" /> : <div className="zoom absolute inset-[22%]"><Shape kind={c.shape} tone={c.ink} /></div>}
                  <span className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/95 px-3.5 py-2 text-sm font-bold">{album.title}</span>
                </Link>
              ); })}
            </div>
          </div>}
          {achievements.length > 0 && <div>
            <SectionHeading kicker="Apresiasi" title="Prestasi siswa" action={<Link href="/prestasi" className="link">Semua prestasi</Link>} />
            <ul className="mt-10 space-y-3">{achievements.map((item, i) => (
              <li key={item.id} className="flex items-center gap-4 rounded-[24px] border border-line bg-white p-3 pr-5">
                <div className={`arch relative size-[72px] shrink-0 ${["bg-sun-400", "bg-sky-500", "bg-clay-400", "bg-leaf-500"][i % 4]}`}>{item.imageUrl ? <Image src={item.imageUrl} alt="" fill unoptimized sizes="72px" className="object-cover" /> : <div className="absolute inset-[22%]"><Shape kind="star" tone="white" /></div>}</div>
                <div className="min-w-0"><p className="font-heading text-lg font-extrabold leading-snug">{item.title}</p><p className="text-sm text-ink-soft">{[item.category, item.achievedAt?.getFullYear()].filter(Boolean).join(", ")}</p></div>
              </li>
            ))}</ul>
          </div>}
        </div>
      </section>
    )}

    {/* Enrolment call to action */}
    <section className="pb-24 sm:pb-28">
      <div className="wrap">
        <div className="lattice relative grid items-center gap-10 overflow-hidden rounded-[40px] bg-sky-500 px-7 py-12 text-white sm:px-12 sm:py-16 lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative">
            <p className="font-heading text-lg font-extrabold text-sun-300">{period ? `PPDB tahun ajaran ${period.academicYear}` : "Penerimaan peserta didik baru"}</p>
            <h2 className="display display-lg mt-3">{isOpen ? "Pendaftaran sudah dibuka." : "Siapkan pendaftaran putra-putri Anda."}</h2>
            <p className="mt-5 max-w-xl text-[1.1rem] text-white/80">{isOpen && period ? `Isi formulir online sampai ${dateLong(period.closesAt)}.${period.requirements.length ? ` Siapkan ${period.requirements.map((r) => r.label.toLowerCase()).join(", ")}.` : ""}` : "Lihat persyaratan dan alur pendaftaran, lalu daftar online ketika periode dibuka."}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ppdb" className="btn btn-sun !min-h-[54px] !px-7">{isOpen ? "Isi formulir pendaftaran" : "Lihat info PPDB"}</Link>
              <Link href="/ppdb/cek-status" className="btn btn-ghost-light !min-h-[54px] !px-7">Cek status pendaftaran</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[340px]"><Shape kind="rainbow" className="w-full" /><div className="absolute bottom-0 left-1/2 size-[18%] -translate-x-1/2"><Shape kind="star" tone="white" /></div></div>
        </div>
      </div>
    </section>
  </>;
}
