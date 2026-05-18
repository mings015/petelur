"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Coop, CoopStatus } from "@/types";

interface CoopCardProps {
  coop: Coop;
}

const statusConfig: Record<
  CoopStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Aktif", variant: "default" },
  empty: { label: "Kosong", variant: "secondary" },
  inactive: { label: "Tidak Aktif", variant: "destructive" },
};

export function CoopCard({ coop }: CoopCardProps) {
  const status = statusConfig[coop.status as CoopStatus] ?? statusConfig.empty;

  return (
    <Link href={`/coops/${coop.id}`} className="block focus:outline-none">
      <Card className="hover:ring-primary/40 transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{coop.name}</CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Jumlah Ayam</span>
            <span className="font-medium text-foreground">
              {coop.chickenCount.toLocaleString("id-ID")} /{" "}
              {coop.capacity.toLocaleString("id-ID")}
            </span>
          </div>
          {coop.chickenAgeWeeks !== null && coop.chickenAgeWeeks !== undefined && (
            <div className="flex items-center justify-between">
              <span>Usia Ayam</span>
              <span className="font-medium text-foreground">
                {coop.chickenAgeWeeks} minggu
              </span>
            </div>
          )}
          {coop.docEntryDate && (
            <div className="flex items-center justify-between">
              <span>Tgl Masuk DOC</span>
              <span className="font-medium text-foreground">
                {new Date(coop.docEntryDate).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
