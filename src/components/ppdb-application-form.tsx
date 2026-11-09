"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicantSchema, type ApplicantInput } from "@/lib/validation/ppdb";

type Requirement = { id: string; label: string; description: string | null; required: boolean; acceptedMimes: string[]; maxSizeMb: number };
type Receipt = { registrationNo: string; accessCode: string };
const labels = [
  ["studentName", "Nama lengkap calon siswa"], ["gender", "Jenis kelamin"], ["birthPlace", "Tempat lahir"], ["birthDate", "Tanggal lahir"], ["address", "Alamat calon siswa"], ["previousSchool", "Asal TK/RA (opsional)"],
  ["fatherName", "Nama ayah"], ["motherName", "Nama ibu"], ["whatsapp", "Nomor WhatsApp orang tua"], ["email", "Email orang tua"], ["parentAddress", "Alamat orang tua/wali"], ["guardianName", "Nama wali (opsional)"],
] as const;

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-school-blue focus:ring-2 focus:ring-sky-100";

export function PpdbApplicationForm({ requirements }: { requirements: Requirement[] }) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [serverError, setServerError] = useState("");
  const form = useForm<ApplicantInput>({ resolver: zodResolver(applicantSchema), mode: "onTouched" });
  const stepFields = [labels.slice(0, 6).map(([key]) => key), labels.slice(6).map(([key]) => key)];

  async function nextStep() {
    if (await form.trigger(stepFields[step] as (keyof ApplicantInput)[])) setStep((value) => value + 1);
  }

  async function submit(data: ApplicantInput) {
    setServerError("");
    for (const requirement of requirements) if (requirement.required && !files[requirement.id]) {
      setServerError(`Dokumen ${requirement.label} wajib diunggah.`);
      setStep(2);
      return;
    }
    const payload = new FormData();
    for (const [key, value] of Object.entries(data)) payload.set(key, String(value ?? ""));
    for (const [id, file] of Object.entries(files)) payload.set(`document:${id}`, file);
    const response = await fetch("/api/ppdb/applicants", { method: "POST", body: payload });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setServerError(result.error ?? "Pendaftaran belum dapat dikirim."); return; }
    setReceipt(result as Receipt);
  }

  if (receipt) return <section className="soft-card mt-8 border-emerald-200 bg-emerald-50/50 p-7"><span className="eyebrow !text-emerald-700">Pendaftaran berhasil</span><h2 className="mt-2 font-heading text-2xl font-black">Bukti pendaftaran</h2><p className="mt-3 text-sm leading-6 text-slate-600">Simpan atau cetak nomor dan kode akses ini. Kode akses hanya ditampilkan sekali untuk menjaga privasi data calon siswa.</p><dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white p-4"><dt className="text-xs font-bold text-slate-500">Nomor pendaftaran</dt><dd className="mt-1 break-all font-mono text-lg font-bold">{receipt.registrationNo}</dd></div><div className="rounded-xl bg-white p-4"><dt className="text-xs font-bold text-slate-500">Kode akses status</dt><dd className="mt-1 break-all font-mono text-lg font-bold">{receipt.accessCode}</dd></div></dl><div className="mt-5 flex flex-wrap gap-3"><a className="btn-primary" href="/ppdb/cek-status">Cek status pendaftaran</a><button type="button" className="btn-secondary" onClick={() => window.print()}>Cetak bukti</button></div></section>;

  return <form className="soft-card mt-8 p-6 sm:p-8" onSubmit={form.handleSubmit(submit)}>
    <div className="mb-7 flex items-center gap-2" aria-label={`Langkah ${step + 1} dari 3`}>{["Data siswa", "Orang tua", "Dokumen"].map((name, index) => <div key={name} className="flex flex-1 items-center gap-2"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${step === index ? "bg-school-blue text-white" : step > index ? "bg-school-green text-white" : "bg-slate-100 text-slate-500"}`}>{index + 1}</span><span className="hidden text-xs font-bold text-slate-600 sm:block">{name}</span>{index < 2 && <div className="h-px flex-1 bg-slate-200" />}</div>)}</div>
    {step < 2 ? <div className="grid gap-4 sm:grid-cols-2">{labels.slice(step === 0 ? 0 : 6, step === 0 ? 6 : labels.length).map(([name, label]) => <label key={name} className={`text-sm font-bold text-slate-700 ${["address", "parentAddress"].includes(name) ? "sm:col-span-2" : ""}`}>{label}{name === "gender" ? <select {...form.register(name)} className={inputClass}><option value="">Pilih jenis kelamin</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option></select> : <input {...form.register(name)} type={name === "birthDate" ? "date" : name === "email" ? "email" : "text"} className={inputClass} />}{form.formState.errors[name] && <span className="mt-1 block text-xs font-medium text-red-600">{form.formState.errors[name]?.message}</span>}</label>)}</div> : <div className="space-y-4">{requirements.length ? requirements.map((requirement) => <label key={requirement.id} className="block rounded-2xl border border-slate-200 p-4"><span className="font-bold">{requirement.label}{requirement.required ? " *" : " (opsional)"}</span>{requirement.description && <span className="mt-1 block text-sm text-slate-500">{requirement.description}</span>}<span className="mt-1 block text-xs text-slate-500">{requirement.acceptedMimes.join(", ")} · Maks. {requirement.maxSizeMb} MB</span><input type="file" accept={requirement.acceptedMimes.join(",")} onChange={(event) => { const file = event.target.files?.[0]; if (file) setFiles((current) => ({ ...current, [requirement.id]: file })); }} className="mt-3 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:font-bold file:text-school-blue" />{files[requirement.id] && <span className="mt-2 block text-xs text-emerald-700">Dipilih: {files[requirement.id].name}</span>}</label>) : <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">Dokumen pendaftaran belum dikonfigurasi. Hubungi sekolah untuk informasi selanjutnya.</p>}<p className="text-xs leading-5 text-slate-500">Dokumen disimpan secara privat dan hanya dapat diakses petugas PPDB yang berwenang.</p></div>}
    {serverError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
    <div className="mt-7 flex justify-between gap-3">{step > 0 ? <button type="button" className="btn-secondary" onClick={() => setStep((value) => value - 1)}>Kembali</button> : <span />}{step < 2 ? <button type="button" className="btn-primary" onClick={nextStep}>Lanjutkan</button> : <button type="submit" disabled={form.formState.isSubmitting || requirements.length === 0} className="btn-primary disabled:opacity-50">{form.formState.isSubmitting ? "Mengirim..." : "Kirim pendaftaran"}</button>}</div>
  </form>;
}
