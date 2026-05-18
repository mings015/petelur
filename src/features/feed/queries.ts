import { db } from "@/lib/db";
import { feedStocks, feedTransactions, coops } from "@/db/schema";
import { desc, lte, eq, sql, getTableColumns } from "drizzle-orm";
import type { FeedStock } from "@/types";

export async function getFeedStocks(): Promise<FeedStock[]> {
  return db.select().from(feedStocks).orderBy(feedStocks.name);
}

export async function getFeedStockById(id: string): Promise<FeedStock | undefined> {
  const [stock] = await db
    .select()
    .from(feedStocks)
    .where(eq(feedStocks.id, id))
    .limit(1);
  return stock;
}

export type FeedTransactionWithNames = {
  id: string;
  feedStockId: string;
  type: "purchase" | "usage";
  quantity: string;
  coopId: string | null;
  pricePerUnit: string | null;
  supplier: string | null;
  date: string;
  notes: string | null;
  createdAt: Date;
  createdBy: string;
  feedStockName: string | null;
  coopName: string | null;
};

export async function getFeedTransactions(
  limit?: number,
): Promise<FeedTransactionWithNames[]> {
  const query = db
    .select({
      ...getTableColumns(feedTransactions),
      feedStockName: feedStocks.name,
      coopName: coops.name,
    })
    .from(feedTransactions)
    .leftJoin(feedStocks, eq(feedTransactions.feedStockId, feedStocks.id))
    .leftJoin(coops, eq(feedTransactions.coopId, coops.id))
    .orderBy(desc(feedTransactions.date));

  if (limit !== undefined) {
    return query.limit(limit) as Promise<FeedTransactionWithNames[]>;
  }
  return query as unknown as Promise<FeedTransactionWithNames[]>;
}

export async function getFeedTransactionsByStockId(
  stockId: string,
): Promise<FeedTransactionWithNames[]> {
  return db
    .select({
      ...getTableColumns(feedTransactions),
      feedStockName: feedStocks.name,
      coopName: coops.name,
    })
    .from(feedTransactions)
    .leftJoin(feedStocks, eq(feedTransactions.feedStockId, feedStocks.id))
    .leftJoin(coops, eq(feedTransactions.coopId, coops.id))
    .where(eq(feedTransactions.feedStockId, stockId))
    .orderBy(desc(feedTransactions.date)) as unknown as Promise<FeedTransactionWithNames[]>;
}

export async function getLowStockFeeds(): Promise<FeedStock[]> {
  return db
    .select()
    .from(feedStocks)
    .where(lte(feedStocks.currentStock, feedStocks.minimumStock))
    .orderBy(feedStocks.name);
}

export type FeedConsumptionByCoopResult = {
  coopName: string;
  totalUsage: number;
};

export async function getFeedConsumptionByCoopLast30Days(): Promise<
  FeedConsumptionByCoopResult[]
> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

  const rows = await db
    .select({
      coopName: coops.name,
      totalUsage: sql<number>`coalesce(sum(${feedTransactions.quantity}), 0)`,
    })
    .from(feedTransactions)
    .leftJoin(coops, eq(feedTransactions.coopId, coops.id))
    .where(
      sql`${feedTransactions.type} = 'usage' and ${feedTransactions.date} >= ${cutoff} and ${feedTransactions.coopId} is not null`,
    )
    .groupBy(coops.name)
    .orderBy(desc(sql`coalesce(sum(${feedTransactions.quantity}), 0)`));

  return rows.map((row) => ({
    coopName: row.coopName ?? "Tidak diketahui",
    totalUsage: Number(row.totalUsage),
  }));
}
