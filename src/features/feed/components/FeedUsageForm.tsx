"use client";

import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedUsageSchema, type FeedUsageInput } from "../schema";
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

interface FeedUsageFormProps {
  feedStocks: Array<{
    id: string;
    name: string;
    unit: string;
    currentStock: string;
  }>;
  coops: Array<{ id: string; name: string }>;
  onSubmit: (data: FeedUsageInput) => Promise<void>;
  isLoading?: boolean;
}

export function FeedUsageForm({
  feedStocks,
  coops,
  onSubmit,
  isLoading = false,
}: FeedUsageFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FeedUsageInput>({
    resolver: zodResolver(feedUsageSchema) as Resolver<FeedUsageInput>,
    defaultValues: {
      date: today,
    },
  });

  const selectedFeedStockId = watch("feedStockId");
  const selectedStock = feedStocks.find((s) => s.id === selectedFeedStockId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="feedStockId">Jenis Pakan</Label>
        <Controller
          name="feedStockId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger
                id="feedStockId"
                className="w-full h-12 text-base"
                aria-invalid={!!errors.feedStockId}
              >
                <SelectValue placeholder="Pilih jenis pakan">
                  {feedStocks.find((s) => s.id === field.value)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {feedStocks.map((stock) => (
                  <SelectItem key={stock.id} value={stock.id}>
                    {stock.name} (stok:{" "}
                    {parseFloat(stock.currentStock).toLocaleString("id-ID")}{" "}
                    {stock.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.feedStockId && (
          <p className="text-sm text-destructive">{errors.feedStockId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coopId">Kandang</Label>
        <Controller
          name="coopId"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger
                id="coopId"
                className="w-full h-12 text-base"
                aria-invalid={!!errors.coopId}
              >
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

      <div className="space-y-2">
        <Label htmlFor="quantity">
          Jumlah{selectedStock ? ` (${selectedStock.unit})` : ""}
        </Label>
        <Input
          id="quantity"
          type="number"
          step="0.01"
          min="0"
          className="h-12 text-base"
          placeholder="0"
          aria-invalid={!!errors.quantity}
          {...register("quantity")}
        />
        {errors.quantity && (
          <p className="text-sm text-destructive">{errors.quantity.message}</p>
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
        disabled={isLoading}
        className="w-full h-12 text-base"
      >
        {isLoading ? "Menyimpan..." : "Catat Pemakaian"}
      </Button>
    </form>
  );
}
