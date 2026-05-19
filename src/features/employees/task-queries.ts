import { db } from "@/lib/db";
import { taskTemplates, taskLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { TaskTemplate, TaskLog } from "@/types";

export type ChecklistItem = {
  template: TaskTemplate;
  log: TaskLog | null;
};

export async function getTaskTemplates(): Promise<TaskTemplate[]> {
  return db.select().from(taskTemplates).orderBy(taskTemplates.sortOrder);
}

export async function getActiveTaskTemplates(): Promise<TaskTemplate[]> {
  return db
    .select()
    .from(taskTemplates)
    .where(eq(taskTemplates.isActive, true))
    .orderBy(taskTemplates.sortOrder);
}

export async function getTaskTemplateById(id: string): Promise<TaskTemplate | undefined> {
  const [template] = await db
    .select()
    .from(taskTemplates)
    .where(eq(taskTemplates.id, id))
    .limit(1);
  return template;
}

export async function getTodayChecklist(userId: string): Promise<ChecklistItem[]> {
  const today = new Date().toISOString().slice(0, 10);

  const templates = await db
    .select()
    .from(taskTemplates)
    .where(eq(taskTemplates.isActive, true))
    .orderBy(taskTemplates.sortOrder);

  if (templates.length === 0) return [];

  const logs = await db
    .select()
    .from(taskLogs)
    .where(and(eq(taskLogs.userId, userId), eq(taskLogs.logDate, today)));

  const logMap = new Map(logs.map((l) => [l.templateId, l]));

  return templates.map((template) => ({
    template,
    log: logMap.get(template.id) ?? null,
  }));
}

export async function getTaskHistory(templateId: string, limit = 20): Promise<TaskLog[]> {
  return db
    .select()
    .from(taskLogs)
    .where(eq(taskLogs.templateId, templateId))
    .orderBy(desc(taskLogs.completedAt))
    .limit(limit);
}

export async function getTodayChecklistSummary(
  userId: string,
): Promise<{ total: number; done: number }> {
  const today = new Date().toISOString().slice(0, 10);

  const [templates, logs] = await Promise.all([
    db
      .select({ id: taskTemplates.id })
      .from(taskTemplates)
      .where(eq(taskTemplates.isActive, true)),
    db
      .select({ id: taskLogs.id })
      .from(taskLogs)
      .where(and(eq(taskLogs.userId, userId), eq(taskLogs.logDate, today))),
  ]);

  return { total: templates.length, done: logs.length };
}
