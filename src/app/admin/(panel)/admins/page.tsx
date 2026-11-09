import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminUsers } from "@/components/admin-users";
import { AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireRole(["SUPER_ADMIN"]);
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, active: true, createdAt: true, role: { select: { name: true } } } });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_ADMIN_USERS", entity: "User" } });
  return <>
    <AdminPageHeader title="Manajemen admin" description="Tambah petugas, atur peran, nonaktifkan akun, atau setel ulang kata sandi. Gunakan kata sandi unik minimal 12 karakter." />
    <AdminUsers initialUsers={users} />
  </>;
}
