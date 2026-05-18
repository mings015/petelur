import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { NewManualIncomeForm } from "@/features/finance/components/NewManualIncomeForm";
import { BackButton } from "@/components/common/back-button";

export default async function NewManualIncomePage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <BackButton fallback="/finance" />
      <div>
        <h1 className="text-xl font-semibold">Catat Pemasukan Manual</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tambah pemasukan di luar penjualan telur</p>
      </div>
      <NewManualIncomeForm />
    </div>
  );
}
