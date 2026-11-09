import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { AdminSchoolProfile } from "@/components/admin-school-profile";
import { AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminSchoolProfilePage() {
  await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const profile = await db.schoolProfile.findFirst();
  return <>
    <AdminPageHeader title="Profil sekolah" description="Isi hanya informasi resmi yang sudah dikonfirmasi sekolah. Bagian yang kosong tampil sebagai &ldquo;sedang dilengkapi&rdquo; di website." />
    <AdminSchoolProfile profile={profile} />
  </>;
}
