import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { requireRole } from "@/lib/supabase/auth";
import { getCustomers } from "@/features/sales/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CustomersPage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const customers = await getCustomers();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pelanggan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Daftar pelanggan tetap</p>
        </div>
        <Link
          href="/sales/customers/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5 shrink-0")}
        >
          <Plus className="size-3.5" />
          Tambah Pelanggan
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Belum ada pelanggan yang ditambahkan.</p>
          <Link
            href="/sales/customers/new"
            className={cn(buttonVariants({ variant: "link" }), "mt-2 text-sm")}
          >
            Tambah pelanggan pertama
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nama</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Telepon</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Alamat</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {customer.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                    {customer.address ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/sales/customers/${customer.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-right">
        {customers.length} pelanggan
      </p>
    </div>
  );
}
