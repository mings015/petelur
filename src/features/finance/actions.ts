"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { expenses, incomes, eggSales } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/supabase/auth";
import { createExpenseSchema, createManualIncomeSchema } from "./schema";
import type { ActionResult } from "@/types";

export async function createExpense(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole("owner");

    const raw = {
      expenseDate: formData.get("expenseDate"),
      categoryId: formData.get("categoryId"),
      amount: formData.get("amount"),
      paymentMethod: formData.get("paymentMethod"),
      description: formData.get("description") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = createExpenseSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const data = parsed.data;
    const [inserted] = await db
      .insert(expenses)
      .values({
        expenseDate: data.expenseDate,
        categoryId: data.categoryId,
        amount: String(data.amount),
        paymentMethod: data.paymentMethod,
        description: data.description ?? null,
        notes: data.notes ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: expenses.id });

    revalidatePath("/finance");
    return { success: true, data: { id: inserted!.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");
    await db.delete(expenses).where(eq(expenses.id, id));
    revalidatePath("/finance");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function createManualIncome(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole("owner");

    const raw = {
      incomeDate: formData.get("incomeDate"),
      description: formData.get("description"),
      amount: formData.get("amount"),
      paymentMethod: formData.get("paymentMethod"),
      notes: formData.get("notes") || undefined,
    };

    const parsed = createManualIncomeSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const data = parsed.data;
    const [inserted] = await db
      .insert(incomes)
      .values({
        incomeDate: data.incomeDate,
        type: "manual",
        sourceId: null,
        description: data.description,
        amount: String(data.amount),
        paymentMethod: data.paymentMethod,
        notes: data.notes ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: incomes.id });

    revalidatePath("/finance");
    return { success: true, data: { id: inserted!.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deleteIncome(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");

    const [income] = await db
      .select({ type: incomes.type, sourceId: incomes.sourceId })
      .from(incomes)
      .where(eq(incomes.id, id))
      .limit(1);

    if (!income) return { success: false, error: "Data tidak ditemukan" };

    await db.transaction(async (tx) => {
      await tx.delete(incomes).where(eq(incomes.id, id));
      if (income.type === "egg_sale" && income.sourceId) {
        await tx.delete(eggSales).where(eq(eggSales.id, income.sourceId));
      }
    });

    revalidatePath("/finance");
    revalidatePath("/sales");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}
