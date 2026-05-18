import Link from "next/link";
import { Plus, Egg } from "lucide-react";
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
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Egg className="size-6 text-primary" />
          <h1 className="text-xl font-bold">Produksi Telur</h1>
        </div>
        <Link
          href="/production/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Plus className="size-4" />
          Input Produksi
        </Link>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Riwayat Produksi</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {tableData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Egg className="size-10 opacity-30" />
              <p className="text-sm">Belum ada data produksi</p>
              <Link
                href="/production/new"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                <Plus className="size-4" />
                Input Produksi Pertama
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
