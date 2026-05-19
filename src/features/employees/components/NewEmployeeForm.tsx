"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmployeeForm } from "./EmployeeForm";
import { createEmployee } from "../actions";
import type { CreateEmployeeInput } from "../schema";

export function NewEmployeeForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateEmployeeInput) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("fullName", data.fullName);
    formData.set("email", data.email);
    formData.set("password", data.password);
    if (data.phone) formData.set("phone", data.phone);
    if (data.joinedAt) formData.set("joinedAt", data.joinedAt);

    const result = await createEmployee(formData);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Pegawai berhasil ditambahkan");
    router.push("/employees");
  }

  return (
    <div className="space-y-4">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <EmployeeForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
