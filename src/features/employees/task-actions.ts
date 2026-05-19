"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { taskTemplates, taskLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireRole, requireAnyRole, getCurrentUser } from "@/lib/supabase/auth";
import { createTaskTemplateSchema, updateTaskTemplateSchema } from "./task-schema";
import type { ActionResult } from "@/types";

export async function createTaskTemplate(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole("owner");

    const raw = {
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      sortOrder: formData.get("sortOrder") || 0,
    };

    const parsed = createTaskTemplateSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const [inserted] = await db
      .insert(taskTemplates)
      .values({
        ...parsed.data,
        description: parsed.data.description ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: taskTemplates.id });

    revalidatePath("/employees/tasks");
    return { success: true, data: { id: inserted!.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function updateTaskTemplate(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireRole("owner");

    const raw: Record<string, unknown> = {};
    if (formData.has("title")) raw.title = formData.get("title");
    if (formData.has("description")) raw.description = formData.get("description") || undefined;
    if (formData.has("sortOrder")) raw.sortOrder = formData.get("sortOrder");
    if (formData.has("isActive")) raw.isActive = formData.get("isActive") === "true";

    const parsed = updateTaskTemplateSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    await db
      .update(taskTemplates)
      .set({ ...parsed.data, updatedBy: user.id, updatedAt: new Date() })
      .where(eq(taskTemplates.id, id));

    revalidatePath("/employees/tasks");
    revalidatePath(`/employees/tasks/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deleteTaskTemplate(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");
    await db.delete(taskTemplates).where(eq(taskTemplates.id, id));
    revalidatePath("/employees/tasks");
    revalidatePath("/checklist");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function toggleTaskLog(templateId: string): Promise<ActionResult> {
  try {
    const user = await requireAnyRole(["owner", "worker"]);
    const today = new Date().toISOString().slice(0, 10);

    const [existing] = await db
      .select()
      .from(taskLogs)
      .where(
        and(
          eq(taskLogs.templateId, templateId),
          eq(taskLogs.userId, user.id),
          eq(taskLogs.logDate, today),
        ),
      )
      .limit(1);

    if (existing) {
      await db.delete(taskLogs).where(eq(taskLogs.id, existing.id));
    } else {
      await db.insert(taskLogs).values({
        templateId,
        userId: user.id,
        logDate: today,
      });
    }

    revalidatePath("/checklist");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function resetDailyTasks(userId?: string): Promise<ActionResult> {
  try {
    const caller = await requireAnyRole(["owner", "worker"]);
    const today = new Date().toISOString().slice(0, 10);

    const targetUserId = userId ?? caller.id;

    if (caller.role === "worker" && targetUserId !== caller.id) {
      return { success: false, error: "Tidak memiliki akses" };
    }

    await db
      .delete(taskLogs)
      .where(and(eq(taskLogs.userId, targetUserId), eq(taskLogs.logDate, today)));

    revalidatePath("/checklist");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}
