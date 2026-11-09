"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { BookOpenText, CalendarDays, ClipboardList, ExternalLink, FileUser, FolderTree, Images, LayoutDashboard, LogOut, Megaphone, Menu, School, ShieldCheck, Trophy, UserRound, X } from "lucide-react";
import { BrandMark } from "@/components/brand";

type Role = "SUPER_ADMIN" | "ADMIN_WEBSITE" | "ADMIN_PPDB" | "EDITOR";
const ALL: Role[] = ["SUPER_ADMIN", "ADMIN_WEBSITE", "ADMIN_PPDB", "EDITOR"];
const CONTENT: Role[] = ["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"];
const WEBSITE: Role[] = ["SUPER_ADMIN", "ADMIN_WEBSITE"];
const PPDB: Role[] = ["SUPER_ADMIN", "ADMIN_PPDB"];

const groups: { title: string; items: { href: string; label: string; icon: typeof LayoutDashboard; roles: Role[] }[] }[] = [
  { title: "Umum", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ALL }] },
  { title: "Konten website", items: [
    { href: "/admin/konten", label: "Profil sekolah", icon: School, roles: WEBSITE },
    { href: "/admin/berita", label: "Berita", icon: BookOpenText, roles: CONTENT },
    { href: "/admin/kategori", label: "Kategori", icon: FolderTree, roles: WEBSITE },
    { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone, roles: CONTENT },
    { href: "/admin/galeri", label: "Galeri", icon: Images, roles: CONTENT },
    { href: "/admin/prestasi", label: "Prestasi", icon: Trophy, roles: CONTENT },
    { href: "/admin/guru", label: "Data guru", icon: UserRound, roles: CONTENT },
    { href: "/admin/agenda", label: "Agenda", icon: CalendarDays, roles: CONTENT },
  ] },
  { title: "PPDB", items: [
    { href: "/admin/ppdb", label: "Pendaftar", icon: FileUser, roles: PPDB },
    { href: "/admin/ppdb/periode", label: "Periode & syarat", icon: ClipboardList, roles: PPDB },
  ] },
  { title: "Sistem", items: [{ href: "/admin/admins", label: "Manajemen admin", icon: ShieldCheck, roles: ["SUPER_ADMIN"] }] },
];

const roleLabel: Record<Role, string> = { SUPER_ADMIN: "Super admin", ADMIN_WEBSITE: "Admin website", ADMIN_PPDB: "Admin PPDB", EDITOR: "Editor" };

export function AdminSidebar({ user }: { user: { name: string; role: Role } }) {
  const pathname = usePathname();
  // Menu state is keyed to the route so navigating closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (value: boolean | ((v: boolean) => boolean)) => setOpenFor((typeof value === "function" ? value(open) : value) ? pathname : null);
  const active = (href: string) => href === "/admin" ? pathname === "/admin" : href === "/admin/ppdb" ? pathname === "/admin/ppdb" || /^\/admin\/ppdb\/(?!periode)/.test(pathname) : pathname.startsWith(href);
  const visible = groups.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(user.role)) })).filter((g) => g.items.length);

  const nav = (
    <nav aria-label="Menu admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {visible.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-xs font-bold text-white/45">{group.title}</p>
          <ul className="mt-2 space-y-0.5">{group.items.map(({ href, label, icon: Icon }) => (
            <li key={href}><Link href={href} aria-current={active(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[.93rem] font-semibold transition-colors ${active(href) ? "bg-white text-night" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={18} className={active(href) ? "text-sky-500" : ""} />{label}</Link></li>
          ))}</ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate font-bold text-white">{user.name}</p>
      <p className="text-sm text-white/55">{roleLabel[user.role]}</p>
      <div className="mt-3 flex gap-2">
        <Link href="/" target="_blank" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"><ExternalLink size={15} />Website</Link>
        <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"><LogOut size={15} />Keluar</button>
      </div>
    </div>
  );

  return <>
    <div className="sticky top-0 z-30 flex items-center justify-between bg-night px-4 py-3 lg:hidden">
      <Link href="/admin" className="flex items-center gap-2 font-heading font-extrabold text-white"><BrandMark className="size-8" />Admin sekolah</Link>
      <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-lg bg-white/10 text-white" aria-label="Buka menu admin" aria-expanded={open}><Menu size={20} /></button>
    </div>

    {open && <div className="fixed inset-0 z-40 bg-night/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-night transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="frieze" />
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex items-center gap-3"><BrandMark className="size-10" /><span className="leading-tight"><span className="block font-heading font-extrabold text-white">SDIT Al-Ikhlas</span><span className="text-sm text-white/55">Panel admin</span></span></Link>
        <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden" aria-label="Tutup menu admin"><X size={20} /></button>
      </div>
      {nav}
      {footer}
    </aside>
  </>;
}
