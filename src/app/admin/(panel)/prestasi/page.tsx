import { AdminContentPage } from "@/app/admin/(panel)/content-page";
export const dynamic = "force-dynamic";
export default function Page() { return <AdminContentPage resource="achievements" label="Prestasi" description="Catat prestasi siswa beserta foto dokumentasi." />; }
