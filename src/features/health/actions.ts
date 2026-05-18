"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { healthRecords, vaccinationSchedules, coops } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createHealthRecordSchema, createVaccinationSchema } from "./schema";
import type { ActionResult } from "@/types";

export async function createHealthRecord(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Tidak terautentikasi" };

    const raw = {
      coopId: formData.get("coopId"),
      recordDate: formData.get("recordDate"),
      sickCount: formData.get("sickCount"),
      deadCount: formData.get("deadCount"),
      treatment: formData.get("treatment") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = createHealthRecordSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const data = parsed.data;

    const [inserted] = await db
      .insert(healthRecords)
      .values({
        coopId: data.coopId,
        recordDate: data.recordDate,
        sickCount: data.sickCount,
        deadCount: data.deadCount,
        treatment: data.treatment ?? null,
        notes: data.notes ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: healthRecords.id });

    if (!inserted) {
      return { success: false, error: "Gagal menyimpan catatan kesehatan" };
    }

    if (data.deadCount > 0) {
      await db
        .update(coops)
        .set({
          chickenCount: sql`GREATEST(chicken_count - ${data.deadCount}, 0)`,
          updatedBy: user.id,
          updatedAt: new Date(),
        })
        .where(eq(coops.id, data.coopId));
    }

    revalidatePath("/health");
    return { success: true, data: { id: inserted.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function createVaccinationSchedule(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Tidak terautentikasi" };

    const raw = {
      coopId: formData.get("coopId"),
      vaccineName: formData.get("vaccineName"),
      scheduledDate: formData.get("scheduledDate"),
      notes: formData.get("notes") || undefined,
    };

    const parsed = createVaccinationSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const data = parsed.data;

    const [inserted] = await db
      .insert(vaccinationSchedules)
      .values({
        coopId: data.coopId,
        vaccineName: data.vaccineName,
        scheduledDate: data.scheduledDate,
        notes: data.notes ?? null,
        createdBy: user.id,
      })
      .returning({ id: vaccinationSchedules.id });

    if (!inserted) {
      return { success: false, error: "Gagal menyimpan jadwal vaksinasi" };
    }

    revalidatePath("/health");
    return { success: true, data: { id: inserted.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function markVaccinationComplete(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Tidak terautentikasi" };

    await db
      .update(vaccinationSchedules)
      .set({ completedAt: new Date() })
      .where(eq(vaccinationSchedules.id, id));

    revalidatePath("/health");
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}
