import Link from "next/link";
import { ArrowLeft, Egg } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coops } from "@/db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { NewProductionForm } from "@/features/production/components/NewProductionForm";

export default async function NewProductionPage() {
  const activeCoops = await db
    .select({ id: coops.id, name: coops.name })
    .from(coops)
    .where(eq(coops.status, "active"));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/production"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Egg className="size-6 text-primary" />
        <h1 className="text-xl font-bold">Input Produksi Telur</h1>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Data Produksi</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {activeCoops.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground space-y-1">
              <p>Tidak ada kandang aktif.</p>
              <p>Tambah kandang terlebih dahulu sebelum mencatat produksi.</p>
            </div>
          ) : (
            <NewProductionForm coops={activeCoops} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
