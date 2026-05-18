"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomerForm } from "./CustomerForm";
import { createCustomer } from "../actions";
import type { CreateCustomerInput } from "../schema";

export function NewCustomerForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateCustomerInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    if (data.phone) formData.set("phone", data.phone);
    if (data.address) formData.set("address", data.address);
    if (data.notes) formData.set("notes", data.notes);

    const result = await createCustomer(formData);
    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Pelanggan berhasil ditambahkan");
    router.push("/sales/customers");
  }

  return (
    <div className="space-y-4">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <CustomerForm onSubmit={handleSubmit} submitLabel="Tambah Pelanggan" />
    </div>
  );
}
