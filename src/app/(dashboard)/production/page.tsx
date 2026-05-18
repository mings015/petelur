import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProductionTable } from "@/features/production/components/ProductionTable";
import { getProductions } from "@/features/production/queries";
import { cn } from "@/lib/utils";

export default async function ProductionPage() {
  const productions = await getProductions();

  const tableData = productions.map((p) => ({
    id: p.id,
    productionDate: p.productionDate,
    coopName: p.coopName ?? null,
    totalEggs: p.totalEggs,
    goodEggs: p.goodEggs,
    crackedEggs: p.crackedEggs,
    brokenEggs: p.brokenEggs,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Produksi Telur</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Riwayat pencatatan produksi harian
          </p>
        </div>
        <Link
          href="/production/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5 shrink-0")}
        >
          <Plus className="size-3.5" />
          Input Produksi
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Riwayat Produksi</CardTitle>
        </CardHeader>
        <CardContent>
          {tableData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <p className="text-sm">Belum ada data produksi.</p>
              <Link
                href="/production/new"
                className={cn(buttonVariants({ variant: "link", size: "sm" }))}
              >
                Input produksi pertama
              </Link>
            </div>
          ) : (
            <ProductionTable data={tableData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
