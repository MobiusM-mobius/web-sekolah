"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/image-upload-field";

type Profile = { history?: string | null; identity?: unknown; vision?: string | null; mission?: string[]; goals?: string[]; strengths?: string[]; principalName?: string | null; principalMessage?: string | null; principalPhotoUrl?: string | null; curriculum?: string | null; learningPrograms?: string[]; islamicPrograms?: string[]; extracurriculars?: string[]; facilities?: string[]; accreditation?: string | null; address?: string | null; phone?: string | null; whatsapp?: string | null; email?: string | null; mapUrl?: string | null; heroHeadline?: string | null; heroDescription?: string | null; heroImageUrl?: string | null; socialLinks?: unknown };
type Form = Record<string, string>;
const input = "field";
const json = (value: unknown) => JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);

export function AdminSchoolProfile({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState<Form>({
    history: profile?.history ?? "", identity: json(profile?.identity), vision: profile?.vision ?? "", mission: profile?.mission?.join("\n") ?? "", goals: profile?.goals?.join("\n") ?? "", strengths: profile?.strengths?.join("\n") ?? "", principalName: profile?.principalName ?? "", principalMessage: profile?.principalMessage ?? "", principalPhotoUrl: profile?.principalPhotoUrl ?? "", curriculum: profile?.curriculum ?? "", learningPrograms: profile?.learningPrograms?.join("\n") ?? "", islamicPrograms: profile?.islamicPrograms?.join("\n") ?? "", extracurriculars: profile?.extracurriculars?.join("\n") ?? "", facilities: profile?.facilities?.join("\n") ?? "", accreditation: profile?.accreditation ?? "", address: profile?.address ?? "", phone: profile?.phone ?? "", whatsapp: profile?.whatsapp ?? "", email: profile?.email ?? "", mapUrl: profile?.mapUrl ?? "", heroHeadline: profile?.heroHeadline ?? "", heroDescription: profile?.heroDescription ?? "", heroImageUrl: profile?.heroImageUrl ?? "", socialLinks: json(profile?.socialLinks),
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  function change(key: string, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  function array(key: string) { return form[key].split("\n").map((item) => item.trim()).filter(Boolean); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    let identity: unknown; let socialLinks: unknown;
    try { identity = JSON.parse(form.identity); socialLinks = JSON.parse(form.socialLinks); } catch { setMessage("Format JSON pada identitas atau tautan sosial tidak valid."); setBusy(false); return; }
    const body = { ...form, identity, socialLinks, mission: array("mission"), goals: array("goals"), strengths: array("strengths"), learningPrograms: array("learningPrograms"), islamicPrograms: array("islamicPrograms"), extracurriculars: array("extracurriculars"), facilities: array("facilities") };
    const response = await fetch("/api/admin/school-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Profil sekolah berhasil disimpan." : result.error ?? "Profil belum dapat disimpan."); setBusy(false);
  }
  const textArea = (key: string, title: string, rows = 4) => <label className="block text-sm font-bold">{title}<textarea rows={rows} value={form[key]} onChange={(e) => change(key, e.target.value)} className={input} /></label>;
  const text = (key: string, title: string, type = "text") => <label className="block text-sm font-bold">{title}<input type={type} value={form[key]} onChange={(e) => change(key, e.target.value)} className={input} /></label>;
  return <form onSubmit={save} className="space-y-6">
    <section className="panel grid gap-4 p-6 md:grid-cols-2"><h2 className="font-heading text-xl font-extrabold md:col-span-2">Profil dan identitas sekolah</h2>{textArea("history", "Sejarah sekolah", 5)}{textArea("vision", "Visi sekolah", 5)}{textArea("mission", "Misi (satu per baris)", 5)}{textArea("goals", "Tujuan (satu per baris)", 5)}{textArea("strengths", "Keunggulan sekolah (satu per baris)", 5)}{textArea("identity", "Identitas tambahan (JSON objek)", 5)}{text("accreditation", "Akreditasi")}</section>
    <section className="panel grid gap-4 p-6 md:grid-cols-2"><h2 className="font-heading text-xl font-extrabold md:col-span-2">Sambutan dan akademik</h2>{text("principalName", "Nama kepala sekolah")}{textArea("principalMessage", "Sambutan kepala sekolah", 4)}<ImageUploadField label="Foto kepala sekolah" value={form.principalPhotoUrl} onChange={(value) => change("principalPhotoUrl", value)} /><div className="md:col-span-2"><p className="mb-2 text-sm font-extrabold">Hero homepage</p><p className="mb-3 text-xs text-ink-faint">Masukkan headline resmi yang sudah disetujui sekolah; bila kosong, homepage memakai sapaan umum.</p>{text("heroHeadline", "Headline homepage")}{textArea("heroDescription", "Deskripsi homepage", 3)}<div className="mt-3"><ImageUploadField label="Foto utama beranda" value={form.heroImageUrl} onChange={(value) => change("heroImageUrl", value)} /></div></div><label className="text-sm font-bold md:col-span-2">Kurikulum<textarea rows={5} value={form.curriculum} onChange={(e) => change("curriculum", e.target.value)} className={input} /></label>{textArea("learningPrograms", "Program pembelajaran (satu per baris)")}{textArea("islamicPrograms", "Program keislaman (satu per baris)")}{textArea("extracurriculars", "Ekstrakurikuler (satu per baris)")}{textArea("facilities", "Fasilitas (satu per baris)")}</section>
    <section className="panel grid gap-4 p-6 md:grid-cols-2"><h2 className="font-heading text-xl font-extrabold md:col-span-2">Kontak dan lokasi</h2>{textArea("address", "Alamat", 3)}{text("phone", "Telepon")}{text("whatsapp", "WhatsApp (format internasional)")}{text("email", "Email", "email")}{text("mapUrl", "URL embed Google Maps")}{textArea("socialLinks", "Tautan media sosial (JSON objek)", 4)}</section>
    <div className="flex flex-wrap items-center gap-4">{message && <p role="status" className="text-sm text-ink-soft">{message}</p>}<button disabled={busy} className="btn btn-primary disabled:opacity-50">{busy ? "Menyimpan..." : "Simpan profil sekolah"}</button></div>
  </form>;
}
