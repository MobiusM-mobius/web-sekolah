"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type ImageItem = { id: string; imageUrl: string; caption: string | null };

export function GalleryAlbum({ title, description, category, coverUrl, images }: { title: string; description: string | null; category: string | null; coverUrl: string | null; images: ImageItem[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const cover = coverUrl || images[0]?.imageUrl;
  const active = images[index];
  return <>
    <article className="soft-card overflow-hidden">{cover ? <Image src={cover} alt={title} width={800} height={600} unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-sky-50 text-5xl">📷</div>}<div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-school-blue">{category ?? "Kegiatan"}</p><h2 className="mt-2 font-heading text-xl font-extrabold">{title}</h2>{description && <p className="mt-2 text-sm text-slate-600">{description}</p>}{images.length > 0 && <button onClick={() => { setIndex(0); setOpen(true); }} className="mt-4 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-school-blue">Lihat album ({images.length} foto)</button>}</div></article>
    {open && active && <div role="dialog" aria-modal="true" aria-label={`Galeri ${title}`} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); if (event.key === "ArrowRight") setIndex((value) => (value + 1) % images.length); if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + images.length) % images.length); }} tabIndex={-1} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 text-white"><button autoFocus onClick={() => setOpen(false)} aria-label="Tutup galeri" className="absolute right-4 top-4 rounded-full bg-white/15 p-3"><X size={22} /></button><div className="w-full max-w-5xl"><div className="relative mx-auto aspect-[4/3] max-h-[75vh] w-full"><Image src={active.imageUrl} alt={active.caption || title} fill unoptimized sizes="100vw" className="object-contain" /></div><div className="mt-4 flex items-center justify-between gap-4"><button disabled={images.length < 2} onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)} className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold disabled:opacity-40">Sebelumnya</button><p className="text-center text-sm">{active.caption || title} · {index + 1}/{images.length}</p><button disabled={images.length < 2} onClick={() => setIndex((value) => (value + 1) % images.length)} className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold disabled:opacity-40">Berikutnya</button></div></div></div>}
  </>;
}
