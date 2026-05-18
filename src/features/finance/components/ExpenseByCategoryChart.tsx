"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/utils";
import type { ExpenseByCategoryItem } from "../queries";

interface ExpenseByCategoryChartProps {
  data: ExpenseByCategoryItem[];
}

export function ExpenseByCategoryChart({ data }: ExpenseByCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Belum ada data pengeluaran
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="categoryName"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip formatter={(value) => [formatRupiah(value as number), "Pengeluaran"]} />
        <Bar dataKey="totalAmount" fill="#f43f5e" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
