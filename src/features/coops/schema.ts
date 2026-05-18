import { z } from "zod";

export const createCoopSchema = z.object({
  name: z.string().min(1, "Nama kandang wajib diisi"),
  capacity: z
    .number()
    .int("Kapasitas harus berupa bilangan bulat")
    .positive("Kapasitas harus lebih dari 0"),
  chickenCount: z
    .number()
    .int("Jumlah ayam harus berupa bilangan bulat")
    .min(0, "Jumlah ayam tidak boleh negatif")
    .default(0),
  chickenAgeWeeks: z
    .number()
    .int("Usia ayam harus berupa bilangan bulat")
    .positive("Usia ayam harus lebih dari 0")
    .optional(),
  docEntryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .optional(),
  status: z.enum(["active", "inactive", "empty"]),
  notes: z.string().optional(),
});

export const updateCoopSchema = createCoopSchema.partial();

export type CreateCoopInput = z.infer<typeof createCoopSchema>;
export type UpdateCoopInput = z.infer<typeof updateCoopSchema>;
