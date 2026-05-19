"use client";

import { toast } from "sonner";
import { addToQueue, type QueueItemType } from "@/lib/offline/queue";

export function useOfflineSubmit(type: QueueItemType) {
  async function submitOrQueue(
    payload: Record<string, string>,
    onlineAction: (fd: FormData) => Promise<{ success: boolean; error?: string }>
  ): Promise<{ queued: boolean; success: boolean; error?: string }> {
    if (!navigator.onLine) {
      await addToQueue(type, payload);
      toast.success("Disimpan offline. Akan disinkronkan otomatis saat online.");
      return { queued: true, success: true };
    }

    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) fd.set(k, v);
    const result = await onlineAction(fd);
    return { queued: false, ...result };
  }

  return { submitOrQueue };
}
