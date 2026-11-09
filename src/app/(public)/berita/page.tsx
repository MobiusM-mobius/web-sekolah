import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Berita", description: "Berita dan pengumuman terbaru SDIT Al-Ikhlas Serpong." };
type SearchParams = Promise<{ q?: string; category?: string; page?: string }>;

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page ?? "1", 10) || 1));
  const q = params.q?.trim().slice(0, 100) ?? "";
  const [categories, result] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    db.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { excerpt: { contains: q, mode: "insensitive" as const } }] } : {}), ...(params.category ? { category: { slug: params.category } } : {}) }, orderBy: { publishedAt: "desc" }, skip: (page - 1) * 9, take: 10, include: { category: true } }).catch(() => []),
  ]);
  const posts = result.slice(0, 9);
  const hasNext = result.length > 9;
  return <div className="container-shell section-space"><span className="eyebrow">Kabar sekolah</span><h1 className="mt-3 font-heading text-4xl font-black">Berita & pengumuman</h1><form className="mt-7 flex flex-col gap-3 sm:flex-row" action="/berita"><label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4"><Search size={18} className="text-slate-400" /><input name="q" defaultValue={q} placeholder="Cari berita..." className="h-12 w-full bg-transparent text-sm outline-none" /></label><select name="category" defaultValue={params.category ?? ""} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm"><option value="">Semua kategori</option>{categories.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}</select><button className="btn-primary !rounded-2xl !py-3">Cari</button></form>
    {posts.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <article key={post.id} className="soft-card overflow-hidden">{post.coverImageUrl ? <Image src={post.coverImageUrl} alt="" width={800} height={450} unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="aspect-[16/9] w-full object-cover" /> : <div className="grid aspect-[16/9] place-items-center bg-sky-50 text-5xl">📚</div>}<div className="p-5"><div className="flex justify-between gap-3 text-xs font-bold text-slate-500"><span>{post.category?.name ?? "Berita"}</span><time>{post.publishedAt?.toLocaleDateString("id-ID", { dateStyle: "medium" })}</time></div><h2 className="mt-3 font-heading text-xl font-extrabold">{post.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p><Link href={`/berita/${post.slug}`} className="mt-4 inline-block text-sm font-bold text-school-blue">Baca selengkapnya →</Link></div></article>)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-600">Belum ada berita yang sesuai.</div>}
    <nav className="mt-8 flex justify-center gap-3" aria-label="Pagination">{page > 1 && <Link className="btn-secondary" href={`/berita?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>Sebelumnya</Link>}{hasNext && <Link className="btn-secondary" href={`/berita?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>Berikutnya</Link>}</nav>
  </div>;
}
