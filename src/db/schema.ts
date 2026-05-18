import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  pgEnum,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["owner", "worker"]);
export const coopStatusEnum = pgEnum("coop_status", [
  "active",
  "inactive",
  "empty",
]);
export const populationTypeEnum = pgEnum("population_type", [
  "addition",
  "reduction",
  "mutation_in",
  "mutation_out",
]);
export const feedTransactionTypeEnum = pgEnum("feed_transaction_type", [
  "purchase",
  "usage",
]);

// ─── Audit helper ─────────────────────────────────────────────────────────────

const auditFields = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by").notNull(),
  updatedBy: uuid("updated_by").notNull(),
};

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("worker"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const coops = pgTable("coops", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  capacity: integer("capacity").notNull(),
  chickenCount: integer("chicken_count").notNull().default(0),
  chickenAgeWeeks: integer("chicken_age_weeks"),
  docEntryDate: date("doc_entry_date"),
  status: coopStatusEnum("status").notNull().default("active"),
  notes: text("notes"),
  ...auditFields,
});

export const coopPopulations = pgTable("coop_populations", {
  id: uuid("id").primaryKey().defaultRandom(),
  coopId: uuid("coop_id")
    .notNull()
    .references(() => coops.id, { onDelete: "cascade" }),
  type: populationTypeEnum("type").notNull(),
  count: integer("count").notNull(),
  date: date("date").notNull(),
  reason: varchar("reason", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by").notNull(),
});

export const eggProductions = pgTable("egg_productions", {
  id: uuid("id").primaryKey().defaultRandom(),
  coopId: uuid("coop_id")
    .notNull()
    .references(() => coops.id, { onDelete: "cascade" }),
  productionDate: date("production_date").notNull(),
  totalEggs: integer("total_eggs").notNull(),
  goodEggs: integer("good_eggs").notNull(),
  crackedEggs: integer("cracked_eggs").notNull().default(0),
  brokenEggs: integer("broken_eggs").notNull().default(0),
  smallEggs: integer("small_eggs").notNull().default(0),
  largeEggs: integer("large_eggs").notNull().default(0),
  weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),
  notes: text("notes"),
  ...auditFields,
});

export const feedStocks = pgTable("feed_stocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull().default("kg"),
  currentStock: numeric("current_stock", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  minimumStock: numeric("minimum_stock", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  ...auditFields,
});

export const feedTransactions = pgTable("feed_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  feedStockId: uuid("feed_stock_id")
    .notNull()
    .references(() => feedStocks.id, { onDelete: "cascade" }),
  type: feedTransactionTypeEnum("type").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  coopId: uuid("coop_id").references(() => coops.id, { onDelete: "set null" }),
  pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by").notNull(),
});

export const healthRecords = pgTable("health_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  coopId: uuid("coop_id")
    .notNull()
    .references(() => coops.id, { onDelete: "cascade" }),
  recordDate: date("record_date").notNull(),
  sickCount: integer("sick_count").notNull().default(0),
  deadCount: integer("dead_count").notNull().default(0),
  treatment: varchar("treatment", { length: 255 }),
  notes: text("notes"),
  ...auditFields,
});

export const vaccinationSchedules = pgTable("vaccination_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  coopId: uuid("coop_id")
    .notNull()
    .references(() => coops.id, { onDelete: "cascade" }),
  vaccineName: varchar("vaccine_name", { length: 100 }).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by").notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const coopsRelations = relations(coops, ({ many }) => ({
  populations: many(coopPopulations),
  eggProductions: many(eggProductions),
  feedTransactions: many(feedTransactions),
  healthRecords: many(healthRecords),
  vaccinationSchedules: many(vaccinationSchedules),
}));

export const coopPopulationsRelations = relations(
  coopPopulations,
  ({ one }) => ({
    coop: one(coops, { fields: [coopPopulations.coopId], references: [coops.id] }),
  }),
);

export const eggProductionsRelations = relations(eggProductions, ({ one }) => ({
  coop: one(coops, { fields: [eggProductions.coopId], references: [coops.id] }),
}));

export const feedStocksRelations = relations(feedStocks, ({ many }) => ({
  transactions: many(feedTransactions),
}));

export const feedTransactionsRelations = relations(
  feedTransactions,
  ({ one }) => ({
    feedStock: one(feedStocks, {
      fields: [feedTransactions.feedStockId],
      references: [feedStocks.id],
    }),
    coop: one(coops, {
      fields: [feedTransactions.coopId],
      references: [coops.id],
    }),
  }),
);

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  coop: one(coops, {
    fields: [healthRecords.coopId],
    references: [coops.id],
  }),
}));

export const vaccinationSchedulesRelations = relations(
  vaccinationSchedules,
  ({ one }) => ({
    coop: one(coops, {
      fields: [vaccinationSchedules.coopId],
      references: [coops.id],
    }),
  }),
);
