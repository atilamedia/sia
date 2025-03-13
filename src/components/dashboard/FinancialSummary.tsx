
import { DashboardCard } from "./DashboardCard";
import { getFinancialSummary, formatCurrency } from "@/lib/data";
import { ArrowDownLeft, ArrowUpRight, TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

export function FinancialSummary() {
  const summary = getFinancialSummary();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard
        title="Total Kas Masuk"
        value={formatCurrency(summary.totalCashIn)}
        icon={ArrowUpRight}
        change={`+12% dari bulan lalu`}
        trend="up"
        variant="success"
        className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/40 dark:to-emerald-900/30"
      />
      <DashboardCard
        title="Total Kas Keluar"
        value={formatCurrency(summary.totalCashOut)}
        icon={ArrowDownLeft}
        change={`-8% dari bulan lalu`}
        trend="down"
        variant="danger"
        className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-900/30"
      />
      <DashboardCard
        title="Arus Kas Bersih"
        value={formatCurrency(summary.netCashFlow)}
        icon={summary.netCashFlow >= 0 ? TrendingUpIcon : TrendingDownIcon}
        change={`${summary.netCashFlow >= 0 ? '+' : ''}5% dari bulan lalu`}
        trend={summary.netCashFlow >= 0 ? "up" : "down"}
        variant={summary.netCashFlow >= 0 ? "primary" : "warning"}
        className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-900/30"
      />
      <DashboardCard
        title="Total Saldo Rekening"
        value={formatCurrency(summary.accountsBalance)}
        icon={WalletIcon}
        change="Stabil"
        trend="neutral"
        variant="default"
        className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/40 dark:to-purple-900/30"
      />
    </div>
  );
}
