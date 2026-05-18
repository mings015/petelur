/**
 * Seed script untuk development.
 * Jalankan: npm run db:seed
 *
 * Seeder ini membuat:
 * - 2 user (1 owner, 1 worker) via Supabase Admin
 * - 3 kandang dengan riwayat populasi
 * - Data produksi telur 30 hari terakhir
 * - 2 jenis pakan + transaksi pembelian & pemakaian
 * - Catatan kesehatan 30 hari terakhir
 * - Jadwal vaksinasi
 *
 * Requirement: SUPABASE_SERVICE_ROLE_KEY di .env.local
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import {
  users,
  coops,
  coopPopulations,
  eggProductions,
  feedStocks,
  feedTransactions,
  healthRecords,
  vaccinationSchedules,
} from "../src/db/schema";

// ─── DB & Supabase clients ────────────────────────────────────────────────────

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]!;
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0]!;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Seed users ───────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("→ Membuat user Supabase Auth...");

  const OWNER_EMAIL = "owner@petelur.dev";
  const WORKER_EMAIL = "worker@petelur.dev";
  const PASSWORD = "password123";

  const { data: ownerAuth, error: ownerErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: OWNER_EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });

  if (ownerErr && !ownerErr.message.includes("already been registered")) {
    throw new Error(`Gagal buat owner: ${ownerErr.message}`);
  }

  const { data: workerAuth, error: workerErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: WORKER_EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });

  if (workerErr && !workerErr.message.includes("already been registered")) {
    throw new Error(`Gagal buat worker: ${workerErr.message}`);
  }

  // Ambil user yang sudah ada kalau sudah terdaftar
  let ownerId: string;
  let workerId: string;

  if (ownerAuth?.user) {
    ownerId = ownerAuth.user.id;
  } else {
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    ownerId = data.users.find((u) => u.email === OWNER_EMAIL)!.id;
  }

  if (workerAuth?.user) {
    workerId = workerAuth.user.id;
  } else {
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    workerId = data.users.find((u) => u.email === WORKER_EMAIL)!.id;
  }

  await db
    .insert(users)
    .values([
      {
        id: ownerId,
        email: OWNER_EMAIL,
        fullName: "Pak Budi (Owner)",
        role: "owner",
      },
      {
        id: workerId,
        email: WORKER_EMAIL,
        fullName: "Pak Agus (Pekerja)",
        role: "worker",
      },
    ])
    .onConflictDoNothing();

  console.log(`  ✓ Owner : ${OWNER_EMAIL} / ${PASSWORD}`);
  console.log(`  ✓ Worker: ${WORKER_EMAIL} / ${PASSWORD}`);

  return { ownerId, workerId };
}

// ─── Seed coops ───────────────────────────────────────────────────────────────

async function seedCoops(ownerId: string) {
  console.log("→ Membuat kandang...");

  const inserted = await db
    .insert(coops)
    .values([
      {
        name: "Kandang A1",
        capacity: 500,
        chickenCount: 462,
        chickenAgeWeeks: 28,
        docEntryDate: daysAgo(196),
        status: "active",
        notes: "Kandang produksi utama",
        createdBy: ownerId,
        updatedBy: ownerId,
      },
      {
        name: "Kandang B1",
        capacity: 300,
        chickenCount: 287,
        chickenAgeWeeks: 18,
        docEntryDate: daysAgo(126),
        status: "active",
        notes: "Kandang produksi kedua",
        createdBy: ownerId,
        updatedBy: ownerId,
      },
      {
        name: "Kandang C1",
        capacity: 400,
        chickenCount: 0,
        status: "empty",
        notes: "Kandang sedang kosong, persiapan DOC baru",
        createdBy: ownerId,
        updatedBy: ownerId,
      },
    ])
    .returning({ id: coops.id, name: coops.name, chickenCount: coops.chickenCount });

  for (const coop of inserted) {
    console.log(`  ✓ ${coop.name} (${coop.chickenCount} ekor)`);
  }

  return inserted;
}

// ─── Seed coop populations ────────────────────────────────────────────────────

async function seedPopulations(
  coopList: Array<{ id: string; name: string; chickenCount: number }>,
  ownerId: string,
) {
  console.log("→ Membuat riwayat populasi...");

  const [coopA, coopB] = coopList as [typeof coopList[0], typeof coopList[0]];

  await db.insert(coopPopulations).values([
    // Kandang A1
    {
      coopId: coopA!.id,
      type: "addition",
      count: 500,
      date: daysAgo(196),
      reason: "DOC masuk pertama kali",
      createdBy: ownerId,
    },
    {
      coopId: coopA!.id,
      type: "reduction",
      count: 38,
      date: daysAgo(60),
      reason: "Afkir ayam sakit",
      createdBy: ownerId,
    },
    // Kandang B1
    {
      coopId: coopB!.id,
      type: "addition",
      count: 300,
      date: daysAgo(126),
      reason: "DOC masuk pertama kali",
      createdBy: ownerId,
    },
    {
      coopId: coopB!.id,
      type: "reduction",
      count: 13,
      date: daysAgo(20),
      reason: "Mortalitas natural",
      createdBy: ownerId,
    },
  ]);

  console.log("  ✓ Riwayat populasi dibuat");
}

// ─── Seed egg productions ─────────────────────────────────────────────────────

async function seedEggProductions(
  coopList: Array<{ id: string; name: string; chickenCount: number }>,
  ownerId: string,
) {
  console.log("→ Membuat data produksi telur (30 hari)...");

  const [coopA, coopB] = coopList as [typeof coopList[0], typeof coopList[0]];
  const rows = [];

  for (let i = 30; i >= 1; i--) {
    const dateStr = daysAgo(i);

    // Kandang A1 — HDP ~80-88%, 462 ayam
    const hdpA = 0.80 + Math.random() * 0.08;
    const totalA = Math.round(462 * hdpA);
    const crackedA = rand(2, 8);
    const brokenA = rand(1, 4);
    const smallA = rand(5, 15);
    const largeA = rand(10, 30);
    const goodA = totalA - crackedA - brokenA;

    rows.push({
      coopId: coopA!.id,
      productionDate: dateStr,
      totalEggs: totalA,
      goodEggs: Math.max(goodA, 0),
      crackedEggs: crackedA,
      brokenEggs: brokenA,
      smallEggs: smallA,
      largeEggs: largeA,
      weightKg: String((totalA * 0.065).toFixed(2)),
      createdBy: ownerId,
      updatedBy: ownerId,
    });

    // Kandang B1 — HDP ~75-85%, 287 ayam
    const hdpB = 0.75 + Math.random() * 0.10;
    const totalB = Math.round(287 * hdpB);
    const crackedB = rand(1, 5);
    const brokenB = rand(0, 3);
    const smallB = rand(3, 10);
    const largeB = rand(5, 20);
    const goodB = totalB - crackedB - brokenB;

    rows.push({
      coopId: coopB!.id,
      productionDate: dateStr,
      totalEggs: totalB,
      goodEggs: Math.max(goodB, 0),
      crackedEggs: crackedB,
      brokenEggs: brokenB,
      smallEggs: smallB,
      largeEggs: largeB,
      weightKg: String((totalB * 0.065).toFixed(2)),
      createdBy: ownerId,
      updatedBy: ownerId,
    });
  }

  await db.insert(eggProductions).values(rows);
  console.log(`  ✓ ${rows.length} record produksi dibuat (2 kandang × 30 hari)`);
}

// ─── Seed feed stocks & transactions ─────────────────────────────────────────

async function seedFeed(
  coopList: Array<{ id: string; name: string; chickenCount: number }>,
  ownerId: string,
) {
  console.log("→ Membuat stok & transaksi pakan...");

  const [coopA, coopB] = coopList as [typeof coopList[0], typeof coopList[0]];

  const insertedStocks = await db
    .insert(feedStocks)
    .values([
      {
        name: "Pakan Layer Produksi",
        unit: "kg",
        currentStock: "380.00",
        minimumStock: "100.00",
        pricePerUnit: "7500.00",
        supplier: "CV Mitra Ternak",
        createdBy: ownerId,
        updatedBy: ownerId,
      },
      {
        name: "Konsentrat Protein",
        unit: "kg",
        currentStock: "45.00",
        minimumStock: "50.00",
        pricePerUnit: "12000.00",
        supplier: "PT Agro Nutrisi",
        createdBy: ownerId,
        updatedBy: ownerId,
      },
    ])
    .returning({ id: feedStocks.id, name: feedStocks.name });

  const [stockLayer, stockKonsentrat] = insertedStocks as [
    typeof insertedStocks[0],
    typeof insertedStocks[0],
  ];

  // Transaksi pembelian (awal bulan + pertengahan bulan)
  const purchases = [
    {
      feedStockId: stockLayer!.id,
      type: "purchase" as const,
      quantity: "500.00",
      pricePerUnit: "7500.00",
      supplier: "CV Mitra Ternak",
      date: daysAgo(28),
      notes: "Pembelian bulanan",
      createdBy: ownerId,
    },
    {
      feedStockId: stockKonsentrat!.id,
      type: "purchase" as const,
      quantity: "100.00",
      pricePerUnit: "12000.00",
      supplier: "PT Agro Nutrisi",
      date: daysAgo(28),
      notes: "Pembelian bulanan",
      createdBy: ownerId,
    },
    {
      feedStockId: stockLayer!.id,
      type: "purchase" as const,
      quantity: "300.00",
      pricePerUnit: "7500.00",
      supplier: "CV Mitra Ternak",
      date: daysAgo(14),
      notes: "Pembelian pertengahan bulan",
      createdBy: ownerId,
    },
  ];

  // Pemakaian harian setiap 3 hari selama 30 hari
  const usages = [];
  for (let i = 30; i >= 1; i -= 3) {
    usages.push(
      {
        feedStockId: stockLayer!.id,
        type: "usage" as const,
        quantity: String(rand(25, 35) + ".00"),
        coopId: coopA!.id,
        date: daysAgo(i),
        notes: null,
        createdBy: ownerId,
      },
      {
        feedStockId: stockLayer!.id,
        type: "usage" as const,
        quantity: String(rand(15, 22) + ".00"),
        coopId: coopB!.id,
        date: daysAgo(i),
        notes: null,
        createdBy: ownerId,
      },
      {
        feedStockId: stockKonsentrat!.id,
        type: "usage" as const,
        quantity: String(rand(3, 5) + ".00"),
        coopId: coopA!.id,
        date: daysAgo(i),
        notes: null,
        createdBy: ownerId,
      },
    );
  }

  await db.insert(feedTransactions).values([...purchases, ...usages]);

  console.log(`  ✓ Pakan Layer Produksi (stok: 380 kg)`);
  console.log(`  ✓ Konsentrat Protein   (stok: 45 kg — di bawah minimum!)`);
  console.log(`  ✓ ${purchases.length} transaksi pembelian + ${usages.length} pemakaian dibuat`);
}

// ─── Seed health records ──────────────────────────────────────────────────────

async function seedHealthRecords(
  coopList: Array<{ id: string; name: string; chickenCount: number }>,
  ownerId: string,
) {
  console.log("→ Membuat catatan kesehatan...");

  const [coopA, coopB] = coopList as [typeof coopList[0], typeof coopList[0]];
  const rows = [];

  // 1 catatan per minggu selama 4 minggu terakhir
  for (let week = 4; week >= 1; week--) {
    const dayOffset = week * 7;

    rows.push(
      {
        coopId: coopA!.id,
        recordDate: daysAgo(dayOffset),
        sickCount: rand(0, 5),
        deadCount: week === 3 ? 2 : 0,
        treatment: week === 3 ? "Antibiotik Colistin" : undefined,
        notes: week === 3 ? "Ada ayam lemas, diberikan antibiotik" : undefined,
        createdBy: ownerId,
        updatedBy: ownerId,
      },
      {
        coopId: coopB!.id,
        recordDate: daysAgo(dayOffset),
        sickCount: rand(0, 3),
        deadCount: 0,
        treatment: rand(0, 1) === 1 ? "Vitamin B-Complex" : undefined,
        createdBy: ownerId,
        updatedBy: ownerId,
      },
    );
  }

  // Catatan hari ini
  rows.push({
    coopId: coopA!.id,
    recordDate: daysAgo(0),
    sickCount: rand(0, 2),
    deadCount: 0,
    createdBy: ownerId,
    updatedBy: ownerId,
  });

  await db.insert(healthRecords).values(rows);
  console.log(`  ✓ ${rows.length} catatan kesehatan dibuat`);
}

// ─── Seed vaccination schedules ───────────────────────────────────────────────

async function seedVaccinations(
  coopList: Array<{ id: string; name: string; chickenCount: number }>,
  ownerId: string,
) {
  console.log("→ Membuat jadwal vaksinasi...");

  const [coopA, coopB] = coopList as [typeof coopList[0], typeof coopList[0]];

  await db.insert(vaccinationSchedules).values([
    // Sudah selesai
    {
      coopId: coopA!.id,
      vaccineName: "ND (Newcastle Disease) - Ke-4",
      scheduledDate: daysAgo(14),
      completedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      notes: "Vaksin rutin 4 mingguan",
      createdBy: ownerId,
    },
    {
      coopId: coopB!.id,
      vaccineName: "IB (Infectious Bronchitis) - Ke-2",
      scheduledDate: daysAgo(7),
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      notes: "Selesai tepat waktu",
      createdBy: ownerId,
    },
    // Mendatang
    {
      coopId: coopA!.id,
      vaccineName: "ND (Newcastle Disease) - Ke-5",
      scheduledDate: daysFromNow(14),
      notes: "Vaksin rutin 4 mingguan",
      createdBy: ownerId,
    },
    {
      coopId: coopB!.id,
      vaccineName: "AI (Avian Influenza) - Booster",
      scheduledDate: daysFromNow(7),
      notes: "Booster 6 bulanan",
      createdBy: ownerId,
    },
    {
      coopId: coopA!.id,
      vaccineName: "Gumboro - Ke-3",
      scheduledDate: daysFromNow(21),
      createdBy: ownerId,
    },
  ]);

  console.log("  ✓ 2 vaksinasi selesai + 3 jadwal mendatang dibuat");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Mulai seeding database Petelur...\n");

  try {
    const { ownerId } = await seedUsers();
    const coopList = await seedCoops(ownerId);
    await seedPopulations(coopList, ownerId);
    await seedEggProductions(coopList, ownerId);
    await seedFeed(coopList, ownerId);
    await seedHealthRecords(coopList, ownerId);
    await seedVaccinations(coopList, ownerId);

    console.log("\n✅ Seeding selesai!\n");
    console.log("─────────────────────────────────────");
    console.log("Login credentials:");
    console.log("  Owner  → owner@petelur.dev  / password123");
    console.log("  Worker → worker@petelur.dev / password123");
    console.log("─────────────────────────────────────\n");
  } catch (err) {
    console.error("\n❌ Seeding gagal:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
