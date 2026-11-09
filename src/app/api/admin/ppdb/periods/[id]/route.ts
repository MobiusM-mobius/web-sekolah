import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { requireRole } from "@/lib/authorization";
import { periodInputSchema } from "@/lib/validation/period";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const parsed = periodInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data periode dan persyaratan." }, { status: 400 });
  try {
    const period = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(80421, 2)::text AS locked`;
      if (parsed.data.active) await tx.ppdbPeriod.updateMany({ where: { active: true, id: { not: id } }, data: { active: false } });
      await tx.ppdbRequirement.deleteMany({ where: { periodId: id } });
      const updated = await tx.ppdbPeriod.update({ where: { id }, data: { academicYear: parsed.data.academicYear, title: parsed.data.title, description: parsed.data.description || null, opensAt: new Date(parsed.data.opensAt), closesAt: new Date(parsed.data.closesAt), quota: parsed.data.quota, feeInformation: parsed.data.feeInformation || null, faqs: parsed.data.faqs, active: parsed.data.active, requirements: { create: parsed.data.requirements.map((item, sortOrder) => ({ ...item, description: item.description || null, sortOrder })) } }, include: { requirements: true } });
      await tx.adminActivityLog.create({ data: { userId: user.id, action: "UPDATE_PPDB_PERIOD", entity: "PpdbPeriod", entityId: updated.id } });
      return updated;
    });
    return NextResponse.json(period);
  } catch { return NextResponse.json({ error: "Periode tidak ditemukan atau tahun ajaran sudah digunakan." }, { status: 409 }); }
}
