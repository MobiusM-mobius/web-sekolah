import { requireRole } from "@/lib/authorization";
import { AdminSidebar } from "@/components/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "ADMIN_PPDB", "EDITOR"]);
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[264px_1fr]">
      <AdminSidebar user={{ name: user.name ?? user.email ?? "Admin", role: user.role }} />
      <main id="konten" className="min-w-0 px-4 pb-16 pt-6 sm:px-8 lg:pt-10">{children}</main>
    </div>
  );
}
