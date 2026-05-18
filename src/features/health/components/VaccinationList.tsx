"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markVaccinationComplete } from "../actions";

type VaccinationScheduleRow = {
  id: string;
  vaccineName: string;
  scheduledDate: string;
  completedAt: Date | null;
  coopName: string | null;
  notes: string | null;
};

interface VaccinationListProps {
  schedules: VaccinationScheduleRow[];
}

function VaccinationItem({
  schedule,
}: {
  schedule: VaccinationScheduleRow;
}) {
  const [isPending, startTransition] = useTransition();

  const isCompleted = schedule.completedAt !== null;

  const handleMarkComplete = () => {
    startTransition(async () => {
      await markVaccinationComplete(schedule.id);
    });
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm">{schedule.vaccineName}</span>
          {isCompleted ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
              Selesai
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
              Terjadwal
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {schedule.coopName ?? "-"}
        </p>
        <p className="text-sm text-muted-foreground">
          {new Date(schedule.scheduledDate + "T00:00:00").toLocaleDateString(
            "id-ID",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            },
          )}
        </p>
        {schedule.notes && (
          <p className="text-xs text-muted-foreground">{schedule.notes}</p>
        )}
      </div>

      {!isCompleted && (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 h-9 text-xs"
          onClick={handleMarkComplete}
          disabled={isPending}
        >
          {isPending ? "Memproses..." : "Tandai Selesai"}
        </Button>
      )}
    </div>
  );
}

export function VaccinationList({ schedules }: VaccinationListProps) {
  if (schedules.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Tidak ada jadwal vaksinasi
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <VaccinationItem key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}
