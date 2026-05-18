"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductionSchema, type CreateProductionInput } from "../schema";
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

interface ProductionFormProps {
  coops: Array<{ id: string; name: string }>;
  onSubmit: (data: CreateProductionInput) => Promise<void>;
  isLoading?: boolean;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ProductionForm({
  coops,
  onSubmit,
  isLoading = false,
}: ProductionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductionInput>({
    resolver: zodResolver(createProductionSchema) as Resolver<CreateProductionInput>,
    defaultValues: {
      productionDate: getTodayDate(),
      crackedEggs: 0,
      brokenEggs: 0,
      smallEggs: 0,
      largeEggs: 0,
    },
  });

  const goodEggs = watch("goodEggs");
  const crackedEggs = watch("crackedEggs");
  const brokenEggs = watch("brokenEggs");

  useEffect(() => {
    const total =
      (Number(goodEggs) || 0) +
      (Number(crackedEggs) || 0) +
      (Number(brokenEggs) || 0);
    setValue("totalEggs", total);
  }, [goodEggs, crackedEggs, brokenEggs, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Kandang */}
      <div className="space-y-1.5">
        <Label htmlFor="coopId" className="text-sm font-medium">
          Kandang <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="coopId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(val) => field.onChange(val)}
            >
              <SelectTrigger
                id="coopId"
                className="w-full h-11 text-base"
                aria-invalid={!!errors.coopId}
              >
                <SelectValue placeholder="Pilih kandang...">
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
          <p className="text-xs text-destructive">{errors.coopId.message}</p>
        )}
      </div>

      {/* Tanggal */}
      <div className="space-y-1.5">
        <Label htmlFor="productionDate" className="text-sm font-medium">
          Tanggal <span className="text-destructive">*</span>
        </Label>
        <Input
          id="productionDate"
          type="date"
          className="h-11 text-base"
          aria-invalid={!!errors.productionDate}
          {...register("productionDate")}
        />
        {errors.productionDate && (
          <p className="text-xs text-destructive">
            {errors.productionDate.message}
          </p>
        )}
      </div>

      {/* Egg counts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="goodEggs" className="text-sm font-medium">
            Telur Bagus <span className="text-destructive">*</span>
          </Label>
          <Input
            id="goodEggs"
            type="number"
            min="0"
            inputMode="numeric"
            className="h-11 text-base"
            aria-invalid={!!errors.goodEggs}
            {...register("goodEggs")}
          />
          {errors.goodEggs && (
            <p className="text-xs text-destructive">{errors.goodEggs.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="totalEggs" className="text-sm font-medium">
            Total Telur
          </Label>
          <Input
            id="totalEggs"
            type="number"
            min="0"
            inputMode="numeric"
            className="h-11 text-base bg-muted/50"
            readOnly
            aria-readonly="true"
            {...register("totalEggs")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="crackedEggs" className="text-sm font-medium">
            Telur Retak
          </Label>
          <Input
            id="crackedEggs"
            type="number"
            min="0"
            inputMode="numeric"
            className="h-11 text-base"
            {...register("crackedEggs")}
          />
          {errors.crackedEggs && (
            <p className="text-xs text-destructive">
              {errors.crackedEggs.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brokenEggs" className="text-sm font-medium">
            Telur Rusak
          </Label>
          <Input
            id="brokenEggs"
            type="number"
            min="0"
            inputMode="numeric"
            className="h-11 text-base"
            {...register("brokenEggs")}
          />
          {errors.brokenEggs && (
            <p className="text-xs text-destructive">
              {errors.brokenEggs.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="smallEggs" className="text-sm font-medium">
            Telur Kecil
          </Label>
          <Input
            id="smallEggs"
            type="number"
            min="0"
            inputMode="numeric"
            className="h-11 text-base"
            {...register("smallEggs")}
          />
          {errors.smallEggs && (
            <p className="text-xs text-destructive">
              {errors.smallEggs.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="largeEggs" className="text-sm font-medium">
            Telur Besar
          </Label>
          <Input
            id="largeEggs"
            type="number"
            min="0"
            inputMode="numeric"
            className="h-11 text-base"
            {...register("largeEggs")}
          />
          {errors.largeEggs && (
            <p className="text-xs text-destructive">
              {errors.largeEggs.message}
            </p>
          )}
        </div>
      </div>

      {/* Berat */}
      <div className="space-y-1.5">
        <Label htmlFor="weightKg" className="text-sm font-medium">
          Berat (kg){" "}
          <span className="text-muted-foreground font-normal">— opsional</span>
        </Label>
        <Input
          id="weightKg"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          className="h-11 text-base"
          placeholder="Contoh: 12.5"
          aria-invalid={!!errors.weightKg}
          {...register("weightKg")}
        />
        {errors.weightKg && (
          <p className="text-xs text-destructive">{errors.weightKg.message}</p>
        )}
      </div>

      {/* Catatan */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-sm font-medium">
          Catatan{" "}
          <span className="text-muted-foreground font-normal">— opsional</span>
        </Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Catatan tambahan..."
          className="text-base resize-none"
          {...register("notes")}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 text-base"
        size="lg"
      >
        {isLoading ? "Menyimpan..." : "Simpan Produksi"}
      </Button>
    </form>
  );
}
