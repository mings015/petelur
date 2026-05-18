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
} from "@/db/schema";

export type UserRole = "owner" | "worker";
export type CoopStatus = "active" | "inactive" | "empty";
export type PopulationType = "addition" | "reduction" | "mutation_in" | "mutation_out";
export type FeedTransactionType = "purchase" | "usage";

export type User = InferSelectModel<typeof users>;
export type Coop = InferSelectModel<typeof coops>;
export type CoopPopulation = InferSelectModel<typeof coopPopulations>;
export type EggProduction = InferSelectModel<typeof eggProductions>;
export type FeedStock = InferSelectModel<typeof feedStocks>;
export type FeedTransaction = InferSelectModel<typeof feedTransactions>;
export type HealthRecord = InferSelectModel<typeof healthRecords>;
export type VaccinationSchedule = InferSelectModel<typeof vaccinationSchedules>;

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
