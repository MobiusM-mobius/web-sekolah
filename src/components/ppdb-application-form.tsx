"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, FileUp, Printer } from "lucide-react";
import { applicantSchema, type ApplicantInput } from "@/lib/validation/ppdb";

type Requirement = { id: string; label: string; description: string | null; required: boolean; acceptedMimes: string[]; maxSizeMb: number };
type Receipt = { registrationNo: string; accessCode: string };
type FieldName = keyof ApplicantInput;
type Field = { name: FieldName; label: string; hint?: string; type?: "text" | "date" | "email" | "tel" | "textarea" | "gender"; wide?: boolean; autoComplete?: string };

const steps: { title: string; fields: Field[] }[] = [
  { title: "Data calon siswa", fields: [
    { name: "studentName", label: "Nama lengkap", hint: "Sesuai akta kelahiran", wide: true },
    { name: "gender", label: "Jenis kelamin", type: "gender" },
    { name: "birthDate", label: "Tanggal lahir", type: "date" },
    { name: "birthPlace", label: "Tempat lahir" },
    { name: "previousSchool", label: "Asal TK/RA", hint: "Kosongkan bila tidak ada" },
    { name: "address", label: "Alamat tempat tinggal", type: "textarea", wide: true, autoComplete: "street-address" },
  ] },
  { title: "Data orang tua atau wali", fields: [
    { name: "fatherName", label: "Nama ayah" },
    { name: "motherName", label: "Nama ibu" },
    { name: "whatsapp", label: "Nomor WhatsApp", type: "tel", hint: "Panitia menghubungi lewat nomor ini", autoComplete: "tel" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "guardianName", label: "Nama wali", hint: "Isi bila anak tinggal bersama wali" },
    { name: "parentAddress", label: "Alamat orang tua atau wali", type: "textarea", wide: true },
  ] },
];

const messages: Partial<Record<FieldName, string>> = {
  studentName: "Tulis nama lengkap minimal 2 huruf.",
  gender: "Pilih jenis kelamin.",
  birthPlace: "Tulis tempat lahir.",
  birthDate: "Pilih tanggal lahir.",
  address: "Tulis alamat lengkap minimal 8 karakter.",
  fatherName: "Tulis nama ayah.",
  motherName: "Tulis nama ibu.",
  whatsapp: "Gunakan nomor aktif, contoh 0812 3456 7890.",
  email: "Gunakan alamat email yang valid.",
  parentAddress: "Tulis alamat lengkap minimal 8 karakter.",
};

const typeLabel = (mimes: string[]) => mimes.map((m) => (m === "application/pdf" ? "PDF" : m === "image/png" ? "PNG" : m === "image/jpeg" ? "JPG" : m)).join(", ");

export function PpdbApplicationForm({ requirements }: { requirements: Requirement[] }) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [serverError, setServerError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const form = useForm<ApplicantInput>({ resolver: zodResolver(applicantSchema), mode: "onTouched" });
  const { errors, isSubmitting } = form.formState;
  const titles = [...steps.map((s) => s.title), "Dokumen"];

  function goTo(target: number) { setStep(target); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  async function next() { if (await form.trigger(steps[step].fields.map((f) => f.name))) goTo(step + 1); }

  function pickFile(requirement: Requirement, file?: File) {
    setFileErrors((current) => ({ ...current, [requirement.id]: "" }));
    if (!file) return;
    if (!requirement.acceptedMimes.includes(file.type)) { setFileErrors((c) => ({ ...c, [requirement.id]: `Format harus ${typeLabel(requirement.acceptedMimes)}.` })); return; }
    if (file.size > requirement.maxSizeMb * 1024 * 1024) { setFileErrors((c) => ({ ...c, [requirement.id]: `Ukuran file melebihi ${requirement.maxSizeMb} MB.` })); return; }
    setFiles((current) => ({ ...current, [requirement.id]: file }));
  }

  async function submit(data: ApplicantInput) {
    setServerError("");
    const missing = requirements.filter((r) => r.required && !files[r.id]);
    if (missing.length) { setServerError(`Unggah dulu: ${missing.map((r) => r.label).join(", ")}.`); return; }
    const payload = new FormData();
    for (const [key, value] of Object.entries(data)) payload.set(key, String(value ?? ""));
    for (const [id, file] of Object.entries(files)) payload.set(`document:${id}`, file);
    try {
      const response = await fetch("/api/ppdb/applicants", { method: "POST", body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setServerError(result.error ?? "Pendaftaran belum dapat dikirim. Coba lagi."); return; }
      setReceipt(result as Receipt);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch { setServerError("Koneksi terputus. Data Anda masih tersimpan di formulir, silakan kirim ulang."); }
  }

  if (receipt) return (
    <div ref={topRef} className="mt-6 scroll-mt-24 rounded-[28px] bg-leaf-500 p-3">
      <section className="rounded-[20px] bg-white p-6 sm:p-8" aria-live="polite">
        <span className="grid size-12 place-items-center rounded-full bg-leaf-50 text-leaf-700"><Check size={26} strokeWidth={3} /></span>
        <h3 className="mt-4 font-heading text-2xl font-black">Pendaftaran terkirim</h3>
        <p className="mt-2 max-w-2xl text-ink-soft">Simpan atau cetak bukti ini. <strong className="text-ink">Kode akses hanya ditampilkan sekali</strong> dan diperlukan untuk mengecek status pendaftaran.</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-sky-50 p-5"><dt className="text-sm font-semibold text-ink-soft">Nomor pendaftaran</dt><dd className="mt-1 select-all break-all font-mono text-xl font-bold">{receipt.registrationNo}</dd></div>
          <div className="rounded-2xl bg-sun-50 p-5"><dt className="text-sm font-semibold text-ink-soft">Kode akses</dt><dd className="mt-1 select-all break-all font-mono text-xl font-bold">{receipt.accessCode}</dd></div>
        </dl>
        <div className="no-print mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}><Printer size={18} />Cetak bukti</button>
          <a className="btn btn-secondary" href="/ppdb/cek-status">Cek status pendaftaran</a>
        </div>
      </section>
    </div>
  );

  return (
    <div ref={topRef} className="mt-6 scroll-mt-24 overflow-hidden rounded-3xl border border-line bg-white">
      <ol className="grid grid-cols-3 border-b border-line bg-paper" aria-label="Langkah pendaftaran">
        {titles.map((title, index) => (
          <li key={title} aria-current={step === index ? "step" : undefined} className={`flex items-center gap-3 border-b-4 px-4 py-4 sm:px-6 ${step === index ? "border-sky-500" : step > index ? "border-leaf-500" : "border-transparent"}`}>
            <span className={`grid size-8 shrink-0 place-items-center rounded-full font-heading text-sm font-black ${step === index ? "bg-sky-500 text-white" : step > index ? "bg-leaf-500 text-white" : "bg-white text-ink-faint ring-1 ring-line"}`}>{step > index ? <Check size={16} strokeWidth={3} /> : index + 1}</span>
            <span className={`hidden text-sm font-bold md:block ${step === index ? "text-ink" : "text-ink-soft"}`}>{title}</span>
          </li>
        ))}
      </ol>

      <form className="p-6 sm:p-8" onSubmit={(event) => void form.handleSubmit(submit)(event)} noValidate>
        <h3 className="font-heading text-xl font-extrabold">{titles[step]}</h3>
        <p className="mt-1 text-sm text-ink-soft">Langkah {step + 1} dari 3</p>

        {steps.map((group, groupIndex) => (
          <div key={group.title} hidden={step !== groupIndex} className="mt-6 grid gap-5 sm:grid-cols-2">
            {group.fields.map((field) => {
              const error = errors[field.name];
              const id = `ppdb-${field.name}`;
              const describedBy = [field.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
              const common = { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, className: "field", ...form.register(field.name) };
              return (
                <div key={field.name} className={field.wide ? "sm:col-span-2" : ""}>
                  <label htmlFor={id} className="label">{field.label}</label>
                  {field.type === "gender" ? <select {...common} defaultValue=""><option value="" disabled>Pilih</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option></select>
                    : field.type === "textarea" ? <textarea {...common} rows={3} autoComplete={field.autoComplete} />
                    : <input {...common} type={field.type ?? "text"} autoComplete={field.autoComplete} inputMode={field.type === "tel" ? "tel" : undefined} />}
                  {field.hint && <span id={`${id}-hint`} className="hint">{field.hint}</span>}
                  {error && <span id={`${id}-error`} className="error-text">{messages[field.name] ?? "Periksa isian ini."}</span>}
                </div>
              );
            })}
          </div>
        ))}

        <div hidden={step !== 2} className="mt-6 space-y-4">
          {requirements.length ? requirements.map((requirement) => {
            const file = files[requirement.id];
            const error = fileErrors[requirement.id];
            return (
              <div key={requirement.id} className={`rounded-2xl border-2 border-dashed p-5 ${file ? "border-leaf-500 bg-leaf-50" : error ? "border-clay-400 bg-clay-50" : "border-line"}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{requirement.label} {!requirement.required && <span className="font-normal text-ink-soft">(opsional)</span>}</p>
                    {requirement.description && <p className="text-sm text-ink-soft">{requirement.description}</p>}
                    <p className="text-sm text-ink-faint">{typeLabel(requirement.acceptedMimes)}, maksimal {requirement.maxSizeMb} MB</p>
                  </div>
                  <label className="btn btn-secondary btn-sm cursor-pointer">
                    <FileUp size={16} />{file ? "Ganti file" : "Pilih file"}
                    <input type="file" className="sr-only" accept={requirement.acceptedMimes.join(",")} onChange={(e) => pickFile(requirement, e.target.files?.[0])} aria-label={`Unggah ${requirement.label}`} />
                  </label>
                </div>
                {file && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-leaf-700"><Check size={16} strokeWidth={3} />{file.name}</p>}
                {error && <p className="error-text mt-3" role="alert">{error}</p>}
              </div>
            );
          }) : <p className="rounded-2xl bg-sun-50 p-4 text-sun-700">Dokumen persyaratan belum ditetapkan panitia. Silakan hubungi sekolah.</p>}
          <p className="text-sm text-ink-soft">Dokumen disimpan secara privat dan hanya dibuka oleh panitia PPDB.</p>
        </div>

        {serverError && <p role="alert" className="mt-6 rounded-xl bg-clay-50 p-4 font-semibold text-clay-700">{serverError}</p>}

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? <button type="button" className="btn btn-secondary" onClick={() => goTo(step - 1)}>Kembali</button> : <span />}
          {step < 2
            ? <button type="button" className="btn btn-primary" onClick={next}>Lanjut ke {titles[step + 1].toLowerCase()}</button>
            : <button type="submit" disabled={isSubmitting || requirements.length === 0} className="btn btn-green">{isSubmitting ? "Mengirim pendaftaran" : "Kirim pendaftaran"}</button>}
        </div>
      </form>
    </div>
  );
}
