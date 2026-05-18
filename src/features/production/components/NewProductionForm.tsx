"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductionForm } from "./ProductionForm";
import { createProduction } from "../actions";
import type { CreateProductionInput } from "../schema";

interface NewProductionFormProps {
  coops: Array<{ id: string; name: string }>;
}

export function NewProductionForm({ coops }: NewProductionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: CreateProductionInput) {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("coopId", data.coopId);
    formData.set("productionDate", data.productionDate);
    formData.set("totalEggs", String(data.totalEggs));
    formData.set("goodEggs", String(data.goodEggs));
    formData.set("crackedEggs", String(data.crackedEggs ?? 0));
    formData.set("brokenEggs", String(data.brokenEggs ?? 0));
    formData.set("smallEggs", String(data.smallEggs ?? 0));
    formData.set("largeEggs", String(data.largeEggs ?? 0));
    if (data.weightKg !== undefined) {
      formData.set("weightKg", String(data.weightKg));
    }
    if (data.notes) {
      formData.set("notes", data.notes);
    }

    const result = await createProduction(formData);

    if (!result.success) {
      setError(result.error);
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Data produksi berhasil dicatat");
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
