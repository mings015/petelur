import { db } from "@/lib/db";
import {
  coops,
  eggProductions,
  feedStocks,
  feedTransactions,
  healthRecords,
  vaccinationSchedules,
  coopPopulations,
} from "@/db/schema";
import { eq, and, gte, lte, getTableColumns } from "drizzle-orm";
import type { ReportType, ReportFrequency } from "@/types";

export type ReportFilters = {
  type: ReportType;
  from: string;
  to: string;
  coopId?: string;
};

// ─── Row types per report ─────────────────────────────────────────────────────

export type ProductionRow = {
  date: string;
  coopName: string;
  totalEggs: number;
  goodEggs: number;
  crackedEggs: number;
  brokenEggs: number;
  smallEggs: number;
  largeEggs: number;
  weightKg: string | null;
};

export type FeedRow = {
  date: string;
  stockName: string;
  type: string;
  quantity: string;
  coopName: string | null;
  pricePerUnit: string | null;
  supplier: string | null;
  notes: string | null;
};

export type HealthRow = {
  date: string;
  coopName: string;
  sickCount: number;
  deadCount: number;
  treatment: string | null;
  notes: string | null;
};

export type VaccinationRow = {
  coopName: string;
  vaccineName: string;
  scheduledDate: string;
  completedAt: Date | null;
  status: "selesai" | "belum";
  notes: string | null;
};

export type PopulationRow = {
  date: string;
  coopName: string;
  type: string;
  count: number;
  reason: string | null;
  notes: string | null;
};

export type ReportData =
  | { type: "production"; rows: ProductionRow[]; summary: { totalEggs: number; goodEggs: number } }
  | { type: "feed"; rows: FeedRow[]; summary: { totalPurchase: number; totalUsage: number } }
  | { type: "health"; rows: HealthRow[]; summary: { totalSick: number; totalDead: number } }
  | { type: "vaccination"; rows: VaccinationRow[]; summary: { total: number; done: number } }
  | { type: "population"; rows: PopulationRow[]; summary: { totalIn: number; totalOut: number } };

// ─── Builders ─────────────────────────────────────────────────────────────────

function coopCondition(coopIdField: ReturnType<typeof eq>, coopId?: string) {
  return coopId ? coopIdField : undefined;
}

export async function fetchReportData(filters: ReportFilters): Promise<ReportData> {
  const { type, from, to, coopId } = filters;

  if (type === "production") return fetchProduction(from, to, coopId);
  if (type === "feed") return fetchFeed(from, to, coopId);
  if (type === "health") return fetchHealth(from, to, coopId);
  if (type === "vaccination") return fetchVaccination(from, to, coopId);
  return fetchPopulation(from, to, coopId);
}

async function fetchProduction(from: string, to: string, coopId?: string) {
  const rows = await db
    .select({
      ...getTableColumns(eggProductions),
      coopName: coops.name,
    })
    .from(eggProductions)
    .innerJoin(coops, eq(eggProductions.coopId, coops.id))
    .where(
      and(
        gte(eggProductions.productionDate, from),
        lte(eggProductions.productionDate, to),
        coopId ? eq(eggProductions.coopId, coopId) : undefined,
      ),
    )
    .orderBy(eggProductions.productionDate, coops.name)
    .limit(10000);

  const mapped: ProductionRow[] = rows.map((r) => ({
    date: r.productionDate,
    coopName: r.coopName,
    totalEggs: r.totalEggs,
    goodEggs: r.goodEggs,
    crackedEggs: r.crackedEggs,
    brokenEggs: r.brokenEggs,
    smallEggs: r.smallEggs,
    largeEggs: r.largeEggs,
    weightKg: r.weightKg,
  }));

  return {
    type: "production" as const,
    rows: mapped,
    summary: {
      totalEggs: mapped.reduce((s, r) => s + r.totalEggs, 0),
      goodEggs: mapped.reduce((s, r) => s + r.goodEggs, 0),
    },
  };
}

async function fetchFeed(from: string, to: string, coopId?: string) {
  const rows = await db
    .select({
      ...getTableColumns(feedTransactions),
      stockName: feedStocks.name,
      coopName: coops.name,
    })
    .from(feedTransactions)
    .innerJoin(feedStocks, eq(feedTransactions.feedStockId, feedStocks.id))
    .leftJoin(coops, eq(feedTransactions.coopId, coops.id))
    .where(
      and(
        gte(feedTransactions.date, from),
        lte(feedTransactions.date, to),
        coopId ? eq(feedTransactions.coopId, coopId) : undefined,
      ),
    )
    .orderBy(feedTransactions.date)
    .limit(10000);

  const mapped: FeedRow[] = rows.map((r) => ({
    date: r.date,
    stockName: r.stockName,
    type: r.type === "purchase" ? "Pembelian" : "Pemakaian",
    quantity: r.quantity,
    coopName: r.coopName ?? null,
    pricePerUnit: r.pricePerUnit,
    supplier: r.supplier,
    notes: r.notes,
  }));

  const totalPurchase = rows
    .filter((r) => r.type === "purchase")
    .reduce((s, r) => s + parseFloat(r.quantity), 0);
  const totalUsage = rows
    .filter((r) => r.type === "usage")
    .reduce((s, r) => s + parseFloat(r.quantity), 0);

  return {
    type: "feed" as const,
    rows: mapped,
    summary: { totalPurchase, totalUsage },
  };
}

async function fetchHealth(from: string, to: string, coopId?: string) {
  const rows = await db
    .select({
      ...getTableColumns(healthRecords),
      coopName: coops.name,
    })
    .from(healthRecords)
    .innerJoin(coops, eq(healthRecords.coopId, coops.id))
    .where(
      and(
        gte(healthRecords.recordDate, from),
        lte(healthRecords.recordDate, to),
        coopId ? eq(healthRecords.coopId, coopId) : undefined,
      ),
    )
    .orderBy(healthRecords.recordDate)
    .limit(10000);

  const mapped: HealthRow[] = rows.map((r) => ({
    date: r.recordDate,
    coopName: r.coopName,
    sickCount: r.sickCount,
    deadCount: r.deadCount,
    treatment: r.treatment ?? null,
    notes: r.notes ?? null,
  }));

  return {
    type: "health" as const,
    rows: mapped,
    summary: {
      totalSick: mapped.reduce((s, r) => s + r.sickCount, 0),
      totalDead: mapped.reduce((s, r) => s + r.deadCount, 0),
    },
  };
}

async function fetchVaccination(from: string, to: string, coopId?: string) {
  const rows = await db
    .select({
      ...getTableColumns(vaccinationSchedules),
      coopName: coops.name,
    })
    .from(vaccinationSchedules)
    .innerJoin(coops, eq(vaccinationSchedules.coopId, coops.id))
    .where(
      and(
        gte(vaccinationSchedules.scheduledDate, from),
        lte(vaccinationSchedules.scheduledDate, to),
        coopId ? eq(vaccinationSchedules.coopId, coopId) : undefined,
      ),
    )
    .orderBy(vaccinationSchedules.scheduledDate)
    .limit(10000);

  const mapped: VaccinationRow[] = rows.map((r) => ({
    coopName: r.coopName,
    vaccineName: r.vaccineName,
    scheduledDate: r.scheduledDate,
    completedAt: r.completedAt,
    status: r.completedAt ? "selesai" : "belum",
    notes: r.notes ?? null,
  }));

  return {
    type: "vaccination" as const,
    rows: mapped,
    summary: {
      total: mapped.length,
      done: mapped.filter((r) => r.status === "selesai").length,
    },
  };
}

async function fetchPopulation(from: string, to: string, coopId?: string) {
  const rows = await db
    .select({
      ...getTableColumns(coopPopulations),
      coopName: coops.name,
    })
    .from(coopPopulations)
    .innerJoin(coops, eq(coopPopulations.coopId, coops.id))
    .where(
      and(
        gte(coopPopulations.date, from),
        lte(coopPopulations.date, to),
        coopId ? eq(coopPopulations.coopId, coopId) : undefined,
      ),
    )
    .orderBy(coopPopulations.date)
    .limit(10000);

  const typeLabel: Record<string, string> = {
    addition: "Masuk",
    reduction: "Keluar",
    mutation_in: "Mutasi Masuk",
    mutation_out: "Mutasi Keluar",
  };

  const mapped: PopulationRow[] = rows.map((r) => ({
    date: r.date,
    coopName: r.coopName,
    type: typeLabel[r.type] ?? r.type,
    count: r.count,
    reason: r.reason ?? null,
    notes: r.notes ?? null,
  }));

  const totalIn = rows
    .filter((r) => r.type === "addition" || r.type === "mutation_in")
    .reduce((s, r) => s + r.count, 0);
  const totalOut = rows
    .filter((r) => r.type === "reduction" || r.type === "mutation_out")
    .reduce((s, r) => s + r.count, 0);

  return {
    type: "population" as const,
    rows: mapped,
    summary: { totalIn, totalOut },
  };
}

// ─── Scheduled report helpers ─────────────────────────────────────────────────

export function computeNextRun(frequency: ReportFrequency, from: Date = new Date()): Date {
  const d = new Date(from);
  if (frequency === "daily") {
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(23, 0, 0, 0); // 06:00 WIB = 23:00 UTC
    return d;
  }
  if (frequency === "weekly") {
    // next Monday
    const daysUntilMonday = (8 - d.getUTCDay()) % 7 || 7;
    d.setUTCDate(d.getUTCDate() + daysUntilMonday);
    d.setUTCHours(23, 0, 0, 0);
    return d;
  }
  // monthly: 1st of next month
  d.setUTCMonth(d.getUTCMonth() + 1, 1);
  d.setUTCHours(23, 0, 0, 0);
  return d;
}

export function getPeriodRange(frequency: ReportFrequency): { from: string; to: string } {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  if (frequency === "daily") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.toISOString().slice(0, 10);
    return { from: y, to: y };
  }
  if (frequency === "weekly") {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return { from: weekAgo.toISOString().slice(0, 10), to: todayStr };
  }
  // monthly: last complete month
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  return {
    from: firstOfMonth.toISOString().slice(0, 10),
    to: lastOfMonth.toISOString().slice(0, 10),
  };
}
