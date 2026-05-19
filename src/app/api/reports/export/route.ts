import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/auth";
import { fetchReportData, type ReportFilters } from "@/features/reports/generators/data";
import { generateExcel } from "@/features/reports/generators/excel";
import { generatePdf } from "@/features/reports/generators/pdf";
import type { ReportType, ReportFormat } from "@/types";

const REPORT_LABELS: Record<ReportType, string> = {
  production: "Produksi Telur",
  feed: "Manajemen Pakan",
  health: "Kesehatan Ayam",
  vaccination: "Vaksinasi",
  population: "Populasi Kandang",
};

const VALID_TYPES: ReportType[] = ["production", "feed", "health", "vaccination", "population"];
const VALID_FORMATS: ReportFormat[] = ["xlsx", "pdf"];

export async function GET(request: NextRequest) {
  try {
    await requireRole("owner");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") as ReportType;
  const format = searchParams.get("format") as ReportFormat;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const coopId = searchParams.get("coopId") ?? undefined;

  if (!VALID_TYPES.includes(type) || !VALID_FORMATS.includes(format) || !from || !to) {
    return NextResponse.json({ error: "Parameter tidak valid" }, { status: 400 });
  }

  const filters: ReportFilters = { type, from, to, coopId };
  const label = REPORT_LABELS[type];
  const period = `${from} s/d ${to}`;
  const slugDate = `${from}`;
  const filename = `laporan-${type}-${slugDate}.${format}`;

  try {
    const data = await fetchReportData(filters);

    if (format === "xlsx") {
      const buffer = await generateExcel(data, `Laporan ${label}`);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(buffer.byteLength),
        },
      });
    }

    const buffer = await generatePdf(data, `Laporan ${label}`, period);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat laporan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
