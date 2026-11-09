"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/image-upload-field";

type Resource = "announcements" | "teachers" | "galleries" | "achievements" | "events";
type Field = { key: string; label: string; type?: "text" | "textarea" | "url" | "date" | "number" | "checkbox" | "lines" | "image"; required?: boolean };
type RecordItem = Record<string, string | number | boolean | string[] | Date | null>;
const definitions: Record<Resource, { title: string; fields: Field[] }> = {
  announcements: { title: "Pengumuman", fields: [{ key: "title", label: "Judul", required: true }, { key: "slug", label: "Slug (opsional)" }, { key: "body", label: "Isi pengumuman", type: "textarea", required: true }, { key: "expiresAt", label: "Berakhir (opsional)", type: "date" }, { key: "published", label: "Publikasikan", type: "checkbox" }] },
  teachers: { title: "Data guru", fields: [{ key: "name", label: "Nama", required: true }, { key: "position", label: "Jabatan" }, { key: "biography", label: "Profil singkat", type: "textarea" }, { key: "photoUrl", label: "Foto", type: "image" }, { key: "sortOrder", label: "Urutan", type: "number" }, { key: "visible", label: "Tampilkan di website", type: "checkbox" }] },
  galleries: { title: "Album galeri", fields: [{ key: "title", label: "Judul album", required: true }, { key: "slug", label: "Slug (opsional)" }, { key: "category", label: "Kategori" }, { key: "description", label: "Keterangan", type: "textarea" }, { key: "coverUrl", label: "Sampul album", type: "image" }, { key: "imageUrls", label: "URL foto tambahan (satu per baris)", type: "lines" }, { key: "visible", label: "Tampilkan di website", type: "checkbox" }] },
  achievements: { title: "Prestasi", fields: [{ key: "title", label: "Prestasi", required: true }, { key: "category", label: "Kategori" }, { key: "achievedAt", label: "Tanggal", type: "date" }, { key: "description", label: "Keterangan", type: "textarea" }, { key: "imageUrl", label: "Foto dokumentasi", type: "image" }, { key: "visible", label: "Tampilkan di website", type: "checkbox" }] },
  events: { title: "Agenda", fields: [{ key: "title", label: "Nama kegiatan", required: true }, { key: "location", label: "Lokasi" }, { key: "startsAt", label: "Mulai", type: "date", required: true }, { key: "endsAt", label: "Selesai (opsional)", type: "date" }, { key: "description", label: "Keterangan", type: "textarea" }, { key: "visible", label: "Tampilkan di website", type: "checkbox" }] },
};
const blankValue = (field: Field) => field.type === "checkbox" ? false : field.type === "number" ? 0 : field.type === "lines" ? [] : "";
const inputClass = "field";

export function AdminContentRecords({ resource, initialItems, total }: { resource: Resource; initialItems: RecordItem[]; total: number }) {
  const config = definitions[resource];
  const [items, setItems] = useState(initialItems);
  const [recordCount, setRecordCount] = useState(total);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Record<string, string | number | boolean | string[]>>(() => Object.fromEntries(config.fields.map((field) => [field.key, blankValue(field)])));
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  function update(key: string, value: string | number | boolean | string[]) { setForm((current) => ({ ...current, [key]: value })); }
  function edit(item: RecordItem) {
    setEditing(String(item.id));
    setForm(Object.fromEntries(config.fields.map((field) => {
      const value = item[field.key];
      if (field.type === "checkbox") return [field.key, Boolean(value)];
      if (field.type === "lines") return [field.key, Array.isArray(value) ? value.join("\n") : ""];
      if (field.type === "date" && value) return [field.key, new Date(value as string | number | Date).toISOString().slice(0, 16)];
      return [field.key, value == null ? blankValue(field) : String(value)];
    })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const payload: Record<string, unknown> = { ...form };
    for (const field of config.fields) {
      if (field.type === "lines") payload[field.key] = String(form[field.key] ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
      if (field.type === "number") payload[field.key] = Number(form[field.key] ?? 0);
      if (field.type === "date" && form[field.key]) payload[field.key] = new Date(String(form[field.key])).toISOString();
    }
    const response = await fetch(editing ? `/api/admin/content/${resource}/${editing}` : `/api/admin/content/${resource}`, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (response.ok) window.location.reload(); else { setMessage(result.error ?? "Data belum dapat disimpan."); setBusy(false); }
  }
  async function remove(item: RecordItem) {
    const label = String(item.title ?? item.name ?? "konten ini");
    if (!window.confirm(`Hapus “${label}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    const response = await fetch(`/api/admin/content/${resource}/${String(item.id)}`, { method: "DELETE" });
    if (response.ok) { setItems((current) => current.filter((entry) => entry.id !== item.id)); setRecordCount((count) => count - 1); } else setMessage("Konten belum dapat dihapus.");
  }
  async function loadPage(nextPage: number, nextQuery = query) {
    const response = await fetch(`/api/admin/content/${resource}?page=${nextPage}&q=${encodeURIComponent(nextQuery)}`);
    const result = await response.json().catch(() => ({}));
    if (response.ok) { setItems(result.items ?? []); setRecordCount(result.total ?? 0); setPage(nextPage); }
  }
  async function search(event: React.FormEvent) {
    event.preventDefault();
    await loadPage(1, query);
  }
  function itemLabel(item: RecordItem) { return String(item.title ?? item.name ?? ""); }
  return <div className="grid gap-6 lg:grid-cols-[1fr_380px]"><section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5"><h2 className="font-heading text-xl font-extrabold">Daftar {config.title.toLowerCase()} <span className="text-sm font-normal text-ink-faint">({recordCount})</span></h2><form onSubmit={search} className="flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari..." className="field !mt-0 min-w-0" /><button type="submit" className="btn btn-secondary btn-sm">Cari</button></form></div>{items.length ? <ul className="divide-y divide-line">{items.map((item) => <li key={String(item.id)} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-bold">{itemLabel(item)}</p><p className="mt-1 text-xs text-ink-faint">{String(item.status ?? (item.visible ? "Tampil" : "Draft"))}</p></div><div className="flex gap-2"><button onClick={() => edit(item)} className="btn btn-secondary btn-sm">Edit</button><button onClick={() => remove(item)} className="btn btn-danger btn-sm">Hapus</button></div></li>)}</ul> : <p className="p-8 text-center text-sm text-ink-faint">Belum ada konten.</p>}{recordCount > 20 && <nav className="flex items-center justify-center gap-3 border-t border-line p-4" aria-label="Pagination"><button disabled={page <= 1} onClick={() => loadPage(page - 1)} className="btn btn-secondary disabled:opacity-40">Sebelumnya</button><span className="text-xs text-ink-faint">Halaman {page} dari {Math.ceil(recordCount / 20)}</span><button disabled={page >= Math.ceil(recordCount / 20)} onClick={() => loadPage(page + 1)} className="btn btn-secondary disabled:opacity-40">Berikutnya</button></nav>}</section><form onSubmit={save} className="panel h-fit space-y-4 p-5"><h2 className="font-heading text-xl font-extrabold">{editing ? "Edit" : "Tambah"} {config.title.toLowerCase()}</h2>{config.fields.map((field) => <div key={field.key}>{field.type === "checkbox" ? <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={Boolean(form[field.key])} onChange={(e) => update(field.key, e.target.checked)} />{field.label}</label> : field.type === "image" ? <ImageUploadField label={field.label} value={String(form[field.key] ?? "")} onChange={(value) => update(field.key, value)} /> : <label className="block text-sm font-bold">{field.label}{field.type === "textarea" || field.type === "lines" ? <textarea required={field.required} rows={field.type === "lines" ? 4 : 3} value={Array.isArray(form[field.key]) ? (form[field.key] as string[]).join("\n") : String(form[field.key] ?? "")} onChange={(e) => update(field.key, e.target.value)} className={inputClass} /> : <input required={field.required} type={field.type === "date" ? "datetime-local" : field.type === "number" ? "number" : field.type === "url" ? "url" : "text"} value={String(form[field.key] ?? "")} onChange={(e) => update(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)} className={inputClass} />}</label>}</div>)}{message && <p role="alert" className="text-sm text-clay-700">{message}</p>}<div className="flex gap-2"><button disabled={busy} className="btn btn-primary flex-1 disabled:opacity-50">{busy ? "Menyimpan..." : "Simpan"}</button>{editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(Object.fromEntries(config.fields.map((field) => [field.key, blankValue(field)]))); }}>Batal</button>}</div></form></div>;
}
