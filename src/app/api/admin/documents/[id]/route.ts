import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { privateFilePath } from "@/lib/private-files";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_PPDB"]);
  const { id } = await params;
  const document = await db.applicantDocument.findUnique({ where: { id }, include: { applicant: { select: { registrationNo: true } } } });
  if (!document) return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
  try {
    const content = await readFile(await privateFilePath(document.storageKey));
    await db.adminActivityLog.create({ data: { userId: user.id, action: "ACCESS_APPLICANT_DOCUMENT", entity: "ApplicantDocument", entityId: document.id, details: { registrationNo: document.applicant.registrationNo } } });
    return new Response(content, { headers: { "Content-Type": document.mimeType, "Content-Length": String(content.byteLength), "Content-Disposition": `attachment; filename="document-${document.id}.${document.mimeType === "application/pdf" ? "pdf" : document.mimeType === "image/png" ? "png" : "jpg"}"`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; sandbox" } });
  } catch {
    return NextResponse.json({ error: "Berkas dokumen tidak tersedia." }, { status: 404 });
  }
}
