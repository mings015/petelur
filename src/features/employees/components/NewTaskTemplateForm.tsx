"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TaskTemplateForm } from "./TaskTemplateForm";
import { createTaskTemplate } from "../task-actions";
import type { CreateTaskTemplateInput } from "../task-schema";

export function NewTaskTemplateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateTaskTemplateInput) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("title", data.title);
    if (data.description) formData.set("description", data.description);
    formData.set("sortOrder", String(data.sortOrder));

    const result = await createTaskTemplate(formData);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Tugas berhasil ditambahkan");
    router.push("/employees/tasks");
  }

  return (
    <div className="space-y-4">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <TaskTemplateForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Tambah Tugas" />
    </div>
  );
}
