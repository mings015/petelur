"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createManualIncomeSchema, type CreateManualIncomeInput } from "../schema";
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

interface ManualIncomeFormProps {
  onSubmit: (data: CreateManualIncomeInput) => Promise<void>;
  isLoading?: boolean;
}

export function ManualIncomeForm({ onSubmit, isLoading = false }: ManualIncomeFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateManualIncomeInput>({
    resolver: zodResolver(createManualIncomeSchema) as Resolver<CreateManualIncomeInput>,
    defaultValues: { incomeDate: today, paymentMethod: "tunai" },
  });

  const loading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="incomeDate">Tanggal</Label>
        <Input
          id="incomeDate"
          type="date"
          className="h-12 text-base"
          aria-invalid={!!errors.incomeDate}
          {...register("incomeDate")}
        />
        {errors.incomeDate && <p className="text-sm text-destructive">{errors.incomeDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          type="text"
          className="h-12 text-base"
          placeholder="Contoh: Penjualan pupuk kandang"
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
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
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          className="min-h-[80px] text-base"
          placeholder="Catatan tambahan..."
          {...register("notes")}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-base">
        {loading ? "Menyimpan..." : "Catat Pemasukan"}
      </Button>
    </form>
  );
}
