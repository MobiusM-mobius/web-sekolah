import { createHmac } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required to store rate-limit identifiers safely.");
  const hashedKey = createHmac("sha256", secret).update(key).digest("hex");
  const resetAt = new Date(now + windowMs);
  const [entry] = await db.$queryRaw<{ count: number; resetAt: Date }[]>(Prisma.sql`
    INSERT INTO "RateLimitBucket" ("id", "key", "count", "resetAt", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${hashedKey}, 1, ${resetAt}, NOW(), NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= NOW() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= NOW() THEN EXCLUDED."resetAt" ELSE "RateLimitBucket"."resetAt" END,
      "updatedAt" = NOW()
    RETURNING "count", "resetAt"
  `);
  const globalForCleanup = globalThis as typeof globalThis & { rateLimitCleanupAt?: number };
  if (!globalForCleanup.rateLimitCleanupAt || now - globalForCleanup.rateLimitCleanupAt > 60 * 60 * 1000) {
    globalForCleanup.rateLimitCleanupAt = now;
    void db.rateLimitBucket.deleteMany({ where: { resetAt: { lt: new Date(now - 60 * 60 * 1000) } } }).catch(() => undefined);
  }
  if (entry.count > limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt.getTime() - now) / 1000)) };
  return { allowed: true, retryAfter: 0 };
}

export function clientIp(request: Request) {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
