import { db } from "@/lib/db";
import { eggProductions, coops } from "@/db/schema";
import { eq, desc, gte, sql, getTableColumns } from "drizzle-orm";

export async function getProductions(limit?: number) {
  const query = db
    .select({
      ...getTableColumns(eggProductions),
      coopName: coops.name,
    })
    .from(eggProductions)
    .leftJoin(coops, eq(eggProductions.coopId, coops.id))
    .orderBy(desc(eggProductions.productionDate));

  if (limit !== undefined) {
    return query.limit(limit);
  }

  return query;
}

export async function getProductionsByCoopId(coopId: string, limit?: number) {
  const query = db
    .select({
      ...getTableColumns(eggProductions),
      coopName: coops.name,
    })
    .from(eggProductions)
    .leftJoin(coops, eq(eggProductions.coopId, coops.id))
    .where(eq(eggProductions.coopId, coopId))
    .orderBy(desc(eggProductions.productionDate));

  if (limit !== undefined) {
    return query.limit(limit);
  }

  return query;
}

export async function getTodayProductionSummary() {
  const today = new Date().toISOString().slice(0, 10);

  const [result] = await db
    .select({
      totalEggs: sql<number>`COALESCE(SUM(${eggProductions.totalEggs}), 0)`,
      goodEggs: sql<number>`COALESCE(SUM(${eggProductions.goodEggs}), 0)`,
    })
    .from(eggProductions)
    .where(eq(eggProductions.productionDate, today));

  return result ?? { totalEggs: 0, goodEggs: 0 };
}

export async function getProductionChartData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const rows = await db
    .select({
      date: eggProductions.productionDate,
      totalEggs: sql<number>`SUM(${eggProductions.totalEggs})`,
      chickenCount: sql<number>`SUM(${coops.chickenCount})`,
    })
    .from(eggProductions)
    .leftJoin(coops, eq(eggProductions.coopId, coops.id))
    .where(gte(eggProductions.productionDate, fromDate))
    .groupBy(eggProductions.productionDate)
    .orderBy(eggProductions.productionDate);

  return rows.map((row) => {
    const hdp =
      row.chickenCount > 0
        ? Math.round((row.totalEggs / row.chickenCount) * 100 * 10) / 10
        : 0;
    return {
      date: row.date,
      totalEggs: row.totalEggs,
      hdp,
    };
  });
}
