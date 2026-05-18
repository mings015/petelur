"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductionDataPoint {
  date: string | null;
  totalEggs: number;
}

interface DashboardChartsProps {
  productionData: ProductionDataPoint[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
}

export function DashboardCharts({ productionData }: DashboardChartsProps) {
  if (productionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grafik Produksi Telur (30 Hari)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Belum ada data produksi
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = productionData.map((d) => ({
    date: formatDate(d.date),
    "Total Telur": d.totalEggs,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Grafik Produksi Telur (30 Hari)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toLocaleString("id-ID")}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === "number"
                  ? value.toLocaleString("id-ID") + " butir"
                  : String(value),
                "Total Telur",
              ]}
            />
            <Line
              type="monotone"
              dataKey="Total Telur"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
