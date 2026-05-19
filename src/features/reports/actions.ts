"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { reportSchedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/supabase/auth";
import { createScheduleSchema } from "./schema";
import { computeNextRun } from "./generators/data";
import type { ActionResult, ReportFrequency } from "@/types";

export async function createSchedule(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole("owner");

    const raw = {
      type: formData.get("type"),
      frequency: formData.get("frequency"),
      format: formData.get("format") || "xlsx",
      coopId: formData.get("coopId") || undefined,
    };

    const parsed = createScheduleSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const nextRun = computeNextRun(parsed.data.frequency as ReportFrequency);

    const [inserted] = await db
      .insert(reportSchedules)
      .values({
        type: parsed.data.type,
        frequency: parsed.data.frequency,
        format: parsed.data.format,
        coopId: parsed.data.coopId ?? null,
        nextRun,
        createdBy: user.id,
      })
      .returning({ id: reportSchedules.id });

    revalidatePath("/reports/schedules");
    return { success: true, data: { id: inserted!.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function toggleSchedule(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");

    const [schedule] = await db
      .select({ isActive: reportSchedules.isActive })
      .from(reportSchedules)
      .where(eq(reportSchedules.id, id))
      .limit(1);

    if (!schedule) return { success: false, error: "Jadwal tidak ditemukan" };

    await db
      .update(reportSchedules)
      .set({ isActive: !schedule.isActive, updatedAt: new Date() })
      .where(eq(reportSchedules.id, id));

    revalidatePath("/reports/schedules");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function deleteSchedule(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");
    await db.delete(reportSchedules).where(eq(reportSchedules.id, id));
    revalidatePath("/reports/schedules");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}
