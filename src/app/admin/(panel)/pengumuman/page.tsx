import { AdminContentPage } from "@/app/admin/(panel)/content-page";
export const dynamic = "force-dynamic";
export default function Page() { return <AdminContentPage resource="announcements" label="Pengumuman" description="Informasi singkat yang tampil di papan pengumuman beranda. Atur tanggal berakhir agar otomatis hilang." />; }
