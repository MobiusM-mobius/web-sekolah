import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminUsers } from "@/components/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireRole(["SUPER_ADMIN"]);
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, active: true, createdAt: true, role: { select: { name: true } } } });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_ADMIN_USERS", entity: "User" } });
  return <main className="min-h-screen bg-[#f6f9fc]"><div className="container-shell py-8"><Link href="/admin" className="text-sm font-bold text-school-blue">← Dashboard</Link><h1 className="mt-5 font-heading text-3xl font-black">Manajemen administrator</h1><p className="mb-6 mt-2 text-sm leading-6 text-slate-600">Role dan status akun diperiksa dari database pada setiap akses admin. Gunakan kata sandi unik minimal 12 karakter.</p><AdminUsers initialUsers={users} /></div></main>;
}
