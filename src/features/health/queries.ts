import { db } from "@/lib/db";
import { healthRecords, vaccinationSchedules, coops } from "@/db/schema";
import { eq, desc, asc, gte, isNull, sql, getTableColumns } from "drizzle-orm";

export async function getHealthRecords(limit?: number) {
  const query = db
    .select({
      ...getTableColumns(healthRecords),
      coopName: coops.name,
    })
    .from(healthRecords)
    .leftJoin(coops, eq(healthRecords.coopId, coops.id))
    .orderBy(desc(healthRecords.recordDate));

  if (limit !== undefined) {
    return query.limit(limit);
  }

  return query;
}

export async function getHealthRecordsByCoopId(
  coopId: string,
  limit?: number,
) {
  const query = db
    .select({
      ...getTableColumns(healthRecords),
      coopName: coops.name,
    })
    .from(healthRecords)
    .leftJoin(coops, eq(healthRecords.coopId, coops.id))
    .where(eq(healthRecords.coopId, coopId))
    .orderBy(desc(healthRecords.recordDate));

  if (limit !== undefined) {
    return query.limit(limit);
  }

  return query;
}

export async function getMortalitySummaryLast30Days(): Promise<{
  totalDead: number;
  totalSick: number;
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

  const [result] = await db
    .select({
      totalDead: sql<number>`COALESCE(SUM(${healthRecords.deadCount}), 0)`,
      totalSick: sql<number>`COALESCE(SUM(${healthRecords.sickCount}), 0)`,
    })
    .from(healthRecords)
    .where(gte(healthRecords.recordDate, cutoff));

  return {
    totalDead: Number(result?.totalDead ?? 0),
    totalSick: Number(result?.totalSick ?? 0),
  };
}

export async function getMortalityByCoopLast30Days(): Promise<
  Array<{ coopName: string; totalDead: number }>
> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

  const rows = await db
    .select({
      coopName: coops.name,
      totalDead: sql<number>`COALESCE(SUM(${healthRecords.deadCount}), 0)`,
    })
    .from(healthRecords)
    .leftJoin(coops, eq(healthRecords.coopId, coops.id))
    .where(gte(healthRecords.recordDate, cutoff))
    .groupBy(coops.name);

  return rows.map((row) => ({
    coopName: row.coopName ?? "",
    totalDead: Number(row.totalDead),
  }));
}

export async function getVaccinationSchedules() {
  return db
    .select({
      ...getTableColumns(vaccinationSchedules),
      coopName: coops.name,
    })
    .from(vaccinationSchedules)
    .leftJoin(coops, eq(vaccinationSchedules.coopId, coops.id))
    .where(isNull(vaccinationSchedules.completedAt))
    .orderBy(asc(vaccinationSchedules.scheduledDate));
}

export async function getAllVaccinationSchedules() {
  return db
    .select({
      ...getTableColumns(vaccinationSchedules),
      coopName: coops.name,
    })
    .from(vaccinationSchedules)
    .leftJoin(coops, eq(vaccinationSchedules.coopId, coops.id))
    .orderBy(desc(vaccinationSchedules.scheduledDate));
}
