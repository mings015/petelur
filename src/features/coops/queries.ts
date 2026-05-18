import { db } from "@/lib/db";
import { coops, coopPopulations, eggProductions, healthRecords } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { Coop, CoopPopulation } from "@/types";

export async function getCoops(): Promise<Coop[]> {
  return db.select().from(coops).orderBy(coops.name);
}

export async function getCoopById(id: string): Promise<Coop | undefined> {
  const [coop] = await db.select().from(coops).where(eq(coops.id, id)).limit(1);
  return coop;
}

export type CoopWithStats = Coop & {
  totalEggs: number;
  mortalityCount: number;
};

export async function getCoopWithStats(id: string): Promise<CoopWithStats | undefined> {
  const [coop] = await db.select().from(coops).where(eq(coops.id, id)).limit(1);
  if (!coop) return undefined;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

  const [eggResult] = await db
    .select({ total: sql<number>`coalesce(sum(${eggProductions.totalEggs}), 0)` })
    .from(eggProductions)
    .where(
      sql`${eggProductions.coopId} = ${id} and ${eggProductions.productionDate} >= ${cutoff}`,
    );

  const [mortalityResult] = await db
    .select({ total: sql<number>`coalesce(sum(${healthRecords.deadCount}), 0)` })
    .from(healthRecords)
    .where(
      sql`${healthRecords.coopId} = ${id} and ${healthRecords.recordDate} >= ${cutoff}`,
    );

  return {
    ...coop,
    totalEggs: Number(eggResult?.total ?? 0),
    mortalityCount: Number(mortalityResult?.total ?? 0),
  };
}

export async function getCoopPopulationHistory(coopId: string): Promise<CoopPopulation[]> {
  return db
    .select()
    .from(coopPopulations)
    .where(eq(coopPopulations.coopId, coopId))
    .orderBy(desc(coopPopulations.date));
}
