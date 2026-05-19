import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { NewEmployeeForm } from "@/features/employees/components/NewEmployeeForm";
import { BackButton } from "@/components/common/back-button";

export default async function NewEmployeePage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BackButton fallback="/employees" />
          <div>
            <h1 className="text-xl font-semibold">Tambah Pegawai</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Daftarkan pegawai baru</p>
          </div>
        </div>
        <NewEmployeeForm />
      </div>
    </div>
  );
}
