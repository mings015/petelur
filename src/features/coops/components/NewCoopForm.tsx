"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CoopForm } from "./CoopForm";
import { createCoop } from "../actions";
import type { CreateCoopInput } from "../schema";

export function NewCoopForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CreateCoopInput) {
    setError(null);

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("capacity", String(data.capacity));
    formData.set("chickenCount", String(data.chickenCount ?? 0));
    if (data.chickenAgeWeeks !== undefined)
      formData.set("chickenAgeWeeks", String(data.chickenAgeWeeks));
    if (data.docEntryDate) formData.set("docEntryDate", data.docEntryDate);
    formData.set("status", data.status);
    if (data.notes) formData.set("notes", data.notes);

    const result = await createCoop(formData);
    if (!result.success) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Kandang berhasil ditambahkan");
    router.push("/coops");
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <CoopForm onSubmit={handleSubmit} />
    </div>
  );
}
