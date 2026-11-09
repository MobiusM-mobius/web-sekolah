import { describe, expect, it } from "vitest";
import { periodInputSchema } from "./period";

const validPeriod = {
  academicYear: "2026/2027",
  title: "Penerimaan peserta didik baru",
  opensAt: "2026-11-01T00:00:00.000Z",
  closesAt: "2026-12-01T00:00:00.000Z",
  quota: 100,
  active: true,
  requirements: [{ label: "Akta kelahiran", required: true, maxSizeMb: 5 }],
  faqs: [],
};

describe("PPDB period validation", () => {
  it("accepts configured period, requirements, and FAQ", () => {
    expect(periodInputSchema.safeParse({ ...validPeriod, faqs: [{ question: "Bagaimana mendaftar?", answer: "Isi formulir secara daring." }] }).success).toBe(true);
  });

  it("rejects reversed dates and invalid document size", () => {
    expect(periodInputSchema.safeParse({ ...validPeriod, closesAt: "2026-10-01T00:00:00.000Z" }).success).toBe(false);
    expect(periodInputSchema.safeParse({ ...validPeriod, requirements: [{ label: "Akta kelahiran", required: true, maxSizeMb: 100 }] }).success).toBe(false);
  });
});
