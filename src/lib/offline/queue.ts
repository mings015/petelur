import { getDb, type QueueItem, type QueueItemType, type QueueItemStatus } from "./db";
export type { QueueItemType } from "./db";

export async function addToQueue(
  type: QueueItemType,
  payload: Record<string, string>
): Promise<void> {
  const db = await getDb();
  const item: QueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    status: "pending",
    createdAt: Date.now(),
    retries: 0,
  };
  await db.put("queue", item);
}

export async function getItemsByStatus(status: QueueItemStatus): Promise<QueueItem[]> {
  const db = await getDb();
  return db.getAllFromIndex("queue", "by-status", status);
}

export async function updateItemStatus(
  id: string,
  status: QueueItemStatus,
  error?: string
): Promise<void> {
  const db = await getDb();
  const item = await db.get("queue", id);
  if (!item) return;
  await db.put("queue", {
    ...item,
    status,
    error,
    retries: status === "failed" ? item.retries + 1 : item.retries,
  });
}

export async function removeItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("queue", id);
}

export async function getQueueStats(): Promise<{ pending: number; failed: number }> {
  const [pending, failed] = await Promise.all([
    getItemsByStatus("pending"),
    getItemsByStatus("failed"),
  ]);
  return { pending: pending.length, failed: failed.length };
}

export async function resetFailedItems(): Promise<void> {
  const db = await getDb();
  const failed = await db.getAllFromIndex("queue", "by-status", "failed");
  await Promise.all(
    failed.map((item) => db.put("queue", { ...item, status: "pending", error: undefined }))
  );
}
