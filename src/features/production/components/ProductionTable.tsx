"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface ProductionRow {
  id: string;
  productionDate: string;
  coopName: string | null;
  totalEggs: number;
  goodEggs: number;
  crackedEggs: number;
  brokenEggs: number;
}

interface ProductionTableProps {
  data: ProductionRow[];
}

const columnHelper = createColumnHelper<ProductionRow>();

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function ProductionTable({ data }: ProductionTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("productionDate", {
        header: "Tanggal",
        cell: (info) => (
          <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("coopName", {
        id: "coopName",
        header: "Kandang",
        cell: (info) => (
          <Badge variant="outline" className="whitespace-nowrap font-normal">
            {info.getValue() ?? "-"}
          </Badge>
        ),
        filterFn: (row, _columnId, filterValue: string) => {
          const name = row.original.coopName ?? "";
          return name.toLowerCase().includes(filterValue.toLowerCase());
        },
      }),
      columnHelper.accessor("totalEggs", {
        header: "Total Telur",
        cell: (info) => (
          <span className="font-semibold tabular-nums">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("goodEggs", {
        header: "Telur Bagus",
        cell: (info) => (
          <span className="tabular-nums">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("crackedEggs", {
        header: "Retak",
        cell: (info) => (
          <span className="tabular-nums">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("brokenEggs", {
        header: "Rusak",
        cell: (info) => (
          <span className="tabular-nums">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const filterValue =
    (table.getColumn("coopName")?.getFilterValue() as string) ?? "";

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cari kandang..."
          value={filterValue}
          onChange={(e) =>
            table.getColumn("coopName")?.setFilterValue(e.target.value)
          }
          className="pl-8 h-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b bg-muted/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Tidak ada data produksi
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} data
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Halaman sebelumnya</span>
          </Button>
          <span className="text-xs text-muted-foreground px-1">
            {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Halaman berikutnya</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
