import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { isUuid } from "@/lib/ids";
import { postInputSchema } from "@/lib/validation/post";
import { postData } from "@/services/posts";

const notFound = () => NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  const parsed = postInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Periksa judul dan isi berita." }, { status: 400 });
  const existing = await db.post.findUnique({ where: { id }, select: { status: true, publishedAt: true } });
  if (!existing) return notFound();
  try {
    const post = await db.post.update({ where: { id }, data: postData(parsed.data, existing) });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "UPDATE_POST", entity: "Post", entityId: post.id } });
    return NextResponse.json(post);
  } catch { return NextResponse.json({ error: "Slug sudah dipakai berita lain atau kategori tidak valid." }, { status: 409 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const { id } = await params;
  if (!isUuid(id)) return notFound();
  const deleted = await db.post.deleteMany({ where: { id } });
  if (!deleted.count) return notFound();
  await db.adminActivityLog.create({ data: { userId: user.id, action: "DELETE_POST", entity: "Post", entityId: id } });
  return new Response(null, { status: 204 });
}
