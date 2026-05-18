import { z } from "zod";

export const createSaleSchema = z.object({
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  customerId: z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  eggCategoryId: z.string().uuid("Pilih kategori telur"),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  pricePerUnit: z.coerce.number().positive("Harga harus lebih dari 0"),
  notes: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi"),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
