"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SaleForm } from "./SaleForm";
import { createSale } from "../actions";
import type { CreateSaleInput } from "../schema";
import type { EggCategory, Customer } from "@/types";

interface NewSaleFormProps {
  categories: EggCategory[];
  customers: Customer[];
}

export function NewSaleForm({ categories, customers }: NewSaleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateSaleInput) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("saleDate", data.saleDate);
    if (data.customerId) formData.set("customerId", data.customerId);
    formData.set("eggCategoryId", data.eggCategoryId);
    formData.set("quantity", String(data.quantity));
    formData.set("unit", data.unit);
    formData.set("pricePerUnit", String(data.pricePerUnit));
    if (data.notes) formData.set("notes", data.notes);

    const result = await createSale(formData);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Penjualan berhasil dicatat");
    router.push("/sales");
  }

  return (
    <div className="space-y-4">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <SaleForm
        categories={categories}
        customers={customers}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
