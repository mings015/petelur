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
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Kesehatan Ayam</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pantau kondisi kesehatan dan jadwal vaksinasi
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/health/vaccination/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            + Jadwal Vaksin
          </Link>
          <Link
            href="/health/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            + Catat Kesehatan
          </Link>
        </div>
      </div>

      {pendingVaccinations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Vaksinasi Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            <VaccinationList schedules={pendingVaccinations} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Riwayat Catatan Kesehatan</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthTable data={records} />
        </CardContent>
      </Card>
    </div>
  );
}
