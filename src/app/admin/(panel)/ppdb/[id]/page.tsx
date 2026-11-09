import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { ApplicantStatusEditor } from "@/components/applicant-status-editor";
import { AdminPageHeader, StatusBadge, statusLabels } from "@/components/admin-ui";
import { whatsappHref } from "@/lib/school";

function Section({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="panel p-6">
      <h2 className="font-heading text-lg font-extrabold">{title}</h2>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className={label.startsWith("Alamat") ? "sm:col-span-2" : ""}><dt className="text-sm text-ink-soft">{label}</dt><dd className="whitespace-pre-line font-semibold">{value}</dd></div>)}</dl>
    </section>
  );
}

export default async function ApplicantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const { id } = await params;
  const applicant = await db.applicant.findUnique({ where: { id }, include: { period: true, documents: { orderBy: { createdAt: "asc" } }, statusLogs: { orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } } } }).catch(() => null);
  if (!applicant) notFound();
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_APPLICANT_DETAIL", entity: "Applicant", entityId: id } });

  const student = [
    ["Nama lengkap", applicant.studentName], ["Jenis kelamin", applicant.gender === "MALE" ? "Laki-laki" : "Perempuan"],
    ["Tempat, tanggal lahir", `${applicant.birthPlace}, ${applicant.birthDate.toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "UTC" })}`],
    ["Asal TK/RA", applicant.previousSchool || "Tidak diisi"], ["Alamat", applicant.address],
  ];
  const parents = [
    ["Nama ayah", applicant.fatherName], ["Nama ibu", applicant.motherName], ["Nama wali", applicant.guardianName || "Tidak diisi"],
    ["WhatsApp", applicant.whatsapp], ["Email", applicant.email], ["Alamat orang tua", applicant.parentAddress],
  ];
  const wa = whatsappHref(applicant.whatsapp, `Assalamu'alaikum, kami panitia PPDB SDIT Al-Ikhlas Serpong terkait pendaftaran ${applicant.registrationNo}.`);

  return <>
    <AdminPageHeader back={{ href: "/admin/ppdb", label: "Daftar pendaftar" }} title={applicant.studentName}
      description={<><span className="font-mono">{applicant.registrationNo}</span>, tahun ajaran {applicant.period.academicYear}, mendaftar {applicant.createdAt.toLocaleDateString("id-ID", { dateStyle: "long" })}</>}
      actions={wa ? <a href={wa} target="_blank" rel="noreferrer" className="btn btn-green">Hubungi orang tua via WhatsApp</a> : undefined} />

    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Section title="Data calon siswa" rows={student} />
        <Section title="Data orang tua atau wali" rows={parents} />
        <section className="panel p-6">
          <h2 className="font-heading text-lg font-extrabold">Dokumen</h2>
          {applicant.documents.length ? <ul className="mt-4 divide-y divide-line">{applicant.documents.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700"><FileText size={19} /></span><div><p className="font-bold">{doc.label}</p><p className="text-sm text-ink-faint">{doc.originalName}, {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB</p></div></div>
              <a href={`/api/admin/documents/${doc.id}`} className="btn btn-secondary btn-sm"><Download size={15} />Unduh</a>
            </li>
          ))}</ul> : <p className="mt-3 text-ink-soft">Tidak ada dokumen terunggah.</p>}
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <section className="panel p-6">
          <p className="text-sm text-ink-soft">Status saat ini</p>
          <div className="mt-2"><StatusBadge status={applicant.status} /></div>
          {applicant.adminNote && <p className="mt-4 rounded-xl bg-sun-50 p-3 text-sm"><span className="font-bold">Catatan untuk orang tua: </span>{applicant.adminNote}</p>}
          <div className="mt-5 border-t border-line pt-5"><ApplicantStatusEditor id={applicant.id} status={applicant.status} note={applicant.adminNote} /></div>
        </section>
        <section className="panel p-6">
          <h2 className="font-heading text-lg font-extrabold">Riwayat status</h2>
          <ol className="mt-4 space-y-4 border-l-2 border-line pl-5">{applicant.statusLogs.map((log) => (
            <li key={log.id} className="relative"><span className="absolute -left-[27px] top-1.5 size-3 rounded-full bg-sky-500 ring-4 ring-white" />
              <p className="font-bold">{statusLabels[log.toStatus] ?? log.toStatus}</p>
              <p className="text-sm text-ink-faint">{log.createdAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}, {log.actor?.name ?? "Sistem"}</p>
              {log.note && <p className="mt-1 text-sm text-ink-soft">{log.note}</p>}
            </li>
          ))}</ol>
        </section>
      </aside>
    </div>
  </>;
}
