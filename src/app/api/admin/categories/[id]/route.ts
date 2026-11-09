import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { requireRole } from "@/lib/authorization";
import { categorySchema } from "@/lib/validation/category";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nama dan slug kategori tidak valid." }, { status: 400 });
  try {
    const category = await db.category.update({ where: { id }, data: parsed.data });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "UPDATE_CATEGORY", entity: "Category", entityId: id } });
    return NextResponse.json(category);
  } catch { return NextResponse.json({ error: "Kategori tidak ditemukan atau slug telah digunakan." }, { status: 409 }); }
}

export async function DELETE(_request: Request, { params }: Context) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  try {
    await db.category.delete({ where: { id } });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "DELETE_CATEGORY", entity: "Category", entityId: id } });
    return new Response(null, { status: 204 });
  } catch { return NextResponse.json({ error: "Kategori tidak ditemukan." }, { status: 404 }); }
}
