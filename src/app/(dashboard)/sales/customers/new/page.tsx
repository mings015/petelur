import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { NewCustomerForm } from "@/features/sales/components/NewCustomerForm";
import { BackButton } from "@/components/common/back-button";

export default async function NewCustomerPage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <BackButton fallback="/sales/customers" />
      <div>
        <h1 className="text-xl font-semibold">Tambah Pelanggan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Daftarkan pelanggan baru</p>
      </div>
      <NewCustomerForm />
    </div>
  );
}
