"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeedStock } from "@/types";

interface FeedStockCardProps {
  feedStock: FeedStock;
}

export function FeedStockCard({ feedStock }: FeedStockCardProps) {
  const currentStock = parseFloat(feedStock.currentStock);
  const minimumStock = parseFloat(feedStock.minimumStock);
  const isLowStock = currentStock <= minimumStock;

  return (
    <Link href={`/feed/stocks/${feedStock.id}`} className="block">
      <Card className="hover:ring-2 hover:ring-ring/50 transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm">{feedStock.name}</CardTitle>
            <Badge variant={isLowStock ? "destructive" : "secondary"}>
              {isLowStock ? "Stok Rendah" : "Normal"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stok saat ini</span>
              <span className="font-medium">
                {currentStock.toLocaleString("id-ID")} {feedStock.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stok minimum</span>
              <span>
                {minimumStock.toLocaleString("id-ID")} {feedStock.unit}
              </span>
            </div>
            {feedStock.supplier && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pemasok</span>
                <span className="truncate max-w-[140px] text-right">
                  {feedStock.supplier}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
