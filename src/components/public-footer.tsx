import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandMark } from "@/components/brand";
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
      <div className="wrap grid gap-12 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3"><BrandMark className="size-11" /><p className="font-heading text-xl font-extrabold">SDIT Al-Ikhlas Serpong</p></div>
          <p className="mt-4 max-w-sm text-[.95rem] leading-7 text-white/70">Sekolah Dasar Islam Terpadu di Serpong. Informasi di situs ini dikelola langsung oleh pihak sekolah.</p>
          {socials.length > 0 && <ul className="mt-5 flex flex-wrap gap-2">{socials.map(([label, url]) => <li key={label}><a href={url} target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">{label}</a></li>)}</ul>}
        </div>
        <nav aria-label="Tautan footer">
          <h2 className="font-heading text-base font-extrabold text-white">Jelajahi</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[.93rem] text-white/75">
            {explore.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-white hover:underline">{label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2 className="font-heading text-base font-extrabold text-white">Hubungi sekolah</h2>
          <ul className="mt-4 space-y-3 text-[.93rem] text-white/75">
            <li className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-sun-400" />{profile?.address || "Alamat sedang dilengkapi sekolah."}</li>
            {profile?.phone && <li className="flex gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-sun-400" /><a href={`tel:${profile.phone}`} className="hover:text-white">{profile.phone}</a></li>}
            {profile?.email && <li className="flex gap-3"><Mail size={18} className="mt-0.5 shrink-0 text-sun-400" /><a href={`mailto:${profile.email}`} className="break-all hover:text-white">{profile.email}</a></li>}
          </ul>
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-green btn-sm mt-5"><MessageCircle size={16} />WhatsApp sekolah</a>}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-5 text-[.82rem] text-white/55">© {new Date().getFullYear()} SDIT Al-Ikhlas Serpong</p>
      </div>
    </footer>
  );
}
