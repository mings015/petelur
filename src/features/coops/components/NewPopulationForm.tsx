"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addPopulationRecord } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const populationFormSchema = z.object({
  type: z.enum(["addition", "reduction", "mutation_in", "mutation_out"]),
  count: z
    .number()
    .int("Jumlah harus berupa bilangan bulat")
    .positive("Jumlah harus lebih dari 0"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type PopulationFormInput = z.infer<typeof populationFormSchema>;

const typeLabels: Record<PopulationFormInput["type"], string> = {
  addition: "Penambahan",
  reduction: "Pengurangan",
  mutation_in: "Mutasi Masuk",
  mutation_out: "Mutasi Keluar",
};

interface NewPopulationFormProps {
  coopId: string;
}

export function NewPopulationForm({ coopId }: NewPopulationFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PopulationFormInput>({
    resolver: zodResolver(populationFormSchema) as Resolver<PopulationFormInput>,
    defaultValues: { date: today },
  });

  async function onSubmit(data: PopulationFormInput) {
    setServerError(null);

    const formData = new FormData();
    formData.set("type", data.type);
    formData.set("count", String(data.count));
    formData.set("date", data.date);
    if (data.reason) formData.set("reason", data.reason);
    if (data.notes) formData.set("notes", data.notes);

    const result = await addPopulationRecord(coopId, formData);
    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Riwayat populasi berhasil ditambahkan");
    router.push(`/coops/${coopId}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="type">Jenis Perubahan</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger
                id="type"
                className="w-full h-12 text-base"
                aria-invalid={!!errors.type}
              >
                <SelectValue placeholder="Pilih jenis perubahan">
                  {field.value ? typeLabels[field.value as PopulationFormInput["type"]] : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(typeLabels) as [PopulationFormInput["type"], string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="count">Jumlah (ekor)</Label>
        <Input
          id="count"
          type="number"
          min="1"
          className="h-12 text-base"
          placeholder="0"
          aria-invalid={!!errors.count}
          {...register("count", { valueAsNumber: true })}
        />
        {errors.count && (
          <p className="text-sm text-destructive">{errors.count.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Tanggal</Label>
        <Input
          id="date"
          type="date"
          className="h-12 text-base"
          aria-invalid={!!errors.date}
          {...register("date")}
        />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Alasan (opsional)</Label>
        <Input
          id="reason"
          type="text"
          className="h-12 text-base"
          placeholder="Contoh: pembelian, kematian, dll"
          {...register("reason")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          className="min-h-[80px] text-base"
          placeholder="Tambahkan catatan..."
          {...register("notes")}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Riwayat Populasi"}
      </Button>
    </form>
  );
}
