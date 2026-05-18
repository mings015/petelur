"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExpenseForm } from "./ExpenseForm";
import { createExpense } from "../actions";
import type { CreateExpenseInput } from "../schema";
import type { ExpenseCategory } from "@/types";

interface NewExpenseFormProps {
  categories: ExpenseCategory[];
}

export function NewExpenseForm({ categories }: NewExpenseFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateExpenseInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("expenseDate", data.expenseDate);
    formData.set("categoryId", data.categoryId);
    formData.set("amount", String(data.amount));
    formData.set("paymentMethod", data.paymentMethod);
    formData.set("description", data.description ?? "");
    formData.set("notes", data.notes ?? "");

    const result = await createExpense(formData);
    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Pengeluaran berhasil dicatat");
    router.push("/finance");
  }

  return (
    <div className="space-y-4">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <ExpenseForm categories={categories} onSubmit={handleSubmit} />
    </div>
  );
}
