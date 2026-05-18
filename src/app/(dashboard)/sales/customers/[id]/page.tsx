import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { getCustomerById, getSales } from "@/features/sales/queries";
import { deleteCustomer } from "@/features/sales/actions";
import { EditCustomerForm } from "@/features/sales/components/EditCustomerForm";
import { BackButton } from "@/components/common/back-button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const { id } = await params;
  const [customer, allSales] = await Promise.all([
    getCustomerById(id),
    getSales({ customerId: id }),
  ]);
  if (!customer) notFound();

  const totalRevenue = allSales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <BackButton fallback="/sales/customers" />
      <h1 className="text-xl font-semibold">{customer.name}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Transaksi</p>
            <p className="text-xl font-bold mt-0.5">{allSales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Omzet</p>
            <p className="text-xl font-bold mt-0.5">{formatRupiah(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Edit Data Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <EditCustomerForm customer={customer} />
        </CardContent>
      </Card>

      {/* Delete */}
      <ConfirmDialog
        trigger={
          <button
            type="button"
            className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
          >
            Hapus Pelanggan
          </button>
        }
        title="Hapus Pelanggan"
        description="Data pelanggan akan dihapus. Riwayat penjualan tetap tersimpan."
        confirmLabel="Hapus"
        onConfirm={async () => {
          "use server";
          await deleteCustomer(id);
          redirect("/sales/customers");
        }}
      />
    </div>
  );
}
