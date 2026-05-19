"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReportWithCoop } from "../queries";

const TYPE_LABELS: Record<string, string> = {
  production: "Produksi Telur",
  feed: "Manajemen Pakan",
  health: "Kesehatan Ayam",
  vaccination: "Vaksinasi",
  population: "Populasi Kandang",
};

const FORMAT_LABELS: Record<string, string> = {
  xlsx: "Excel",
  pdf: "PDF",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-emerald-600 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 text-destructive text-xs">
        <XCircle className="w-3.5 h-3.5" /> Gagal
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-xs">
      <Clock className="w-3.5 h-3.5" /> Pending
    </span>
  );
}

interface ReportHistoryListProps {
  reports: ReportWithCoop[];
}

export function ReportHistoryList({ reports }: ReportHistoryListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDownload(id: string) {
    setLoading(id);
    try {
      window.open(`/api/reports/history?id=${id}`, "_blank");
    } catch {
      toast.error("Gagal mengunduh laporan");
    } finally {
      setLoading(null);
    }
  }

  if (reports.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Belum ada laporan terjadwal.</p>;
  }

  return (
    <div className="divide-y">
      {reports.map((r) => (
        <div key={r.id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{TYPE_LABELS[r.type] ?? r.type}</span>
              <Badge variant="outline" className="text-xs">{FORMAT_LABELS[r.format] ?? r.format}</Badge>
              {r.coopName && <Badge variant="secondary" className="text-xs">{r.coopName}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {r.periodStart} s/d {r.periodEnd}
              {r.generatedAt && ` · Dibuat ${new Date(r.generatedAt).toLocaleString("id-ID")}`}
            </p>
            {r.errorMessage && (
              <p className="text-xs text-destructive mt-0.5 truncate max-w-xs">{r.errorMessage}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={r.status} />
            {r.status === "completed" && r.storagePath && (
              <button
                onClick={() => handleDownload(r.id)}
                disabled={loading === r.id}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
