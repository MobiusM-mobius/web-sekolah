import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

function cell(value: string | number | Date | null) {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const applicants = await db.applicant.findMany({ orderBy: { createdAt: "desc" }, include: { period: { select: { academicYear: true } } }, take: 10000 });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "EXPORT_APPLICANTS", entity: "Applicant", details: { rows: applicants.length } } });
  const rows = [["Nomor pendaftaran", "Tahun ajaran", "Nama siswa", "Jenis kelamin", "Tanggal lahir", "Nama ayah", "Nama ibu", "WhatsApp", "Email", "Status", "Tanggal daftar"], ...applicants.map((applicant) => [applicant.registrationNo, applicant.period.academicYear, applicant.studentName, applicant.gender, applicant.birthDate, applicant.fatherName, applicant.motherName, applicant.whatsapp, applicant.email, applicant.status, applicant.createdAt])];
  const csv = `\uFEFF${rows.map((row) => row.map(cell).join(",")).join("\r\n")}`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=ppdb-pendaftar.csv", "Cache-Control": "private, no-store" } });
}
