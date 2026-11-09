import { PrismaClient, AppRole } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  for (const name of Object.values(AppRole)) await db.role.upsert({ where: { name }, update: {}, create: { name } });
  if (!await db.schoolProfile.count()) await db.schoolProfile.create({ data: { name: "SDIT Al-Ikhlas Serpong" } });
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 characters.");
    const role = await db.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
    await db.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: await hash(adminPassword, 12), active: true, roleId: role.id },
      create: { name: "Administrator", email: adminEmail, passwordHash: await hash(adminPassword, 12), roleId: role.id },
    });
    console.info(`Development/bootstrap admin configured: ${adminEmail}`);
  } else {
    console.info("No admin account created. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD for a controlled bootstrap.");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => db.$disconnect());
