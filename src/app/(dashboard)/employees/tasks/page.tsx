import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/supabase/auth";
import { getTaskTemplates } from "@/features/employees/task-queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BackButton } from "@/components/common/back-button";
import { cn } from "@/lib/utils";

export default async function TaskTemplatesPage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const templates = await getTaskTemplates();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton fallback="/employees" />
          <div>
            <h1 className="text-xl font-semibold">Tugas Harian</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Template checklist pegawai</p>
          </div>
        </div>
        <Link
          href="/employees/tasks/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5 shrink-0")}
        >
          <Plus className="size-3.5" />
          Tambah Tugas
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Belum ada tugas. Tambahkan tugas pertama.
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Link key={template.id} href={`/employees/tasks/${template.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{template.title}</p>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Urutan: {template.sortOrder}</p>
                  </div>
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
