"use server";

import { db } from "@/lib/db";
import { feedStocks, feedTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/supabase/auth";
import {
  createFeedStockSchema,
  feedUsageSchema,
  feedPurchaseSchema,
} from "./schema";
import type { ActionResult } from "@/types";

export async function createFeedStock(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const raw = {
    name: formData.get("name"),
    unit: formData.get("unit") || "kg",
    currentStock: formData.get("currentStock"),
    minimumStock: formData.get("minimumStock"),
    pricePerUnit: formData.get("pricePerUnit") || undefined,
    supplier: formData.get("supplier") || undefined,
  };

  const parsed = createFeedStockSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError?.message ?? "Data tidak valid" };
  }

  const data = parsed.data;

  try {
    const [inserted] = await db
      .insert(feedStocks)
      .values({
        name: data.name,
        unit: data.unit,
        currentStock: String(data.currentStock),
        minimumStock: String(data.minimumStock),
        pricePerUnit:
          data.pricePerUnit !== undefined ? String(data.pricePerUnit) : null,
        supplier: data.supplier ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: feedStocks.id });

    if (!inserted) {
      return { success: false, error: "Gagal menyimpan data pakan" };
    }

    return { success: true, data: { id: inserted.id } };
  } catch {
    return { success: false, error: "Terjadi kesalahan saat menyimpan data" };
  }
}

export async function recordFeedUsage(
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const raw = {
    feedStockId: formData.get("feedStockId"),
    coopId: formData.get("coopId"),
    quantity: formData.get("quantity"),
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = feedUsageSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError?.message ?? "Data tidak valid" };
  }

  const data = parsed.data;
  const qty = data.quantity;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(feedTransactions).values({
        feedStockId: data.feedStockId,
        type: "usage",
        quantity: String(qty),
        coopId: data.coopId,
        date: data.date,
        notes: data.notes ?? null,
        createdBy: user.id,
      });

      await tx
        .update(feedStocks)
        .set({
          currentStock: sql`current_stock - ${qty}`,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(feedStocks.id, data.feedStockId));
    });

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Terjadi kesalahan saat mencatat pemakaian" };
  }
}

export async function recordFeedPurchase(
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Tidak terautentikasi" };

  const raw = {
    feedStockId: formData.get("feedStockId"),
    quantity: formData.get("quantity"),
    pricePerUnit: formData.get("pricePerUnit") || undefined,
    supplier: formData.get("supplier") || undefined,
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = feedPurchaseSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError?.message ?? "Data tidak valid" };
  }

  const data = parsed.data;
  const qty = data.quantity;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(feedTransactions).values({
        feedStockId: data.feedStockId,
        type: "purchase",
        quantity: String(qty),
        coopId: null,
        pricePerUnit:
          data.pricePerUnit !== undefined ? String(data.pricePerUnit) : null,
        supplier: data.supplier ?? null,
        date: data.date,
        notes: data.notes ?? null,
        createdBy: user.id,
      });

      await tx
        .update(feedStocks)
        .set({
          currentStock: sql`current_stock + ${qty}`,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(feedStocks.id, data.feedStockId));
    });

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Terjadi kesalahan saat mencatat pembelian" };
  }
}
