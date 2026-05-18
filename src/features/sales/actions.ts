"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { eggSales, incomes, customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/supabase/auth";
import { createSaleSchema, createCustomerSchema, updateCustomerSchema } from "./schema";
import type { ActionResult } from "@/types";

export async function createSale(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole("owner");

    const raw = {
      saleDate: formData.get("saleDate"),
      customerId: formData.get("customerId") || undefined,
      eggCategoryId: formData.get("eggCategoryId"),
      quantity: formData.get("quantity"),
      unit: formData.get("unit"),
      pricePerUnit: formData.get("pricePerUnit"),
      notes: formData.get("notes") || undefined,
    };

    const parsed = createSaleSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const data = parsed.data;
    const totalAmount = (data.quantity * data.pricePerUnit).toFixed(2);

    let saleId: string;

    await db.transaction(async (tx) => {
      const [sale] = await tx
        .insert(eggSales)
        .values({
          saleDate: data.saleDate,
          customerId: data.customerId ?? null,
          eggCategoryId: data.eggCategoryId,
          quantity: String(data.quantity),
          unit: data.unit,
          pricePerUnit: String(data.pricePerUnit),
          totalAmount,
          notes: data.notes ?? null,
          createdBy: user.id,
          updatedBy: user.id,
        })
        .returning({ id: eggSales.id });

      saleId = sale!.id;

      await tx.insert(incomes).values({
        incomeDate: data.saleDate,
        type: "egg_sale",
        sourceId: saleId,
        description: `Penjualan telur`,
        amount: totalAmount,
        paymentMethod: "tunai",
        createdBy: user.id,
        updatedBy: user.id,
      });
    });

    revalidatePath("/sales");
    revalidatePath("/finance");
    return { success: true, data: { id: saleId! } };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deleteSale(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");

    await db.transaction(async (tx) => {
      await tx.delete(incomes).where(eq(incomes.sourceId, id));
      await tx.delete(eggSales).where(eq(eggSales.id, id));
    });

    revalidatePath("/sales");
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

export async function createCustomer(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole("owner");

    const raw = {
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
      notes: formData.get("notes") || undefined,
    };

    const parsed = createCustomerSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const [inserted] = await db
      .insert(customers)
      .values({
        ...parsed.data,
        phone: parsed.data.phone ?? null,
        address: parsed.data.address ?? null,
        notes: parsed.data.notes ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: customers.id });

    revalidatePath("/sales/customers");
    return { success: true, data: { id: inserted!.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function updateCustomer(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireRole("owner");

    const raw: Record<string, unknown> = {};
    if (formData.get("name")) raw.name = formData.get("name");
    if (formData.get("phone") !== null) raw.phone = formData.get("phone") || undefined;
    if (formData.get("address") !== null) raw.address = formData.get("address") || undefined;
    if (formData.get("notes") !== null) raw.notes = formData.get("notes") || undefined;

    const parsed = updateCustomerSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    await db
      .update(customers)
      .set({ ...parsed.data, updatedBy: user.id, updatedAt: new Date() })
      .where(eq(customers.id, id));

    revalidatePath("/sales/customers");
    revalidatePath(`/sales/customers/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/sales/customers");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}
