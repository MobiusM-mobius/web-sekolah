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
  return <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><section className="panel divide-y divide-line">{items.map((category) => <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><b>{category.name}</b><p className="mt-1 text-xs text-ink-faint">/{category.slug} · {category._count?.posts ?? 0} berita</p></div><div className="flex gap-2"><button onClick={() => startEdit(category)} className="btn btn-secondary btn-sm">Edit</button><button onClick={() => remove(category)} className="btn btn-danger btn-sm">Hapus</button></div></div>)}{!items.length && <p className="p-7 text-sm text-ink-faint">Belum ada kategori.</p>}</section><form onSubmit={save} className="panel h-fit space-y-4 p-5"><h2 className="font-heading text-xl font-extrabold">{editing ? "Edit kategori" : "Buat kategori"}</h2><label className="block text-sm font-bold">Nama<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="field" /></label><label className="block text-sm font-bold">Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(e) => setSlug(e.target.value)} className="field" /></label>{error && <p role="alert" className="text-sm text-clay-700">{error}</p>}<div className="flex gap-2"><button disabled={busy} className="btn btn-primary flex-1">Simpan</button>{editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setName(""); setSlug(""); }}>Batal</button>}</div></form></div>;
}
