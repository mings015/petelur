import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { getSaleById } from "@/features/sales/queries";
import { deleteSale } from "@/features/sales/actions";
import { BackButton } from "@/components/common/back-button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const { id } = await params;
  const sale = await getSaleById(id);
  if (!sale) notFound();

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-xl mx-auto">
      <BackButton fallback="/sales" />
      <h1 className="text-xl font-semibold">Detail Penjualan</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Informasi Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Tanggal">
            {new Date(sale.saleDate).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Row>
          <Row label="Kategori Telur">{sale.categoryName}</Row>
          <Row label="Pelanggan">{sale.customerName ?? "Tanpa pelanggan"}</Row>
          <Row label="Jumlah">
            {parseFloat(sale.quantity).toLocaleString("id-ID")} {sale.unit}
          </Row>
          <Row label="Harga / Satuan">{formatRupiah(sale.pricePerUnit)}</Row>
          <Row label="Total" className="font-semibold text-base">
            {formatRupiah(sale.totalAmount)}
          </Row>
          {sale.notes && <Row label="Catatan">{sale.notes}</Row>}
        </CardContent>
      </Card>

      <ConfirmDialog
        trigger={
          <button
            type="button"
            className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
          >
            Hapus Penjualan
          </button>
        }
        title="Hapus Penjualan"
        description="Data penjualan dan pemasukan terkait akan dihapus secara permanen."
        confirmLabel="Hapus"
        onConfirm={async () => {
          "use server";
          await deleteSale(id);
          redirect("/sales");
        }}
      />
    </div>
  );
}

function Row({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-right", className)}>{children}</span>
    </div>
  );
}
