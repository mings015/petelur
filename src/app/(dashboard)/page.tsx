import { Suspense } from "react";
import { db } from "@/lib/db";
import { coops, eggProductions, feedStocks, healthRecords, expenses, incomes } from "@/db/schema";
import { eq, sql, gte, desc, and, lte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Egg, Wheat, AlertTriangle, ShoppingCart, TrendingDown, Wallet } from "lucide-react";
import { DashboardCharts } from "./charts";
import { formatRupiah } from "@/lib/utils";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getTodayChecklistSummary } from "@/features/employees/task-queries";
import { ChecklistSummaryCard } from "@/features/employees/components/ChecklistSummaryCard";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function getDashboardData(isOwner: boolean) {
  const today = new Date().toISOString().split("T")[0]!;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0]!;

  const baseQueries = [
    db
      .select({ total: sql<number>`COALESCE(SUM(chicken_count), 0)` })
      .from(coops)
      .where(eq(coops.status, "active"))
      .then((r) => Number(r[0]?.total ?? 0)),

    db
      .select({ total: sql<number>`COALESCE(SUM(total_eggs), 0)` })
      .from(eggProductions)
      .where(eq(eggProductions.productionDate, today))
      .then((r) => Number(r[0]?.total ?? 0)),

    db
      .select({ id: feedStocks.id, name: feedStocks.name })
      .from(feedStocks)
      .where(sql`current_stock <= minimum_stock`),

    db
      .select({ total: sql<number>`COALESCE(SUM(dead_count), 0)` })
      .from(healthRecords)
      .where(eq(healthRecords.recordDate, today))
      .then((r) => Number(r[0]?.total ?? 0)),

    db
      .select({
        date: eggProductions.productionDate,
        totalEggs: sql<number>`SUM(total_eggs)`,
      })
      .from(eggProductions)
      .where(gte(eggProductions.productionDate, thirtyDaysAgo))
      .groupBy(eggProductions.productionDate)
      .orderBy(eggProductions.productionDate)
      .limit(30),

    db
      .select()
      .from(coops)
      .where(eq(coops.status, "active"))
      .orderBy(desc(coops.chickenCount))
      .limit(5),
  ] as const;

  const financeQueries = isOwner
    ? [
        db
          .select({ total: sql<number>`COALESCE(SUM(${incomes.amount}), 0)` })
          .from(incomes)
          .where(and(gte(incomes.incomeDate, monthStart), lte(incomes.incomeDate, today)))
          .then((r) => Number(r[0]?.total ?? 0)),
        db
          .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
          .from(expenses)
          .where(and(gte(expenses.expenseDate, monthStart), lte(expenses.expenseDate, today)))
          .then((r) => Number(r[0]?.total ?? 0)),
      ]
    : [];

  const [
    totalChickens,
    todayEggs,
    lowStockFeeds,
    todayMortality,
    productionChart,
    activeCoops,
    ...financeResults
  ] = await Promise.all([...baseQueries, ...financeQueries]);

  const monthlyRevenue = isOwner ? (financeResults[0] as number) : 0;
  const monthlyExpense = isOwner ? (financeResults[1] as number) : 0;

  return {
    totalChickens: totalChickens as number,
    todayEggs: todayEggs as number,
    lowStockFeeds: lowStockFeeds as { id: string; name: string }[],
    todayMortality: todayMortality as number,
    productionChart: (productionChart as { date: string; totalEggs: number }[]).map((r) => ({
      date: r.date,
      totalEggs: Number(r.totalEggs),
    })),
    activeCoops: activeCoops as typeof coops.$inferSelect[],
    monthlyRevenue,
    monthlyExpense,
    netProfit: monthlyRevenue - monthlyExpense,
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isOwner = user?.role === "owner";

  const [data, checklistSummary] = await Promise.all([
    getDashboardData(isOwner),
    user ? getTodayChecklistSummary(user.id) : Promise.resolve({ total: 0, done: 0 }),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {(data.lowStockFeeds.length > 0 || data.todayMortality > 0) && (
        <div className="space-y-2">
          {data.lowStockFeeds.length > 0 && (
            <Alert variant="destructive">
              <Wheat className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Stok pakan menipis: </span>
                {data.lowStockFeeds.map((f) => f.name).join(", ")}
              </AlertDescription>
            </Alert>
          )}
          {data.todayMortality > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Mortalitas hari ini: </span>
                {data.todayMortality} ekor
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Operasional KPIs */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Operasional</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Ayam Aktif</CardTitle>
              <Home className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold">{data.totalChickens.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">ekor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Produksi Hari Ini</CardTitle>
              <Egg className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold">{data.todayEggs.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">butir</p>
            </CardContent>
          </Card>

          <Card className={data.todayMortality > 0 ? "border-destructive" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Mortalitas Hari Ini</CardTitle>
              <AlertTriangle className={`w-4 h-4 ${data.todayMortality > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold">{data.todayMortality.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">ekor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Stok Pakan</CardTitle>
              <Wheat className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="mt-1">
                {data.lowStockFeeds.length > 0 ? (
                  <Badge variant="destructive" className="text-xs">{data.lowStockFeeds.length} menipis</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Aman</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">status stok</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checklist Summary */}
      <ChecklistSummaryCard total={checklistSummary.total} done={checklistSummary.done} />

      {/* Keuangan KPIs — owner only */}
      {isOwner && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Keuangan Bulan Ini</h2>
            <Link href="/finance" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7 px-2")}>
              Lihat detail →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pemasukan</CardTitle>
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(data.monthlyRevenue)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-rose-200 dark:border-rose-800">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pengeluaran</CardTitle>
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {formatRupiah(data.monthlyExpense)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Laba Bersih</CardTitle>
                <Wallet className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={cn("text-xl font-bold", data.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {formatRupiah(data.netProfit)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <DashboardCharts productionData={data.productionChart} />
      </Suspense>

      {data.activeCoops.length > 0 && isOwner && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Kandang Aktif</CardTitle>
              <Link href="/coops" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7 px-2")}>
                Lihat semua →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.activeCoops.map((coop) => (
                <div key={coop.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{coop.name}</span>
                  <span className="text-muted-foreground">
                    {coop.chickenCount.toLocaleString("id-ID")} / {coop.capacity.toLocaleString("id-ID")} ekor
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
