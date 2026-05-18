"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FeedUsageForm } from "./FeedUsageForm";
import { recordFeedUsage } from "../actions";
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

  async function handleSubmit(data: FeedUsageInput) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("feedStockId", data.feedStockId);
    formData.set("coopId", data.coopId);
    formData.set("quantity", String(data.quantity));
    formData.set("date", data.date);
    if (data.notes) formData.set("notes", data.notes);

    const result = await recordFeedUsage(formData);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Pemakaian pakan berhasil dicatat");
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
