"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { toggleTaskLog, resetDailyTasks } from "../task-actions";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { ChecklistItem } from "../task-queries";

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ChecklistViewProps {
  items: ChecklistItem[];
}

export function ChecklistView({ items: initialItems }: ChecklistViewProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const done = items.filter((i) => i.log !== null).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  function handleToggle(templateId: string) {
    startTransition(async () => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.template.id !== templateId) return item;
          return {
            ...item,
            log: item.log
              ? null
              : {
                  id: "optimistic",
                  templateId,
                  userId: "",
                  logDate: new Date().toISOString().slice(0, 10),
                  completedAt: new Date(),
                  notes: null,
                  createdAt: new Date(),
                },
          };
        }),
      );

      const boundToggle = toggleTaskLog.bind(null, templateId);
      const result = await boundToggle();
      if (!result.success) {
        toast.error(result.error);
        setItems(initialItems);
      }
    });
  }

  async function handleReset() {
    const result = await resetDailyTasks();
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setItems((prev) => prev.map((item) => ({ ...item, log: null })));
    toast.success("Checklist berhasil direset");
  }

  if (total === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Belum ada tugas harian.</p>
        <p className="text-sm mt-1">Minta owner untuk menambahkan tugas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{done}/{total} selesai</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map(({ template, log }) => {
          const isDone = log !== null;
          return (
            <button
              key={template.id}
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(template.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-colors ${
                isDone
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                  : "bg-card border-border hover:bg-muted/50"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-medium text-sm ${isDone ? "line-through text-muted-foreground" : ""}`}>
                  {template.title}
                </p>
                {template.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                )}
                {isDone && log && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Selesai pukul {formatTime(log.completedAt)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Reset button */}
      {done > 0 && (
        <div className="pt-2">
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" className="w-full gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset Checklist Hari Ini
              </Button>
            }
            title="Reset Checklist?"
            description="Semua centang tugas hari ini akan dihapus. Tindakan ini tidak dapat dibatalkan."
            confirmLabel="Ya, Reset"
            onConfirm={handleReset}
          />
        </div>
      )}
    </div>
  );
}
