"use server";

import { db } from "@/lib/db";
import { eggProductions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { createProductionSchema } from "./schema";
import type { ActionResult } from "@/types";

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Tidak terautentikasi");
  return user.id;
}

export async function createProduction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await getAuthUserId();

    const raw = {
      coopId: formData.get("coopId"),
      productionDate: formData.get("productionDate"),
      totalEggs: formData.get("totalEggs"),
      goodEggs: formData.get("goodEggs"),
      crackedEggs: formData.get("crackedEggs"),
      brokenEggs: formData.get("brokenEggs"),
      smallEggs: formData.get("smallEggs"),
      largeEggs: formData.get("largeEggs"),
      weightKg: formData.get("weightKg") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = createProductionSchema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((e: { message: string }) => e.message)
        .join(", ");
      return { success: false, error: message };
    }

    const data = parsed.data;

    const [inserted] = await db
      .insert(eggProductions)
      .values({
        coopId: data.coopId,
        productionDate: data.productionDate,
        totalEggs: data.totalEggs,
        goodEggs: data.goodEggs,
        crackedEggs: data.crackedEggs,
        brokenEggs: data.brokenEggs,
        smallEggs: data.smallEggs,
        largeEggs: data.largeEggs,
        weightKg: data.weightKg !== undefined ? String(data.weightKg) : null,
        notes: data.notes ?? null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning({ id: eggProductions.id });

    if (!inserted) {
      return { success: false, error: "Gagal menyimpan data produksi" };
    }

    return { success: true, data: { id: inserted.id } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deleteProduction(id: string): Promise<ActionResult> {
  try {
    await getAuthUserId();

    await db
      .delete(eggProductions)
      .where(eq(eggProductions.id, id));

    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}
