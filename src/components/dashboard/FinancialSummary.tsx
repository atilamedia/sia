
import { DashboardCard } from "./DashboardCard";
import { getFinancialSummary, formatCurrency } from "@/lib/data";
import { ArrowDownRight, ArrowUpRight, BarChart2, Wallet, RefreshCw } from "lucide-react";

export function FinancialSummary() {
  const summary = getFinancialSummary();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard
        title="Total Kas Masuk"
        value={formatCurrency(summary.totalCashIn)}
        icon={ArrowUpRight}
        change="12% bulan ini"
        trend="up"
        variant="success"
      />
      <DashboardCard
        title="Total Kas Keluar"
        value={formatCurrency(summary.totalCashOut)}
        icon={ArrowDownRight}
        change="8% bulan ini"
        trend="down"
        variant="danger"
      />
      <DashboardCard
        title="Arus Kas Bersih"
        value={formatCurrency(summary.netCashFlow)}
        icon={RefreshCw}
        change="5% bulan ini"
        trend={summary.netCashFlow >= 0 ? "up" : "down"}
        variant={summary.netCashFlow >= 0 ? "primary" : "warning"}
      />
      <DashboardCard
        title="Total Saldo Rekening"
        value={formatCurrency(summary.accountsBalance)}
        icon={Wallet}
        change="Stabil"
        trend="neutral"
        variant="default"
      />
    </div>
  );
}
