import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { dateLong, getActivePeriod, getSchoolProfile, whatsappHref } from "@/lib/school";
import { PageIntro, Pending } from "@/components/brand";
import { PpdbApplicationForm } from "@/components/ppdb-application-form";

export const metadata: Metadata = { title: "PPDB", description: "Penerimaan peserta didik baru SDIT Al-Ikhlas Serpong: periode, kuota, persyaratan, alur, dan formulir online.", alternates: { canonical: "/ppdb" } };

const steps = [
  { title: "Isi formulir online", text: "Lengkapi data calon siswa serta data orang tua atau wali." },
  { title: "Unggah dokumen", text: "Foto atau pindai dokumen persyaratan dalam format JPG, PNG, atau PDF." },
  { title: "Simpan bukti pendaftaran", text: "Catat nomor pendaftaran dan kode akses yang muncul setelah formulir terkirim." },
  { title: "Pantau status", text: "Panitia memeriksa berkas. Status dan catatan panitia dapat dicek kapan saja." },
];

export default async function PpdbPage() {
  const now = new Date();
  const [period, profile] = await Promise.all([getActivePeriod(), getSchoolProfile()]);
  const isOpen = !!period && period.opensAt <= now && period.closesAt >= now;
  const upcoming = !!period && period.opensAt > now;
  const filled = period?.quota ? await db.applicant.count({ where: { periodId: period.id, status: { not: "REJECTED" } } }).catch(() => 0) : 0;
  const remaining = period?.quota ? Math.max(0, period.quota - filled) : null;
  const faqs = Array.isArray(period?.faqs) ? (period.faqs as { question: string; answer: string }[]) : [];
  const wa = whatsappHref(profile?.whatsapp, "Assalamu'alaikum, saya ingin bertanya tentang PPDB SDIT Al-Ikhlas Serpong.");
  const status = isOpen ? { label: "Pendaftaran dibuka", tone: "bg-leaf-500 text-white" } : upcoming ? { label: "Segera dibuka", tone: "bg-sun-400 text-ink" } : { label: "Pendaftaran ditutup", tone: "bg-ink-soft text-white" };

  return <>
    <PageIntro kicker="Penerimaan peserta didik baru" title={period ? <>PPDB tahun ajaran <span className="mark">{period.academicYear}</span></> : <>Penerimaan <span className="mark">siswa baru</span></>} intro="Semua informasi pendaftaran ada di halaman ini, termasuk formulir online saat periode dibuka." />

    <div className="wrap space-y-14 py-12">
      {period ? (
        <section className="tile tile-sun rounded-[28px] p-3" aria-labelledby="periode">
          <div className="grid gap-8 rounded-[20px] bg-white p-6 sm:p-8 lg:grid-cols-[1fr_320px]">
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${status.tone}`}>{status.label}</span>
              <h2 id="periode" className="mt-4 font-heading text-2xl font-black sm:text-3xl">{period.title}</h2>
              {period.description && <p className="prose-school mt-3 text-ink-soft">{period.description}</p>}
              {isOpen && <a href="#formulir" className="btn btn-primary mt-6">Isi formulir pendaftaran</a>}
            </div>
            <dl className="space-y-4 rounded-2xl bg-paper p-5">
              <div><dt className="text-sm text-ink-soft">Periode pendaftaran</dt><dd className="font-bold">{dateLong(period.opensAt)} sampai {dateLong(period.closesAt)}</dd></div>
              {period.quota && remaining !== null && (
                <div><dt className="text-sm text-ink-soft">Sisa kuota</dt>
                  <dd className="font-bold">{remaining} dari {period.quota} kursi</dd>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line" role="presentation"><div className="h-full rounded-full bg-leaf-500" style={{ width: `${Math.min(100, (filled / period.quota) * 100)}%` }} /></div>
                </div>
              )}
              {period.feeInformation && <div><dt className="text-sm text-ink-soft">Informasi biaya</dt><dd className="prose-school text-[.95rem] font-semibold">{period.feeInformation}</dd></div>}
            </dl>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-line bg-white p-8">
          <h2 className="font-heading text-2xl font-extrabold">Jadwal PPDB belum diumumkan</h2>
          <p className="mt-2 max-w-xl text-ink-soft">Periode penerimaan berikutnya akan diumumkan di halaman ini.{wa ? " Anda dapat bertanya langsung kepada panitia melalui WhatsApp." : ""}</p>
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-green mt-5"><MessageCircle size={18} />Tanya panitia</a>}
        </section>
      )}

      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="persyaratan">
          <h2 id="persyaratan" className="font-heading text-2xl font-extrabold">Dokumen persyaratan</h2>
          {period?.requirements.length ? (
            <ul className="mt-5 space-y-3">{period.requirements.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                <CheckCircle2 className={`mt-0.5 shrink-0 ${item.required ? "text-leaf-500" : "text-ink-faint"}`} size={20} />
                <div><p className="font-bold">{item.label} {!item.required && <span className="text-sm font-normal text-ink-soft">(opsional)</span>}</p>{item.description && <p className="text-sm text-ink-soft">{item.description}</p>}<p className="text-xs text-ink-faint">Maksimal {item.maxSizeMb} MB</p></div>
              </li>
            ))}</ul>
          ) : <div className="mt-4"><Pending>Daftar dokumen akan diumumkan bersama periode pendaftaran.</Pending></div>}
        </section>

        <section aria-labelledby="alur">
          <h2 id="alur" className="font-heading text-2xl font-extrabold">Alur pendaftaran</h2>
          <ol className="relative mt-5 space-y-6 border-l-2 border-dashed border-sky-200 pl-8">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[49px] grid size-8 place-items-center rounded-full bg-sky-500 font-heading font-black text-white ring-4 ring-paper">{index + 1}</span>
                <p className="font-bold">{step.title}</p>
                <p className="text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-ink-soft">Sudah mendaftar? <Link href="/ppdb/cek-status" className="link">Cek status pendaftaran</Link></p>
        </section>
      </div>

      {isOpen && period && (
        <section id="formulir" className="scroll-mt-24" aria-labelledby="judul-formulir">
          <h2 id="judul-formulir" className="font-heading text-2xl font-extrabold">Formulir pendaftaran</h2>
          <p className="mt-1 text-ink-soft">Butuh sekitar 10 menit. Siapkan dokumen dalam bentuk foto atau PDF.</p>
          <PpdbApplicationForm requirements={period.requirements} />
        </section>
      )}

      {faqs.length > 0 && (
        <section aria-labelledby="faq" className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <h2 id="faq" className="font-heading text-2xl font-extrabold">Pertanyaan yang sering diajukan</h2>
          <div className="divide-y divide-line rounded-3xl border border-line bg-white">{faqs.map((faq, i) => (
            <details key={i} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">{faq.question}<span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-700 transition group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-3 text-ink-soft">{faq.answer}</p>
            </details>
          ))}</div>
        </section>
      )}

      {period && wa && (
        <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-leaf-50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div><h2 className="font-heading text-xl font-extrabold">Masih ada pertanyaan?</h2><p className="text-ink-soft">Panitia PPDB siap membantu melalui WhatsApp.</p></div>
          <a href={wa} target="_blank" rel="noreferrer" className="btn btn-green"><MessageCircle size={18} />Hubungi panitia</a>
        </section>
      )}
    </div>
  </>;
}
