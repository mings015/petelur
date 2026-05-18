import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

type DrizzleDb = ReturnType<typeof drizzle>;
const g = globalThis as typeof globalThis & { _db?: DrizzleDb };

if (!g._db) {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  g._db = drizzle(client, { schema });
}

export const db = g._db;
