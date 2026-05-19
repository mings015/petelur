import { z } from "zod";

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional().or(z.literal("")).transform((v) => v || undefined),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi").optional(),
  phone: z.string().optional(),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional().or(z.literal("")).transform((v) => v || undefined),
  isActive: z.boolean().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
