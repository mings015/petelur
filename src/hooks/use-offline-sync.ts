"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getItemsByStatus,
  getQueueStats,
  resetFailedItems,
  updateItemStatus,
} from "@/lib/offline/queue";
import { useNetwork } from "./use-network";

export interface SyncState {
  pendingCount: number;
  failedCount: number;
  isSyncing: boolean;
  isOnline: boolean;
  syncNow: () => void;
  retryFailed: () => void;
}

async function syncItem(id: string, type: string, payload: Record<string, string>) {
  await updateItemStatus(id, "syncing");
  const res = await fetch("/api/offline/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, payload }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Gagal sinkronisasi");
  }
}

export function useOfflineSync(): SyncState {
  const { isOnline } = useNetwork();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const syncingRef = useRef(false);

  const refreshCounts = useCallback(async () => {
    const stats = await getQueueStats();
    setPendingCount(stats.pending);
    setFailedCount(stats.failed);
  }, []);

  const runSync = useCallback(async () => {
    if (syncingRef.current) return;
    const pending = await getItemsByStatus("pending");
    if (pending.length === 0) return;

    syncingRef.current = true;
    setIsSyncing(true);

    for (const item of pending) {
      try {
        await syncItem(item.id, item.type, item.payload);
        // Remove from queue on success instead of marking synced, to keep queue lean
        const { removeItem } = await import("@/lib/offline/queue");
        await removeItem(item.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error";
        await updateItemStatus(item.id, "failed", msg);
      }
    }

    syncingRef.current = false;
    setIsSyncing(false);
    await refreshCounts();
    router.refresh();
  }, [refreshCounts, router]);

  // Initial count load
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      runSync();
    } else {
      refreshCounts();
    }
  }, [isOnline, runSync, refreshCounts]);

  const retryFailed = useCallback(async () => {
    await resetFailedItems();
    await refreshCounts();
    if (isOnline) runSync();
  }, [isOnline, refreshCounts, runSync]);

  return {
    pendingCount,
    failedCount,
    isSyncing,
    isOnline,
    syncNow: runSync,
    retryFailed,
  };
}
