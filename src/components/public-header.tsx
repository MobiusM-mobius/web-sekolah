"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand";

const links = [
  { label: "Profil", href: "/profil" },
  { label: "Akademik", href: "/akademik" },
  { label: "Berita", href: "/berita" },
  { label: "Galeri", href: "/galeri" },
  { label: "Prestasi", href: "/prestasi" },
  { label: "Kontak", href: "/kontak" },
];

export function PublicHeader() {
  const pathname = usePathname();
  // Menu state is keyed to the route so navigating closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 -mb-[76px] h-[76px] px-3 pt-3 sm:px-5">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 rounded-full border border-white/70 bg-white/85 pl-3 pr-2 shadow-[0_10px_30px_-18px_rgb(19_48_74/.45)] backdrop-blur-xl sm:pl-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SDIT Al-Ikhlas Serpong, beranda">
          <BrandMark className="size-10 shrink-0" />
          <span className="leading-none">
            <span className="block font-heading text-[1.06rem] font-black tracking-tight">Al-Ikhlas</span>
            <span className="mt-0.5 block text-[.76rem] font-semibold text-ink-soft">SDIT Serpong</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative rounded-full px-3.5 py-2 text-[.94rem] font-semibold transition-colors duration-150 ${isActive(link.href) ? "bg-sky-50 text-sky-700" : "text-ink-soft hover:text-ink"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/ppdb/cek-status" className="hidden rounded-full px-3.5 py-2 text-[.94rem] font-semibold text-ink-soft hover:text-ink xl:block">Cek status</Link>
          <Link href="/ppdb" className="btn btn-primary btn-sm !min-h-[44px] !px-5">Daftar PPDB</Link>
          <button type="button" onClick={() => setOpenFor(open ? null : pathname)} aria-expanded={open} aria-controls="menu-seluler"
            className="grid size-11 place-items-center rounded-full bg-paper text-ink lg:hidden" aria-label={open ? "Tutup menu" : "Buka menu"}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-seluler" className="mx-auto mt-2 max-w-[1240px] rounded-[28px] border border-line bg-white p-3 shadow-[0_24px_50px_-24px_rgb(19_48_74/.4)] lg:hidden" aria-label="Navigasi seluler">
          <ul className="grid grid-cols-2 gap-2">
            {links.map((link, i) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-2.5 rounded-2xl px-4 font-semibold ${isActive(link.href) ? "bg-sky-500 text-white" : "bg-paper"}`}>
                  <span className={`size-2.5 rounded-full ${["bg-sky-500", "bg-leaf-500", "bg-sun-400", "bg-clay-400"][i % 4]} ${isActive(link.href) ? "!bg-white" : ""}`} aria-hidden="true" />{link.label}
                </Link>
              </li>
            ))}
            <li className="col-span-2"><Link href="/ppdb/cek-status" className="flex min-h-12 items-center rounded-2xl bg-sun-100 px-4 font-semibold text-sun-700">Cek status pendaftaran</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
