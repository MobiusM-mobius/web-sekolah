import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { periodInputSchema } from "@/lib/validation/period";

export async function GET() {
  await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  return NextResponse.json(await db.ppdbPeriod.findMany({ orderBy: { opensAt: "desc" }, include: { requirements: { orderBy: { sortOrder: "asc" } }, _count: { select: { applicants: true } } } }));
}

export async function POST(request: Request) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const body = await request.json().catch(() => null);
  const parsed = periodInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data periode dan persyaratan." }, { status: 400 });
  try {
    const period = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(80421, 2)`;
      if (parsed.data.active) await tx.ppdbPeriod.updateMany({ where: { active: true }, data: { active: false } });
      const created = await tx.ppdbPeriod.create({ data: { academicYear: parsed.data.academicYear, title: parsed.data.title, description: parsed.data.description || null, opensAt: new Date(parsed.data.opensAt), closesAt: new Date(parsed.data.closesAt), quota: parsed.data.quota, feeInformation: parsed.data.feeInformation || null, faqs: parsed.data.faqs, active: parsed.data.active, requirements: { create: parsed.data.requirements.map((item, sortOrder) => ({ ...item, description: item.description || null, sortOrder })) } }, include: { requirements: true } });
      await tx.adminActivityLog.create({ data: { userId: user.id, action: "CREATE_PPDB_PERIOD", entity: "PpdbPeriod", entityId: created.id } });
      return created;
    });
    return NextResponse.json(period, { status: 201 });
  } catch { return NextResponse.json({ error: "Tahun ajaran tersebut sudah ada." }, { status: 409 }); }
}
