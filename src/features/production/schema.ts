import { z } from "zod";

export const createProductionSchema = z.object({
  coopId: z.string().uuid("Pilih kandang yang valid"),
  productionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  totalEggs: z.coerce.number().int().min(0, "Total telur tidak boleh negatif"),
  goodEggs: z.coerce.number().int().min(0, "Telur bagus tidak boleh negatif"),
  crackedEggs: z.coerce
    .number()
    .int()
    .min(0, "Telur retak tidak boleh negatif")
    .default(0),
  brokenEggs: z.coerce
    .number()
    .int()
    .min(0, "Telur rusak tidak boleh negatif")
    .default(0),
  smallEggs: z.coerce
    .number()
    .int()
    .min(0, "Telur kecil tidak boleh negatif")
    .default(0),
  largeEggs: z.coerce
    .number()
    .int()
    .min(0, "Telur besar tidak boleh negatif")
    .default(0),
  weightKg: z
    .union([
      z.literal("").transform(() => undefined),
      z.coerce.number().positive("Berat harus lebih dari 0"),
    ])
    .optional(),
  notes: z.string().optional(),
});

export type CreateProductionInput = z.infer<typeof createProductionSchema>;
