"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSaleSchema, type CreateSaleInput } from "../schema";
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
import { formatRupiah } from "@/lib/utils";
import type { EggCategory, Customer } from "@/types";

interface SaleFormProps {
  categories: EggCategory[];
  customers: Customer[];
  onSubmit: (data: CreateSaleInput) => Promise<void>;
  isLoading?: boolean;
}

export function SaleForm({ categories, customers, onSubmit, isLoading = false }: SaleFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSaleInput>({
    resolver: zodResolver(createSaleSchema) as Resolver<CreateSaleInput>,
    defaultValues: { saleDate: today, unit: "butir" },
  });

  const selectedCategoryId = watch("eggCategoryId");
  const quantity = watch("quantity");
  const pricePerUnit = watch("pricePerUnit");

  // Auto-fill unit from selected category
  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat) setValue("unit", cat.unit);
  }, [selectedCategoryId, categories, setValue]);

  const totalAmount =
    Number(quantity) > 0 && Number(pricePerUnit) > 0
      ? Number(quantity) * Number(pricePerUnit)
      : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="saleDate">Tanggal Penjualan</Label>
        <Input
          id="saleDate"
          type="date"
          className="h-12 text-base"
          aria-invalid={!!errors.saleDate}
          {...register("saleDate")}
        />
        {errors.saleDate && <p className="text-sm text-destructive">{errors.saleDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="eggCategoryId">Kategori Telur</Label>
        <Controller
          name="eggCategoryId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="eggCategoryId" className="w-full h-12 text-base" aria-invalid={!!errors.eggCategoryId}>
                <SelectValue placeholder="Pilih kategori telur">
                  {categories.find((c) => c.id === field.value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.eggCategoryId && <p className="text-sm text-destructive">{errors.eggCategoryId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerId">Pelanggan (opsional)</Label>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="customerId" className="w-full h-12 text-base">
                <SelectValue placeholder="Tanpa pelanggan (tunai)">
                  {field.value ? customers.find((c) => c.id === field.value)?.name : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Tanpa pelanggan —</SelectItem>
                {customers.map((cust) => (
                  <SelectItem key={cust.id} value={cust.id}>
                    {cust.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Jumlah</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            className="h-12 text-base"
            placeholder="0"
            aria-invalid={!!errors.quantity}
            {...register("quantity", { valueAsNumber: true })}
          />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Satuan</Label>
          <Input
            id="unit"
            type="text"
            className="h-12 text-base"
            placeholder="butir"
            {...register("unit")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricePerUnit">Harga per Satuan (Rp)</Label>
        <Input
          id="pricePerUnit"
          type="number"
          min="0"
          step="50"
          className="h-12 text-base"
          placeholder="0"
          aria-invalid={!!errors.pricePerUnit}
          {...register("pricePerUnit", { valueAsNumber: true })}
        />
        {errors.pricePerUnit && <p className="text-sm text-destructive">{errors.pricePerUnit.message}</p>}
      </div>

      {totalAmount > 0 && (
        <div className="rounded-lg bg-muted/50 px-4 py-3 flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-base">{formatRupiah(totalAmount)}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          className="min-h-[80px] text-base"
          placeholder="Tambahkan catatan..."
          {...register("notes")}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-12 text-base">
        {isLoading ? "Menyimpan..." : "Catat Penjualan"}
      </Button>
    </form>
  );
}
