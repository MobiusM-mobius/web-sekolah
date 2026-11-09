import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { postInputSchema } from "@/lib/validation/post";
import { postData } from "@/services/posts";

export async function GET(request: Request) {
  await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const url = new URL(request.url);
  const page = Math.max(1, Math.min(10000, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1));
  const q = url.searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const [items, total] = await Promise.all([db.post.findMany({ where: q ? { title: { contains: q, mode: "insensitive" } } : {}, orderBy: { updatedAt: "desc" }, skip: (page - 1) * 20, take: 20, include: { category: true, author: { select: { name: true } } } }), db.post.count({ where: q ? { title: { contains: q, mode: "insensitive" } } : {} })]);
  return NextResponse.json({ items, total, page, pageSize: 20 });
}

export async function POST(request: Request) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  const body = await request.json().catch(() => null);
  const parsed = postInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa judul dan isi berita." }, { status: 400 });
  try {
    const post = await db.post.create({ data: { ...postData(parsed.data), authorId: user.id } });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "CREATE_POST", entity: "Post", entityId: post.id } });
    return NextResponse.json(post, { status: 201 });
  } catch { return NextResponse.json({ error: "Slug berita sudah digunakan atau kategori tidak valid." }, { status: 409 }); }
}
