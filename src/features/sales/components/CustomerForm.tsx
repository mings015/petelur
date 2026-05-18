"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerSchema, type CreateCustomerInput } from "../schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormProps {
  defaultValues?: Partial<CreateCustomerInput>;
  onSubmit: (data: CreateCustomerInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Simpan Pelanggan",
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema) as Resolver<CreateCustomerInput>,
    defaultValues,
  });

  const loading = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Pelanggan</Label>
        <Input
          id="name"
          type="text"
          className="h-12 text-base"
          placeholder="Contoh: Pak Budi"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Nomor Telepon (opsional)</Label>
        <Input
          id="phone"
          type="tel"
          className="h-12 text-base"
          placeholder="08xxxxxxxxxx"
          {...register("phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Alamat (opsional)</Label>
        <Textarea
          id="address"
          className="min-h-[80px] text-base"
          placeholder="Alamat lengkap..."
          {...register("address")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Input
          id="notes"
          type="text"
          className="h-12 text-base"
          placeholder="Catatan tambahan"
          {...register("notes")}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-base">
        {loading ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
