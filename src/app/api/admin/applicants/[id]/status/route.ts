import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { canTransitionApplicant } from "@/lib/ppdb-state";

const inputSchema = z.object({ status: z.enum(["VERIFIED", "REVISION_REQUIRED", "ACCEPTED", "REJECTED"]), note: z.string().trim().max(2000).optional().default("") });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data perubahan status tidak valid." }, { status: 400 });
  try {
    const updated = await db.$transaction(async (tx) => {
      const current = await tx.applicant.findUnique({ where: { id }, select: { id: true, status: true } });
      if (!current) return null;
      if (!canTransitionApplicant(current.status, parsed.data.status)) throw new Error("STATUS_TRANSITION");
      const changed = await tx.applicant.updateMany({ where: { id, status: current.status }, data: { status: parsed.data.status, adminNote: parsed.data.note || null } });
      if (!changed.count) throw new Error("STATUS_CONFLICT");
      await tx.applicantStatusLog.create({ data: { applicantId: id, fromStatus: current.status, toStatus: parsed.data.status, note: parsed.data.note || null, actorId: user.id } });
      await tx.adminActivityLog.create({ data: { userId: user.id, action: "UPDATE_APPLICANT_STATUS", entity: "Applicant", entityId: id, details: { from: current.status, to: parsed.data.status } } });
      return tx.applicant.findUnique({ where: { id }, select: { id: true, registrationNo: true, status: true, adminNote: true, updatedAt: true } });
    });
    if (!updated) return NextResponse.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "STATUS_TRANSITION") return NextResponse.json({ error: "Perubahan status ini tidak diizinkan." }, { status: 409 });
    if (error instanceof Error && error.message === "STATUS_CONFLICT") return NextResponse.json({ error: "Status pendaftar baru saja berubah. Muat ulang halaman." }, { status: 409 });
    return NextResponse.json({ error: "Status belum dapat diperbarui." }, { status: 500 });
  }
}
