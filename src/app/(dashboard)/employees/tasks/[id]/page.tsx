import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { getTaskTemplateById, getTaskHistory } from "@/features/employees/task-queries";
import { EditTaskTemplateForm } from "@/features/employees/components/EditTaskTemplateForm";
import { BackButton } from "@/components/common/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskTemplateDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function TaskTemplateDetailPage({ params }: TaskTemplateDetailPageProps) {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const { id } = await params;
  const [template, history] = await Promise.all([
    getTaskTemplateById(id),
    getTaskHistory(id, 10),
  ]);

  if (!template) notFound();

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <BackButton fallback="/employees/tasks" />
      </div>
      <h1 className="text-xl font-semibold">{template.title}</h1>

      {/* Edit Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Edit Tugas</CardTitle>
        </CardHeader>
        <CardContent>
          <EditTaskTemplateForm template={template} />
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Riwayat Penyelesaian (10 terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {history.map((log) => (
              <div key={log.id} className="py-2.5 flex justify-between text-sm">
                <span className="text-muted-foreground">{log.logDate}</span>
                <span>{formatDateTime(log.completedAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
