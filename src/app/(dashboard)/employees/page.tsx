import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus, ClipboardList } from "lucide-react";
import { requireRole } from "@/lib/supabase/auth";
import { getEmployees } from "@/features/employees/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EmployeesPage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const employees = await getEmployees();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pegawai</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola data pegawai dan tugas harian
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/employees/tasks"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <ClipboardList className="size-3.5" />
            <span className="hidden sm:inline">Tugas Harian</span>
          </Link>
          <Link
            href="/employees/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <UserPlus className="size-3.5" />
            + Tambah Pegawai
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {employees.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Belum ada pegawai. Tambahkan pegawai pertama.
            </CardContent>
          </Card>
        ) : (
          employees.map((emp) => (
            <Link key={emp.id} href={`/employees/${emp.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{emp.fullName}</p>
                    <p className="text-sm text-muted-foreground">{emp.email}</p>
                    {emp.phone && (
                      <p className="text-sm text-muted-foreground">{emp.phone}</p>
                    )}
                  </div>
                  <Badge variant={emp.isActive ? "default" : "secondary"}>
                    {emp.isActive ? "Aktif" : "Nonaktif"}
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
