import { db } from "@/lib/db";
import { expenses, expenseCategories, incomes } from "@/db/schema";
import { desc, eq, gte, lte, and, sql, getTableColumns } from "drizzle-orm";
import type { ExpenseCategory, Income } from "@/types";

export type ExpenseWithCategory = {
  id: string;
  expenseDate: string;
  categoryId: string;
  categoryName: string;
  amount: string;
  paymentMethod: "tunai" | "transfer";
  description: string | null;
  notes: string | null;
  createdAt: Date;
};

export type TransactionRow =
  | (ExpenseWithCategory & { kind: "expense" })
  | (Income & { kind: "income"; categoryName?: string });

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  return db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.isActive, true))
    .orderBy(expenseCategories.sortOrder);
}

export async function getExpenses(limit?: number): Promise<ExpenseWithCategory[]> {
  const query = db
    .select({
      ...getTableColumns(expenses),
      categoryName: expenseCategories.name,
    })
    .from(expenses)
    .innerJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .orderBy(desc(expenses.expenseDate));

  const rows = limit ? await query.limit(limit) : await query;
  return rows as unknown as ExpenseWithCategory[];
}

export async function getIncomes(limit?: number): Promise<Income[]> {
  const query = db.select().from(incomes).orderBy(desc(incomes.incomeDate));
  return limit ? query.limit(limit) : query;
}

export async function getTransactions(limit = 50): Promise<TransactionRow[]> {
  const [expenseRows, incomeRows] = await Promise.all([
    getExpenses(),
    getIncomes(),
  ]);

  const combined: TransactionRow[] = [
    ...expenseRows.map((e) => ({ ...e, kind: "expense" as const })),
    ...incomeRows.map((i) => ({ ...i, kind: "income" as const })),
  ];

  combined.sort((a, b) => {
    const dateA = a.kind === "expense" ? a.expenseDate : a.incomeDate;
    const dateB = b.kind === "expense" ? b.expenseDate : b.incomeDate;
    return dateB.localeCompare(dateA);
  });

  return combined.slice(0, limit);
}

export type FinanceSummary = {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
};

export async function getFinanceSummary(
  fromDate: string,
  toDate: string,
): Promise<FinanceSummary> {
  const [incomeRow, expenseRow] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${incomes.amount}), 0)` })
      .from(incomes)
      .where(and(gte(incomes.incomeDate, fromDate), lte(incomes.incomeDate, toDate))),
    db
      .select({ total: sql<number>`coalesce(sum(${expenses.amount}), 0)` })
      .from(expenses)
      .where(and(gte(expenses.expenseDate, fromDate), lte(expenses.expenseDate, toDate))),
  ]);

  const totalIncome = Number(incomeRow[0]?.total ?? 0);
  const totalExpense = Number(expenseRow[0]?.total ?? 0);
  return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
}

export type CashflowItem = {
  date: string;
  income: number;
  expense: number;
};

export async function getCashflowData(
  fromDate: string,
  toDate: string,
): Promise<CashflowItem[]> {
  const [incomeRows, expenseRows] = await Promise.all([
    db
      .select({
        date: incomes.incomeDate,
        total: sql<number>`sum(${incomes.amount})`,
      })
      .from(incomes)
      .where(and(gte(incomes.incomeDate, fromDate), lte(incomes.incomeDate, toDate)))
      .groupBy(incomes.incomeDate)
      .orderBy(incomes.incomeDate),
    db
      .select({
        date: expenses.expenseDate,
        total: sql<number>`sum(${expenses.amount})`,
      })
      .from(expenses)
      .where(and(gte(expenses.expenseDate, fromDate), lte(expenses.expenseDate, toDate)))
      .groupBy(expenses.expenseDate)
      .orderBy(expenses.expenseDate),
  ]);

  const map = new Map<string, CashflowItem>();

  for (const r of incomeRows) {
    map.set(r.date, { date: r.date, income: Number(r.total), expense: 0 });
  }
  for (const r of expenseRows) {
    const existing = map.get(r.date);
    if (existing) {
      existing.expense = Number(r.total);
    } else {
      map.set(r.date, { date: r.date, income: 0, expense: Number(r.total) });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export type ExpenseByCategoryItem = {
  categoryName: string;
  totalAmount: number;
};

export async function getExpensesByCategory(
  fromDate: string,
  toDate: string,
): Promise<ExpenseByCategoryItem[]> {
  const rows = await db
    .select({
      categoryName: expenseCategories.name,
      totalAmount: sql<number>`sum(${expenses.amount})`,
    })
    .from(expenses)
    .innerJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(and(gte(expenses.expenseDate, fromDate), lte(expenses.expenseDate, toDate)))
    .groupBy(expenseCategories.name)
    .orderBy(desc(sql`sum(${expenses.amount})`));

  return rows.map((r) => ({
    categoryName: r.categoryName,
    totalAmount: Number(r.totalAmount),
  }));
}
