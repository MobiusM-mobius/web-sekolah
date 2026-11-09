"use client";

import { useState } from "react";
import { statusLookupSchema } from "@/lib/validation/ppdb";

type Result = { registrationNo: string; studentName: string; academicYear: string; status: string; adminNote: string | null; updatedAt: string };
const statusLabels: Record<string, string> = { PENDING: "Menunggu verifikasi", VERIFIED: "Terverifikasi", REVISION_REQUIRED: "Perlu revisi", ACCEPTED: "Diterima", REJECTED: "Tidak diterima" };

export function PpdbStatusForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(form: FormData) {
    setError(""); setResult(null); setLoading(true);
    const values = { registrationNo: String(form.get("registrationNo") ?? ""), accessCode: String(form.get("accessCode") ?? "") };
    const parsed = statusLookupSchema.safeParse(values);
    if (!parsed.success) { setError("Masukkan nomor pendaftaran dan kode akses yang valid."); setLoading(false); return; }
    try {
      const response = await fetch("/api/ppdb/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await response.json();
      if (!response.ok) setError(data.error ?? "Status belum dapat diperiksa."); else setResult(data as Result);
    } catch { setError("Koneksi terganggu. Coba kembali."); }
    setLoading(false);
  }
  return <div className="space-y-5"><form action="/api/ppdb/status" method="post" onSubmit={(event) => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }} className="soft-card space-y-4 p-6"><label className="block text-sm font-bold">Nomor pendaftaran<input name="registrationNo" required pattern="PPDB-[0-9]{4}-[A-Fa-f0-9]{12}" title="Gunakan format PPDB-YYYY-12 digit heksadesimal." placeholder="PPDB-2026-A1B2C3D4E5F6" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-school-blue" /></label><label className="block text-sm font-bold">Kode akses<input name="accessCode" required pattern="[A-Fa-f0-9]{32}" maxLength={32} title="Kode akses terdiri dari 32 digit heksadesimal." autoComplete="off" placeholder="Kode akses 32 karakter" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-school-blue" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? "Memeriksa..." : "Cek status"}</button></form>{result && <section className="soft-card p-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{result.registrationNo} · Tahun ajaran {result.academicYear}</p><h2 className="mt-2 font-heading text-2xl font-black">{result.studentName}</h2><p className="mt-4 text-sm font-bold text-school-blue">Status: {statusLabels[result.status] ?? result.status}</p>{result.adminNote && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6"><b>Catatan panitia</b><p className="mt-1">{result.adminNote}</p></div>}<p className="mt-4 text-xs text-slate-500">Pembaruan terakhir: {new Date(result.updatedAt).toLocaleString("id-ID")}</p></section>}</div>;
}
