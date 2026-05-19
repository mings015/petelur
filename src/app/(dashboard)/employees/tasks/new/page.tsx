import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { NewTaskTemplateForm } from "@/features/employees/components/NewTaskTemplateForm";
import { BackButton } from "@/components/common/back-button";

export default async function NewTaskTemplatePage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BackButton fallback="/employees/tasks" />
          <div>
            <h1 className="text-xl font-semibold">Tambah Tugas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Buat template tugas harian baru</p>
          </div>
        </div>
        <NewTaskTemplateForm />
      </div>
    </div>
  );
}
