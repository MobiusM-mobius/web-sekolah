import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSchoolProfile, socialLinksOf, whatsappHref } from "@/lib/school";
import { PageIntro, Pending } from "@/components/brand";

export const metadata: Metadata = { title: "Kontak", description: "Alamat, WhatsApp, email, dan lokasi SDIT Al-Ikhlas Serpong.", alternates: { canonical: "/kontak" } };

export default async function ContactPage() {
  const profile = await getSchoolProfile();
  const wa = whatsappHref(profile?.whatsapp, "Assalamu'alaikum, saya ingin bertanya tentang SDIT Al-Ikhlas Serpong.");
  const socials = socialLinksOf(profile?.socialLinks);
  const rows = [
    { icon: MapPin, label: "Alamat", value: profile?.address, tone: "bg-clay-50 text-clay-700" },
    { icon: Phone, label: "Telepon", value: profile?.phone, href: profile?.phone ? `tel:${profile.phone}` : undefined, tone: "bg-sky-50 text-sky-700" },
    { icon: Mail, label: "Email", value: profile?.email, href: profile?.email ? `mailto:${profile.email}` : undefined, tone: "bg-sun-50 text-sun-700" },
  ];

  return <>
    <PageIntro kicker="Kami siap membantu" title={<>Hubungi <span className="mark mark-blue">sekolah</span></>} intro="Silakan datang, telepon, atau kirim pesan. Untuk pertanyaan PPDB, WhatsApp adalah cara tercepat." />
    <div className="wrap grid gap-8 py-12 lg:grid-cols-[400px_1fr]">
      <section className="space-y-6" aria-label="Detail kontak">
        <ul className="divide-y divide-line rounded-3xl border border-line bg-white">
          {rows.map(({ icon: Icon, label, value, href, tone }) => (
            <li key={label} className="flex gap-4 p-5">
              <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}><Icon size={20} /></span>
              <div className="min-w-0"><p className="text-sm font-semibold text-ink-soft">{label}</p>
                {value ? (href ? <a href={href} className="break-words font-bold hover:text-sky-700">{value}</a> : <p className="font-bold">{value}</p>) : <p className="text-ink-faint">Sedang dilengkapi</p>}</div>
            </li>
          ))}
        </ul>
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-green w-full"><MessageCircle size={18} />Kirim pesan WhatsApp</a>}
        {socials.length > 0 && <div><h2 className="font-heading text-lg font-extrabold">Media sosial</h2><ul className="mt-3 flex flex-wrap gap-2">{socials.map(([label, url]) => <li key={label}><a href={url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">{label}</a></li>)}</ul></div>}
      </section>
      <section aria-label="Peta lokasi" className="overflow-hidden rounded-3xl border border-line bg-white">
        {profile?.mapUrl
          ? <iframe title="Peta lokasi SDIT Al-Ikhlas Serpong" src={profile.mapUrl} className="block h-full min-h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          : <div className="tile grid h-full min-h-[420px] place-items-center p-6"><div className="max-w-sm rounded-2xl bg-white p-6 text-center"><MapPin className="mx-auto text-sky-500" size={30} /><p className="mt-3 font-heading text-lg font-extrabold">Peta lokasi</p><div className="mt-3"><Pending>Peta lokasi sedang disiapkan.</Pending></div></div></div>}
      </section>
    </div>
  </>;
}
