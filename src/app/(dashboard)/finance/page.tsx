import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { requireRole } from "@/lib/supabase/auth";
import {
  getFinanceSummary,
  getTransactions,
  getCashflowData,
  getExpensesByCategory,
} from "@/features/finance/queries";
import { FinanceTransactionTable } from "@/features/finance/components/FinanceTransactionTable";
import { CashflowChart } from "@/features/finance/components/CashflowChart";
import { ExpenseByCategoryChart } from "@/features/finance/components/ExpenseByCategoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function FinancePage() {
  const user = await requireRole("owner").catch(() => null);
  if (!user) redirect("/");

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [summary, transactions, cashflow, expensesByCategory] = await Promise.all([
    getFinanceSummary(monthStart, today),
    getTransactions(50),
    getCashflowData(thirtyDaysAgo, today),
    getExpensesByCategory(monthStart, today),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Keuangan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ringkasan pemasukan, pengeluaran, dan laba bersih
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/finance/expenses/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <TrendingDown className="size-3.5" />
            <span className="hidden sm:inline">+ Pengeluaran</span>
            <span className="sm:hidden">Keluar</span>
          </Link>
          <Link
            href="/finance/income/new"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
          >
            <TrendingUp className="size-3.5" />
            <span className="hidden sm:inline">+ Pemasukan</span>
            <span className="sm:hidden">Masuk</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pemasukan Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(summary.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 dark:border-rose-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengeluaran Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatRupiah(summary.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Wallet className="size-4" />
              Laba Bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold",
                summary.netProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {formatRupiah(summary.netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Arus Kas (30 hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <CashflowChart data={cashflow} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran per Kategori (bulan ini)</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseByCategoryChart data={expensesByCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceTransactionTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
