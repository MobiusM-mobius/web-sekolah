"use client";

import { useState } from "react";
import { statusLookupSchema } from "@/lib/validation/ppdb";

type Result = { registrationNo: string; studentName: string; academicYear: string; status: string; adminNote: string | null; updatedAt: string };
const statusInfo: Record<string, { label: string; text: string; tone: string }> = {
  PENDING: { label: "Menunggu verifikasi", text: "Berkas sudah diterima dan akan diperiksa panitia.", tone: "bg-sun-50 text-sun-700 ring-sun-400" },
  VERIFIED: { label: "Berkas terverifikasi", text: "Data dan dokumen sudah diperiksa. Tunggu pengumuman berikutnya.", tone: "bg-sky-50 text-sky-700 ring-sky-500" },
  REVISION_REQUIRED: { label: "Perlu perbaikan", text: "Panitia meminta perbaikan. Baca catatan di bawah dan hubungi sekolah.", tone: "bg-clay-50 text-clay-700 ring-clay-400" },
  ACCEPTED: { label: "Diterima", text: "Selamat! Calon siswa dinyatakan diterima.", tone: "bg-leaf-50 text-leaf-700 ring-leaf-500" },
  REJECTED: { label: "Tidak diterima", text: "Mohon maaf, pendaftaran belum dapat diterima.", tone: "bg-paper text-ink-soft ring-line" },
};

export function PpdbStatusForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(form: FormData) {
    setError(""); setResult(null);
    const parsed = statusLookupSchema.safeParse({ registrationNo: String(form.get("registrationNo") ?? ""), accessCode: String(form.get("accessCode") ?? "") });
    if (!parsed.success) { setError("Periksa kembali format nomor pendaftaran dan kode akses."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/ppdb/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "Status belum dapat diperiksa."); else setResult(data as Result);
    } catch { setError("Koneksi terputus. Silakan coba lagi."); }
    setLoading(false);
  }

  const info = result ? statusInfo[result.status] : null;
  return (
    <div className="space-y-6">
      <form action="/api/ppdb/status" method="post" onSubmit={(event) => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }} className="panel space-y-5 p-6 sm:p-8">
        <div>
          <label htmlFor="registrationNo" className="label">Nomor pendaftaran</label>
          <input id="registrationNo" name="registrationNo" required autoComplete="off" spellCheck={false} pattern="PPDB-[0-9]{4}-[A-Fa-f0-9]{12}" placeholder="PPDB-2026-A1B2C3D4E5F6" className="field font-mono uppercase" aria-describedby="registrationNo-hint" />
          <span id="registrationNo-hint" className="hint">Tertera pada bukti pendaftaran, diawali PPDB.</span>
        </div>
        <div>
          <label htmlFor="accessCode" className="label">Kode akses</label>
          <input id="accessCode" name="accessCode" required autoComplete="off" spellCheck={false} pattern="[A-Fa-f0-9]{32}" maxLength={32} className="field font-mono uppercase" aria-describedby="accessCode-hint" />
          <span id="accessCode-hint" className="hint">32 karakter huruf dan angka.</span>
        </div>
        {error && <p role="alert" className="rounded-xl bg-clay-50 p-4 font-semibold text-clay-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? "Memeriksa status" : "Cek status"}</button>
      </form>

      {result && info && (
        <section className="panel overflow-hidden" aria-live="polite">
          <div className={`px-6 py-5 ring-1 ring-inset sm:px-8 ${info.tone}`}><p className="font-heading text-2xl font-black">{info.label}</p><p className="mt-1 font-semibold">{info.text}</p></div>
          <dl className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div><dt className="text-sm text-ink-soft">Nama calon siswa</dt><dd className="font-bold">{result.studentName}</dd></div>
            <div><dt className="text-sm text-ink-soft">Tahun ajaran</dt><dd className="font-bold">{result.academicYear}</dd></div>
            <div><dt className="text-sm text-ink-soft">Nomor pendaftaran</dt><dd className="font-mono font-bold">{result.registrationNo}</dd></div>
            <div><dt className="text-sm text-ink-soft">Diperbarui</dt><dd className="font-bold">{new Date(result.updatedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</dd></div>
            {result.adminNote && <div className="rounded-2xl bg-sun-50 p-4 sm:col-span-2"><dt className="text-sm font-bold text-sun-700">Catatan panitia</dt><dd className="mt-1 whitespace-pre-line">{result.adminNote}</dd></div>}
          </dl>
        </section>
      )}
    </div>
  );
}
