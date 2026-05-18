import { db } from "@/lib/db";
import { eggCategories, eggSales, customers } from "@/db/schema";
import { desc, eq, gte, lte, and, sql, getTableColumns } from "drizzle-orm";
import type { EggCategory, Customer } from "@/types";

export type SaleWithNames = {
  id: string;
  saleDate: string;
  customerId: string | null;
  customerName: string | null;
  eggCategoryId: string;
  categoryName: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  totalAmount: string;
  notes: string | null;
  createdAt: Date;
};

export async function getEggCategories(): Promise<EggCategory[]> {
  return db
    .select()
    .from(eggCategories)
    .where(eq(eggCategories.isActive, true))
    .orderBy(eggCategories.sortOrder);
}

export async function getCustomers(): Promise<Customer[]> {
  return db.select().from(customers).orderBy(customers.name);
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return customer;
}

export async function getSales(filters?: {
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  eggCategoryId?: string;
}): Promise<SaleWithNames[]> {
  const conditions = [];
  if (filters?.fromDate) conditions.push(gte(eggSales.saleDate, filters.fromDate));
  if (filters?.toDate) conditions.push(lte(eggSales.saleDate, filters.toDate));
  if (filters?.customerId) conditions.push(eq(eggSales.customerId, filters.customerId));
  if (filters?.eggCategoryId) conditions.push(eq(eggSales.eggCategoryId, filters.eggCategoryId));

  return db
    .select({
      ...getTableColumns(eggSales),
      customerName: customers.name,
      categoryName: eggCategories.name,
    })
    .from(eggSales)
    .leftJoin(customers, eq(eggSales.customerId, customers.id))
    .innerJoin(eggCategories, eq(eggSales.eggCategoryId, eggCategories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(eggSales.saleDate)) as unknown as Promise<SaleWithNames[]>;
}

export async function getSaleById(id: string): Promise<SaleWithNames | undefined> {
  const [sale] = await db
    .select({
      ...getTableColumns(eggSales),
      customerName: customers.name,
      categoryName: eggCategories.name,
    })
    .from(eggSales)
    .leftJoin(customers, eq(eggSales.customerId, customers.id))
    .innerJoin(eggCategories, eq(eggSales.eggCategoryId, eggCategories.id))
    .where(eq(eggSales.id, id))
    .limit(1);
  return sale as SaleWithNames | undefined;
}

export type SalesSummary = {
  totalAmount: number;
  count: number;
  avgAmount: number;
};

export async function getSalesSummary(
  period: "today" | "week" | "month",
): Promise<SalesSummary> {
  const today = new Date().toISOString().slice(0, 10);
  let fromDate: string;

  if (period === "today") {
    fromDate = today;
  } else if (period === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    fromDate = d.toISOString().slice(0, 10);
  } else {
    const d = new Date();
    d.setDate(1);
    fromDate = d.toISOString().slice(0, 10);
  }

  const [row] = await db
    .select({
      totalAmount: sql<number>`coalesce(sum(${eggSales.totalAmount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(eggSales)
    .where(gte(eggSales.saleDate, fromDate));

  const total = Number(row?.totalAmount ?? 0);
  const count = Number(row?.count ?? 0);
  return {
    totalAmount: total,
    count,
    avgAmount: count > 0 ? total / count : 0,
  };
}

export type RevenueTrendItem = {
  date: string;
  totalAmount: number;
};

export async function getRevenueTrend(
  fromDate: string,
  toDate: string,
): Promise<RevenueTrendItem[]> {
  const rows = await db
    .select({
      date: eggSales.saleDate,
      totalAmount: sql<number>`sum(${eggSales.totalAmount})`,
    })
    .from(eggSales)
    .where(and(gte(eggSales.saleDate, fromDate), lte(eggSales.saleDate, toDate)))
    .groupBy(eggSales.saleDate)
    .orderBy(eggSales.saleDate);

  return rows.map((r) => ({ date: r.date, totalAmount: Number(r.totalAmount) }));
}

export type SalesByCategoryItem = {
  categoryName: string;
  totalAmount: number;
  totalQuantity: number;
};

export async function getSalesByCategory(
  fromDate: string,
  toDate: string,
): Promise<SalesByCategoryItem[]> {
  const rows = await db
    .select({
      categoryName: eggCategories.name,
      totalAmount: sql<number>`sum(${eggSales.totalAmount})`,
      totalQuantity: sql<number>`sum(${eggSales.quantity})`,
    })
    .from(eggSales)
    .innerJoin(eggCategories, eq(eggSales.eggCategoryId, eggCategories.id))
    .where(and(gte(eggSales.saleDate, fromDate), lte(eggSales.saleDate, toDate)))
    .groupBy(eggCategories.name)
    .orderBy(desc(sql`sum(${eggSales.totalAmount})`));

  return rows.map((r) => ({
    categoryName: r.categoryName,
    totalAmount: Number(r.totalAmount),
    totalQuantity: Number(r.totalQuantity),
  }));
}
