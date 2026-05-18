"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCoopSchema, type CreateCoopInput } from "../schema";
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

interface CoopFormProps {
  defaultValues?: Partial<CreateCoopInput>;
  onSubmit: (data: CreateCoopInput) => Promise<void>;
  isLoading?: boolean;
}

export function CoopForm({ defaultValues, onSubmit, isLoading }: CoopFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCoopInput>({
    resolver: zodResolver(createCoopSchema) as Resolver<CreateCoopInput>,
    defaultValues: {
      chickenCount: 0,
      status: "active",
      ...defaultValues,
    },
  });

  const loading = isLoading ?? isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama Kandang</Label>
        <Input
          id="name"
          placeholder="contoh: Kandang A1"
          className="h-11 text-base"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Kapasitas</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            placeholder="contoh: 500"
            className="h-11 text-base"
            {...register("capacity", { valueAsNumber: true })}
          />
          {errors.capacity && (
            <p className="text-sm text-destructive">{errors.capacity.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="chickenCount">Jumlah Ayam</Label>
          <Input
            id="chickenCount"
            type="number"
            min={0}
            placeholder="contoh: 450"
            className="h-11 text-base"
            {...register("chickenCount", { valueAsNumber: true })}
          />
          {errors.chickenCount && (
            <p className="text-sm text-destructive">{errors.chickenCount.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="chickenAgeWeeks">Usia Ayam (minggu)</Label>
          <Input
            id="chickenAgeWeeks"
            type="number"
            min={1}
            placeholder="opsional"
            className="h-11 text-base"
            {...register("chickenAgeWeeks", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
          {errors.chickenAgeWeeks && (
            <p className="text-sm text-destructive">
              {errors.chickenAgeWeeks.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="docEntryDate">Tanggal DOC Masuk</Label>
          <Input
            id="docEntryDate"
            type="date"
            className="h-11 text-base"
            {...register("docEntryDate", {
              setValueAs: (v) => (v === "" ? undefined : v),
            })}
          />
          {errors.docEntryDate && (
            <p className="text-sm text-destructive">{errors.docEntryDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status" className="h-11 w-full text-base">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="empty">Kosong</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          placeholder="opsional"
          rows={3}
          className="text-base"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full text-base font-medium"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
