import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFeedStocks } from "@/features/feed/queries";
import { NewFeedPurchaseForm } from "@/features/feed/components/NewFeedPurchaseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewFeedPurchasePage() {
  const feedStocks = await getFeedStocks();

  const stockList = feedStocks.map((s) => ({
    id: s.id,
    name: s.name,
    unit: s.unit,
  }));

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Manajemen Pakan
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Catat Pembelian Pakan</CardTitle>
        </CardHeader>
        <CardContent>
          <NewFeedPurchaseForm feedStocks={stockList} />
        </CardContent>
      </Card>
    </div>
  );
}
