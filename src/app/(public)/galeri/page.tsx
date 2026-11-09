import type { Metadata } from "next";
import { GalleryAlbum } from "@/components/gallery-album";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Galeri", description: "Galeri kegiatan SDIT Al-Ikhlas Serpong." };
type SearchParams = Promise<{ kategori?: string }>;

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const { kategori } = await searchParams;
  const [galleries, categories] = await Promise.all([
    db.gallery.findMany({ where: { visible: true, ...(kategori ? { category: kategori } : {}) }, orderBy: { createdAt: "desc" }, include: { images: { orderBy: { sortOrder: "asc" } } } }).catch(() => []),
    db.gallery.findMany({ where: { visible: true, category: { not: null } }, distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }).catch(() => []),
  ]);
  return <div className="container-shell section-space"><span className="eyebrow">Cerita dalam gambar</span><h1 className="mt-3 font-heading text-4xl font-black">Galeri kegiatan</h1><div className="mt-6 flex flex-wrap gap-2"><a className={`rounded-full px-4 py-2 text-sm font-bold ${!kategori ? "bg-school-blue text-white" : "bg-white text-slate-600"}`} href="/galeri">Semua</a>{categories.map(({ category }) => category && <a key={category} className={`rounded-full px-4 py-2 text-sm font-bold ${kategori === category ? "bg-school-blue text-white" : "bg-white text-slate-600"}`} href={`/galeri?kategori=${encodeURIComponent(category)}`}>{category}</a>)}</div>{galleries.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{galleries.map((gallery) => <GalleryAlbum key={gallery.id} title={gallery.title} description={gallery.description} category={gallery.category} coverUrl={gallery.coverUrl} images={gallery.images} />)}</div> : <p className="mt-8 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-600">Album galeri belum dipublikasikan.</p>}</div>;
}
