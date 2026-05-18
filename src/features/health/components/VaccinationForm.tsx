"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createVaccinationSchema,
  type CreateVaccinationInput,
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

interface VaccinationFormProps {
  coops: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateVaccinationInput) => Promise<void>;
  isLoading?: boolean;
}

export function VaccinationForm({
  coops,
  onSubmit,
  isLoading,
}: VaccinationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateVaccinationInput>({
    resolver: zodResolver(createVaccinationSchema),
  });

  const loading = isLoading ?? isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="coopId">Kandang</Label>
        <Controller
          name="coopId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="coopId" className="h-11 w-full text-base">
                <SelectValue placeholder="Pilih kandang">
                  {coops.find((c) => c.id === field.value)?.name}
                </SelectValue>
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
        <Label htmlFor="vaccineName">Nama Vaksin</Label>
        <Input
          id="vaccineName"
          type="text"
          placeholder="contoh: ND Lasota, Gumboro, AI H5N1"
          className="h-11 text-base"
          {...register("vaccineName")}
        />
        {errors.vaccineName && (
          <p className="text-sm text-destructive">
            {errors.vaccineName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scheduledDate">Tanggal Jadwal</Label>
        <Input
          id="scheduledDate"
          type="date"
          className="h-11 text-base"
          {...register("scheduledDate")}
        />
        {errors.scheduledDate && (
          <p className="text-sm text-destructive">
            {errors.scheduledDate.message}
          </p>
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
        {loading ? "Menyimpan..." : "Simpan Jadwal"}
      </Button>
    </form>
  );
}
