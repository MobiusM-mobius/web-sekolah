import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";

const links = [
  ["Profil", "/profil"],
  ["Akademik", "/akademik"],
  ["Berita", "/berita"],
  ["Galeri", "/galeri"],
  ["Prestasi", "/prestasi"],
  ["Kontak", "/kontak"],
] as const;

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="container-shell flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Beranda SDIT Al-Ikhlas Serpong">
          <span className="grid size-11 place-items-center rounded-2xl bg-school-blue text-sm font-black text-white shadow-md shadow-sky-200">AI</span>
          <span className="leading-tight"><span className="block font-heading text-[15px] font-extrabold">SDIT Al-Ikhlas</span><span className="text-xs text-slate-500">Serpong</span></span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
          {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-semibold text-slate-600 transition hover:text-school-blue">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/ppdb" className="btn-primary !px-4 !py-2.5 text-sm">Daftar PPDB <ArrowUpRight size={16} /></Link>
          <details className="group relative lg:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 text-slate-700" aria-label="Buka menu"><Menu size={20} /></summary>
            <nav className="absolute right-0 top-12 flex min-w-52 flex-col rounded-2xl border border-slate-100 bg-white p-2 shadow-xl" aria-label="Navigasi seluler">
              {links.map(([label, href]) => <Link key={href} href={href} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-sky-50">{label}</Link>)}
              <Link href="/ppdb" className="rounded-xl px-4 py-3 text-sm font-bold text-school-blue">Pendaftaran PPDB</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
