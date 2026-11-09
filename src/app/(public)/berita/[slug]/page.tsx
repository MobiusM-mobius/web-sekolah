import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { dateLong } from "@/lib/school";

type Props = { params: Promise<{ slug: string }> };
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const findPost = (slug: string) => db.post.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } }, include: { category: true, author: { select: { name: true } } } }).catch(() => null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return { title: "Berita tidak ditemukan" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  return { title, description, alternates: { canonical: `/berita/${post.slug}` }, openGraph: { type: "article", title, description, publishedTime: post.publishedAt?.toISOString(), images: post.coverImageUrl ? [post.coverImageUrl] : [] } };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();
  const related = await db.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, slug: { not: slug }, ...(post.categoryId ? { categoryId: post.categoryId } : {}) }, take: 3, orderBy: { publishedAt: "desc" }, select: { title: true, slug: true, publishedAt: true } }).catch(() => []);
  const jsonLd = { "@context": "https://schema.org", "@type": "NewsArticle", headline: post.title, datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(), author: { "@type": "Person", name: post.author.name }, publisher: { "@type": "Organization", name: "SDIT Al-Ikhlas Serpong" }, mainEntityOfPage: `${appUrl}/berita/${post.slug}`, ...(post.coverImageUrl ? { image: [post.coverImageUrl] } : {}) };

  return (
    <article className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="border-b border-line bg-clay-50">
        <div className="wrap max-w-3xl py-10 sm:py-14">
          <Link href="/berita" className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink"><ArrowLeft size={16} />Semua berita</Link>
          <p className="kicker mt-8">{post.category?.name ?? "Berita sekolah"}</p>
          <h1 className="mt-3 font-heading text-4xl font-black leading-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-ink-soft">Ditulis oleh <span className="font-semibold text-ink">{post.author.name}</span>{post.publishedAt && <>, <time dateTime={post.publishedAt.toISOString()}>{dateLong(post.publishedAt)}</time></>}</p>
        </div>
      </header>
      <div className="wrap max-w-3xl">
        {post.coverImageUrl && <div className="relative -mt-0 mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-sky-100"><Image src={post.coverImageUrl} alt="" fill priority unoptimized sizes="(max-width:768px) 100vw, 768px" className="object-cover" /></div>}
        {post.excerpt && <p className="mt-10 font-heading text-xl font-bold leading-relaxed text-sky-900">{post.excerpt}</p>}
        <div className="prose-school mt-6">{post.content}</div>
        {related.length > 0 && (
          <aside className="mt-16 rounded-3xl bg-white p-7 ring-1 ring-line" aria-labelledby="terkait">
            <h2 id="terkait" className="font-heading text-xl font-extrabold">Berita terkait</h2>
            <ul className="mt-4 divide-y divide-line">{related.map((item) => <li key={item.slug}><Link href={`/berita/${item.slug}`} className="flex items-baseline justify-between gap-6 py-3 font-semibold hover:text-sky-700">{item.title}{item.publishedAt && <time className="shrink-0 text-sm font-normal text-ink-faint">{item.publishedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</time>}</Link></li>)}</ul>
          </aside>
        )}
      </div>
    </article>
  );
}
