import { z } from "zod";

export const periodInputSchema = z.object({
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  opensAt: z.iso.datetime(),
  closesAt: z.iso.datetime(),
  quota: z.number().int().positive().nullable(),
  feeInformation: z.string().trim().max(3000).optional().or(z.literal("")),
  active: z.boolean(),
  requirements: z.array(z.object({ label: z.string().trim().min(2).max(160), description: z.string().trim().max(500).optional().or(z.literal("")), required: z.boolean(), maxSizeMb: z.number().int().min(1).max(10) })).max(30),
  faqs: z.array(z.object({ question: z.string().trim().min(4).max(300), answer: z.string().trim().min(4).max(2000) })).max(20).default([]),
}).refine((value) => new Date(value.closesAt) > new Date(value.opensAt), { path: ["closesAt"], message: "Tanggal tutup harus setelah tanggal buka." });
