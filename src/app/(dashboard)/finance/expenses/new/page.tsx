import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { getExpenseCategories } from "@/features/finance/queries";
import { NewExpenseForm } from "@/features/finance/components/NewExpenseForm";
import { BackButton } from "@/components/common/back-button";

export default async function NewExpensePage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const categories = await getExpenseCategories();

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <BackButton fallback="/finance" />
      <div>
        <h1 className="text-xl font-semibold">Catat Pengeluaran</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tambah data pengeluaran baru</p>
      </div>
      <NewExpenseForm categories={categories} />
    </div>
  );
}
