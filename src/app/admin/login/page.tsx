import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Login admin", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if ((await auth())?.user) redirect("/admin");
  return <main className="grid min-h-screen place-items-center bg-[#f2f8fc] px-5 py-12"><section className="soft-card w-full max-w-md p-8"><Link href="/" className="text-sm font-bold text-school-blue">← Kembali ke website</Link><span className="eyebrow mt-8 block">Area terbatas</span><h1 className="mt-2 font-heading text-3xl font-black">Login administrator</h1><p className="mb-7 mt-2 text-sm leading-6 text-slate-600">Masuk dengan akun admin yang dibuat oleh pengelola sekolah.</p><AdminLoginForm /></section></main>;
}
