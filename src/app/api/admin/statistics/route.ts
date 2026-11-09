import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "ADMIN_PPDB", "EDITOR"]);
  const start = new Date();
  start.setMonth(start.getMonth() - 5, 1);
  start.setHours(0, 0, 0, 0);
  const [posts, applicants, pending, accepted, months] = await Promise.all([
    db.post.count(),
    db.applicant.count(),
    db.applicant.count({ where: { status: "PENDING" } }),
    db.applicant.count({ where: { status: "ACCEPTED" } }),
    db.$queryRaw<{ month: Date; count: number }[]>(Prisma.sql`SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::int AS count FROM "Applicant" WHERE "createdAt" >= ${start} GROUP BY 1 ORDER BY 1`),
  ]);
  return NextResponse.json({ posts, applicants, pending, accepted, monthlyRegistrations: months });
}
