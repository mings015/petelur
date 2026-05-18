"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFeedStockSchema, type CreateFeedStockInput } from "../schema";
import { createFeedStock } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewFeedStockForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateFeedStockInput>({
    resolver: zodResolver(createFeedStockSchema) as Resolver<CreateFeedStockInput>,
    defaultValues: {
      unit: "kg",
      minimumStock: 0,
    },
  });

  async function onSubmit(data: CreateFeedStockInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("unit", data.unit);
    formData.set("currentStock", String(data.currentStock));
    formData.set("minimumStock", String(data.minimumStock));
    if (data.pricePerUnit !== undefined) {
      formData.set("pricePerUnit", String(data.pricePerUnit));
    }
    if (data.supplier) {
      formData.set("supplier", data.supplier);
    }

    const result = await createFeedStock(formData);
    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Jenis pakan berhasil ditambahkan");
    router.push("/feed");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nama Pakan</Label>
        <Input
          id="name"
          type="text"
          className="h-12 text-base"
          placeholder="Contoh: Pakan Layer A"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Satuan</Label>
        <Input
          id="unit"
          type="text"
          className="h-12 text-base"
          placeholder="kg"
          aria-invalid={!!errors.unit}
          {...register("unit")}
        />
        {errors.unit && (
          <p className="text-sm text-destructive">{errors.unit.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentStock">Stok Awal</Label>
        <Input
          id="currentStock"
          type="number"
          step="0.01"
          min="0"
          className="h-12 text-base"
          placeholder="0"
          aria-invalid={!!errors.currentStock}
          {...register("currentStock")}
        />
        {errors.currentStock && (
          <p className="text-sm text-destructive">
            {errors.currentStock.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimumStock">Stok Minimum</Label>
        <Input
          id="minimumStock"
          type="number"
          step="0.01"
          min="0"
          className="h-12 text-base"
          placeholder="0"
          aria-invalid={!!errors.minimumStock}
          {...register("minimumStock")}
        />
        {errors.minimumStock && (
          <p className="text-sm text-destructive">
            {errors.minimumStock.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricePerUnit">Harga per Satuan (opsional)</Label>
        <Input
          id="pricePerUnit"
          type="number"
          step="0.01"
          min="0"
          className="h-12 text-base"
          placeholder="0"
          aria-invalid={!!errors.pricePerUnit}
          {...register("pricePerUnit")}
        />
        {errors.pricePerUnit && (
          <p className="text-sm text-destructive">
            {errors.pricePerUnit.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Pemasok (opsional)</Label>
        <Input
          id="supplier"
          type="text"
          className="h-12 text-base"
          placeholder="Nama pemasok"
          {...register("supplier")}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base"
      >
        {isSubmitting ? "Menyimpan..." : "Tambah Jenis Pakan"}
      </Button>
    </form>
  );
}
