import { z } from "zod";

export const createHealthRecordSchema = z.object({
  coopId: z.string().uuid("Pilih kandang yang valid"),
  recordDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  sickCount: z.coerce
    .number()
    .int()
    .min(0, "Jumlah ayam sakit tidak boleh negatif")
    .default(0),
  deadCount: z.coerce
    .number()
    .int()
    .min(0, "Jumlah ayam mati tidak boleh negatif")
    .default(0),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

export const createVaccinationSchema = z.object({
  coopId: z.string().uuid("Pilih kandang yang valid"),
  vaccineName: z.string().min(1, "Nama vaksin tidak boleh kosong"),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  notes: z.string().optional(),
});

export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>;
export type CreateVaccinationInput = z.infer<typeof createVaccinationSchema>;
