import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { statusLookupSchema } from "@/lib/validation/ppdb";

const statusLabel: Record<string, string> = { PENDING: "Menunggu verifikasi", VERIFIED: "Terverifikasi", REVISION_REQUIRED: "Perlu revisi", ACCEPTED: "Diterima", REJECTED: "Tidak diterima" };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

function formResponse(message: string, result?: { registrationNo: string; studentName: string; academicYear: string; status: string; adminNote: string | null; updatedAt: Date }, status = 200) {
  const detail = result ? `<p><strong>Nomor pendaftaran:</strong> ${escapeHtml(result.registrationNo)}</p><p><strong>Nama:</strong> ${escapeHtml(result.studentName)}</p><p><strong>Tahun ajaran:</strong> ${escapeHtml(result.academicYear)}</p><p><strong>Status:</strong> ${escapeHtml(statusLabel[result.status] ?? result.status)}</p>${result.adminNote ? `<p><strong>Catatan panitia:</strong> ${escapeHtml(result.adminNote)}</p>` : ""}<p><small>Diperbarui: ${escapeHtml(result.updatedAt.toLocaleString("id-ID"))}</small></p>` : `<p role="alert">${escapeHtml(message)}</p>`;
  return new Response(`<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Status PPDB · SDIT Al-Ikhlas Serpong</title><style>body{font:16px/1.6 system-ui,sans-serif;background:#f8fbff;color:#243447;margin:0;padding:2rem}.card{max-width:42rem;margin:5vh auto;background:white;border:1px solid #e8f0f6;border-radius:1.5rem;padding:2rem;box-shadow:0 12px 40px #365b7410}a{color:#1676ad;font-weight:700}</style><main class="card"><h1>Status pendaftaran</h1>${detail}<p><a href="/ppdb/cek-status">Kembali ke cek status</a> · <a href="/">Beranda sekolah</a></p></main></html>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(request: Request) {
  const wantsJson = request.headers.get("content-type")?.includes("application/json") ?? false;
  const respond = (body: { error: string } | { registrationNo: string; studentName: string; academicYear: string; status: string; adminNote: string | null; updatedAt: Date }, status: number) => wantsJson ? NextResponse.json(body, { status }) : formResponse("error" in body ? body.error : "", "error" in body ? undefined : body, status);
  const limit = await checkRateLimit(`ppdb-status:${clientIp(request)}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) return respond({ error: "Terlalu banyak percobaan. Silakan coba kembali nanti." }, 429);
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return respond({ error: "Permintaan terlalu besar." }, 413);
  const body = wantsJson ? await request.json().catch(() => null) : Object.fromEntries(await request.formData().catch(() => new FormData()));
  const parsed = statusLookupSchema.safeParse(body);
  if (!parsed.success) return respond({ error: "Nomor pendaftaran atau kode akses tidak valid." }, 400);
  const applicant = await db.applicant.findUnique({ where: { registrationNo: parsed.data.registrationNo.toUpperCase() }, include: { period: { select: { academicYear: true } } } }).catch(() => null);
  const candidateHash = createHash("sha256").update(parsed.data.accessCode.toUpperCase()).digest();
  const expectedHash = Buffer.from(applicant?.accessTokenHash ?? "0".repeat(64), "hex");
  const valid = expectedHash.length === candidateHash.length && timingSafeEqual(expectedHash, candidateHash);
  if (!applicant || !valid) return respond({ error: "Nomor pendaftaran atau kode akses tidak ditemukan." }, 404);
  return respond({ registrationNo: applicant.registrationNo, studentName: applicant.studentName, academicYear: applicant.period.academicYear, status: applicant.status, adminNote: applicant.adminNote, updatedAt: applicant.updatedAt }, 200);
}
