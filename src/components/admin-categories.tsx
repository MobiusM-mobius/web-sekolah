"use client";

import { useState } from "react";

type Category = { id: string; name: string; slug: string; _count?: { posts: number } };

export function AdminCategories({ initialCategories }: { initialCategories: Category[] }) {
  const [items, setItems] = useState(initialCategories);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function startEdit(category: Category) { setEditing(category.id); setName(category.name); setSlug(category.slug); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const response = await fetch(editing ? `/api/admin/categories/${editing}` : "/api/admin/categories", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug }) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) window.location.reload(); else { setError(data.error ?? "Kategori gagal disimpan."); setBusy(false); }
  }
  async function remove(category: Category) {
    if (!window.confirm(`Hapus kategori “${category.name}”? Berita yang memakai kategori ini akan tetap ada.`)) return;
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== category.id)); else setError("Kategori belum dapat dihapus.");
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><section className="soft-card divide-y divide-slate-100">{items.map((category) => <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><b>{category.name}</b><p className="mt-1 text-xs text-slate-500">/{category.slug} · {category._count?.posts ?? 0} berita</p></div><div className="flex gap-2"><button onClick={() => startEdit(category)} className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-school-blue">Edit</button><button onClick={() => remove(category)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Hapus</button></div></div>)}{!items.length && <p className="p-7 text-sm text-slate-500">Belum ada kategori.</p>}</section><form onSubmit={save} className="soft-card h-fit space-y-4 p-5"><h2 className="font-heading text-xl font-extrabold">{editing ? "Edit kategori" : "Buat kategori"}</h2><label className="block text-sm font-bold">Nama<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="block text-sm font-bold">Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex gap-2"><button disabled={busy} className="btn-primary flex-1">Simpan</button>{editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setName(""); setSlug(""); }}>Batal</button>}</div></form></div>;
}
