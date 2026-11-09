"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ImageItem = { id: string; imageUrl: string; caption: string | null };
const tiles = ["tile", "tile tile-green", "tile tile-sun"];

export function GalleryAlbum({ title, description, category, coverUrl, images, tone = 0 }: { title: string; description: string | null; category: string | null; coverUrl: string | null; images: ImageItem[]; tone?: number }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cover = coverUrl || images[0]?.imageUrl;
  const count = images.length;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((delta: number) => setIndex((value) => (value === null ? value : (value + delta + count) % count)), [count]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const active = index !== null ? images[index] : null;

  return <>
    <button type="button" onClick={() => count && setIndex(0)} disabled={!count} className="group block w-full text-left disabled:cursor-default">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sky-100">
        {cover ? <Image src={cover} alt="" fill unoptimized sizes="(max-width:640px) 100vw, 380px" className="object-cover" /> : <div className={`${tiles[tone % 3]} size-full`} />}
        {count > 0 && <span className="absolute bottom-3 right-3 rounded-lg bg-white px-2.5 py-1 text-xs font-bold">{count} foto</span>}
      </div>
      {category && <p className="mt-4 text-sm font-semibold text-sky-700">{category}</p>}
      <h2 className={`${category ? "mt-1" : "mt-4"} font-heading text-xl font-extrabold group-enabled:group-hover:text-sky-700`}>{title}</h2>
      {description && <p className="mt-1.5 line-clamp-2 text-ink-soft">{description}</p>}
    </button>

    <dialog ref={dialogRef} onClose={close} onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
      aria-label={`Album ${title}`} className="m-0 h-dvh max-h-none w-screen max-w-none bg-night/95 p-0 text-white backdrop:bg-night/80">
      {active && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <p className="font-heading font-extrabold">{title} <span className="font-body font-normal text-white/60">({index! + 1} dari {count})</span></p>
            <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Tutup album" autoFocus><X size={22} /></button>
          </div>
          <div className="relative flex-1"><Image src={active.imageUrl} alt={active.caption || `${title}, foto ${index! + 1}`} fill unoptimized sizes="100vw" className="object-contain" /></div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <button type="button" onClick={() => step(-1)} disabled={count < 2} className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30" aria-label="Foto sebelumnya"><ChevronLeft size={24} /></button>
            <p className="text-center text-sm text-white/80">{active.caption}</p>
            <button type="button" onClick={() => step(1)} disabled={count < 2} className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30" aria-label="Foto berikutnya"><ChevronRight size={24} /></button>
          </div>
        </div>
      )}
    </dialog>
  </>;
}
