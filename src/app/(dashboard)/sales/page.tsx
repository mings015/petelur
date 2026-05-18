import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, Users, TrendingUp } from "lucide-react";
import { requireRole } from "@/lib/supabase/auth";
import { getSales, getSalesSummary, getRevenueTrend, getSalesByCategory } from "@/features/sales/queries";
import { SalesTable } from "@/features/sales/components/SalesTable";
import { SalesRevenueChart } from "@/features/sales/components/SalesRevenueChart";
import { SalesByCategoryChart } from "@/features/sales/components/SalesByCategoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function SalesPage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [monthlySummary, sales, revenueTrend, salesByCategory] = await Promise.all([
    getSalesSummary("month"),
    getSales(),
    getRevenueTrend(thirtyDaysAgo, todayStr),
    getSalesByCategory(monthStart, todayStr),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Penjualan Telur</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rekap omzet dan transaksi penjualan
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/sales/customers"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Users className="size-3.5" />
            <span className="hidden sm:inline">Pelanggan</span>
          </Link>
          <Link
            href="/sales/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <ShoppingCart className="size-3.5" />
            + Catat Penjualan
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Omzet Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatRupiah(monthlySummary.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{monthlySummary.count.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4" />
              Rata-rata / Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatRupiah(monthlySummary.avgAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tren Pendapatan (30 hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesRevenueChart data={revenueTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Penjualan per Kategori (bulan ini)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesByCategoryChart data={salesByCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Semua Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable sales={sales} />
        </CardContent>
      </Card>
    </div>
  );
}
