"use client";

import { useState } from "react";

type User = { id: string; name: string; email: string; active: boolean; role: { name: string }; createdAt?: string | Date };
const roles = ["SUPER_ADMIN", "ADMIN_WEBSITE", "ADMIN_PPDB", "EDITOR"];
const input = "field";

export function AdminUsers({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { setUsers((current) => [...current, data]); form.reset(); setMessage("Akun admin berhasil dibuat."); }
    else setMessage(data.error ?? "Akun belum dapat dibuat.");
    setBusy(false);
  }
  async function update(user: User, values: FormData) {
    const payload = { name: values.get("name"), role: values.get("role"), active: values.get("active") === "on", password: values.get("password") || "" };
    if (!window.confirm(`Simpan perubahan akun ${user.email}?`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (response.ok) { setUsers((current) => current.map((item) => item.id === user.id ? { ...item, ...data } : item)); setMessage(`Perubahan untuk ${user.email} tersimpan.`); }
    else setMessage(data.error ?? "Perubahan akun gagal.");
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><section className="space-y-4">{users.map((user) => <form key={user.id} method="post" onSubmit={(event) => { event.preventDefault(); void update(user, new FormData(event.currentTarget)); }} className="panel grid gap-3 p-5 sm:grid-cols-2"><div className="sm:col-span-2"><p className="font-bold">{user.email}</p><p className="text-xs text-ink-faint">Dibuat {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "—"}</p></div><label className="text-sm font-bold">Nama<input name="name" required defaultValue={user.name} className={input} /></label><label className="text-sm font-bold">Role<select name="role" defaultValue={user.role.name} className={input}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label><label className="text-sm font-bold sm:col-span-2">Kata sandi baru (kosongkan jika tidak diubah)<input name="password" type="password" minLength={12} autoComplete="new-password" className={input} /></label><label className="flex items-center gap-2 text-sm font-bold"><input name="active" type="checkbox" defaultChecked={user.active} /> Akun aktif</label><button type="submit" className="btn btn-secondary btn-sm">Simpan akun</button></form>)}</section><form method="post" onSubmit={create} className="panel h-fit space-y-4 p-5"><h2 className="font-heading text-xl font-extrabold">Tambah admin</h2><label className="block text-sm font-bold">Nama<input name="name" required minLength={2} className={input} /></label><label className="block text-sm font-bold">Email<input name="email" type="email" required className={input} /></label><label className="block text-sm font-bold">Kata sandi awal<input name="password" type="password" required minLength={12} autoComplete="new-password" className={input} /></label><label className="block text-sm font-bold">Role<select name="role" className={input}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>{message && <p role="status" className="text-sm text-ink-soft">{message}</p>}<button disabled={busy} className="btn btn-primary w-full disabled:opacity-50">{busy ? "Menyimpan..." : "Buat akun"}</button></form></div>;
}
