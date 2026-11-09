import { AdminContentPage } from "@/app/admin/(panel)/content-page";
export const dynamic = "force-dynamic";
export default function Page() { return <AdminContentPage resource="events" label="Agenda" description="Kegiatan dan kalender akademik yang tampil di halaman akademik." />; }
