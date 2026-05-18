import { cache } from "react";
import { createClient } from "./server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@/types";

// cache() deduplicates calls within a single server request lifecycle.
// If multiple components/actions call getSession() in the same request, only 1 network call is made.
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

export const getCurrentUser = cache(async () => {
  const authUser = await getSession();
  if (!authUser) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  return user ?? null;
});

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  if (!user || user.role !== role) {
    throw new Error("Unauthorized");
  }
  return user;
}
