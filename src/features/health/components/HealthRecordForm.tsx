"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createHealthRecordSchema,
  type CreateHealthRecordInput,
} from "../schema";
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

interface HealthRecordFormProps {
  coops: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateHealthRecordInput) => Promise<void>;
  isLoading?: boolean;
}

export function HealthRecordForm({
  coops,
  onSubmit,
  isLoading,
}: HealthRecordFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateHealthRecordInput>({
    resolver: zodResolver(createHealthRecordSchema) as Resolver<CreateHealthRecordInput>,
    defaultValues: {
      recordDate: today,
      sickCount: 0,
      deadCount: 0,
    },
  });

  const loading = isLoading ?? isSubmitting;
  const deadCount = watch("deadCount");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="coopId">Kandang</Label>
        <Controller
          name="coopId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="coopId" className="h-11 w-full text-base">
                <SelectValue placeholder="Pilih kandang" />
              </SelectTrigger>
              <SelectContent>
                {coops.map((coop) => (
                  <SelectItem key={coop.id} value={coop.id}>
                    {coop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.coopId && (
          <p className="text-sm text-destructive">{errors.coopId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recordDate">Tanggal</Label>
        <Input
          id="recordDate"
          type="date"
          className="h-11 text-base"
          {...register("recordDate")}
        />
        {errors.recordDate && (
          <p className="text-sm text-destructive">{errors.recordDate.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sickCount" className="text-base font-semibold">
            Ayam Sakit
          </Label>
          <Input
            id="sickCount"
            type="number"
            min={0}
            className="h-14 text-xl font-bold text-center"
            {...register("sickCount", { valueAsNumber: true })}
          />
          {errors.sickCount && (
            <p className="text-sm text-destructive">
              {errors.sickCount.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="deadCount"
            className={`text-base font-semibold ${
              Number(deadCount) > 0 ? "text-destructive" : ""
            }`}
          >
            Ayam Mati
          </Label>
          <Input
            id="deadCount"
            type="number"
            min={0}
            className={`h-14 text-xl font-bold text-center ${
              Number(deadCount) > 0
                ? "border-destructive text-destructive focus-visible:ring-destructive"
                : ""
            }`}
            {...register("deadCount", { valueAsNumber: true })}
          />
          {Number(deadCount) > 0 && (
            <p className="text-sm text-destructive font-medium">
              Jumlah ayam di kandang akan dikurangi
            </p>
          )}
          {errors.deadCount && (
            <p className="text-sm text-destructive">
              {errors.deadCount.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="treatment">Penanganan / Obat</Label>
        <Input
          id="treatment"
          type="text"
          placeholder="contoh: Antibiotik, Vitamin B, Vaksin ND (opsional)"
          className="h-11 text-base"
          {...register("treatment")}
        />
        {errors.treatment && (
          <p className="text-sm text-destructive">{errors.treatment.message}</p>
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
        className="h-12 w-full text-base font-medium"
      >
        {loading ? "Menyimpan..." : "Simpan Catatan"}
      </Button>
    </form>
  );
}
