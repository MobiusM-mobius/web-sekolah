import type { Metadata } from "next";
import Link from "next/link";
import { PpdbStatusForm } from "@/components/ppdb-status-form";

export const metadata: Metadata = { title: "Cek Status PPDB", robots: { index: false, follow: false } };

export default function PpdbStatusPage() {
  return <div className="container-shell section-space max-w-2xl"><Link href="/ppdb" className="text-sm font-bold text-school-blue">← Kembali ke PPDB</Link><span className="eyebrow mt-7 block">Informasi pendaftaran</span><h1 className="mt-3 font-heading text-4xl font-black">Cek status PPDB</h1><p className="mb-7 mt-3 leading-7 text-slate-600">Gunakan nomor pendaftaran dan kode akses yang diberikan setelah formulir berhasil dikirim. Jangan bagikan kode akses kepada orang lain.</p><PpdbStatusForm /></div>;
}
