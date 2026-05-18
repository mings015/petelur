import { getCoops } from "@/features/coops/queries";
import { NewVaccinationForm } from "@/features/health/components/NewVaccinationForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackButton } from "@/components/common/back-button";

export default async function NewVaccinationPage() {
  const allCoops = await getCoops();
  const activeCoops = allCoops
    .filter((c) => c.status === "active")
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <BackButton fallback="/health" />
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Jadwal Vaksinasi
          </h1>
          <p className="text-sm text-muted-foreground">
            Tambahkan jadwal vaksinasi untuk kandang
          </p>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detail Jadwal</CardTitle>
          </CardHeader>
          <CardContent>
            <NewVaccinationForm coops={activeCoops} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
