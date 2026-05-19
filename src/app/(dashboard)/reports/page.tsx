import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { requireRole } from "@/lib/supabase/auth";
import { getCoops } from "@/features/coops/queries";
import { fetchReportData, type ReportFilters } from "@/features/reports/generators/data";
import { getReportHistory } from "@/features/reports/queries";
import { ReportFilterForm } from "@/features/reports/components/ReportFilterForm";
import { ReportPreviewTable } from "@/features/reports/components/ReportPreviewTable";
import { ReportHistoryList } from "@/features/reports/components/ReportHistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportType } from "@/types";

const VALID_TYPES: ReportType[] = ["production", "feed", "health", "vaccination", "population"];

interface ReportsPageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const params = await searchParams;
  const type = (VALID_TYPES.includes(params.type as ReportType) ? params.type : "production") as ReportType;
  const from = params.from ?? monthStart;
  const to = params.to ?? today;
  const coopId = params.coopId ?? undefined;

  const [coopList, history] = await Promise.all([
    getCoops(),
    getReportHistory(20),
  ]);

  // Fetch preview data based on current filters
  const filters: ReportFilters = { type, from, to, coopId };
  const previewData = await fetchReportData(filters);

  const TYPE_LABELS: Record<ReportType, string> = {
    production: "Produksi Telur",
    feed: "Manajemen Pakan",
    health: "Kesehatan Ayam",
    vaccination: "Vaksinasi",
    population: "Populasi Kandang",
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Laporan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Export dan jadwalkan laporan operasional
          </p>
        </div>
        <Link
          href="/reports/schedules"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 shrink-0")}
        >
          <CalendarClock className="size-3.5" />
          <span className="hidden sm:inline">Jadwal Otomatis</span>
        </Link>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilterForm coops={coopList} />
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Preview: {TYPE_LABELS[type]} ({from} s/d {to})
            </CardTitle>
            <span className="text-xs text-muted-foreground">{previewData.rows.length} baris</span>
          </div>
        </CardHeader>
        <CardContent>
          <ReportPreviewTable data={previewData} />
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Riwayat Laporan Terjadwal</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportHistoryList reports={history} />
        </CardContent>
      </Card>
    </div>
  );
}
