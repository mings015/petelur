"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEmployeeSchema, updateEmployeeSchema } from "./schema";
import type { ActionResult } from "@/types";

export async function createEmployee(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireRole("owner");

    const raw = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      joinedAt: formData.get("joinedAt") || undefined,
      password: formData.get("password"),
    };

    const parsed = createEmployeeSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    const { fullName, email, phone, joinedAt, password } = parsed.data;

    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message ?? "Gagal membuat akun" };
    }

    try {
      await db.insert(users).values({
        id: authData.user.id,
        email,
        fullName,
        phone: phone ?? null,
        joinedAt: joinedAt ?? null,
        role: "worker",
        isActive: true,
      });
    } catch (dbErr) {
      await admin.auth.admin.deleteUser(authData.user.id);
      const message = dbErr instanceof Error ? dbErr.message : "Gagal menyimpan data pegawai";
      return { success: false, error: message };
    }

    revalidatePath("/employees");
    return { success: true, data: { id: authData.user.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function updateEmployee(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("owner");

    const raw: Record<string, unknown> = {};
    if (formData.get("fullName")) raw.fullName = formData.get("fullName");
    if (formData.has("phone")) raw.phone = formData.get("phone") || undefined;
    if (formData.has("joinedAt")) raw.joinedAt = formData.get("joinedAt") || undefined;

    const parsed = updateEmployeeSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError ?? "Data tidak valid" };
    }

    await db
      .update(users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(users.id, id));

    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deactivateEmployee(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");

    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));

    await createAdminClient().auth.admin.updateUserById(id, {
      ban_duration: "876600h",
    });

    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function reactivateEmployee(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");

    await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id));

    await createAdminClient().auth.admin.updateUserById(id, {
      ban_duration: "none",
    });

    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");

    await createAdminClient().auth.admin.deleteUser(id);
    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/employees");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Tidak memiliki akses" };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { success: false, error: message };
  }
}
