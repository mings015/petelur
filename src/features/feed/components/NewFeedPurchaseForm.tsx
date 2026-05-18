"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FeedPurchaseForm } from "./FeedPurchaseForm";
import { recordFeedPurchase } from "../actions";
import type { FeedPurchaseInput } from "../schema";

interface NewFeedPurchaseFormProps {
  feedStocks: Array<{ id: string; name: string; unit: string }>;
}

export function NewFeedPurchaseForm({ feedStocks }: NewFeedPurchaseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: FeedPurchaseInput) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("feedStockId", data.feedStockId);
    formData.set("quantity", String(data.quantity));
    if (data.pricePerUnit !== undefined) {
      formData.set("pricePerUnit", String(data.pricePerUnit));
    }
    if (data.supplier) formData.set("supplier", data.supplier);
    formData.set("date", data.date);
    if (data.notes) formData.set("notes", data.notes);

    const result = await recordFeedPurchase(formData);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Pembelian pakan berhasil dicatat");
    router.push("/feed");
  }

  return (
    <div className="space-y-4">
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}
      <FeedPurchaseForm
        feedStocks={feedStocks}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
