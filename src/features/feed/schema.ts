import { z } from "zod";

const optionalPositiveNumber = z.union([
  z.literal("").transform(() => undefined),
  z.coerce.number().positive("Harus lebih dari 0"),
]).optional();

export const createFeedStockSchema = z.object({
  name: z.string().min(1, "Nama pakan wajib diisi"),
  unit: z.string().min(1, "Satuan wajib diisi").default("kg"),
  currentStock: z.coerce.number().min(0, "Stok tidak boleh negatif"),
  minimumStock: z.coerce
    .number()
    .min(0, "Stok minimum tidak boleh negatif")
    .default(0),
  pricePerUnit: optionalPositiveNumber,
  supplier: z.string().optional(),
});

export const feedUsageSchema = z.object({
  feedStockId: z.string().min(1, "Pilih jenis pakan"),
  coopId: z.string().min(1, "Pilih kandang"),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  notes: z.string().optional(),
});

export const feedPurchaseSchema = z.object({
  feedStockId: z.string().min(1, "Pilih jenis pakan"),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  pricePerUnit: optionalPositiveNumber,
  supplier: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  notes: z.string().optional(),
});

export type CreateFeedStockInput = z.infer<typeof createFeedStockSchema>;
export type FeedUsageInput = z.infer<typeof feedUsageSchema>;
export type FeedPurchaseInput = z.infer<typeof feedPurchaseSchema>;
