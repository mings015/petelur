"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductionForm } from "./ProductionForm";
import { createProduction } from "../actions";
import { useOfflineSubmit } from "@/hooks/use-offline-submit";
import type { CreateProductionInput } from "../schema";

interface NewProductionFormProps {
  coops: Array<{ id: string; name: string }>;
}

export function NewProductionForm({ coops }: NewProductionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { submitOrQueue } = useOfflineSubmit("production");

  async function handleSubmit(data: CreateProductionInput) {
    setIsLoading(true);
    setError(null);

    const payload: Record<string, string> = {
      coopId: data.coopId,
      productionDate: data.productionDate,
      totalEggs: String(data.totalEggs),
      goodEggs: String(data.goodEggs),
      crackedEggs: String(data.crackedEggs ?? 0),
      brokenEggs: String(data.brokenEggs ?? 0),
      smallEggs: String(data.smallEggs ?? 0),
      largeEggs: String(data.largeEggs ?? 0),
    };
    if (data.weightKg !== undefined) payload.weightKg = String(data.weightKg);
    if (data.notes) payload.notes = data.notes;

    const result = await submitOrQueue(payload, createProduction);

    if (!result.success) {
      setError(result.error ?? "Gagal menyimpan");
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    if (!result.queued) toast.success("Data produksi berhasil dicatat");
    router.push("/production");
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <ProductionForm
        coops={coops}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
