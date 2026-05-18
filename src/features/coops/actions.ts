"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { coops, coopPopulations } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createCoopSchema, updateCoopSchema } from "./schema";
import type { ActionResult } from "@/types";

function parseFormNumber(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return isNaN(n) ? undefined : n;
}

export async function createCoop(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const raw = {
    name: formData.get("name"),
    capacity: parseFormNumber(formData.get("capacity")),
    chickenCount: parseFormNumber(formData.get("chickenCount")) ?? 0,
    chickenAgeWeeks: parseFormNumber(formData.get("chickenAgeWeeks")),
    docEntryDate: formData.get("docEntryDate") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = createCoopSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "Data tidak valid" };
  }

  const data = parsed.data;

  const [inserted] = await db
    .insert(coops)
    .values({
      name: data.name,
      capacity: data.capacity,
      chickenCount: data.chickenCount ?? 0,
      chickenAgeWeeks: data.chickenAgeWeeks ?? null,
      docEntryDate: data.docEntryDate ?? null,
      status: data.status,
      notes: data.notes ?? null,
      createdBy: user.id,
      updatedBy: user.id,
    })
    .returning({ id: coops.id });

  if (!inserted) return { success: false, error: "Gagal menyimpan kandang" };

  return { success: true, data: { id: inserted.id } };
}

export async function updateCoop(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const raw: Record<string, unknown> = {};
  if (formData.get("name") !== null) raw.name = formData.get("name");
  if (formData.get("capacity") !== null && formData.get("capacity") !== "")
    raw.capacity = parseFormNumber(formData.get("capacity"));
  if (formData.get("chickenCount") !== null && formData.get("chickenCount") !== "")
    raw.chickenCount = parseFormNumber(formData.get("chickenCount"));
  if (formData.get("chickenAgeWeeks") !== null && formData.get("chickenAgeWeeks") !== "")
    raw.chickenAgeWeeks = parseFormNumber(formData.get("chickenAgeWeeks"));
  if (formData.get("docEntryDate") !== null && formData.get("docEntryDate") !== "")
    raw.docEntryDate = formData.get("docEntryDate");
  if (formData.get("status") !== null) raw.status = formData.get("status");
  if (formData.get("notes") !== null) raw.notes = formData.get("notes") || undefined;

  const parsed = updateCoopSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "Data tidak valid" };
  }

  const data = parsed.data;

  await db
    .update(coops)
    .set({
      ...data,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(eq(coops.id, id));

  return { success: true, data: undefined };
}

export async function deleteCoop(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  await db.delete(coops).where(eq(coops.id, id));
  return { success: true, data: undefined };
}

const populationRecordSchema = z.object({
  type: z.enum(["addition", "reduction", "mutation_in", "mutation_out"]),
  count: z
    .number()
    .int()
    .positive("Jumlah harus lebih dari 0"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export async function addPopulationRecord(
  coopId: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const raw = {
    type: formData.get("type"),
    count: parseFormNumber(formData.get("count")),
    date: formData.get("date"),
    reason: formData.get("reason") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const parsed = populationRecordSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "Data tidak valid" };
  }

  const data = parsed.data;

  await db.insert(coopPopulations).values({
    coopId,
    type: data.type,
    count: data.count,
    date: data.date,
    reason: data.reason ?? null,
    notes: data.notes ?? null,
    createdBy: user.id,
  });

  const delta =
    data.type === "addition" || data.type === "mutation_in"
      ? data.count
      : -data.count;

  await db
    .update(coops)
    .set({
      chickenCount: sql`greatest(0, ${coops.chickenCount} + ${delta})`,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(eq(coops.id, coopId));

  revalidatePath(`/coops/${coopId}`);
  revalidatePath("/coops");
  return { success: true, data: undefined };
}
