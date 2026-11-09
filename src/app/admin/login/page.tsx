import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { BrandMark } from "@/components/brand";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk panel admin", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if ((await auth())?.user) redirect("/admin");
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="lattice relative hidden bg-sky-500 lg:block" aria-hidden="true">
        <div className="absolute inset-x-12 bottom-12 rounded-3xl bg-white/95 p-8">
          <BrandMark className="size-14" />
          <p className="mt-5 font-heading text-3xl font-black leading-tight">Panel pengelola<br />SDIT Al-Ikhlas Serpong</p>
          <p className="mt-3 text-ink-soft">Kelola profil sekolah, berita, galeri, dan pendaftaran siswa baru.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft size={16} />Kembali ke website</Link>
          <BrandMark className="mt-10 size-12 lg:hidden" />
          <h1 className="mt-6 font-heading text-3xl font-black lg:mt-10">Masuk ke panel admin</h1>
          <p className="mb-8 mt-2 text-ink-soft">Gunakan akun yang diberikan oleh pengelola sekolah.</p>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
