"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FeedUsageForm } from "./FeedUsageForm";
import { recordFeedUsage } from "../actions";
import { useOfflineSubmit } from "@/hooks/use-offline-submit";
import type { FeedUsageInput } from "../schema";

interface NewFeedUsageFormProps {
  feedStocks: Array<{
    id: string;
    name: string;
    unit: string;
    currentStock: string;
  }>;
  coops: Array<{ id: string; name: string }>;
}

export function NewFeedUsageForm({ feedStocks, coops }: NewFeedUsageFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { submitOrQueue } = useOfflineSubmit("feed_usage");

  async function handleSubmit(data: FeedUsageInput) {
    setIsLoading(true);
    setServerError(null);

    const payload: Record<string, string> = {
      feedStockId: data.feedStockId,
      coopId: data.coopId,
      quantity: String(data.quantity),
      date: data.date,
    };
    if (data.notes) payload.notes = data.notes;

    const result = await submitOrQueue(payload, recordFeedUsage);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error ?? "Gagal menyimpan");
      toast.error(result.error);
      return;
    }
    if (!result.queued) toast.success("Pemakaian pakan berhasil dicatat");
    router.push("/feed");
  }

  return (
    <div className="space-y-4">
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}
      <FeedUsageForm
        feedStocks={feedStocks}
        coops={coops}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
