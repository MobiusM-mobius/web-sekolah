"use client";

import { useState } from "react";

export function ImageUploadField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    const data = new FormData(); data.set("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body: data });
    const result = await response.json().catch(() => ({}));
    if (response.ok) onChange(result.url); else setError(result.error ?? "Unggah gagal.");
    setBusy(false);
  }
  return <div><label className="block text-sm font-bold">URL gambar utama<input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Unggah foto atau masukkan URL" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-school-blue">{busy ? "Mengunggah..." : "Pilih dan unggah gambar"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} className="sr-only" /></label>{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>;
}
