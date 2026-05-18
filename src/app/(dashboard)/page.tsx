import { Suspense } from "react";
import { db } from "@/lib/db";
import { coops, eggProductions, feedStocks, healthRecords } from "@/db/schema";
import { eq, sql, gte, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Egg, Wheat, AlertTriangle } from "lucide-react";
import { DashboardCharts } from "./charts";

async function getDashboardData() {
  const today = new Date().toISOString().split("T")[0]!;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  const [
    totalChickens,
    todayEggs,
    lowStockFeeds,
    todayMortality,
    productionChart,
    activeCoops,
  ] = await Promise.all([
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
  ]);

  return {
    totalChickens,
    todayEggs,
    lowStockFeeds,
    todayMortality,
    productionChart: productionChart.map((r) => ({
      date: r.date,
      totalEggs: Number(r.totalEggs),
    })),
    activeCoops,
  };
}

const kpiCards = [
  {
    key: "chickens" as const,
    title: "Ayam Aktif",
    icon: Home,
    format: (n: number) => n.toLocaleString("id-ID"),
    description: "Total ayam di kandang aktif",
  },
  {
    key: "eggs" as const,
    title: "Produksi Hari Ini",
    icon: Egg,
    format: (n: number) => n.toLocaleString("id-ID") + " butir",
    description: "Total telur diproduksi hari ini",
  },
  {
    key: "mortality" as const,
    title: "Mortalitas Hari Ini",
    icon: AlertTriangle,
    format: (n: number) => n.toLocaleString("id-ID") + " ekor",
    description: "Ayam mati hari ini",
    alert: true,
  },
];

export default async function DashboardPage() {
  const data = await getDashboardData();

  const kpiValues = {
    chickens: data.totalChickens,
    eggs: data.todayEggs,
    mortality: data.todayMortality,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
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
                <span className="font-medium">Mortalitas tinggi hari ini: </span>
                {data.todayMortality} ekor
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiCards.map(({ key, title, icon: Icon, format, description, alert }) => (
          <Card key={key} className={alert && kpiValues[key] > 0 ? "border-destructive" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <Icon
                className={`w-4 h-4 ${alert && kpiValues[key] > 0 ? "text-destructive" : "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{format(kpiValues[key])}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok Pakan
            </CardTitle>
            <Wheat className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {data.lowStockFeeds.length > 0 ? (
                <Badge variant="destructive">{data.lowStockFeeds.length} menipis</Badge>
              ) : (
                <Badge variant="secondary">Aman</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Status stok pakan</p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <DashboardCharts productionData={data.productionChart} />
      </Suspense>

      {data.activeCoops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kandang Aktif</CardTitle>
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
