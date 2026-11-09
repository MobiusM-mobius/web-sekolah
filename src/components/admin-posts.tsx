"use client";

import { useMemo, useState } from "react";
import { ImageUploadField } from "@/components/image-upload-field";

type Category = { id: string; name: string };
type Post = { id: string; title: string; slug: string; excerpt: string | null; content: string; coverImageUrl: string | null; status: string; categoryId: string | null; publishedAt: string | Date | null; updatedAt: string | Date; category: Category | null };
type Input = { title: string; slug: string; excerpt: string; content: string; coverImageUrl: string; categoryId: string; published: boolean };
const empty: Input = { title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", categoryId: "", published: false };

export function AdminPosts({ initialPosts, categories, total }: { initialPosts: Post[]; categories: Category[]; total: number }) {
  const [posts, setPosts] = useState(initialPosts);
  const [form, setForm] = useState<Input>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const filtered = useMemo(() => posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase())), [posts, query]);
  function edit(post: Post) { setEditing(post.id); setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt ?? "", content: post.content, coverImageUrl: post.coverImageUrl ?? "", categoryId: post.categoryId ?? "", published: post.status === "PUBLISHED" }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch(editing ? `/api/admin/posts/${editing}` : "/api/admin/posts", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error ?? "Berita belum dapat disimpan."); else { setMessage(editing ? "Perubahan berita tersimpan." : "Berita berhasil dibuat."); window.location.reload(); }
    setBusy(false);
  }
  async function remove(post: Post) {
    if (!window.confirm(`Hapus berita “${post.title}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (response.ok) setPosts((items) => items.filter((item) => item.id !== post.id)); else setMessage("Berita belum dapat dihapus.");
  }
  function update(key: keyof Input, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })); }
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]"><section className="soft-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><h2 className="font-heading text-xl font-extrabold">Daftar berita <span className="text-sm font-normal text-slate-500">({total})</span></h2><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari judul..." className="rounded-xl border border-slate-200 px-3 py-2 text-sm" /></div>{filtered.length ? <ul className="divide-y divide-slate-100">{filtered.map((post) => <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-bold">{post.title}</p><p className="mt-1 text-xs text-slate-500">{post.category?.name ?? "Tanpa kategori"} · {post.status} · {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("id-ID") : ""}</p></div><div className="flex gap-2"><button onClick={() => edit(post)} className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-school-blue">Edit</button><button onClick={() => remove(post)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Hapus</button></div></li>)}</ul> : <p className="p-8 text-center text-sm text-slate-500">Belum ada berita yang cocok.</p>}</section><form onSubmit={save} className="soft-card h-fit space-y-4 p-5"><h2 className="font-heading text-xl font-extrabold">{editing ? "Edit berita" : "Buat berita"}</h2><label className="block text-sm font-bold">Judul<input required minLength={3} maxLength={180} value={form.title} onChange={(e) => update("title", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="block text-sm font-bold">Slug (opsional)<input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="dibuat-otomatis-dari-judul" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="block text-sm font-bold">Kategori<select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal"><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><ImageUploadField value={form.coverImageUrl} onChange={(value) => update("coverImageUrl", value)} /><label className="block text-sm font-bold">Ringkasan<textarea rows={2} maxLength={500} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="block text-sm font-bold">Isi berita<textarea required minLength={10} rows={7} value={form.content} onChange={(e) => update("content", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} /> Publikasikan berita</label>{message && <p role="status" className="text-sm text-slate-600">{message}</p>}<div className="flex gap-2"><button disabled={busy} className="btn-primary flex-1 disabled:opacity-50">{busy ? "Menyimpan..." : editing ? "Simpan perubahan" : "Buat berita"}</button>{editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm(empty); }}>Batal</button>}</div></form></div>;
}
