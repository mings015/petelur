import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import type { User } from "@/types";

export async function getEmployees(): Promise<User[]> {
  return db
    .select()
    .from(users)
    .where(eq(users.role, "worker"))
    .orderBy(asc(users.fullName));
}

export async function getEmployeeById(id: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user;
}
