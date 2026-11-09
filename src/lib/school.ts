import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const getSchoolProfile = cache(() => db.schoolProfile.findFirst().catch(() => null));

export const getActivePeriod = cache(() =>
  db.ppdbPeriod.findFirst({ where: { active: true }, include: { requirements: { orderBy: { sortOrder: "asc" } } }, orderBy: { opensAt: "desc" } }).catch(() => null),
);

export function whatsappHref(number: string | null | undefined, text?: string) {
  const digits = number?.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function socialLinksOf(value: unknown): [string, string][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].startsWith("https://"));
}

export const dateLong = (date: Date) => date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
