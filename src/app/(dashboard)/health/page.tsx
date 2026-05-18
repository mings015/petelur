import Link from "next/link";
import { getHealthRecords, getVaccinationSchedules } from "@/features/health/queries";
import { HealthTable } from "@/features/health/components/HealthTable";
import { VaccinationList } from "@/features/health/components/VaccinationList";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function HealthPage() {
  const [records, pendingVaccinations] = await Promise.all([
    getHealthRecords(50),
    getVaccinationSchedules(),
  ]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kesehatan Ayam</h1>
          <p className="text-sm text-muted-foreground">
            Pantau kondisi kesehatan dan jadwal vaksinasi
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/health/vaccination/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10")}
          >
            + Jadwal Vaksin
          </Link>
          <Link
            href="/health/new"
            className={cn(buttonVariants({ size: "sm" }), "h-10")}
          >
            + Catat Kesehatan
          </Link>
        </div>
      </div>

      {pendingVaccinations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Jadwal Vaksinasi Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            <VaccinationList schedules={pendingVaccinations} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Riwayat Catatan Kesehatan</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthTable data={records} />
        </CardContent>
      </Card>
    </div>
  );
}
