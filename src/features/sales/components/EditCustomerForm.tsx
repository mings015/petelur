"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomerForm } from "./CustomerForm";
import { updateCustomer } from "../actions";
import type { CreateCustomerInput } from "../schema";
import type { Customer } from "@/types";

interface EditCustomerFormProps {
  customer: Customer;
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateCustomerInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("phone", data.phone ?? "");
    formData.set("address", data.address ?? "");
    formData.set("notes", data.notes ?? "");

    const boundAction = updateCustomer.bind(null, customer.id);
    const result = await boundAction(formData);
    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Data pelanggan berhasil diperbarui");
    router.push(`/sales/customers/${customer.id}`);
  }

  return (
    <div className="space-y-4">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <CustomerForm
        defaultValues={{
          name: customer.name,
          phone: customer.phone ?? undefined,
          address: customer.address ?? undefined,
          notes: customer.notes ?? undefined,
        }}
        onSubmit={handleSubmit}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
