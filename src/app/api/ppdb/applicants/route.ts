import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applicantSchema } from "@/lib/validation/ppdb";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { hasValidSignature, removePrivateFile, savePrivateFile, validateFile } from "@/lib/private-files";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await checkRateLimit(`ppdb-register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Terlalu banyak percobaan. Silakan coba kembali nanti." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (Number(request.headers.get("content-length") ?? 0) > 25 * 1024 * 1024) return NextResponse.json({ error: "Ukuran total unggahan terlalu besar." }, { status: 413 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Formulir tidak valid." }, { status: 400 });
  const values = Object.fromEntries(["studentName", "gender", "birthPlace", "birthDate", "address", "previousSchool", "fatherName", "motherName", "guardianName", "whatsapp", "email", "parentAddress"].map((key) => [key, form.get(key) ?? ""]));
  const parsed = applicantSchema.safeParse(values);
  if (!parsed.success || new Date(parsed.data?.birthDate ?? "invalid") >= new Date()) return NextResponse.json({ error: "Periksa kembali data yang wajib diisi." }, { status: 400 });

  const now = new Date();
  const period = await db.ppdbPeriod.findFirst({ where: { active: true, opensAt: { lte: now }, closesAt: { gte: now } }, include: { requirements: { orderBy: { sortOrder: "asc" } } } }).catch(() => null);
  if (!period) return NextResponse.json({ error: "Pendaftaran saat ini belum dibuka." }, { status: 409 });

  const files: { requirement: (typeof period.requirements)[number]; file: File }[] = [];
  const allowedFieldNames = new Set(period.requirements.map((requirement) => `document:${requirement.id}`));
  for (const [name, value] of form.entries()) {
    if (name.startsWith("document:") && (!allowedFieldNames.has(name) || !(value instanceof File))) return NextResponse.json({ error: "Dokumen tidak valid." }, { status: 400 });
  }
  for (const requirement of period.requirements) {
    const candidate = form.get(`document:${requirement.id}`);
    if (!(candidate instanceof File) || candidate.size === 0) {
      if (requirement.required) return NextResponse.json({ error: `Dokumen ${requirement.label} wajib diunggah.` }, { status: 400 });
      continue;
    }
    if (!validateFile(candidate, requirement.acceptedMimes, requirement.maxSizeMb) || !(await hasValidSignature(candidate))) return NextResponse.json({ error: `Format atau ukuran dokumen ${requirement.label} tidak sesuai.` }, { status: 400 });
    files.push({ requirement, file: candidate });
  }

  const saved: { key: string; path: string; label: string; originalName: string; mimeType: string; sizeBytes: number }[] = [];
  try {
    for (const { requirement, file } of files) {
      const stored = await savePrivateFile(file);
      saved.push({ ...stored, label: requirement.label, originalName: file.name.slice(0, 180), mimeType: file.type, sizeBytes: file.size });
    }
    const accessCode = randomBytes(16).toString("hex").toUpperCase();
    const registrationNo = `PPDB-${period.academicYear.slice(0, 4)}-${randomBytes(6).toString("hex").toUpperCase()}`;
    const applicant = await db.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`SELECT "id"::text AS "id" FROM "PpdbPeriod" WHERE "id" = ${period.id}::uuid FOR UPDATE`;
      const currentPeriod = locked.length ? await tx.ppdbPeriod.findUnique({ where: { id: period.id } }) : null;
      const transactionTime = new Date();
      if (!currentPeriod?.active || currentPeriod.opensAt > transactionTime || currentPeriod.closesAt < transactionTime) throw new Error("PERIOD_CLOSED");
      const applicantCount = await tx.applicant.count({ where: { periodId: period.id, status: { not: "REJECTED" } } });
      if (currentPeriod.quota !== null && applicantCount >= currentPeriod.quota) throw new Error("QUOTA_FULL");
      const created = await tx.applicant.create({
        data: {
          registrationNo,
          accessTokenHash: createHash("sha256").update(accessCode).digest("hex"),
          periodId: period.id,
          ...parsed.data,
          birthDate: new Date(`${parsed.data.birthDate}T00:00:00.000Z`),
          documents: { create: saved.map((doc, index) => ({ requirementId: files[index].requirement.id, label: doc.label, storageKey: doc.key, originalName: doc.originalName, mimeType: doc.mimeType, sizeBytes: doc.sizeBytes })) },
          statusLogs: { create: { toStatus: "PENDING", note: "Pendaftaran diterima." } },
        },
        select: { id: true, registrationNo: true },
      });
      return created;
    });
    return NextResponse.json({ registrationNo: applicant.registrationNo, accessCode }, { status: 201 });
  } catch (error) {
    await Promise.all(saved.map((file) => removePrivateFile(file.path)));
    if (error instanceof Error && error.message === "QUOTA_FULL") return NextResponse.json({ error: "Kuota pendaftaran sudah terpenuhi." }, { status: 409 });
    if (error instanceof Error && error.message === "PERIOD_CLOSED") return NextResponse.json({ error: "Periode pendaftaran sudah ditutup." }, { status: 409 });
    console.error("PPDB registration failed", error instanceof Error ? error.message : "unknown error", randomUUID());
    return NextResponse.json({ error: "Pendaftaran belum dapat disimpan. Silakan coba kembali." }, { status: 500 });
  }
}
