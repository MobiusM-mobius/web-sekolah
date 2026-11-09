import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { createAdminUserSchema } from "@/lib/validation/admin-user";

export async function GET() {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, active: true, createdAt: true, role: { select: { name: true } } } });
  await db.adminActivityLog.create({ data: { userId: actor.id, action: "VIEW_ADMIN_USERS", entity: "User" } });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const body = await request.json().catch(() => null);
  const parsed = createAdminUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa nama, email, role, dan kata sandi minimal 12 karakter." }, { status: 400 });
  const role = await db.role.findUnique({ where: { name: parsed.data.role } });
  if (!role) return NextResponse.json({ error: "Role belum tersedia. Jalankan seed terlebih dahulu." }, { status: 503 });
  try {
    const user = await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hash(parsed.data.password, 12), roleId: role.id }, select: { id: true, name: true, email: true, active: true, role: { select: { name: true } } } });
    await db.adminActivityLog.create({ data: { userId: actor.id, action: "CREATE_ADMIN_USER", entity: "User", entityId: user.id, details: { role: user.role.name } } });
    return NextResponse.json(user, { status: 201 });
  } catch { return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 }); }
}
