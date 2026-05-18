"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HealthRecordForm } from "./HealthRecordForm";
import { createHealthRecord } from "../actions";
import type { CreateHealthRecordInput } from "../schema";

interface NewHealthRecordFormProps {
  coops: Array<{ id: string; name: string }>;
}

export function NewHealthRecordForm({ coops }: NewHealthRecordFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: CreateHealthRecordInput) => {
    const formData = new FormData();
    formData.set("coopId", data.coopId);
    formData.set("recordDate", data.recordDate);
    formData.set("sickCount", String(data.sickCount));
    formData.set("deadCount", String(data.deadCount));
    if (data.treatment) formData.set("treatment", data.treatment);
    if (data.notes) formData.set("notes", data.notes);

    const result = await createHealthRecord(formData);
    if (result.success) {
      toast.success("Catatan kesehatan berhasil disimpan");
      router.push("/health");
    } else {
      toast.error(result.error);
      throw new Error(result.error);
    }
  };

  return <HealthRecordForm coops={coops} onSubmit={handleSubmit} />;
}
