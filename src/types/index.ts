import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  coops,
  coopPopulations,
  eggProductions,
  feedStocks,
  feedTransactions,
  healthRecords,
  vaccinationSchedules,
  customers,
  eggCategories,
  eggSales,
  expenseCategories,
  expenses,
  incomes,
  taskTemplates,
  taskLogs,
  reports,
  reportSchedules,
} from "@/db/schema";

export type UserRole = "owner" | "worker";
export type CoopStatus = "active" | "inactive" | "empty";
export type PopulationType = "addition" | "reduction" | "mutation_in" | "mutation_out";
export type FeedTransactionType = "purchase" | "usage";
export type PaymentMethod = "tunai" | "transfer";
export type IncomeType = "egg_sale" | "manual";

export type User = InferSelectModel<typeof users>;
export type Coop = InferSelectModel<typeof coops>;
export type CoopPopulation = InferSelectModel<typeof coopPopulations>;
export type EggProduction = InferSelectModel<typeof eggProductions>;
export type FeedStock = InferSelectModel<typeof feedStocks>;
export type FeedTransaction = InferSelectModel<typeof feedTransactions>;
export type HealthRecord = InferSelectModel<typeof healthRecords>;
export type VaccinationSchedule = InferSelectModel<typeof vaccinationSchedules>;
export type Customer = InferSelectModel<typeof customers>;
export type EggCategory = InferSelectModel<typeof eggCategories>;
export type EggSale = InferSelectModel<typeof eggSales>;
export type ExpenseCategory = InferSelectModel<typeof expenseCategories>;
export type Expense = InferSelectModel<typeof expenses>;
export type Income = InferSelectModel<typeof incomes>;
export type TaskTemplate = InferSelectModel<typeof taskTemplates>;
export type TaskLog = InferSelectModel<typeof taskLogs>;
export type Report = InferSelectModel<typeof reports>;
export type ReportSchedule = InferSelectModel<typeof reportSchedules>;
export type ReportType = "production" | "feed" | "health" | "vaccination" | "population";
export type ReportFormat = "xlsx" | "pdf";
export type ReportFrequency = "daily" | "weekly" | "monthly";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
