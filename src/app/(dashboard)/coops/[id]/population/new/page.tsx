import { redirect } from "next/navigation";
import { getCoopWithStats } from "@/features/coops/queries";
import { NewPopulationForm } from "@/features/coops/components/NewPopulationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/common/back-button";

interface NewPopulationPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewPopulationPage({ params }: NewPopulationPageProps) {
  const { id } = await params;
  const coop = await getCoopWithStats(id);

  if (!coop) redirect("/coops");

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <BackButton fallback={`/coops/${id}`} />
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Tambah Riwayat Populasi
          </h1>
          <p className="text-sm text-muted-foreground">
            {coop.name} &mdash; {coop.chickenCount.toLocaleString("id-ID")} ekor saat ini
          </p>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detail Perubahan Populasi</CardTitle>
          </CardHeader>
          <CardContent>
            <NewPopulationForm coopId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
