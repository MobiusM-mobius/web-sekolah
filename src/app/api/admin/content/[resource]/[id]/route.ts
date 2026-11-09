import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { contentSchemas, isContentResource } from "@/lib/validation/content";
import { deleteContent, saveContent } from "@/services/admin-content";

type Context = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const { resource: name, id } = await params;
  if (!isContentResource(name)) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const parsed = contentSchemas[name].safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data konten." }, { status: 400 });
  try {
    const item = await saveContent(name, parsed.data as Record<string, unknown>, id);
    await db.adminActivityLog.create({ data: { userId: user.id, action: `UPDATE_${name.toUpperCase()}`, entity: name, entityId: id } });
    return NextResponse.json(item);
  } catch { return NextResponse.json({ error: "Konten tidak ditemukan atau data unik sudah digunakan." }, { status: 409 }); }
}

export async function DELETE(_request: Request, { params }: Context) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const { resource: name, id } = await params;
  if (!isContentResource(name)) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
  try {
    await deleteContent(name, id);
    await db.adminActivityLog.create({ data: { userId: user.id, action: `DELETE_${name.toUpperCase()}`, entity: name, entityId: id } });
    return new Response(null, { status: 204 });
  } catch { return NextResponse.json({ error: "Konten tidak ditemukan." }, { status: 404 }); }
}
