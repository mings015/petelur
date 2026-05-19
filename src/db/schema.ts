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
  boolean,
  index,
  unique,
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
export const paymentMethodEnum = pgEnum("payment_method", ["tunai", "transfer"]);
export const incomeTypeEnum = pgEnum("income_type", ["egg_sale", "manual"]);
export const reportTypeEnum = pgEnum("report_type", [
  "production",
  "feed",
  "health",
  "vaccination",
  "population",
]);
export const reportFormatEnum = pgEnum("report_format", ["xlsx", "pdf"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "completed", "failed"]);
export const reportFrequencyEnum = pgEnum("report_frequency", ["daily", "weekly", "monthly"]);

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
  phone: varchar("phone", { length: 30 }),
  isActive: boolean("is_active").notNull().default(true),
  joinedAt: date("joined_at"),
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
}, (t) => [
  index("idx_coops_status").on(t.status),
]);

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
}, (t) => [
  index("idx_coop_populations_coop_id").on(t.coopId),
  index("idx_coop_populations_date").on(t.date),
]);

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
}, (t) => [
  index("idx_egg_productions_coop_id").on(t.coopId),
  index("idx_egg_productions_date").on(t.productionDate),
]);

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
}, (t) => [
  index("idx_feed_transactions_stock_id").on(t.feedStockId),
  index("idx_feed_transactions_date").on(t.date),
]);

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
}, (t) => [
  index("idx_health_records_coop_id").on(t.coopId),
  index("idx_health_records_date").on(t.recordDate),
]);

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
}, (t) => [
  index("idx_vaccination_coop_id").on(t.coopId),
  index("idx_vaccination_scheduled_date").on(t.scheduledDate),
]);

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  notes: text("notes"),
  ...auditFields,
});

export const eggCategories = pgTable("egg_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  unit: varchar("unit", { length: 20 }).notNull().default("butir"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by").notNull(),
});

export const eggSales = pgTable("egg_sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleDate: date("sale_date").notNull(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  eggCategoryId: uuid("egg_category_id")
    .notNull()
    .references(() => eggCategories.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull().default("butir"),
  pricePerUnit: numeric("price_per_unit", { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  notes: text("notes"),
  ...auditFields,
}, (t) => [
  index("idx_egg_sales_date").on(t.saleDate),
  index("idx_egg_sales_customer_id").on(t.customerId),
  index("idx_egg_sales_category_id").on(t.eggCategoryId),
]);

export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by").notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseDate: date("expense_date").notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => expenseCategories.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("tunai"),
  description: varchar("description", { length: 255 }),
  notes: text("notes"),
  ...auditFields,
}, (t) => [
  index("idx_expenses_date").on(t.expenseDate),
  index("idx_expenses_category_id").on(t.categoryId),
]);

export const incomes = pgTable("incomes", {
  id: uuid("id").primaryKey().defaultRandom(),
  incomeDate: date("income_date").notNull(),
  type: incomeTypeEnum("type").notNull(),
  sourceId: uuid("source_id"),
  description: varchar("description", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("tunai"),
  notes: text("notes"),
  ...auditFields,
}, (t) => [
  index("idx_incomes_date").on(t.incomeDate),
  index("idx_incomes_source_id").on(t.sourceId),
]);

export const taskTemplates = pgTable("task_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...auditFields,
});

export const taskLogs = pgTable("task_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  logDate: date("log_date").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_task_logs_template_id").on(t.templateId),
  index("idx_task_logs_user_date").on(t.userId, t.logDate),
  unique("uq_task_log").on(t.templateId, t.userId, t.logDate),
]);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: reportTypeEnum("type").notNull(),
  format: reportFormatEnum("format").notNull(),
  status: reportStatusEnum("status").notNull().default("pending"),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  coopId: uuid("coop_id").references(() => coops.id, { onDelete: "set null" }),
  storagePath: text("storage_path"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  generatedBy: uuid("generated_by").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_reports_generated_by").on(t.generatedBy),
  index("idx_reports_generated_at").on(t.generatedAt),
  index("idx_reports_type").on(t.type),
]);

export const reportSchedules = pgTable("report_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: reportTypeEnum("type").notNull(),
  frequency: reportFrequencyEnum("frequency").notNull(),
  format: reportFormatEnum("format").notNull().default("xlsx"),
  coopId: uuid("coop_id").references(() => coops.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  lastRun: timestamp("last_run", { withTimezone: true }),
  nextRun: timestamp("next_run", { withTimezone: true }).notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_report_schedules_next_run").on(t.nextRun),
]);

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

export const customersRelations = relations(customers, ({ many }) => ({
  eggSales: many(eggSales),
}));

export const eggCategoriesRelations = relations(eggCategories, ({ many }) => ({
  eggSales: many(eggSales),
}));

export const eggSalesRelations = relations(eggSales, ({ one }) => ({
  customer: one(customers, {
    fields: [eggSales.customerId],
    references: [customers.id],
  }),
  eggCategory: one(eggCategories, {
    fields: [eggSales.eggCategoryId],
    references: [eggCategories.id],
  }),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}));

export const taskTemplatesRelations = relations(taskTemplates, ({ many }) => ({
  logs: many(taskLogs),
}));

export const taskLogsRelations = relations(taskLogs, ({ one }) => ({
  template: one(taskTemplates, {
    fields: [taskLogs.templateId],
    references: [taskTemplates.id],
  }),
}));
