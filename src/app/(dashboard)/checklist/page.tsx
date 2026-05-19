import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getTodayChecklist } from "@/features/employees/task-queries";
import { ChecklistView } from "@/features/employees/components/ChecklistView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatToday() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ChecklistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await getTodayChecklist(user.id);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Checklist Harian</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{formatToday()}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tugas Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <ChecklistView items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
