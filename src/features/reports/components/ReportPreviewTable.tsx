"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { ReportData } from "../generators/data";

const PREVIEW_LIMIT = 200;

function useColumns(data: ReportData): ColumnDef<Record<string, unknown>>[] {
  return useMemo(() => {
    if (data.type === "production") {
      return [
        { accessorKey: "date", header: "Tanggal" },
        { accessorKey: "coopName", header: "Kandang" },
        { accessorKey: "totalEggs", header: "Total" },
        { accessorKey: "goodEggs", header: "Baik" },
        { accessorKey: "crackedEggs", header: "Retak" },
        { accessorKey: "brokenEggs", header: "Rusak" },
        { accessorKey: "weightKg", header: "Berat (kg)" },
      ];
    }
    if (data.type === "feed") {
      return [
        { accessorKey: "date", header: "Tanggal" },
        { accessorKey: "stockName", header: "Pakan" },
        { accessorKey: "type", header: "Tipe" },
        { accessorKey: "quantity", header: "Jumlah" },
        { accessorKey: "coopName", header: "Kandang" },
      ];
    }
    if (data.type === "health") {
      return [
        { accessorKey: "date", header: "Tanggal" },
        { accessorKey: "coopName", header: "Kandang" },
        { accessorKey: "sickCount", header: "Sakit" },
        { accessorKey: "deadCount", header: "Mati" },
        { accessorKey: "treatment", header: "Tindakan" },
      ];
    }
    if (data.type === "vaccination") {
      return [
        { accessorKey: "coopName", header: "Kandang" },
        { accessorKey: "vaccineName", header: "Vaksin" },
        { accessorKey: "scheduledDate", header: "Tgl Jadwal" },
        { accessorKey: "status", header: "Status" },
      ];
    }
    return [
      { accessorKey: "date", header: "Tanggal" },
      { accessorKey: "coopName", header: "Kandang" },
      { accessorKey: "type", header: "Tipe" },
      { accessorKey: "count", header: "Jumlah" },
      { accessorKey: "reason", header: "Alasan" },
    ];
  }, [data.type]);
}

interface ReportPreviewTableProps {
  data: ReportData;
}

export function ReportPreviewTable({ data }: ReportPreviewTableProps) {
  const columns = useColumns(data);
  const rows = data.rows.slice(0, PREVIEW_LIMIT) as Record<string, unknown>[];
  const truncated = data.rows.length > PREVIEW_LIMIT;

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  if (rows.length === 0) {
    return <p className="text-center py-8 text-muted-foreground text-sm">Tidak ada data untuk periode ini.</p>;
  }

  return (
    <div className="space-y-3">
      {truncated && (
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded px-3 py-1.5">
          Preview dibatasi {PREVIEW_LIMIT} baris. Export untuk data lengkap ({data.rows.length} baris).
        </p>
      )}
      <div className="overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr key={row.id} className={i % 2 === 1 ? "bg-muted/20" : ""}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-xs whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext()) as string ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Halaman {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          {" "}({rows.length} baris)
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-muted transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-muted transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
