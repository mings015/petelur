"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { deleteExpense, deleteIncome } from "../actions";
import type { TransactionRow } from "../queries";

interface FinanceTransactionTableProps {
  transactions: TransactionRow[];
}

const kindLabel: Record<"income" | "expense", string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export function FinanceTransactionTable({ transactions }: FinanceTransactionTableProps) {
  const [rows, setRows] = useState(transactions);

  async function handleDeleteExpense(id: string) {
    const result = await deleteExpense(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Pengeluaran dihapus");
  }

  async function handleDeleteIncome(id: string) {
    const result = await deleteIncome(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Pemasukan dihapus");
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Belum ada transaksi keuangan.
      </p>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Tanggal</th>
            <th className="text-left px-4 py-3 font-medium">Jenis</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Deskripsi</th>
            <th className="text-right px-4 py-3 font-medium">Jumlah</th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Metode</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => {
            const date = row.kind === "expense" ? row.expenseDate : row.incomeDate;
            const description =
              row.kind === "expense"
                ? (row.description ?? row.categoryName)
                : row.description;

            return (
              <tr
                key={`${row.kind}-${row.id}`}
                className={
                  row.kind === "income"
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/60"
                    : "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/60"
                }
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.kind === "income"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                    }`}
                  >
                    {kindLabel[row.kind]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">
                  {description}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatRupiah(row.amount)}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell capitalize">
                  {row.paymentMethod}
                </td>
                <td className="px-4 py-3 text-right">
                  <ConfirmDialog
                    trigger={
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline"
                      >
                        Hapus
                      </button>
                    }
                    title="Hapus Transaksi"
                    description={
                      row.kind === "expense"
                        ? "Pengeluaran ini akan dihapus secara permanen."
                        : row.kind === "income" && "type" in row && row.type === "egg_sale"
                        ? "Pemasukan ini berasal dari penjualan telur. Menghapus akan menghapus data penjualan terkait."
                        : "Pemasukan ini akan dihapus secara permanen."
                    }
                    confirmLabel="Hapus"
                    onConfirm={() =>
                      row.kind === "expense"
                        ? handleDeleteExpense(row.id)
                        : handleDeleteIncome(row.id)
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
