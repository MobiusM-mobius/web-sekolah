import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function AdminPageHeader({ title, description, back, actions }: { title: string; description?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><ChevronLeft size={16} />{back.label}</Link>}
        <h1 className="font-heading text-3xl font-black">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-sun-50 text-sun-700", VERIFIED: "bg-sky-50 text-sky-700", REVISION_REQUIRED: "bg-clay-50 text-clay-700",
  ACCEPTED: "bg-leaf-50 text-leaf-700", REJECTED: "bg-paper text-ink-soft ring-1 ring-line",
  PUBLISHED: "bg-leaf-50 text-leaf-700", DRAFT: "bg-paper text-ink-soft ring-1 ring-line", ARCHIVED: "bg-paper text-ink-faint ring-1 ring-line",
};
export const statusLabels: Record<string, string> = {
  PENDING: "Menunggu verifikasi", VERIFIED: "Terverifikasi", REVISION_REQUIRED: "Perlu revisi", ACCEPTED: "Diterima", REJECTED: "Ditolak",
  PUBLISHED: "Terbit", DRAFT: "Draf", ARCHIVED: "Arsip",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[status] ?? "bg-paper text-ink-soft"}`}>{statusLabels[status] ?? status}</span>;
}
