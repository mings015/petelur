"use client";

import { WifiOff, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import type { SyncState } from "@/hooks/use-offline-sync";

interface OfflineBannerProps {
  syncState: SyncState;
}

export function OfflineBanner({ syncState }: OfflineBannerProps) {
  const { isOnline, pendingCount, failedCount, isSyncing, syncNow, retryFailed } = syncState;

  if (isOnline && pendingCount === 0 && failedCount === 0 && !isSyncing) return null;

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-xs font-medium">
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
        <span>
          Mode Offline
          {pendingCount > 0 && ` — ${pendingCount} data menunggu sinkronisasi`}
        </span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200 text-blue-800 text-xs font-medium">
        <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
        <span>Menyinkronkan {pendingCount} data offline...</span>
      </div>
    );
  }

  if (failedCount > 0) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-red-50 border-b border-red-200 text-red-800 text-xs font-medium">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{failedCount} data gagal disinkronisasi</span>
        </div>
        <button onClick={retryFailed} className="flex items-center gap-1 underline underline-offset-2">
          <RefreshCw className="w-3 h-3" />
          Coba lagi
        </button>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200 text-blue-800 text-xs font-medium">
        <span>{pendingCount} data offline menunggu sinkronisasi</span>
        <button onClick={syncNow} className="flex items-center gap-1 underline underline-offset-2">
          <RefreshCw className="w-3 h-3" />
          Sync sekarang
        </button>
      </div>
    );
  }

  return null;
}
