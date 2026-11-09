import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";

export async function PublicFooter() {
  const profile = await db.schoolProfile.findFirst().catch(() => null);
  const whatsapp = profile?.whatsapp?.replace(/\D/g, "");
  const socialLinks = profile?.socialLinks && typeof profile.socialLinks === "object" && !Array.isArray(profile.socialLinks) ? profile.socialLinks as Record<string, string> : {};
  return (
    <footer className="bg-[#18374d] text-white">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><div className="mb-4 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-school-blue font-black">AI</span><strong className="font-heading text-lg">SDIT Al-Ikhlas Serpong</strong></div><p className="max-w-sm text-sm leading-7 text-slate-300">Informasi resmi sekolah dan penerimaan peserta didik baru. Konten sekolah dikelola oleh administrator.</p></div>
        <div><h2 className="mb-4 font-heading text-base font-extrabold">Jelajahi</h2><div className="grid grid-cols-2 gap-3 text-sm text-slate-300"><Link href="/profil">Profil sekolah</Link><Link href="/akademik">Akademik</Link><Link href="/berita">Berita</Link><Link href="/galeri">Galeri</Link><Link href="/prestasi">Prestasi</Link><Link href="/ppdb">PPDB</Link></div></div>
        <div><h2 className="mb-4 font-heading text-base font-extrabold">Hubungi kami</h2><p className="flex gap-2 text-sm leading-6 text-slate-300"><MapPin size={17} className="mt-1 shrink-0" />{profile?.address || "Alamat sekolah belum diisi oleh admin."}</p>{whatsapp && <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-300" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp panitia</a>}<div className="mt-4 flex flex-wrap gap-3">{Object.entries(socialLinks).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-300 hover:text-white">{label}</a>)}</div></div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} SDIT Al-Ikhlas Serpong. Informasi resmi dikelola sekolah.</div>
    </footer>
  );
}
