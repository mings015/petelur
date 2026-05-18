"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpenseSchema, type CreateExpenseInput } from "../schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExpenseCategory } from "@/types";

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  isLoading?: boolean;
}

export function ExpenseForm({ categories, onSubmit, isLoading = false }: ExpenseFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema) as Resolver<CreateExpenseInput>,
    defaultValues: { expenseDate: today, paymentMethod: "tunai" },
  });

  const loading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="expenseDate">Tanggal</Label>
        <Input
          id="expenseDate"
          type="date"
          className="h-12 text-base"
          aria-invalid={!!errors.expenseDate}
          {...register("expenseDate")}
        />
        {errors.expenseDate && <p className="text-sm text-destructive">{errors.expenseDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Kategori</Label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId" className="w-full h-12 text-base" aria-invalid={!!errors.categoryId}>
                <SelectValue placeholder="Pilih kategori">
                  {categories.find((c) => c.id === field.value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Nominal (Rp)</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="1000"
          className="h-12 text-base"
          placeholder="0"
          aria-invalid={!!errors.amount}
          {...register("amount")}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? "tunai"} onValueChange={field.onChange}>
              <SelectTrigger id="paymentMethod" className="w-full h-12 text-base">
                <SelectValue placeholder="Pilih metode">
                  {field.value === "tunai" ? "Tunai" : field.value === "transfer" ? "Transfer" : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tunai">Tunai</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Keterangan (opsional)</Label>
        <Input
          id="description"
          type="text"
          className="h-12 text-base"
          placeholder="Contoh: Pembelian pakan 500kg"
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          className="min-h-[80px] text-base"
          placeholder="Catatan tambahan..."
          {...register("notes")}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-base">
        {loading ? "Menyimpan..." : "Catat Pengeluaran"}
      </Button>
    </form>
  );
}
