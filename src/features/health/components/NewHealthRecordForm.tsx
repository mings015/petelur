"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HealthRecordForm } from "./HealthRecordForm";
import { createHealthRecord } from "../actions";
import { useOfflineSubmit } from "@/hooks/use-offline-submit";
import type { CreateHealthRecordInput } from "../schema";

interface NewHealthRecordFormProps {
  coops: Array<{ id: string; name: string }>;
}

export function NewHealthRecordForm({ coops }: NewHealthRecordFormProps) {
  const router = useRouter();
  const { submitOrQueue } = useOfflineSubmit("health");

  const handleSubmit = async (data: CreateHealthRecordInput) => {
    const payload: Record<string, string> = {
      coopId: data.coopId,
      recordDate: data.recordDate,
      sickCount: String(data.sickCount),
      deadCount: String(data.deadCount),
    };
    if (data.treatment) payload.treatment = data.treatment;
    if (data.notes) payload.notes = data.notes;

    const result = await submitOrQueue(payload, createHealthRecord);
    if (!result.success) {
      toast.error(result.error);
      throw new Error(result.error);
    }
    if (!result.queued) toast.success("Catatan kesehatan berhasil disimpan");
    router.push("/health");
  };

  return <HealthRecordForm coops={coops} onSubmit={handleSubmit} />;
}
