import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminSchoolProfile } from "@/components/admin-school-profile";

export const dynamic = "force-dynamic";

export default async function AdminSchoolProfilePage() {
  await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const profile = await db.schoolProfile.findFirst();
  return <main className="min-h-screen bg-[#f6f9fc]"><div className="container-shell py-8"><Link href="/admin" className="text-sm font-bold text-school-blue">← Dashboard</Link><h1 className="mt-5 font-heading text-3xl font-black">Profil & informasi sekolah</h1><p className="mb-6 mt-2 text-sm leading-6 text-slate-600">Lengkapi hanya data resmi yang sudah dikonfirmasi sekolah. Baris daftar diisi satu item per baris; identitas dan tautan sosial menggunakan JSON objek.</p><AdminSchoolProfile profile={profile} /></div></main>;
}
