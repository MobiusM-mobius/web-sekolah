import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { db } from "@/lib/db";
import { hasValidSignature } from "@/lib/private-files";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE", "EDITOR"]);
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return NextResponse.json({ error: "Penyimpanan gambar belum dikonfigurasi." }, { status: 503 });
  if (Number(request.headers.get("content-length") ?? 0) > 6 * 1024 * 1024) return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || !(await hasValidSignature(file))) return NextResponse.json({ error: "Pilih gambar JPG, PNG, atau WebP maksimal 5 MB." }, { status: 400 });
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "sdit-al-ikhlas", resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"], transformation: [{ width: 1800, height: 1800, crop: "limit" }] }, (error, uploadResult) => error || !uploadResult ? reject(error ?? new Error("Upload gagal")) : resolve(uploadResult));
      file.arrayBuffer().then((buffer) => stream.end(Buffer.from(buffer))).catch(reject);
    });
    await db.adminActivityLog.create({ data: { userId: user.id, action: "UPLOAD_MEDIA", entity: "CloudinaryImage" } });
    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch { return NextResponse.json({ error: "Gambar belum dapat diunggah." }, { status: 502 }); }
}
