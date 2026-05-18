import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFeedStocks } from "@/features/feed/queries";
import { getCoops } from "@/features/coops/queries";
import { NewFeedUsageForm } from "@/features/feed/components/NewFeedUsageForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewFeedUsagePage() {
  const [feedStocks, coops] = await Promise.all([
    getFeedStocks(),
    getCoops(),
  ]);

  const activeFeedStocks = feedStocks.map((s) => ({
    id: s.id,
    name: s.name,
    unit: s.unit,
    currentStock: s.currentStock,
  }));

  const activeCoops = coops
    .filter((c) => c.status === "active")
    .map((c) => ({ id: c.id, name: c.name }));

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
          <CardTitle>Catat Pemakaian Pakan</CardTitle>
        </CardHeader>
        <CardContent>
          <NewFeedUsageForm feedStocks={activeFeedStocks} coops={activeCoops} />
        </CardContent>
      </Card>
    </div>
  );
}
