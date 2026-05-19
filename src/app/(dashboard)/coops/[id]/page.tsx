import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { getCoopWithStats, getCoopPopulationHistory } from "@/features/coops/queries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { CoopStatus, PopulationType } from "@/types";

const statusConfig: Record<
  CoopStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Aktif", variant: "default" },
  empty: { label: "Kosong", variant: "secondary" },
  inactive: { label: "Tidak Aktif", variant: "destructive" },
};

const populationTypeLabel: Record<PopulationType, string> = {
  addition: "Penambahan",
  reduction: "Pengurangan",
  mutation_in: "Mutasi Masuk",
  mutation_out: "Mutasi Keluar",
};

interface CoopDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoopDetailPage({ params }: CoopDetailPageProps) {
  const { id } = await params;
  const [coop, populations] = await Promise.all([
    getCoopWithStats(id),
    getCoopPopulationHistory(id),
  ]);

  if (!coop) redirect("/coops");

  const status = statusConfig[coop.status as CoopStatus] ?? statusConfig.empty;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/coops"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold">{coop.name}</h1>
        </div>
        <Link href={`/coops/${id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informasi Kandang</CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Jumlah Ayam</span>
            <span className="font-medium">
              {coop.chickenCount.toLocaleString("id-ID")} /{" "}
              {coop.capacity.toLocaleString("id-ID")} ekor
            </span>
          </div>
          {coop.chickenAgeWeeks !== null && coop.chickenAgeWeeks !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usia Ayam</span>
              <span className="font-medium">{coop.chickenAgeWeeks} minggu</span>
            </div>
          )}
          {coop.docEntryDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tgl Masuk DOC</span>
              <span className="font-medium">
                {new Date(coop.docEntryDate).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Telur (30 hari)</span>
            <span className="font-medium">
              {coop.totalEggs.toLocaleString("id-ID")} butir
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mortalitas (30 hari)</span>
            <span className="font-medium">
              {coop.mortalityCount.toLocaleString("id-ID")} ekor
            </span>
          </div>
          {coop.notes && (
            <div className="pt-1 border-t">
              <p className="text-muted-foreground text-xs mb-1">Catatan</p>
              <p className="text-sm">{coop.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Riwayat Populasi</h2>
          <Link href={`/coops/${id}/population/new`} className={buttonVariants({ size: "sm" })}>
            + Tambah
          </Link>
        </div>
        {populations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Belum ada riwayat perubahan populasi.
          </p>
        ) : (
          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium">Jenis</th>
                  <th className="text-right px-4 py-3 font-medium">Jumlah</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {populations.map((pop) => (
                  <tr key={pop.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(pop.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {populationTypeLabel[pop.type as PopulationType] ?? pop.type}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {pop.count.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {pop.reason ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
