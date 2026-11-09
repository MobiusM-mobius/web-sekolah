import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { requireRole } from "@/lib/authorization";
import { updateAdminUserSchema } from "@/lib/validation/admin-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const parsed = updateAdminUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data akun tidak valid." }, { status: 400 });
  try {
    const user = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(80421, 1)::text AS locked`;
      const current = await tx.user.findUnique({ where: { id }, include: { role: true } });
      if (!current) throw new Error("USER_NOT_FOUND");
      const removesSuperAdmin = current.role.name === "SUPER_ADMIN" && (!parsed.data.active || parsed.data.role !== "SUPER_ADMIN");
      if (removesSuperAdmin) {
        const activeSuperAdmins = await tx.user.count({ where: { active: true, role: { name: "SUPER_ADMIN" } } });
        if (activeSuperAdmins <= 1) throw new Error("LAST_SUPER_ADMIN");
      }
      const role = await tx.role.findUniqueOrThrow({ where: { name: parsed.data.role } });
      const updated = await tx.user.update({ where: { id }, data: { name: parsed.data.name, active: parsed.data.active, roleId: role.id, ...(parsed.data.password ? { passwordHash: await hash(parsed.data.password, 12) } : {}) }, select: { id: true, name: true, email: true, active: true, role: { select: { name: true } } } });
      await tx.adminActivityLog.create({ data: { userId: actor.id, action: "UPDATE_ADMIN_USER", entity: "User", entityId: id, details: { role: updated.role.name, active: updated.active, passwordChanged: !!parsed.data.password } } });
      return updated;
    }, { isolationLevel: "Serializable" });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    if (error instanceof Error && error.message === "LAST_SUPER_ADMIN") return NextResponse.json({ error: "Setidaknya satu SUPER_ADMIN aktif harus dipertahankan." }, { status: 409 });
    return NextResponse.json({ error: "Perubahan akun gagal. Pastikan tidak ada sesi administrasi yang berubah bersamaan." }, { status: 409 });
  }
}
