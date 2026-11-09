import { z } from "zod";

const httpsUrl = z.string().trim().url().refine((value) => value.startsWith("https://"));
export const schoolProfileSchema = z.object({
  history: z.string().max(10000),
  identity: z.record(z.string(), z.string().max(300)).default({}),
  vision: z.string().max(5000),
  mission: z.array(z.string().trim().min(1).max(500)).max(30),
  goals: z.array(z.string().trim().min(1).max(500)).max(30),
  strengths: z.array(z.string().trim().min(1).max(500)).max(30),
  principalName: z.string().trim().max(120),
  principalMessage: z.string().max(5000),
  principalPhotoUrl: httpsUrl.or(z.literal("")),
  curriculum: z.string().max(10000),
  learningPrograms: z.array(z.string().trim().min(1).max(300)).max(30),
  islamicPrograms: z.array(z.string().trim().min(1).max(300)).max(30),
  extracurriculars: z.array(z.string().trim().min(1).max(300)).max(30),
  facilities: z.array(z.string().trim().min(1).max(300)).max(30),
  accreditation: z.string().trim().max(100),
  address: z.string().trim().max(1000),
  phone: z.string().trim().max(40),
  whatsapp: z.string().trim().max(40),
  email: z.union([z.literal(""), z.email().max(254)]),
  mapUrl: z.string().trim().url().refine((value) => { try { const url = new URL(value); return url.protocol === "https:" && ["google.com", "www.google.com", "maps.google.com"].includes(url.hostname) && url.pathname.startsWith("/maps"); } catch { return false; } }).or(z.literal("")),
  heroHeadline: z.string().trim().max(180),
  heroDescription: z.string().trim().max(1000),
  heroImageUrl: httpsUrl.or(z.literal("")),
  socialLinks: z.record(z.string().max(40), httpsUrl).default({}),
});
