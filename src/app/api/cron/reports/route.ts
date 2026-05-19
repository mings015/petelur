import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, reportSchedules } from "@/db/schema";
import { lte, eq, and } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchReportData, computeNextRun, getPeriodRange } from "@/features/reports/generators/data";
import { generateExcel } from "@/features/reports/generators/excel";
import { generatePdf } from "@/features/reports/generators/pdf";
import type { ReportFrequency } from "@/types";

const REPORT_LABELS: Record<string, string> = {
  production: "Produksi Telur",
  feed: "Manajemen Pakan",
  health: "Kesehatan Ayam",
  vaccination: "Vaksinasi",
  population: "Populasi Kandang",
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Fetch all active schedules due to run
  const dueSchedules = await db
    .select()
    .from(reportSchedules)
    .where(and(eq(reportSchedules.isActive, true), lte(reportSchedules.nextRun, now)));

  const errors: string[] = [];
  let processed = 0;

  for (const schedule of dueSchedules) {
    try {
      const frequency = schedule.frequency as ReportFrequency;
      const { from, to } = getPeriodRange(frequency);
      const label = REPORT_LABELS[schedule.type] ?? schedule.type;
      const period = `${from} s/d ${to}`;
      const filename = `laporan-${schedule.type}-${from}.${schedule.format}`;
      const storagePath = `${schedule.type}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${filename}`;

      const data = await fetchReportData({
        type: schedule.type,
        from,
        to,
        coopId: schedule.coopId ?? undefined,
      });

      let buffer: Buffer;
      if (schedule.format === "xlsx") {
        buffer = await generateExcel(data, `Laporan ${label}`);
      } else {
        buffer = await generatePdf(data, `Laporan ${label}`, period);
      }

      // Upload to Supabase Storage
      const admin = createAdminClient();
      const { error: uploadError } = await admin.storage
        .from("reports")
        .upload(storagePath, buffer, {
          contentType:
            schedule.format === "xlsx"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "application/pdf",
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);

      // Save report record
      await db.insert(reports).values({
        type: schedule.type,
        format: schedule.format,
        status: "completed",
        periodStart: from,
        periodEnd: to,
        coopId: schedule.coopId,
        storagePath,
        generatedAt: now,
        generatedBy: schedule.createdBy,
      });

      // Update schedule next_run
      await db
        .update(reportSchedules)
        .set({
          lastRun: now,
          nextRun: computeNextRun(frequency, now),
          updatedAt: now,
        })
        .where(eq(reportSchedules.id, schedule.id));

      processed++;
    } catch (err) {
      const msg = `Schedule ${schedule.id}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);

      // Mark report as failed
      await db.insert(reports).values({
        type: schedule.type,
        format: schedule.format,
        status: "failed",
        periodStart: new Date().toISOString().slice(0, 10),
        periodEnd: new Date().toISOString().slice(0, 10),
        generatedBy: schedule.createdBy,
        errorMessage: msg,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ processed, total: dueSchedules.length, errors });
}
