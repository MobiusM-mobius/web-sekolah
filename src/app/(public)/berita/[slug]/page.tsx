import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { title: true, excerpt: true, coverImageUrl: true, seoTitle: true, seoDescription: true } }).catch(() => null);
  return post ? { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || undefined, openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || undefined, images: post.coverImageUrl ? [post.coverImageUrl] : [] } } : { title: "Berita tidak ditemukan" };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await db.post.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } }, include: { category: true, author: { select: { name: true } } } }).catch(() => null);
  if (!post) notFound();
  const related = await db.post.findMany({ where: { status: "PUBLISHED", slug: { not: slug }, ...(post.categoryId ? { categoryId: post.categoryId } : {}) }, take: 3, orderBy: { publishedAt: "desc" }, select: { title: true, slug: true } }).catch(() => []);
  return <article className="container-shell section-space max-w-4xl"><Link href="/berita" className="text-sm font-bold text-school-blue">← Semua berita</Link><p className="eyebrow mt-7">{post.category?.name ?? "Berita sekolah"}</p><h1 className="mt-3 font-heading text-4xl font-black leading-tight sm:text-5xl">{post.title}</h1><p className="mt-4 text-sm text-slate-500">{post.author.name} · {post.publishedAt?.toLocaleDateString("id-ID", { dateStyle: "long" })}</p>{post.coverImageUrl && <Image src={post.coverImageUrl} alt="" width={1200} height={675} unoptimized sizes="(max-width: 768px) 100vw, 896px" className="mt-8 max-h-[520px] w-full rounded-3xl object-cover" />}<div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap leading-8">{post.content}</div>{related.length > 0 && <aside className="mt-12 border-t border-slate-200 pt-8"><h2 className="font-heading text-xl font-extrabold">Berita terkait</h2><ul className="mt-4 space-y-3">{related.map((item) => <li key={item.slug}><Link className="font-semibold text-school-blue" href={`/berita/${item.slug}`}>{item.title} →</Link></li>)}</ul></aside>}</article>;
}
