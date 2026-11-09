"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ImageUp, X } from "lucide-react";

export function ImageUploadField({ value, onChange, label = "Gambar" }: { value: string; onChange: (value: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const id = useId();

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    const data = new FormData(); data.set("file", file);
    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (response.ok) onChange(result.url); else setError(result.error ?? "Gambar gagal diunggah.");
    } catch { setError("Koneksi terputus saat mengunggah."); }
    setBusy(false);
  }

  return (
    <div>
      <span className="label" id={`${id}-label`}>{label}</span>
      <div className="mt-2 flex items-center gap-4 rounded-2xl border border-dashed border-line p-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-paper">
          {value.startsWith("https://") ? <Image src={value} alt="" fill unoptimized sizes="80px" className="object-cover" /> : <span className="grid size-full place-items-center text-ink-faint"><ImageUp size={22} /></span>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <label className="btn btn-secondary btn-sm cursor-pointer">{busy ? "Mengunggah" : value ? "Ganti gambar" : "Unggah gambar"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} className="sr-only" aria-labelledby={`${id}-label`} /></label>
            {value && <button type="button" onClick={() => onChange("")} className="btn btn-danger btn-sm"><X size={14} />Hapus</button>}
          </div>
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="atau tempel URL https://" className="field !mt-0 !py-1.5 text-sm" aria-label={`URL ${label.toLowerCase()}`} />
          <p className="text-xs text-ink-faint">JPG, PNG, atau WebP, maksimal 5 MB.</p>
        </div>
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
}
