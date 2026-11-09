import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { contentSchemas, isContentResource } from "@/lib/validation/content";
import { listContent, saveContent } from "@/services/admin-content";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, { params }: Context) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const { resource: name } = await params;
  if (!isContentResource(name)) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
  const url = new URL(request.url);
  const page = Math.max(1, Math.min(10000, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1));
  const query = url.searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const result = await listContent(name, query, page);
  await db.adminActivityLog.create({ data: { userId: user.id, action: `VIEW_${name.toUpperCase()}`, entity: name, details: { page, filtered: !!query } } });
  return NextResponse.json({ ...result, page, pageSize: 20 });
}

export async function POST(request: Request, { params }: Context) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const { resource: name } = await params;
  if (!isContentResource(name)) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const parsed = contentSchemas[name].safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data konten." }, { status: 400 });
  try {
    const item = await saveContent(name, parsed.data as Record<string, unknown>);
    await db.adminActivityLog.create({ data: { userId: user.id, action: `CREATE_${name.toUpperCase()}`, entity: name, entityId: "id" in item ? String(item.id) : undefined } });
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: "Konten gagal dibuat. Periksa slug dan data yang unik." }, { status: 409 }); }
}
