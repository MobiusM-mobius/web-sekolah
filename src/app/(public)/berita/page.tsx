import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { dateLong } from "@/lib/school";
import { PageIntro } from "@/components/brand";

export const metadata: Metadata = { title: "Berita", description: "Berita dan kegiatan terbaru SDIT Al-Ikhlas Serpong.", alternates: { canonical: "/berita" } };
type SearchParams = Promise<{ q?: string; category?: string; page?: string }>;
const PAGE_SIZE = 9;

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page ?? "1", 10) || 1));
  const q = params.q?.trim().slice(0, 100) ?? "";
  const category = params.category?.slice(0, 120) ?? "";
  const [categories, result] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    db.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { excerpt: { contains: q, mode: "insensitive" as const } }] } : {}), ...(category ? { category: { slug: category } } : {}) },
      orderBy: { publishedAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE + 1, include: { category: true },
    }).catch(() => []),
  ]);
  const posts = result.slice(0, PAGE_SIZE);
  const hasNext = result.length > PAGE_SIZE;
  const pageHref = (target: number) => { const sp = new URLSearchParams(); if (q) sp.set("q", q); if (category) sp.set("category", category); if (target > 1) sp.set("page", String(target)); const s = sp.toString(); return `/berita${s ? `?${s}` : ""}`; };
  const filtered = !!(q || category);

  return <>
    <PageIntro tone="clay" kicker="Kabar sekolah" title={<>Berita dan <span className="mark mark-orange">kegiatan</span></>} intro="Cerita kegiatan, informasi, dan kabar terbaru dari sekolah." />
    <div className="wrap py-12">
      <form action="/berita" className="flex flex-col gap-3 md:flex-row" role="search">
        <label className="relative flex-1">
          <span className="sr-only">Cari berita</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input name="q" defaultValue={q} placeholder="Cari judul berita" className="field !mt-0 !pl-11" />
        </label>
        <label className="md:w-60"><span className="sr-only">Kategori</span>
          <select name="category" defaultValue={category} className="field !mt-0"><option value="">Semua kategori</option>{categories.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}</select>
        </label>
        <button type="submit" className="btn btn-primary">Cari</button>
      </form>

      {categories.length > 0 && (
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="Kategori berita">
          <Link href="/berita" className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!category ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line hover:text-ink"}`}>Semua</Link>
          {categories.map((cat) => <Link key={cat.id} href={`/berita?category=${cat.slug}`} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${category === cat.slug ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line hover:text-ink"}`}>{cat.name}</Link>)}
        </nav>
      )}

      {posts.length ? (
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post, i) => (
          <li key={post.id}>
            <Link href={`/berita/${post.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sky-100">
                {post.coverImageUrl ? <Image src={post.coverImageUrl} alt="" fill unoptimized sizes="(max-width:640px) 100vw, 380px" className="object-cover" /> : <div className={`tile size-full ${["", "tile-green", "tile-sun"][i % 3]}`} />}
              </div>
              <p className="mt-4 text-sm font-semibold text-sky-700">{post.category?.name ?? "Berita"}{post.publishedAt ? <span className="font-normal text-ink-faint">, {dateLong(post.publishedAt)}</span> : null}</p>
              <h2 className="mt-1.5 font-heading text-xl font-extrabold leading-snug group-hover:text-sky-700">{post.title}</h2>
              {post.excerpt && <p className="mt-2 line-clamp-3 text-ink-soft">{post.excerpt}</p>}
            </Link>
          </li>
        ))}</ul>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-line bg-white p-10 text-center">
          <h2 className="font-heading text-xl font-extrabold">{filtered ? "Tidak ada berita yang cocok" : "Belum ada berita"}</h2>
          <p className="mt-2 text-ink-soft">{filtered ? "Coba kata kunci lain atau pilih semua kategori." : "Berita sekolah akan tampil di sini setelah diterbitkan."}</p>
          {filtered && <Link href="/berita" className="btn btn-secondary mt-5">Hapus filter</Link>}
        </div>
      )}

      {(page > 1 || hasNext) && (
        <nav className="mt-12 flex items-center justify-between border-t border-line pt-6" aria-label="Halaman berita">
          {page > 1 ? <Link href={pageHref(page - 1)} className="btn btn-secondary">Halaman sebelumnya</Link> : <span />}
          <span className="text-sm text-ink-soft">Halaman {page}</span>
          {hasNext ? <Link href={pageHref(page + 1)} className="btn btn-secondary">Halaman berikutnya</Link> : <span />}
        </nav>
      )}
    </div>
  </>;
}
