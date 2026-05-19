import { z } from "zod";

export const createTaskTemplateSchema = z.object({
  title: z.string().min(1, "Judul tugas wajib diisi"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateTaskTemplateSchema = createTaskTemplateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateTaskTemplateInput = z.infer<typeof createTaskTemplateSchema>;
export type UpdateTaskTemplateInput = z.infer<typeof updateTaskTemplateSchema>;
