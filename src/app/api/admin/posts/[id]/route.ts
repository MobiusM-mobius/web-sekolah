import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { postInputSchema } from "@/lib/validation/post";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = postInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa judul dan isi berita." }, { status: 400 });
  const slug = parsed.data.slug || parsed.data.title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  try {
    const post = await db.post.update({ where: { id }, data: { ...parsed.data, slug, excerpt: parsed.data.excerpt || null, categoryId: parsed.data.categoryId || null, coverImageUrl: parsed.data.coverImageUrl || null, status: parsed.data.published ? "PUBLISHED" : "DRAFT", publishedAt: parsed.data.published ? new Date() : null } });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "UPDATE_POST", entity: "Post", entityId: post.id } });
    return NextResponse.json(post);
  } catch { return NextResponse.json({ error: "Berita tidak ditemukan atau slug sudah digunakan." }, { status: 409 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const { id } = await params;
  try {
    await db.post.delete({ where: { id } });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "DELETE_POST", entity: "Post", entityId: id } });
    return new Response(null, { status: 204 });
  } catch { return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 }); }
}
