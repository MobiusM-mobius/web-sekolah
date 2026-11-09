import { z } from "zod";
import { AppRole } from "@prisma/client";

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(12).max(128),
  role: z.enum(AppRole),
});

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.enum(AppRole),
  active: z.boolean(),
  password: z.string().min(12).max(128).optional().or(z.literal("")),
});
