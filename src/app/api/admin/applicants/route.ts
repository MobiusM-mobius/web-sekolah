import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export async function GET(request: Request) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const url = new URL(request.url);
  const page = Math.max(1, Math.min(10000, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1));
  const query = url.searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const status = url.searchParams.get("status");
  const validStatuses = ["PENDING", "VERIFIED", "REVISION_REQUIRED", "ACCEPTED", "REJECTED"] as const;
  const where: Prisma.ApplicantWhereInput = {
    ...(query ? { OR: [{ studentName: { contains: query, mode: "insensitive" } }, { registrationNo: { contains: query, mode: "insensitive" } }] } : {}),
    ...(validStatuses.some((value) => value === status) ? { status: status as (typeof validStatuses)[number] } : {}),
  };
  const [items, total] = await Promise.all([
    db.applicant.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20, select: { id: true, registrationNo: true, studentName: true, email: true, status: true, createdAt: true, period: { select: { academicYear: true } } } }),
    db.applicant.count({ where }),
  ]);
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_APPLICANTS", entity: "Applicant", details: { page, query: !!query, status: status ?? null } } });
  return NextResponse.json({ items, total, page, pageSize: 20 });
}
