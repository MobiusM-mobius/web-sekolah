"use client";

import { useState } from "react";

export function ApplicantStatusEditor({ id, status, note }: { id: string; status: string; note: string | null }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(form: FormData) {
    if (!window.confirm("Simpan perubahan status pendaftar?")) return;
    setBusy(true); setMessage("");
    const response = await fetch(`/api/admin/applicants/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: form.get("status"), note: form.get("note") }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) window.location.reload(); else { setMessage(data.error ?? "Perubahan belum tersimpan."); setBusy(false); }
  }
  const available = status === "PENDING" ? ["VERIFIED", "REVISION_REQUIRED", "REJECTED"] : status === "VERIFIED" ? ["ACCEPTED", "REVISION_REQUIRED", "REJECTED"] : status === "REVISION_REQUIRED" ? ["VERIFIED", "REJECTED"] : [];
  return <form onSubmit={(event) => { event.preventDefault(); void save(new FormData(event.currentTarget)); }} className="space-y-4"><label className="block text-sm font-bold">Ubah status<select name="status" required disabled={!available.length} className="field">{available.length ? available.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>) : <option value="">Status terminal</option>}</select></label><label className="block text-sm font-bold">Catatan untuk orang tua<textarea name="note" defaultValue={note ?? ""} maxLength={2000} rows={4} className="field" /></label>{message && <p role="alert" className="text-sm text-clay-700">{message}</p>}<button disabled={busy || !available.length} className="btn btn-primary disabled:opacity-50">Simpan status</button></form>;
}
