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
  const setOpen = (value: boolean | ((v: boolean) => boolean)) => setOpenFor((typeof value === "function" ? value(open) : value) ? pathname : null);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="SDIT Al-Ikhlas Serpong, beranda">
          <BrandMark className="size-10 shrink-0" />
          <span className="leading-none">
            <span className="block font-heading text-[1.05rem] font-extrabold">SDIT Al-Ikhlas</span>
            <span className="mt-1 block text-[.8rem] font-semibold text-ink-soft">Serpong</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-[.93rem] font-semibold transition-colors ${isActive(link.href) ? "bg-sky-50 text-sky-700" : "text-ink-soft hover:text-ink"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/ppdb" className="btn btn-primary btn-sm whitespace-nowrap sm:min-h-[42px] sm:px-4 sm:text-[.93rem]">Daftar PPDB</Link>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="menu-seluler"
            className="grid size-10 place-items-center rounded-xl border border-line lg:hidden" aria-label={open ? "Tutup menu" : "Buka menu"}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-seluler" className="border-t border-line bg-white lg:hidden" aria-label="Navigasi seluler">
          <ul className="wrap grid grid-cols-2 gap-2 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block rounded-xl px-4 py-3 font-semibold ${isActive(link.href) ? "bg-sky-50 text-sky-700" : "bg-paper"}`}>{link.label}</Link>
              </li>
            ))}
            <li className="col-span-2"><Link href="/ppdb/cek-status" className="block rounded-xl bg-sun-50 px-4 py-3 font-semibold text-sun-700">Cek status pendaftaran</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
