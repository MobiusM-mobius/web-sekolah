import { describe, expect, it } from "vitest";
import { applicantSchema, statusLookupSchema } from "./ppdb";
import { canTransitionApplicant } from "../ppdb-state";

const validApplicant = {
  studentName: "Calon Siswa",
  gender: "FEMALE",
  birthPlace: "Tangerang",
  birthDate: "2019-03-10",
  address: "Alamat calon siswa, Serpong",
  fatherName: "Nama Ayah",
  motherName: "Nama Ibu",
  whatsapp: "+6281234567890",
  email: "  ORANGTUA@example.com ",
  parentAddress: "Alamat orang tua, Serpong",
};

describe("PPDB validation", () => {
  it("validates and normalizes a registration", () => {
    const parsed = applicantSchema.parse(validApplicant);
    expect(parsed.email).toBe("orangtua@example.com");
  });

  it("rejects invalid phone and date values", () => {
    expect(applicantSchema.safeParse({ ...validApplicant, whatsapp: "abc" }).success).toBe(false);
    expect(applicantSchema.safeParse({ ...validApplicant, birthDate: "tomorrow" }).success).toBe(false);
  });

  it("requires a registration number and one-time access code to look up status", () => {
    expect(statusLookupSchema.safeParse({ registrationNo: "PPDB-2026-ABCDEF123456", accessCode: "A".repeat(32) }).success).toBe(true);
    expect(statusLookupSchema.safeParse({ registrationNo: "PPDB-2026-ABCDEF123456" }).success).toBe(false);
  });

  it("enforces explicit status transitions and terminal decisions", () => {
    expect(canTransitionApplicant("PENDING", "VERIFIED")).toBe(true);
    expect(canTransitionApplicant("PENDING", "ACCEPTED")).toBe(false);
    expect(canTransitionApplicant("ACCEPTED", "REJECTED")).toBe(false);
  });
});
