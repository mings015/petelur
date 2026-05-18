"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CoopForm } from "./CoopForm";
import { updateCoop } from "../actions";
import type { CreateCoopInput } from "../schema";
import type { Coop } from "@/types";

interface EditCoopFormProps {
  coop: Coop;
}

export function EditCoopForm({ coop }: EditCoopFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const defaultValues: Partial<CreateCoopInput> = {
    name: coop.name,
    capacity: coop.capacity,
    chickenCount: coop.chickenCount,
    chickenAgeWeeks: coop.chickenAgeWeeks ?? undefined,
    docEntryDate: coop.docEntryDate ?? undefined,
    status: coop.status as "active" | "inactive" | "empty",
    notes: coop.notes ?? undefined,
  };

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

    const boundAction = updateCoop.bind(null, coop.id);
    const result = await boundAction(formData);
    if (!result.success) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Kandang berhasil diperbarui");
    router.push(`/coops/${coop.id}`);
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <CoopForm defaultValues={defaultValues} onSubmit={handleSubmit} />
    </div>
  );
}
