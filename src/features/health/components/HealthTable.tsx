"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HealthRecordRow = {
  id: string;
  recordDate: string;
  coopName: string | null;
  sickCount: number;
  deadCount: number;
  treatment: string | null;
  notes: string | null;
};

interface HealthTableProps {
  data: HealthRecordRow[];
}

const columns: ColumnDef<HealthRecordRow>[] = [
  {
    accessorKey: "recordDate",
    header: "Tanggal",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      return (
        <span className="whitespace-nowrap text-sm">
          {new Date(val + "T00:00:00").toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "coopName",
    header: "Kandang",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue<string | null>() ?? "-"}</span>
    ),
  },
  {
    accessorKey: "sickCount",
    header: "Ayam Sakit",
    cell: ({ getValue }) => {
      const count = getValue<number>();
      return (
        <span className="text-sm font-medium">
          {count > 0 ? count : <span className="text-muted-foreground">0</span>}
        </span>
      );
    },
  },
  {
    accessorKey: "deadCount",
    header: "Ayam Mati",
    cell: ({ getValue }) => {
      const count = getValue<number>();
      if (count === 0) {
        return <span className="text-muted-foreground text-sm">0</span>;
      }
      return (
        <Badge variant="destructive" className="text-xs">
          {count}
        </Badge>
      );
    },
  },
  {
    accessorKey: "treatment",
    header: "Penanganan",
    cell: ({ getValue }) => (
      <span className="text-sm">
        {getValue<string | null>() ?? (
          <span className="text-muted-foreground">-</span>
        )}
      </span>
    ),
  },
];

export function HealthTable({ data }: HealthTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = data.length;
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm min-w-[560px]">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 font-medium text-muted-foreground"
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
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Belum ada catatan kesehatan
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
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

      {totalRows > pageSize && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            {start}–{end} dari {totalRows} catatan
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
