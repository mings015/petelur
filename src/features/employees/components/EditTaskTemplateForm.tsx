"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TaskTemplateForm } from "./TaskTemplateForm";
import { updateTaskTemplate, deleteTaskTemplate } from "../task-actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { TaskTemplate } from "@/types";
import type { CreateTaskTemplateInput } from "../task-schema";

interface EditTaskTemplateFormProps {
  template: TaskTemplate;
}

export function EditTaskTemplateForm({ template }: EditTaskTemplateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: CreateTaskTemplateInput) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.set("title", data.title);
    formData.set("description", data.description ?? "");
    formData.set("sortOrder", String(data.sortOrder));

    const boundAction = updateTaskTemplate.bind(null, template.id);
    const result = await boundAction(formData);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Tugas berhasil diperbarui");
    router.push("/employees/tasks");
  }

  async function handleDelete() {
    const boundAction = deleteTaskTemplate.bind(null, template.id);
    const result = await boundAction();
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Tugas berhasil dihapus");
    router.push("/employees/tasks");
  }

  return (
    <div className="space-y-6">
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <TaskTemplateForm
        defaultValues={{
          title: template.title,
          description: template.description ?? undefined,
          sortOrder: template.sortOrder,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Simpan Perubahan"
      />

      <div className="pt-2 border-t">
        <ConfirmDialog
          trigger={
            <button className="w-full h-12 text-base rounded-md border border-destructive text-destructive hover:bg-destructive/10 transition-colors">
              Hapus Tugas
            </button>
          }
          title="Hapus Tugas?"
          description={`Tugas "${template.title}" beserta semua histori checklist akan dihapus permanen.`}
          confirmLabel="Ya, Hapus"
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
