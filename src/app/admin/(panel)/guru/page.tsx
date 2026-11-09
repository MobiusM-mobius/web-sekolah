import { AdminContentPage } from "@/app/admin/(panel)/content-page";
export const dynamic = "force-dynamic";
export default function Page() { return <AdminContentPage resource="teachers" label="Data guru" description="Guru dan tenaga pendidik yang ditampilkan di halaman profil. Atur urutan tampil dengan angka." />; }
