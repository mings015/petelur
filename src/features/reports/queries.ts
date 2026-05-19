import { db } from "@/lib/db";
import { reports, reportSchedules, coops } from "@/db/schema";
import { desc, eq, and, getTableColumns } from "drizzle-orm";
import type { Report, ReportSchedule } from "@/types";

export type ReportWithCoop = Report & { coopName: string | null };
export type ScheduleWithCoop = ReportSchedule & { coopName: string | null };

export async function getReportHistory(limit = 20): Promise<ReportWithCoop[]> {
  const rows = await db
    .select({
      ...getTableColumns(reports),
      coopName: coops.name,
    })
    .from(reports)
    .leftJoin(coops, eq(reports.coopId, coops.id))
    .orderBy(desc(reports.createdAt))
    .limit(limit);

  return rows as ReportWithCoop[];
}

export async function getReportSchedules(): Promise<ScheduleWithCoop[]> {
  const rows = await db
    .select({
      ...getTableColumns(reportSchedules),
      coopName: coops.name,
    })
    .from(reportSchedules)
    .leftJoin(coops, eq(reportSchedules.coopId, coops.id))
    .orderBy(reportSchedules.createdAt);

  return rows as ScheduleWithCoop[];
}
