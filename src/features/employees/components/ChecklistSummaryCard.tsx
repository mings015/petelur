import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ChecklistSummaryCardProps {
  total: number;
  done: number;
}

export function ChecklistSummaryCard({ total, done }: ChecklistSummaryCardProps) {
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <Link href="/checklist">
      <Card className={`transition-colors hover:bg-muted/50 ${allDone ? "border-emerald-200 dark:border-emerald-800" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckSquare className={`w-4 h-4 ${allDone ? "text-emerald-600" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium">Checklist Harian</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              allDone
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                : "bg-muted text-muted-foreground"
            }`}>
              {progress}%
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {done}
            <span className="text-sm font-normal text-muted-foreground ml-1">/ {total}</span>
          </p>
          <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
