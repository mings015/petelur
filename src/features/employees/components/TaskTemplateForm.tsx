"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskTemplateSchema, type CreateTaskTemplateInput } from "../task-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TaskTemplateFormProps {
  defaultValues?: Partial<CreateTaskTemplateInput>;
  onSubmit: (data: CreateTaskTemplateInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TaskTemplateForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Simpan Tugas",
}: TaskTemplateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskTemplateInput>({
    resolver: zodResolver(createTaskTemplateSchema) as Resolver<CreateTaskTemplateInput>,
    defaultValues: { sortOrder: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Tugas</Label>
        <Input
          id="title"
          type="text"
          className="h-12 text-base"
          placeholder="Contoh: Kumpulkan telur pagi"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi (opsional)</Label>
        <Textarea
          id="description"
          className="min-h-[80px] text-base"
          placeholder="Penjelasan singkat tentang tugas ini..."
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Urutan</Label>
        <Input
          id="sortOrder"
          type="number"
          min="0"
          className="h-12 text-base"
          placeholder="0"
          {...register("sortOrder", { valueAsNumber: true })}
        />
        {errors.sortOrder && <p className="text-sm text-destructive">{errors.sortOrder.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-12 text-base">
        {isLoading ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
