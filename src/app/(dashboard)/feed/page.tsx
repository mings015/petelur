import Link from "next/link";
import { AlertTriangle, Plus, ShoppingCart, Wheat } from "lucide-react";
import { getFeedStocks, getLowStockFeeds } from "@/features/feed/queries";
import { FeedStockCard } from "@/features/feed/components/FeedStockCard";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default async function FeedPage() {
  const [feedStocks, lowStockFeeds] = await Promise.all([
    getFeedStocks(),
    getLowStockFeeds(),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Manajemen Pakan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pantau stok dan transaksi pakan ternak
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/feed/usage/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <Wheat className="size-3.5" />
            Catat Pemakaian
          </Link>
          <Link
            href="/feed/purchase/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <ShoppingCart className="size-3.5" />
            Beli Pakan
          </Link>
        </div>
      </div>

      {lowStockFeeds.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Stok Menipis</AlertTitle>
          <AlertDescription>
            {lowStockFeeds.length} jenis pakan mencapai batas stok minimum:{" "}
            {lowStockFeeds.map((f) => f.name).join(", ")}. Segera lakukan
            pembelian.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Stok Pakan</h2>
          <Link
            href="/feed/stocks/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
          >
            <Plus className="size-3.5" />
            Tambah Jenis Pakan
          </Link>
        </div>

        {feedStocks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wheat className="size-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada jenis pakan yang ditambahkan.</p>
            <Link
              href="/feed/stocks/new"
              className={cn(buttonVariants({ variant: "link" }), "mt-2 text-sm")}
            >
              Tambah jenis pakan pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {feedStocks.map((stock) => (
              <FeedStockCard key={stock.id} feedStock={stock} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
