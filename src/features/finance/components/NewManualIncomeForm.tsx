"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ManualIncomeForm } from "./ManualIncomeForm";
import { createManualIncome } from "../actions";
import type { CreateManualIncomeInput } from "../schema";

export function NewManualIncomeForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateManualIncomeInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("incomeDate", data.incomeDate);
    formData.set("description", data.description);
    formData.set("amount", String(data.amount));
    formData.set("paymentMethod", data.paymentMethod);
    formData.set("notes", data.notes ?? "");

    const result = await createManualIncome(formData);
    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Pemasukan berhasil dicatat");
    router.push("/finance");
  }

  return (
    <div className="space-y-4">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <ManualIncomeForm onSubmit={handleSubmit} />
    </div>
  );
}
