import type { Metadata } from "next";
import { PageIntro } from "@/components/brand";
import { PpdbStatusForm } from "@/components/ppdb-status-form";

export const metadata: Metadata = { title: "Cek Status PPDB", robots: { index: false, follow: false } };

export default function PpdbStatusPage() {
  return <>
    <PageIntro tone="sun" kicker="PPDB" title={<>Cek status <span className="mark">pendaftaran</span></>} intro="Masukkan nomor pendaftaran dan kode akses dari bukti pendaftaran. Jangan bagikan kode akses kepada orang lain." />
    <div className="wrap max-w-2xl py-12"><PpdbStatusForm /></div>
  </>;
}
