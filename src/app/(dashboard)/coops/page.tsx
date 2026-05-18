import Link from "next/link";
import { getCoops } from "@/features/coops/queries";
import { CoopCard } from "@/features/coops/components/CoopCard";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CoopsPage() {
  const coopsList = await getCoops();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Kandang</h1>
        <Link href="/coops/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="w-4 h-4 mr-1" />
          Tambah Kandang
        </Link>
      </div>

      {coopsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <p className="text-base font-medium">Belum ada kandang</p>
          <p className="mt-1 text-sm">
            Tambahkan kandang pertama untuk mulai mencatat produksi.
          </p>
          <Link href="/coops/new" className={buttonVariants({ className: "mt-4" })}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Kandang
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
