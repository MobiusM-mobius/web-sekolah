import type { ApplicantStatus } from "@prisma/client";

const transitions: Record<ApplicantStatus, ApplicantStatus[]> = {
  PENDING: ["VERIFIED", "REVISION_REQUIRED", "REJECTED"],
  VERIFIED: ["ACCEPTED", "REVISION_REQUIRED", "REJECTED"],
  REVISION_REQUIRED: ["VERIFIED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

export function canTransitionApplicant(from: ApplicantStatus, to: ApplicantStatus) {
  return transitions[from].includes(to);
}
