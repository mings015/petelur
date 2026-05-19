"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { toggleSchedule, deleteSchedule } from "../actions";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { ScheduleWithCoop } from "../queries";

const TYPE_LABELS: Record<string, string> = {
  production: "Produksi Telur",
  feed: "Manajemen Pakan",
  health: "Kesehatan Ayam",
  vaccination: "Vaksinasi",
  population: "Populasi Kandang",
};

const FREQ_LABELS: Record<string, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

function formatNextRun(date: Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface ScheduleListProps {
  schedules: ScheduleWithCoop[];
}

export function ScheduleList({ schedules }: ScheduleListProps) {
  const [, startTransition] = useTransition();
  const [toggling, setToggling] = useState<string | null>(null);

  function handleToggle(id: string) {
    setToggling(id);
    startTransition(async () => {
      const result = await toggleSchedule(id);
      setToggling(null);
      if (!result.success) toast.error(result.error);
    });
  }

  async function handleDelete(id: string) {
    const result = await deleteSchedule(id);
    if (!result.success) toast.error(result.error);
    else toast.success("Jadwal dihapus");
  }

  if (schedules.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Belum ada jadwal laporan otomatis.</p>;
  }

  return (
    <div className="divide-y">
      {schedules.map((s) => (
        <div key={s.id} className="py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{TYPE_LABELS[s.type] ?? s.type}</span>
              <Badge variant="outline" className="text-xs">{FREQ_LABELS[s.frequency] ?? s.frequency}</Badge>
              <Badge variant="secondary" className="text-xs">{s.format.toUpperCase()}</Badge>
              {s.coopName && <Badge variant="secondary" className="text-xs">{s.coopName}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Run berikutnya: {formatNextRun(s.nextRun)}
              {s.lastRun && ` · Terakhir: ${formatNextRun(s.lastRun)}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleToggle(s.id)}
              disabled={toggling === s.id}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                s.isActive
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20"
                  : "bg-muted border-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.isActive ? "Aktif" : "Nonaktif"}
            </button>

            <ConfirmDialog
              trigger={
                <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              }
              title="Hapus Jadwal?"
              description={`Jadwal laporan ${TYPE_LABELS[s.type]} ${FREQ_LABELS[s.frequency]} akan dihapus.`}
              confirmLabel="Hapus"
              onConfirm={() => handleDelete(s.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
