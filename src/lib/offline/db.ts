import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type QueueItemType = "production" | "feed_usage" | "health";
export type QueueItemStatus = "pending" | "syncing" | "synced" | "failed";

export interface QueueItem {
  id: string;
  type: QueueItemType;
  payload: Record<string, string>;
  status: QueueItemStatus;
  createdAt: number;
  retries: number;
  error?: string;
}

interface PetelurDB extends DBSchema {
  queue: {
    key: string;
    value: QueueItem;
    indexes: { "by-status": QueueItemStatus };
  };
}

let _db: IDBPDatabase<PetelurDB> | null = null;

export async function getDb(): Promise<IDBPDatabase<PetelurDB>> {
  if (_db) return _db;
  _db = await openDB<PetelurDB>("petelur-offline", 1, {
    upgrade(db) {
      const store = db.createObjectStore("queue", { keyPath: "id" });
      store.createIndex("by-status", "status");
    },
  });
  return _db;
}
