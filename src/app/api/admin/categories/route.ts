import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { categorySchema } from "@/lib/validation/category";

export async function GET() {
  await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  return NextResponse.json(await db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } }));
}

export async function POST(request: Request) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nama dan slug kategori tidak valid." }, { status: 400 });
  try {
    const category = await db.category.create({ data: parsed.data });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "CREATE_CATEGORY", entity: "Category", entityId: category.id } });
    return NextResponse.json(category, { status: 201 });
  } catch { return NextResponse.json({ error: "Slug kategori sudah digunakan." }, { status: 409 }); }
}
