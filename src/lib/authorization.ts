import "server-only";
import { redirect } from "next/navigation";
import type { AppRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const permissions: Record<AppRole, AppRole[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ADMIN_WEBSITE", "ADMIN_PPDB", "EDITOR"],
  ADMIN_WEBSITE: ["ADMIN_WEBSITE", "EDITOR"],
  ADMIN_PPDB: ["ADMIN_PPDB"],
  EDITOR: ["EDITOR"],
};

export async function requireRole(allowed: AppRole[]) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const currentUser = await db.user.findUnique({ where: { id: session.user.id }, select: { active: true, name: true, email: true, role: { select: { name: true } } } });
  if (!currentUser?.active) redirect("/admin/login");
  const role = currentUser.role.name;
  if (!allowed.some((requiredRole) => permissions[role]?.includes(requiredRole))) {
    redirect("/admin?error=forbidden");
  }
  return { ...session.user, name: currentUser.name, email: currentUser.email, role };
}
