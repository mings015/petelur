import { redirect } from "next/navigation";
import { getFeedStockById, getFeedTransactionsByStockId } from "@/features/feed/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/common/back-button";

interface FeedStockDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const n = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(n) ? "-" : n.toLocaleString("id-ID");
}

function formatCurrency(value: string | null | undefined): string {
  if (!value) return "-";
  const n = parseFloat(value);
  if (isNaN(n)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function FeedStockDetailPage({ params }: FeedStockDetailPageProps) {
  const { id } = await params;
  const [stock, transactions] = await Promise.all([
    getFeedStockById(id),
    getFeedTransactionsByStockId(id),
  ]);

  if (!stock) redirect("/feed");

  const isLowStock =
    parseFloat(stock.currentStock as unknown as string) <=
    parseFloat(stock.minimumStock as unknown as string);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <BackButton fallback="/feed" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{stock.name}</h1>
        {isLowStock && (
          <Badge variant="destructive">Stok Rendah</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Stok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stok Saat Ini</span>
            <span className="font-medium">
              {formatNumber(stock.currentStock as unknown as string)} {stock.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stok Minimum</span>
            <span className="font-medium">
              {formatNumber(stock.minimumStock as unknown as string)} {stock.unit}
            </span>
          </div>
          {stock.pricePerUnit !== null && stock.pricePerUnit !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga per {stock.unit}</span>
              <span className="font-medium">
                {formatCurrency(stock.pricePerUnit as unknown as string)}
              </span>
            </div>
          )}
          {stock.supplier && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pemasok</span>
              <span className="font-medium">{stock.supplier}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Belum ada transaksi untuk pakan ini.
          </p>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium">Jenis</th>
                  <th className="text-right px-4 py-3 font-medium">Jumlah</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                    Info
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === "purchase" ? "default" : "secondary"}>
                        {tx.type === "purchase" ? "Pembelian" : "Pemakaian"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatNumber(tx.quantity)} {stock.unit}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {tx.type === "purchase"
                        ? tx.supplier ?? "-"
                        : tx.coopName ?? "-"}
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
