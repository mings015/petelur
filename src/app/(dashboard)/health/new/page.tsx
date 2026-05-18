import { getCoops } from "@/features/coops/queries";
import { NewHealthRecordForm } from "@/features/health/components/NewHealthRecordForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackButton } from "@/components/common/back-button";

export default async function NewHealthRecordPage() {
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
            Catat Kesehatan Ayam
          </h1>
          <p className="text-sm text-muted-foreground">
            Rekam kondisi kesehatan harian kandang
          </p>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detail Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <NewHealthRecordForm coops={activeCoops} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
