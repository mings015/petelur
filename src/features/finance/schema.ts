import { z } from "zod";

export const createExpenseSchema = z.object({
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  categoryId: z.string().uuid("Pilih kategori pengeluaran"),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  paymentMethod: z.enum(["tunai", "transfer"]),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const createManualIncomeSchema = z.object({
  incomeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  paymentMethod: z.enum(["tunai", "transfer"]),
  notes: z.string().optional(),
});

export type CreateManualIncomeInput = z.infer<typeof createManualIncomeSchema>;
