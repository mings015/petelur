import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { getEggCategories, getCustomers } from "@/features/sales/queries";
import { NewSaleForm } from "@/features/sales/components/NewSaleForm";
import { BackButton } from "@/components/common/back-button";

export default async function NewSalePage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const [categories, customers] = await Promise.all([
    getEggCategories(),
    getCustomers(),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <BackButton fallback="/sales" />
      <div>
        <h1 className="text-xl font-semibold">Catat Penjualan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tambah transaksi penjualan telur baru</p>
      </div>
      <NewSaleForm categories={categories} customers={customers} />
    </div>
  );
}
