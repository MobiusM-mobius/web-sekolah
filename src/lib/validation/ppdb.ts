import { z } from "zod";

export const applicantSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  gender: z.enum(["MALE", "FEMALE"]),
  birthPlace: z.string().trim().min(2).max(100),
  birthDate: z.iso.date(),
  address: z.string().trim().min(8).max(1000),
  previousSchool: z.string().trim().max(150).optional().or(z.literal("")),
  fatherName: z.string().trim().min(2).max(120),
  motherName: z.string().trim().min(2).max(120),
  guardianName: z.string().trim().max(120).optional().or(z.literal("")),
  whatsapp: z.string().trim().regex(/^\+?[0-9][0-9\s-]{7,18}$/),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  parentAddress: z.string().trim().min(8).max(1000),
});

export const statusLookupSchema = z.object({
  registrationNo: z.string().trim().regex(/^PPDB-[0-9]{4}-[A-F0-9]{12}$/i),
  accessCode: z.string().trim().regex(/^[A-F0-9]{32}$/i),
});

export type ApplicantInput = z.infer<typeof applicantSchema>;
