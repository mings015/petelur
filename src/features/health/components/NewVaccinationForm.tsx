"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VaccinationForm } from "./VaccinationForm";
import { createVaccinationSchedule } from "../actions";
import type { CreateVaccinationInput } from "../schema";

interface NewVaccinationFormProps {
  coops: Array<{ id: string; name: string }>;
}

export function NewVaccinationForm({ coops }: NewVaccinationFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: CreateVaccinationInput) => {
    const formData = new FormData();
    formData.set("coopId", data.coopId);
    formData.set("vaccineName", data.vaccineName);
    formData.set("scheduledDate", data.scheduledDate);
    if (data.notes) formData.set("notes", data.notes);

    const result = await createVaccinationSchedule(formData);
    if (result.success) {
      toast.success("Jadwal vaksinasi berhasil disimpan");
      router.push("/health");
    } else {
      toast.error(result.error);
      throw new Error(result.error);
    }
  };

  return <VaccinationForm coops={coops} onSubmit={handleSubmit} />;
}
