import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { getCoops } from "@/features/coops/queries";
import { getReportSchedules } from "@/features/reports/queries";
import { ScheduleForm } from "@/features/reports/components/ScheduleForm";
import { ScheduleList } from "@/features/reports/components/ScheduleList";
import { BackButton } from "@/components/common/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportSchedulesPage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const [coopList, schedules] = await Promise.all([
    getCoops(),
    getReportSchedules(),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallback="/reports" />
        <div>
          <h1 className="text-xl font-semibold">Jadwal Laporan Otomatis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Laporan akan digenerate otomatis sesuai jadwal dan disimpan di histori
          </p>
        </div>
      </div>

      {/* Create schedule */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tambah Jadwal Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm coops={coopList} />
        </CardContent>
      </Card>

      {/* Schedule list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Jadwal Aktif ({schedules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleList schedules={schedules} />
        </CardContent>
      </Card>
    </div>
  );
}
