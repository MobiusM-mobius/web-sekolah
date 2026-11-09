import { AdminContentPage } from "@/app/admin/(panel)/content-page";
export const dynamic = "force-dynamic";
export default function Page() { return <AdminContentPage resource="galleries" label="Galeri" description="Album foto kegiatan. Album yang disembunyikan tidak tampil di website." />; }
