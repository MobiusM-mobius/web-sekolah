import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageIntro } from "@/components/brand";
import { GalleryAlbum } from "@/components/gallery-album";

export const metadata: Metadata = { title: "Galeri", description: "Dokumentasi kegiatan SDIT Al-Ikhlas Serpong.", alternates: { canonical: "/galeri" } };
type SearchParams = Promise<{ kategori?: string }>;

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const { kategori } = await searchParams;
  const [galleries, categories] = await Promise.all([
    db.gallery.findMany({ where: { visible: true, ...(kategori ? { category: kategori } : {}) }, orderBy: { createdAt: "desc" }, include: { images: { orderBy: { sortOrder: "asc" } } } }).catch(() => []),
    db.gallery.findMany({ where: { visible: true, category: { not: null } }, distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }).catch(() => []),
  ]);
  const chip = (active: boolean) => `rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line hover:text-ink"}`;

  return <>
    <PageIntro tone="sun" kicker="Momen sekolah" title={<>Galeri <span className="pill-word">kegiatan</span></>} intro="Dokumentasi kegiatan belajar, ibadah, dan acara sekolah." />
    <div className="wrap py-12">
      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-2" aria-label="Kategori galeri">
          <Link href="/galeri" className={chip(!kategori)} aria-current={!kategori ? "page" : undefined}>Semua</Link>
          {categories.map(({ category }) => category && <Link key={category} href={`/galeri?kategori=${encodeURIComponent(category)}`} className={chip(kategori === category)} aria-current={kategori === category ? "page" : undefined}>{category}</Link>)}
        </nav>
      )}
      {galleries.length ? (
        <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{galleries.map((gallery, i) => (
          <li key={gallery.id}><GalleryAlbum tone={i % 3} title={gallery.title} description={gallery.description} category={gallery.category} coverUrl={gallery.coverUrl} images={gallery.images} /></li>
        ))}</ul>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-line bg-white p-10 text-center">
          <h2 className="font-heading text-xl font-extrabold">{kategori ? "Belum ada album di kategori ini" : "Belum ada album"}</h2>
          <p className="mt-2 text-ink-soft">Foto kegiatan akan tampil di sini setelah dipublikasikan sekolah.</p>
          {kategori && <Link href="/galeri" className="btn btn-secondary mt-5">Lihat semua album</Link>}
        </div>
      )}
    </div>
  </>;
}
