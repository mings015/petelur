import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { getEmployeeById } from "@/features/employees/queries";
import { deleteEmployee } from "@/features/employees/actions";
import { EditEmployeeForm } from "@/features/employees/components/EditEmployeeForm";
import { BackButton } from "@/components/common/back-button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const { id } = await params;
  const employee = await getEmployeeById(id);
  if (!employee || employee.role !== "worker") notFound();

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <BackButton fallback="/employees" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{employee.fullName}</h1>
        <Badge variant={employee.isActive ? "default" : "secondary"}>
          {employee.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{employee.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Telepon</span>
            <span>{employee.phone ?? "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bergabung</span>
            <span>{formatDate(employee.joinedAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Edit Data Pegawai</CardTitle>
        </CardHeader>
        <CardContent>
          <EditEmployeeForm employee={employee} />
        </CardContent>
      </Card>

      {/* Delete */}
      <ConfirmDialog
        trigger={
          <button
            type="button"
            className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
          >
            Hapus Pegawai
          </button>
        }
        title="Hapus Pegawai?"
        description={`Akun dan data "${employee.fullName}" akan dihapus permanen.`}
        confirmLabel="Ya, Hapus"
        onConfirm={async () => {
          "use server";
          await deleteEmployee(id);
          redirect("/employees");
        }}
      />
    </div>
  );
}
