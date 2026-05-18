import Link from "next/link";
import { getCoops } from "@/features/coops/queries";
import { CoopCard } from "@/features/coops/components/CoopCard";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CoopsPage() {
  const coopsList = await getCoops();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Kandang</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola kandang dan populasi ayam
          </p>
        </div>
        <Link
          href="/coops/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5 shrink-0")}
        >
          <Plus className="size-3.5" />
          Tambah Kandang
        </Link>
      </div>

      {coopsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Home className="size-10 opacity-30 mb-3" />
          <p className="text-sm font-medium">Belum ada kandang</p>
          <p className="mt-1 text-xs">
            Tambahkan kandang pertama untuk mulai mencatat produksi.
          </p>
          <Link
            href="/coops/new"
            className={cn(buttonVariants({ variant: "link" }), "mt-2 text-sm")}
          >
            Tambah kandang pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coopsList.map((coop) => (
            <CoopCard key={coop.id} coop={coop} />
          ))}
        </div>
      )}
    </div>
  );
}
