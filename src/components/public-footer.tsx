import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandMark, Mosaic } from "@/components/brand";
import { getSchoolProfile, socialLinksOf, whatsappHref } from "@/lib/school";

const explore = [
  ["Profil sekolah", "/profil"], ["Akademik", "/akademik"], ["Berita", "/berita"], ["Galeri", "/galeri"],
  ["Prestasi", "/prestasi"], ["Kontak", "/kontak"], ["Informasi PPDB", "/ppdb"], ["Cek status PPDB", "/ppdb/cek-status"],
] as const;

export async function PublicFooter() {
  const profile = await getSchoolProfile();
  const wa = whatsappHref(profile?.whatsapp);
  const socials = socialLinksOf(profile?.socialLinks);
  return (
    <footer className="mt-auto bg-night text-white">
      <div className="frieze" />
      <div className="wrap grid gap-14 py-16 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <div>
          <div className="flex items-center gap-3"><BrandMark className="size-12" /><p className="font-heading text-2xl font-black tracking-tight">SDIT Al-Ikhlas<br /><span className="text-white/60">Serpong</span></p></div>
          <p className="mt-5 max-w-sm leading-7 text-white/70">Sekolah Dasar Islam Terpadu di Serpong, Tangerang Selatan.</p>
          {socials.length > 0 && <ul className="mt-6 flex flex-wrap gap-2">{socials.map(([label, url]) => <li key={label}><a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-full bg-white/10 px-4 text-sm font-semibold hover:bg-white/20">{label}</a></li>)}</ul>}
        </div>
        <nav aria-label="Tautan footer">
          <h2 className="font-heading text-lg font-black text-white">Jelajahi</h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[.95rem] text-white/70 lg:grid-cols-1">
            {explore.map(([label, href]) => <li key={href}><Link href={href} className="underline-offset-4 hover:text-white hover:underline">{label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2 className="font-heading text-lg font-black text-white">Hubungi sekolah</h2>
          <ul className="mt-5 space-y-3.5 text-[.95rem] text-white/75">
            <li className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-sun-400" />{profile?.address || "Alamat sedang dilengkapi sekolah."}</li>
            {profile?.phone && <li className="flex gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-sun-400" /><a href={`tel:${profile.phone}`} className="hover:text-white">{profile.phone}</a></li>}
            {profile?.email && <li className="flex gap-3"><Mail size={18} className="mt-0.5 shrink-0 text-sun-400" /><a href={`mailto:${profile.email}`} className="break-all hover:text-white">{profile.email}</a></li>}
          </ul>
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-green btn-sm mt-6"><MessageCircle size={16} />WhatsApp sekolah</a>}
        </div>
        <Mosaic cols={2} className="hidden w-[150px] lg:grid" tiles={[{ tone: "sky", shape: "arch" }, { tone: "sun", shape: "star", shapeTone: "night" }, { tone: "leaf", shape: "crescent" }, { tone: "clay", shape: "half" }]} />
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-wrap justify-between gap-2 py-6 text-[.85rem] text-white/50">
          <p>© {new Date().getFullYear()} SDIT Al-Ikhlas Serpong</p>
          <Link href="/admin/login" className="hover:text-white">Masuk pengelola</Link>
        </div>
      </div>
    </footer>
  );
}
