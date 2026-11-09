import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { schoolProfileSchema } from "@/lib/validation/school-profile";

export async function GET() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const profile = await db.schoolProfile.findFirst();
  await db.adminActivityLog.create({ data: { userId: user.id, action: "VIEW_SCHOOL_PROFILE", entity: "SchoolProfile", entityId: profile?.id } });
  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN_WEBSITE"]);
  const body = await request.json().catch(() => null);
  const parsed = schoolProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali informasi sekolah dan tautan yang diisi." }, { status: 400 });
  const current = await db.schoolProfile.findFirst();
  const data = {
    ...parsed.data,
    principalName: parsed.data.principalName || null,
    principalPhotoUrl: parsed.data.principalPhotoUrl || null,
    accreditation: parsed.data.accreditation || null,
    address: parsed.data.address || null,
    phone: parsed.data.phone || null,
    whatsapp: parsed.data.whatsapp || null,
    email: parsed.data.email || null,
    mapUrl: parsed.data.mapUrl || null,
    heroHeadline: parsed.data.heroHeadline || null,
    heroDescription: parsed.data.heroDescription || null,
    heroImageUrl: parsed.data.heroImageUrl || null,
    socialLinks: parsed.data.socialLinks,
  };
  const profile = current ? await db.schoolProfile.update({ where: { id: current.id }, data }) : await db.schoolProfile.create({ data: { name: "SDIT Al-Ikhlas Serpong", ...data } });
  await db.adminActivityLog.create({ data: { userId: user.id, action: "UPDATE_SCHOOL_PROFILE", entity: "SchoolProfile", entityId: profile.id } });
  return NextResponse.json({ id: profile.id, updatedAt: profile.updatedAt });
}
