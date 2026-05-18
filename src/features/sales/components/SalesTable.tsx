"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import type { SaleWithNames } from "../queries";

interface SalesTableProps {
  sales: SaleWithNames[];
}

export function SalesTable({ sales }: SalesTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = Array.from(new Set(sales.map((s) => s.categoryName)));

  const filtered = sales.filter((s) => {
    const matchSearch =
      !search ||
      (s.customerName ?? "Tanpa pelanggan").toLowerCase().includes(search.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || s.categoryName === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Cari pelanggan atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {sales.length === 0 ? "Belum ada data penjualan." : "Tidak ada hasil yang sesuai."}
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Pelanggan</th>
                <th className="text-left px-4 py-3 font-medium">Kategori</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Jumlah</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(sale.saleDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {sale.customerName ?? "—"}
                  </td>
                  <td className="px-4 py-3">{sale.categoryName}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    {parseFloat(sale.quantity).toLocaleString("id-ID")} {sale.unit}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatRupiah(sale.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/sales/${sale.id}`}
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
        {filtered.length} dari {sales.length} transaksi
      </p>
    </div>
  );
}
